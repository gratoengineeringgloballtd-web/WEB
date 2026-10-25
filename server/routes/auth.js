import { Router } from 'express';
import { getDb } from '../db.js';
import { h, bad, str, isEmail, limit, clientIp, HttpError } from '../http.js';
import { hashPassword, checkPassword, setSession, clearSession, publicUser, requireUser } from '../auth.js';
import { publicOrder } from '../orders.js';

const r = Router();

r.post('/register', h(async (req, res) => {
  limit(`reg:${clientIp(req)}`, 10, 15 * 60_000);
  const name = str(req.body.name, 120), email = str(req.body.email, 160).toLowerCase(), password = String(req.body.password || '');
  if (name.length < 2) throw bad('Enter your full name.', 'name');
  if (!isEmail(email)) throw bad('Enter a valid email address.', 'email');
  if (password.length < 8) throw bad('Use a password of at least 8 characters.', 'password');
  const db = await getDb();
  const doc = {
    name, email, passwordHash: await hashPassword(password), phone: str(req.body.phone, 40), company: str(req.body.company, 160),
    roles: ['customer'], referral: { status: 'none' }, createdAt: new Date(),
  };
  try {
    const out = await db.collection('users').insertOne(doc);
    doc._id = out.insertedId;
  } catch (e) {
    if (e.code === 11000) throw new HttpError(409, 'An account with this email already exists. Sign in instead.', 'email_taken');
    throw e;
  }
  await setSession(res, doc);
  res.status(201).json({ user: publicUser(doc) });
}));

r.post('/login', h(async (req, res) => {
  const email = str(req.body.email, 160).toLowerCase();
  limit(`login:${clientIp(req)}:${email}`, 8, 15 * 60_000);
  const db = await getDb();
  const u = await db.collection('users').findOne({ email });
  if (!u || u.disabled || !(await checkPassword(String(req.body.password || ''), u.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.', 'bad_credentials');
  }
  await db.collection('users').updateOne({ _id: u._id }, { $set: { lastLoginAt: new Date() } });
  await setSession(res, u);
  res.json({ user: publicUser(u) });
}));

r.post('/logout', (_req, res) => { clearSession(res); res.json({ ok: true }); });

r.get('/me', (req, res) => res.json({ user: publicUser(req.user) }));

r.patch('/me', requireUser, h(async (req, res) => {
  const db = await getDb();
  const set = {};
  for (const k of ['name', 'phone', 'company']) if (typeof req.body[k] === 'string') set[k] = str(req.body[k], 160);
  if (set.name !== undefined && set.name.length < 2) throw bad('Enter your full name.', 'name');
  await db.collection('users').updateOne({ _id: req.user._id }, { $set: set });
  res.json({ user: publicUser({ ...req.user, ...set }) });
}));

r.get('/orders', requireUser, h(async (req, res) => {
  const db = await getDb();
  const list = await db.collection('orders').find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100).toArray();
  res.json(list.map((o) => ({ ...publicOrder(o), token: o.accessToken })));
}));

export default r;
