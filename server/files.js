import crypto from 'node:crypto';
import { Binary } from 'mongodb';
import { getDb, oid, ObjectId } from './db.js';
import { bad, notFound, HttpError } from './http.js';
import { cloudOn, signUpload, privateFile, privateDownloadUrl, destroyPrivate } from './cloud.js';

/*
 * Files sent with the website forms (CVs, drawings, site photos).
 * With Cloudinary configured (server/cloud.js), the browser uploads each file
 * straight to Cloudinary as a private file, and this server only signs the upload,
 * checks the result and hands admins a short-lived download link.
 * Without Cloudinary, browsers upload in 2 MB chunks to MongoDB (`file_chunks`).
 * Either way the file record lives in `files`.
 */
export const CHUNK = 2 * 1024 * 1024;
export const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED = {
  cv: ['pdf', 'doc', 'docx'],
  quote: ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls', 'docx', 'doc', 'dwg', 'zip'],
};
const TYPES = {
  pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dwg: 'application/acad', zip: 'application/zip',
};

const cleanName = (n) => String(n || 'file').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').slice(-120) || 'file';

export async function startUpload({ name, size, purpose }) {
  const kind = purpose === 'cv' ? 'cv' : 'quote';
  const fileName = cleanName(name);
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (!ALLOWED[kind].includes(ext)) throw bad(`This file type is not accepted (${ALLOWED[kind].join(', ')}).`, 'file_type');
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) throw bad('The file is empty.');
  if (n > MAX_FILE) throw bad('Files must be 10 MB or smaller.', 'file_size');
  const db = await getDb();
  // Remove uploads that were never attached to a form (older than a day).
  const old = await db.collection('files').find({ attached: { $ne: true }, createdAt: { $lt: new Date(Date.now() - 864e5) } }, { projection: { _id: 1 } }).limit(50).toArray();
  if (old.length) await deleteFiles(old.map((f) => f._id));
  const doc = { name: fileName, ext, type: TYPES[ext] || 'application/octet-stream', size: n, purpose: kind, received: 0, chunks: 0, complete: false, attached: false, token: crypto.randomBytes(16).toString('hex'), createdAt: new Date() };
  const _id = new ObjectId();
  if (cloudOn()) {
    // Private raw file: <folder>/<file id>/<clean name>.<ext>; the name becomes the download name.
    const base = fileName.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'file';
    doc.storage = 'cloudinary';
    doc.publicIdShort = `${String(_id)}/${base}.${ext}`;
    const folder = kind === 'cv' ? 'cvs' : 'quotes';
    const upload = signUpload({ kind: 'file', folder, publicId: doc.publicIdShort });
    doc.publicId = upload.fields.public_id;
    await db.collection('files').insertOne({ _id, ...doc });
    return { id: String(_id), token: doc.token, mode: 'cloudinary', upload };
  }
  doc.storage = 'db';
  await db.collection('files').insertOne({ _id, ...doc });
  return { id: String(_id), token: doc.token, mode: 'db', chunkSize: CHUNK };
}

/** Cloudinary: the browser has finished uploading; check the file and mark it complete. */
export async function completeUpload(id, { token }) {
  const db = await getDb();
  const f = await db.collection('files').findOne({ _id: oid(id) });
  if (!f || f.token !== token || f.attached || f.storage !== 'cloudinary') throw notFound('Upload not found');
  if (f.complete) return { complete: true };
  const r = await privateFile(f.publicId);
  if (!r) throw bad('The file did not reach storage. Please attach it again.', 'file_incomplete');
  if (!r.bytes || r.bytes > MAX_FILE) {
    await destroyPrivate(f.publicId);
    throw bad('Files must be 10 MB or smaller.', 'file_size');
  }
  await db.collection('files').updateOne({ _id: f._id }, { $set: { complete: true, size: r.bytes, received: r.bytes } });
  return { complete: true };
}

export async function addChunk(id, { token, n, data }) {
  const db = await getDb();
  const f = await db.collection('files').findOne({ _id: oid(id) });
  if (!f || f.token !== token || f.attached || f.storage === 'cloudinary') throw notFound('Upload not found');
  if (f.complete) return { complete: true };
  if (Number(n) !== f.chunks) throw bad('Chunk out of order.');
  const buf = Buffer.from(String(data || ''), 'base64');
  if (!buf.length || buf.length > CHUNK) throw bad('Bad chunk.');
  if (f.received + buf.length > f.size) throw bad('The file is larger than announced.');
  await db.collection('file_chunks').insertOne({ fileId: f._id, n: f.chunks, data: new Binary(buf) });
  const received = f.received + buf.length;
  await db.collection('files').updateOne({ _id: f._id, chunks: f.chunks }, { $set: { received, complete: received === f.size }, $inc: { chunks: 1 } });
  return { complete: received === f.size };
}

/** Check uploads sent with a form and mark them as belonging to it. */
export async function attachFiles(list, purpose, owner) {
  const items = (Array.isArray(list) ? list : []).slice(0, 5);
  if (!items.length) return [];
  const db = await getDb();
  const ids = [];
  for (const it of items) {
    const f = await db.collection('files').findOne({ _id: oid(it?.id) });
    if (!f || f.token !== it.token || !f.complete || f.attached || f.purpose !== purpose) throw new HttpError(400, 'A file did not finish uploading. Please attach it again.', 'file_incomplete');
    ids.push(f._id);
  }
  await db.collection('files').updateMany({ _id: { $in: ids } }, { $set: { attached: true, owner }, $unset: { token: '' } });
  return ids;
}

export async function fileInfo(ids) {
  if (!ids?.length) return [];
  const db = await getDb();
  const list = await db.collection('files').find({ _id: { $in: ids } }, { projection: { name: 1, size: 1, type: 1 } }).toArray();
  return list.map((f) => ({ id: String(f._id), name: f.name, size: f.size, type: f.type }));
}

export async function deleteFiles(ids) {
  if (!ids?.length) return;
  const db = await getDb();
  const cloud = await db.collection('files').find({ _id: { $in: ids }, storage: 'cloudinary' }, { projection: { publicId: 1 } }).toArray();
  for (const f of cloud) await destroyPrivate(f.publicId);
  await db.collection('file_chunks').deleteMany({ fileId: { $in: ids } });
  await db.collection('files').deleteMany({ _id: { $in: ids } });
}

/** Send a stored file as a download (admins only — checked by the route). */
export async function sendFile(res, id) {
  const db = await getDb();
  const f = await db.collection('files').findOne({ _id: oid(id), complete: true });
  if (!f) throw notFound('File not found');
  if (f.storage === 'cloudinary') {
    res.set('Cache-Control', 'private, no-store');
    return res.redirect(302, privateDownloadUrl(f.publicId));
  }
  const chunks = await db.collection('file_chunks').find({ fileId: f._id }).sort({ n: 1 }).toArray();
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c.data.buffer)));
  res.set('Content-Type', f.type || 'application/octet-stream');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Disposition', `attachment; filename="${f.name.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(f.name)}`);
  res.set('Cache-Control', 'private, no-store');
  res.send(buf);
}
