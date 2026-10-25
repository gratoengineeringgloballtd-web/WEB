import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { asset } from '../lib/ui.jsx';
import { SHOP_STRINGS } from './strings.js';

/* ---------------- API ---------------- */
export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method, credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error('network'), { status: 0, code: 'network' });
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), { status: res.status, code: data?.code });
  return data;
}

/* ---------------- storage ---------------- */
const read = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

/** The referral code from a ?ref= link, kept for the number of days set by Grato. */
export function storedRef() {
  const r = read('grato-ref', null);
  if (!r || !r.code || (r.exp && r.exp < Date.now())) return null;
  return r.code;
}

/* ---------------- money ---------------- */
export function money(amount, currency, lang) {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) return '';
  const loc = lang === 'fr' ? 'fr-FR' : currency === 'XAF' ? 'en-CM' : 'en-NG';
  try { return new Intl.NumberFormat(loc, { style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(amount); }
  catch { return `${currency} ${Math.round(amount).toLocaleString()}`; }
}

export const L = (o, lang) => (o && typeof o === 'object' ? o[lang] || o.en || '' : o || '');
export const imgSrc = (u) => (!u ? null : /^(https?:|\/api\/)/.test(u) ? u : asset(u));
export const CAT_ICON = { generators: 'genset', 'spare-parts': 'wrench', power: 'power', telecom: 'tower' };

/* ---------------- context ---------------- */
const ShopCtx = createContext(null);

let productsCache = null;
let settingsCache = null;

export function ShopProvider({ children }) {
  const { lang } = useLang();
  const { search } = useLocation();
  const [currency, setCurrencyState] = useState(() => read('grato-currency', null) || (lang === 'fr' ? 'XAF' : 'NGN'));
  const [cart, setCart] = useState(() => read('grato-cart', []).filter((l) => l && l.productId && l.qty > 0));
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [settings, setSettings] = useState(settingsCache);

  useEffect(() => { write('grato-cart', cart); }, [cart]);

  // Keep the cart in sync across tabs.
  useEffect(() => {
    const on = (e) => { if (e.key === 'grato-cart') setCart(read('grato-cart', [])); };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  useEffect(() => {
    let live = true;
    api('/auth/me').then((d) => live && setUser(d.user)).catch(() => live && setUser(null));
    if (!settingsCache) api('/settings').then((s) => { settingsCache = s; if (live) setSettings(s); }).catch(() => {});
    return () => { live = false; };
  }, []);

  // Capture ?ref=CODE from referral links.
  useEffect(() => {
    const code = new URLSearchParams(search).get('ref');
    if (!code || !/^[A-Za-z0-9]{3,20}$/.test(code)) return;
    const days = settingsCache?.referralDays || 30;
    write('grato-ref', { code: code.toUpperCase(), exp: Date.now() + days * 864e5 });
  }, [search]);

  const setCurrency = useCallback((c) => { setCurrencyState(c); write('grato-currency', c); }, []);
  const add = useCallback((productId, qty = 1) => setCart((c) => {
    const ex = c.find((l) => l.productId === productId);
    if (ex) return c.map((l) => (l.productId === productId ? { ...l, qty: Math.min(999, l.qty + qty) } : l));
    return [...c, { productId, qty }];
  }), []);
  const setQty = useCallback((productId, qty) => setCart((c) => c.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.min(999, qty)) } : l))), []);
  const remove = useCallback((productId) => setCart((c) => c.filter((l) => l.productId !== productId)), []);
  const clear = useCallback(() => setCart([]), []);
  const refreshUser = useCallback(() => api('/auth/me').then((d) => setUser(d.user)).catch(() => setUser(null)), []);

  const value = useMemo(() => {
    const dict = SHOP_STRINGS[lang] || SHOP_STRINGS.en;
    const s = (key, ...args) => { const v = dict[key] ?? SHOP_STRINGS.en[key] ?? key; return typeof v === 'function' ? v(...args) : v; };
    const fmt = (n, cur = currency) => money(n, cur, lang);
    return {
      lang, s, fmt, currency, setCurrency, cart, add, setQty, remove, clear,
      count: cart.reduce((n, l) => n + l.qty, 0), user, setUser, refreshUser, settings,
    };
  }, [lang, currency, setCurrency, cart, add, setQty, remove, clear, user, refreshUser, settings]);

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export const useShop = () => useContext(ShopCtx);

/** All active products, loaded once per visit. */
export function useProducts() {
  const [state, setState] = useState(() => (productsCache ? { list: productsCache, error: null } : { list: null, error: null }));
  const load = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
    api('/products').then((list) => { productsCache = list; setState({ list, error: null }); }).catch((e) => setState({ list: null, error: e }));
  }, []);
  useEffect(() => { if (!productsCache) load(); }, [load]);
  return { ...state, reload: () => { productsCache = null; load(); } };
}
export const resetProductsCache = () => { productsCache = null; };
