import { useState } from 'react';
import { api, waLink } from '../lib/api.js';
import { WaIcon } from '../components/Layout.jsx';
import { useSession } from '../lib/session.jsx';

export default function Contact() {
  const { site } = useSession();
  const [state, setState] = useState({ sending: false, done: false, error: '' });
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ sending: true, done: false, error: '' });
    try {
      await api('/api/contact', { method: 'POST', body: Object.fromEntries(f) });
      setState({ sending: false, done: true, error: '' });
    } catch (err) { setState({ sending: false, done: false, error: err.message }); }
  }
  return (
    <section className="section page-top">
      <div className="wrap split">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>We’re happy to help</h1>
          <p className="muted">Questions about a design, payment or your invitation? The fastest way is WhatsApp — our team replies within a few hours. Or send a message and we’ll reply by email.</p>
          <p><a className="btn btn-wa btn-lg" href={waLink(site, 'Hi! I have a question about your wedding invitations.')} target="_blank" rel="noopener"><WaIcon /> Chat on WhatsApp</a></p>
          {site?.supportEmail && <p>Email: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a></p>}
        </div>
        {state.done ? <div className="card success-card" role="status"><h2>Thank you!</h2><p>Your message has reached us. We’ll write back to the email you gave.</p></div> : (
          <form className="card form" onSubmit={submit}>
            <label>Name<input name="name" required maxLength={80} autoComplete="name" /></label>
            <label>Email<input name="email" type="email" required autoComplete="email" /></label>
            <label>Phone <small>(optional)</small><input name="phone" inputMode="tel" maxLength={20} autoComplete="tel" /></label>
            <label>Message<textarea name="message" required minLength={5} rows={5} /></label>
            {state.error && <p className="form-error" role="alert">{state.error}</p>}
            <button className="btn btn-primary" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send message'}</button>
          </form>
        )}
      </div>
    </section>
  );
}
