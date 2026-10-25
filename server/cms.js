import { getDb } from './db.js';
import { bad, str, int } from './http.js';
import * as SEED from '../src/data/content.js';

/*
 * Website content that admins edit: news, projects, job openings, partners,
 * clients and offices. Each collection stores an admin-friendly shape; `out`
 * converts it to the shape the website pages already use (the same shape as
 * src/data/content.js, which stays as the offline fallback).
 *
 * The first time the content is read, the current content of content.js is
 * imported, so the site looks the same until an admin changes something.
 */

const LANGS = ['en', 'fr'];
// Text may keep <em>, <strong>, <b> and <br>; any other "<" is shown as text, not HTML.
const clean = (s) => s.replace(/<\/?[a-z][^>]*>/gi, (m) => (/^<\/?(em|strong|b|br)\s*\/?>$/i.test(m) ? m : '')).replace(/<(?!\/?(?:em|strong|b|br)\s*\/?>)/gi, '&lt;');
const T = (v, max) => clean(str(v, max));
const L = (o, max = 300) => {
  const en = T(o?.en, max);
  return { en, fr: T(o?.fr, max) || en };
};
const bool = (v, d = false) => (v === undefined ? d : Boolean(v));
const slugify = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\[\[|\]\]/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = (s) => esc(s).replace(/\r?\n/g, '<br>');
const unlines = (s) => String(s ?? '').replace(/<br\s*\/?>/gi, '\n');
const img = (v) => {
  const s = str(v, 300);
  if (!s) return '';
  if (/^(\/api\/images\/[a-f0-9]{24}|\/img\/[\w./-]+|https:\/\/[\w.-]+\/[^\s"'<>]*)$/i.test(s)) return s;
  if (/^[\w-]+$/.test(s)) return s; // name of a photo in public/img (e.g. "solar-tower")
  throw bad('Photo must be an uploaded photo or a site photo name.');
};
const SVCS = SEED.SVCS.map((s) => s.id);
const fmtDate = (iso, lang) => {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(iso || '')) return '';
  const d = new Date(iso.length === 7 ? `${iso}-01` : iso);
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', iso.length === 7 ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' });
};

