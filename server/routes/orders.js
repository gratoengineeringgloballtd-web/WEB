import { Router } from 'express';
import { getDb } from '../db.js';
import { h, bad, notFound, str, isEmail, isPhone, limit, clientIp, siteUrl, HttpError } from '../http.js';
import { getSettings } from '../settings.js';
import { priceCart, newOrderNumber, newToken, markPaid, publicOrder } from '../orders.js';
import { createPaymentLink, verifyTransaction, testPaymentsAllowed, flwLive } from '../flutterwave.js';
import { referrerForCode } from '../referrals.js';

const r = Router();

/** Quote a cart without creating an order (used by the checkout summary). */
r.post('/price', h(async (req, res) => {
  const settings = await getSettings();
  const out = await priceCart({ cart: req.body.cart, currency: req.body.currency, delivery: req.body.delivery, settings });
  res.json({ ...out, items: out.items.map((i) => ({ ...i, productId: String(i.productId) })) });
}));

/**
 * Place an order. checkout = 'online' (pay now with Flutterwave) or 'invoice'
 * (Grato confirms prices and delivery, then sends a payment link or invoice).
 */
r.post('/', h(async (req, res) => {
  limit(`order:${clientIp(req)}`, 20, 60 * 60_000);
  const settings = await getSettings();
  const c = req.body.customer || {};
  const customer = { name: str(c.name, 120), email: str(c.email, 160).toLowerCase(), phone: str(c.phone, 40), company: str(c.company, 160) };
  if (customer.name.length < 2) throw bad('Enter your full name.', 'name');
  if (!isEmail(customer.email)) throw bad('Enter a valid email address.', 'email');
  if (!isPhone(customer.phone)) throw bad('Enter a phone number with country code.', 'phone');

  const priced = await priceCart({ cart: req.body.cart, currency: req.body.currency, delivery: req.body.delivery, settings });
  if (priced.problems.length) throw new HttpError(409, 'Some items are unavailable or out of stock. Review your cart.', 'cart_changed');
  const checkout = req.body.checkout === 'online' ? 'online' : 'invoice';
  if (checkout === 'online' && !priced.canPayOnline) throw bad('This order needs a quote from Grato before payment.', 'needs_quote');

  // Referral: only an approved referrer, and never yourself.
  let referral = null;
  const ref = await referrerForCode(str(req.body.ref, 40));
  if (ref && ref.email !== customer.email && String(ref._id) !== String(req.user?._id || '')) {
    referral = { code: ref.referral.code, referrerId: ref._id };
  }

  const now = new Date();
  const order = {
    number: newOrderNumber(), accessToken: newToken(), userId: req.user?._id || null, customer,
    currency: req.body.currency, items: priced.items, delivery: priced.delivery,
    subtotal: priced.subtotal, total: priced.total, checkout,
    status: checkout === 'online' ? 'pending_payment' : 'awaiting_quote',
    notes: str(req.body.notes, 1500), referral,
    payment: {}, history: [{ at: now, status: checkout === 'online' ? 'pending_payment' : 'awaiting_quote', by: 'customer', note: '' }],
    createdAt: now, updatedAt: now,
  };
  const db = await getDb();
  const ins = await db.collection('orders').insertOne(order);
  order._id = ins.insertedId;

  let paymentUrl = null;
  if (checkout === 'online') paymentUrl = await startPayment(req, order);
  res.status(201).json({ number: order.number, token: order.accessToken, paymentUrl });
}));

async function startPayment(req, order) {
  const db = await getDb();
  const txRef = `${order.number}-${Date.now().toString(36)}`;
  const base = siteUrl(req);
  const lang = req.body?.lang === 'fr' ? '/fr' : '';
  const redirectUrl = `${base}${lang}/shop/order/${order.number}?t=${order.accessToken}`;
  const link = await createPaymentLink({ order, txRef, redirectUrl, logoUrl: `${base}/img/mark.png` });
  await db.collection('orders').updateOne({ _id: order._id }, { $set: { 'payment.txRef': txRef, 'payment.provider': flwLive() ? 'flutterwave' : 'test', updatedAt: new Date() } });
  return link;
}

async function orderFor(req) {
  const db = await getDb();
  const o = await db.collection('orders').findOne({ number: str(req.params.number, 40) });
  if (!o) throw notFound('Order not found');
  const token = str(req.query.t || req.body?.t, 80);
  const owner = req.user && o.userId && String(o.userId) === String(req.user._id);
  const admin = req.user?.roles?.includes('admin');
  if (!(owner || admin || (token && token === o.accessToken))) throw notFound('Order not found');
  return o;
}

r.get('/:number', h(async (req, res) => res.json(publicOrder(await orderFor(req)))));

/** Pay an order that is waiting for payment (online orders, or quotes Grato has priced). */
r.post('/:number/pay', h(async (req, res) => {
  const o = await orderFor(req);
  if (!['pending_payment', 'quoted'].includes(o.status) || !(o.total > 0)) throw bad('This order cannot be paid online yet.');
  res.json({ paymentUrl: await startPayment(req, o) });
}));

/** After the Flutterwave redirect: confirm the payment with Flutterwave, then mark the order paid. */
r.post('/:number/verify', h(async (req, res) => {
  let o = await orderFor(req);
  if (['pending_payment', 'quoted'].includes(o.status) && flwLive()) {
    const tid = str(req.body.transactionId, 40);
    const v = await verifyTransaction(tid ? { transactionId: tid } : { txRef: o.payment?.txRef });
    if (v.ok && v.txRef === o.payment?.txRef && v.currency === o.currency && v.amount >= o.total) {
      o = (await markPaid(o, { provider: 'flutterwave', transactionId: v.id, amount: v.amount, by: 'flutterwave' })) || o;
    }
  }
  const db = await getDb();
  res.json(publicOrder(await db.collection('orders').findOne({ _id: o._id })));
}));

/** Test mode only (no Flutterwave key): simulate the payment result. */
r.post('/:number/test-pay', h(async (req, res) => {
  if (!testPaymentsAllowed()) throw new HttpError(403, 'Test payments are disabled.');
  let o = await orderFor(req);
  if (req.body.outcome === 'success' && ['pending_payment', 'quoted'].includes(o.status) && req.body.txRef === o.payment?.txRef) {
    o = (await markPaid(o, { provider: 'test', transactionId: `TEST-${Date.now()}`, amount: o.total, by: 'test-payment' })) || o;
  }
  const db = await getDb();
  res.json(publicOrder(await db.collection('orders').findOne({ _id: o._id })));
}));

export default r;
