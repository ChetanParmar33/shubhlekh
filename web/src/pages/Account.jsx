import { useState } from 'react';
import { AppBar } from '../components/Layout.jsx';
import { api } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';

export default function Account() {
  const { user, setUser } = useSession();
  const [msg, setMsg] = useState({ name: '', pw: '', err: '' });

  async function saveName(e) {
    e.preventDefault();
    try { const r = await api('/api/account', { method: 'PATCH', body: Object.fromEntries(new FormData(e.currentTarget)) }); setUser(r.user); setMsg({ name: 'Saved.', pw: '', err: '' }); }
    catch (ex) { setMsg({ name: '', pw: '', err: ex.message }); }
  }
  async function savePw(e) {
    e.preventDefault();
    const form = e.currentTarget;
    try { await api('/api/account/password', { method: 'POST', body: Object.fromEntries(new FormData(form)) }); form.reset(); setMsg({ name: '', pw: 'Password changed. Other devices have been logged out.', err: '' }); }
    catch (ex) { setMsg({ name: '', pw: '', err: ex.message }); }
  }
  return (
    <>
      <AppBar />
      <main className="app-main wrap narrow">
        <h1>Account</h1>
        {msg.err && <p className="form-error" role="alert">{msg.err}</p>}
        <form className="card form" onSubmit={saveName}>
          <h2>Profile</h2>
          <label>Name<input name="name" defaultValue={user.name} required maxLength={80} /></label>
          <label>WhatsApp number<input name="phone" type="tel" inputMode="tel" defaultValue={user.phone} required maxLength={20} autoComplete="tel" /></label>
          <label>Email<input value={user.email} disabled /></label>
          <button className="btn btn-dark">Save</button>{msg.name && <span className="ok" role="status">{msg.name}</span>}
        </form>
        <form className="card form" onSubmit={savePw}>
          <h2>Change password</h2>
          <label>Current password<input name="currentPassword" type="password" required autoComplete="current-password" /></label>
          <label>New password<input name="newPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
          <p className="small muted">At least 8 characters, with letters and numbers.</p>
          <button className="btn btn-dark">Change password</button>{msg.pw && <span className="ok" role="status">{msg.pw}</span>}
        </form>
      </main>
    </>
  );
}
