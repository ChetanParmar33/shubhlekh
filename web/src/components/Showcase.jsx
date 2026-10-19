import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../lib/session.jsx';
import { formatINR, waLink, TEAM_STATUS } from '../lib/api.js';
import { WaIcon } from './Layout.jsx';

// A phone frame that runs a real template live inside it.
export function Phone({ src, title, className = '' }) {
  return (
    <div className={'phone ' + className}>
      <div className="phone-notch" />
      <iframe src={src} title={title} loading="lazy" allow="autoplay" />
    </div>
  );
}

export const LANG_NAME = { gu: 'ગુજરાતી', hi: 'हिन्दी', pa: 'ਪੰਜਾਬੀ', ur: 'اردو', ta: 'தமிழ்' };

export function TemplateBadge({ tier }) {
  return <span className={'badge ' + (tier === 'premium' ? 'badge-royal' : 'badge-classic')}>{tier === 'premium' ? 'Royal' : 'Classic'}</span>;
}

export function PreviewModal({ template, onClose }) {
  const { site } = useSession();
  const ref = useRef(null);
  useEffect(() => {
    if (!template) return;
    const d = ref.current; d.showModal();
    return () => d.open && d.close();
  }, [template]);
  if (!template) return null;
  return (
    <dialog ref={ref} className="preview-modal" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current.close()}>
      <div className="pm-inner">
        <div className="pm-side">
          <TemplateBadge tier={template.tier} />
          <h2>{template.name}</h2>
          <p>{template.tagline}</p>
          <dl className="pm-facts"><div><dt>Style</dt><dd>{template.category}</dd></div><div><dt>Languages</dt><dd>English + {LANG_NAME[template.lang2]}</dd></div><div><dt>Plan</dt><dd>{template.tier === 'premium' ? 'Royal' : 'Classic or Royal'}</dd></div></dl>
          <p className="muted small">Tap the invitation to open it — sound on for the music.</p>
          <div className="row">
            <Link className="btn btn-primary" to={`/signup?template=${template.id}`}>Use this design</Link>
            <a className="btn btn-ghost" href={`/t/${template.id}/`} target="_blank" rel="noopener">Open full screen ↗</a>
          </div>
          <a className="btn btn-wa btn-sm" href={waLink(site, `Hi! I like the ${template.name} design. Can you tell me more?`)} target="_blank" rel="noopener"><WaIcon /> Ask about this design</a>
        </div>
        <Phone src={`/t/${template.id}/`} title={`${template.name} live preview`} />
        <button className="pm-close" aria-label="Close" onClick={() => ref.current.close()}>×</button>
      </div>
    </dialog>
  );
}

export function TemplateGrid({ filter = 'All' }) {
  const { site } = useSession();
  const [preview, setPreview] = useState(null);
  const list = (site?.templates || []).filter((t) => filter === 'All' || t.category === filter);
  return (
    <>
      <div className="tpl-grid">
        {list.map((t, i) => (
          <article className="tpl-card reveal" key={t.id} style={{ '--d': `${i * 70}ms` }}>
            <button className="tpl-thumb" onClick={() => setPreview(t)} aria-label={`Preview ${t.name}`}>
              <img src={`/t/${t.id}/assets/img/og.jpg`} alt="" loading="lazy" width="1200" height="630" />
              <span className="tpl-play">▶ Live preview</span>
            </button>
            <div className="tpl-body">
              <div className="tpl-top"><h3>{t.name}</h3><TemplateBadge tier={t.tier} /></div>
              <p>{t.tagline}</p>
              <div className="tpl-meta"><span>{t.category}</span><span className="swatches">{t.colors.map((c) => <i key={c} style={{ background: c }} />)}</span></div>
            </div>
          </article>
        ))}
      </div>
      <PreviewModal template={preview} onClose={() => setPreview(null)} />
    </>
  );
}

export function Plans({ compact }) {
  const { site } = useSession();
  const plans = site ? Object.values(site.plans) : [];
  return (<>
    <div className="plans">
      {plans.map((p) => (
        <article key={p.id} className={'plan reveal' + (p.id === 'premium' ? ' plan-royal' : '')}>
          {p.id === 'premium' && <span className="plan-flag">Most loved</span>}
          <h3>{p.name}</h3>
          <p className="plan-blurb">{p.blurb}</p>
          <p className="plan-price"><span>{formatINR(p.price)}</span> one-time · per invitation</p>
          <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link className={'btn ' + (p.id === 'premium' ? 'btn-primary' : 'btn-dark')} to="/templates">Choose a design · {p.name}</Link>
          {!compact && <p className="small muted">You only buy the plan — our team contacts you on WhatsApp and sets up everything.</p>}
        </article>
      ))}
    </div>
    {!compact && <p className="center plans-wa"><a className="btn btn-wa" href={waLink(site, 'Hi! Which plan is right for our wedding?')} target="_blank" rel="noopener"><WaIcon /> Not sure which plan? WhatsApp us</a></p>}
  </>);
}

// After buying: what our team is doing for this invitation, with a WhatsApp shortcut.
export function TeamCard({ inv }) {
  const { site } = useSession();
  const keys = Object.keys(TEAM_STATUS), key = TEAM_STATUS[inv.teamStatus] ? inv.teamStatus : 'new', [head, text] = TEAM_STATUS[key];
  return (
    <div className="team-card" role="status">
      <ol className="team-steps" aria-hidden="true">{keys.map((k, i) => <li key={k} className={i <= keys.indexOf(key) ? 'on' : ''} />)}</ol>
      <h3>{head}</h3>
      <p className="small">{text}</p>
      <div><a className="btn btn-sm btn-wa" href={waLink(site, `Hi! This is about our invitation “${inv.title}” (${inv.url || '/i/' + inv.slug}). `)} target="_blank" rel="noopener"><WaIcon /> WhatsApp our team</a></div>
    </div>
  );
}

const FAQS = [
  ['How does it work?', 'Preview all the designs for free — no sign-up needed. Pick one, sign up with your WhatsApp number and buy a plan (one-time payment). That’s all you do: our team contacts you on WhatsApp within 24 hours, collects your names, dates, venues and photos, builds the invitation and sends you a preview. Once you approve, you share the link.'],
  ['Do I have to fill in everything myself?', 'No. Our team sets up the whole invitation for you — just send your details and photos on WhatsApp. If you prefer, you can also edit it yourself in the editor at any time.'],
  ['Can you customise the design?', 'Yes — on both plans. Tell us on WhatsApp what you’d like (a different colour, an extra event, your own photos or wording) and we make the changes for you. Royal requests are handled first.'],
  ['Can I change things after sharing the link?', 'Yes. WhatsApp us the change (or edit it yourself) — your guests always see the latest version on the same link.'],
  ['How do guests RSVP?', 'Each invitation has an RSVP form. Answers arrive in your dashboard with totals per event. Royal plan customers can download them as a spreadsheet.'],
  ['Which languages are supported?', 'Every design is in English and ગુજરાતી. You can type names, events and messages in both, and guests switch with one tap.'],
  ['Is there a limit on guests?', 'No. Share the link with as many people as you like.'],
  ['How long does the invitation stay online?', 'Classic invitations stay live until 15 days after your last event, Royal ones until 60 days after.'],
  ['What if I paid and something went wrong?', 'WhatsApp us or write from the contact page with your registered email. See the refund policy for details.'],
];
export function Faq() {
  return (
    <div className="faq">
      {FAQS.map(([q, a]) => <details key={q} className="reveal"><summary>{q}</summary><p>{a}</p></details>)}
    </div>
  );
}

// Adds .in to .reveal elements as they scroll into view (once).
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
