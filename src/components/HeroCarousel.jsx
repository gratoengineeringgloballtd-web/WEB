import { useEffect, useRef, useState } from 'react';
import { useLang, LLink } from '../lib/i18n.jsx';
import { Html, Pic } from '../lib/ui.jsx';
import { HERO } from '../data/content.js';

/* Old prototype anchors → real routes. */
const toPath = (href) => href
  .replace(/^#case-(.+)$/, '/projects/$1')
  .replace(/^#(telecom|energy|connectivity|managed|logistics|generators)$/, '/services/$1')
  .replace(/^#(.+)$/, '/$1');

/**
 * Full-width hero slideshow. Each slide advances when its progress bar fills
 * (CSS animation, 7 s); hovering, focusing or the pause button freezes it.
 * With reduced motion the bars are static, so slides only change on request.
 */
export default function HeroCarousel() {
  const { lang, t } = useLang();
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const slideRefs = useRef([]);
  const touchX = useRef(null);
  const n = HERO.length;
  const go = (i) => setIdx(((i % n) + n) % n);

  useEffect(() => {
    slideRefs.current.forEach((el, k) => { if (el) el.inert = k !== idx; });
  }, [idx]);

  return (
    <div
      className={`hero on-night${userPaused || hover ? ' paused' : ''}`}
      role="region" aria-roledescription="carousel" aria-label="Grato highlights"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHover(false); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1); }}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') touchX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (touchX.current === null) return;
        const dx = e.clientX - touchX.current; touchX.current = null;
        if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="hero-slides">
        {HERO.map((h, i) => {
          const [eyebrow, title, lead, cta, href] = h[lang];
          const Heading = i === 0 ? 'h1' : 'h2';
          return (
            <div key={i} ref={(el) => (slideRefs.current[i] = el)} className={`hs${i === idx ? ' on' : ''}`}
              role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`} aria-hidden={i !== idx}>
              <Pic name={h.img} eager={i === 0} />
              <div className="wrap">
                <div className="hs-in">
                  <p className="eyebrow" style={{ color: 'var(--on-night-2)' }}>{eyebrow}</p>
                  <Html as={Heading} className="h1" html={title} />
                  <p className="lead" style={{ color: 'var(--on-night-2)' }}>{lead}</p>
                  <div className="hero-ctas">
                    <LLink className="btn btn-red" to="/quote"><span>{t('ctaQuote')}</span><span className="arrow" aria-hidden="true">→</span></LLink>
                    <LLink className="btn btn-line" to={toPath(href)}>{cta}</LLink>
                  </div>
                </div>
              </div>
              <p className="site-tag">{h.tag}</p>
            </div>
          );
        })}
      </div>

      <div className="hero-ui">
        <div className="wrap">
          <span className="h-count">{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <div className="h-bars">
            {HERO.map((_, i) => (
              <button key={i} type="button" className={`hbar${i < idx ? ' done' : ''}${i === idx ? ' on' : ''}`}
                aria-label={`${t('slideOf')} ${i + 1}`} aria-current={i === idx} onClick={() => go(i)}>
                <span className="trk">
                  <span key={i === idx ? `on-${idx}` : 'off'} className="fill" onAnimationEnd={() => { if (i === idx && !userPaused) go(idx + 1); }} />
                </span>
              </button>
            ))}
          </div>
          <div className="h-ctrl">
            <button type="button" className="h-btn" aria-label="Previous slide" onClick={() => go(idx - 1)}>
              <svg viewBox="0 0 24 24"><path d="M15.5 5 8.5 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="h-btn" aria-label={userPaused ? t('play') : t('pause')} onClick={() => setUserPaused((p) => !p)}>
              <svg viewBox="0 0 24 24">{userPaused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}</svg>
            </button>
            <button type="button" className="h-btn" aria-label="Next slide" onClick={() => go(idx + 1)}>
              <svg viewBox="0 0 24 24"><path d="M8.5 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
