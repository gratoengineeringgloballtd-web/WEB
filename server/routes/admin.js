import { Router } from 'express';
import { Binary } from 'mongodb';
import { getDb, oid } from '../db.js';
import { h, bad, notFound, str, int, isEmail, CATEGORIES, CURRENCIES } from '../http.js';
import { requireAdmin, hashPassword } from '../auth.js';
import { getSettings, DEFAULT_SETTINGS } from '../settings.js';
import { changeStatus, STATUSES, PAID_STATES } from '../orders.js';
import { newReferralCode, balances } from '../referrals.js';
import { productOut } from './public.js';
import { cloudOn, signUpload } from '../cloud.js';

const r = Router();
r.use(requireAdmin);
const by = (req) => req.user.email;

/* ---------- dashboard ---------- */
r.get('/summary', h(async (_req, res) => {
  const db = await getDb();
  const since = new Date(Date.now() - 30 * 864e5);
  const [revenue, counts, pendingRef, pendingPayouts, sample, lowStock, newEnquiries, newApplications] = await Promise.all([
    db.collection('orders').aggregate([{ $match: { status: { $in: PAID_STATES }, 'payment.paidAt': { $gte: since } } }, { $group: { _id: '$currency', total: { $sum: '$total' }, n: { $sum: 1 } } }]).toArray(),
    db.collection('orders').aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray(),
    db.collection('users').countDocuments({ 'referral.status': 'pending' }),
    db.collection('payouts').countDocuments({ status: 'requested' }),
    db.collection('products').countDocuments({ samplePrice: true, active: true }),
    db.collection('products').countDocuments({ active: true, stock: { $type: 'number', $lte: 2 } }),
    db.collection('enquiries').countDocuments({ status: 'new' }),
    db.collection('applications').countDocuments({ status: 'new' }),
  ]);
  res.json({ revenue, counts: Object.fromEntries(counts.map((c) => [c._id, c.n])), pendingReferrers: pendingRef, pendingPayouts, samplePrices: sample, lowStock, newEnquiries, newApplications });
}));

/* ---------- products ---------- */
function productInput(b) {
  const L = (o, max) => ({ en: str(o?.en, max), fr: str(o?.fr, max) || str(o?.en, max) });
  const slug = str(b.slug, 120).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw bad('Enter a URL name (slug).', 'slug');
  if (!CATEGORIES.includes(b.category)) throw bad('Choose a category.', 'category');
  const name = L(b.name, 160);
  if (!name.en) throw bad('Enter the product name.', 'name');
  const prices = {};
  for (const c of CURRENCIES) { const v = int(b.prices?.[c]); prices[c] = v && v > 0 ? v : null; }
  const stock = b.stock === '' || b.stock === null || b.stock === undefined ? null : Math.max(0, int(b.stock) ?? 0);
  return {
    slug, category: b.category, brand: str(b.brand, 80), sku: str(b.sku, 60),
    name, summary: L(b.summary, 300), description: L(b.description, 4000),
    specs: (Array.isArray(b.specs) ? b.specs : []).slice(0, 30).map((s) => ({ label: str(s.label, 80), value: str(s.value, 160) })).filter((s) => s.label && s.value),
    images: (Array.isArray(b.images) ? b.images : []).slice(0, 8).map((u) => str(u, 300)).filter(Boolean),
    prices, mode: b.mode === 'quote' ? 'quote' : 'buy', stock, active: b.active !== false, featured: Boolean(b.featured),
    sortOrder: int(b.sortOrder) ?? 100,
  };
}

r.get('/products', h(async (_req, res) => {
  const db = await getDb();
  const list = await db.collection('products').find({}).sort({ category: 1, sortOrder: 1, createdAt: -1 }).toArray();
  res.json(list.map((p) => ({ ...productOut(p), active: p.active, samplePrice: Boolean(p.samplePrice), sortOrder: p.sortOrder ?? 100 })));
}));

