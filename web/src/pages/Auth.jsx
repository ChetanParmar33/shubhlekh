import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';

export default function Auth({ mode }) {
  const signup = mode === 'signup';
  const { user, setUser, site } = useSession();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [err, setErr] = useState({ msg: '', field: '' });
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const template = Number(params.get('template')) || null;
  const next = params.get('next');

  async function afterLogin() {
    if (template) {
      const { id } = await api('/api/invitations', { method: 'POST', body: { template } });
      return nav(`/dashboard/edit/${id}`, { replace: true });
    }
    nav(next && next.startsWith('/dashboard') ? next : '/dashboard', { replace: true });
  }

  if (user && !busy) return <Navigate to={template ? `/dashboard?new=${template}` : '/dashboard'} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr({ msg: '', field: '' });
    try {
      const r = await api(signup ? '/api/auth/signup' : '/api/auth/login', { method: 'POST', body: Object.fromEntries(new FormData(e.currentTarget)) });
      setUser(r.user);
      await afterLogin();
    } catch (ex) { setErr({ msg: ex.message, field: ex.data?.field || '' }); setBusy(false); }
  }
  const tpl = site?.templates?.find((t) => t.id === template);
  return (
    <section className="auth">
      <div className="auth-card">
        <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{signup ? (tpl ? `You’ll start with the ${tpl.name} design. Buy a plan and our team will set it up for you.` : 'Free to sign up. Buy a plan and our team sets up your invitation for you.') : 'Log in to manage your invitations.'}</p>
        <form className="form" onSubmit={submit} noValidate={false}>
          {signup && <label>Your name<input name="name" required maxLength={80} autoComplete="name" aria-invalid={err.field === 'name'} /></label>}
          {signup && <label>WhatsApp number<input name="phone" type="tel" inputMode="tel" required maxLength={20} autoComplete="tel" placeholder="98765 43210" aria-invalid={err.field === 'phone'} aria-describedby="ph-hint" /></label>}
          {signup && <p id="ph-hint" className="small muted">Our team contacts you on this number after you buy a plan and sets up everything for you.</p>}
          <label>Email<input name="email" type="email" required autoComplete="email" aria-invalid={err.field === 'email'} /></label>
          <label>Password
            <span className="pw">
              <input name="password" type={show ? 'text' : 'password'} required minLength={signup ? 8 : 1} autoComplete={signup ? 'new-password' : 'current-password'} aria-invalid={err.field === 'password'} aria-describedby={signup ? 'pw-hint' : undefined} />
              <button type="button" className="pw-toggle" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
            </span>
          </label>
          {signup && <p id="pw-hint" className="small muted">At least 8 characters, with letters and numbers.</p>}
          {err.msg && <p className="form-error" role="alert">{err.msg}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>
          {signup && <p className="small muted">By creating an account you agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy policy</Link>.</p>}
        </form>
        <p className="auth-switch">{signup ? <>Already have an account? <Link to={`/login${template ? `?template=${template}` : ''}`}>Log in</Link></> : <>New here? <Link to="/signup">Create an account</Link></>}</p>
      </div>
    </section>
  );
}
