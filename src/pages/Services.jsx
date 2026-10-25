import { useParams } from 'react-router-dom';
import { useLang, LLink } from '../lib/i18n.jsx';
import { Html, Icon, Pic, Reveal, strip, usePageTitle } from '../lib/ui.jsx';
import { SVCS, STEPS } from '../data/content.js';
import { useSite } from '../lib/site.jsx';
import { PageHead, SecHead } from '../components/Chrome.jsx';
import Rollout from '../components/Rollout.jsx';
import { ProjectGrid } from '../components/Projects.jsx';
import NotFound from './NotFound.jsx';
import GeneratorSales, { GeneratorCarousel } from '../components/GeneratorSales.jsx';

export function ServicesOverview() {
  const { lang, t } = useLang();
  usePageTitle(t('navServices'));
  return (
    <>
      <PageHead eyebrow={t('svEyebrow')} title={t('svTitle')} lead={t('svLead')} />
      <section className="sec">
        <div className="wrap">
          <div className="svc-rows">
            {SVCS.map((s, i) => (
              <Reveal as="article" className="svc-row" key={s.id}>
                <div className="svc-row-img"><Pic name={s.img} sizes="(max-width:760px) 100vw, 560px" /></div>
                <div className="svc-row-txt">
                  <Icon id={s.ic} />
                  <p className="eyebrow">{t('svcCount')} 0{i + 1}</p>
                  <h2>{s[lang].n}</h2>
                  <Html as="p" className="lead" html={s[lang].p} />
                  <ul>{s[lang].d.slice(0, 4).map((x) => <li key={x}>{strip(x)}</li>)}</ul>
                  <p><LLink className="link" to={`/services/${s.id}`}>{t('more')} <span className="arrow" aria-hidden="true">→</span></LLink></p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="sec alt">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('roEyebrow')} title={t('roTitle')} lead={t('roLead')} /></Reveal>
          <Reveal><Rollout /></Reveal>
        </div>
      </section>
    </>
  );
}

export function ServiceDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { projects } = useSite();
  const i = SVCS.findIndex((s) => s.id === id);
  usePageTitle(i >= 0 ? SVCS[i][lang].n : t('nfTitle'));
  if (i < 0) return <NotFound />;
  const s = SVCS[i], d = s[lang];
  const prev = SVCS[(i + SVCS.length - 1) % SVCS.length], next = SVCS[(i + 1) % SVCS.length];
  const related = projects.map((p, j) => [p, j]).filter(([p]) => p.svc === s.id).map(([, j]) => j);

  return (
    <>
      <div className="ph-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><LLink to="/services">{t('navServices')}</LLink><span aria-hidden="true">/</span><span>{d.n}</span></nav>
          <div className="svc-hero">
            <div style={{ display: 'grid', gap: 16 }}>
              <p className="eyebrow">{t('svcCount')} 0{i + 1} / 0{SVCS.length}</p>
              <h1>{d.n}</h1>
              <Html as="p" className="lead" html={d.p} />
              <p><LLink className="btn btn-red" to={`/quote?service=${s.id}`}><span>{t('quoteThis')}</span><span className="arrow" aria-hidden="true">→</span></LLink></p>
            </div>
            {s.id === 'generators' ? <GeneratorCarousel /> : (
              <div>
                <Pic name={s.img} sizes="(max-width:760px) 100vw, 560px" eager />
                <p className="credit">{s.real ? t('photoReal') : <span className="ph">{t('photoProfile')}</span>}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <section className="sec">
        <div className="wrap svc-body">
          <Reveal><p className="sub-h">{t('deliv')}</p><ul className="deliv">{d.d.map((x) => <Html as="li" key={x} html={x} />)}</ul></Reveal>
          {s.id === 'generators' && <GeneratorSales />}
          <Reveal><p className="sub-h">{t('how')}</p><ol className="steps">{STEPS[lang].map(([a, b]) => <li key={a}><b>{a}</b><p>{b}</p></li>)}</ol></Reveal>
          {s.partners.length > 0 && <Reveal><p className="sub-h">{t('related')}</p><div className="chips">{s.partners.map((p) => <span key={p}>{p}</span>)}</div></Reveal>}
          {related.length > 0 && <Reveal><p className="sub-h">{t('relProj')}</p><ProjectGrid indices={related} /></Reveal>}
          <nav className="svc-next" aria-label="Services">
            <LLink to={`/services/${prev.id}`}><small>← {t('prev')}</small><b>{prev[lang].n}</b></LLink>
            <LLink to={`/services/${next.id}`}><small>{t('next2')} →</small><b>{next[lang].n}</b></LLink>
          </nav>
        </div>
      </section>
    </>
  );
}
