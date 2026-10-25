import { Router } from 'express';
import { getDb, oid } from '../db.js';
import { h, notFound, CATEGORIES, str } from '../http.js';
import { getSettings, publicSettings } from '../settings.js';
import { flwLive, testPaymentsAllowed } from '../flutterwave.js';
import { referrerForCode } from '../referrals.js';

const r = Router();

export const productOut = (p) => ({
  id: String(p._id), slug: p.slug, category: p.category, brand: p.brand || '', sku: p.sku || '',
  name: p.name, summary: p.summary, description: p.description, specs: p.specs || [],
  images: p.images || [], prices: p.prices || {}, mode: p.mode, stock: p.stock ?? null, featured: Boolean(p.featured),
});

r.get('/settings', h(async (_req, res) => {
  const s = await getSettings();
  res.json({ ...publicSettings(s, flwLive()), payments: { live: flwLive(), test: testPaymentsAllowed() } });
}));

r.get('/products', h(async (req, res) => {
  const db = await getDb();
  const q = { active: true };
  const cat = str(req.query.category, 40);
  if (CATEGORIES.includes(cat)) q.category = cat;
  const list = await db.collection('products').find(q).sort({ featured: -1, category: 1, sortOrder: 1, createdAt: -1 }).limit(500).toArray();
  res.set('Cache-Control', 'no-store');
  res.json(list.map(productOut));
}));

r.get('/products/:slug', h(async (req, res) => {
  const db = await getDb();
  const p = await db.collection('products').findOne({ slug: str(req.params.slug, 120), active: true });
  if (!p) throw notFound('Product not found');
  res.json(productOut(p));
}));

/** Product photos uploaded through the admin dashboard. */
r.get('/images/:id', h(async (req, res) => {
  const id = oid(req.params.id);
  if (!id) throw notFound();
  const db = await getDb();
  const img = await db.collection('images').findOne({ _id: id });
  if (!img) throw notFound();
  res.set('Content-Type', img.contentType);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(img.data.buffer));
}));

/** Is this referral code live? Used to show "Referred by …" at checkout. */
r.get('/referral/check/:code', h(async (req, res) => {
  const u = await referrerForCode(str(req.params.code, 40));
  res.json(u ? { valid: true, name: String(u.name || '').split(' ')[0] } : { valid: false });
}));

export default r;
