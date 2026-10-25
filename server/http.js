/* Small helpers shared by the route files. */

export class HttpError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}
export const bad = (msg, code) => new HttpError(400, msg, code);
export const notFound = (msg = 'Not found') => new HttpError(404, msg, 'not_found');

/** Wrap an async route so thrown errors reach the error handler. */
export const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const int = (v) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.round(Number(v)) : null);
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isPhone = (v) => /^\+?\d{8,15}$/.test(String(v).replace(/[\s().-]/g, ''));

export const CURRENCIES = ['NGN', 'XAF'];
export const CATEGORIES = ['generators', 'spare-parts', 'power', 'telecom'];

export const siteUrl = (req) =>
  (process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.get('host')}`).replace(/\/$/, '');

/** Very small in-memory rate limiter (per function instance). */
const hits = new Map();
export function limit(key, max, windowMs) {
  const now = Date.now();
  const rec = hits.get(key) || { n: 0, t: now };
  if (now - rec.t > windowMs) { rec.n = 0; rec.t = now; }
  rec.n += 1; hits.set(key, rec);
  if (rec.n > max) throw new HttpError(429, 'Too many attempts. Wait a few minutes and try again.', 'rate_limited');
}

export const clientIp = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
