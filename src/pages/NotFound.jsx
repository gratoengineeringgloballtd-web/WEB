import { useLang, LLink } from '../lib/i18n.jsx';
import { usePageTitle } from '../lib/ui.jsx';

export default function NotFound() {
  const { t } = useLang();
  usePageTitle(t('nfTitle'));
  return (
    <section className="sec">
      <div className="wrap" style={{ display: 'grid', gap: 18, justifyItems: 'start', minHeight: '40vh', alignContent: 'center' }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: 'clamp(38px,5.4vw,64px)' }}>{t('nfTitle')}</h1>
        <p className="lead">{t('nfText')}</p>
        <LLink className="btn btn-red" to="/"><span>{t('nfHome')}</span><span className="arrow" aria-hidden="true">→</span></LLink>
      </div>
    </section>
  );
}
