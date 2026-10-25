import { useState } from 'react';
import { Icon, asset } from '../lib/ui.jsx';
import { galleryFor } from './placeholders.js';
import { useShop, imgSrc, CAT_ICON, L } from './core.jsx';

export function CurrencySwitch() {
  const { s, currency, setCurrency } = useShop();
  return (
    <div className="sh-cur" role="group" aria-label={s('currency')}>
      <span>{s('currency')}</span>
      {['NGN', 'XAF'].map((c) => (
        <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)}>{c === 'XAF' ? 'XAF (FCFA)' : 'NGN (₦)'}</button>
      ))}
    </div>
  );
}

export function ProductImage({ product, className = '', eager = false }) {
  const [broken, setBroken] = useState(false);
  const src = galleryFor(product, asset)[0]?.src;
  if (!src || broken) {
    return <div className={`sh-noimg ${className}`} aria-hidden="true"><Icon id={CAT_ICON[product?.category] || 'genset'} /></div>;
  }
  return <img className={className} src={src} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken(true)} />;
}

export function Price({ product, big = false }) {
  const { s, fmt, currency } = useShop();
  const p = product?.prices?.[currency];
  const has = product?.mode === 'buy' && Number.isFinite(p) && p > 0;
  return <span className={`sh-price${big ? ' big' : ''}${has ? '' : ' req'}`}>{has ? fmt(p) : s('priceOnRequest')}</span>;
}

export function StockNote({ product }) {
  const { s } = useShop();
  if (product.mode === 'quote') return <span className="sh-stock quote">{s('quoteItem')}</span>;
  if (product.stock === null || product.stock === undefined) return <span className="sh-stock">{s('madeToOrder')}</span>;
  if (product.stock <= 0) return <span className="sh-stock out">{s('outOfStock')}</span>;
  return <span className="sh-stock in">{s('inStock', product.stock)}</span>;
}

export const canBuy = (p) => !(p.mode === 'buy' && p.stock !== null && p.stock !== undefined && p.stock <= 0);

export function Loading() {
  const { s } = useShop();
  return <div className="sh-loading" role="status"><span className="sh-spin" aria-hidden="true" />{s('loading')}</div>;
}

export function ErrorBox({ error, onRetry, text }) {
  const { s } = useShop();
  return (
    <div className="sh-alert err" role="alert">
      <p>{text || (error?.status === 0 || error?.status >= 500 ? s('shopUnavailable') : error?.message || s('errorGeneric'))}</p>
      {onRetry && <button type="button" className="btn btn-line btn-sm" onClick={onRetry}>{s('retry')}</button>}
    </div>
  );
}

export function StatusPill({ status }) {
  const { s } = useShop();
  return <span className={`sh-pill st-${status}`}>{s(`st_${status}`)}</span>;
}

export function OrderLines({ items, currency, lang }) {
  const { fmt, s } = useShop();
  return (
    <ul className="sh-lines">
      {items.map((it, i) => (
        <li key={i}>
          <span className="sh-lines-n"><b>{L(it.name, lang)}</b><small>{it.sku ? `${it.sku} · ` : ''}× {it.qty}</small></span>
          <span className="sh-lines-p">{it.lineTotal !== null && it.lineTotal !== undefined ? fmt(it.lineTotal, currency) : s('toBeConfirmed')}</span>
        </li>
      ))}
    </ul>
  );
}

export const fmtDate = (d, lang) => {
  try { return new Date(d).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
};