export const TYPES = {
  news: {
    sort: { sort: 1, date: -1, createdAt: -1 },
    input(b) {
      const title = L(b.title, 200);
      if (!title.en) throw bad('Enter the headline.');
      return {
        slug: slugify(b.slug || title.en), lead: bool(b.lead), img: img(b.img), cat: L(b.cat, 60),
        date: /^\d{4}-\d{2}(-\d{2})?$/.test(b.date || '') ? b.date : '', dateLabel: L(b.dateLabel, 40),
        title, summary: L(b.summary, 600), body: L(b.body, 20000), published: bool(b.published, true), sort: int(b.sort) ?? 100,
      };
    },
    out(n) {
      return {
        id: String(n._id), slug: n.slug, lead: n.lead, img: n.img || null, cat: [n.cat.en, n.cat.fr],
        date: n.dateLabel?.en || fmtDate(n.date, 'en'), datefr: n.dateLabel?.fr || fmtDate(n.date, 'fr'),
        en: [n.title.en, n.summary.en], fr: [n.title.fr, n.summary.fr],
        body: (n.body?.en || n.body?.fr) ? { en: n.body.en, fr: n.body.fr } : null,
      };
    },
    seed: () => SEED.NEWS.map((n, i) => ({
      slug: slugify(n.en[0]), lead: Boolean(n.lead), img: n.img || '', cat: { en: n.cat[0], fr: n.cat[1] },
      date: '', dateLabel: { en: n.date || '', fr: n.datefr || n.date || '' },
      title: { en: n.en[0], fr: n.fr[0] }, summary: { en: n.en[1], fr: n.fr[1] }, body: { en: '', fr: '' }, published: true, sort: (i + 1) * 10,
    })),
  },

  projects: {
    sort: { sort: 1, createdAt: -1 },
    input(b) {
      const title = L(b.title, 200);
      if (!title.en) throw bad('Enter the project title.');
      if (!SVCS.includes(b.svc)) throw bad('Choose a service line.');
      const isCase = bool(b.case);
      const slug = slugify(b.slug || (isCase ? title.en : ''));
      return {
        slug, img: img(b.img), images: (Array.isArray(b.images) ? b.images : []).slice(0, 12).map(img).filter(Boolean),
        svc: b.svc, country: ['cm', 'ng', 'tbc'].includes(b.country) ? b.country : 'tbc', year: T(b.year, 20), where: T(b.where, 160),
        case: isCase, client: T(b.client, 120),
        title, summary: L(b.summary, 600), solution: L(b.solution, 6000), challenge: L(b.challenge, 6000), result: L(b.result, 6000), scope: L(b.scope, 400),
        metrics: (Array.isArray(b.metrics) ? b.metrics : []).slice(0, 3).map((m) => T(m, 40)),
        published: bool(b.published, true), sort: int(b.sort) ?? 100,
      };
    },
    out(p) {
      const side = (l) => ({ t: p.title[l], d: p.summary[l], sol: p.solution[l], ch: p.challenge?.[l] || '', res: p.result?.[l] || '', scope: p.scope?.[l] || '' });
      return {
        id: String(p._id), slug: p.slug || '', img: p.img || null, images: p.images || [], svc: p.svc, country: p.country, year: p.year, where: p.where,
        case: Boolean(p.case && p.slug), client: p.client || '', metrics: p.metrics || [], en: side('en'), fr: side('fr'),
      };
    },
    seed: () => SEED.PROJECTS.map((p, i) => ({
      slug: p.slug || '', img: p.img || '', images: [], svc: p.svc, country: p.country, year: p.year, where: p.where, case: Boolean(p.case), client: '',
      title: { en: p.en.t, fr: p.fr.t }, summary: { en: p.en.d, fr: p.fr.d }, solution: { en: p.en.sol || '', fr: p.fr.sol || '' },
      challenge: { en: '', fr: '' }, result: { en: '', fr: '' }, scope: { en: '', fr: '' }, metrics: [], published: true, sort: (i + 1) * 10,
    })),
  },

  jobs: {
    sort: { sort: 1, createdAt: -1 },
    input(b) {
      const title = L(b.title, 160);
      if (!title.en) throw bad('Enter the job title.');
      return { title, meta: L(b.meta, 120), description: L(b.description, 8000), published: bool(b.published, true), sort: int(b.sort) ?? 100 };
    },
    out: (j) => ({ id: String(j._id), en: [j.title.en, j.meta.en], fr: [j.title.fr, j.meta.fr], desc: (j.description?.en || j.description?.fr) ? j.description : null }),
    seed: () => SEED.JOBS.map((j, i) => ({ title: { en: j.en[0], fr: j.fr[0] }, meta: { en: j.en[1], fr: j.fr[1] }, description: { en: '', fr: '' }, published: true, sort: (i + 1) * 10 })),
  },

  partners: {
    sort: { sort: 1, createdAt: 1 },
    input(b) {
      const name = str(b.name, 120);
      if (!name) throw bad('Enter the partner name.');
      return { name, type: b.type === 'finance' ? 'finance' : 'partner', kind: L(b.kind, 80), desc: L(b.desc, 600), logo: img(b.logo), published: bool(b.published, true), sort: int(b.sort) ?? 100 };
    },
    out: (p) => ({ id: String(p._id), name: p.name, type: p.type, kind: p.kind, desc: p.desc, logo: p.logo || '' }),
    seed: () => [
      ...SEED.PARTNERS.map((p, i) => ({ name: p[0], type: 'partner', kind: { en: p[1], fr: p[3] }, desc: { en: p[2], fr: p[4] }, logo: SEED.LOGO[p[0]] ? `/img/logos/${SEED.LOGO[p[0]]}.webp` : '', published: true, sort: (i + 1) * 10 })),
      { name: 'Access Bank Cameroon', type: 'finance', kind: { en: SEED.STRINGS.en.paFinanceKind || 'Financial partner', fr: SEED.STRINGS.fr.paFinanceKind || 'Partenaire financier' }, desc: { en: SEED.STRINGS.en.paFinanceText || '', fr: SEED.STRINGS.fr.paFinanceText || '' }, logo: '/img/logos/access.webp', published: true, sort: 1000 },
    ],
  },

  clients: {
    sort: { sort: 1, createdAt: 1 },
    input(b) {
      const name = str(b.name, 120);
      if (!name) throw bad('Enter the client name.');
      return { name, sub: L(b.sub, 80), logo: img(b.logo), published: bool(b.published, true), sort: int(b.sort) ?? 100 };
    },
    out: (c) => ({ id: String(c._id), name: c.name, sub: c.sub, logo: c.logo || '' }),
    seed: () => SEED.CLIENTS.map((c, i) => ({ name: c, sub: { en: 'Mobile operator', fr: 'Opérateur mobile' }, logo: SEED.LOGO[c] ? `/img/logos/${SEED.LOGO[c]}.webp` : '', published: true, sort: (i + 1) * 10 })),
  },

  offices: {
    sort: { sort: 1, createdAt: 1 },
    input(b) {
      const city = L(b.city, 120);
      if (!city.en) throw bad('Enter the city and country.');
      return {
        key: ['hq', 'ro'].includes(b.key) ? b.key : 'other', label: L(b.label, 60), city, address: L(b.address, 400),
        tel: str(b.tel, 40), email: str(b.email, 120), hours: L(b.hours, 120), published: bool(b.published, true), sort: int(b.sort) ?? 100,
      };
    },
    out: (o) => ({
      id: String(o._id), k: o.key, tag: o.label?.en ? [o.label.en, o.label.fr] : null, h: o.city.en, hfr: o.city.fr,
      a: lines(o.address.en), afr: lines(o.address.fr), tel: o.tel, email: o.email || '', hours: o.hours?.en ? [o.hours.en, o.hours.fr] : null,
    }),
    seed: () => SEED.OFFICES.map((o, i) => ({
      key: o.k, label: { en: '', fr: '' }, city: { en: o.h, fr: o.hfr }, address: { en: unlines(o.a), fr: unlines(o.afr) }, tel: o.tel, email: '', hours: { en: '', fr: '' }, published: true, sort: (i + 1) * 10,
    })),
  },
};

