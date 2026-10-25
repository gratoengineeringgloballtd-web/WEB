import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../lib/ui.jsx';
import { useShop, api, money, L, imgSrc, resetProductsCache } from '../shop/core.jsx';
import { AuthCard } from '../shop/Account.jsx';
import { Loading, ErrorBox } from '../shop/parts.jsx';
import '../styles/admin.css';
import { uploadPhoto } from './photos.js';
import { NewsAdmin, ProjectsAdmin, PartnersAdmin, OfficesAdmin, CareersAdmin, EnquiriesAdmin } from './Content.jsx';

/*
 * Grato admin dashboard (English). Everything here calls /api/admin/*,
 * which checks the admin role on the server for every request.
 */
const NAV = [
  [null, [['overview', 'Overview']]],
  ['Website', [['inbox', 'Quote requests'], ['careers', 'Careers & CVs'], ['news', 'News'], ['projects', 'Projects'], ['partners', 'Partners & clients'], ['offices', 'Offices']]],
  ['Shop', [['orders', 'Orders'], ['products', 'Products'], ['referrers', 'Referrers'], ['commissions', 'Commissions'], ['payouts', 'Payouts']]],
  ['Admin', [['team', 'Team'], ['settings', 'Shop settings']]],
];
const TABS = NAV.flatMap(([, items]) => items);
const STATUS_LABEL = {
  pending_payment: 'Awaiting payment', awaiting_quote: 'Quote requested', quoted: 'Quoted', paid: 'Paid', processing: 'Processing',
  ready: 'Ready / shipped', completed: 'Completed', cancelled: 'Cancelled', refunded: 'Refunded',
};
const CATS = { generators: 'Generators', 'spare-parts': 'Spare parts', power: 'Power systems', telecom: 'Telecom equipment' };
const m = (n, c) => (n === null || n === undefined ? '—' : money(n, c, 'en'));
const d = (x) => (x ? new Date(x).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    try { setData(await api(path)); setError(null); } catch (e) { setError(e); }
  }, [path]);
  useEffect(() => { setData(null); load(); }, [load]);
  return { data, error, load, setData };
}

function Pill({ status }) { return <span className={`sh-pill st-${status} cs-${status} ps-${status}`}>{STATUS_LABEL[status] || status}</span>; }

