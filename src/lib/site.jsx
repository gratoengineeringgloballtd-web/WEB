import { createContext, useContext, useEffect, useState } from 'react';
import { NEWS, PROJECTS, JOBS, PARTNERS, CLIENTS, OFFICES, LOGO, STRINGS } from '../data/content.js';
import { asset } from './ui.jsx';
import { apiUrl, CREDENTIALS, mediaUrl } from './apiBase.js';

/*
 * Website content edited in the admin dashboard (news, projects, jobs, partners,
 * clients, offices). Pages start with the built-in content from content.js, then
 * switch to the live content from /api/site as soon as it arrives. If the API
 * cannot be reached, the built-in content stays on screen.
 */
const logoPath = (name) => (LOGO[name] ? `/img/logos/${LOGO[name]}.webp` : '');

export const STATIC_SITE = {
  news: NEWS.map((n, i) => ({ ...n, id: `s${i}`, slug: '', body: null })),
  projects: PROJECTS.map((p, i) => ({ ...p, id: `s${i}`, images: [], client: '', metrics: [] })),
  jobs: JOBS.map((j, i) => ({ ...j, id: `s${i}`, desc: null })),
  partners: [
    ...PARTNERS.map((p) => ({ name: p[0], type: 'partner', kind: { en: p[1], fr: p[3] }, desc: { en: p[2], fr: p[4] }, logo: logoPath(p[0]) })),
    { name: 'Access Bank Cameroon', type: 'finance', kind: { en: STRINGS.en.paFinanceKind, fr: STRINGS.fr.paFinanceKind }, desc: { en: STRINGS.en.paFinanceText, fr: STRINGS.fr.paFinanceText }, logo: logoPath('Access Bank Cameroon') },
  ],
  clients: CLIENTS.map((c) => ({ name: c, sub: { en: 'Mobile operator', fr: 'Opérateur mobile' }, logo: logoPath(c) })),
  offices: OFFICES.map((o) => ({ ...o, tag: null, email: '', hours: null })),
  live: false,
};

let cache = null;
let pending = null;
const load = () => {
  if (!pending) {
    pending = fetch(apiUrl('/api/site'), { credentials: CREDENTIALS })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { cache = { ...d, live: true }; return cache; })
      .catch(() => { pending = null; return null; });
  }
  return pending;
};
/** Called by the admin dashboard after a change, so the next page view is fresh. */
export const refreshSite = () => { cache = null; pending = null; };

const SiteCtx = createContext(STATIC_SITE);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(cache || STATIC_SITE);
  useEffect(() => {
    let live = true;
    load().then((d) => { if (live && d) setSite(d); });
    return () => { live = false; };
  }, []);
  return <SiteCtx.Provider value={site}>{children}</SiteCtx.Provider>;
}

export const useSite = () => useContext(SiteCtx);

/** Photo URL for a project/news photo: a site photo name ("solar-tower") or an uploaded photo URL. */
export function photoSrc(img) {
  if (!img) return null;
  if (/^(https?:|\/api\/)/.test(img)) return mediaUrl(img);
  if (img.startsWith('/')) return asset(img);
  return asset(`img/${img}.webp`);
}
export const logoSrc = (logo) => (logo ? photoSrc(logo) : null);
