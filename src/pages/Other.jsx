import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useLang, pick, LLink } from '../lib/i18n.jsx';
import { Html, Icon, Pic, Reveal, usePageTitle } from '../lib/ui.jsx';
import { CRWHY, TRUST, SVCS } from '../data/content.js';
import { useSite } from '../lib/site.jsx';
import NotFound from './NotFound.jsx';
import { Paras } from './Projects.jsx';
import { CONTACT } from '../lib/helpers.js';
import { PageHead, SecHead } from '../components/Chrome.jsx';
import { LogoMark, LogoTile } from '../components/Projects.jsx';
import { QuoteForm, CareersForm } from '../components/Forms.jsx';
import { WhyGrid } from './Home.jsx';

export function Partners() {
  const { lang, t } = useLang();
  const { partners, clients } = useSite();
  usePageTitle(t('navPartners'));
  return (
    <>
      <PageHead eyebrow={t('paEyebrow')} title={t('paTitle')} lead={t('paLead')} />
      <section className="sec">
        <div className="wrap">
          <p className="sub-h">{t('ptRowPartners')}</p>
          <Reveal className="pcards" stagger>
            {partners.filter((p) => p.type !== 'finance').map((p) => (
              <div className="pcard" key={p.name}>
                <div className="lg"><LogoMark name={p.name} /></div>
                <span className="kind">{pick(lang, p.kind.en, p.kind.fr)}</span>
                <Html as="p" html={pick(lang, p.desc.en, p.desc.fr)} />
              </div>
            ))}
          </Reveal>
          <p className="sub-h mt">{t('paFinance')}</p>
          <div className="pcards">
            {partners.filter((p) => p.type === 'finance').map((p) => (
              <div className="pcard feature" key={p.name}>
                <div className="lg"><LogoMark name={p.name} /></div>
                <b style={{ font: '700 22px var(--f-display)' }}>{p.name}</b>
                <span className="kind">{pick(lang, p.kind.en, p.kind.fr)}</span>
                <Html as="p" html={pick(lang, p.desc.en, p.desc.fr)} />
              </div>
            ))}
          </div>
          <p className="sub-h mt">{t('ptRowClients')}</p>
          <div className="logos">{clients.map((c) => <LogoTile key={c.name} name={c.name} sub={pick(lang, c.sub.en, c.sub.fr)} />)}</div>
        </div>
      </section>
    </>
  );
}

