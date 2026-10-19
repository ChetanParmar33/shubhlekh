import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppBar } from '../components/Layout.jsx';
import { TemplateBadge, TeamCard } from '../components/Showcase.jsx';
import { api, formatDate } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';

export function ShareBox({ inv }) {
  const [copied, setCopied] = useState(false);
  const text = `${inv.title} — you are invited! ${inv.url}`;
  return (
    <div className="share-box">
      <input readOnly value={inv.url} aria-label="Invitation link" onFocus={(e) => e.target.select()} />
      <button className="btn btn-sm btn-dark" onClick={async () => { try { await navigator.clipboard.writeText(inv.url); } catch { /* old browsers: the field is selectable */ } setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? 'Copied!' : 'Copy'}</button>
      <a className="btn btn-sm btn-wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">WhatsApp</a>
    </div>
  );
}

export function NewInvitation({ open, onClose, preselect }) {
  const { site } = useSession();
  const nav = useNavigate();
  const ref = useRef(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => { if (open) ref.current?.showModal(); else ref.current?.open && ref.current.close(); }, [open]);
  async function create(id) {
    setBusy(id); setError('');
    try { const r = await api('/api/invitations', { method: 'POST', body: { template: id } }); nav(`/dashboard/edit/${r.id}`); }
    catch (e) { setError(e.message); setBusy(0); }
  }
  return (
    <dialog ref={ref} className="picker" onClose={onClose}>
      <div className="picker-head"><h2>Choose a design</h2><button className="pm-close" aria-label="Close" onClick={() => ref.current.close()}>×</button></div>
      <p className="muted">You can switch designs later while it’s a draft.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="picker-grid">
        {(site?.templates || []).map((t) => (
          <button key={t.id} className={'picker-item' + (t.id === preselect ? ' pre' : '')} disabled={!!busy} onClick={() => create(t.id)}>
            <img src={`/t/${t.id}/assets/img/og.jpg`} alt="" loading="lazy" />
            <span className="pi-name">{t.name} <TemplateBadge tier={t.tier} /></span>
            <span className="small muted">{busy === t.id ? 'Creating…' : t.category}</span>
          </button>
        ))}
      </div>
    </dialog>
  );
}

export default function Dashboard() {
  const { user, site } = useSession();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState(false);
  const [params, setParams] = useSearchParams();
  const preselect = Number(params.get('new')) || null;

  const load = () => api('/api/invitations').then((r) => setList(r.invitations)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (preselect) setPicker(true); }, [preselect]);

  async function remove(inv) {
    if (!confirm(`Delete “${inv.title}”? ${inv.status === 'published' ? 'The link will stop working and its RSVPs will be deleted. ' : ''}This cannot be undone.`)) return;
    try { await api(`/api/invitations/${inv.id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  }

  return (
    <>
      <AppBar />
      <main className="app-main wrap">
        <div className="app-head">
          <div><h1>Namaste, {user.name.split(' ')[0]}</h1><p className="muted">Your invitations</p></div>
          <button className="btn btn-primary" onClick={() => setPicker(true)}>+ New invitation</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {list === null ? <div className="page-loading" aria-busy="true" /> : list.length === 0 ? (
          <div className="empty card">
            <p className="empty-art" aria-hidden="true">❀</p>
            <h2>Let’s make your first invitation</h2>
            <p className="muted">Pick a design — it starts filled with sample content so you can see where everything goes.</p>
            <button className="btn btn-primary" onClick={() => setPicker(true)}>Choose a design</button>
          </div>
        ) : (
          <div className="inv-list">
            {list.map((inv) => (
              <article key={inv.id} className="inv-card card">
                <div className="inv-thumb-wrap"><img className="inv-thumb" src={`/t/${inv.template}/assets/img/og.jpg`} alt="" /><span>{site?.templates.find((t) => t.id === inv.template)?.name} design</span></div>
                <div className="inv-info">
                  <div className="inv-top">
                    <h2>{inv.title}</h2>
                    <span className={'status ' + inv.status}>{inv.status === 'published' ? `Live · ${inv.plan === 'premium' ? 'Royal' : 'Classic'}` : inv.plan ? `Draft · ${inv.plan === 'premium' ? 'Royal' : 'Classic'} plan` : 'Draft · choose a plan'}</span>
                  </div>
                  <p className="muted small">{formatDate(inv.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} · edited {formatDate(inv.updatedAt)}</p>
                  {inv.status === 'published' && <div className="stats"><span><b>{inv.views}</b> views</span><span><b>{inv.rsvpCount}</b> replies</span><span><b>{inv.guestCount}</b> guests coming</span></div>}
                  {inv.plan && inv.teamStatus !== 'ready' && <TeamCard inv={inv} />}
                  {inv.status === 'published' && <ShareBox inv={inv} />}
                  <div className="row">
                    <Link className="btn btn-sm btn-dark" to={`/dashboard/edit/${inv.id}`}>{!inv.plan ? 'Choose a plan' : inv.status === 'published' ? 'Edit' : 'Open'}</Link>
                    <a className="btn btn-sm btn-ghost" href={`/i/${inv.slug}`} target="_blank" rel="noopener">{inv.status === 'published' ? 'Open' : 'Preview'} ↗</a>
                    {inv.status === 'published' && <Link className="btn btn-sm btn-ghost" to={`/dashboard/inbox/${inv.id}`}>RSVPs</Link>}
                    <button className="btn btn-sm btn-text danger" onClick={() => remove(inv)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <NewInvitation open={picker} preselect={preselect} onClose={() => { setPicker(false); if (preselect) setParams({}); }} />
    </>
  );
}
