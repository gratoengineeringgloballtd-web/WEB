import { v2 as cloudinary } from 'cloudinary';

/*
 * Cloudinary storage for photos (public) and form files such as CVs (private).
 * Browsers upload straight to Cloudinary with a short-lived signature from this
 * server, so files never pass through Vercel (whose requests are limited to ~4.5 MB).
 *
 * Settings: CLOUDINARY_URL=cloudinary://<api key>:<api secret>@<cloud name>
 * or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.
 * Without them the site keeps storing files in MongoDB, as before.
 */
let ready = false;
function creds() {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url.trim());
    if (m) return { api_key: m[1], api_secret: m[2], cloud_name: m[3].split('?')[0] };
  }
  const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
  return cloud_name && api_key && api_secret ? { cloud_name, api_key, api_secret } : null;
}

export const cloudOn = () => Boolean(creds());

function cfg() {
  const c = creds();
  if (!c) throw Object.assign(new Error('Cloudinary is not configured'), { status: 500 });
  // CLOUDINARY_UPLOAD_PREFIX is only for tests against a local stand-in for Cloudinary.
  if (!ready) { cloudinary.config({ ...c, secure: true, ...(process.env.CLOUDINARY_UPLOAD_PREFIX ? { upload_prefix: process.env.CLOUDINARY_UPLOAD_PREFIX } : {}) }); ready = true; }
  return c;
}

const ROOT = () => (process.env.CLOUDINARY_FOLDER || 'grato').replace(/[^\w/-]/g, '');

/**
 * Signed parameters for one browser upload.
 * kind 'photo' → public image; kind 'file' → private (authenticated) raw file.
 */
export function signUpload({ kind, publicId, folder }) {
  const c = cfg();
  const isPhoto = kind === 'photo';
  // Private files get their full path in public_id (works in fixed and dynamic folder modes).
  const params = isPhoto
    ? { timestamp: Math.round(Date.now() / 1000), folder: `${ROOT()}/${folder}`, allowed_formats: 'jpg,jpeg,png,webp' }
    : { timestamp: Math.round(Date.now() / 1000), public_id: `${ROOT()}/${folder}/${publicId}`, type: 'authenticated' };
  const fields = cloudinary.utils.sign_request(params, { api_key: c.api_key, api_secret: c.api_secret });
  const base = process.env.CLOUDINARY_UPLOAD_PREFIX || 'https://api.cloudinary.com';
  return { url: `${base}/v1_1/${c.cloud_name}/${isPhoto ? 'image' : 'raw'}/upload`, fields };
}

/** Details of a private file after the browser has uploaded it (null if missing). */
export async function privateFile(publicId) {
  cfg();
  try {
    return await cloudinary.api.resource(publicId, { resource_type: 'raw', type: 'authenticated' });
  } catch (e) {
    if (e?.error?.http_code === 404 || e?.http_code === 404) return null;
    throw e;
  }
}

/** A download link for a private file, valid for 10 minutes. */
export function privateDownloadUrl(publicId) {
  cfg();
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw', type: 'authenticated', attachment: true, expires_at: Math.round(Date.now() / 1000) + 600,
  });
}

export async function destroyPrivate(publicId) {
  cfg();
  try { await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', type: 'authenticated', invalidate: true }); }
  catch (e) { console.error('Cloudinary delete failed', publicId, e?.message || e); }
}

/** Is this a photo URL from our own Cloudinary account? */
export function isOurPhoto(url) {
  const c = creds();
  return Boolean(c && typeof url === 'string' && url.startsWith(`https://res.cloudinary.com/${c.cloud_name}/image/upload/`));
}