export default function Admin() {
  const { user } = useShop();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'overview';
  usePageTitle('Admin');
  const go = (k, extra = {}) => setParams({ tab: k, ...extra });

  if (user === undefined) return <div className="wrap sh-pad"><Loading /></div>;
  if (!user) return <div className="wrap sh-pad ad-login"><h1 className="sh-h1">Grato admin</h1><AuthCard loginOnly /><p className="sh-hint">Admin accounts are created by an existing admin in the dashboard (Team).</p></div>;
  if (!user.roles?.includes('admin')) return <div className="wrap sh-pad"><div className="sh-alert err"><p>This account does not have admin access.</p></div></div>;

  return (
    <div className="ad">
      <div className="wrap ad-wrap">
        <nav className="ad-nav" aria-label="Admin">
          <p className="ad-brand">Grato admin</p>
          {NAV.map(([group, items]) => (
            <div className="ad-navgroup" key={group || 'main'}>
              {group && <p className="ad-navh">{group}</p>}
              {items.map(([k, label]) => <button key={k} type="button" aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>{label}</button>)}
            </div>
          ))}
          <a href="/" className="ad-site">View website →</a>
        </nav>
        <div className="ad-main">
          {tab === 'overview' && <Overview go={go} />}
          {tab === 'orders' && <Orders openId={params.get('id')} go={go} />}
          {tab === 'inbox' && <EnquiriesAdmin key={params.get('id') || 'list'} openId={params.get('id')} go={go} />}
          {tab === 'careers' && <CareersAdmin key={params.get('id') || 'list'} openId={params.get('id')} go={go} />}
          {tab === 'news' && <NewsAdmin />}
          {tab === 'projects' && <ProjectsAdmin />}
          {tab === 'partners' && <PartnersAdmin />}
          {tab === 'offices' && <OfficesAdmin />}
          {tab === 'products' && <Products />}
          {tab === 'referrers' && <Referrers />}
          {tab === 'commissions' && <Commissions />}
          {tab === 'payouts' && <Payouts />}
          {tab === 'team' && <Team me={user} />}
          {tab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- overview ---------------- */
function Overview({ go }) {
  const { data, error, load } = useLoad('/admin/summary');
  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!data) return <Loading />;
  const c = data.counts || {};
  return (
    <>
      <h1 className="ad-h1">Overview</h1>
      {data.samplePrices > 0 && (
        <div className="sh-alert warn"><p><b>{data.samplePrices} products still show sample prices.</b> Edit each price (or tick “Prices confirmed”) in Products before you launch the shop.</p><button type="button" className="btn btn-line btn-sm" onClick={() => go('products')}>Review products</button></div>
      )}
      <div className="ad-cards">
        {['NGN', 'XAF'].map((cur) => { const r = data.revenue.find((x) => x._id === cur); return <div className="ad-card" key={cur}><p>Paid sales, 30 days · {cur}</p><b>{m(r?.total || 0, cur)}</b><small>{r?.n || 0} orders</small></div>; })}
        <button type="button" className="ad-card act" onClick={() => go('inbox')}><p>New quote requests</p><b>{data.newEnquiries || 0}</b><small>from the website form</small></button>
        <button type="button" className="ad-card act" onClick={() => go('careers')}><p>New job applications</p><b>{data.newApplications || 0}</b><small>with CVs</small></button>
        <button type="button" className="ad-card act" onClick={() => go('orders', { status: 'awaiting_quote' })}><p>Shop quotes to prepare</p><b>{c.awaiting_quote || 0}</b><small>awaiting quote</small></button>
        <button type="button" className="ad-card act" onClick={() => go('orders', { status: 'paid' })}><p>Paid, to process</p><b>{c.paid || 0}</b><small>paid orders</small></button>
        <button type="button" className="ad-card act" onClick={() => go('referrers')}><p>Referrer applications</p><b>{data.pendingReferrers}</b><small>pending review</small></button>
        <button type="button" className="ad-card act" onClick={() => go('payouts')}><p>Payout requests</p><b>{data.pendingPayouts}</b><small>to pay</small></button>
        <div className="ad-card"><p>Low stock</p><b>{data.lowStock}</b><small>products with 2 or fewer</small></div>
      </div>
      <h2 className="ad-h2">Orders by status</h2>
      <div className="ad-statuses">{Object.entries(STATUS_LABEL).map(([k, v]) => <button type="button" key={k} onClick={() => go('orders', { status: k })}><Pill status={k} /><b>{c[k] || 0}</b><span className="sr-only">{v}</span></button>)}</div>
    </>
  );
}

/* ---------------- orders ---------------- */
function Orders({ openId, go }) {
  const [params] = useSearchParams();
  const status = params.get('status') || '';
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const path = `/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(query ? { q: query } : {}) })}`;
  const { data, error, load } = useLoad(path);
  if (openId) return <OrderDetail id={openId} back={() => go('orders', status ? { status } : {})} />;
  return (
    <>
      <h1 className="ad-h1">Orders</h1>
      <div className="ad-bar">
        <select value={status} onChange={(e) => go('orders', e.target.value ? { status: e.target.value } : {})} aria-label="Status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }} className="ad-search">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number, email or name" aria-label="Search orders" />
          <button className="btn btn-line btn-sm" type="submit">Search</button>
        </form>
      </div>
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (data.length ? (
        <div className="sh-table-wrap">
          <table className="sh-table ad-table">
            <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Type</th><th>Total</th><th>Referral</th><th>Status</th></tr></thead>
            <tbody>{data.map((o) => (
              <tr key={o.id} className="ad-click" onClick={() => go('orders', { id: o.id, ...(status ? { status } : {}) })}>
                <td className="mono"><button type="button" className="ad-linkbtn" onClick={(e) => { e.stopPropagation(); go('orders', { id: o.id }); }}>{o.number}</button></td>
                <td>{d(o.createdAt)}</td><td>{o.customer.name}<small>{o.customer.email}</small></td>
                <td>{o.checkout === 'online' ? 'Online' : 'Quote / invoice'}<small>{o.items} line{o.items === 1 ? '' : 's'}</small></td>
                <td><b>{m(o.total, o.currency)}</b></td><td className="mono">{o.referral || '—'}</td><td><Pill status={o.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="sh-empty">No orders.</p>)}
    </>
  );
}

const NEXT = {
  pending_payment: ['paid', 'cancelled'], awaiting_quote: ['paid', 'cancelled'], quoted: ['paid', 'cancelled'],
  paid: ['processing', 'ready', 'completed', 'refunded'], processing: ['ready', 'completed', 'refunded'], ready: ['completed', 'refunded'],
  completed: ['refunded'], cancelled: [], refunded: [],
};

function OrderDetail({ id, back }) {
  const { data: o, error, load } = useLoad(`/admin/orders/${id}`);
  const [prices, setPrices] = useState({});
  const [fee, setFee] = useState('');
  const [qnote, setQnote] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (!o) return;
    setPrices(Object.fromEntries(o.items.map((it, k) => [k, it.unitPrice ?? ''])));
    setFee(o.delivery?.fee ?? '');
    setQnote(o.quoteNote || '');
    setAdminNote(o.adminNote || '');
  }, [o]);

  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!o) return <Loading />;

  const act = async (fn, ok) => { setBusy(true); setMsg(''); try { await fn(); setMsg(ok); await load(); } catch (e) { setMsg(e.message); } setBusy(false); };
  const canQuote = ['awaiting_quote', 'quoted', 'pending_payment'].includes(o.status);
  const qSub = o.items.reduce((n, it, k) => n + (Number(prices[k]) || 0) * it.qty, 0);
  const setStatus = (status) => {
    if (['cancelled', 'refunded'].includes(status) && !window.confirm(`Mark ${o.number} as ${STATUS_LABEL[status].toLowerCase()}? Any referral commission will be reversed.`)) return;
    act(() => api(`/admin/orders/${o.id}/status`, { method: 'POST', body: { status, note } }), `Order marked ${STATUS_LABEL[status].toLowerCase()}.`);
    setNote('');
  };
  const customerLink = `${window.location.origin}/shop/order/${o.number}?t=${o.accessToken}`;

  return (
    <>
      <button type="button" className="ad-back" onClick={back}>← All orders</button>
      <div className="ad-title"><h1 className="ad-h1 mono">{o.number}</h1><Pill status={o.status} /></div>
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      <div className="ad-detail">
        <div className="ad-col">
          <section className="form-card">
            <h2 className="sub-h">Items {canQuote && '· set prices to send a quote'}</h2>
            <table className="sh-table ad-items">
              <thead><tr><th>Item</th><th>Qty</th><th>Unit price ({o.currency})</th><th>Line</th></tr></thead>
              <tbody>{o.items.map((it, k) => (
                <tr key={k}>
                  <td>{L(it.name, 'en')}<small>{it.sku}{it.mode === 'quote' ? ' · quote item' : ''}</small></td><td>{it.qty}</td>
                  <td>{canQuote ? <input type="number" min="0" value={prices[k] ?? ''} onChange={(e) => setPrices({ ...prices, [k]: e.target.value })} aria-label={`Unit price line ${k + 1}`} /> : m(it.unitPrice, o.currency)}</td>
                  <td>{canQuote ? m((Number(prices[k]) || 0) * it.qty, o.currency) : m(it.lineTotal, o.currency)}</td>
                </tr>
              ))}</tbody>
            </table>
            <dl className="sh-totals">
              <div><dt>Subtotal</dt><dd>{canQuote ? m(qSub, o.currency) : m(o.subtotal, o.currency)}</dd></div>
              <div><dt>Delivery · {L(o.delivery?.label, 'en')}</dt><dd>{canQuote ? <input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} aria-label="Delivery fee" /> : m(o.delivery?.fee, o.currency)}</dd></div>
              <div className="tot"><dt>Total</dt><dd>{canQuote ? m(qSub + (Number(fee) || 0), o.currency) : m(o.total, o.currency)}</dd></div>
            </dl>
            {canQuote && (
              <>
                <div className="field"><label htmlFor="qn">Message to the customer (shown on their order page)</label><textarea id="qn" rows="3" value={qnote} onChange={(e) => setQnote(e.target.value)} placeholder="Delivery in 5 working days. Price includes installation and commissioning." /></div>
                <button type="button" className="btn btn-red" disabled={busy} onClick={() => act(() => api(`/admin/orders/${o.id}/quote`, { method: 'POST', body: { unitPrices: prices, deliveryFee: fee, note: qnote } }), 'Quote saved. Send the customer their order link below.')}>
                  {o.status === 'quoted' ? 'Update quote' : 'Save quote'}
                </button>
              </>
            )}
          </section>
          <section className="form-card">
            <h2 className="sub-h">Status</h2>
            {NEXT[o.status].length ? (
              <>
                <div className="field"><label htmlFor="sn">Note or payment reference (optional)</label><input id="sn" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. bank transfer ref 4471…" /></div>
                <div className="sh-btns">{NEXT[o.status].map((st) => <button key={st} type="button" className={`btn btn-sm ${['cancelled', 'refunded'].includes(st) ? 'btn-ghost ad-danger' : st === 'paid' ? 'btn-red' : 'btn-line'}`} disabled={busy} onClick={() => setStatus(st)}>{st === 'paid' ? 'Mark paid (offline)' : `Mark ${STATUS_LABEL[st].toLowerCase()}`}</button>)}</div>
              </>
            ) : <p className="sh-hint">No further changes possible.</p>}
            <ol className="ad-history">{(o.history || []).slice().reverse().map((h, i) => <li key={i}><Pill status={h.status} /> <span>{d(h.at)}</span> <small>{h.by}{h.note ? ` · ${h.note}` : ''}</small></li>)}</ol>
          </section>
        </div>
        <aside className="ad-col">
          <section className="form-card ad-kv">
            <h2 className="sub-h">Customer</h2>
            <p><b>{o.customer.name}</b>{o.customer.company && <> · {o.customer.company}</>}</p>
            <p><a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></p>
            <p><a href={`https://wa.me/${o.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{o.customer.phone}</a></p>
            <h2 className="sub-h">Delivery</h2>
            <p>{L(o.delivery?.label, 'en')}</p>{o.delivery?.address && <p>{o.delivery.address}</p>}
            {o.notes && <><h2 className="sub-h">Customer notes</h2><p>{o.notes}</p></>}
            <h2 className="sub-h">Payment</h2>
            <p>{o.checkout === 'online' ? 'Online checkout' : 'Quote / invoice'} · {o.payment?.provider || '—'}</p>
            {o.payment?.paidAt && <p>Paid {d(o.payment.paidAt)}{o.payment.transactionId ? ` · ${o.payment.transactionId}` : ''}{o.payment.reference ? ` · ${o.payment.reference}` : ''}</p>}
            <h2 className="sub-h">Customer link</h2>
            <p className="ad-break mono">{customerLink}</p>
            <div className="sh-btns">
              <button type="button" className="btn btn-line btn-sm" onClick={() => navigator.clipboard?.writeText(customerLink)}>Copy link</button>
              <a className="btn btn-line btn-sm" target="_blank" rel="noreferrer" href={`https://wa.me/${o.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Grato Engineering – order ${o.number}: ${customerLink}`)}`}>Send on WhatsApp</a>
            </div>
          </section>
          <section className="form-card">
            <h2 className="sub-h">Referral</h2>
            {o.referral ? (
              <>
                <p>Code <b className="mono">{o.referral.code}</b></p>
                {o.commission.length ? o.commission.map((c) => <p key={c.id || c._id}>{m(c.amount, c.currency)} · {c.tier} {c.rate}% <Pill status={c.status} /></p>) : <p className="sh-hint">Commission is created when the order is paid.</p>}
              </>
            ) : <p className="sh-hint">No referral.</p>}
          </section>
          <section className="form-card">
            <h2 className="sub-h">Internal note</h2>
            <textarea rows="4" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} aria-label="Internal note" className="ad-ta" />
            <button type="button" className="btn btn-line btn-sm" onClick={() => act(() => api(`/admin/orders/${o.id}/note`, { method: 'POST', body: { note: adminNote } }), 'Note saved.')}>Save note</button>
          </section>
        </aside>
      </div>
    </>
  );
}

/* ---------------- products ---------------- */
const EMPTY = { slug: '', category: 'spare-parts', brand: '', sku: '', name: { en: '', fr: '' }, summary: { en: '', fr: '' }, description: { en: '', fr: '' }, specs: [], images: [], prices: { NGN: '', XAF: '' }, mode: 'buy', stock: '', active: true, featured: false, sortOrder: 100 };
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

function Products() {
  const { data, error, load } = useLoad('/admin/products');
  const [edit, setEdit] = useState(null);
  const [filter, setFilter] = useState('');
  const shown = useMemo(() => (data || []).filter((p) => !filter || (filter === 'sample' ? p.samplePrice : filter === 'archived' ? !p.active : p.category === filter)), [data, filter]);
  if (edit) return <ProductForm initial={edit} done={() => { setEdit(null); resetProductsCache(); load(); }} />;
  return (
    <>
      <div className="ad-title"><h1 className="ad-h1">Products</h1><button type="button" className="btn btn-red btn-sm" onClick={() => setEdit(EMPTY)}>Add product</button></div>
      <div className="ad-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter">
          <option value="">All products</option>
          {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          <option value="sample">Sample prices to replace</option>
          <option value="archived">Hidden / archived</option>
        </select>
      </div>
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (
        <div className="sh-table-wrap">
          <table className="sh-table ad-table">
            <thead><tr><th /><th>Product</th><th>Category</th><th>NGN</th><th>XAF</th><th>Stock</th><th>Status</th></tr></thead>
            <tbody>{shown.map((p) => (
              <tr key={p.id} className="ad-click" onClick={() => setEdit(p)}>
                <td>{p.images[0] ? <img className="ad-thumb" src={imgSrc(p.images[0])} alt="" /> : <span className="ad-thumb" />}</td>
                <td><button type="button" className="ad-linkbtn" onClick={(e) => { e.stopPropagation(); setEdit(p); }}>{p.name.en}</button><small>{p.sku}</small></td>
                <td>{CATS[p.category]}</td>
                <td>{p.mode === 'quote' ? 'Quote' : m(p.prices.NGN, 'NGN')}</td><td>{p.mode === 'quote' ? 'Quote' : m(p.prices.XAF, 'XAF')}</td>
                <td>{p.stock ?? '∞'}</td>
                <td>{!p.active ? <span className="sh-pill st-cancelled">Hidden</span> : p.samplePrice ? <span className="sh-pill st-awaiting_quote">Sample price</span> : <span className="sh-pill st-completed">Live</span>}{p.featured && <small>Featured</small>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ProductForm({ initial, done }) {
  const isNew = !initial.id;
  const [p, setP] = useState(() => ({ ...EMPTY, ...initial, prices: { NGN: initial.prices?.NGN ?? '', XAF: initial.prices?.XAF ?? '' }, stock: initial.stock ?? '' }));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const setL = (k, lang, v) => setP((x) => ({ ...x, [k]: { ...x[k], [lang]: v } }));

  const upload = async (files) => {
    setBusy(true); setMsg('');
    try {
      for (const f of [...files].slice(0, 8 - p.images.length)) {
        const url = await uploadPhoto(f, 1600);
        setP((x) => ({ ...x, images: [...x.images, url] }));
      }
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    const body = { ...p, slug: p.slug || slugify(p.name.en), confirmPrices: confirm };
    try {
      if (isNew) await api('/admin/products', { method: 'POST', body }); else await api(`/admin/products/${p.id}`, { method: 'PUT', body });
      done();
    } catch (x) { setMsg(x.message); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm('Delete this product? If it appears in past orders it will be hidden instead.')) return;
    try { await api(`/admin/products/${p.id}`, { method: 'DELETE' }); done(); } catch (x) { setMsg(x.message); }
  };
  const move = (i, dir) => setP((x) => { const a = [...x.images]; const j = i + dir; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, images: a }; });

  return (
    <form onSubmit={save} className="ad-form">
      <button type="button" className="ad-back" onClick={done}>← Products</button>
      <div className="ad-title"><h1 className="ad-h1">{isNew ? 'New product' : p.name.en}</h1>{initial.samplePrice && <span className="sh-pill st-awaiting_quote">Sample price</span>}</div>
      <div className="ad-detail">
        <div className="ad-col">
          <section className="form-card">
            <h2 className="sub-h">Name and text</h2>
            <div className="grid2">
              <div className="field"><label htmlFor="pn-en">Name (English)</label><input id="pn-en" required value={p.name.en} onChange={(e) => setL('name', 'en', e.target.value)} /></div>
              <div className="field"><label htmlFor="pn-fr">Name (French)</label><input id="pn-fr" value={p.name.fr} onChange={(e) => setL('name', 'fr', e.target.value)} /></div>
              <div className="field"><label htmlFor="ps-en">Short summary (English)</label><textarea id="ps-en" rows="2" value={p.summary.en} onChange={(e) => setL('summary', 'en', e.target.value)} /></div>
              <div className="field"><label htmlFor="ps-fr">Short summary (French)</label><textarea id="ps-fr" rows="2" value={p.summary.fr} onChange={(e) => setL('summary', 'fr', e.target.value)} /></div>
              <div className="field"><label htmlFor="pd-en">Description (English)</label><textarea id="pd-en" rows="5" value={p.description.en} onChange={(e) => setL('description', 'en', e.target.value)} /></div>
              <div className="field"><label htmlFor="pd-fr">Description (French)</label><textarea id="pd-fr" rows="5" value={p.description.fr} onChange={(e) => setL('description', 'fr', e.target.value)} /></div>
            </div>
          </section>
          <section className="form-card">
            <h2 className="sub-h">Photos (first one is the main photo)</h2>
            <div className="ad-imgs">
              {p.images.map((u, i) => (
                <figure key={u + i}>
                  <img src={imgSrc(u)} alt="" />
                  <figcaption>
                    <button type="button" onClick={() => move(i, -1)} aria-label="Move left">←</button>
                    <button type="button" onClick={() => move(i, 1)} aria-label="Move right">→</button>
                    <button type="button" onClick={() => set('images', p.images.filter((_, k) => k !== i))} aria-label="Remove photo">×</button>
                  </figcaption>
                </figure>
              ))}
              {p.images.length < 8 && (
                <label className="ad-upload">
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
                  <span>{busy ? 'Uploading…' : '+ Add photos'}</span>
                </label>
              )}
            </div>
          </section>
          <section className="form-card">
            <h2 className="sub-h">Specifications</h2>
            {p.specs.map((sp, i) => (
              <div className="ad-spec" key={i}>
                <input value={sp.label} placeholder="Label, e.g. Standby power" onChange={(e) => set('specs', p.specs.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} aria-label="Spec label" />
                <input value={sp.value} placeholder="Value, e.g. 60 kVA" onChange={(e) => set('specs', p.specs.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} aria-label="Spec value" />
                <button type="button" className="sh-x" onClick={() => set('specs', p.specs.filter((_, k) => k !== i))} aria-label="Remove">×</button>
              </div>
            ))}
            <button type="button" className="btn btn-line btn-sm" onClick={() => set('specs', [...p.specs, { label: '', value: '' }])}>Add specification</button>
          </section>
        </div>
        <aside className="ad-col">
          <section className="form-card">
            <h2 className="sub-h">Selling</h2>
            <div className="field"><label htmlFor="pm">How it is sold</label>
              <select id="pm" value={p.mode} onChange={(e) => set('mode', e.target.value)}>
                <option value="buy">Buy online (fixed price)</option>
                <option value="quote">Quote only (price per project)</option>
              </select>
            </div>
            <div className="grid2">
              <div className="field"><label htmlFor="pngn">Price NGN</label><input id="pngn" type="number" min="0" value={p.prices.NGN ?? ''} onChange={(e) => set('prices', { ...p.prices, NGN: e.target.value })} /></div>
              <div className="field"><label htmlFor="pxaf">Price XAF</label><input id="pxaf" type="number" min="0" value={p.prices.XAF ?? ''} onChange={(e) => set('prices', { ...p.prices, XAF: e.target.value })} /></div>
            </div>
            <p className="sh-hint">Leave a price empty to show “Price on request” in that currency.</p>
            {initial.samplePrice && <label className="sh-check"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> Prices confirmed (remove the sample flag)</label>}
            <div className="field"><label htmlFor="pst">Stock (empty = no limit / made to order)</label><input id="pst" type="number" min="0" value={p.stock ?? ''} onChange={(e) => set('stock', e.target.value)} /></div>
          </section>
          <section className="form-card">
            <h2 className="sub-h">Catalogue</h2>
            <div className="field"><label htmlFor="pc">Category</label><select id="pc" value={p.category} onChange={(e) => set('category', e.target.value)}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="grid2">
              <div className="field"><label htmlFor="pb">Brand</label><input id="pb" value={p.brand} onChange={(e) => set('brand', e.target.value)} /></div>
              <div className="field"><label htmlFor="psku">SKU</label><input id="psku" value={p.sku} onChange={(e) => set('sku', e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="pslug">URL name</label><input id="pslug" value={p.slug} placeholder={slugify(p.name.en)} onChange={(e) => set('slug', slugify(e.target.value))} /></div>
            <div className="field"><label htmlFor="pso">Sort order (lower shows first)</label><input id="pso" type="number" value={p.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} /></div>
            <label className="sh-check"><input type="checkbox" checked={p.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured (shown first)</label>
            <label className="sh-check"><input type="checkbox" checked={p.active} onChange={(e) => set('active', e.target.checked)} /> Visible in the shop</label>
          </section>
          {msg && <p className="sh-alert err" role="alert">{msg}</p>}
          <div className="sh-btns">
            <button type="submit" className="btn btn-red" disabled={busy}>{isNew ? 'Create product' : 'Save changes'}</button>
            {!isNew && <button type="button" className="btn btn-ghost ad-danger" onClick={del}>Delete</button>}
          </div>
        </aside>
      </div>
    </form>
  );
}

/* ---------------- referrers ---------------- */
function Referrers() {
  const [status, setStatus] = useState('pending');
  const { data, error, load } = useLoad(`/admin/referrers${status ? `?status=${status}` : ''}`);
  const [msg, setMsg] = useState('');
  const act = async (u, next) => {
    const note = next === 'approved' ? '' : window.prompt(`Reason for ${next === 'rejected' ? 'rejecting' : 'suspending'} ${u.name} (optional, internal):`, '');
    if (note === null) return;
    try { const r = await api(`/admin/referrers/${u.id}/status`, { method: 'POST', body: { status: next, note } }); setMsg(next === 'approved' ? `${u.name} approved. Referral code: ${r.code}` : `${u.name} ${next}.`); load(); } catch (e) { setMsg(e.message); }
  };
  return (
    <>
      <h1 className="ad-h1">Referrers</h1>
      <div className="ad-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="pending">Pending review</option><option value="approved">Approved</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option><option value="">All</option>
        </select>
      </div>
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (data.length ? (
        <div className="ad-refs">
          {data.map((u) => (
            <article className="form-card" key={u.id}>
              <div className="ad-title"><h2 className="ad-h2">{u.name}</h2><span className={`sh-pill rs-${u.referral.status}`}>{u.referral.status}</span></div>
              <p><a href={`mailto:${u.email}`}>{u.email}</a> · {u.phone} · {u.referral.country}</p>
              <p className="sh-hint">Applied {d(u.referral.appliedAt)}{u.referral.code && <> · code <b className="mono">{u.referral.code}</b></>} · {u.paidOrders} paid referred orders</p>
              {u.referral.audience && <blockquote className="ad-quote">{u.referral.audience}</blockquote>}
              <p className="sh-hint">Payout: {u.referral.payout?.type === 'momo' ? `Mobile money · ${u.referral.payout.provider} · ${u.referral.payout.number}` : `Bank · ${u.referral.payout?.bankName} · ${u.referral.payout?.accountNumber}`} · {u.referral.payout?.accountName}</p>
              {u.balances && <p className="sh-hint">Balances: {['NGN', 'XAF'].map((c) => `${c} pending ${m(u.balances[c].pending, c)}, available ${m(u.balances[c].available, c)}, paid ${m(u.balances[c].paid, c)}`).join(' · ')}</p>}
              <div className="sh-btns">
                {u.referral.status !== 'approved' && <button type="button" className="btn btn-red btn-sm" onClick={() => act(u, 'approved')}>{u.referral.status === 'suspended' ? 'Reinstate' : 'Approve'}</button>}
                {u.referral.status === 'pending' && <button type="button" className="btn btn-line btn-sm" onClick={() => act(u, 'rejected')}>Reject</button>}
                {u.referral.status === 'approved' && <button type="button" className="btn btn-ghost ad-danger btn-sm" onClick={() => act(u, 'suspended')}>Suspend</button>}
              </div>
            </article>
          ))}
        </div>
      ) : <p className="sh-empty">No referrers here.</p>)}
    </>
  );
}

/* ---------------- commissions ---------------- */
function Commissions() {
  const [status, setStatus] = useState('');
  const { data, error, load } = useLoad(`/admin/commissions${status ? `?status=${status}` : ''}`);
  return (
    <>
      <h1 className="ad-h1">Commissions</h1>
      <p className="sh-hint">Commission is created when a referred order is paid, becomes available when you mark the order completed, and is reversed if the order is cancelled or refunded.</p>
      <div className="ad-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All</option><option value="pending">Pending</option><option value="available">Available</option><option value="requested">Payout requested</option><option value="paid">Paid</option><option value="reversed">Reversed</option>
        </select>
      </div>
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (data.length ? (
        <div className="sh-table-wrap">
          <table className="sh-table ad-table">
            <thead><tr><th>Date</th><th>Referrer</th><th>Order</th><th>Order value</th><th>Tier</th><th>Commission</th><th>Status</th></tr></thead>
            <tbody>{data.map((c) => (
              <tr key={c.id} className={c.amount < 0 ? 'neg' : ''}>
                <td>{d(c.createdAt)}</td><td>{c.referrer?.name}<small className="mono">{c.referrer?.code}</small></td><td className="mono">{c.orderNumber}</td>
                <td>{c.orderAmount ? m(c.orderAmount, c.currency) : '—'}</td><td>{c.tier} {c.rate}%</td><td><b>{m(c.amount, c.currency)}</b>{c.note && <small>{c.note}</small>}{c.refunded && <small>Order refunded after payout</small>}</td><td><Pill status={c.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="sh-empty">No commissions.</p>)}
    </>
  );
}

/* ---------------- payouts ---------------- */
function Payouts() {
  const [status, setStatus] = useState('requested');
  const { data, error, load } = useLoad(`/admin/payouts${status ? `?status=${status}` : ''}`);
  const [refs, setRefs] = useState({});
  const [msg, setMsg] = useState('');
  const act = async (p, action) => {
    let body = { action };
    if (action === 'paid') { if (!refs[p.id]) { setMsg('Enter the transfer reference first.'); return; } body.reference = refs[p.id]; }
    if (action === 'reject') { const note = window.prompt('Reason for rejecting (optional):', ''); if (note === null) return; body.note = note; }
    try { await api(`/admin/payouts/${p.id}`, { method: 'POST', body }); setMsg(action === 'paid' ? 'Payout recorded as paid.' : 'Payout rejected; the commission is available again.'); load(); } catch (e) { setMsg(e.message); }
  };
  return (
    <>
      <h1 className="ad-h1">Payouts</h1>
      <p className="sh-hint">Pay the referrer by bank transfer or mobile money, then record the reference here.</p>
      <div className="ad-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="requested">To pay</option><option value="paid">Paid</option><option value="rejected">Rejected</option><option value="">All</option>
        </select>
      </div>
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (data.length ? (
        <div className="ad-refs">
          {data.map((p) => (
            <article className="form-card" key={p.id}>
              <div className="ad-title"><h2 className="ad-h2">{m(p.amount, p.currency)}</h2><Pill status={p.status} /></div>
              <p>{p.referrer?.name} · <span className="mono">{p.referrer?.code}</span> · {p.referrer?.email}</p>
              <p className="sh-hint">Requested {d(p.requestedAt)} · {p.commissionIds?.length || 0} commission entries</p>
              <p><b>{p.payout?.type === 'momo' ? `Mobile money · ${p.payout.provider} · ${p.payout.number}` : `Bank · ${p.payout?.bankName} · ${p.payout?.accountNumber}`}</b> · {p.payout?.accountName}</p>
              {p.status === 'requested' ? (
                <div className="ad-payrow">
                  <input value={refs[p.id] || ''} onChange={(e) => setRefs({ ...refs, [p.id]: e.target.value })} placeholder="Transfer reference" aria-label="Transfer reference" />
                  <button type="button" className="btn btn-red btn-sm" onClick={() => act(p, 'paid')}>Mark paid</button>
                  <button type="button" className="btn btn-ghost ad-danger btn-sm" onClick={() => act(p, 'reject')}>Reject</button>
                </div>
              ) : <p className="sh-hint">{p.status === 'paid' ? `Paid ${d(p.paidAt)} · ref ${p.reference}` : `Rejected${p.note ? ` · ${p.note}` : ''}`}</p>}
            </article>
          ))}
        </div>
      ) : <p className="sh-empty">Nothing here.</p>)}
    </>
  );
}

/* ---------------- team (admin accounts) ---------------- */
function Team({ me }) {
  const { data, error, load } = useLoad('/admin/users');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState({});
  const genPw = () => {
    const a = new Uint32Array(4); crypto.getRandomValues(a);
    return [...a].map((n) => n.toString(36)).join('').slice(0, 14);
  };
  const create = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      const r = await api('/admin/users', { method: 'POST', body: f });
      setMsg(r.promoted ? `${f.email} already had a customer account and now has admin access (their password is unchanged).` : `Admin account created for ${f.email}. Share the password with them privately; they can sign in at /admin.`);
      setF({ name: '', email: '', password: '' }); load();
    } catch (x) { setMsg(x.message); }
    setBusy(false);
  };
  const remove = async (u) => {
    if (!window.confirm(`Remove admin access from ${u.name}? They keep their customer account.`)) return;
    try { await api(`/admin/users/${u.id}/remove-admin`, { method: 'POST', body: {} }); setMsg(`${u.name} is no longer an admin.`); load(); } catch (x) { setMsg(x.message); }
  };
  const setPassword = async (u) => {
    try { await api(`/admin/users/${u.id}/password`, { method: 'POST', body: { password: reset[u.id] } }); setMsg(`New password set for ${u.name}. Share it with them privately.`); setReset({ ...reset, [u.id]: undefined }); } catch (x) { setMsg(x.message); }
  };
  return (
    <>
      <h1 className="ad-h1">Team</h1>
      <p className="sh-hint">People listed here can sign in to this dashboard. New admin accounts can only be created here, by a signed-in admin.</p>
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      {error && <ErrorBox error={error} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (
        <div className="sh-table-wrap">
          <table className="sh-table ad-table">
            <thead><tr><th>Name</th><th>Email</th><th>Added</th><th>Last sign-in</th><th /></tr></thead>
            <tbody>{data.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === me.id && <small>You</small>}</td><td>{u.email}</td><td>{d(u.createdAt)}<small>{u.createdBy ? `by ${u.createdBy}` : ''}</small></td><td>{d(u.lastLoginAt)}</td>
                <td>
                  {reset[u.id] !== undefined ? (
                    <div className="ad-payrow">
                      <input value={reset[u.id]} onChange={(e) => setReset({ ...reset, [u.id]: e.target.value })} aria-label="New password" />
                      <button type="button" className="btn btn-red btn-sm" onClick={() => setPassword(u)}>Save</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReset({ ...reset, [u.id]: undefined })}>Cancel</button>
                    </div>
                  ) : (
                    <div className="sh-btns">
                      <button type="button" className="btn btn-line btn-sm" onClick={() => setReset({ ...reset, [u.id]: genPw() })}>Reset password</button>
                      {u.id !== me.id && <button type="button" className="btn btn-ghost ad-danger btn-sm" onClick={() => remove(u)}>Remove admin</button>}
                    </div>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <form className="form-card ad-newadmin" onSubmit={create} noValidate>
        <h2 className="sub-h">Create an admin account</h2>
        <div className="ad-g3">
          <div className="field"><label htmlFor="na-name">Full name</label><input id="na-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="off" /></div>
          <div className="field"><label htmlFor="na-email">Email</label><input id="na-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="off" /></div>
          <div className="field"><label htmlFor="na-pass">Temporary password (10+ characters)</label>
            <div className="ad-payrow"><input id="na-pass" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" /><button type="button" className="btn btn-line btn-sm" onClick={() => setF({ ...f, password: genPw() })}>Generate</button></div>
          </div>
        </div>
        <div><button type="submit" className="btn btn-red btn-sm" disabled={busy}>Create admin account</button></div>
      </form>
    </>
  );
}

/* ---------------- settings ---------------- */
function Settings() {
  const { data, error, load, setData } = useLoad('/admin/settings');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!data) return <Loading />;
  const set = (k, v) => setData({ ...data, [k]: v });
  const upd = (k, i, patch) => set(k, data[k].map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try { const s = await api('/admin/settings', { method: 'PUT', body: data }); setData(s); setMsg('Settings saved.'); } catch (x) { setMsg(x.message); }
    setBusy(false);
  };
  return (
    <form onSubmit={save}>
      <div className="ad-title"><h1 className="ad-h1">Settings</h1><button type="submit" className="btn btn-red btn-sm" disabled={busy}>Save settings</button></div>
      {msg && <p className="sh-alert info" role="status">{msg}</p>}
      <section className="form-card">
        <h2 className="sub-h">Commission tiers (monthly referred sales, per currency)</h2>
        <table className="sh-table ad-edit">
          <thead><tr><th>Name</th><th>Rate %</th><th>From NGN</th><th>From XAF</th><th /></tr></thead>
          <tbody>{data.tiers.map((t, i) => (
            <tr key={i}>
              <td><input value={t.name} onChange={(e) => upd('tiers', i, { name: e.target.value })} aria-label="Tier name" /></td>
              <td><input type="number" step="0.5" min="0" max="50" value={t.rate} onChange={(e) => upd('tiers', i, { rate: e.target.value })} aria-label="Rate" /></td>
              <td><input type="number" min="0" value={t.min.NGN} onChange={(e) => upd('tiers', i, { min: { ...t.min, NGN: e.target.value } })} aria-label="From NGN" /></td>
              <td><input type="number" min="0" value={t.min.XAF} onChange={(e) => upd('tiers', i, { min: { ...t.min, XAF: e.target.value } })} aria-label="From XAF" /></td>
              <td><button type="button" className="sh-x" aria-label="Remove tier" onClick={() => set('tiers', data.tiers.filter((_, j) => j !== i))}>×</button></td>
            </tr>
          ))}</tbody>
        </table>
        <button type="button" className="btn btn-line btn-sm" onClick={() => set('tiers', [...data.tiers, { name: '', rate: 0, min: { NGN: 0, XAF: 0 } }])}>Add tier</button>
        <div className="grid3 ad-g3">
          <div className="field"><label htmlFor="pm-ngn">Minimum payout NGN</label><input id="pm-ngn" type="number" min="0" value={data.payoutMinimum.NGN} onChange={(e) => set('payoutMinimum', { ...data.payoutMinimum, NGN: e.target.value })} /></div>
          <div className="field"><label htmlFor="pm-xaf">Minimum payout XAF</label><input id="pm-xaf" type="number" min="0" value={data.payoutMinimum.XAF} onChange={(e) => set('payoutMinimum', { ...data.payoutMinimum, XAF: e.target.value })} /></div>
          <div className="field"><label htmlFor="rd">Referral link lasts (days)</label><input id="rd" type="number" min="1" max="365" value={data.referralDays} onChange={(e) => set('referralDays', e.target.value)} /></div>
        </div>
      </section>
      <section className="form-card">
        <h2 className="sub-h">Delivery cities (flat fee)</h2>
        <table className="sh-table ad-edit">
          <thead><tr><th>City</th><th>Currency</th><th>Fee</th><th /></tr></thead>
          <tbody>{data.deliveryZones.map((z, i) => (
            <tr key={i}>
              <td><input value={z.name} onChange={(e) => upd('deliveryZones', i, { name: e.target.value, ...(z.id ? {} : { id: slugify(e.target.value) }) })} aria-label="City" /></td>
              <td><select value={z.currency} onChange={(e) => upd('deliveryZones', i, { currency: e.target.value })} aria-label="Currency"><option>NGN</option><option>XAF</option></select></td>
              <td><input type="number" min="0" value={z.fee} onChange={(e) => upd('deliveryZones', i, { fee: e.target.value })} aria-label="Fee" /></td>
              <td><button type="button" className="sh-x" aria-label="Remove city" onClick={() => set('deliveryZones', data.deliveryZones.filter((_, j) => j !== i))}>×</button></td>
            </tr>
          ))}</tbody>
        </table>
        <button type="button" className="btn btn-line btn-sm" onClick={() => set('deliveryZones', [...data.deliveryZones, { id: '', name: '', currency: 'XAF', fee: 0 }])}>Add city</button>
      </section>
      <section className="form-card">
        <h2 className="sub-h">Pickup points</h2>
        <table className="sh-table ad-edit">
          <thead><tr><th>Name (English)</th><th>Name (French)</th><th>Address</th><th>Currency</th><th /></tr></thead>
          <tbody>{data.pickupPoints.map((p, i) => (
            <tr key={i}>
              <td><input value={p.name.en} onChange={(e) => upd('pickupPoints', i, { name: { ...p.name, en: e.target.value }, ...(p.id ? {} : { id: slugify(e.target.value) }) })} aria-label="Name English" /></td>
              <td><input value={p.name.fr} onChange={(e) => upd('pickupPoints', i, { name: { ...p.name, fr: e.target.value } })} aria-label="Name French" /></td>
              <td><input value={p.address} onChange={(e) => upd('pickupPoints', i, { address: e.target.value })} aria-label="Address" /></td>
              <td><select value={p.currency} onChange={(e) => upd('pickupPoints', i, { currency: e.target.value })} aria-label="Currency"><option>NGN</option><option>XAF</option></select></td>
              <td><button type="button" className="sh-x" aria-label="Remove pickup point" onClick={() => set('pickupPoints', data.pickupPoints.filter((_, j) => j !== i))}>×</button></td>
            </tr>
          ))}</tbody>
        </table>
        <button type="button" className="btn btn-line btn-sm" onClick={() => set('pickupPoints', [...data.pickupPoints, { id: '', name: { en: '', fr: '' }, address: '', currency: 'XAF' }])}>Add pickup point</button>
      </section>
    </form>
  );
}
