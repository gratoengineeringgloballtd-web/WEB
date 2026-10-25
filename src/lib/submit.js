/**
 * Website forms are sent to the site's own API and land in the admin dashboard
 * (Inbox for quote requests, Careers for applications).
 * Files are uploaded first, in chunks of up to 2 MB (serverless requests are
 * limited in size), then the form is sent with references to the uploaded files.
 */
export const formIsLive = true;

async function post(path, body) {
  const res = await fetch(`/api${path}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), { status: res.status, code: data?.code });
  return data;
}

const toBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] || '');
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

/** POST a file straight to a storage service (Cloudinary) with progress. */
export function directUpload(url, fields, file, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(Object.assign(new Error(data?.error?.message || `Upload failed (${xhr.status})`), { status: 400 }));
    };
    xhr.onerror = () => reject(Object.assign(new Error('network'), { status: 0 }));
    xhr.send(fd);
  });
}

/** Upload one file; returns { id, token } to send with the form. */
export async function uploadFile(file, purpose, onProgress) {
  const start = await post('/uploads', { name: file.name, size: file.size, type: file.type, purpose });
  const { id, token, chunkSize } = start;
  if (start.mode === 'cloudinary') {
    await directUpload(start.upload.url, start.upload.fields, file, onProgress);
    await post(`/uploads/${id}/complete`, { token });
    return { id, token };
  }
  for (let n = 0, off = 0; off < file.size; n += 1, off += chunkSize) {
    const data = await toBase64(file.slice(off, off + chunkSize));
    await post(`/uploads/${id}/chunk`, { token, n, data });
    onProgress?.(Math.min(1, (off + chunkSize) / file.size));
  }
  return { id, token };
}

/** kind = 'quote' | 'careers'. Returns { ref }. */
export async function submitForm(kind, fields, files = [], onProgress) {
  const purpose = kind === 'careers' ? 'cv' : 'quote';
  const total = files.reduce((s, f) => s + f.size, 0) || 1;
  let done = 0;
  const uploaded = [];
  for (const f of files) {
    uploaded.push(await uploadFile(f, purpose, (k) => onProgress?.((done + k * f.size) / total)));
    done += f.size;
  }
  if (kind === 'careers') return post('/forms/careers', { ...fields, cv: uploaded[0] });
  return post('/forms/quote', { lang: fields.language, fields, files: uploaded, website: fields.website || '' });
}

export const makeRef = (prefix = 'GR') =>
  `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 900) + 100)}`;
