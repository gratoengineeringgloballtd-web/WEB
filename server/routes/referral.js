import { Router } from 'express';
import { getDb } from '../db.js';
import { h, bad, str, isPhone, CURRENCIES, HttpError } from '../http.js';
import { requireUser, publicUser } from '../auth.js';
import { getSettings } from '../settings.js';
import { balances, monthKey, tierFor } from '../referrals.js';

const r = Router();
r.use(requireUser);

/** Apply to become a referrer. Grato approves applications in the admin dashboard. */
r.post('/apply', h(async (req, res) => {
  const st = req.user.referral?.status;
  if (st === 'pending' || st === 'approved') throw bad('You have already applied.');
  if (st === 'suspended') throw new HttpError(403, 'Your referral account is suspended. Contact Grato.');
  const phone = str(req.body.phone, 40);
  if (!isPhone(phone)) throw bad('Enter a phone number with country code.', 'phone');
  const method = req.body.payoutMethod === 'momo' ? 'momo' : 'bank';
  const payout = method === 'bank'
    ? { type: 'bank', bankName: str(req.body.bankName, 120), accountName: str(req.body.accountName, 120), accountNumber: str(req.body.accountNumber, 40) }
    : { type: 'momo', provider: str(req.body.momoProvider, 60), accountName: str(req.body.accountName, 120), number: str(req.body.momoNumber, 40) };
  if (method === 'bank' && (!payout.bankName || !payout.accountName || !payout.accountNumber)) throw bad('Enter your bank details.', 'payout');
  if (method === 'momo' && (!payout.provider || !payout.accountName || !isPhone(payout.number))) throw bad('Enter your mobile money details.', 'payout');
  if (!req.body.acceptTerms) throw bad('Accept the programme terms to apply.', 'terms');
  const referral = {
    status: 'pending', appliedAt: new Date(), country: str(req.body.country, 40), phone,
    audience: str(req.body.audience, 600), payout, code: null,
  };
  const db = await getDb();
  await db.collection('users').updateOne({ _id: req.user._id }, { $set: { referral, phone: req.user.phone || phone } });
  res.json({ user: publicUser({ ...req.user, referral }) });
}));

/** Update payout details (approved or pending referrers). */
r.patch('/payout', h(async (req, res) => {
  const st = req.user.referral?.status;
  if (!['pending', 'approved'].includes(st)) throw bad('Apply to the programme first.');
  const method = req.body.payoutMethod === 'momo' ? 'momo' : 'bank';
  const payout = method === 'bank'
    ? { type: 'bank', bankName: str(req.body.bankName, 120), accountName: str(req.body.accountName, 120), accountNumber: str(req.body.accountNumber, 40) }
    : { type: 'momo', provider: str(req.body.momoProvider, 60), accountName: str(req.body.accountName, 120), number: str(req.body.momoNumber, 40) };
  const db = await getDb();
  await db.collection('users').updateOne({ _id: req.user._id }, { $set: { 'referral.payout': payout } });
  res.json({ ok: true });
}));

/** Everything the referrer dashboard shows. */
r.get('/me', h(async (req, res) => {
  const ref = req.user.referral || { status: 'none' };
  if (ref.status !== 'approved') return res.json({ status: ref.status, payout: ref.payout || null });
  const db = await getDb();
  const settings = await getSettings();
  const month = monthKey();
  const vol = await db.collection('commissions').aggregate([
    { $match: { referrerId: req.user._id, month, status: { $ne: 'reversed' }, refunded: { $ne: true }, amount: { $gt: 0 } } },
    { $group: { _id: '$currency', v: { $sum: '$orderAmount' }, n: { $sum: 1 } } },
  ]).toArray();
  const monthly = {};
  for (const cur of CURRENCIES) {
    const row = vol.find((x) => x._id === cur);
    const volume = row?.v || 0;
    const tier = tierFor(settings.tiers, cur, volume);
    const sorted = [...settings.tiers].sort((a, b) => a.min[cur] - b.min[cur]);
    const next = sorted.find((t) => t.min[cur] > volume) || null;
    monthly[cur] = { volume, orders: row?.n || 0, tier, next: next ? { name: next.name, rate: next.rate, remaining: next.min[cur] - volume } : null };
  }
  const commissions = await db.collection('commissions').find({ referrerId: req.user._id }).sort({ createdAt: -1 }).limit(200).toArray();
  const payouts = await db.collection('payouts').find({ referrerId: req.user._id }).sort({ requestedAt: -1 }).limit(100).toArray();
  res.json({
    status: 'approved', code: ref.code, payout: ref.payout || null, month, monthly,
    balances: await balances(req.user._id), tiers: settings.tiers, payoutMinimum: settings.payoutMinimum, referralDays: settings.referralDays,
    commissions: commissions.map((c) => ({ id: String(c._id), orderNumber: c.orderNumber, currency: c.currency, orderAmount: c.orderAmount, rate: c.rate, tier: c.tier, amount: c.amount, status: c.status, createdAt: c.createdAt, note: c.note || '' })),
    payouts: payouts.map((p) => ({ id: String(p._id), currency: p.currency, amount: p.amount, status: p.status, requestedAt: p.requestedAt, paidAt: p.paidAt || null, reference: p.reference || '' })),
  });
}));

/** Ask Grato to pay out the available balance in one currency. */
r.post('/payouts', h(async (req, res) => {
  if (req.user.referral?.status !== 'approved') throw bad('Only approved referrers can request payouts.');
  const currency = req.body.currency;
  if (!CURRENCIES.includes(currency)) throw bad('Unknown currency.');
  const db = await getDb();
  const settings = await getSettings();
  if (await db.collection('payouts').findOne({ referrerId: req.user._id, currency, status: 'requested' })) throw bad('You already have a payout request waiting in this currency.');
  const avail = await db.collection('commissions').find({ referrerId: req.user._id, currency, status: 'available' }).toArray();
  const amount = avail.reduce((s, c) => s + c.amount, 0);
  if (amount < (settings.payoutMinimum[currency] || 0)) throw bad(`The minimum payout is ${settings.payoutMinimum[currency]} ${currency}.`, 'minimum');
  const ids = avail.map((c) => c._id);
  const doc = { referrerId: req.user._id, currency, amount, commissionIds: ids, payout: req.user.referral.payout, status: 'requested', requestedAt: new Date() };
  const ins = await db.collection('payouts').insertOne(doc);
  await db.collection('commissions').updateMany({ _id: { $in: ids } }, { $set: { status: 'requested', payoutId: ins.insertedId } });
  res.status(201).json({ id: String(ins.insertedId), amount, currency });
}));

export default r;
