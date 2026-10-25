import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang, LLink, LNavLink, useSwitchLang } from '../lib/i18n.jsx';
import { Icon, asset, strip } from '../lib/ui.jsx';
import { SVCS } from '../data/content.js';
import '../styles/logo.css';
import { useShop } from '../shop/core.jsx';
import { CartLink } from '../shop/Shop.jsx';

const NAV = [
  ['about', 'navAbout'],
  ['projects', 'navProjects'],
  ['partners', 'navPartners'],
  ['news', 'navNews'],
  ['careers', 'navCareers'],
  ['contact', 'navContact'],
];

export default function Header() {
  const { lang, t } = useLang();
  const shop = useShop();
  const switchLang = useSwitchLang();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef(null);
  const closeT = useRef();
  const onServices = /^(\/fr)?\/services(\/|$)/.test(pathname);
  const isDesktop = () => window.matchMedia('(min-width:1101px)').matches;

  useEffect(() => { setMenuOpen(false); setMegaOpen(false); }, [pathname]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 12)); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') { setMegaOpen(false); megaRef.current?.querySelector('button')?.focus(); } };
    const onClick = (e) => { if (isDesktop() && !megaRef.current?.contains(e.target)) setMegaOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [megaOpen]);

  const enter = () => { if (!isDesktop()) return; clearTimeout(closeT.current); setMegaOpen(true); };
  const leave = () => { if (!isDesktop()) return; closeT.current = setTimeout(() => setMegaOpen(false), 160); };

  return (
    <header className={`hdr${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <LLink className="brand" to="/" aria-label="Grato Engineering Global Limited">
          <img src={asset('img/mark.png')} alt="" width="44" height="37" />
          <span><b>Grato Engineering</b><small>Global Limited</small></span>
        </LLink>

        <nav className={`nav${menuOpen ? ' open' : ''}`} id="nav" aria-label="Main">
          <LNavLink to="/about">{t('navAbout')}</LNavLink>
          <div className="has-mega" ref={megaRef} onMouseEnter={enter} onMouseLeave={leave}>
            <button type="button" className={`nav-btn${onServices ? ' cur' : ''}`} aria-expanded={megaOpen} aria-controls="mega" onClick={() => setMegaOpen((o) => !o)}>
              <span>{t('navServices')}</span>
              <svg className="ic chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <div className="mega" id="mega" hidden={!megaOpen}>
              <div className="wrap mega-in">
                <div className="mega-list">
                  {SVCS.map((s) => (
                    <LLink key={s.id} className="mega-item" to={`/services/${s.id}`}>
                      <Icon id={s.ic} />
                      <div><b>{s[lang].n}</b><span>{strip(s[lang].s)}</span></div>
                    </LLink>
                  ))}
                </div>
                <div className="mega-side">
                  <p className="eyebrow" style={{ color: 'var(--on-night-2)' }}>{t('megaEyebrow')}</p>
                  <h3 style={{ fontSize: 26 }}>{t('megaTitle')}</h3>
                  <p>{t('megaText')}</p>
                  <LLink className="link" to="/services"><span>{t('megaLink')}</span><span className="arrow" aria-hidden="true">→</span></LLink>
                </div>
              </div>
            </div>
          </div>
          <LNavLink to="/shop">{shop.s('navShop')}</LNavLink>
          {NAV.slice(1).map(([p, k]) => <LNavLink key={p} to={`/${p}`}>{t(k)}</LNavLink>)}
          <LNavLink to="/account" className="nav-acc">{shop.user ? shop.s('account') : shop.s('signIn')}</LNavLink>
        </nav>

        <div className="hdr-tools">
          <div className="lang" role="group" aria-label="Language / Langue">
            <button type="button" aria-pressed={lang === 'en'} onClick={() => lang !== 'en' && switchLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'fr'} onClick={() => lang !== 'fr' && switchLang('fr')}>FR</button>
          </div>
          <LLink className="sh-accbtn" to="/account" aria-label={shop.user ? shop.s('account') : shop.s('signIn')}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          </LLink>
          <CartLink />
          <LLink className="btn btn-red btn-sm quote-btn" to="/quote">{t('ctaQuote')}</LLink>
          <button className="menu-btn" type="button" aria-controls="nav" aria-expanded={menuOpen} aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}><span /></button>
        </div>
      </div>
    </header>
  );
}
