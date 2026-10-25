import { useState } from 'react';
import { useLang, LLink, pick } from '../lib/i18n.jsx';
import { Html, Reveal } from '../lib/ui.jsx';
import { MAP } from '../data/map.js';
import { LOCS } from '../data/content.js';

/**
 * Clickable footprint map: offices (round pins) and project sites (diamonds).
 * Selecting a pin highlights its card and the reverse. Pins animate in on scroll.
 * To add a project site, add an entry to LOCS (content.js) and a marker below.
 */
export default function FootprintMap() {
  const { lang, t } = useLang();
  const [active, setActive] = useState('douala');
  const P = MAP.pins, Lb = MAP.labels;
  const [lx, ly] = P.lugbe;
  const pinProps = (k, label) => ({
    role: 'button', tabIndex: 0, 'aria-pressed': active === k, 'aria-label': label,
    onClick: () => setActive(k),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(k); } },
  });

  return (
    <Reveal className="map-wrap">
      <div className="map-box">
        <svg viewBox={`0 0 ${MAP.W} ${MAP.H}`} role="group" aria-label={t('mapTitle')}>
          <rect width={MAP.W} height={MAP.H} fill="var(--map-sea)" />
          {MAP.countries.map((c) => <path key={c.id} className={c.hi ? 'c-hi' : 'c-land'} d={c.d}><title>{c.name}</title></path>)}
          <text className="map-lbl" x={Lb.ng[0]} y={Lb.ng[1]} textAnchor="middle">NIGERIA</text>
          <text className="map-lbl" x={Lb.cm[0]} y={Lb.cm[1]} textAnchor="middle">{t('mapCm')}</text>
          <text className="map-sea-lbl" x={Lb.sea[0]} y={Lb.sea[1]} textAnchor="middle">{t('mapSea')}</text>

          <g className="pin" data-loc="douala" {...pinProps('douala', 'Douala')}>
            <circle className="halo" cx={P.douala[0]} cy={P.douala[1]} r="18" />
            <circle className="dot" cx={P.douala[0]} cy={P.douala[1]} r="8" />
            <text className="pl" textAnchor="end" x={P.douala[0] - 16} y={P.douala[1] + 5}>Douala</text>
          </g>
          <g className="pin" data-loc="abuja" {...pinProps('abuja', 'Abuja')}>
            <circle className="halo" cx={P.abuja[0]} cy={P.abuja[1]} r="18" />
            <circle className="dot" cx={P.abuja[0]} cy={P.abuja[1]} r="8" />
            <text className="pl" x={P.abuja[0] + 16} y={P.abuja[1] + 5}>Abuja</text>
          </g>
          <g className="pin ppin" data-loc="lugbe" {...pinProps('lugbe', 'Lugbe project site')}>
            <path className="lead-line" d={`M${lx} ${ly} L192 263`} />
            <rect className="tagbox" x="42" y="250" width="150" height="26" rx="4" />
            <text className="tagtxt" x="50" y="267">{t('mapLugbe')}</text>
            <path className="dia" d={`M${lx} ${ly - 6}l6 6-6 6-6-6z`} />
          </g>
        </svg>
        <div className="legend">
          <span><i className="o" /><span>{t('lgOffice')}</span></span>
          <span><i className="d" /><span>{t('lgProject')}</span></span>
        </div>
      </div>

      <div className="loc-list">
        {Object.entries(LOCS).map(([k, l]) => (
          <div key={k} className={`loc${l.proj ? ' proj' : ''}`} {...pinProps(k, pick(lang, ...l.h))}
            onClick={(e) => { if (!e.target.closest('a')) setActive(k); }}>
            <span className="tag">{pick(lang, ...l.tag)}</span>
            <h3>{pick(lang, ...l.h)}</h3>
            <Html as="p" html={pick(lang, ...l.p)} />
            {l.c && <span className="coord">{l.c}</span>}
            {l.proj && <LLink className="link" to={`/projects/${l.proj}`}>{t('readCase')} <span className="arrow" aria-hidden="true">→</span></LLink>}
          </div>
        ))}
      </div>
    </Reveal>
  );
}
