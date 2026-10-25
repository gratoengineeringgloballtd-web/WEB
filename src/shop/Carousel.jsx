import { useCallback, useEffect, useRef, useState } from 'react';
import { asset, Icon, prefersReducedMotion } from '../lib/ui.jsx';
import { useShop, CAT_ICON, L } from './core.jsx';
import { galleryFor } from './placeholders.js';

/**
 * Product photo carousel: arrows, swipe, keyboard (← →), dots and thumbnails.
 * Plays on its own every 5 s until the visitor interacts, pauses on hover/focus,
 * and never auto-plays for people who prefer reduced motion.
 */
export function ProductCarousel({ product }) {
  const { s, lang } = useShop();
  const slides = galleryFor(product, asset);
  const [i, setI] = useState(0);
  const [broken, setBroken] = useState({});
  const [paused, setPaused] = useState(false);
  const [touched, setTouched] = useState(false);
  const drag = useRef(null);
  const trackRef = useRef(null);
  const n = slides.length;

  useEffect(() => { setI(0); setBroken({}); setTouched(false); }, [product.id]);

  const go = useCallback((k, user = true) => {
    if (!n) return;
    setI(((k % n) + n) % n);
    if (user) setTouched(true);
  }, [n]);

  useEffect(() => {
    if (n < 2 || paused || touched || prefersReducedMotion()) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n, paused, touched]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };

  const onDown = (e) => { if (n < 2) return; drag.current = { x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId }; };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    d.dx = e.clientX - d.x;
    if (Math.abs(d.dx) > 8 && trackRef.current) trackRef.current.style.transform = `translateX(calc(${-i * 100}% + ${d.dx}px))`;
  };
  const onUp = () => {
    const d = drag.current; drag.current = null;
    if (!d) return;
    if (trackRef.current) trackRef.current.style.transform = '';
    if (d.dx < -50) go(i + 1); else if (d.dx > 50) go(i - 1);
  };

  const name = L(product.name, lang);
  if (!n) {
    return <div className="sh-gallery"><div className="sh-gallery-main"><div className="sh-noimg" aria-hidden="true"><Icon id={CAT_ICON[product.category] || 'genset'} /></div></div></div>;
  }
  const cur = slides[i];

  return (
    <div className="sh-gallery" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <section className="sh-car" aria-roledescription="carousel" aria-label={`${s('galLabel')}: ${name}`}>
        <div
          className="sh-car-view" tabIndex={0} onKeyDown={onKey}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}
        >
          <div className="sh-car-track" ref={trackRef} style={{ transform: `translateX(${-i * 100}%)` }}>
            {slides.map((sl, k) => (
              <div className="sh-car-slide" key={sl.src} role="group" aria-roledescription="slide" aria-label={`${k + 1} / ${n}`} aria-hidden={k !== i}>
                {broken[k] ? (
                  <div className="sh-noimg" aria-hidden="true"><Icon id={CAT_ICON[product.category] || 'genset'} /></div>
                ) : (
                  <img
                    src={sl.srcLarge} alt={k === 0 ? name : `${name} (${k + 1})`} draggable="false"
                    loading={k === 0 ? 'eager' : 'lazy'} decoding="async"
                    onError={() => setBroken((b) => ({ ...b, [k]: true }))}
                  />
                )}
              </div>
            ))}
          </div>
          {cur.example && <span className="sh-car-tag">{s('galExample')}</span>}
          {n > 1 && (
            <>
              <button type="button" className="sh-car-btn prev" aria-label={s('galPrev')} onClick={() => go(i - 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
              <button type="button" className="sh-car-btn next" aria-label={s('galNext')} onClick={() => go(i + 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
              <span className="sh-car-count mono" aria-live="polite">{i + 1} / {n}</span>
            </>
          )}
        </div>
        {n > 1 && (
          <div className="sh-thumbs" role="group" aria-label={s('galLabel')}>
            {slides.map((sl, k) => (
              <button key={sl.src} type="button" aria-current={k === i ? 'true' : undefined} aria-label={s('galGo', k + 1)} onClick={() => go(k)}>
                {broken[k] ? <span className="sh-noimg"><Icon id={CAT_ICON[product.category] || 'genset'} /></span> : <img src={sl.src} alt="" loading="lazy" decoding="async" draggable="false" />}
              </button>
            ))}
          </div>
        )}
        {cur.credit && (
          <p className="sh-car-credit"><a href={cur.credit.url} target="_blank" rel="noreferrer">{s('galPhoto')}: {s('galSource')}</a></p>
        )}
      </section>
    </div>
  );
}
