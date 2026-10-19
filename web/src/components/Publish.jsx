import { useEffect, useRef, useState } from 'react';
import { api, formatINR, waLink } from '../lib/api.js';
import { WaIcon } from './Layout.jsx';
import { useSession } from '../lib/session.jsx';
import { ShareBox } from '../pages/Dashboard.jsx';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = ok; s.onerror = () => fail(new Error('Could not load the payment window. Check your connection and try again.'));
    document.head.appendChild(s);
  });
}

// Same rules the server enforces, shown up front so nobody pays for something that will be refused.
export function planIssues(plan, template, data, templates) {
  const out = [];
  if (!plan.templates.includes(template)) out.push(`${templates.find((t) => t.id === template)?.name} is a Royal design.`);
  if ((data.photos?.gallery || []).length > plan.maxGallery) out.push(`Up to ${plan.maxGallery} gallery photos (you have ${data.photos.gallery.length}).`);
  if (!plan.guestLinks && (data.guests || []).length) out.push('Personalised guest links are Royal only.');
  return out;
}

// Buying (or upgrading) a plan. Publishing is a separate, free step in the editor once a plan is active.
export function PublishDialog({ open, onClose, inv, data, onPaid, beforePay }) {
  const { site, user, setUser } = useSession();
  const ref = useRef(null);
  const [phone, setPhone] = useState('');
  const [choice, setChoice] = useState('premium');
  const [state, setState] = useState({ busy: false, error: '', dev: null, done: null });
  useEffect(() => {
    if (!open) { if (ref.current?.open) ref.current.close(); return; }
    const royalDesign = site?.templates.find((t) => t.id === inv.template)?.tier === 'premium';
    setChoice(inv.plan === 'basic' || royalDesign ? 'premium' : 'basic');
    setState({ busy: false, error: '', dev: null, done: null });
    setPhone(user?.phone || '');
    ref.current?.showModal();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!site) return null;
  const plans = Object.values(site.plans);
  const priceOf = (id) => (inv.plan === 'basic' ? (id === 'premium' ? site.plans.premium.price - site.plans.basic.price : 0) : site.plans[id].price);

  async function verify(body) {
    const r = await api(`/api/invitations/${inv.id}/checkout/verify`, { method: 'POST', body });
    setState((s) => ({ ...s, busy: false, done: r.invitation, dev: null }));
    onPaid(r.invitation);
  }
  async function pay() {
    setState({ busy: true, error: '', dev: null, done: null });
    try {
      await beforePay(); // make sure the latest edits are saved
      const o = await api(`/api/invitations/${inv.id}/checkout`, { method: 'POST', body: { plan: choice, phone } });
      if (user && phone !== user.phone) api('/api/auth/me').then((r) => r.user && setUser(r.user)).catch(() => {});
      if (o.mode === 'dev') return setState({ busy: false, error: '', dev: o, done: null });
      await loadRazorpay();
      const rz = new window.Razorpay({
        key: o.keyId, order_id: o.orderId, amount: o.amount, currency: 'INR', name: o.name,
        description: `${site.plans[choice].name} plan — ${inv.title}`, prefill: { name: user.name, email: user.email },
        theme: { color: '#e4572e' },
        handler: (r) => verify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }).catch((e) => setState({ busy: false, error: e.message })),
        modal: { ondismiss: () => setState((s) => ({ ...s, busy: false })) },
      });
      rz.on('payment.failed', (r) => setState({ busy: false, error: r.error?.description || 'Payment failed. No money was taken.' }));
      rz.open();
    } catch (e) { setState({ busy: false, error: e.message }); }
  }

  return (
    <dialog ref={ref} className="publish" onClose={onClose}>
      <button className="pm-close" aria-label="Close" onClick={() => ref.current.close()}>×</button>
      {state.done ? (
        <div className="published">
          <p className="burst-art" aria-hidden="true">❀</p>
          <h2>{site.plans[state.done.plan]?.name} plan is active</h2>
          {state.done.status === 'published' ? (<>
            <p className="muted">Your live link now has every {site.plans[state.done.plan]?.name} feature.</p>
            <ShareBox inv={state.done} />
          </>) : (<>
            <p className="lead-sm"><b>You don’t need to do anything else.</b> Our team will WhatsApp you on <b>{phone}</b> within 24 hours, collect your names, dates, venues and photos, and set up the whole invitation for you.</p>
            <p className="muted small">In a hurry? Send your details now — or, if you like, fill them in yourself in the editor.</p>
            <a className="btn btn-wa btn-lg" href={waLink(site, `Hi! I just bought the ${site.plans[state.done.plan]?.name} plan for “${state.done.title}” (${state.done.url}). Here are our details:`)} target="_blank" rel="noopener"><WaIcon /> Send details on WhatsApp</a>
          </>)}
          <button className="btn btn-ghost" onClick={() => ref.current.close()}>{state.done.status === 'published' ? 'Done' : 'Close'}</button>
        </div>
      ) : (
        <>
          <h2>{inv.plan === 'basic' ? 'Upgrade to Royal' : 'Choose your plan'}</h2>
          <p className="muted">One-time payment for this invitation. After paying, <b>our team contacts you on WhatsApp and sets up everything</b> — names, events, photos, both languages.</p>
          <div className="plan-pick" role="radiogroup">
            {plans.map((p) => {
              const issues = planIssues(p, inv.template, data, site.templates);
              const price = priceOf(p.id);
              const disabled = price === 0 || issues.length > 0;
              return (
                <label key={p.id} className={'pp' + (choice === p.id ? ' on' : '') + (disabled ? ' off' : '')}>
                  <input type="radio" name="plan" value={p.id} checked={choice === p.id} disabled={disabled} onChange={() => setChoice(p.id)} />
                  <span className="pp-head"><b>{p.name}</b><span>{price ? formatINR(price) : 'Current plan'}</span></span>
                  <span className="pp-feat">{p.features.slice(0, 3).join(' · ')}</span>
                  {issues.map((x) => <span key={x} className="pp-issue">{x}</span>)}
                </label>
              );
            })}
          </div>
          {!state.dev && <label className="pp-phone">Your WhatsApp number <small>(we’ll contact you here)</small><input type="tel" inputMode="tel" maxLength={20} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" required /></label>}
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          {state.dev ? (
            <div className="dev-pay">
              <p><b>Test mode.</b> Online payments aren’t connected yet (no Razorpay keys), so this simulates a payment of {formatINR(state.dev.amount / 100)}. No real money moves.</p>
              <button className="btn btn-dark" onClick={() => verify({ orderId: state.dev.orderId }).catch((e) => setState({ busy: false, error: e.message }))}>Complete test payment</button>
            </div>
          ) : site.payments === 'off' ? (
            <p className="form-error">Online payments are not available right now. Please <a href="/contact">contact us</a> to buy a plan.</p>
          ) : (
            <button className="btn btn-primary btn-lg wide" disabled={state.busy || phone.replace(/\D/g, '').length < 10 || priceOf(choice) === 0 || planIssues(site.plans[choice], inv.template, data, site.templates).length > 0} onClick={pay}>
              {state.busy ? 'Opening payment…' : `Pay ${formatINR(priceOf(choice))}`}
            </button>
          )}
          <p className="small muted center">Secure payment by Razorpay · UPI, cards & net-banking</p>
        </>
      )}
    </dialog>
  );
}
