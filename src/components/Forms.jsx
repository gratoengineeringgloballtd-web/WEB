import { useRef, useState } from 'react';
import { useLang } from '../lib/i18n.jsx';
import { Html, Icon, fmtSize, strip } from '../lib/ui.jsx';
import { SVCS } from '../data/content.js';
import { svcName } from '../lib/helpers.js';
import { submitForm } from '../lib/submit.js';

/* ---------- validation ---------- */
const RULES = {
  required: (v) => (v.trim() ? '' : 'eReq'),
  select: (v) => (v ? '' : 'eReq'),
  name: (v) => (v.trim() ? '' : 'eReq'),
  email: (v) => (!v.trim() ? 'eReq' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'eEmail'),
  phone: (v) => (!v.trim() ? 'eReq' : /^\+?\d{8,15}$/.test(v.replace(/[\s().-]/g, '')) ? '' : 'ePhone'),
  details: (v) => (!v.trim() ? 'eReq' : v.trim().length >= 15 ? '' : 'eDetails'),
};

/** Form state with errors shown after a field is left, then live while it is corrected. */
function useFormState(initial, rules) {
  const [vals, setVals] = useState(initial);
  const [touched, setTouched] = useState({});
  const errOf = (k) => (rules[k] ? RULES[rules[k]](vals[k] ?? '') : '');
  const bind = (k) => ({
    id: k, value: vals[k] ?? '',
    onChange: (e) => { setVals((v) => ({ ...v, [k]: e.target.value })); if (e.target.tagName === 'SELECT') setTouched((t) => ({ ...t, [k]: true })); },
    onBlur: (e) => { if (e.target.value !== '') setTouched((t) => ({ ...t, [k]: true })); },
    'aria-invalid': touched[k] && !!errOf(k),
    'aria-describedby': rules[k] ? `m-${k}` : undefined,
  });
  const touchAll = (keys) => { setTouched((t) => ({ ...t, ...Object.fromEntries(keys.map((k) => [k, true])) })); return keys.every((k) => !errOf(k)); };
  const reset = () => { setVals(initial); setTouched({}); };
  return { vals, setVals, touched, errOf, bind, touchAll, reset };
}

function Field({ k, label, optional, form, children }) {
  const { t } = useLang();
  const err = form.touched[k] && form.errOf(k);
  return (
    <div className={`field${err ? ' err' : form.touched[k] ? ' ok' : ''}`}>
      <label htmlFor={k}>{label}{optional && <> <span className="opt">{t('optional')}</span></>}</label>
      {children}
      {!optional && <span className="msg" id={`m-${k}`}>{err ? t(err) : ''}</span>}
    </div>
  );
}

