import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n.jsx';
import { Icon, prefersReducedMotion } from '../lib/ui.jsx';
import { ROLLOUT } from '../data/content.js';

/**
 * Five-stage rollout timeline. With `autoplay`, it steps through the stages
 * while on screen and stops for good once the visitor picks a stage.
 * On phones it becomes a plain numbered list (handled in CSS).
 */
export default function Rollout({ autoplay = false }) {
  const { lang, t } = useLang();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const touched = useRef(false);
  const box = useRef(null);
  const btns = useRef([]);
  const R = ROLLOUT.map((r) => r[lang]);

  useEffect(() => {
    if (!autoplay || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([en]) => setPlaying(en.isIntersecting && !touched.current), { threshold: 0.45 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [autoplay]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % ROLLOUT.length), 4200);
    return () => clearInterval(id);
  }, [playing]);

  const choose = (i, focus) => {
    touched.current = true; setPlaying(false); setIdx(i);
    if (focus) requestAnimationFrame(() => btns.current[i]?.focus());
  };

  return (
    <div className="ro" ref={box}>
      <div className="ro-track" role="tablist" aria-label={t('roEyebrow')}>
        <div className="ro-fill" style={{ width: `${idx * 20}%` }} />
        {R.map((r, i) => (
          <button key={i} ref={(el) => (btns.current[i] = el)} type="button" role="tab"
            className={`ro-btn${i < idx ? ' past' : ''}`} id={`ro-${i}`} aria-controls="ro-panel"
            aria-selected={i === idx} tabIndex={i === idx ? 0 : -1}
            onClick={() => choose(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); choose((idx + 1) % 5, true); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); choose((idx + 4) % 5, true); }
            }}>
            <span className="dot">{i + 1}</span><b>{r[0]}</b>
          </button>
        ))}
      </div>
      <div key={idx} className="ro-panel swap" role="tabpanel" id="ro-panel" aria-labelledby={`ro-${idx}`}>
        <div><p className="eyebrow">{t('roStage')} {idx + 1} / 5</p><h3>{R[idx][0]}</h3><p>{R[idx][1]}</p></div>
        <div className="ro-get">
          <Icon id={ROLLOUT[idx].ic} />
          <p className="sub-h" style={{ margin: 0 }}>{t('roYou')}</p>
          <b style={{ fontSize: 18 }}>{R[idx][2]}</b>
          {playing && <span className="ro-auto"><i />{t('roAuto')}</span>}
        </div>
      </div>
      <ol className="ro-list">
        {R.map((r, i) => (
          <li key={i}><span className="n">{i + 1}</span><div><h4>{r[0]}</h4><p>{r[1]}</p><p className="get"><b>{t('roYou')}:</b> {r[2]}</p></div></li>
        ))}
      </ol>
    </div>
  );
}
