import { Router } from 'express';
import crypto from 'node:crypto';
import { getDb, oid, ObjectId } from '../db.js';
import { h, bad, str, isEmail, limit, clientIp } from '../http.js';
import { startUpload, addChunk, completeUpload, attachFiles } from '../files.js';
import { siteContent } from '../cms.js';

/*
 * Public website: content for the pages, and the quote and careers forms.
 * Form submissions land in the admin dashboard (Inbox and Careers).
 */
const r = Router();

r.get('/site', h(async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300');
  res.json(await siteContent());
}));

const ref = (prefix) => `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

r.post('/uploads', h(async (req, res) => {
  limit(`up:${clientIp(req)}`, 30, 30 * 60_000);
  res.status(201).json(await startUpload(req.body || {}));
}));

r.post('/uploads/:id/complete', h(async (req, res) => {
  limit(`done:${clientIp(req)}`, 60, 30 * 60_000);
  res.json(await completeUpload(req.params.id, req.body || {}));
}));

r.post('/uploads/:id/chunk', h(async (req, res) => {
  limit(`chunk:${clientIp(req)}`, 200, 30 * 60_000);
  res.json(await addChunk(req.params.id, req.body || {}));
}));

/** Quote / contact form. */
r.post('/forms/quote', h(async (req, res) => {
  limit(`quote:${clientIp(req)}`, 10, 60 * 60_000);
  const b = req.body || {};
  if (b.website) return res.status(201).json({ ref: ref('GR') }); // honeypot: bots fill hidden fields
  const f = b.fields || {};
  const doc = {
    kind: 'quote', ref: ref('GR'), status: 'new', lang: b.lang === 'fr' ? 'fr' : 'en',
    service: str(f.service, 120), country: str(f.country, 60), site: str(f.site, 300), time: str(f.time, 40), details: str(f.details, 5000),
    name: str(f.name, 120), company: str(f.company, 160), email: str(f.email, 160).toLowerCase(), phone: str(f.phone, 40),
    notes: '', createdAt: new Date(), ip: clientIp(req),
  };
  if (doc.name.length < 2) throw bad('Enter your name.');
  if (!isEmail(doc.email)) throw bad('Enter a valid email address.');
  const db = await getDb();
  const _id = new ObjectId();
  const files = await attachFiles(b.files, 'quote', { type: 'enquiry', id: _id });
  await db.collection('enquiries').insertOne({ _id, ...doc, files });
  res.status(201).json({ ref: doc.ref });
}));

/** Careers form (CV required). */
r.post('/forms/careers', h(async (req, res) => {
  limit(`cv:${clientIp(req)}`, 6, 60 * 60_000);
  const b = req.body || {};
  if (b.website) return res.status(201).json({ ref: ref('CV') });
  const name = str(b.name, 120), email = str(b.email, 160).toLowerCase();
  if (name.length < 2) throw bad('Enter your name.');
  if (!isEmail(email)) throw bad('Enter a valid email address.');
  if (!b.cv?.id) throw bad('Attach your CV.');
  const db = await getDb();
  let jobId = null, jobTitle = 'General application';
  if (b.jobId && b.jobId !== 'general') {
    const job = await db.collection('jobs').findOne({ _id: oid(b.jobId) });
    if (job) { jobId = job._id; jobTitle = job.title.en; }
  }
  const doc = {
    ref: ref('CV'), status: 'new', lang: b.lang === 'fr' ? 'fr' : 'en', jobId, jobTitle, name, email, phone: str(b.phone, 40),
    message: str(b.message, 3000), notes: '', rating: 0, createdAt: new Date(), ip: clientIp(req),
  };
  const _id = new ObjectId();
  const [cv] = await attachFiles([b.cv], 'cv', { type: 'application', id: _id });
  await db.collection('applications').insertOne({ _id, ...doc, cv });
  res.status(201).json({ ref: doc.ref });
}));

export default r;
