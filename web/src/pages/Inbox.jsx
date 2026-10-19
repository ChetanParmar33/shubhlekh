import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppBar } from '../components/Layout.jsx';
import { api, formatDate } from '../lib/api.js';

export default function Inbox() {
  const { id } = useParams();
  const [inv, setInv] = useState(null);
  const [res, setRes] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([api(`/api/invitations/${id}`), api(`/api/invitations/${id}/rsvps`)])
      .then(([a, b]) => { setInv({ ...a.invitation, data: a.data }); setRes(b); })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <><AppBar /><main className="app-main wrap"><p className="form-error">{error}</p></main></>;
  if (!inv || !res) return <><AppBar /><div className="page-loading" aria-busy="true" /></>;
  const names = Object.fromEntries(inv.data.events.map((e) => [e.id, (e.name && typeof e.name === 'object' ? e.name.en : e.name) || e.id]));
  const rows = res.rsvps.filter((r) => (filter === 'all' || (filter === 'yes') === r.attending) && r.name.toLowerCase().includes(q.toLowerCase()));
  const s = res.summary;

  return (
    <>
      <AppBar />
      <main className="app-main wrap">
        <Link to="/dashboard" className="btn btn-sm btn-text">← Invitations</Link>
        <div className="app-head">
          <div><h1>RSVPs · {inv.title}</h1><p className="muted">{formatDate(inv.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          {inv.plan === 'premium' ? <a className="btn btn-dark" href={`/api/invitations/${id}/rsvps?format=csv`}>Download CSV</a> : <span className="muted small">CSV download is a Royal feature</span>}
        </div>
        <div className="kpis">
          <div className="kpi"><b>{s.guests}</b><span>guests coming</span></div>
          <div className="kpi"><b>{s.attending}</b><span>accepted</span></div>
          <div className="kpi"><b>{s.declined}</b><span>declined</span></div>
          <div className="kpi"><b>{s.views}</b><span>invitation views</span></div>
        </div>
        {Object.keys(s.byEvent).length > 0 && (
          <div className="card by-event">
            <h2>Guests per event</h2>
            {inv.data.events.map((e) => {
              const n = s.byEvent[e.id] || 0, max = Math.max(1, ...Object.values(s.byEvent));
              return <div className="be-row" key={e.id}><span>{names[e.id]}</span><span className="be-bar"><i style={{ width: `${(n / max) * 100}%` }} /></span><b>{n}</b></div>;
            })}
          </div>
        )}
        <div className="inbox-tools">
          <div className="chips" role="group" aria-label="Filter">{[['all', 'All'], ['yes', 'Coming'], ['no', 'Not coming']].map(([k, l]) => <button key={k} className={'chip' + (filter === k ? ' on' : '')} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}</div>
          <input type="search" placeholder="Search names" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search names" />
        </div>
        {res.rsvps.length === 0 ? (
          <div className="empty card"><p className="empty-art" aria-hidden="true">✉</p><h2>No replies yet</h2><p className="muted">Share your link — replies appear here as soon as guests send them.</p></div>
        ) : (
          <ul className="rsvp-list">
            {rows.map((r) => (
              <li key={r.id} className="card">
                <div className="rl-top"><b>{r.name}</b><span className={'im-pill' + (r.attending ? ' yes' : '')}>{r.attending ? `Coming · ${r.guests}` : 'Not coming'}</span></div>
                {r.attending && r.events.length > 0 && <p className="small muted">{r.events.map((e) => names[e] || e).join(' · ')}</p>}
                {r.message && <blockquote>“{r.message}”</blockquote>}
                <p className="small muted">{formatDate(r.at.replace(' ', 'T') + 'Z', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}{r.invite && ` · via ${inv.data.guests?.find((g) => g.token === r.invite)?.label || 'personal link'}`}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
