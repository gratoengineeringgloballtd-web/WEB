import { useCallback, useEffect, useState } from 'react';
import { usePageTitle, Icon } from '../lib/ui.jsx';
import { useShop, api } from './core.jsx';
import { Loading, ErrorBox, fmtDate } from './parts.jsx';
import { AuthCard } from './Account.jsx';
import { TextField } from './Checkout.jsx';

function TierTable({ tiers }) {
  const { s, fmt } = useShop();
  const sorted = [...tiers].sort((a, b) => a.rate - b.rate);
  return (
    <div className="sh-tiers">
      {sorted.map((t, i) => {
        const next = sorted[i + 1];
        return (
          <div className={`sh-tier t${i}`} key={t.name}>
            <p className="sh-tier-name">{t.name}</p>
            <p className="sh-tier-rate">{t.rate}<span>%</span></p>
            <dl>
              {['NGN', 'XAF'].map((c) => (
                <div key={c}><dt>{c}</dt><dd>{next ? `${fmt(t.min[c], c)} – ${fmt(next.min[c], c)}` : `${s('from')} ${fmt(t.min[c], c)}`}</dd></div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}

function ApplyForm({ onDone }) {
  const { s, user } = useShop();
  const [f, setF] = useState({ phone: user?.phone || '', country: 'Cameroon', audience: '', payoutMethod: 'momo', bankName: '', accountName: user?.name || '', accountNumber: '', momoProvider: '', momoNumber: '', acceptTerms: false });
  const [fail, setFail] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setFail('');
    try { await api('/referral/apply', { method: 'POST', body: f }); onDone(); } catch (x) { setFail(x.message); }
    setBusy(false);
  };
  return (
    <form className="form-card sh-apply" onSubmit={submit} noValidate>
      <h3 className="sh-h2">{s('applyTitle')}</h3>
      <div className="grid2">
        <TextField id="ra-phone" type="tel" label={s('phone')} value={f.phone} onChange={set('phone')} auto="tel" ph="+237 6…" />
        <div className="field">
          <label htmlFor="ra-country">{s('country')}</label>
          <select id="ra-country" value={f.country} onChange={set('country')}>
            {['Cameroon', 'Nigeria', 'Chad', 'Gabon', 'Congo', 'Central African Republic', 'Equatorial Guinea', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="ra-aud">{s('audience')}</label>
        <textarea id="ra-aud" rows="3" value={f.audience} onChange={set('audience')} placeholder={s('audiencePh')} />
      </div>
      <fieldset className="sh-fs-plain">
        <legend className="sub-h">{s('payoutMethod')}</legend>
        <div className="choice-grid sh-choices two">
          {[['momo', 'phone', s('momo')], ['bank', 'store', s('bank')]].map(([v, ic, b]) => (
            <div className="choice" key={v}>
              <input type="radio" id={`pm-${v}`} name="pm" checked={f.payoutMethod === v} onChange={() => setF((x) => ({ ...x, payoutMethod: v }))} />
              <label htmlFor={`pm-${v}`}><Icon id={ic} /><b>{b}</b></label>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="grid2">
        <TextField id="ra-an" label={s('accountName')} value={f.accountName} onChange={set('accountName')} auto="name" />
        {f.payoutMethod === 'bank' ? (
          <>
            <TextField id="ra-bank" label={s('bankName')} value={f.bankName} onChange={set('bankName')} />
            <TextField id="ra-acc" label={s('accountNumber')} value={f.accountNumber} onChange={set('accountNumber')} />
          </>
        ) : (
          <>
            <TextField id="ra-mp" label={s('momoProvider')} value={f.momoProvider} onChange={set('momoProvider')} />
            <TextField id="ra-mn" type="tel" label={s('momoNumber')} value={f.momoNumber} onChange={set('momoNumber')} />
          </>
        )}
      </div>
      <label className="sh-check"><input type="checkbox" checked={f.acceptTerms} onChange={set('acceptTerms')} /> {s('acceptTerms')}</label>
      {fail && <p className="sh-alert err" role="alert">{fail}</p>}
      <button type="submit" className="btn btn-red" disabled={busy}>{busy ? s('placing') : s('applyBtn')}</button>
    </form>
  );
}

function Dashboard({ data, reload }) {
  const { s, lang, fmt } = useShop();
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');
  const link = `${window.location.origin}${lang === 'fr' ? '/fr' : ''}/shop?ref=${data.code}`;
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } };
  const waText = encodeURIComponent(`${lang === 'fr' ? 'Groupes électrogènes, pièces et équipements chez Grato Engineering :' : 'Generators, spare parts and site equipment from Grato Engineering:'} ${link}`);
  const request = async (currency) => {
    setBusy(currency); setMsg('');
    try { await api('/referral/payouts', { method: 'POST', body: { currency } }); await reload(); } catch (e) { setMsg(e.message); }
    setBusy('');
  };
  const curs = ['NGN', 'XAF'].filter((c) => data.monthly[c].volume > 0 || Object.values(data.balances[c]).some((v) => v !== 0));
  const show = curs.length ? curs : ['NGN', 'XAF'];

  return (
    <div className="sh-dash">
      <div className="sh-linkbox">
        <div>
          <p className="sub-h">{s('yourLink')}</p>
          <p className="sh-link mono">{link}</p>
          <p className="sh-hint">{s('yourCode')}: <b className="mono">{data.code}</b> · {s('refStep2b', data.referralDays)}</p>
        </div>
        <div className="sh-btns">
          <button type="button" className="btn btn-red btn-sm" onClick={copy}>{copied ? s('copied') : s('copyLink')}</button>
          <a className="btn btn-line btn-sm" href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer">{s('shareWa')}</a>
        </div>
      </div>

      {show.map((c) => {
        const m = data.monthly[c]; const b = data.balances[c];
        return (
          <div className="sh-dash-cur" key={c}>
            <div className="sh-stat big">
              <p className="sub-h">{s('thisMonth')} · {c}</p>
              <p className="sh-stat-v">{fmt(m.volume, c)}</p>
              <p>{s('referredSales')} · {m.orders} {s('order').toLowerCase()}{m.orders === 1 ? '' : 's'}</p>
              <p className="sh-tierline"><b>{m.tier.name} · {m.tier.rate}%</b> {m.next ? s('toNext', fmt(m.next.remaining, c), `${m.next.name} (${m.next.rate}%)`) : s('topTier')}</p>
              {m.next && <div className="sh-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, (m.volume / (m.volume + m.next.remaining)) * 100)}%` }} /></div>}
            </div>
            <div className="sh-stat"><p className="sub-h">{s('pending')}</p><p className="sh-stat-v">{fmt(b.pending, c)}</p></div>
            <div className="sh-stat"><p className="sub-h">{s('available')}</p><p className="sh-stat-v">{fmt(b.available, c)}</p>
              <button type="button" className="btn btn-red btn-sm" disabled={busy === c || b.available < (data.payoutMinimum[c] || 0)} onClick={() => request(c)}>{s('requestPayout')}</button>
              <small>{s('minPayout', fmt(data.payoutMinimum[c], c))}</small>
            </div>
            <div className="sh-stat"><p className="sub-h">{s('requested')} / {s('paidOut')}</p><p className="sh-stat-v">{fmt(b.requested, c)}</p><small>{s('paidOut')}: {fmt(b.paid, c)}</small></div>
          </div>
        );
      })}
      {msg && <p className="sh-alert err" role="alert">{msg}</p>}

      <h3 className="sh-h2">{s('commissions')}</h3>
      {data.commissions.length ? (
        <div className="sh-table-wrap">
          <table className="sh-table">
            <thead><tr><th>{s('date')}</th><th>{s('order')}</th><th>{s('orderValue')}</th><th>{s('rate')}</th><th>{s('commission')}</th><th>{s('status')}</th></tr></thead>
            <tbody>
              {data.commissions.map((c) => (
                <tr key={c.id} className={c.amount < 0 ? 'neg' : ''}>
                  <td>{fmtDate(c.createdAt, lang)}</td><td className="mono">{c.orderNumber}</td><td>{c.orderAmount ? fmt(c.orderAmount, c.currency) : '—'}</td>
                  <td>{c.tier} {c.rate}%</td><td><b>{fmt(c.amount, c.currency)}</b>{c.note && <small>{c.note}</small>}</td><td><span className={`sh-pill cs-${c.status}`}>{s(`cst_${c.status}`)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="sh-empty">{s('noCommissions')}</p>}

      <h3 className="sh-h2">{s('payouts')}</h3>
      {data.payouts.length ? (
        <div className="sh-table-wrap">
          <table className="sh-table">
            <thead><tr><th>{s('date')}</th><th>{s('commission')}</th><th>{s('status')}</th><th>{s('reference')}</th></tr></thead>
            <tbody>{data.payouts.map((p) => (
              <tr key={p.id}><td>{fmtDate(p.requestedAt, lang)}</td><td><b>{fmt(p.amount, p.currency)}</b></td><td><span className={`sh-pill ps-${p.status}`}>{s(`pst_${p.status}`)}</span></td><td className="mono">{p.reference || '—'}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="sh-empty">{s('noPayouts')}</p>}
    </div>
  );
}

export function ReferralPage() {
  const { s, user, settings, refreshUser } = useShop();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  usePageTitle(s('referralLink'));

  const load = useCallback(async () => {
    if (!user) { setData(null); return; }
    try { setData(await api('/referral/me')); setError(null); } catch (e) { setError(e); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const tiers = settings?.tiers;
  const days = settings?.referralDays || 30;

  return (
    <>
      <div className="ph-head sh-head">
        <div className="wrap">
          <p className="eyebrow">{s('refEyebrow')}</p>
          <h1>{s('refTitle')}</h1>
          <p className="lead">{s('refLead')}</p>
          {!user && <a className="btn btn-red" href="#join">{s('applyTitle')} →</a>}
        </div>
      </div>

      {user && data?.status === 'approved' && (
        <section className="sec sh-sec"><div className="wrap"><Dashboard data={data} reload={load} /></div></section>
      )}

      <section className={`sec sh-sec${user && data?.status === 'approved' ? ' alt' : ''}`}>
        <div className="wrap">
          <h2 className="sh-h2">{s('refHow')}</h2>
          <ol className="sh-how">
            {[['users', 'refStep1', 'refStep1b'], ['loop', 'refStep2', 'refStep2b'], ['check', 'refStep3', 'refStep3b'], ['award', 'refStep4', 'refStep4b']].map(([ic, a, b], i) => (
              <li key={a}><span className="sh-how-n">{String(i + 1).padStart(2, '0')}</span><Icon id={ic} /><b>{s(a)}</b><p>{s(b, days)}</p></li>
            ))}
          </ol>
          <div className="sh-ref-grid">
            <div>
              <h2 className="sh-h2">{s('refTiers')}</h2>
              <p className="sh-hint">{s('refTiersLead')}</p>
              {tiers ? <TierTable tiers={tiers} /> : <Loading />}
            </div>
            <div>
              <h2 className="sh-h2">{s('refTerms')}</h2>
              <ul className="sh-terms">{s('terms').map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {!(user && data?.status === 'approved') && (
        <section className="sec alt sh-sec" id="join">
          <div className="wrap sh-join">
            {user === undefined && <Loading />}
            {user === null && (<><p className="sh-hint">{s('applySignIn')}</p><AuthCard defaultTab="register" /></>)}
            {user && error && <ErrorBox error={error} onRetry={load} />}
            {user && !data && !error && <Loading />}
            {user && data && (data.status === 'none' || !data.status) && <ApplyForm onDone={() => { refreshUser(); load(); }} />}
            {user && data?.status === 'pending' && <div className="sh-alert info"><Icon id="clock" /><p>{s('refPending')}</p></div>}
            {user && data?.status === 'rejected' && <div className="sh-alert err"><p>{s('refRejected')}</p></div>}
            {user && data?.status === 'suspended' && <div className="sh-alert err"><p>{s('refSuspended')}</p></div>}
          </div>
        </section>
      )}
    </>
  );
}
