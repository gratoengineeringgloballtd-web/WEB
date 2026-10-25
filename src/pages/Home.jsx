import { useEffect, useRef } from 'react';
import { useLang, LLink, pick } from '../lib/i18n.jsx';
import { Html, Icon, Pic, Reveal, Counter, usePageTitle, prefersReducedMotion } from '../lib/ui.jsx';
import { SVCS, WHY } from '../data/content.js';
import { useSite } from '../lib/site.jsx';
import { caseProjects, YEARS_IN_OPERATION } from '../lib/helpers.js';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Rollout from '../components/Rollout.jsx';
import FootprintMap from '../components/FootprintMap.jsx';
import { Carousel, Marquee, Testimonials } from '../components/Carousels.jsx';
import { ProjectCard, LogoTile } from '../components/Projects.jsx';
import { SecHead } from '../components/Chrome.jsx';

export function ServiceCard({ s, i }) {
  const { lang, t } = useLang();
  return (
    <LLink className="svc-card" to={`/services/${s.id}`}>
      <div className="im"><Pic name={s.img} sizes="(max-width:600px) 100vw, 240px" /><Icon id={s.ic} /></div>
      <div className="body">
        <span className="no">0{i + 1}</span>
        <h3>{s[lang].n}</h3>
        <Html as="p" html={s[lang].s} />
        <span className="more">{t('more')} <span className="arrow" aria-hidden="true">→</span></span>
      </div>
    </LLink>
  );
}

export function WhyGrid({ items, id }) {
  const { lang } = useLang();
  return (
    <Reveal className="why" stagger id={id}>
      {items.map((w) => <div key={w[1]}><Icon id={w[0]} /><h3>{pick(lang, w[1], w[3])}</h3><p>{pick(lang, w[2], w[4])}</p></div>)}
    </Reveal>
  );
}

export function NewsCard({ n }) {
  const { lang, fr } = useLang();
  const [h, p] = n[lang];
  return (
    <article className="ncard">
      <div className="top"><span className="cat">{pick(lang, ...n.cat)}</span><Html html={fr && n.datefr ? n.datefr : n.date} /></div>
      <Html as="h3" html={h} /><Html as="p" html={p} />
      {n.body && n.slug && <LLink className="link nmore" to={`/news/${n.slug}`}><span>{fr ? 'Lire l’article' : 'Read the story'}</span><span className="arrow" aria-hidden="true">→</span></LLink>}
    </article>
  );
}

/** Full-width photo band with gentle parallax. */
function PhotoBand() {
  const { t } = useLang();
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const off = (r.top + r.height / 2 - innerHeight / 2) * -0.14;
        el.querySelector('img').style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="band" ref={ref}>
      <Pic name="warehouse" alt={t('altWarehouse')} />
      <div className="wrap">
        <p className="eyebrow" style={{ color: '#DADCDF' }}>{t('bandEyebrow')}</p>
        <h2>{t('bandTitle')}</h2>
        <div className="band-facts"><span>{t('bandF1')}</span><span>{t('bandF2')}</span><span>{t('bandF3')}</span></div>
      </div>
    </section>
  );
}

export default function Home() {
  const { lang, t } = useLang();
  usePageTitle('');
  const site = useSite();
  const { news, partners, clients } = site;
  const cases = caseProjects(site.projects).map(([, i]) => i);
  const tile = (name, sub) => <LogoTile key={name + sub} name={name} sub={sub} />;

  return (
    <>
      <HeroCarousel />

      <div className="stats" aria-label="Key figures">
        <div className="wrap">
          <div className="stat"><div className="num"><Counter to={YEARS_IN_OPERATION} /></div><div className="lbl">{t('stYears')}</div></div>
          {/* Tower figures to confirm before launch */}
          <div className="stat"><div className="num"><span className="ph" title="To confirm"><Counter to={150} /><span className="u">+</span></span></div><div className="lbl">{t('stBuilt')}</div></div>
          <div className="stat"><div className="num"><span className="ph" title="To confirm"><Counter to={250} /><span className="u">+</span></span></div><div className="lbl">{t('stMaint')}</div></div>
          <div className="stat"><div className="num"><Counter to={2} /></div><div className="lbl">{t('stCountries')}</div></div>
        </div>
        <div className="licences"><div className="wrap">
          <span>{t('licLabel')}</span><span className="chip">{t('licIsp')}</span><span className="chip">{t('licColo')}</span><span className="chip">{t('licShare')}</span>
        </div></div>
      </div>

      <section className="sec">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('svcEyebrow')} title={t('svcTitle')} /></Reveal>
          <Reveal className="svc-grid" stagger>{SVCS.map((s, i) => <ServiceCard key={s.id} s={s} i={i} />)}</Reveal>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('roEyebrow')} title={t('roTitle')} lead={t('roLead')} /></Reveal>
          <Reveal><Rollout autoplay /></Reveal>
        </div>
      </section>

      <PhotoBand />

      <section className="sec">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('mapEyebrow')} title={t('mapTitle')} lead={t('mapLead')} /></Reveal>
          <FootprintMap />
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal className="row-between"><SecHead eyebrow={t('projEyebrow')} title={t('projTitle')} /><LLink className="link" to="/projects"><span>{t('projAll')}</span><span className="arrow" aria-hidden="true">→</span></LLink></Reveal>
          <Reveal><Carousel key={`p${site.live}`}>{cases.map((i) => <ProjectCard key={i} index={i} set={cases} />)}</Carousel></Reveal>
        </div>
      </section>

      <section className="sec"><div className="wrap"><Reveal><Testimonials /></Reveal></div></section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('whyEyebrow')} title={t('whyTitle')} /></Reveal>
          <WhyGrid items={WHY} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="row-between"><SecHead eyebrow={t('nhEyebrow')} title={t('nhTitle')} /><LLink className="link" to="/news"><span>{t('nhAll')}</span><span className="arrow" aria-hidden="true">→</span></LLink></Reveal>
          <Reveal><Carousel key={`n${site.live}`}>{news.map((n) => <NewsCard key={n.id} n={n} />)}</Carousel></Reveal>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal className="row-between"><SecHead eyebrow={t('ptEyebrow')} title={t('ptTitle')} /><LLink className="link" to="/partners"><span>{t('ptAll')}</span><span className="arrow" aria-hidden="true">→</span></LLink></Reveal>
          <p className="row-lbl">{t('ptRowPartners')}</p>
          <Marquee key={`m${site.live}`}>{[...partners.filter((p) => p.type !== 'finance').map((p) => tile(p.name, pick(lang, p.kind.en, p.kind.fr))), ...partners.filter((p) => p.type === 'finance').map((p) => tile(p.name, pick(lang, 'Financial partner', 'Partenaire financier')))]}</Marquee>
          <p className="row-lbl">{t('ptRowClients')}</p>
          <Marquee reverse key={`c${site.live}`}>{[...clients, ...clients].map((c, k) => <LogoTile key={c.name + k} name={c.name} sub={pick(lang, c.sub.en, c.sub.fr)} />)}</Marquee>
        </div>
      </section>
    </>
  );
}
