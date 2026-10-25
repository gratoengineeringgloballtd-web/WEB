import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLang, LLink } from '../lib/i18n.jsx';
import { Html, Icon, Pic, Reveal, asset, strip, prefersReducedMotion } from '../lib/ui.jsx';
import { GEN } from '../data/content.js';

/* Placeholder artwork: a canopy generator drawn in SVG, tinted per slide. */
const TONES = {
  red: ['#D62828', '#F3E2E0'], blue: ['#1F4E8C', '#E3EAF3'], steel: ['#4B5560', '#E8EAEC'],
  dark: ['#22262B', '#DADCDF'], amber: ['#C27A00', '#F6ECD9'],
};
function GenArt({ tone = 'steel', brand }) {
  const [c, bg] = TONES[tone] || TONES.steel;
  const vents = Array.from({ length: 9 }, (_, k) => <rect key={k} x={236 + k * 16} y="132" width="8" height="78" rx="2" fill="#000" opacity=".16" />);
  return (
    <svg className="gc-art" viewBox="0 0 640 480" role="img" aria-label={`${strip(brand)} generator, placeholder`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`g-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={bg} /><stop offset="1" stopColor="#fff" /></linearGradient>
        <linearGradient id={`b-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity=".82" /></linearGradient>
      </defs>
      <rect width="640" height="480" fill={`url(#g-${tone})`} />
      <rect x="0" y="352" width="640" height="128" fill="#000" opacity=".05" />
      <ellipse cx="320" cy="360" rx="250" ry="16" fill="#000" opacity=".14" />
      <rect x="92" y="330" width="456" height="24" rx="4" fill="#2B2F35" />
      <rect x="104" y="112" width="432" height="222" rx="12" fill={`url(#b-${tone})`} />
      <rect x="104" y="112" width="432" height="18" rx="9" fill="#fff" opacity=".18" />
      <rect x="124" y="140" width="92" height="120" rx="6" fill="#fff" opacity=".9" />
      <rect x="136" y="154" width="68" height="30" rx="3" fill="#1C1F23" />
      <circle cx="148" cy="204" r="7" fill="#2CB36B" /><circle cx="170" cy="204" r="7" fill="#E4A21B" /><circle cx="192" cy="204" r="7" fill="#D62828" />
      <rect x="136" y="224" width="68" height="8" rx="4" fill="#1C1F23" opacity=".25" />
      {vents}
      <rect x="400" y="132" width="116" height="78" rx="6" fill="#000" opacity=".12" />
      <rect x="402" y="80" width="18" height="40" rx="3" fill="#2B2F35" />
      <rect x="124" y="276" width="392" height="40" rx="6" fill="#000" opacity=".1" />
      <text x="320" y="303" textAnchor="middle" fontFamily="Barlow Condensed, Arial Narrow, sans-serif" fontWeight="700" fontSize="26" fill="#fff" letterSpacing="3">{strip(brand).toUpperCase()}</text>
    </svg>
  );
}

/**
 * Hero carousel of generator photos for the Generator Sales page.
 * Crossfades every 5 s; pauses on hover/focus, with a pause button, arrows,
 * thumbnails, swipe and arrow keys. Reduced motion: no autoplay.
 */
export function GeneratorCarousel() {
  const { lang, t, fr } = useLang();
  const slides = GEN.slides;
  const n = slides.length;
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduce] = useState(prefersReducedMotion);
  const touchX = useRef(null);
  const thumbs = useRef(null);
  const go = (i) => setIdx(((i % n) + n) % n);
  const running = !reduce && !userPaused && !hover;

  useEffect(() => {
    if (!running) return undefined;
    const tm = setTimeout(() => go(idx + 1), 5000);
    return () => clearTimeout(tm);
  }, [idx, running]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = thumbs.current?.children[idx];
    if (el && thumbs.current) thumbs.current.scrollTo({ left: el.offsetLeft - thumbs.current.clientWidth / 2 + el.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [idx, reduce]);

  const cur = slides[idx];
  const ttl = (sl) => (typeof sl.title === 'string' ? sl.title : sl.title[lang]);
  return (
    <div
      className={`gc${running ? ' run' : ''}`}
      role="region" aria-roledescription="carousel" aria-label={t('gcLabel')}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHover(false); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1); }}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') touchX.current = e.clientX; }}
      onPointerUp={(e) => { if (touchX.current === null) return; const dx = e.clientX - touchX.current; touchX.current = null; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); }}
    >
      <div className="gc-stage">
        {slides.map((sl, k) => (
          <figure key={k} className={`gc-slide${k === idx ? ' on' : ''}`} role="group" aria-roledescription="slide" aria-label={`${k + 1} / ${n}`} aria-hidden={k !== idx}>
            {sl.img ? <Pic name={sl.img} alt={`${ttl(sl)}: ${sl[lang]}`} sizes="(max-width:760px) 100vw, 640px" eager={k === 0} /> : <GenArt tone={sl.tone} brand={ttl(sl)} />}
            {!sl.img && <span className="gc-ph ph">{t('gcPhoto')}</span>}
          </figure>
        ))}
        <div className="gc-cap" aria-live="polite">
          <span className="gc-brand">{ttl(cur)}</span>
          <span className="gc-txt">{fr ? cur.fr : cur.en}</span>
        </div>
        <div className="gc-ctrl">
          <span className="gc-count">{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <button type="button" className="gc-btn" onClick={() => go(idx - 1)} aria-label={t('gcPrev')}><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>
          {!reduce && (
            <button type="button" className="gc-btn" onClick={() => setUserPaused((v) => !v)} aria-label={userPaused ? t('gcPlay') : t('gcPause')}>
              {userPaused ? <svg viewBox="0 0 24 24" className="fill"><path d="M8 5v14l11-7z" /></svg> : <svg viewBox="0 0 24 24" className="fill"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>}
            </button>
          )}
          <button type="button" className="gc-btn" onClick={() => go(idx + 1)} aria-label={t('gcNext')}><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
        </div>
        <span className="gc-prog" key={`${idx}-${running}`} aria-hidden="true" />
      </div>
      <p className="gc-credit">
        {cur.credit
          ? <>{t('gcCredit')}: <a href={cur.credit.url} target="_blank" rel="noopener noreferrer">{cur.credit.by}</a>, {cur.credit.lic}, Wikimedia Commons</>
          : t('gcOwn')}
      </p>
      <div className="gc-thumbs" ref={thumbs}>
        {slides.map((sl, k) => (
          <button type="button" key={k} className="gc-thumb" aria-current={k === idx} aria-label={`${t('gcGo')} ${k + 1}: ${ttl(sl)}`} onClick={() => go(k)}>
            {sl.img ? <Pic name={sl.img} sizes="120px" /> : <GenArt tone={sl.tone} brand={ttl(sl)} />}
          </button>
        ))}
      </div>
      <Html as="p" className="gc-note" html={t('gcStock')} />
    </div>
  );
}

