import crypto from 'node:crypto';
import { getDb } from './db.js';
import { getSettings } from './settings.js';

export const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);

/** Pick the tier for a month's referred sales volume (tiers sorted by threshold). */
export function tierFor(tiers, currency, volume) {
  const sorted = [...tiers].sort((a, b) => (a.min?.[currency] ?? 0) - (b.min?.[currency] ?? 0));
  let tier = sorted[0];
  for (const t of sorted) if (volume >= (t.min?.[currency] ?? 0)) tier = t;
  return tier;
}

export async function newReferralCode(db, name) {
  const base = (String(name || 'GRATO').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'GRATO');
  for (let i = 0; i < 8; i++) {
    const code = `${base}${crypto.randomInt(100, 9999)}`;
    if (!(await db.collection('users').findOne({ 'referral.code': code }))) return code;
  }
  return `GR${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/** Find an approved referrer for a code, or null. */
export async function referrerForCode(code) {
  if (!code || typeof code !== 'string') return null;
  const db = await getDb();
  return db.collection('users').findOne({ 'referral.code': code.trim().toUpperCase(), 'referral.status': 'approved' });
}

/**
 * Create the commission for a paid order. The rate comes from the tier the referrer
 * reaches this month in this currency, counting this order. Idempotent per order.
 */
export async function createCommission(order) {
  if (!order.referral?.referrerId) return null;
  const db = await getDb();
  const existing = await db.collection('commissions').findOne({ orderId: order._id, amount: { $gt: 0 } });
  if (existing) return existing;
  const settings = await getSettings();
  const month = monthKey(order.payment?.paidAt || new Date());
  const base = order.subtotal; // commission is on goods, not on delivery
  const agg = await db.collection('commissions').aggregate([
    { $match: { referrerId: order.referral.referrerId, month, currency: order.currency, status: { $ne: 'reversed' }, refunded: { $ne: true }, amount: { $gt: 0 } } },
    { $group: { _id: null, v: { $sum: '$orderAmount' } } },
  ]).toArray();
  const volume = (agg[0]?.v || 0) + base;
  const tier = tierFor(settings.tiers, order.currency, volume);
  const amount = Math.round((base * tier.rate) / 100);
  const doc = {
    referrerId: order.referral.referrerId, orderId: order._id, orderNumber: order.number,
    currency: order.currency, orderAmount: base, rate: tier.rate, tier: tier.name, amount,
    status: 'pending', month, createdAt: new Date(),
  };
  const r = await db.collection('commissions').insertOne(doc);
  return { ...doc, _id: r.insertedId };
}

/** Order completed: its commission can now be withdrawn. */
export async function releaseCommission(orderId) {
  const db = await getDb();
  await db.collection('commissions').updateMany({ orderId, status: 'pending' }, { $set: { status: 'available', availableAt: new Date() } });
}

/**
 * Order refunded or cancelled after payment. Unpaid commission is reversed;
 * commission already paid out is clawed back with a negative entry.
 */
export async function reverseCommission(orderId, note) {
  const db = await getDb();
  const list = await db.collection('commissions').find({ orderId, amount: { $gt: 0 } }).toArray();
  for (const c of list) {
    if (c.status === 'pending' || c.status === 'available') {
      await db.collection('commissions').updateOne({ _id: c._id }, { $set: { status: 'reversed', reversedAt: new Date(), note } });
    } else if (c.status === 'paid' || c.status === 'requested') {
      await db.collection('commissions').updateOne({ _id: c._id }, { $set: { refunded: true, refundedAt: new Date() } });
      const has = await db.collection('commissions').findOne({ orderId, amount: { $lt: 0 } });
      if (!has) {
        await db.collection('commissions').insertOne({
          referrerId: c.referrerId, orderId, orderNumber: c.orderNumber, currency: c.currency, orderAmount: 0,
          rate: c.rate, tier: c.tier, amount: -c.amount, status: 'available', month: monthKey(), createdAt: new Date(),
          note: `Clawback: ${note || 'order refunded'}`,
        });
      }
    }
  }
}

/** Balances per currency for one referrer. */
export async function balances(referrerId) {
  const db = await getDb();
  const rows = await db.collection('commissions').aggregate([
    { $match: { referrerId } },
    { $group: { _id: { c: '$currency', s: '$status' }, sum: { $sum: '$amount' } } },
  ]).toArray();
  const out = {};
  for (const cur of ['NGN', 'XAF']) out[cur] = { pending: 0, available: 0, requested: 0, paid: 0 };
  for (const r of rows) {
    const b = out[r._id.c]; if (!b) continue;
    if (r._id.s in b) b[r._id.s] += r.sum;
  }
  return out;
}
