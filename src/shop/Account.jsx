import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LLink, useLocalPath } from '../lib/i18n.jsx';
import { usePageTitle } from '../lib/ui.jsx';
import { useShop, api } from './core.jsx';
import { Loading, StatusPill, fmtDate } from './parts.jsx';
import { TextField } from './Checkout.jsx';

/** Sign-in / create-account card, used on the account and referral pages. */
export function AuthCard({ onDone, defaultTab = 'login', loginOnly = false }) {
  const { s, setUser } = useShop();
  const [tab, setTab] = useState(loginOnly ? 'login' : defaultTab);
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr] = useState({});
  const [fail, setFail] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setFail('');
    const e = {};
    if (tab === 'register' && f.name.trim().length < 2) e.name = s('eName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = s('eEmail');
    if (f.password.length < (tab === 'register' ? 8 : 1)) e.password = s('passwordHint');
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const out = await api(tab === 'login' ? '/auth/login' : '/auth/register', { method: 'POST', body: f });
      setUser(out.user);
      onDone?.(out.user);
    } catch (x) { setFail(x.status === 0 || x.status >= 500 ? s('shopUnavailable') : x.message); }
    setBusy(false);
  };

  return (
    <div className="form-card sh-auth">
      {loginOnly ? <h2 className="sh-auth-title">{s('signInTab')}</h2> : (
      <div className="sh-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'login'} onClick={() => { setTab('login'); setFail(''); }}>{s('signInTab')}</button>
        <button type="button" role="tab" aria-selected={tab === 'register'} onClick={() => { setTab('register'); setFail(''); }}>{s('registerTab')}</button>
      </div>
      )}
      <form onSubmit={submit} noValidate className="sh-auth-form">
        {tab === 'register' && <TextField id="au-name" label={s('fullName')} value={f.name} onChange={set('name')} err={err.name} auto="name" />}
        <TextField id="au-email" type="email" label={s('email')} value={f.email} onChange={set('email')} err={err.email} auto="email" />
        <TextField id="au-pass" type="password" label={s('password')} value={f.password} onChange={set('password')} err={err.password} auto={tab === 'login' ? 'current-password' : 'new-password'} ph={tab === 'register' ? s('passwordHint') : ''} />
        {tab === 'register' && <TextField id="au-phone" type="tel" label={<>{s('phone')} <span className="sh-opt">{s('optional')}</span></>} value={f.phone} onChange={set('phone')} auto="tel" required={false} />}
        {fail && <p className="sh-alert err" role="alert">{fail}</p>}
        <button type="submit" className="btn btn-red sh-wide" disabled={busy}>{busy ? s('placing') : tab === 'login' ? s('signInBtn') : s('registerBtn')}</button>
      </form>
    </div>
  );
}

export function AccountPage() {
  const { s, lang, fmt, user, setUser } = useShop();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const local = useLocalPath();
  const [orders, setOrders] = useState(null);
  const [prof, setProf] = useState(null);
  const [saved, setSaved] = useState(false);
  usePageTitle(s('accTitle'));

  useEffect(() => {
    if (!user) return;
    setProf({ name: user.name, phone: user.phone, company: user.company });
    api('/auth/orders').then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const after = () => { const next = params.get('next'); if (next && /^\/[a-z0-9/-]*$/i.test(next)) navigate(local(next)); };
  const logout = async () => { try { await api('/auth/logout', { method: 'POST', body: {} }); } catch { /* ignore */ } setUser(null); setOrders(null); };
  const save = async (e) => {
    e.preventDefault();
    try { const out = await api('/auth/me', { method: 'PATCH', body: prof }); setUser(out.user); setSaved(true); setTimeout(() => setSaved(false), 1800); } catch { /* ignore */ }
  };

  return (
    <>
      <div className="ph-head sh-head compact">
        <div className="wrap">
          <p className="eyebrow">{s('navShop')}</p>
          <h1>{s('accTitle')}</h1>
          <p className="lead">{s('accLead')}</p>
        </div>
      </div>
      <section className="sec sh-sec">
        <div className="wrap">
          {user === undefined && <Loading />}
          {user === null && (
            <div className="sh-auth-wrap">
              <AuthCard onDone={after} defaultTab={params.get('tab') === 'register' ? 'register' : 'login'} />
              <p className="sh-hint">{s('guestOrders')}</p>
            </div>
          )}
          {user && (
            <div className="sh-acc">
              <div>
                <div className="sh-title-row"><h2 className="sh-h2">{s('myOrders')}</h2></div>
                {!orders && <Loading />}
                {orders && !orders.length && <div className="sh-emptybox"><p>{s('noOrders')}</p><LLink className="btn btn-red" to="/shop">{s('continueShopping')}</LLink></div>}
                {orders && orders.length > 0 && (
                  <ul className="sh-olist">
                    {orders.map((o) => (
                      <li key={o.number}>
                        <LLink to={`/shop/order/${o.number}?t=${o.token}`}>
                          <span className="mono">{o.number}</span>
                          <span>{fmtDate(o.createdAt, lang)}</span>
                          <span>{o.items.length} × </span>
                          <b>{o.total !== null ? fmt(o.total, o.currency) : s('toBeConfirmed')}</b>
                          <StatusPill status={o.status} />
                        </LLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <aside className="form-card sh-acc-side">
                <p className="sh-acc-hello"><b>{user.name}</b><small>{user.email}</small></p>
                {prof && (
                  <form onSubmit={save} className="sh-auth-form">
                    <h3 className="sub-h">{s('profile')}</h3>
                    <TextField id="pf-name" label={s('fullName')} value={prof.name} onChange={(e) => setProf({ ...prof, name: e.target.value })} auto="name" />
                    <TextField id="pf-phone" type="tel" label={s('phone')} value={prof.phone} onChange={(e) => setProf({ ...prof, phone: e.target.value })} auto="tel" required={false} />
                    <TextField id="pf-company" label={s('company')} value={prof.company} onChange={(e) => setProf({ ...prof, company: e.target.value })} auto="organization" required={false} />
                    <button type="submit" className="btn btn-line btn-sm">{saved ? s('saved') : s('save')}</button>
                  </form>
                )}
                <div className="sh-acc-links">
                  <LLink className="link" to="/referral">{s('referralLink')} →</LLink>
                  {user.roles?.includes('admin') && <a className="link" href="/admin">{s('adminLink')} →</a>}
                  <button type="button" className="btn btn-ghost" onClick={logout}>{s('signOut')}</button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
