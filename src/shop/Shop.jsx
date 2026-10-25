import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LLink } from '../lib/i18n.jsx';
import { Icon, usePageTitle } from '../lib/ui.jsx';
import { useShop, useProducts, L } from './core.jsx';
import { ProductCarousel } from './Carousel.jsx';
import { CurrencySwitch, ProductImage, Price, StockNote, Loading, ErrorBox, canBuy } from './parts.jsx';

const CATS = ['generators', 'spare-parts', 'power', 'telecom'];

export function AddButton({ product, small = false }) {
  const { s, add } = useShop();
  const [done, setDone] = useState(false);
  useEffect(() => { if (!done) return; const t = setTimeout(() => setDone(false), 1800); return () => clearTimeout(t); }, [done]);
  if (!canBuy(product)) return <button type="button" className={`btn btn-line${small ? ' btn-sm' : ''}`} disabled>{s('outOfStock')}</button>;
  return (
    <button type="button" className={`btn ${product.mode === 'quote' ? 'btn-line' : 'btn-red'}${small ? ' btn-sm' : ''}`} onClick={() => { add(product.id, 1); setDone(true); }} aria-live="polite">
      {done ? <><Icon id="check" />{s('added')}</> : product.mode === 'quote' ? s('addToQuote') : s('addToCart')}
    </button>
  );
}

export function ProductCard({ p }) {
  const { lang } = useShop();
  return (
    <article className="sh-card">
      <LLink to={`/shop/p/${p.slug}`} className="sh-card-img" tabIndex={-1} aria-hidden="true"><ProductImage product={p} /></LLink>
      <div className="sh-card-body">
        <p className="sh-card-brand">{p.brand || ' '}</p>
        <h3><LLink to={`/shop/p/${p.slug}`}>{L(p.name, lang)}</LLink></h3>
        <p className="sh-card-sum">{L(p.summary, lang)}</p>
        <div className="sh-card-foot">
          <div className="sh-card-price"><Price product={p} /><StockNote product={p} /></div>
          <AddButton product={p} small />
        </div>
      </div>
    </article>
  );
}

export function CartLink() {
  const { s, count } = useShop();
  return (
    <LLink to="/cart" className="sh-cartbtn" aria-label={s('cartN', count)}>
      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>
      {count > 0 && <span className="sh-badge">{count > 99 ? '99+' : count}</span>}
    </LLink>
  );
}

