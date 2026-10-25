import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n.jsx';
import { Icon } from '../lib/ui.jsx';
import { TESTI } from '../data/content.js';

/**
 * Card carousel built on native scroll-snap: swipe on touch, drag with a mouse,
 * arrows and dots. Dragging never triggers the card underneath.
 */
export function Carousel({ children, className = '' }) {
  const track = useRef(null);
  const [state, setState] = useState({ n: 1, i: 0, atStart: true, atEnd: false });
  const drag = useRef({ down: false, moved: false, x: 0, left: 0 });

  const step = useCallback(() => {
    const el = track.current, c = el?.children[0];
    if (!c) return el?.clientWidth || 1;
    return c.getBoundingClientRect().width + (parseFloat(getComputedStyle(el).columnGap) || 18);
  }, []);

  const update = useCallback(() => {
    const el = track.current; if (!el) return;
    const st = step(), max = el.scrollWidth - el.clientWidth;
    const n = Math.max(1, Math.round(max / st) + 1);
    setState({ n, i: Math.min(n - 1, Math.round(el.scrollLeft / st)), atStart: el.scrollLeft < 4, atEnd: el.scrollLeft > max - 4 });
  }, [step]);

  useEffect(() => {
    const el = track.current; if (!el) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(onScroll) : null;
    ro?.observe(el);
    onScroll();
    const move = (e) => {
      const d = drag.current; if (!d.down) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 6) { d.moved = true; el.classList.add('drag'); }
      if (d.moved) el.scrollLeft = d.left - dx;
    };
    const up = () => {
      const d = drag.current; if (!d.down) return; d.down = false;
      if (d.moved) {
        el.classList.remove('drag');
        el.scrollTo({ left: Math.round(el.scrollLeft / step()) * step(), behavior: 'smooth' });
        setTimeout(() => { d.moved = false; }, 50);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); ro?.disconnect();
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); cancelAnimationFrame(raf);
    };
  }, [update, step, children]);

  const by = (dir) => track.current?.scrollBy({ left: dir * step(), behavior: 'smooth' });

  return (
    <div className={`car ${className}`}>
      <div
        className="car-track" ref={track}
        onPointerDown={(e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; Object.assign(drag.current, { down: true, moved: false, x: e.clientX, left: track.current.scrollLeft }); }}
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); } }}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </div>
      <div className="car-bar">
        <div className="car-dots">
          {Array.from({ length: state.n }, (_, k) => (
            <button key={k} type="button" aria-label={`${k + 1} / ${state.n}`} aria-current={k === state.i}
              onClick={() => track.current?.scrollTo({ left: k * step(), behavior: 'smooth' })} />
          ))}
        </div>
        <div className="car-nav">
          <button type="button" aria-label="Previous" disabled={state.atStart} onClick={() => by(-1)}><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>
          <button type="button" aria-label="Next" disabled={state.atEnd} onClick={() => by(1)}><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
        </div>
      </div>
    </div>
  );
}

/** Endless logo strip. The second copy is hidden from screen readers; hover pauses it. */
export function Marquee({ children, reverse = false, id }) {
  const items = Children.toArray(children);
  return (
    <div className={`mq${reverse ? ' rev' : ''}`} id={id}>
      <div className="mq-track">
        {items}
        <div className="dup" aria-hidden="true">{items}</div>
      </div>
    </div>
  );
}

/** Rotating testimonials with progress dots (8 s each). */
export function Testimonials() {
  const { lang, t } = useLang();
  const [idx, setIdx] = useState(0);
  const refs = useRef([]);
  const n = TESTI.length;
  useEffect(() => { refs.current.forEach((el, k) => { if (el) el.inert = k !== idx; }); }, [idx]);
  return (
    <div className="tm" role="region" aria-roledescription="carousel" aria-label="Testimonials">
      <div className="tm-slides">
        {TESTI.map((q, i) => (
          <figure key={i} ref={(el) => (refs.current[i] = el)} className={`quote tm-s${i === idx ? ' on' : ''}`} style={{ margin: 0 }}
            role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>
            <Icon id="quote" />
            <div>
              {/* Replace with approved quotes; remove the "ph" class once real. */}
              <blockquote><span className="ph">{q[lang][0]}</span></blockquote>
              <cite><span className="ph">{q[lang][1]}</span></cite>
            </div>
          </figure>
        ))}
      </div>
      <div className="tm-dots">
        {TESTI.map((_, i) => (
          <button key={i} type="button" className={i === idx ? 'on' : ''} aria-label={`${t('slideOf')} ${i + 1}`} aria-current={i === idx} onClick={() => setIdx(i)}>
            <span className="trk"><span key={i === idx ? `on-${idx}` : 'off'} className="fill" onAnimationEnd={() => i === idx && setIdx((idx + 1) % n)} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

