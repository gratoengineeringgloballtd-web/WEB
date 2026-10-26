/*
 * Where the API lives. Empty = same site as the pages (local development, where
 * Vite forwards /api to the API). For the live site the pages are on Hostinger and
 * the API on Vercel, so set VITE_API_URL=https://api.gratoglobal.com before `npm run build`.
 */
export const API_BASE = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const apiUrl = (path) => `${API_BASE}${path}`;
/** Send the sign-in cookie to the API, also when it is on another subdomain. */
export const CREDENTIALS = API_BASE ? 'include' : 'same-origin';
/** Uploaded photos stored by the API (/api/images/…) need the API's address in front. */
export const mediaUrl = (u) => (typeof u === 'string' && u.startsWith('/api/') ? apiUrl(u) : u);
