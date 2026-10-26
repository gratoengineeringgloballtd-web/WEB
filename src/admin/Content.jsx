import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../shop/core.jsx';
import { Loading, ErrorBox } from '../shop/parts.jsx';
import { SVCS, METRICS } from '../data/content.js';
import { photoSrc, refreshSite } from '../lib/site.jsx';
import { uploadPhoto } from './photos.js';
import { apiUrl } from '../lib/apiBase.js';

/*
 * Admin: website content editors (news, projects, jobs, partners, clients, offices)
 * and the inbox for quote requests and job applications.
 */
const dt = (x) => (x ? new Date(x).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const size = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const get = (o, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);
const setIn = (o, path, val) => {
  const [k, ...rest] = path.split('.');
  return { ...o, [k]: rest.length ? setIn(o?.[k] || {}, rest.join('.'), val) : val };
};
const plain = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\[\[|\]\]/g, '');

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    try { setData(await api(path)); setError(null); } catch (e) { setError(e); }
  }, [path]);
  useEffect(() => { setData(null); load(); }, [load]);
  return { data, error, load };
}

/* ---------------- field widgets ---------------- */
function PhotoField({ value, onChange, label, hint }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (f) => {
    if (!f) return;
    setBusy(true); setErr('');
    try { onChange(await uploadPhoto(f)); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <div className="field">
      <span className="ad-flabel">{label}</span>
      <div className="ad-photo">
        {value ? <img src={photoSrc(value)} alt="" /> : <span className="ad-photo-empty">No photo</span>}
        <div className="sh-btns">
          <label className="btn btn-line btn-sm ad-filebtn">{busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { pick(e.target.files[0]); e.target.value = ''; }} /></label>
          {value && <button type="button" className="btn btn-ghost btn-sm ad-danger" onClick={() => onChange('')}>Remove</button>}
        </div>
      </div>
      {hint && <small className="sh-hint">{hint}</small>}
      {err && <span className="msg">{err}</span>}
    </div>
  );
}

function PhotosField({ value = [], onChange, label }) {
  const [busy, setBusy] = useState(false);
  const add = async (files) => {
    setBusy(true);
    const urls = [];
    for (const f of [...files].slice(0, 12 - value.length)) { try { urls.push(await uploadPhoto(f)); } catch { /* skip */ } }
    onChange([...value, ...urls]);
    setBusy(false);
  };
  return (
    <div className="field">
      <span className="ad-flabel">{label}</span>
      <div className="ad-imgs">
        {value.map((u, i) => (
          <figure key={u + i}><img src={photoSrc(u)} alt="" /><figcaption><button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter((_, k) => k !== i))}>×</button></figcaption></figure>
        ))}
        {value.length < 12 && <label className="ad-upload"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { add(e.target.files); e.target.value = ''; }} /><span>{busy ? 'Uploading…' : '+ Add photos'}</span></label>}
      </div>
    </div>
  );
}

function Fieldx({ f, item, set }) {
  const id = `cf-${f.key.replace(/\./g, '-')}`;
  const v = get(item, f.key);
  const wide = f.wide ? ' ad-wide' : '';
  if (f.kind === 'bi' || f.kind === 'biArea') {
    const Tag = f.kind === 'biArea' ? 'textarea' : 'input';
    return (
      <div className={`ad-bi${wide}`}>
        {['en', 'fr'].map((l) => (
          <div className="field" key={l}>
            <label htmlFor={`${id}-${l}`}>{f.label} <span className="ad-lang">{l === 'en' ? 'English' : 'French'}</span></label>
            <Tag id={`${id}-${l}`} rows={f.rows || 4} value={get(item, `${f.key}.${l}`) || ''} onChange={(e) => set(`${f.key}.${l}`, e.target.value)} placeholder={l === 'fr' ? 'Leave empty to use the English text' : f.ph} />
          </div>
        ))}
        {f.hint && <small className="sh-hint">{f.hint}</small>}
      </div>
    );
  }
  if (f.kind === 'photo') return <div className={wide}><PhotoField label={f.label} hint={f.hint} value={v} onChange={(x) => set(f.key, x)} /></div>;
  if (f.kind === 'photos') return <div className="ad-wide"><PhotosField label={f.label} value={v || []} onChange={(x) => set(f.key, x)} /></div>;
  if (f.kind === 'check') return <label className={`sh-check${wide}`}><input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}</label>;
  if (f.kind === 'select') {
    return (
      <div className={`field${wide}`}>
        <label htmlFor={id}>{f.label}</label>
        <select id={id} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)}>{f.options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}</select>
        {f.hint && <small className="sh-hint">{f.hint}</small>}
      </div>
    );
  }
  if (f.kind === 'custom') return <div className={wide}>{f.render(item, set)}</div>;
  return (
    <div className={`field${wide}`}>
      <label htmlFor={id}>{f.label}</label>
      {f.kind === 'textarea'
        ? <textarea id={id} rows={f.rows || 3} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.ph} />
        : <input id={id} type={f.kind === 'number' ? 'number' : f.kind === 'date' ? 'date' : 'text'} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.ph} />}
      {f.hint && <small className="sh-hint">{f.hint}</small>}
    </div>
  );
}

