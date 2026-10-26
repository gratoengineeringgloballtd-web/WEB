import { useEffect, useRef, useState } from 'react';
import { ICONS } from '../data/icons.js';
import { HAS480 } from '../data/content.js';
import { mediaUrl } from './apiBase.js';

export const BASE = import.meta.env.BASE_URL;
export const asset = (p) => BASE + p.replace(/^\//, '');

/** Wrap [[text]] in a highlighted placeholder span. */
export const ph = (s) => String(s ?? '').replace(/\[\[(.+?)\]\]/g, '<span class="ph" title="To confirm / À confirmer">$1</span>');
/** Remove placeholder brackets (for alt text, attributes, plain labels). */
export const strip = (s) => String(s ?? '').replace(/\[\[|\]\]/g, '');

/** Render trusted site copy that may contain <em>, <br> or [[placeholders]]. */
export function Html({ as: Tag = 'span', html, ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: ph(html) }} />;
}

export function Icon({ id, className = '', style }) {
  const ic = ICONS[id];
  if (!ic) return null;
  return <svg className={`ic ${className}`} viewBox={ic.viewBox} aria-hidden="true" style={style} dangerouslySetInnerHTML={{ __html: ic.body }} />;
}

/** Responsive photo with a 480px phone version where one exists. */
export function Pic({ name, alt = '', sizes = '100vw', eager = false, ...rest }) {
  if (name && /[/:]/.test(name)) {
    // An uploaded photo (/api/images/…) or another full path, e.g. from the admin dashboard.
    const src = /^(https?:|\/api\/)/.test(name) ? mediaUrl(name) : asset(name);
    return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" {...rest} />;
  }
  const has = HAS480.includes(name);
  return (
    <img
      src={asset(`img/${name}.webp`)}
      srcSet={has ? `${asset(`img/${name}-480.webp`)} 480w, ${asset(`img/${name}.webp`)} 960w` : undefined}
      sizes={has ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll reveal. Content is always readable; blocks that start below the fold
 * get a short lift as they arrive. `stagger` animates children one after another.
 */
export function Reveal({ as: Tag = 'div', className = '', stagger = false, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    if (stagger) [...el.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 8)));
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
    el.classList.add('rv-w');
    let doneT;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        el.classList.remove('rv-w');
        io.disconnect();
        if (stagger) doneT = setTimeout(() => el.classList.add('stg-done'), 1400);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(doneT); };
  }, [stagger]);
  return <Tag ref={ref} className={`rv${stagger ? ' stg' : ''} ${className}`} {...rest}>{children}</Tag>;
}

/** Number that counts up once when it scrolls into view. */
export function Counter({ to }) {
  const ref = useRef(null);
  const [val, setVal] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    let raf;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1300;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setVal(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className="count">{val}</span>;
}

export function usePageTitle(title) {
  useEffect(() => {
    const t = strip(title);
    document.title = t ? `${t} | Grato Engineering` : 'Grato Engineering Global Limited';
  }, [title]);
}

export const fmtSize = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