/** kW → recommended standard kVA rating (0.8 power factor, 25 % headroom). */
export function recommendKva(kw) {
  const need = (kw / 0.8) * 1.25;
  return GEN.sizes.find((s) => s >= need) ?? null;
}

function bandFor(kva, lang) {
  if (kva <= 30) return GEN.ranges[0][lang][0];
  if (kva <= 150) return GEN.ranges[1][lang][0];
  return GEN.ranges[3][lang][0];
}

/** Interactive sizing estimate that hands its result to the quote form. */
function SizingTool() {
  const { lang, t, fr } = useLang();
  const id = useId();
  const [kw, setKw] = useState(40);
  const [mode, setMode] = useState('buy');
  const kva = useMemo(() => recommendKva(kw), [kw]);
  const fmt = (n) => n.toLocaleString(fr ? 'fr-FR' : 'en-GB');
  const set = (n) => setKw(Math.max(1, Math.min(1600, Math.round(Number(n) || 1))));

  const details = kva
    ? (fr
      ? `${mode === 'rent' ? 'Location' : 'Achat'} d’un groupe électrogène d’environ ${kva} kVA pour une charge d’environ ${kw} kW (estimation de l’outil de dimensionnement).`
      : `${mode === 'rent' ? 'Rental' : 'Purchase'} of a generator of about ${kva} kVA for a load of about ${kw} kW (estimate from the sizing tool).`)
    : (fr ? `Système multi-groupes pour une charge d’environ ${kw} kW.` : `Multi-generator system for a load of about ${kw} kW.`);
  const to = `/quote?service=generators&details=${encodeURIComponent(details)}`;

  return (
    <div className="gn-size">
      <div className="gn-size-in">
        <div className="field">
          <label htmlFor={`${id}-kw`}>{t('gnLoad')}</label>
          <div className="gn-load">
            <input id={`${id}-range`} type="range" min="1" max="1600" step="1" value={kw} onChange={(e) => set(e.target.value)} aria-label={t('gnLoad')} />
            <span className="gn-num"><input id={`${id}-kw`} type="number" min="1" max="1600" inputMode="numeric" value={kw} onChange={(e) => set(e.target.value)} /><b>kW</b></span>
          </div>
          <div className="gn-presets" role="group" aria-label={t('gnLoad')}>
            {GEN.ranges.map((r) => {
              const pre = { '10–30 kVA': 12, '30–150 kVA': 60, '10–60 kVA': 25, '150–1,000+ kVA': 400 }[r.kva];
              return <button type="button" key={r.kva} onClick={() => set(pre)} aria-pressed={kw === pre}><Icon id={r.ic} />{r[lang][0]}</button>;
            })}
          </div>
        </div>
        <fieldset className="gn-mode">
          <legend>{t('gnMode')}</legend>
          {['buy', 'rent'].map((m) => (
            <label key={m}><input type="radio" name={`${id}-mode`} value={m} checked={mode === m} onChange={() => setMode(m)} /><span>{m === 'buy' ? t('gnBuy') : t('gnRent')}</span></label>
          ))}
        </fieldset>
        <p className="gn-hint">{t('gnHint')}</p>
      </div>
      <div className="gn-result" aria-live="polite">
        <p className="sub-h" style={{ margin: 0, color: 'var(--on-night-2)' }}>{t('gnResult')}</p>
        {kva ? (
          <>
            <p className="gn-kva"><span key={kva}>{fmt(kva)}</span> <small>kVA</small></p>
            <p className="gn-calc">{t('gnCalc')(fmt(kw))} = {fmt(Math.round((kw / 0.8) * 1.25))} kVA</p>
            <p className="gn-band"><b>{t('gnBand')}:</b> {bandFor(kva, lang)}</p>
          </>
        ) : (
          <p className="gn-band" style={{ fontSize: 18 }}>{t('gnLargeNote')}</p>
        )}
        <LLink className="btn btn-red" to={to}><span>{mode === 'rent' ? t('gnRentQuote') : t('gnQuote')}</span><span className="arrow" aria-hidden="true">→</span></LLink>
      </div>
    </div>
  );
}