r.post('/products', h(async (req, res) => {
  const db = await getDb();
  const doc = { ...productInput(req.body), samplePrice: false, createdAt: new Date(), updatedAt: new Date() };
  try { const out = await db.collection('products').insertOne(doc); res.status(201).json({ id: String(out.insertedId) }); }
  catch (e) { if (e.code === 11000) throw bad('Another product already uses this URL name.', 'slug'); throw e; }
}));

r.put('/products/:id', h(async (req, res) => {
  const db = await getDb();
  const id = oid(req.params.id); if (!id) throw notFound();
  const before = await db.collection('products').findOne({ _id: id }); if (!before) throw notFound();
  const doc = productInput(req.body);
  const priceChanged = CURRENCIES.some((c) => (before.prices?.[c] ?? null) !== doc.prices[c]);
  try {
    await db.collection('products').updateOne({ _id: id }, { $set: { ...doc, updatedAt: new Date(), ...(priceChanged || req.body.confirmPrices ? { samplePrice: false } : {}) } });
  } catch (e) { if (e.code === 11000) throw bad('Another product already uses this URL name.', 'slug'); throw e; }
  res.json({ ok: true });
}));

r.delete('/products/:id', h(async (req, res) => {
  const db = await getDb();
  const id = oid(req.params.id); if (!id) throw notFound();
  const used = await db.collection('orders').findOne({ 'items.productId': id });
  if (used) await db.collection('products').updateOne({ _id: id }, { $set: { active: false, updatedAt: new Date() } });
  else await db.collection('products').deleteOne({ _id: id });
  res.json({ ok: true, archived: Boolean(used) });
}));

/** Cloudinary: signature for one photo upload from the dashboard (browser uploads directly). */
r.post('/images/sign', h(async (_req, res) => {
  if (!cloudOn()) return res.json({ mode: 'db' });
  res.json({ mode: 'cloudinary', upload: signUpload({ kind: 'photo', folder: 'photos' }) });
}));

/** Upload one product photo (sent as base64 after the browser has resized it). */
r.post('/images', h(async (req, res) => {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body.dataUrl || ''));
  if (!m) throw bad('Upload a JPEG, PNG or WebP image.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 2.5 * 1024 * 1024) throw bad('Image is larger than 2.5 MB after resizing.');
  const db = await getDb();
  const out = await db.collection('images').insertOne({ contentType: m[1], data: new Binary(buf), size: buf.length, createdAt: new Date(), by: by(req) });
  res.status(201).json({ url: `/api/images/${out.insertedId}` });
}));

