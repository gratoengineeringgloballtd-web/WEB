import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LLink, useLocalPath } from '../lib/i18n.jsx';
import { Icon, usePageTitle } from '../lib/ui.jsx';
import { useShop, useProducts, api, storedRef, L } from './core.jsx';
import { ProductImage, Loading, ErrorBox, CurrencySwitch } from './parts.jsx';
import { QtyInput } from './Shop.jsx';

/** Cart lines joined with the catalogue, priced in the current currency. */
function useCartLines() {
  const { cart, currency } = useShop();
  const { list, error, reload } = useProducts();
  const lines = useMemo(() => (list ? cart.map((l) => {
    const p = list.find((x) => x.id === l.productId);
    if (!p) return null;
    const unit = p.mode === 'buy' && Number.isFinite(p.prices?.[currency]) && p.prices[currency] > 0 ? p.prices[currency] : null;
    return { ...l, p, unit, total: unit === null ? null : unit * l.qty };
  }).filter(Boolean) : null), [list, cart, currency]);
  return { lines, error, reload, list };
}

export function CartPage() {
  const { s, lang, fmt, setQty, remove, cart } = useShop();
  const { lines, error, reload } = useCartLines();
  usePageTitle(s('cartTitle'));

  if (error) return <div className="wrap sh-pad"><ErrorBox error={error} onRetry={reload} /></div>;
  if (!lines) return <div className="wrap sh-pad"><Loading /></div>;

  const priced = lines.every((l) => l.unit !== null);
  const subtotal = lines.reduce((n, l) => n + (l.total || 0), 0);

  return (
    <section className="sec sh-sec">
      <div className="wrap">
        <div className="sh-title-row"><h1 className="sh-h1">{s('cartTitle')}</h1><CurrencySwitch /></div>
        {!lines.length ? (
          <div className="sh-emptybox">
            <p>{s('cartEmpty')}</p>
            <LLink className="btn btn-red" to="/shop">{s('continueShopping')}</LLink>
          </div>
        ) : (
          <div className="sh-cart">
            <ul className="sh-cart-lines">
              {lines.map((l) => {
                const max = l.p.mode === 'buy' && Number.isFinite(l.p.stock) ? Math.max(1, l.p.stock) : 999;
                return (
                  <li key={l.productId}>
                    <LLink to={`/shop/p/${l.p.slug}`} className="sh-cart-img" tabIndex={-1} aria-hidden="true"><ProductImage product={l.p} /></LLink>
                    <div className="sh-cart-info">
                      <LLink to={`/shop/p/${l.p.slug}`} className="sh-cart-name">{L(l.p.name, lang)}</LLink>
                      <small>{l.unit !== null ? fmt(l.unit) : s('priceOnRequest')}{l.p.sku ? ` · ${l.p.sku}` : ''}</small>
                      {l.qty > max && <small className="sh-warn">{s('inStock', l.p.stock)}</small>}
                    </div>
                    <QtyInput value={l.qty} max={max} label={s('qty')} onChange={(n) => setQty(l.productId, n)} />
                    <b className="sh-cart-total">{l.total !== null ? fmt(l.total) : s('toBeConfirmed')}</b>
                    <button type="button" className="sh-x" aria-label={`${s('remove')}: ${L(l.p.name, lang)}`} onClick={() => remove(l.productId)}>×</button>
                  </li>
                );
              })}
            </ul>
            <aside className="sh-summary">
              <dl>
                <div><dt>{s('subtotal')}</dt><dd>{priced ? fmt(subtotal) : s('toBeConfirmed')}</dd></div>
                <div><dt>{s('delivery')}</dt><dd>{s('toBeConfirmed')}</dd></div>
              </dl>
              {!priced && <p className="sh-hint">{s('cartQuoteNote')}</p>}
              <LLink className="btn btn-red sh-wide" to="/checkout">{s('checkoutBtn')}</LLink>
              <LLink className="link" to="/shop">{s('continueShopping')}</LLink>
              {cart.length !== lines.length && <p className="sh-hint">{s('cartChanged')}</p>}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

const PHONE_RE = /^\+?\d{8,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function CheckoutPage() {
  const { s, lang, fmt, currency, cart, user, settings, clear } = useShop();
  const { lines, error, reload } = useCartLines();
  const navigate = useNavigate();
  const local = useLocalPath();
  usePageTitle(s('checkoutTitle'));

  const [f, setF] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  const [method, setMethod] = useState('pickup');
  const [pointId, setPointId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [pay, setPay] = useState('online');
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState('');
  const [quote, setQuote] = useState(null);
  const [refName, setRefName] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    if (user) setF((x) => ({ ...x, name: x.name || user.name || '', email: x.email || user.email || '', phone: x.phone || user.phone || '', company: x.company || user.company || '' }));
  }, [user]);

  useEffect(() => {
    const code = storedRef();
    if (code) api(`/referral/check/${encodeURIComponent(code)}`).then((d) => d.valid && setRefName(d.name)).catch(() => {});
  }, []);

  const points = (settings?.pickupPoints || []).filter((p) => !p.currency || p.currency === currency);
  const zones = (settings?.deliveryZones || []).filter((z) => z.currency === currency);
  useEffect(() => { if (points.length && !points.some((p) => p.id === pointId)) setPointId(points[0].id); }, [currency, settings]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (zoneId && !zones.some((z) => z.id === zoneId)) setZoneId(''); }, [currency]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasQuoteItems = lines?.some((l) => l.unit === null || l.p.mode !== 'buy');
  const zone = zones.find((z) => z.id === zoneId);
  const fee = method === 'pickup' ? 0 : method === 'flat' ? zone?.fee ?? null : null;
  const subtotal = lines && !hasQuoteItems ? lines.reduce((n, l) => n + l.total, 0) : null;
  const total = subtotal !== null && fee !== null ? subtotal + fee : null;
  const onlineOk = Boolean(lines?.length) && !hasQuoteItems && method !== 'quote';

  useEffect(() => { if (lines && !onlineOk && pay === 'online') setPay('invoice'); }, [onlineOk, lines]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (hasQuoteItems && method === 'pickup') setMethod('quote'); }, [hasQuoteItems]); // eslint-disable-line react-hooks/exhaustive-deps

  // Server price check (stock, availability) whenever the cart or delivery changes.
  useEffect(() => {
    if (!cart.length) return;
    const delivery = method === 'pickup' ? { method, pointId } : { method, zoneId, address: f.address.trim().length >= 6 ? f.address : 'pending address' };
    if (method === 'pickup' && !pointId) return;
    if (method === 'flat' && !zoneId) return;
    let live = true;
    api('/orders/price', { method: 'POST', body: { cart, currency, delivery } }).then((q) => live && setQuote(q)).catch(() => live && setQuote(null));
    return () => { live = false; };
  }, [cart, currency, method, pointId, zoneId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="wrap sh-pad"><ErrorBox error={error} onRetry={reload} /></div>;
  if (!lines) return <div className="wrap sh-pad"><Loading /></div>;
  if (!lines.length) return (
    <div className="wrap sh-pad"><div className="sh-emptybox"><p>{s('cartEmpty')}</p><LLink className="btn btn-red" to="/shop">{s('continueShopping')}</LLink></div></div>
  );

  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); if (errs[k]) setErrs((x) => ({ ...x, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = s('eName');
    if (!EMAIL_RE.test(f.email.trim())) e.email = s('eEmail');
    if (!PHONE_RE.test(f.phone.replace(/[\s().-]/g, ''))) e.phone = s('ePhone');
    if (method === 'pickup' && !pointId) e.point = s('ePoint');
    if (method === 'flat' && !zoneId) e.zone = s('eCity');
    if (method !== 'pickup' && f.address.trim().length < 6) e.address = s('eAddress');
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFail('');
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) {
      setTimeout(() => formRef.current?.querySelector('.field.err input, .field.err select, .field.err textarea')?.focus(), 0);
      return;
    }
    setBusy(true);
    try {
      const delivery = method === 'pickup' ? { method, pointId } : { method, zoneId, address: f.address };
      const out = await api('/orders', {
        method: 'POST',
        body: {
          checkout: pay === 'online' && onlineOk ? 'online' : 'invoice', currency, lang, ref: storedRef() || '',
          customer: { name: f.name, email: f.email, phone: f.phone, company: f.company },
          cart, delivery, notes: f.notes,
        },
      });
      try { sessionStorage.setItem(`grato-order-${out.number}`, out.token); } catch { /* ignore */ }
      clear();
      if (out.paymentUrl) { window.location.assign(out.paymentUrl); return; }
      navigate(local(`/shop/order/${out.number}?t=${out.token}&new=1`));
    } catch (err) {
      setBusy(false);
      if (err.code === 'cart_changed') setFail(s('cartChanged'));
      else if (err.code && ['name', 'email', 'phone'].includes(err.code)) setErrs({ [err.code]: err.message });
      else setFail(err.status === 0 || err.status >= 500 ? s('shopUnavailable') : err.message || s('orderError'));
    }
  };

  const problems = quote?.problems || [];

  return (
    <section className="sec sh-sec">
      <div className="wrap">
        <h1 className="sh-h1">{s('checkoutTitle')}</h1>
        <form className="sh-checkout" onSubmit={submit} noValidate ref={formRef}>
          <div className="sh-co-main">
            <fieldset className="form-card sh-fs">
              <legend><span className="sh-step">1</span>{s('yourDetails')}</legend>
              <div className="grid2">
                <TextField id="co-name" label={s('fullName')} value={f.name} onChange={set('name')} err={errs.name} auto="name" />
                <TextField id="co-company" label={<>{s('company')} <span className="sh-opt">{s('optional')}</span></>} value={f.company} onChange={set('company')} auto="organization" />
                <TextField id="co-email" type="email" label={s('email')} value={f.email} onChange={set('email')} err={errs.email} auto="email" />
                <TextField id="co-phone" type="tel" label={s('phone')} value={f.phone} onChange={set('phone')} err={errs.phone} auto="tel" ph="+237 6… / +234 8…" />
              </div>
              {!user && <p className="sh-hint">{s('haveAccount')} <LLink to="/account">{s('signIn')}</LLink></p>}
            </fieldset>

            <fieldset className="form-card sh-fs">
              <legend><span className="sh-step">2</span>{s('receive')}</legend>
              <div className="choice-grid sh-choices">
                {[
                  ['pickup', 'store', s('pickup'), s('pickupSub')],
                  ['flat', 'truck', s('flat'), s('flatSub')],
                  ['quote', 'pin', s('quoted'), s('quotedSub')],
                ].map(([v, ic, b, sm]) => (
                  <div className="choice" key={v}>
                    <input type="radio" name="dm" id={`dm-${v}`} value={v} checked={method === v} onChange={() => setMethod(v)} disabled={v === 'flat' && !zones.length} />
                    <label htmlFor={`dm-${v}`}><Icon id={ic} /><b>{b}</b><small>{sm}</small></label>
                  </div>
                ))}
              </div>
              {method === 'pickup' && (
                <div className={`field${errs.point ? ' err' : ''}`}>
                  <label htmlFor="co-point">{s('choosePoint')}</label>
                  <select id="co-point" value={pointId} onChange={(e) => setPointId(e.target.value)}>
                    {points.map((p) => <option key={p.id} value={p.id}>{L(p.name, lang)}</option>)}
                  </select>
                  {points.find((p) => p.id === pointId)?.address && <small className="sh-hint">{points.find((p) => p.id === pointId).address}</small>}
                  {errs.point && <span className="msg">{errs.point}</span>}
                </div>
              )}
              {method === 'flat' && (
                <div className={`field${errs.zone ? ' err' : ''}`}>
                  <label htmlFor="co-zone">{s('chooseCity')}</label>
                  <select id="co-zone" value={zoneId} onChange={(e) => { setZoneId(e.target.value); setErrs((x) => ({ ...x, zone: '' })); }}>
                    <option value="">—</option>
                    {zones.map((z) => <option key={z.id} value={z.id}>{z.name} · {fmt(z.fee)}</option>)}
                  </select>
                  {errs.zone && <span className="msg">{errs.zone}</span>}
                </div>
              )}
              {method !== 'pickup' && (
                <div className={`field${errs.address ? ' err' : ''}`}>
                  <label htmlFor="co-address">{s('address')}</label>
                  <textarea id="co-address" rows="3" value={f.address} onChange={set('address')} autoComplete="street-address" aria-invalid={Boolean(errs.address)} />
                  {errs.address && <span className="msg">{errs.address}</span>}
                </div>
              )}
            </fieldset>

            <fieldset className="form-card sh-fs">
              <legend><span className="sh-step">3</span>{s('howPay')}</legend>
              <div className="choice-grid sh-choices two">
                <div className="choice">
                  <input type="radio" name="pay" id="pay-online" checked={pay === 'online'} onChange={() => setPay('online')} disabled={!onlineOk} />
                  <label htmlFor="pay-online"><Icon id="lock" /><b>{s('payOnline')}</b><small>{s('payOnlineSub')}</small></label>
                </div>
                <div className="choice">
                  <input type="radio" name="pay" id="pay-invoice" checked={pay === 'invoice'} onChange={() => setPay('invoice')} />
                  <label htmlFor="pay-invoice"><Icon id="doc" /><b>{s('payInvoice')}</b><small>{s('payInvoiceSub')}</small></label>
                </div>
              </div>
              {!onlineOk && <p className="sh-hint">{s('payOnlineOff')}</p>}
              <div className="field">
                <label htmlFor="co-notes">{s('notes')} <span className="sh-opt">{s('optional')}</span></label>
                <textarea id="co-notes" rows="3" value={f.notes} onChange={set('notes')} placeholder={s('notesPh')} />
              </div>
            </fieldset>
          </div>

          <aside className="sh-summary sh-co-sum">
            <h2 className="sub-h">{s('items')}</h2>
            <ul className="sh-mini">
              {lines.map((l) => (
                <li key={l.productId}>
                  <ProductImage product={l.p} className="sh-mini-img" />
                  <span><b>{L(l.p.name, lang)}</b><small>× {l.qty}</small></span>
                  <span>{l.total !== null ? fmt(l.total) : '—'}</span>
                </li>
              ))}
            </ul>
            <dl>
              <div><dt>{s('subtotal')}</dt><dd>{subtotal !== null ? fmt(subtotal) : s('toBeConfirmed')}</dd></div>
              <div><dt>{s('delivery')}</dt><dd>{fee === 0 ? fmt(0) : fee !== null ? fmt(fee) : s('toBeConfirmed')}</dd></div>
              <div className="tot"><dt>{s('total')}</dt><dd>{total !== null ? fmt(total) : s('toBeConfirmed')}</dd></div>
            </dl>
            {refName && <p className="sh-ref"><Icon id="users" />{s('referredBy', refName)}</p>}
            {problems.length > 0 && <p className="sh-alert err">{s('cartChanged')} <LLink to="/cart">{s('viewCart')}</LLink></p>}
            {fail && <p className="sh-alert err" role="alert">{fail}</p>}
            <button type="submit" className="btn btn-red sh-wide" disabled={busy || problems.length > 0}>
              {busy ? s('placing') : pay === 'online' && onlineOk ? s('placeOrderPay') : s('placeOrderQuote')}
            </button>
            <p className="sh-fine">{s('agreeNote')}</p>
          </aside>
        </form>
      </div>
    </section>
  );
}

export function TextField({ id, label, value, onChange, err, type = 'text', auto, ph, required = true }) {
  return (
    <div className={`field${err ? ' err' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} autoComplete={auto} placeholder={ph} aria-invalid={Boolean(err)} aria-describedby={err ? `${id}-m` : undefined} required={required} />
      {err && <span className="msg" id={`${id}-m`}>{err}</span>}
    </div>
  );
}