let imported = null;
/** Import content.js into the database once (only into empty collections). */
export function ensureImported() {
  if (!imported) {
    imported = (async () => {
      const db = await getDb();
      if (await db.collection('settings').findOne({ _id: 'cms' })) return; // imported earlier
      for (const [type, cfg] of Object.entries(TYPES)) {
        const coll = db.collection(type);
        if ((await coll.countDocuments()) === 0) {
          const now = new Date();
          const docs = cfg.seed().map((d) => ({ ...d, createdAt: now, updatedAt: now }));
          if (docs.length) await coll.insertMany(docs);
        }
      }
      await db.collection('settings').updateOne({ _id: 'cms' }, { $set: { importedAt: new Date() } }, { upsert: true });
      await Promise.all([
        db.collection('news').createIndex({ slug: 1 }),
        db.collection('projects').createIndex({ slug: 1 }),
      ]);
    })().catch((e) => { imported = null; throw e; });
  }
  return imported;
}

/** Everything the public pages need, in the shapes the pages use. */
export async function siteContent() {
  await ensureImported();
  const db = await getDb();
  const get = (t) => db.collection(t).find({ published: { $ne: false } }).sort(TYPES[t].sort).limit(500).toArray();
  const [news, projects, jobs, partners, clients, offices] = await Promise.all(['news', 'projects', 'jobs', 'partners', 'clients', 'offices'].map(get));
  return {
    news: news.map(TYPES.news.out), projects: projects.map(TYPES.projects.out), jobs: jobs.map(TYPES.jobs.out),
    partners: partners.map(TYPES.partners.out), clients: clients.map(TYPES.clients.out), offices: offices.map(TYPES.offices.out),
  };
}

export { LANGS };
