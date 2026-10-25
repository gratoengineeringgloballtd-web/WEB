/*
 * Flutterwave Standard checkout.
 * - createPaymentLink: asks Flutterwave for a hosted payment page for one order.
 * - verifyTransaction: confirms a payment with Flutterwave before an order is marked paid.
 * Without FLW_SECRET_KEY the shop runs in test mode: the "payment page" is a page on
 * this site that simulates success or failure. Test mode is refused in production
 * unless ALLOW_TEST_PAYMENTS=true.
 */
const API = 'https://api.flutterwave.com/v3';

export const flwLive = () => Boolean(process.env.FLW_SECRET_KEY);
export const testPaymentsAllowed = () =>
  !flwLive() && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_PAYMENTS === 'true');

async function flw(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status !== 'success') {
    const err = new Error(`Flutterwave: ${body.message || res.status}`);
    err.status = 502; throw err;
  }
  return body.data;
}

export async function createPaymentLink({ order, txRef, redirectUrl, logoUrl }) {
  if (!flwLive()) {
    if (!testPaymentsAllowed()) { const e = new Error('Online payments are not configured.'); e.status = 503; throw e; }
    return `${redirectUrl.split('?')[0].replace(/\/order\/[^/]+$/, '')}/pay-test/${order.number}?t=${order.accessToken}&tx_ref=${encodeURIComponent(txRef)}`;
  }
  const data = await flw('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tx_ref: txRef,
      amount: order.total,
      currency: order.currency,
      redirect_url: redirectUrl,
      customer: { email: order.customer.email, phonenumber: order.customer.phone, name: order.customer.name },
      customizations: { title: 'Grato Engineering', description: `Order ${order.number}`, logo: logoUrl },
      meta: { order_number: order.number },
    }),
  });
  return data.link;
}

/** Returns { ok, amount, currency, id, txRef } from Flutterwave's record of the transaction. */
export async function verifyTransaction({ transactionId, txRef }) {
  const data = transactionId
    ? await flw(`/transactions/${encodeURIComponent(transactionId)}/verify`)
    : await flw(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`);
  return { ok: data.status === 'successful', amount: Number(data.amount), currency: data.currency, id: String(data.id), txRef: data.tx_ref };
}

/** Webhooks carry the secret hash set in the Flutterwave dashboard. */
export const webhookHashOk = (req) =>
  Boolean(process.env.FLW_SECRET_HASH) && req.headers['verif-hash'] === process.env.FLW_SECRET_HASH;