/** Extra sections shown on the Generator Sales service page. */
export default function GeneratorSales() {
  const { lang, t, fr } = useLang();
  return (
    <>
      <Reveal>
        <p className="sub-h">{t('gnRangeTitle')}</p>
        <div className="gn-ranges">
          {GEN.ranges.map((r) => (
            <div className="gn-range" key={r.kva}>
              <Icon id={r.ic} />
              <b className="gn-r-kva">{r.kva}</b>
              <h3>{r[lang][0]}</h3>
              <p>{r[lang][1]}</p>
            </div>
          ))}
        </div>
        <Html as="p" className="gn-note" html={t('gnRangeNote')} />
      </Reveal>

      <Reveal>
        <p className="sub-h">{t('gnSizeEyebrow')}</p>
        <h2 style={{ fontSize: 'clamp(28px,3vw,36px)', marginBottom: 8 }}>{t('gnSizeTitle')}</h2>
        <p className="lead" style={{ marginBottom: 20 }}>{t('gnSizeLead')}</p>
        <SizingTool />
      </Reveal>

      <Reveal>
        <p className="sub-h">{t('gnBrandTitle')}</p>
        <div className="gn-brands">
          {GEN.brands.map((b) => (
            <div className="gn-brand" key={b.name}>
              <div className="lg">{b.logo ? <img src={asset(`img/logos/${b.logo}.webp`)} alt={strip(b.name)} loading="lazy" /> : <Html as="b" html={b.name} />}</div>
              <Html as="p" html={fr ? b.fr : b.en} />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <p className="sub-h">{t('gnSectorTitle')}</p>
        <div className="gn-sectors">
          {GEN.sectors.map((s) => (
            <div key={s[1]}><Icon id={s[0]} /><div><b>{fr ? s[3] : s[1]}</b><span>{fr ? s[4] : s[2]}</span></div></div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <p className="sub-h">{t('gnAfterEyebrow')}</p>
        <h2 style={{ fontSize: 'clamp(28px,3vw,36px)', marginBottom: 20 }}>{t('gnAfterTitle')}</h2>
        <div className="gn-after">
          {GEN.after.map((a, k) => (
            <div key={a[1]}><span className="n">0{k + 1}</span><Icon id={a[0]} /><h3>{fr ? a[3] : a[1]}</h3><p>{fr ? a[4] : a[2]}</p></div>
          ))}
        </div>
      </Reveal>
    </>
  );
}
