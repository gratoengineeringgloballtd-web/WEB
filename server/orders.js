import crypto from 'node:crypto';
import { getDb, oid } from './db.js';
import { bad, CURRENCIES } from './http.js';
import { createCommission, releaseCommission, reverseCommission } from './referrals.js';

/*
 * Order lifecycle
 *   online checkout:  pending_payment → paid → processing → ready → completed
 *   quote / invoice:  awaiting_quote → quoted → paid → processing → ready → completed
 *   any unpaid order can be cancelled; a paid order can be refunded.
 * Prices are always recomputed here from the database; the browser's numbers are ignored.
 */
export const STATUSES = ['pending_payment', 'awaiting_quote', 'quoted', 'paid', 'processing', 'ready', 'completed', 'cancelled', 'refunded'];
export const PAID_STATES = ['paid', 'processing', 'ready', 'completed'];

export const newOrderNumber = () =>
  `GO-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
export const newToken = () => crypto.randomBytes(18).toString('base64url');

/**
 * Turn a cart into priced order lines and decide whether it can be paid online.
 * cart: [{ productId, qty }], delivery: { method: 'pickup'|'flat'|'quote', pointId?, zoneId?, address? }
 */
export async function priceCart({ cart, currency, delivery, settings }) {
  if (!CURRENCIES.includes(currency)) throw bad('Unknown currency.');
  if (!Array.isArray(cart) || !cart.length) throw bad('Your cart is empty.');
  if (cart.length > 60) throw bad('Too many lines in one order.');
  const db = await getDb();
  const ids = cart.map((l) => oid(l.productId)).filter(Boolean);
  const products = await db.collection('products').find({ _id: { $in: ids }, active: true }).toArray();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = []; const problems = [];
  for (const line of cart) {
    const p = byId.get(String(line.productId));
    const qty = Math.max(1, Math.min(999, Math.round(Number(line.qty) || 1)));
    if (!p) { problems.push({ productId: line.productId, reason: 'unavailable' }); continue; }
    const price = p.prices?.[currency];
    const priced = Number.isFinite(price) && price > 0;
    if (p.stock !== null && p.stock !== undefined && qty > p.stock && p.mode === 'buy') problems.push({ productId: String(p._id), reason: 'stock', available: p.stock });
    items.push({
      productId: p._id, slug: p.slug, sku: p.sku || '', name: p.name, image: p.images?.[0] || null,
      qty, unitPrice: priced ? price : null, lineTotal: priced ? price * qty : null, mode: p.mode,
    });
  }

  let deliveryOut;
  if (delivery?.method === 'pickup') {
    const pt = settings.pickupPoints.find((x) => x.id === delivery.pointId);
    if (!pt) throw bad('Choose a pickup point.');
    deliveryOut = { method: 'pickup', pointId: pt.id, label: pt.name, address: pt.address, fee: 0 };
  } else if (delivery?.method === 'flat') {
    const z = settings.deliveryZones.find((x) => x.id === delivery.zoneId && x.currency === currency);
    if (!z) throw bad('Choose a delivery city.');
    if (!delivery.address || String(delivery.address).trim().length < 6) throw bad('Enter the delivery address.');
    deliveryOut = { method: 'flat', zoneId: z.id, label: { en: z.name, fr: z.name }, address: String(delivery.address).trim().slice(0, 400), fee: z.fee };
  } else if (delivery?.method === 'quote') {
    if (!delivery.address || String(delivery.address).trim().length < 6) throw bad('Enter the delivery address.');
    deliveryOut = { method: 'quote', label: { en: 'Delivery quoted by Grato', fr: 'Livraison sur devis' }, address: String(delivery.address).trim().slice(0, 400), fee: null };
  } else throw bad('Choose how you want to receive the order.');

  const allPriced = items.every((i) => i.unitPrice !== null);
  const subtotal = allPriced ? items.reduce((s, i) => s + i.lineTotal, 0) : null;
  const total = subtotal !== null && deliveryOut.fee !== null ? subtotal + deliveryOut.fee : null;
  const canPayOnline = items.length > 0 && !problems.length && allPriced && items.every((i) => i.mode === 'buy') && deliveryOut.fee !== null;
  return { items, problems, delivery: deliveryOut, subtotal, total, canPayOnline };
}

const push = (status, by, note) => ({ at: new Date(), status, by, note: note || '' });

/** Mark an order paid (from Flutterwave or by an admin). Safe to call twice. */
export async function markPaid(order, { provider, transactionId, amount, reference, by }) {
  const db = await getDb();
  const paidAt = new Date();
  const r = await db.collection('orders').findOneAndUpdate(
    { _id: order._id, status: { $in: ['pending_payment', 'quoted', 'awaiting_quote'] } },
    {
      $set: {
        status: 'paid', 'payment.provider': provider, 'payment.transactionId': transactionId || null,
        'payment.amountPaid': amount ?? order.total, 'payment.reference': reference || null, 'payment.paidAt': paidAt, updatedAt: paidAt,
      },
      $push: { history: push('paid', by || provider, reference ? `Ref ${reference}` : '') },
    },
    { returnDocument: 'after' },
  );
  const updated = r?.value ?? r; // driver v6 returns the document
  if (!updated || updated.status !== 'paid' || String(updated._id) !== String(order._id)) return null;
  for (const it of updated.items) {
    await db.collection('products').updateOne({ _id: it.productId, stock: { $type: 'number' } }, [
      { $set: { stock: { $max: [0, { $subtract: ['$stock', it.qty] }] } } },
    ]);
  }
  await createCommission(updated);
  return updated;
}

/** Admin status change with its side effects on stock and commission. */
export async function changeStatus(order, next, by, note) {
  if (!STATUSES.includes(next)) throw bad('Unknown status.');
  const db = await getDb();
  const wasPaid = PAID_STATES.includes(order.status);
  if (next === 'paid' && !wasPaid) return markPaid(order, { provider: 'offline', reference: note, by });
  if (['processing', 'ready', 'completed'].includes(next) && !wasPaid) throw bad('Mark the order paid first.');
  if (next === 'refunded' && !wasPaid) throw bad('Only a paid order can be refunded.');
  if (next === 'cancelled' && wasPaid) throw bad('This order is paid. Refund it instead of cancelling.');
  await db.collection('orders').updateOne({ _id: order._id }, { $set: { status: next, updatedAt: new Date() }, $push: { history: push(next, by, note) } });
  if (next === 'completed') await releaseCommission(order._id);
  if (next === 'refunded') {
    await reverseCommission(order._id, note || 'order refunded');
    for (const it of order.items) await db.collection('products').updateOne({ _id: it.productId, stock: { $type: 'number' } }, { $inc: { stock: it.qty } });
  }
  return db.collection('orders').findOne({ _id: order._id });
}

/** What the customer may see of an order. */
export function publicOrder(o) {
  return {
    number: o.number, status: o.status, currency: o.currency, checkout: o.checkout,
    items: o.items.map((i) => ({ slug: i.slug, name: i.name, sku: i.sku, image: i.image, qty: i.qty, unitPrice: i.unitPrice, lineTotal: i.lineTotal, mode: i.mode })),
    delivery: o.delivery, subtotal: o.subtotal, total: o.total,
    customer: { name: o.customer.name, email: o.customer.email, phone: o.customer.phone, company: o.customer.company },
    notes: o.notes || '', quoteNote: o.quoteNote || '',
    payment: { provider: o.payment?.provider || null, paidAt: o.payment?.paidAt || null },
    canPay: ['pending_payment', 'quoted'].includes(o.status) && Number.isFinite(o.total) && o.total > 0,
    referred: Boolean(o.referral?.code),
    history: (o.history || []).map((h) => ({ at: h.at, status: h.status })),
    createdAt: o.createdAt,
  };
}
