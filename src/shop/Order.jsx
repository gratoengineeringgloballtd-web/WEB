import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LLink, useLocalPath } from '../lib/i18n.jsx';
import { Icon, usePageTitle } from '../lib/ui.jsx';
import { CONTACT } from '../lib/helpers.js';
import { useShop, api, L } from './core.jsx';
import { Loading, ErrorBox, StatusPill, OrderLines, fmtDate } from './parts.jsx';

const STEPS = ['placed', 'paid', 'processing', 'ready', 'completed'];
const stepOf = (st) => ({ pending_payment: 0, awaiting_quote: 0, quoted: 0, paid: 1, processing: 2, ready: 3, completed: 4 }[st] ?? -1);

export function OrderPage() {
  const { number } = useParams();
  const [params] = useSearchParams();
  const { s, lang, fmt } = useShop();
  const token = params.get('t') || (() => { try { return sessionStorage.getItem(`grato-order-${number}`) || ''; } catch { return ''; } })();
  const txId = params.get('transaction_id');
  const flwStatus = params.get('status');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(Boolean(txId) || params.get('paid') === '1');
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState('');
  const [copied, setCopied] = useState(false);
  usePageTitle(s('orderTitle', number));

  const q = token ? `?t=${encodeURIComponent(token)}` : '';
  const load = useCallback(async () => {
    try { setOrder(await api(`/orders/${encodeURIComponent(number)}${q}`)); setError(null); } catch (e) { setError(e); }
  }, [number, q]);

  // After Flutterwave redirects back, confirm the payment with the server.
  useEffect(() => {
    let live = true;
    (async () => {
      if (txId || flwStatus) {
        try {
          const o = await api(`/orders/${encodeURIComponent(number)}/verify${q}`, { method: 'POST', body: { transactionId: txId || '' } });
          if (live) { setOrder(o); setError(null); }
        } catch (e) { if (live) setError(e); }
        if (live) setChecking(false);
      } else {
        await load();
        if (live) setChecking(false);
      }
    })();
    return () => { live = false; };
  }, [number]); // eslint-disable-line react-hooks/exhaustive-deps

  // While a payment is pending, re-check every few seconds for the webhook.
  useEffect(() => {
    if (order?.status !== 'pending_payment' || !(txId || flwStatus)) return;
    let n = 0;
    const id = setInterval(() => { n += 1; if (n > 10) clearInterval(id); load(); }, 5000);
    return () => clearInterval(id);
  }, [order?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const payNow = async () => {
    setPaying(true); setPayErr('');
    try {
      const { paymentUrl } = await api(`/orders/${encodeURIComponent(number)}/pay${q}`, { method: 'POST', body: { lang } });
      window.location.assign(paymentUrl);
    } catch (e) { setPaying(false); setPayErr(e.message || s('errorGeneric')); }
  };

  const link = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}${token ? `?t=${token}` : ''}` : '';
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } };

  if (checking && !order) return <div className="wrap sh-pad"><Loading /><p className="sh-hint">{s('checking')}</p></div>;
  if (error && !order) return (
    <div className="wrap sh-pad">
      <ErrorBox error={error} text={error.status === 404 ? s('orderNotFound') : undefined} onRetry={error.status === 404 ? undefined : load} />
      <LLink className="btn btn-line" to="/account">{s('account')}</LLink>
    </div>
  );
  if (!order) return <div className="wrap sh-pad"><Loading /></div>;

  const step = stepOf(order.status);
  const failedReturn = flwStatus && flwStatus !== 'successful' && flwStatus !== 'completed' && order.status === 'pending_payment';
  const wa = `${CONTACT.whatsapp}?text=${encodeURIComponent(order.number)}`;

  return (
    <section className="sec sh-sec">
      <div className="wrap sh-order">
        <div className="sh-order-head">
          <p className="eyebrow">{fmtDate(order.createdAt, lang)}</p>
          <h1 className="sh-h1">{s('orderTitle', order.number)}</h1>
          <StatusPill status={order.status} />
        </div>

        <div className={`sh-alert ${['paid', 'processing', 'ready', 'completed'].includes(order.status) ? 'ok' : ['cancelled', 'refunded'].includes(order.status) ? 'err' : 'info'}`} role="status">
          <Icon id={['paid', 'processing', 'ready', 'completed'].includes(order.status) ? 'check' : 'clock'} />
          <p>{failedReturn ? s('paymentFailed') : s(`msg_${order.status}`)}</p>
        </div>

        {step >= 0 && (
          <ol className="sh-track" aria-label={s('status')}>
            {STEPS.map((k, i) => (
              <li key={k} className={i < step ? 'done' : i === step ? 'cur' : ''}>
                <span>{i < step ? '✓' : i + 1}</span>
                {k === 'placed' ? (order.checkout === 'invoice' && order.status !== 'quoted' ? s('st_awaiting_quote') : s('placedOn')) : s(`st_${k}`)}
              </li>
            ))}
          </ol>
        )}

        <div className="sh-order-grid">
          <div className="form-card">
            <h2 className="sub-h">{s('items')}</h2>
            <OrderLines items={order.items} currency={order.currency} lang={lang} />
            <dl className="sh-totals">
              <div><dt>{s('subtotal')}</dt><dd>{order.subtotal !== null ? fmt(order.subtotal, order.currency) : s('toBeConfirmed')}</dd></div>
              <div><dt>{s('delivery')} · {L(order.delivery?.label, lang)}</dt><dd>{order.delivery?.fee !== null && order.delivery?.fee !== undefined ? fmt(order.delivery.fee, order.currency) : s('toBeConfirmed')}</dd></div>
              <div className="tot"><dt>{s('total')}</dt><dd>{order.total !== null ? fmt(order.total, order.currency) : s('toBeConfirmed')}</dd></div>
            </dl>
            {order.quoteNote && <div className="sh-note"><b>{s('quoteFromGrato')}</b><p>{order.quoteNote}</p></div>}
          </div>
          <aside className="sh-summary">
            {order.canPay && (
              <>
                <button type="button" className="btn btn-red sh-wide" onClick={payNow} disabled={paying}>{paying ? s('placing') : `${s('payNow')} · ${fmt(order.total, order.currency)}`}</button>
                <p className="sh-fine">{s('payOnlineSub')}</p>
                {payErr && <p className="sh-alert err">{payErr}</p>}
              </>
            )}
            <dl className="sh-kv">
              <div><dt>{s('fullName')}</dt><dd>{order.customer.name}</dd></div>
              <div><dt>{s('email')}</dt><dd>{order.customer.email}</dd></div>
              <div><dt>{s('phone')}</dt><dd>{order.customer.phone}</dd></div>
              {order.delivery?.address && <div><dt>{order.delivery.method === 'pickup' ? s('choosePoint') : s('address')}</dt><dd>{order.delivery.address}</dd></div>}
            </dl>
            <p className="sh-hint">{s('orderLead')}</p>
            <button type="button" className="btn btn-line btn-sm" onClick={copy}>{copied ? s('copied') : s('copyLink')}</button>
            <a className="link" href={wa} target="_blank" rel="noreferrer">WhatsApp Grato →</a>
          </aside>
        </div>
      </div>
    </section>
  );
}

/** Test-mode payment screen, used only when no Flutterwave key is configured. */
export function PayTestPage() {
  const { number } = useParams();
  const [params] = useSearchParams();
  const { s, fmt } = useShop();
  const local = useLocalPath();
  const t = params.get('t') || '';
  const txRef = params.get('tx_ref') || '';
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  usePageTitle(s('testTitle'));

  useEffect(() => { api(`/orders/${encodeURIComponent(number)}?t=${encodeURIComponent(t)}`).then(setOrder).catch(setError); }, [number, t]);

  const go = async (outcome) => {
    setBusy(true);
    try {
      await api(`/orders/${encodeURIComponent(number)}/test-pay?t=${encodeURIComponent(t)}`, { method: 'POST', body: { outcome, txRef } });
      window.location.assign(local(`/shop/order/${number}?t=${t}&status=${outcome === 'success' ? 'successful' : 'cancelled'}`));
    } catch (e) { setBusy(false); setError(e); }
  };

  return (
    <section className="sec sh-sec">
      <div className="wrap sh-narrow">
        <div className="form-card sh-testpay">
          <p className="eyebrow">Flutterwave · TEST</p>
          <h1 className="sh-h1">{s('testTitle')}</h1>
          <p className="sh-hint">{s('testLead')}</p>
          {error && <ErrorBox error={error} />}
          {!order && !error && <Loading />}
          {order && (
            <>
              <p className="sh-testpay-amt">{fmt(order.total, order.currency)}</p>
              <p className="mono">{order.number}</p>
              <div className="sh-btns">
                <button type="button" className="btn btn-red" disabled={busy} onClick={() => go('success')}>{s('testSuccess')}</button>
                <button type="button" className="btn btn-line" disabled={busy} onClick={() => go('fail')}>{s('testFail')}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