export function ShopPage() {
  const { s, lang } = useShop();
  const { list, error, reload } = useProducts();
  const [params, setParams] = useSearchParams();
  const cat = CATS.includes(params.get('c')) ? params.get('c') : '';
  const [q, setQ] = useState(params.get('q') || '');
  usePageTitle(s('navShop'));

  const shown = useMemo(() => {
    if (!list) return [];
    const needle = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return list.filter((p) => (!cat || p.category === cat) && (!needle || [L(p.name, lang), L(p.summary, lang), p.brand, p.sku].join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(needle)));
  }, [list, cat, q, lang]);

  const counts = useMemo(() => Object.fromEntries(CATS.map((c) => [c, (list || []).filter((p) => p.category === c).length])), [list]);
  const setCat = (c) => { const n = new URLSearchParams(params); if (c) n.set('c', c); else n.delete('c'); setParams(n, { replace: true }); };

  return (
    <>
      <div className="ph-head sh-head">
        <div className="wrap">
          <p className="eyebrow">{s('shopEyebrow')}</p>
          <h1>{s('shopTitle')}</h1>
          <p className="lead">{s('shopLead')}</p>
          <ul className="sh-assure">
            <li><Icon id="lock" />{s('buyInfo1')}</li>
            <li><Icon id="truck" />{s('buyInfo2')}</li>
            <li><Icon id="wrench" />{s('buyInfo3')}</li>
          </ul>
        </div>
      </div>
      <section className="sec sh-sec">
        <div className="wrap">
          <div className="sh-bar">
            <div className="sh-cats" role="tablist" aria-label={s('navShop')}>
              <button type="button" role="tab" aria-selected={!cat} onClick={() => setCat('')}>{s('catAll')}{list && <small>{list.length}</small>}</button>
              {CATS.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)}>{s(`cat_${c}`)}{list && <small>{counts[c]}</small>}</button>
              ))}
            </div>
            <div className="sh-tools">
              <label className="sh-search">
                <span className="sr-only">{s('search')}</span>
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input type="search" value={q} placeholder={s('search')} onChange={(e) => setQ(e.target.value)} />
              </label>
              <CurrencySwitch />
            </div>
          </div>
          {error && <ErrorBox error={error} onRetry={reload} />}
          {!list && !error && <Loading />}
          {list && (shown.length ? (
            <div className="sh-grid">{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          ) : <p className="sh-empty">{s('noProducts')}</p>)}
          <div className="sh-refband">
            <div>
              <p className="eyebrow">{s('refEyebrow')}</p>
              <h2>{s('refTitle')}</h2>
            </div>
            <LLink className="btn btn-line" to="/referral">{s('referralLink')} <span aria-hidden="true">→</span></LLink>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductPage() {
  const { slug } = useParams();
  const { s, lang, setQty, cart, add } = useShop();
  const { list, error, reload } = useProducts();
  const p = list?.find((x) => x.slug === slug);
  const [qty, setQ] = useState(1);
  const [added, setAdded] = useState(false);
  usePageTitle(p ? L(p.name, lang) : s('navShop'));
  useEffect(() => { setQ(1); }, [slug]);

  if (error) return <div className="wrap sh-pad"><ErrorBox error={error} onRetry={reload} /></div>;
  if (!list) return <div className="wrap sh-pad"><Loading /></div>;
  if (!p) return (
    <div className="wrap sh-pad"><p className="sh-empty">{s('noProducts')}</p><LLink className="link" to="/shop">← {s('backToShop')}</LLink></div>
  );

  const related = list.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const inCart = cart.find((l) => l.productId === p.id);
  const max = p.mode === 'buy' && Number.isFinite(p.stock) ? Math.max(1, p.stock) : 999;
  const buy = () => { if (inCart) setQty(p.id, Math.min(max, inCart.qty + qty)); else add(p.id, qty); setAdded(true); };

  return (
    <>
      <section className="sec sh-pdp">
        <div className="wrap">
          <nav className="sh-crumbs" aria-label="Breadcrumb">
            <LLink to="/shop">{s('navShop')}</LLink><span aria-hidden="true">/</span>
            <LLink to={`/shop?c=${p.category}`}>{s(`cat_${p.category}`)}</LLink>
          </nav>
          <div className="sh-pdp-grid">
            <ProductCarousel product={p} />
            <div className="sh-pdp-info">
              {p.brand && <p className="eyebrow">{p.brand}</p>}
              <h1>{L(p.name, lang)}</h1>
              {p.sku && <p className="sh-sku mono">SKU {p.sku}</p>}
              <p className="lead">{L(p.summary, lang)}</p>
              <div className="sh-buybox">
                <div className="sh-buybox-top"><Price product={p} big /><StockNote product={p} /></div>
                <CurrencySwitch />
                {p.mode === 'quote' && <p className="sh-hint">{s('quoteHint')}</p>}
                {canBuy(p) ? (
                  <div className="sh-buyrow">
                    <QtyInput value={qty} max={max} onChange={setQ} label={s('qty')} />
                    <button type="button" className={`btn ${p.mode === 'quote' ? 'btn-line' : 'btn-red'}`} onClick={buy}>
                      {p.mode === 'quote' ? s('addToQuote') : s('addToCart')}
                    </button>
                  </div>
                ) : <button type="button" className="btn btn-line" disabled>{s('outOfStock')}</button>}
                {added && <p className="sh-added" role="status"><Icon id="check" />{s('added')} · <LLink to="/cart">{s('viewCart')} →</LLink></p>}
                <ul className="sh-assure small">
                  <li><Icon id="lock" />{s('buyInfo1')}</li>
                  <li><Icon id="truck" />{s('buyInfo2')}</li>
                  <li><Icon id="wrench" />{s('buyInfo3')}</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="sh-pdp-more">
            <div>
              <h2 className="sub-h">{s('description')}</h2>
              <p className="sh-desc">{L(p.description, lang)}</p>
            </div>
            {p.specs.length > 0 && (
              <div>
                <h2 className="sub-h">{s('specs')}</h2>
                <dl className="sh-specs">{p.specs.map((sp, i) => <div key={i}><dt>{sp.label}</dt><dd>{sp.value}</dd></div>)}</dl>
              </div>
            )}
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="sec alt sh-sec">
          <div className="wrap">
            <h2 className="sh-h2">{s('related')}</h2>
            <div className="sh-grid">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}

export function QtyInput({ value, onChange, max = 999, label }) {
  return (
    <div className="sh-qty" role="group" aria-label={label}>
      <button type="button" aria-label="−" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}>−</button>
      <input type="number" inputMode="numeric" min="1" max={max} value={value} aria-label={label}
        onChange={(e) => { const n = parseInt(e.target.value, 10); onChange(Number.isFinite(n) ? Math.max(1, Math.min(max, n)) : 1); }} />
      <button type="button" aria-label="+" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}
