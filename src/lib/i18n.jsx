import { createContext, useContext, useEffect, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { STRINGS } from '../data/content.js';

/*
 * Language comes from the URL: English pages live at /…, French pages at /fr/….
 * That keeps both versions indexable by search engines and shareable as links.
 */
const LangContext = createContext({ lang: 'en' });

export function LangProvider({ lang, children }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('grato-lang', lang); } catch (e) { /* storage unavailable */ }
  }, [lang]);
  const value = useMemo(() => {
    const dict = STRINGS[lang] || STRINGS.en;
    const t = (key) => dict[key] ?? STRINGS.en[key] ?? key;
    return { lang, fr: lang === 'fr', t };
  }, [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Pick the English or French member of a pair / object. */
export const pick = (lang, en, fr) => (lang === 'fr' ? fr : en);

/** Prefix a site path with /fr when the current language is French. */
export function useLocalPath() {
  const { lang } = useLang();
  return (to) => {
    if (!to || /^(https?:|mailto:|tel:|#)/.test(to)) return to;
    const clean = to.startsWith('/') ? to : '/' + to;
    return lang === 'fr' ? (clean === '/' ? '/fr' : '/fr' + clean) : clean;
  };
}

export function LLink({ to, ...rest }) {
  const local = useLocalPath();
  return <Link to={local(to)} {...rest} />;
}

export function LNavLink({ to, ...rest }) {
  const local = useLocalPath();
  return <NavLink to={local(to)} {...rest} />;
}

/** Switch language while staying on the same page. */
export function useSwitchLang() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  return (next) => {
    const base = pathname.replace(/^\/fr(?=\/|$)/, '') || '/';
    const target = next === 'fr' ? (base === '/' ? '/fr' : '/fr' + base) : base;
    navigate(target + search, { replace: false });
  };
}
