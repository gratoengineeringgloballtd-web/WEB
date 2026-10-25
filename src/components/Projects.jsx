import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useLocalPath } from '../lib/i18n.jsx';
import { Html, Pic, asset, strip } from '../lib/ui.jsx';
import { svcName } from '../lib/helpers.js';
import { LOGO } from '../data/content.js';
import { useSite, photoSrc, logoSrc } from '../lib/site.jsx';

/* ---------- photo viewer (lightbox) ---------- */
const LightboxCtx = createContext(() => {});
export const useLightbox = () => useContext(LightboxCtx);

export function LightboxProvider({ children }) {
  const { lang, t } = useLang();
  const local = useLocalPath();
  const navigate = useNavigate();
  const dlg = useRef(null);
  const [view, setView] = useState({ i: 0, set: [] });
  const { projects } = useSite();

  const open = useCallback((i, set) => {
    setView({ i, set: set?.length ? set : [i] });
    const d = dlg.current;
    if (d && !d.open) { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } }
  }, []);
  const close = () => dlg.current?.close();
  const move = (dir) => setView(({ i, set }) => { const k = set.indexOf(i); return { i: set[(k + dir + set.length) % set.length], set }; });

  const p = projects[view.i] || projects[0], d = p ? p[lang] : null;
  return (
    <LightboxCtx.Provider value={open}>
      {children}
      <dialog className="lb" ref={dlg} aria-labelledby="lb-title"
        onClick={(e) => { if (e.target === dlg.current) close(); }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
        <button className="lb-close" type="button" aria-label="Close" onClick={close}>×</button>
        {p && <div className="lb-grid">
          <div className="lb-img">
            {p.img ? <img src={photoSrc(p.img)} alt={strip(d.t)} /> : <p style={{ color: '#ccc', padding: 40 }}>{t('photoSupply')}</p>}
          </div>
          <div className="lb-txt">
            <p className="eyebrow">{svcName(p.svc, lang)}</p>
            <Html as="h3" id="lb-title" style={{ fontSize: 30 }} html={d.t} />
            <Html as="p" style={{ color: 'var(--steel)' }} html={d.d} />
            <dl className="dl">
              <dt>{t('lbWhere')}</dt><dd><Html html={p.where} /></dd>
              <dt>{t('lbYear')}</dt><dd><Html html={p.year} /></dd>
              <dt>{t('lbClient')}</dt><dd>{p.client ? <Html html={p.client} /> : <span className="ph">{t('ifApproved')}</span>}</dd>
            </dl>
            <div className="lb-nav">
              <button className="btn btn-line btn-sm" type="button" aria-label="Previous" onClick={() => move(-1)} disabled={view.set.length < 2}>←</button>
              <button className="btn btn-line btn-sm" type="button" aria-label="Next" onClick={() => move(1)} disabled={view.set.length < 2}>→</button>
              {p.case && (
                <a className="btn btn-red btn-sm" href={local(`/projects/${p.slug}`)}
                  onClick={(e) => { e.preventDefault(); close(); navigate(local(`/projects/${p.slug}`)); }}>
                  <span>{t('readCase')}</span><span className="arrow" aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </div>
        </div>}
      </dialog>
    </LightboxCtx.Provider>
  );
}

/* ---------- project card ---------- */
export function ProjectCard({ index, set }) {
  const { lang, t } = useLang();
  const open = useLightbox();
  const { projects } = useSite();
  const p = projects[index];
  if (!p) return null;
  const d = p[lang];
  return (
    <button type="button" className={`proj${p.img ? '' : ' empty'}`} aria-label={`${strip(d.t)}, ${t('quickView')}`} onClick={() => open(index, set)}>
      <div className={`pi${p.img ? '' : ' ph-box'}`}>
        {p.img ? <Pic name={p.img} alt={strip(d.t)} sizes="(max-width:600px) 100vw, 380px" /> : <span>{t('photoSupply')}</span>}
        <span className="svc">{svcName(p.svc, lang)}</span>
      </div>
      <div className="pb">
        <Html as="h3" html={d.t} />
        <p className="meta"><Html html={p.where} /> · <Html html={p.year} /></p>
        {p.case && <span className="cs">{t('readCase')} <span className="arrow" aria-hidden="true">→</span></span>}
      </div>
    </button>
  );
}

/** Grid of project cards that open the viewer, stepping through this grid's projects. */
export function ProjectGrid({ indices, empty }) {
  if (!indices.length) return <p className="no-results" style={{ gridColumn: '1/-1' }}>{empty}</p>;
  return <div className="proj-grid">{indices.map((i) => <ProjectCard key={i} index={i} set={indices} />)}</div>;
}

/* ---------- logo tile ---------- */
/** Logo for a partner or client: the one set in the admin dashboard, else the built-in one. */
export function useLogo(name) {
  const { partners, clients } = useSite();
  const hit = [...partners, ...clients].find((x) => x.name === name || (name === 'Access Bank' && x.name.startsWith('Access Bank')));
  if (hit) return logoSrc(hit.logo);
  return LOGO[name] ? asset(`img/logos/${LOGO[name]}.webp`) : null;
}

export function LogoTile({ name, sub }) {
  const { fr } = useLang();
  const src = useLogo(name);
  return (
    <div className="logo-tile">
      {src
        ? <img src={src} alt={name} loading="lazy" />
        : (
          <span style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
            <b style={{ font: '700 20px/1.1 var(--f-display)', color: '#1C1F23' }}>{name}</b>
            <span className="ph" style={{ fontSize: 12 }}>{fr ? 'logo à fournir' : 'logo to supply'}</span>
          </span>
        )}
      {sub && <small>{sub}</small>}
    </div>
  );
}

export function LogoMark({ name }) {
  const { fr } = useLang();
  const src = useLogo(name);
  return src
    ? <img src={src} alt={name} loading="lazy" />
    : <span style={{ display: 'grid', gap: 6, justifyItems: 'center' }}><b style={{ font: '700 20px/1.1 var(--f-display)', color: '#1C1F23' }}>{name}</b><span className="ph" style={{ fontSize: 12 }}>{fr ? 'logo à fournir' : 'logo to supply'}</span></span>;
}

/** Close the viewer whenever the page changes. */
export function useCloseLightboxOnRoute(pathname) {
  useEffect(() => { document.querySelector('dialog.lb[open]')?.close(); }, [pathname]);
}
