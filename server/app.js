import express from 'express';
import cookieParser from 'cookie-parser';
import { loadUser } from './auth.js';
import { getDb } from './db.js';
import { h } from './http.js';
import { markPaid } from './orders.js';
import { verifyTransaction, webhookHashOk } from './flutterwave.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import referralRoutes from './routes/referral.js';
import adminRoutes from './routes/admin.js';
import adminContentRoutes from './routes/adminContent.js';
import formRoutes from './routes/forms.js';

/*
 * The shop API. On Vercel it runs as one serverless function (api/index.js);
 * locally `npm run dev:api` serves it on port 3001 and Vite proxies /api to it.
 */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// Cookie-authenticated writes must come from this site.
app.use((req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path.startsWith('/api/webhooks/')) return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    const ok = new URL(origin).host === host || (process.env.SITE_URL && new URL(process.env.SITE_URL).host === new URL(origin).host);
    if (!ok) return next(Object.assign(new Error('Cross-site request refused.'), { status: 403 }));
  } catch { return next(Object.assign(new Error('Bad origin.'), { status: 403 })); }
  next();
});
app.use(loadUser);

app.get('/api/health', h(async (_req, res) => { await getDb(); res.json({ ok: true }); }));
app.use('/api', publicRoutes);
app.use('/api', formRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminContentRoutes);

/** Flutterwave calls this after a payment. The payment is re-verified before the order is marked paid. */
app.post('/api/webhooks/flutterwave', h(async (req, res) => {
  if (!webhookHashOk(req)) return res.status(401).end();
  const data = req.body?.data || {};
  if (req.body?.event === 'charge.completed' && data.status === 'successful' && data.tx_ref) {
    const db = await getDb();
    const o = await db.collection('orders').findOne({ 'payment.txRef': data.tx_ref });
    if (o && ['pending_payment', 'quoted'].includes(o.status)) {
      const v = await verifyTransaction({ transactionId: data.id });
      if (v.ok && v.txRef === o.payment.txRef && v.currency === o.currency && v.amount >= o.total) {
        await markPaid(o, { provider: 'flutterwave', transactionId: v.id, amount: v.amount, by: 'flutterwave-webhook' });
      }
    }
  }
  res.status(200).json({ ok: true });
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && !err.expose && !err.status ? 'Something went wrong. Try again.' : err.message, code: err.code });
});

export default app;