/* ---------------- generic content editor ---------------- */
function CmsEditor({ type, title, intro, columns, fields, blank, viewUrl, itemName }) {
  const { data, error, load } = useLoad(`/admin/cms/${type}`);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const shown = useMemo(() => (data || []).filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase())), [data, q]);

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      if (edit.id) await api(`/admin/cms/${type}/${edit.id}`, { method: 'PUT', body: edit });
      else await api(`/admin/cms/${type}`, { method: 'POST', body: edit });
      refreshSite();
      setMsg(`${itemName} saved.`); setEdit(null); load();
    } catch (x) { setMsg(x.message); }
    setBusy(false);
  };
  const del = async () => {
    if (!window.confirm(`Delete this ${itemName.toLowerCase()}? This cannot be undone.`)) return;
    try { await api(`/admin/cms/${type}/${edit.id}`, { method: 'DELETE' }); refreshSite(); setMsg(`${itemName} deleted.`); setEdit(null); load(); } catch (x) { setMsg(x.message); }
  };
  const quickToggle = async (item) => {
    try { await api(`/admin/cms/${type}/${item.id}`, { method: 'PUT', body: { ...item, published: !item.published } }); refreshSite(); load(); } catch (x) { setMsg(x.message); }
  };

  if (edit) {
    const set = (k, v) => setEdit((x) => setIn(x, k, v));
    const url = edit.id && viewUrl?.(edit);
    return (
      <form onSubmit={save} className="ad-form">
        <button type="button" className="ad-back" onClick={() => { setEdit(null); setMsg(''); }}>← {title}</button>
        <div className="ad-title">
          <h1 className="ad-h1">{edit.id ? `Edit ${itemName.toLowerCase()}` : `New ${itemName.toLowerCase()}`}</h1>
          {url && <a className="link" href={url} target="_blank" rel="noreferrer">View on site →</a>}
        </div>
        {msg && <p className="sh-alert err" role="alert">{msg}</p>}
        <section className="form-card ad-grid">{fields.map((f) => <Fieldx key={f.key} f={f} item={edit} set={set} />)}</section>
        <div className="sh-btns ad-savebar">
          <button type="submit" className="btn btn-red" disabled={busy}>{busy ? 'Saving…' : edit.id ? 'Save changes' : `Create ${itemName.toLowerCase()}`}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
          {edit.id && <button type="button" className="btn btn-ghost ad-danger" onClick={del}>Delete</button>}
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="ad-title"><h1 className="ad-h1">{title}</h1><button type="button" className="btn btn-red btn-sm" onClick={() => { setMsg(''); setEdit(blank()); }}>Add {itemName.toLowerCase()}</button></div>
      {intro && <p className="sh-hint">{intro}</p>}
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      <div className="ad-bar"><input className="ad-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" /></div>
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (shown.length ? (
        <div className="sh-table-wrap">
          <table className="sh-table ad-table">
            <thead><tr>{columns.map(([h]) => <th key={h}>{h}</th>)}<th>Visible</th></tr></thead>
            <tbody>{shown.map((x) => (
              <tr key={x.id} className="ad-click" onClick={() => { setMsg(''); setEdit(x); }}>
                {columns.map(([h, fn], k) => <td key={h}>{k === 0 ? <button type="button" className="ad-linkbtn" onClick={(e) => { e.stopPropagation(); setEdit(x); }}>{fn(x) || '(untitled)'}</button> : fn(x)}</td>)}
                <td><button type="button" className={`ad-toggle${x.published !== false ? ' on' : ''}`} aria-pressed={x.published !== false} aria-label={x.published !== false ? 'Hide from site' : 'Show on site'} onClick={(e) => { e.stopPropagation(); quickToggle(x); }}><span /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="sh-empty">Nothing here yet.</p>)}
    </>
  );
}

const Thumb = ({ src }) => (src ? <img className="ad-thumb" src={photoSrc(src)} alt="" /> : <span className="ad-thumb" />);
const ORDER = { key: 'sort', label: 'Order on the page', kind: 'number', hint: 'Lower numbers show first.' };
const VISIBLE = { key: 'published', label: 'Visible on the website', kind: 'check' };
const TEXT_HINT = 'You can use <em>…</em> for italics. Text inside [[double brackets]] is marked “to confirm”.';

/* ---------------- news ---------------- */
export function NewsAdmin() {
  return (
    <CmsEditor
      type="news" title="News" itemName="Story"
      intro="Stories appear on the News page and on the home page, in the order set below. Add a full story to give it its own page."
      viewUrl={(x) => (x.body?.en ? `/news/${x.slug}` : '/news')}
      blank={() => ({ title: { en: '', fr: '' }, summary: { en: '', fr: '' }, body: { en: '', fr: '' }, cat: { en: 'Company', fr: 'Entreprise' }, date: new Date().toISOString().slice(0, 10), dateLabel: { en: '', fr: '' }, img: '', lead: false, published: true, sort: 10 })}
      columns={[['Headline', (x) => plain(x.title?.en)], ['Category', (x) => x.cat?.en], ['Date', (x) => x.dateLabel?.en || x.date || '—'], ['Photo', (x) => <Thumb src={x.img} />], ['Order', (x) => x.sort]]}
      fields={[
        { key: 'title', label: 'Headline', kind: 'bi', wide: true },
        { key: 'summary', label: 'Summary (shown on the cards)', kind: 'biArea', rows: 3, wide: true },
        { key: 'body', label: 'Full story (optional)', kind: 'biArea', rows: 10, wide: true, hint: `Leave empty for a short news item. Separate paragraphs with a blank line. ${TEXT_HINT}` },
        { key: 'cat', label: 'Category', kind: 'bi', ph: 'e.g. Partnership, On site, Products' },
        { key: 'date', label: 'Date', kind: 'date' },
        { key: 'dateLabel', label: 'Date text (optional, replaces the date)', kind: 'bi', ph: 'e.g. Sep 2025' },
        { key: 'img', label: 'Photo', kind: 'photo' },
        { key: 'lead', label: 'Lead story (shown first, with a large photo)', kind: 'check' },
        VISIBLE, ORDER,
        { key: 'slug', label: 'Web address', kind: 'text', hint: 'Made from the headline if left empty.' },
      ]}
    />
  );
}

/* ---------------- projects ---------------- */
const SVC_OPTS = SVCS.map((s) => [s.id, s.en.n]);
export function ProjectsAdmin() {
  return (
    <CmsEditor
      type="projects" title="Projects" itemName="Project"
      intro="Projects appear on the Projects page, the service pages and (with a case study) on the home page."
      viewUrl={(x) => (x.case && x.slug ? `/projects/${x.slug}` : '/projects')}
      blank={() => ({ title: { en: '', fr: '' }, summary: { en: '', fr: '' }, solution: { en: '', fr: '' }, challenge: { en: '', fr: '' }, result: { en: '', fr: '' }, scope: { en: '', fr: '' }, svc: 'telecom', country: 'cm', year: String(new Date().getFullYear()), where: '', client: '', img: '', images: [], metrics: ['', '', ''], case: true, published: true, sort: 10 })}
      columns={[['Title', (x) => plain(x.title?.en)], ['Service', (x) => SVCS.find((s) => s.id === x.svc)?.en.n], ['Where', (x) => plain(x.where)], ['Year', (x) => plain(x.year)], ['Photo', (x) => <Thumb src={x.img} />], ['Case study', (x) => (x.case ? 'Yes' : '—')]]}
      fields={[
        { key: 'title', label: 'Title', kind: 'bi', wide: true },
        { key: 'summary', label: 'Short description', kind: 'biArea', rows: 3, wide: true },
        { key: 'svc', label: 'Service line', kind: 'select', options: SVC_OPTS },
        { key: 'country', label: 'Country', kind: 'select', options: [['cm', 'Cameroon'], ['ng', 'Nigeria'], ['tbc', 'Other / not shown']] },
        { key: 'where', label: 'Location', kind: 'text', ph: 'e.g. Bonaberi, Douala' },
        { key: 'year', label: 'Year', kind: 'text' },
        { key: 'client', label: 'Client (only if approved for publication)', kind: 'text' },
        { key: 'img', label: 'Main photo', kind: 'photo' },
        { key: 'images', label: 'More photos (shown on the case study page)', kind: 'photos' },
        { key: 'case', label: 'Has a case study page', kind: 'check' },
        { key: 'challenge', label: 'Case study: the challenge', kind: 'biArea', rows: 5, wide: true },
        { key: 'solution', label: 'Case study: what Grato did', kind: 'biArea', rows: 5, wide: true },
        { key: 'result', label: 'Case study: the result', kind: 'biArea', rows: 5, wide: true, hint: 'Separate paragraphs with a blank line.' },
        { key: 'scope', label: 'Scope (one line)', kind: 'bi', wide: true },
        {
          key: 'metrics', kind: 'custom', wide: true,
          render: (item, set) => {
            const labels = (METRICS[item.svc] || METRICS.telecom).en;
            return (
              <div className="ad-g3">
                {labels.map((lab, k) => (
                  <div className="field" key={lab}><label htmlFor={`mt${k}`}>Key figure: {lab}</label>
                    <input id={`mt${k}`} value={item.metrics?.[k] || ''} onChange={(e) => { const a = [...(item.metrics || ['', '', ''])]; a[k] = e.target.value; set('metrics', a); }} placeholder="e.g. 21" /></div>
                ))}
              </div>
            );
          },
        },
        VISIBLE, ORDER,
        { key: 'slug', label: 'Web address of the case study', kind: 'text', hint: 'Made from the title if left empty.' },
      ]}
    />
  );
}

/* ---------------- partners, clients, offices ---------------- */
export function PartnersAdmin() {
  return (
    <>
      <CmsEditor
        type="partners" title="Partners" itemName="Partner"
        intro="Partners appear on the Partners page and the home page. Use a logo on a white or transparent background."
        viewUrl={() => '/partners'}
        blank={() => ({ name: '', type: 'partner', kind: { en: '', fr: '' }, desc: { en: '', fr: '' }, logo: '', published: true, sort: 100 })}
        columns={[['Name', (x) => x.name], ['Type', (x) => (x.type === 'finance' ? 'Financial partner' : 'Partner')], ['Field', (x) => x.kind?.en], ['Logo', (x) => <Thumb src={x.logo} />], ['Order', (x) => x.sort]]}
        fields={[
          { key: 'name', label: 'Name', kind: 'text' },
          { key: 'type', label: 'Type', kind: 'select', options: [['partner', 'Technology / industry partner'], ['finance', 'Financial partner']] },
          { key: 'kind', label: 'Field (short)', kind: 'bi', ph: 'e.g. Power systems' },
          { key: 'desc', label: 'Description', kind: 'biArea', rows: 3, wide: true },
          { key: 'logo', label: 'Logo', kind: 'photo' },
          VISIBLE, ORDER,
        ]}
      />
      <div className="ad-sep" />
      <CmsEditor
        type="clients" title="Clients" itemName="Client"
        intro="Client logos appear on the Partners page and the home page. Only list clients who have agreed to be named."
        viewUrl={() => '/partners'}
        blank={() => ({ name: '', sub: { en: '', fr: '' }, logo: '', published: true, sort: 100 })}
        columns={[['Name', (x) => x.name], ['Caption', (x) => x.sub?.en], ['Logo', (x) => <Thumb src={x.logo} />], ['Order', (x) => x.sort]]}
        fields={[
          { key: 'name', label: 'Name', kind: 'text' },
          { key: 'sub', label: 'Caption under the logo', kind: 'bi', ph: 'e.g. Mobile operator' },
          { key: 'logo', label: 'Logo', kind: 'photo' },
          VISIBLE, ORDER,
        ]}
      />
    </>
  );
}

export function OfficesAdmin() {
  return (
    <CmsEditor
      type="offices" title="Offices" itemName="Office"
      intro="Offices appear on the Contact page and in the footer."
      viewUrl={() => '/contact'}
      blank={() => ({ key: 'other', label: { en: '', fr: '' }, city: { en: '', fr: '' }, address: { en: '', fr: '' }, tel: '', email: '', hours: { en: '', fr: '' }, published: true, sort: 100 })}
      columns={[['City', (x) => x.city?.en], ['Role', (x) => ({ hq: 'Head office', ro: 'Regional office' }[x.key] || x.label?.en || 'Office')], ['Phone', (x) => x.tel], ['Order', (x) => x.sort]]}
      fields={[
        { key: 'key', label: 'Role', kind: 'select', options: [['hq', 'Head office'], ['ro', 'Regional office'], ['other', 'Other (use the tag below)']] },
        { key: 'label', label: 'Tag (optional, replaces the role name)', kind: 'bi', ph: 'e.g. Warehouse' },
        { key: 'city', label: 'City and country', kind: 'bi', ph: 'e.g. Douala, Cameroon' },
        { key: 'address', label: 'Address', kind: 'biArea', rows: 3, wide: true, hint: 'One line per row.' },
        { key: 'tel', label: 'Phone', kind: 'text' },
        { key: 'email', label: 'Email (optional)', kind: 'text', ph: 'info@gratoengineering.com' },
        { key: 'hours', label: 'Opening hours', kind: 'bi', ph: 'e.g. Mon–Fri, 8:00–17:00' },
        VISIBLE, ORDER,
      ]}
    />
  );
}

/* ---------------- careers: jobs + applications ---------------- */
const APP_STATUS = { new: 'New', reviewing: 'Reviewing', shortlisted: 'Shortlisted', interview: 'Interview', hired: 'Hired', rejected: 'Not selected' };
const ENQ_STATUS = { new: 'New', in_progress: 'In progress', quoted: 'Quote sent', closed: 'Closed' };
const Status = ({ s, map }) => <span className={`sh-pill ib-${s}`}>{map[s] || s}</span>;

export function CareersAdmin({ openId, go }) {
  const [view, setView] = useState(openId ? 'apps' : 'apps');
  return (
    <>
      <div className="ad-subtabs" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'apps'} onClick={() => setView('apps')}>Applications</button>
        <button type="button" role="tab" aria-selected={view === 'jobs'} onClick={() => setView('jobs')}>Job openings</button>
      </div>
      {view === 'apps' ? <Inbox box="applications" openId={openId} go={go} /> : (
        <CmsEditor
          type="jobs" title="Job openings" itemName="Job"
          intro="Open jobs are listed on the Careers page and in the application form. Untick “Visible” to close a job without deleting it."
          viewUrl={() => '/careers'}
          blank={() => ({ title: { en: '', fr: '' }, meta: { en: '', fr: '' }, description: { en: '', fr: '' }, published: true, sort: 10 })}
          columns={[['Job', (x) => x.title?.en], ['Location and type', (x) => x.meta?.en], ['Order', (x) => x.sort]]}
          fields={[
            { key: 'title', label: 'Job title', kind: 'bi', wide: true },
            { key: 'meta', label: 'Location and type', kind: 'bi', wide: true, ph: 'e.g. Douala · Full time' },
            { key: 'description', label: 'About the role (optional)', kind: 'biArea', rows: 8, wide: true, hint: 'Shown when visitors open the job. Separate paragraphs with a blank line.' },
            { ...VISIBLE, label: 'Open (shown on the careers page)' }, ORDER,
          ]}
        />
      )}
    </>
  );
}

export function EnquiriesAdmin({ openId, go }) {
  return <Inbox box="enquiries" openId={openId} go={go} />;
}

function Inbox({ box, openId, go }) {
  const isApps = box === 'applications';
  const map = isApps ? APP_STATUS : ENQ_STATUS;
  const tab = isApps ? 'careers' : 'inbox';
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  const path = `/admin/inbox/${box}?${new URLSearchParams({ ...(status ? { status } : {}), ...(query ? { q: query } : {}) })}`;
  const { data, error, load } = useLoad(path);
  if (openId) return <InboxItem box={box} id={openId} map={map} back={() => { go(tab); }} />;
  const counts = data?.counts || {};
  return (
    <>
      <h1 className="ad-h1">{isApps ? 'Job applications' : 'Quote requests'}</h1>
      <p className="sh-hint">{isApps ? 'Applications sent from the Careers page, with their CVs.' : 'Requests sent from the Contact / Get a quote form, with any attached files.'}</p>
      <div className="ad-statuses">
        <button type="button" aria-pressed={!status} onClick={() => setStatus('')}><b>All</b></button>
        {Object.entries(map).map(([k, v]) => <button type="button" key={k} aria-pressed={status === k} onClick={() => setStatus(k)}><Status s={k} map={map} /><b>{counts[k] || 0}</b><span className="sr-only">{v}</span></button>)}
      </div>
      <form className="ad-search" onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={isApps ? 'Name, email, job or reference' : 'Name, company, email or reference'} aria-label="Search" />
        <button className="btn btn-line btn-sm" type="submit">Search</button>
      </form>
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (data.items.length ? (
        <div className="sh-table-wrap">
          <table className="sh-table ad-table">
            <thead><tr><th>{isApps ? 'Applicant' : 'From'}</th><th>{isApps ? 'Job' : 'Service'}</th><th>Received</th><th>{isApps ? 'CV' : 'Files'}</th><th>Status</th></tr></thead>
            <tbody>{data.items.map((x) => (
              <tr key={x.id} className={`ad-click${x.status === 'new' ? ' ad-unread' : ''}`} onClick={() => go(tab, { id: x.id })}>
                <td><button type="button" className="ad-linkbtn" onClick={(e) => { e.stopPropagation(); go(tab, { id: x.id }); }}>{x.name}</button><small>{isApps ? x.email : [x.company, x.email].filter(Boolean).join(' · ')}</small></td>
                <td>{isApps ? x.jobTitle : x.service}<small className="mono">{x.ref}</small></td>
                <td>{dt(x.createdAt)}</td>
                <td>{isApps ? (x.cv ? 'Attached' : '—') : (x.files?.length ? `${x.files.length} file${x.files.length > 1 ? 's' : ''}` : '—')}</td>
                <td><Status s={x.status} map={map} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="sh-empty">Nothing here.</p>)}
    </>
  );
}

const COUNTRY = { Cameroon: 'Cameroon', Nigeria: 'Nigeria', Other: 'Other' };
const TIME = { asap: 'As soon as possible', '1-3': 'In 1–3 months', '3-6': 'In 3–6 months', plan: 'Planning / budgeting' };

function InboxItem({ box, id, map, back }) {
  const isApps = box === 'applications';
  const { data: x, error, load } = useLoad(`/admin/inbox/${box}/${id}`);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => { if (x) setNotes(x.notes || ''); }, [x]);
  // Opening a new item marks it as being looked at.
  useEffect(() => {
    if (x?.status === 'new') api(`/admin/inbox/${box}/${id}`, { method: 'PATCH', body: { status: isApps ? 'reviewing' : 'in_progress' } }).then(load).catch(() => {});
  }, [x?.status]); // eslint-disable-line react-hooks/exhaustive-deps
  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!x) return <Loading />;
  const patch = async (body, ok) => { try { await api(`/admin/inbox/${box}/${id}`, { method: 'PATCH', body }); setMsg(ok); load(); } catch (e) { setMsg(e.message); } };
  const del = async () => {
    if (!window.confirm(`Delete this ${isApps ? 'application and its CV' : 'request and its files'}? This cannot be undone.`)) return;
    try { await api(`/admin/inbox/${box}/${id}`, { method: 'DELETE' }); back(); } catch (e) { setMsg(e.message); }
  };
  const wa = x.phone ? `https://wa.me/${x.phone.replace(/\D/g, '')}` : null;
  const subject = isApps ? `Your application to Grato Engineering (${x.ref})` : `Your request to Grato Engineering (${x.ref})`;

  return (
    <>
      <button type="button" className="ad-back" onClick={back}>← {isApps ? 'All applications' : 'All requests'}</button>
      <div className="ad-title"><h1 className="ad-h1">{x.name}</h1><Status s={x.status} map={map} /></div>
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      <div className="ad-detail">
        <div className="ad-col">
          <section className="form-card ad-kv">
            <h2 className="sub-h">{isApps ? 'Application' : 'Request'} · <span className="mono">{x.ref}</span></h2>
            {isApps ? (
              <dl className="ad-dl">
                <dt>Job</dt><dd>{x.jobTitle}</dd>
                <dt>Received</dt><dd>{dt(x.createdAt)}</dd>
                <dt>Language</dt><dd>{x.lang === 'fr' ? 'French' : 'English'}</dd>
                {x.message && <><dt>Message</dt><dd className="ad-pre">{x.message}</dd></>}
              </dl>
            ) : (
              <dl className="ad-dl">
                <dt>Service</dt><dd>{x.service || '—'}</dd>
                <dt>Country</dt><dd>{COUNTRY[x.country] || x.country || '—'}</dd>
                <dt>Site / location</dt><dd>{x.site || '—'}</dd>
                <dt>Timeline</dt><dd>{TIME[x.time] || x.time || '—'}</dd>
                <dt>Received</dt><dd>{dt(x.createdAt)}</dd>
                <dt>Language</dt><dd>{x.lang === 'fr' ? 'French' : 'English'}</dd>
                <dt>Details</dt><dd className="ad-pre">{x.details || '—'}</dd>
              </dl>
            )}
          </section>
          <section className="form-card">
            <h2 className="sub-h">{isApps ? 'CV' : 'Attached files'}</h2>
            {x.fileList.length ? (
              <ul className="ad-files">{x.fileList.map((f) => (
                <li key={f.id}><a className="btn btn-line btn-sm" href={apiUrl(`/api/admin/files/${f.id}`)} download={f.name}>Download</a><span>{f.name}</span><small>{size(f.size)}</small></li>
              ))}</ul>
            ) : <p className="sh-hint">No files.</p>}
          </section>
        </div>
        <aside className="ad-col">
          <section className="form-card ad-kv">
            <h2 className="sub-h">Contact</h2>
            <p><b>{x.name}</b>{x.company && <> · {x.company}</>}</p>
            <p><a href={`mailto:${x.email}?subject=${encodeURIComponent(subject)}`}>{x.email}</a></p>
            {x.phone && <p>{x.phone}</p>}
            <div className="sh-btns">
              <a className="btn btn-red btn-sm" href={`mailto:${x.email}?subject=${encodeURIComponent(subject)}`}>Reply by email</a>
              {wa && <a className="btn btn-line btn-sm" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
            </div>
          </section>
          <section className="form-card">
            <h2 className="sub-h">Status</h2>
            <div className="ad-statusbtns">{Object.entries(map).map(([k, v]) => <button key={k} type="button" aria-pressed={x.status === k} onClick={() => patch({ status: k }, `Marked “${v}”.`)}>{v}</button>)}</div>
            <div className="field"><label htmlFor="ib-notes">Internal notes</label><textarea id="ib-notes" rows="5" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="sh-btns">
              <button type="button" className="btn btn-line btn-sm" onClick={() => patch({ notes }, 'Notes saved.')}>Save notes</button>
              <button type="button" className="btn btn-ghost btn-sm ad-danger" onClick={del}>Delete</button>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
