import { api } from '../shop/core.jsx';
import { directUpload } from '../lib/submit.js';

/*
 * Upload a photo from the admin dashboard. The browser resizes it first.
 * With Cloudinary configured on the server, it goes straight to Cloudinary and the
 * returned address is optimised on delivery (automatic format and quality);
 * otherwise it is stored in the database as before.
 */
export async function resizeToDataUrl(file, max = 1800) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  let url = c.toDataURL('image/webp', 0.84);
  if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.86);
  return url;
}

const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

export async function uploadPhoto(file, max = 1800) {
  const dataUrl = await resizeToDataUrl(file, max);
  const sign = await api('/admin/images/sign', { method: 'POST', body: {} });
  if (sign.mode === 'cloudinary') {
    const blob = await dataUrlToBlob(dataUrl);
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const out = await directUpload(sign.upload.url, sign.upload.fields, new File([blob], `photo.${ext}`, { type: blob.type }));
    // Deliver in the best format and quality for each browser.
    return String(out.secure_url).replace('/image/upload/', '/image/upload/f_auto,q_auto/');
  }
  const { url } = await api('/admin/images', { method: 'POST', body: { dataUrl } });
  return url;
}
