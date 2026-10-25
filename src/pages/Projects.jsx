import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLang, LLink } from '../lib/i18n.jsx';
import { Html, Pic, Reveal, strip, usePageTitle } from '../lib/ui.jsx';
import { SVCS, METRICS } from '../data/content.js';
import { useSite, photoSrc } from '../lib/site.jsx';
import { svcOf, caseProjects } from '../lib/helpers.js';
import { PageHead } from '../components/Chrome.jsx';
import { ProjectGrid, useLightbox } from '../components/Projects.jsx';
import NotFound from './NotFound.jsx';

export function ProjectsPage() {
  const { lang, t } = useLang();
  usePageTitle(t('navProjects'));
  const [svc, setSvc] = useState('all');
  const { projects } = useSite();
  const list = projects.map((p, i) => [p, i]).filter(([p]) => svc === 'all' || p.svc === svc).map(([, i]) => i);
  const Btn = ({ v, label }) => <button type="button" className="fbtn" aria-pressed={svc === v} onClick={() => setSvc(v)}>{label}</button>;
  return (
    <>
      <PageHead eyebrow={t('pjEyebrow')} title={t('pjTitle')} lead={t('pjLead')} />
      <section className="sec">
        <div className="wrap">
          <div className="filters">
            <div className="fgroup"><span>{t('fService')}</span><Btn v="all" label={t('all')} />{SVCS.map((s) => <Btn key={s.id} v={s.id} label={s[lang].n} />)}</div>
          </div>
          <p className="vh" aria-live="polite">{t('count')(list.length)}</p>
          <ProjectGrid key={svc} indices={list} empty={t('noRes')} />
        </div>
      </section>
    </>
  );
}

export function CaseStudy() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const open = useLightbox();
  const site = useSite();
  const { projects } = site;
  const i = projects.findIndex((p) => p.slug === slug && p.case);
  usePageTitle(i >= 0 ? projects[i][lang].t : t('nfTitle'));
  if (i < 0) return site.live ? <NotFound /> : <div className="sec" />;

  const p = projects[i], d = p[lang], s = svcOf(p.svc);
  const M = (METRICS[p.svc] || METRICS.telecom)[lang];
  const cases = caseProjects(projects);
  const k = cases.findIndex(([x]) => x.slug === slug);
  const prv = cases[(k - 1 + cases.length) % cases.length][0], nxt = cases[(k + 1) % cases.length][0];
  const sameSvc = cases.filter(([x]) => x.slug !== slug && x.svc === p.svc).map(([, j]) => j);
  const more = (sameSvc.length ? sameSvc : cases.filter(([x]) => x.slug !== slug).map(([, j]) => j)).slice(0, 3);

  return (
    <>
      <div className="ph-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><LLink to="/projects">{t('navProjects')}</LLink><span aria-hidden="true">/</span><span>{strip(d.t)}</span></nav>
          <div className="case-top">
            <div style={{ display: 'grid', gap: 16 }}>
              <p className="eyebrow">{s[lang].n}</p>
              <Html as="h1" html={d.t} />
              <p className="mono" style={{ color: 'var(--steel)', fontSize: 14 }}><Html html={p.where} /> · <Html html={p.year} /></p>
              {/* Key results: replace each "—" with the measured figure */}
              <div className="metrics">{M.map((m, k) => <div className="metric" key={m}><b>{p.metrics?.[k] ? <Html html={p.metrics[k]} /> : <span className="ph">—</span>}</b><span>{m}</span></div>)}</div>
            </div>
            <div>
              {p.img && <Pic name={p.img} alt={strip(d.t)} sizes="(max-width:860px) 100vw, 600px" eager onClick={() => open(i)} style={{ cursor: 'zoom-in' }} />}
              {p.img && <p className="credit">{t('photoReal')}</p>}
            </div>
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap case-body">
          <div>
            <Reveal className="case-sec"><h2>{t('csChallenge')}</h2>{d.ch ? <Paras text={d.ch} /> : <p><span className="ph">{t('csChallengePh')}</span></p>}</Reveal>
            <Reveal className="case-sec"><h2>{t('csSolution')}</h2><Paras text={d.sol} /></Reveal>
            <Reveal className="case-sec"><h2>{t('csResult')}</h2>{d.res ? <Paras text={d.res} /> : <p><span className="ph">{t('csResultPh')}</span></p>}</Reveal>
            {p.images?.length > 0 && (
              <Reveal className="case-gallery">{p.images.map((u) => <img key={u} src={photoSrc(u)} alt="" loading="lazy" decoding="async" />)}</Reveal>
            )}
            <nav className="svc-next mt" aria-label="Case studies">
              <LLink to={`/projects/${prv.slug}`}><small>← {t('prevCase')}</small><Html as="b" html={prv[lang].t} /></LLink>
              <LLink to={`/projects/${nxt.slug}`}><small>{t('nextCase')} →</small><Html as="b" html={nxt[lang].t} /></LLink>
            </nav>
          </div>
          <aside className="facts">
            <p className="sub-h" style={{ margin: 0 }}>{t('csFacts')}</p>
            <dl className="dl">
              <dt>{t('lbClient')}</dt><dd>{p.client ? <Html html={p.client} /> : <span className="ph">{t('ifApproved')}</span>}</dd>
              <dt>{t('lbWhere')}</dt><dd><Html html={p.where} /></dd>
              <dt>{t('lbYear')}</dt><dd><Html html={p.year} /></dd>
              <dt>{t('lbService')}</dt><dd><LLink to={`/services/${s.id}`}>{s[lang].n}</LLink></dd>
              <dt>{t('lbScope')}</dt><dd>{d.scope ? <Html html={d.scope} /> : <span className="ph">{lang === 'fr' ? 'À préciser' : 'To describe'}</span>}</dd>
            </dl>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, display: 'grid', gap: 12 }}>
              <b style={{ font: '700 22px var(--f-display)' }}>{t('csSimilar')}</b>
              <LLink className="btn btn-red btn-sm" to={`/quote?service=${s.id}`}><span>{t('ctaQuote')}</span><span className="arrow" aria-hidden="true">→</span></LLink>
            </div>
          </aside>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="row-between"><div className="sec-head"><p className="eyebrow">{t('csMore')}</p></div><LLink className="link" to="/projects">{t('csBack')} <span className="arrow" aria-hidden="true">→</span></LLink></div>
          <ProjectGrid indices={more} />
        </div>
      </section>
    </>
  );
}

/** Plain text from the admin dashboard, split into paragraphs on blank lines. */
export function Paras({ text }) {
  return String(text || '').split(/\n\s*\n/).map((para, k) => <Html as="p" key={k} html={para.replace(/\n/g, '<br>')} />);
}
