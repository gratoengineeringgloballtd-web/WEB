import { Router } from 'express';
import { getDb, oid } from '../db.js';
import { h, bad, notFound, str } from '../http.js';
import { requireAdmin } from '../auth.js';
import { TYPES, ensureImported } from '../cms.js';
import { fileInfo, deleteFiles, sendFile } from '../files.js';

/*
 * Admin: website content (news, projects, jobs, partners, clients, offices)
 * and the inbox of form submissions (quote requests and job applications).
 */
const r = Router();
r.use(requireAdmin);
const by = (req) => req.user.email;
const typeOf = (req) => { const t = req.params.type; if (!TYPES[t]) throw notFound(); return t; };
const asAdmin = (d) => { const { _id, ...rest } = d; return { id: String(_id), ...rest }; };

/* ---------- content ---------- */
r.get('/cms/:type', h(async (req, res) => {
  const type = typeOf(req);
  await ensureImported();
  const db = await getDb();
  const list = await db.collection(type).find({}).sort(TYPES[type].sort).limit(1000).toArray();
  res.json(list.map(asAdmin));
}));

async function uniqueSlug(db, type, slug, id) {
  if (!slug) return slug;
  let s = slug, k = 2;
  while (await db.collection(type).findOne({ slug: s, ...(id ? { _id: { $ne: id } } : {}) })) s = `${slug}-${k++}`;
  return s;
}

r.post('/cms/:type', h(async (req, res) => {
  const type = typeOf(req);
  const db = await getDb();
  const doc = TYPES[type].input(req.body || {});
  if ('slug' in doc) doc.slug = await uniqueSlug(db, type, doc.slug);
  if (type === 'news' && doc.lead) await db.collection('news').updateMany({}, { $set: { lead: false } });
  const now = new Date();
  const out = await db.collection(type).insertOne({ ...doc, createdAt: now, updatedAt: now, updatedBy: by(req) });
  res.status(201).json({ id: String(out.insertedId), slug: doc.slug });
}));

r.put('/cms/:type/:id', h(async (req, res) => {
  const type = typeOf(req);
  const id = oid(req.params.id); if (!id) throw notFound();
  const db = await getDb();
  if (!(await db.collection(type).findOne({ _id: id }))) throw notFound();
  const doc = TYPES[type].input(req.body || {});
  if ('slug' in doc) doc.slug = await uniqueSlug(db, type, doc.slug, id);
  if (type === 'news' && doc.lead) await db.collection('news').updateMany({ _id: { $ne: id } }, { $set: { lead: false } });
  await db.collection(type).updateOne({ _id: id }, { $set: { ...doc, updatedAt: new Date(), updatedBy: by(req) } });
  res.json({ ok: true, slug: doc.slug });
}));

r.delete('/cms/:type/:id', h(async (req, res) => {
  const type = typeOf(req);
  const db = await getDb();
  const out = await db.collection(type).deleteOne({ _id: oid(req.params.id) });
  if (!out.deletedCount) throw notFound();
  res.json({ ok: true });
}));

/* ---------- inbox ---------- */
const BOXES = {
  enquiries: { statuses: ['new', 'in_progress', 'quoted', 'closed'], files: (d) => d.files || [] },
  applications: { statuses: ['new', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'], files: (d) => (d.cv ? [d.cv] : []) },
};
const boxOf = (req) => { const b = req.params.box; if (!BOXES[b]) throw notFound(); return b; };

r.get('/inbox/:box', h(async (req, res) => {
  const box = boxOf(req);
  const db = await getDb();
  const q = {};
  if (BOXES[box].statuses.includes(req.query.status)) q.status = req.query.status;
  if (req.query.job) q.jobId = req.query.job === 'general' ? null : oid(req.query.job);
  const s = str(req.query.q, 80).replace(/[^\p{L}\p{N}@.\s'-]/gu, '');
  if (s) q.$or = ['name', 'email', 'company', 'ref', 'jobTitle'].map((k) => ({ [k]: { $regex: s, $options: 'i' } }));
  const list = await db.collection(box).find(q, { projection: { ip: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
  const counts = Object.fromEntries((await db.collection(box).aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray()).map((c) => [c._id, c.n]));
  res.json({ items: list.map(asAdmin), counts });
}));

r.get('/inbox/:box/:id', h(async (req, res) => {
  const box = boxOf(req);
  const db = await getDb();
  const d = await db.collection(box).findOne({ _id: oid(req.params.id) }, { projection: { ip: 0 } });
  if (!d) throw notFound();
  res.json({ ...asAdmin(d), fileList: await fileInfo(BOXES[box].files(d)) });
}));

r.patch('/inbox/:box/:id', h(async (req, res) => {
  const box = boxOf(req);
  const set = { updatedAt: new Date(), updatedBy: by(req) };
  if (req.body.status !== undefined) {
    if (!BOXES[box].statuses.includes(req.body.status)) throw bad('Unknown status.');
    set.status = req.body.status;
  }
  if (typeof req.body.notes === 'string') set.notes = str(req.body.notes, 5000);
  if (req.body.rating !== undefined) set.rating = Math.max(0, Math.min(5, Number(req.body.rating) || 0));
  const db = await getDb();
  const out = await db.collection(box).updateOne({ _id: oid(req.params.id) }, { $set: set });
  if (!out.matchedCount) throw notFound();
  res.json({ ok: true });
}));

r.delete('/inbox/:box/:id', h(async (req, res) => {
  const box = boxOf(req);
  const db = await getDb();
  const d = await db.collection(box).findOne({ _id: oid(req.params.id) });
  if (!d) throw notFound();
  await deleteFiles(BOXES[box].files(d));
  await db.collection(box).deleteOne({ _id: d._id });
  res.json({ ok: true });
}));

/** Download a CV or attachment. */
r.get('/files/:id', h(async (req, res) => { await sendFile(res, req.params.id); }));

export default r;