/* ---------- orders ---------- */
r.get('/orders', h(async (req, res) => {
  const db = await getDb();
  const q = {};
  if (STATUSES.includes(req.query.status)) q.status = req.query.status;
  const s = str(req.query.q, 80);
  if (s) q.$or = [{ number: { $regex: s.replace(/[^A-Za-z0-9-]/g, ''), $options: 'i' } }, { 'customer.email': { $regex: s.replace(/[^A-Za-z0-9@._-]/g, ''), $options: 'i' } }, { 'customer.name': { $regex: s.replace(/[^\p{L}\s'-]/gu, ''), $options: 'i' } }];
  const list = await db.collection('orders').find(q).sort({ createdAt: -1 }).limit(300).toArray();
  res.json(list.map((o) => ({ id: String(o._id), number: o.number, status: o.status, checkout: o.checkout, currency: o.currency, total: o.total, customer: o.customer, createdAt: o.createdAt, referral: o.referral?.code || null, items: o.items.length })));
}));

r.get('/orders/:id', h(async (req, res) => {
  const db = await getDb();
  const o = await db.collection('orders').findOne({ _id: oid(req.params.id) });
  if (!o) throw notFound();
  const commission = await db.collection('commissions').find({ orderId: o._id }).toArray();
  res.json({ ...o, id: String(o._id), commission });
}));

/** Set prices for quote items and the delivery fee, then send the quote to the customer. */
r.post('/orders/:id/quote', h(async (req, res) => {
  const db = await getDb();
  const o = await db.collection('orders').findOne({ _id: oid(req.params.id) });
  if (!o) throw notFound();
  if (!['awaiting_quote', 'quoted', 'pending_payment'].includes(o.status)) throw bad('This order can no longer be re-priced.');
  const prices = req.body.unitPrices || {};
  const items = o.items.map((it, k) => {
    const v = int(prices[k] ?? it.unitPrice);
    if (!v || v <= 0) throw bad(`Enter a price for line ${k + 1}.`);
    return { ...it, unitPrice: v, lineTotal: v * it.qty };
  });
  const fee = int(req.body.deliveryFee ?? o.delivery.fee);
  if (fee === null || fee < 0) throw bad('Enter the delivery fee (0 for none).');
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const total = subtotal + fee;
  await db.collection('orders').updateOne({ _id: o._id }, {
    $set: { items, 'delivery.fee': fee, subtotal, total, status: 'quoted', quoteNote: str(req.body.note, 1500), quotedAt: new Date(), updatedAt: new Date() },
    $push: { history: { at: new Date(), status: 'quoted', by: by(req), note: '' } },
  });
  res.json({ ok: true, total });
}));

r.post('/orders/:id/status', h(async (req, res) => {
  const db = await getDb();
  const o = await db.collection('orders').findOne({ _id: oid(req.params.id) });
  if (!o) throw notFound();
  const out = await changeStatus(o, req.body.status, by(req), str(req.body.note, 500));
  res.json({ ok: true, status: out?.status });
}));

r.post('/orders/:id/note', h(async (req, res) => {
  const db = await getDb();
  await db.collection('orders').updateOne({ _id: oid(req.params.id) }, { $set: { adminNote: str(req.body.note, 3000), updatedAt: new Date() } });
  res.json({ ok: true });
}));

/* ---------- referrers ---------- */
r.get('/referrers', h(async (req, res) => {
  const db = await getDb();
  const q = { 'referral.status': { $in: ['pending', 'approved', 'rejected', 'suspended'] } };
  if (['pending', 'approved', 'rejected', 'suspended'].includes(req.query.status)) q['referral.status'] = req.query.status;
  const list = await db.collection('users').find(q, { projection: { passwordHash: 0 } }).sort({ 'referral.appliedAt': -1 }).limit(500).toArray();
  const out = [];
  for (const u of list) {
    const orders = await db.collection('orders').countDocuments({ 'referral.referrerId': u._id, status: { $in: PAID_STATES } });
    out.push({ id: String(u._id), name: u.name, email: u.email, phone: u.referral?.phone || u.phone || '', referral: u.referral, paidOrders: orders, balances: u.referral?.status === 'approved' ? await balances(u._id) : null });
  }
  res.json(out);
}));

r.post('/referrers/:id/status', h(async (req, res) => {
  const next = req.body.status;
  if (!['approved', 'rejected', 'suspended'].includes(next)) throw bad('Unknown status.');
  const db = await getDb();
  const u = await db.collection('users').findOne({ _id: oid(req.params.id) });
  if (!u?.referral || u.referral.status === 'none') throw notFound();
  const set = { 'referral.status': next, 'referral.reviewedAt': new Date(), 'referral.reviewedBy': by(req), 'referral.reviewNote': str(req.body.note, 500) };
  if (next === 'approved' && !u.referral.code) set['referral.code'] = await newReferralCode(db, u.name);
  await db.collection('users').updateOne({ _id: u._id }, { $set: set });
  res.json({ ok: true, code: set['referral.code'] || u.referral.code || null });
}));

/* ---------- commissions & payouts ---------- */
r.get('/commissions', h(async (req, res) => {
  const db = await getDb();
  const q = {};
  if (['pending', 'available', 'requested', 'paid', 'reversed'].includes(req.query.status)) q.status = req.query.status;
  const list = await db.collection('commissions').aggregate([
    { $match: q }, { $sort: { createdAt: -1 } }, { $limit: 500 },
    { $lookup: { from: 'users', localField: 'referrerId', foreignField: '_id', as: 'u', pipeline: [{ $project: { name: 1, email: 1, 'referral.code': 1 } }] } },
  ]).toArray();
  res.json(list.map((c) => ({ ...c, id: String(c._id), referrer: c.u[0] ? { name: c.u[0].name, email: c.u[0].email, code: c.u[0].referral?.code } : null, u: undefined })));
}));

r.get('/payouts', h(async (req, res) => {
  const db = await getDb();
  const q = {};
  if (['requested', 'paid', 'rejected'].includes(req.query.status)) q.status = req.query.status;
  const list = await db.collection('payouts').aggregate([
    { $match: q }, { $sort: { requestedAt: -1 } }, { $limit: 300 },
    { $lookup: { from: 'users', localField: 'referrerId', foreignField: '_id', as: 'u', pipeline: [{ $project: { name: 1, email: 1, 'referral.code': 1 } }] } },
  ]).toArray();
  res.json(list.map((p) => ({ ...p, id: String(p._id), referrer: p.u[0] ? { name: p.u[0].name, email: p.u[0].email, code: p.u[0].referral?.code } : null, u: undefined })));
}));

/** Record that Grato has paid a payout (or reject it and release the commission). */
r.post('/payouts/:id', h(async (req, res) => {
  const db = await getDb();
  const p = await db.collection('payouts').findOne({ _id: oid(req.params.id) });
  if (!p) throw notFound();
  if (p.status !== 'requested') throw bad('This payout has already been handled.');
  if (req.body.action === 'paid') {
    const ref = str(req.body.reference, 120);
    if (!ref) throw bad('Enter the transfer reference.');
    await db.collection('payouts').updateOne({ _id: p._id }, { $set: { status: 'paid', paidAt: new Date(), reference: ref, handledBy: by(req) } });
    await db.collection('commissions').updateMany({ _id: { $in: p.commissionIds } }, { $set: { status: 'paid', paidAt: new Date() } });
  } else if (req.body.action === 'reject') {
    await db.collection('payouts').updateOne({ _id: p._id }, { $set: { status: 'rejected', handledAt: new Date(), note: str(req.body.note, 500), handledBy: by(req) } });
    await db.collection('commissions').updateMany({ _id: { $in: p.commissionIds } }, { $set: { status: 'available' }, $unset: { payoutId: '' } });
  } else throw bad('Unknown action.');
  res.json({ ok: true });
}));

/* ---------- team: admin accounts (only admins can create them) ---------- */
r.get('/users', h(async (_req, res) => {
  const db = await getDb();
  const list = await db.collection('users').find({ roles: 'admin', disabled: { $ne: true } }, { projection: { passwordHash: 0 } }).sort({ createdAt: 1 }).toArray();
  res.json(list.map((u) => ({ id: String(u._id), name: u.name, email: u.email, createdAt: u.createdAt, createdBy: u.createdBy || '', lastLoginAt: u.lastLoginAt || null })));
}));

r.post('/users', h(async (req, res) => {
  const name = str(req.body.name, 120), email = str(req.body.email, 160).toLowerCase(), password = String(req.body.password || '');
  if (name.length < 2) throw bad('Enter the full name.', 'name');
  if (!isEmail(email)) throw bad('Enter a valid email address.', 'email');
  const db = await getDb();
  const existing = await db.collection('users').findOne({ email });
  if (existing) {
    if (existing.roles?.includes('admin')) throw bad('This person is already an admin.', 'email');
    await db.collection('users').updateOne({ _id: existing._id }, { $addToSet: { roles: 'admin' }, $set: { adminSince: new Date(), createdBy: by(req) } });
    return res.json({ ok: true, promoted: true });
  }
  if (password.length < 10) throw bad('Use a temporary password of at least 10 characters.', 'password');
  await db.collection('users').insertOne({
    name, email, passwordHash: await hashPassword(password), roles: ['customer', 'admin'], referral: { status: 'none' },
    createdAt: new Date(), adminSince: new Date(), createdBy: by(req),
  });
  res.status(201).json({ ok: true, promoted: false });
}));

r.post('/users/:id/remove-admin', h(async (req, res) => {
  const id = oid(req.params.id); if (!id) throw notFound();
  if (String(id) === String(req.user._id)) throw bad('You cannot remove your own admin access.');
  const db = await getDb();
  const n = await db.collection('users').countDocuments({ roles: 'admin', disabled: { $ne: true } });
  if (n <= 1) throw bad('There must be at least one admin.');
  await db.collection('users').updateOne({ _id: id }, { $pull: { roles: 'admin' } });
  res.json({ ok: true });
}));

r.post('/users/:id/password', h(async (req, res) => {
  const id = oid(req.params.id); if (!id) throw notFound();
  const password = String(req.body.password || '');
  if (password.length < 10) throw bad('Use a password of at least 10 characters.');
  const db = await getDb();
  const out = await db.collection('users').updateOne({ _id: id, roles: 'admin' }, { $set: { passwordHash: await hashPassword(password), passwordChangedAt: new Date() } });
  if (!out.matchedCount) throw notFound();
  res.json({ ok: true });
}));

/* ---------- settings ---------- */
r.get('/settings', h(async (_req, res) => res.json(await getSettings())));

r.put('/settings', h(async (req, res) => {
  const b = req.body;
  const tiers = (Array.isArray(b.tiers) ? b.tiers : []).slice(0, 8).map((t) => ({
    name: str(t.name, 40), rate: Math.max(0, Math.min(50, Number(t.rate) || 0)),
    min: { NGN: Math.max(0, int(t.min?.NGN) ?? 0), XAF: Math.max(0, int(t.min?.XAF) ?? 0) },
  })).filter((t) => t.name);
  if (!tiers.length) throw bad('Add at least one tier.');
  if (!tiers.some((t) => t.min.NGN === 0) || !tiers.some((t) => t.min.XAF === 0)) throw bad('One tier must start at 0 in each currency.');
  const zones = (Array.isArray(b.deliveryZones) ? b.deliveryZones : []).slice(0, 60).map((z) => ({
    id: str(z.id || z.name, 60).toLowerCase().replace(/[^a-z0-9-]+/g, '-'), currency: CURRENCIES.includes(z.currency) ? z.currency : 'NGN',
    name: str(z.name, 80), fee: Math.max(0, int(z.fee) ?? 0),
  })).filter((z) => z.name && z.id);
  const points = (Array.isArray(b.pickupPoints) ? b.pickupPoints : []).slice(0, 10).map((p) => ({
    id: str(p.id || p.name?.en, 60).toLowerCase().replace(/[^a-z0-9-]+/g, '-'), currency: CURRENCIES.includes(p.currency) ? p.currency : 'NGN',
    name: { en: str(p.name?.en, 100), fr: str(p.name?.fr, 100) || str(p.name?.en, 100) }, address: str(p.address, 200),
  })).filter((p) => p.name.en && p.id);
  const doc = {
    tiers, deliveryZones: zones, pickupPoints: points,
    payoutMinimum: { NGN: Math.max(0, int(b.payoutMinimum?.NGN) ?? DEFAULT_SETTINGS.payoutMinimum.NGN), XAF: Math.max(0, int(b.payoutMinimum?.XAF) ?? DEFAULT_SETTINGS.payoutMinimum.XAF) },
    referralDays: Math.max(1, Math.min(365, int(b.referralDays) ?? 30)), updatedAt: new Date(), updatedBy: by(req),
  };
  const db = await getDb();
  await db.collection('settings').updateOne({ _id: 'main' }, { $set: doc }, { upsert: true });
  res.json(await getSettings());
}));

export default r;
