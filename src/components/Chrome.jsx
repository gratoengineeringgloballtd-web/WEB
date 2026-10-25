import { useLang, LLink } from '../lib/i18n.jsx';
import { Html, Icon, asset } from '../lib/ui.jsx';
import { CONTACT } from '../lib/helpers.js';
import { useShop } from '../shop/core.jsx';
import { useSite } from '../lib/site.jsx';

/* Footer, phone action bar, WhatsApp button and closing CTA band. */

export function Footer() {
  const { t, lang } = useLang();
  const { s } = useShop();
  const { offices } = useSite();
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <LLink className="brand" to="/"><img src={asset('img/mark.png')} alt="" width="44" height="37" /><span><b>Grato Engineering</b><small>Global Limited</small></span></LLink>
            <p>{t('ftrLine')}</p>
          </div>
          <div>
            <h4>{t('ftrCompany')}</h4>
            <ul>
              {[['about', 'navAbout'], ['services', 'navServices'], ['projects', 'navProjects'], ['news', 'navNews'], ['careers', 'navCareers'], ['contact', 'navContact']].map(([p, k]) => (
                <li key={p}><LLink to={`/${p}`}>{t(k)}</LLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{s('navShop')}</h4>
            <ul>
              <li><LLink to="/shop">{s('ftrShopAll')}</LLink></li>
              <li><LLink to="/shop?c=generators">{s('cat_generators')}</LLink></li>
              <li><LLink to="/shop?c=spare-parts">{s('cat_spare-parts')}</LLink></li>
              <li><LLink to="/shop?c=telecom">{s('cat_telecom')}</LLink></li>
              <li><LLink to="/referral">{s('referralLink')}</LLink></li>
              <li><LLink to="/account">{s('account')}</LLink></li>
            </ul>
          </div>
          <div>
            <h4>{t('ftrOffices')}</h4>
            <ul>
              {offices.map((o) => (
                <li key={o.id || o.k}>{o.tag ? (lang === 'fr' ? o.tag[1] : o.tag[0]) : o.k === 'other' ? '' : t(o.k)}{(o.tag || o.k !== 'other') && <br />}{lang === 'fr' ? o.hfr : o.h}</li>
              ))}
              <li className="mono" style={{ fontSize: 13.5 }}>{CONTACT.email}</li>
            </ul>
          </div>
          <div>
            <h4>{t('ftrFollow')}</h4>
            {/* Replace with real profile URLs, or remove accounts that do not exist. */}
            <ul>{['LinkedIn', 'Facebook', 'Instagram', 'X'].map((s) => <li key={s}><span className="ph">{s}</span></li>)}</ul>
          </div>
        </div>
        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Grato Engineering Global Limited</span>
          <Html html={t('ftrReg')} />
        </div>
      </div>
    </footer>
  );
}

export function QuickActions() {
  const { t } = useLang();
  return (
    <>
      <a className="wa" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"><Icon id="wa" /><span>{t('waLbl')}</span></a>
      <nav className="actbar" aria-label="Quick actions">
        <a href={`tel:${CONTACT.phoneHQRaw}`}><Icon id="phone" /><span>{t('abCall')}</span></a>
        <a className="w" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"><Icon id="wa" style={{ stroke: 'none', fill: 'currentColor' }} />WhatsApp</a>
        <LLink className="q" to="/quote">{t('abQuote')}</LLink>
      </nav>
    </>
  );
}

export function CtaBand() {
  const { t } = useLang();
  return (
    <section className="cta on-night">
      <div className="wrap">
        <div><h2>{t('ctaBandTitle')}</h2><p>{t('ctaBandText')}</p></div>
        <div className="hero-ctas">
          <LLink className="btn btn-red" to="/quote"><span>{t('ctaQuote')}</span><span className="arrow" aria-hidden="true">→</span></LLink>
          <LLink className="btn btn-line" to="/contact">{t('ctaCall')}</LLink>
        </div>
      </div>
    </section>
  );
}

export function PageHead({ eyebrow, title, lead, children }) {
  return (
    <div className="ph-head">
      <div className="wrap">
        {children}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Html as="h1" html={title} />
        {lead && <Html as="p" className="lead" html={lead} />}
      </div>
    </div>
  );
}

export function SecHead({ eyebrow, title, lead, className = '' }) {
  return (
    <div className={`sec-head ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Html as="h2" html={title} />
      {lead && <Html as="p" className="lead" html={lead} />}
    </div>
  );
}