/* ---------- file drop ---------- */
function FileDrop({ files, setFiles, max, accept, title, hint, label }) {
  const { t } = useLang();
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState('');
  const add = (list) => {
    setMsg('');
    let next = max === 1 ? [] : [...files];
    for (const f of list) {
      if (f.size > 10 * 1048576) { setMsg(t('eTooBig')(f.name)); continue; }
      if (max === 1) { next = [f]; continue; }
      if (next.length >= max) { setMsg(t('eTooMany')); break; }
      next.push(f);
    }
    setFiles(next);
  };
  return (
    <>
      <div className={`drop${over ? ' over' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setOver(true); }} onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setOver(false); }}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}>
        <input type="file" multiple={max > 1} accept={accept} aria-label={label} onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        <Icon id="upload" /><b>{title}</b><small>{hint}</small>
      </div>
      <ul className="files">
        {files.map((f, i) => (
          <li key={f.name + i}><span>{f.name}</span><em>{fmtSize(f.size)}</em>
            <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button></li>
        ))}
      </ul>
      <span className="msg">{msg}</span>
    </>
  );
}

/* ---------- quote form (4 steps) ---------- */
const STEP_FIELDS = { 2: ['country', 'time', 'details'], 3: ['name', 'email', 'phone'] };

export function QuoteForm({ initialService = '', initialDetails = '' }) {
  const { lang, t } = useLang();
  const card = useRef(null);
  const [step, setStep] = useState(1);
  const [svc, setSvc] = useState(initialService);
  const [svcErr, setSvcErr] = useState(false);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({ state: 'idle' });
  const hp = useRef(null);
  const form = useFormState(
    { country: '', site: '', time: '', details: initialDetails, name: '', company: '', email: '', phone: '' },
    { country: 'select', time: 'select', details: 'details', name: 'name', email: 'email', phone: 'phone' },
  );
  const v = form.vals;
  const countryLbl = { Cameroon: t('cCm'), Nigeria: t('cNg'), Other: t('cOther') };
  const timeLbl = { asap: t('tAsap'), '1-3': t('t13'), '3-6': t('t36'), plan: t('tPlan') };
  const toTop = () => card.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });

  const next = async (e) => {
    e.preventDefault();
    if (step === 1) { if (!svc) { setSvcErr(true); return; } setStep(2); toTop(); return; }
    if (step < 4) {
      if (!form.touchAll(STEP_FIELDS[step])) { requestAnimationFrame(() => card.current?.querySelector('.field.err input, .field.err select, .field.err textarea')?.focus()); return; }
      setStep(step + 1); toTop(); return;
    }
    setStatus({ state: 'sending', progress: 0 });
    try {
      const r = await submitForm('quote', { language: lang, service: svcName(svc, 'en'), ...v, website: hp.current?.value || '' }, files,
        (k) => setStatus({ state: 'sending', progress: k }));
      setStatus({ state: 'done', ref: r.ref, demo: false });
    } catch (err) { setStatus({ state: 'error', msg: err.status === 400 ? err.message : '' }); }
  };

  const restart = () => { form.reset(); setSvc(''); setFiles([]); setStep(1); setStatus({ state: 'idle' }); };

  if (status.state === 'done') {
    return (
      <div className="form-card" ref={card} id="quote">
        <div className="done-box" tabIndex={-1} ref={(el) => el?.focus()}>
          <div className="tick" aria-hidden="true"><Icon id="check" /></div>
          <h3 style={{ fontSize: 32 }}>{t('doneTitle')}</h3>
          <span className="ref">{status.ref}</span>
          <Html as="p" style={{ color: 'var(--steel)' }} html={status.demo ? t('doneTextDemo') : t('doneTextLive')} />
          <p><button type="button" className="btn btn-line" onClick={restart}>{t('doneAgain')}</button></p>
        </div>
      </div>
    );
  }

  const choices = SVCS.map((s) => [s.id, s.ic, s[lang].n, strip(s[lang].s)]).concat([['unsure', 'loop', t('notSure'), t('notSureSub')]]);
  const review = [
    ['rService', svcName(svc, lang)], ['rCountry', countryLbl[v.country]], ['rSite', v.site || '—'], ['rTime', timeLbl[v.time]],
    ['rDetails', v.details], ['rFiles', files.map((f) => f.name).join(', ') || '—'],
    ['rName', v.name], ['rCompany', v.company || '—'], ['rEmail', v.email], ['rPhone', v.phone],
  ];

  return (
    <div className="form-card" ref={card} id="quote">
      <div className="form-top">
        <span className="reply"><Icon id="clock" /><Html html={t('replyTime')} /></span>
        <span>{t('reqNote')}</span>
      </div>
      <ol className="stepper">
        {['st1', 'st2', 'st3', 'st4'].map((k, i) => (
          <li key={k} className={i + 1 < step ? 'done' : i + 1 === step ? 'now' : ''} aria-current={i + 1 === step ? 'step' : undefined}>{t(k)}</li>
        ))}
      </ol>
      <form onSubmit={next} noValidate>
        {step === 1 && (
          <fieldset className="fs">
            <legend>{t('q1')}</legend>
            <div className="choice-grid">
              {choices.map(([id, ic, n, s]) => (
                <div className="choice" key={id}>
                  <input type="radio" name="svc" id={`c-${id}`} value={id} checked={svc === id} onChange={() => { setSvc(id); setSvcErr(false); }} />
                  <label htmlFor={`c-${id}`}><Icon id={ic} /><b>{n}</b><small>{s}</small></label>
                </div>
              ))}
            </div>
            {svcErr && <p className="err-top" role="alert">{t('eSvc')}</p>}
          </fieldset>
        )}
        {step === 2 && (
          <fieldset className="fs">
            <legend>{t('q2')}</legend>
            <div className="grid2">
              <Field k="country" label={t('fCountry')} form={form}>
                <select {...form.bind('country')}>
                  <option value="">{t('fChoose')}</option>
                  <option value="Cameroon">{t('cCm')}</option><option value="Nigeria">{t('cNg')}</option><option value="Other">{t('cOther')}</option>
                </select>
              </Field>
              <Field k="site" label={t('fSite')} optional form={form}><input type="text" autoComplete="off" placeholder={strip(t('fSitePh'))} {...form.bind('site')} /></Field>
            </div>
            <Field k="time" label={t('fTime')} form={form}>
              <select {...form.bind('time')}>
                <option value="">{t('fChoose')}</option>
                {Object.entries(timeLbl).map(([val, l]) => <option key={val} value={val}>{l}</option>)}
              </select>
            </Field>
            <Field k="details" label={t('fDetails')} form={form}><textarea rows={5} placeholder={t('fDetailsPh')} {...form.bind('details')} /></Field>
            <div className="field">
              <span style={{ fontWeight: 600, fontSize: 15 }}>{t('fFiles')} <span className="opt">{t('optional')}</span></span>
              <FileDrop files={files} setFiles={setFiles} max={5} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.dwg,.zip" title={t('dropQ')} hint={t('dropQHint')} label={t('fFiles')} />
            </div>
          </fieldset>
        )}
        {step === 3 && (
          <fieldset className="fs">
            <legend>{t('q3')}</legend>
            <div className="grid2">
              <Field k="name" label={t('fName')} form={form}><input type="text" autoComplete="name" {...form.bind('name')} /></Field>
              <Field k="company" label={t('fCompany')} optional form={form}><input type="text" autoComplete="organization" {...form.bind('company')} /></Field>
              <Field k="email" label={t('fEmail')} form={form}><input type="email" autoComplete="email" {...form.bind('email')} /></Field>
              <Field k="phone" label={t('fPhone')} form={form}><input type="tel" autoComplete="tel" placeholder="+237 / +234 …" {...form.bind('phone')} /></Field>
            </div>
          </fieldset>
        )}
        {step === 4 && (
          <fieldset className="fs">
            <legend>{t('q4')}</legend>
            <dl className="review">{review.map(([k, val]) => <FragmentPair key={k} k={t(k)} v={val} />)}</dl>
            {status.state === 'error' && <p className="err-top" role="alert">{status.msg || t('sendErr')}</p>}
            <input ref={hp} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
          </fieldset>
        )}
        <div className="form-nav">
          <button type="button" className="btn btn-ghost" style={{ visibility: step > 1 ? 'visible' : 'hidden' }} onClick={() => setStep(step - 1)}>
            <span aria-hidden="true">←</span> <span>{t('back')}</span>
          </button>
          <button type="submit" className="btn btn-red" disabled={status.state === 'sending'}>
            <span>{status.state === 'sending' ? `${t('sending')}${status.progress ? ` ${Math.round(status.progress * 100)}%` : ''}` : step === 4 ? t('send') : t('next')}</span><span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const FragmentPair = ({ k, v }) => (<><dt>{k}</dt><dd>{v}</dd></>);

/* ---------- careers form ---------- */
export function CareersForm({ role, setRole, jobs = [] }) {
  const { lang, t } = useLang();
  const box = useRef(null);
  const hp = useRef(null);
  const [phone, setPhone] = useState('');
  const [cv, setCv] = useState([]);
  const [cvErr, setCvErr] = useState(false);
  const [status, setStatus] = useState({ state: 'idle' });
  const form = useFormState({ cname: '', cemail: '' }, { cname: 'name', cemail: 'email' });
  const roleErr = status.tried && !role;

  const submit = async (e) => {
    e.preventDefault();
    const ok = form.touchAll(['cname', 'cemail']);
    setCvErr(!cv.length);
    setStatus((s) => ({ ...s, tried: true }));
    if (!ok || !cv.length || !role) { requestAnimationFrame(() => box.current?.querySelector('.field.err input, .field.err select')?.focus()); return; }
    setStatus({ state: 'sending', tried: true, progress: 0 });
    try {
      const r = await submitForm('careers', { lang, jobId: role, name: form.vals.cname, email: form.vals.cemail, phone, website: hp.current?.value || '' }, cv,
        (k) => setStatus({ state: 'sending', tried: true, progress: k }));
      setStatus({ state: 'done', demo: false, ref: r.ref });
    } catch (err) { setStatus({ state: 'error', tried: true, msg: err.status === 400 ? err.message : '' }); }
  };

  if (status.state === 'done') {
    return (
      <div className="form-card"><div className="done-box" tabIndex={-1} ref={(el) => el?.focus()}>
        <div className="tick" aria-hidden="true"><Icon id="check" /></div>
        <h3 style={{ fontSize: 32 }}>{t('crDoneTitle')}</h3>
        {status.ref && <span className="ref">{status.ref}</span>}
        <p style={{ color: 'var(--steel)' }}>{t('crDoneTextLive')}</p>
      </div></div>
    );
  }

  return (
    <div className="form-card" ref={box} id="apply">
      <form onSubmit={submit} noValidate>
        <div className="fs">
          <div className="grid2">
            <Field k="cname" label={t('fName')} form={form}><input type="text" autoComplete="name" {...form.bind('cname')} /></Field>
            <Field k="cemail" label={t('fEmail')} form={form}><input type="email" autoComplete="email" {...form.bind('cemail')} /></Field>
          </div>
          <div className="field">
            <label htmlFor="cphone">{t('fPhone')} <span className="opt">{t('optional')}</span></label>
            <input id="cphone" type="tel" autoComplete="tel" placeholder="+237 / +234 …" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <input ref={hp} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
          <div className={`field${roleErr ? ' err' : ''}`}>
            <label htmlFor="crole">{t('crRole')}</label>
            <select id="crole" value={role} onChange={(e) => setRole(e.target.value)} aria-invalid={roleErr}>
              <option value="">{t('fChoose')}</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j[lang][0]}</option>)}
              <option value="general">{t('crGeneral')}</option>
            </select>
            <span className="msg">{roleErr ? t('eReq') : ''}</span>
          </div>
          <div className="field">
            <span style={{ fontWeight: 600, fontSize: 15 }}>{t('crCv')}</span>
            <FileDrop files={cv} setFiles={(f) => { setCv(f); setCvErr(false); }} max={1} accept=".pdf,.doc,.docx" title={t('dropCv')} hint={t('dropCvHint')} label="CV" />
            <span className="msg">{cvErr ? t('eCv') : ''}</span>
          </div>
          {status.state === 'error' && <p className="err-top" role="alert">{status.msg || t('sendErr')}</p>}
          <div className="form-nav" style={{ marginTop: 6 }}>
            <span />
            <button type="submit" className="btn btn-red" disabled={status.state === 'sending'}>
              <span>{status.state === 'sending' ? `${t('sending')}${status.progress ? ` ${Math.round(status.progress * 100)}%` : ''}` : t('crSend')}</span><span className="arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
