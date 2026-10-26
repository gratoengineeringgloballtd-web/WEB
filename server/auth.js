import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getDb, oid } from './db.js';
import { HttpError } from './http.js';

const COOKIE = 'grato_session';
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new HttpError(500, 'JWT_SECRET must be set to a random string of at least 32 characters');
  return new TextEncoder().encode(s);
}

export const hashPassword = (pw) => bcrypt.hash(pw, 11);
export const checkPassword = (pw, hash) => bcrypt.compare(pw, hash || '');

export async function setSession(res, user) {
  const token = await new SignJWT({ sub: String(user._id) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secret());
  res.cookie(COOKIE, token, { ...cookieOpts(), maxAge: MAX_AGE_S * 1000 });
}

/*
 * Pages on gratoglobal.com and the API on api.gratoglobal.com count as the same site, so
 * the default 'lax' cookie works. Only if the API runs on a different domain (for example
 * *.vercel.app) set COOKIE_SAMESITE=none; some browsers (Safari) may still block it.
 */
function cookieOpts() {
  const none = String(process.env.COOKIE_SAMESITE || '').toLowerCase() === 'none';
  return { httpOnly: true, sameSite: none ? 'none' : 'lax', secure: none || process.env.NODE_ENV === 'production', path: '/' };
}

export const clearSession = (res) => res.clearCookie(COOKIE, cookieOpts());

/** Attach req.user when a valid session cookie is present. Never throws. */
export async function loadUser(req, _res, next) {
  req.user = null;
  const token = req.cookies?.[COOKIE];
  if (!token) return next();
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = oid(payload.sub);
    if (id) {
      const db = await getDb();
      const u = await db.collection('users').findOne({ _id: id }, { projection: { passwordHash: 0 } });
      if (u && !u.disabled) req.user = u;
    }
  } catch { /* invalid or expired token: treat as signed out */ }
  next();
}

export function requireUser(req, _res, next) {
  if (!req.user) return next(new HttpError(401, 'Sign in to continue.', 'auth_required'));
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new HttpError(401, 'Sign in to continue.', 'auth_required'));
  if (!req.user.roles?.includes('admin')) return next(new HttpError(403, 'Admins only.', 'forbidden'));
  next();
}

/** The user fields that are safe to send to the browser. */
export function publicUser(u) {
  if (!u) return null;
  return {
    id: String(u._id), name: u.name, email: u.email, phone: u.phone || '', company: u.company || '',
    roles: u.roles || ['customer'],
    referral: u.referral ? { status: u.referral.status, code: u.referral.status === 'approved' ? u.referral.code : null } : { status: 'none' },
  };
}
