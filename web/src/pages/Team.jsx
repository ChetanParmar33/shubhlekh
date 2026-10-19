import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, WaIcon } from '../components/Layout.jsx';
import { api, formatDate, waTo, TEAM_STATUS } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';

// Our team's to-do list: every paid invitation, the customer's WhatsApp number, where we are with it, and customisation requests.
const REQ = [['open', 'Received'], ['in_progress', 'In progress'], ['done', 'Done']];

export default function Team() {
  const { user, site } = useSession();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [show, setShow] = useState('todo');
  const load = () => api('/api/admin/orders').then((r) => setOrders(r.orders)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function setTeam(o, teamStatus) {
    setOrders((l) => l.map((x) => (x.id === o.id ? { ...x, teamStatus } : x)));
    try { await api(`/api/admin/invitations/${o.id}`, { method: 'PATCH', body: { teamStatus } }); } catch (e) { setError(e.message); load(); }
  }
  async function setReq(r, status) {
    try { await api(`/api/admin/customizations/${r.id}`, { method: 'PATCH', body: { status } }); load(); } catch (e) { setError(e.message); }
  }

  if (!user?.admin) return <><AppBar /><main className="app-main wrap"><p className="form-error">Team members only.</p></main></>;
  const list = (orders || []).filter((o) => show === 'all' || o.teamStatus !== 'ready' || o.requests.some((r) => r.status !== 'done'));
  const hello = (o) => `Namaste ${o.customer.name.split(' ')[0]}! This is the ${site?.brand || 'Shubhlekh'} team — thank you for choosing the ${o.design} design (${o.plan === 'premium' ? 'Royal' : 'Classic'} plan). Please send us: the couple’s names, parents’ names, wedding date & events with venues, and a few photos. We’ll set up everything and send you a preview.`;

  return (
    <>
      <AppBar />
      <main className="app-main wrap">
        <div className="app-head">
          <div><h1>Team · orders</h1><p className="muted">Contact every new customer on WhatsApp, set up their invitation, then mark it ready.</p></div>
          <div className="chips" role="group" aria-label="Show">
            {[['todo', 'To do'], ['all', 'All']].map(([k, l]) => <button key={k} className={'chip' + (show === k ? ' on' : '')} aria-pressed={show === k} onClick={() => setShow(k)}>{l}</button>)}
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {orders === null ? <div className="page-loading" aria-busy="true" /> : list.length === 0 ? <p className="muted">Nothing to do right now.</p> : (
          <div className="team-list">
            {list.map((o) => (
              <article key={o.id} className="card team-order">
                <div className="to-top">
                  <div><h2>{o.title}</h2><p className="small muted">{o.design} · {o.plan === 'premium' ? 'Royal' : 'Classic'} · paid {formatDate(o.paidAt && o.paidAt.replace(' ', 'T') + 'Z')} · {o.status === 'published' ? 'live' : 'not published'}</p></div>
                  <label className="small">Status
                    <select value={o.teamStatus} onChange={(e) => setTeam(o, e.target.value)}>{Object.entries(TEAM_STATUS).map(([k, [h]]) => <option key={k} value={k}>{h}</option>)}</select>
                  </label>
                </div>
                <p><b>{o.customer.name}</b> · {o.customer.phone || 'no number'} · <a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></p>
                <div className="row">
                  {o.customer.phone && <a className="btn btn-sm btn-wa" href={waTo(o.customer.phone, hello(o))} target="_blank" rel="noopener"><WaIcon /> WhatsApp customer</a>}
                  <Link className="btn btn-sm btn-dark" to={`/dashboard/edit/${o.id}`}>Set up invitation</Link>
                  <a className="btn btn-sm btn-ghost" href={`/i/${o.slug}`} target="_blank" rel="noopener">Preview ↗</a>
                </div>
                {o.requests.length > 0 && (
                  <ul className="cz-list">
                    {o.requests.map((r) => (
                      <li key={r.id}>
                        <select aria-label="Request status" value={r.status} onChange={(e) => setReq(r, e.target.value)}>{REQ.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                        <p>{r.message}</p>
                        <small>{r.phone && <>{r.phone} · </>}{formatDate(r.created_at.replace(' ', 'T') + 'Z')}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
