import { useLang, pick } from '../lib/i18n.jsx';
import { Html, Icon, Pic, Reveal, asset, usePageTitle } from '../lib/ui.jsx';
import { TIMELINE, VALUES, CERTS, LICS } from '../data/content.js';
import { PageHead, SecHead } from '../components/Chrome.jsx';

const LEADERS = [
  { initials: 'TO', name: 'Engr. Tom Omeje', role: ['Chief Executive Officer', 'Directeur général'],
    bio: ['Leads the company’s regional growth, infrastructure partnerships, telecoms expansion and energy systems development across Africa.',
      'Pilote la croissance régionale, les partenariats d’infrastructure, l’expansion télécom et le développement des systèmes d’énergie en Afrique.'] },
  { placeholder: true }, { placeholder: true },
];

export default function About() {
  const { lang, t } = useLang();
  usePageTitle(t('navAbout'));
  return (
    <>
      <PageHead eyebrow={t('abEyebrow')} title={t('abTitle')} />

      <section className="sec">
        <div className="wrap two">
          <Reveal className="prose"><p>{t('abP1')}</p><p>{t('abP2')}</p><p>{t('abP3')}</p></Reveal>
          <Reveal as="figure" className="figure">
            <Pic name="warehouse" alt={t('altWarehouse')} sizes="(max-width:860px) 100vw, 50vw" />
            <figcaption>{t('capWarehouse')}</figcaption>
          </Reveal>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap two">
          <Reveal><SecHead eyebrow={t('tlEyebrow')} title={t('tlTitle')} lead={t('tlLead')} /></Reveal>
          <Reveal as="ol" className="tl">
            {TIMELINE.map((r, i) => (
              <li key={i}><Html className="y" html={r[0]} /><div><h4>{pick(lang, r[1], r[3])}</h4><p>{pick(lang, r[2], r[4])}</p></div></li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="vm">
            <div><p className="eyebrow">{t('vision')}</p><p>{t('visionText')}</p></div>
            <div><p className="eyebrow">{t('mission')}</p><p>{t('missionText')}</p></div>
          </Reveal>
          <div className="mt">
            <Reveal><SecHead eyebrow={t('valEyebrow')} title={t('valTitle')} /></Reveal>
            <Reveal className="values" stagger>
              {VALUES.map((v) => <div key={v[0]}><h3>{pick(lang, v[0], v[2])}</h3><p>{pick(lang, v[1], v[3])}</p></div>)}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('ldEyebrow')} title={t('ldTitle')} /></Reveal>
          <Reveal className="people" stagger>
            {LEADERS.map((p, i) => (
              <div className="person" key={i}>
                {/* Replace with a real portrait: <img src={asset('img/team/tom-omeje.webp')} alt="Engr. Tom Omeje" /> */}
                <div className="ava ph-box">{p.initials || '?'}<span className="note">{t('photoSupply')}</span></div>
                <div className="pb">
                  {p.placeholder ? (
                    <>
                      <span className="role"><span className="ph">{pick(lang, 'Title', 'Fonction')}</span></span>
                      <h3><span className="ph">{pick(lang, 'Name to supply', 'Nom à fournir')}</span></h3>
                      <p><span className="ph">{pick(lang, 'Short bio', 'Courte biographie')}</span></p>
                    </>
                  ) : (
                    <><span className="role">{pick(lang, ...p.role)}</span><h3>{p.name}</h3><p>{pick(lang, ...p.bio)}</p></>
                  )}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal><SecHead eyebrow={t('qsEyebrow')} title={t('qsTitle')} lead={t('qsLead')} /></Reveal>
          <Reveal className="certs" stagger>
            {CERTS.map((c, i) => (
              <div className="cert" key={i}><Icon id={c[0]} /><Html as="b" html={c[1].replace('days', lang === 'fr' ? 'jours' : 'days')} /><p>{pick(lang, c[2], c[3])}</p></div>
            ))}
          </Reveal>
          <div className="mt">
            <p className="sub-h">{t('lcTitle')}</p>
            <div className="tbl">
              <table className="lic-table">
                <thead><tr><th>{t('lcH1')}</th><th>{t('lcScope')}</th><th>{t('lcH2')}</th><th>{t('lcH3')}</th></tr></thead>
                <tbody>
                  {LICS.map((r, i) => (
                    <tr key={i}>
                      <td><Html as="b" html={pick(lang, r[0], r[4])} /></td>
                      <td><Html html={pick(lang, r[1], r[5])} /></td>
                      <td>{pick(lang, r[2], r[6])}</td>
                      <td className="num"><Html html={r[3]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ marginTop: 32 }}>
            <a className="btn btn-line" href={asset('docs/grato-company-profile.pdf')} download="Grato-Engineering-Company-Profile.pdf">
              <Icon id="doc" />
              <span>{lang === 'fr' ? 'Télécharger la plaquette (PDF, 5 Mo)' : 'Download company profile (PDF, 5 MB)'}</span>
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