export function News() {
  const { lang, fr, t } = useLang();
  const { news } = useSite();
  usePageTitle(t('navNews'));
  return (
    <>
      <PageHead eyebrow={t('nwEyebrow')} title={t('nwTitle')} lead={t('nwLead')} />
      <section className="sec">
        <div className="wrap">
          {/* News is edited in the admin dashboard (Admin → News). */}
          <Reveal className="news" stagger>
            {news.map((n) => {
              const [h, p] = n[lang];
              const top = <div className="top"><span className="cat">{pick(lang, ...n.cat)}</span><Html html={fr && n.datefr ? n.datefr : n.date} /></div>;
              const more = n.body && n.slug ? <LLink className="link nmore" to={`/news/${n.slug}`}><span>{fr ? 'Lire l’article' : 'Read the story'}</span><span className="arrow" aria-hidden="true">→</span></LLink> : null;
              return n.lead && n.img ? (
                <article className="lead-story" key={n.id}><Pic name={n.img} sizes="(max-width:760px) 100vw, 600px" /><div className="t">{top}<Html as="h3" html={h} /><Html as="p" html={p} />{more}</div></article>
              ) : (
                <article key={n.id}>{n.img && <Pic name={n.img} className="nimg" sizes="(max-width:760px) 100vw, 400px" />}{top}<Html as="h3" html={h} /><Html as="p" html={p} />{more}</article>
              );
            })}
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function NewsArticle() {
  const { slug } = useParams();
  const { lang, fr, t } = useLang();
  const site = useSite();
  const n = site.news.find((x) => x.slug === slug && x.body);
  usePageTitle(n ? n[lang][0] : t('navNews'));
  if (!n) return site.live ? <NotFound /> : <div className="sec" />;
  const [h, p] = n[lang];
  const body = (n.body?.[lang] || n.body?.en || '');
  return (
    <>
      <div className="ph-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><LLink to="/news">{t('navNews')}</LLink><span aria-hidden="true">/</span><span>{pick(lang, ...n.cat)}</span></nav>
          <p className="eyebrow">{pick(lang, ...n.cat)} · <Html html={fr && n.datefr ? n.datefr : n.date} /></p>
          <Html as="h1" html={h} />
          <Html as="p" className="lead" html={p} />
        </div>
      </div>
      <section className="sec">
        <div className="wrap article">
          {n.img && <Pic name={n.img} className="article-img" sizes="(max-width:900px) 100vw, 900px" eager />}
          <div className="article-body"><Paras text={body} /></div>
          <p><LLink className="link" to="/news">← {t('navNews')}</LLink></p>
        </div>
      </section>
    </>
  );
}

export function Careers() {
  const { lang, t } = useLang();
  const { jobs } = useSite();
  usePageTitle(t('navCareers'));
  const [role, setRole] = useState('');
  const formRef = useRef(null);
  const apply = (i) => {
    setRole(String(i));
    formRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => document.getElementById('cname')?.focus({ preventScroll: true }), 450);
  };
  return (
    <>
      <PageHead eyebrow={t('crEyebrow')} title={t('crTitle')} lead={t('crLead')} />
      <section className="sec">
        <div className="wrap">
          <WhyGrid items={CRWHY} />
          <div className="mt">
            <div className="row-between"><SecHead eyebrow={t('crOpenEyebrow')} title={t('crOpenTitle')} /></div>
            <div className="jobs">
              {jobs.map((j) => (
                <div className="job" key={j.id}><b>{j[lang][0]}</b><span className="m">{j[lang][1]}</span>
                  <button type="button" className="btn btn-line btn-sm" onClick={() => apply(j.id)}>{t('apply')}</button>
                  {j.desc && (j.desc[lang] || j.desc.en) && (
                    <details className="job-more"><summary>{lang === 'fr' ? 'Voir le poste' : 'About the role'}</summary><Paras text={j.desc[lang] || j.desc.en} /></details>
                  )}
                </div>
              ))}
              {!jobs.length && <p className="no-results">{lang === 'fr' ? 'Aucun poste ouvert pour le moment. Envoyez-nous une candidature spontanée.' : 'No open positions right now. Send us a general application.'}</p>}
            </div>
          </div>
        </div>
      </section>
      <section className="sec alt">
        <div className="wrap two">
          <div className="sec-head">
            <p className="eyebrow">{t('crApplyEyebrow')}</p><h2>{t('crApplyTitle')}</h2><p className="lead">{t('crApplyLead')}</p>
            <p className="cline">{t('crEmailLbl')} <span className="val ph">careers@gratoengineering.com</span></p>
          </div>
          <div ref={formRef}><CareersForm role={role} setRole={setRole} jobs={jobs} /></div>
        </div>
      </section>
    </>
  );
}

function CopyButton({ text }) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  const copy = async (e) => {
    try { await navigator.clipboard.writeText(text); }
    catch (err) { const r = document.createRange(); r.selectNodeContents(e.currentTarget.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    setDone(true); setTimeout(() => setDone(false), 1600);
  };
  return <button type="button" className="copy" onClick={copy}>{done ? t('copied') : t('copy')}</button>;
}

export function Contact() {
  const { lang, t } = useLang();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const isQuote = /\/quote$/.test(pathname);
  const pre = params.get('service');
  const initialService = SVCS.some((s) => s.id === pre) ? pre : '';
  const initialDetails = (params.get('details') || '').slice(0, 600);
  usePageTitle(isQuote ? t('ctaQuote') : t('navContact'));
  const { offices } = useSite();

  useEffect(() => {
    document.body.classList.add('on-contact');
    return () => document.body.classList.remove('on-contact');
  }, []);
  useEffect(() => {
    if (isQuote) setTimeout(() => document.getElementById('quote')?.scrollIntoView({ block: 'start' }), 40);
  }, [isQuote, pre]);

  return (
    <>
      <PageHead eyebrow={t('ctEyebrow')} title={t('ctTitle')} lead={t('ctLead')} />
      <section className="sec">
        <div className="wrap contact-grid">
          <QuoteForm key={initialService + initialDetails} initialService={initialService} initialDetails={initialDetails} />
          <div className="side">
            <div className="trust">
              <p className="sub-h" style={{ margin: 0 }}>{t('trustTitle')}</p>
              <ul>{TRUST.map((r) => <li key={r[1]}><Icon id={r[0]} /><div><b>{pick(lang, r[1], r[3])}</b><span>{pick(lang, r[2], r[4])}</span></div></li>)}</ul>
            </div>
            <div className="talk">
              <h3 style={{ fontSize: 24 }}>{t('talkTitle')}</h3>
              <p>{t('talkText')}</p>
              <a className="btn btn-sm" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"><Icon id="wa" /><span>{t('talkBtn')}</span></a>
              <p className="mono" style={{ fontSize: 13 }}>{CONTACT.phoneHQ} <span className="ph">{t('toConfirm')}</span></p>
            </div>
            {offices.map((o) => (
              <div className="office" key={o.id || o.k}>
                <span className="tag">{o.tag ? pick(lang, o.tag[0], o.tag[1]) : o.k === 'other' ? '' : t(o.k)}</span>
                <h3>{pick(lang, o.h, o.hfr)}</h3>
                <Html as="address" html={pick(lang, o.a, o.afr)} />
                <div className="cline">{t('tel')} <span className="val"><span><a href={`tel:${o.tel.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>{o.tel}</a></span></span><CopyButton text={o.tel} /></div>
                <div className="cline">{t('email')} <span className="val">{o.email || CONTACT.email}</span><CopyButton text={o.email || CONTACT.email} /></div>
                <div className="cline">{t('hours')} {o.hours ? <span className="val">{pick(lang, o.hours[0], o.hours[1])}</span> : <span className="val ph">{pick(lang, 'Mon–Fri, hours to confirm', 'Lun–Ven, horaires à confirmer')}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
