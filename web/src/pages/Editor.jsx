import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, waLink } from '../lib/api.js';
import { WaIcon } from '../components/Layout.jsx';
import { useSession } from '../lib/session.jsx';
import { TemplateBadge, LANG_NAME, TeamCard } from '../components/Showcase.jsx';
import { Text, Area, When, Select, Toggle, Photo, Repeat, uploadPhoto, Lang2 } from '../components/fields.jsx';
import { PublishDialog } from '../components/Publish.jsx';
import { ShareBox } from './Dashboard.jsx';

const ICONS = [['wedding', 'Mandap'], ['mehndi', 'Mehndi'], ['haldi', 'Haldi'], ['sangeet', 'Sangeet / music'], ['reception', 'Reception / dinner'], ['rings', 'Engagement'], ['gurdwara', 'Gurdwara'], ['moon', 'Nikah / moon'], ['lamp', 'Puja / diya']];
const TRAVEL_ICONS = [['plane', 'Arriving'], ['stay', 'Staying'], ['car', 'Car / shuttle'], ['boat', 'Boat']];
const SECTIONS = ['Customisation help', 'Design & link', 'Couple', 'Date & message', 'Photos', 'Events', 'Venue', 'Our story', 'Dress code', 'Travel', 'Families', 'RSVP & contact', 'Wishes', 'Guest links'];
const key = () => Math.random().toString(36).slice(2, 9);
const withKeys = (a) => (a || []).map((x) => ({ _k: key(), ...x }));
const en = (v) => (v && typeof v === 'object' ? v.en : v) || '';
const stripKeys = (d) => JSON.parse(JSON.stringify(d, (k, v) => (k === '_k' ? undefined : v)));

export default function Editor() {
  const { id } = useParams();
  const { site } = useSession();
  const [inv, setInv] = useState(null);
  const [data, setData] = useState(null);
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState(null);
  const [save, setSave] = useState({ state: 'saved', error: '', field: '' });
  const [open, setOpen] = useState('Couple');
  const [shared, setShared] = useState(false);
  const [pubErr, setPubErr] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [intro, setIntro] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [publish, setPublish] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const dirty = useRef(false);
  const timer = useRef(null);
  const latest = useRef({});

  useEffect(() => {
    api(`/api/invitations/${id}`).then((r) => {
      setInv(r.invitation); setSlug(r.invitation.slug); setTemplate(r.invitation.template);
      const d = r.data;
      setData({ ...d, events: withKeys(d.events), story: withKeys(d.story), dress: withKeys(d.dress), travel: withKeys(d.travel), wishes: withKeys(d.wishes), guests: withKeys(d.guests), photos: { ...d.photos, gallery: withKeys(d.photos?.gallery) } });
    }).catch((e) => setLoadErr(e.message));
  }, [id]);

  latest.current = { data, slug, template };
  const doSave = useCallback(async () => {
    clearTimeout(timer.current);
    if (!dirty.current) return true;
    dirty.current = false;
    setSave({ state: 'saving', error: '', field: '' });
    const { data: d, slug: s, template: t } = latest.current;
    try {
      const r = await api(`/api/invitations/${id}`, { method: 'PUT', body: { data: stripKeys(d), slug: s, template: t } });
      setInv(r.invitation); setSave({ state: 'saved', error: '', field: '' }); setPreviewKey((k) => k + 1);
      return true;
    } catch (e) {
      dirty.current = true;
      setSave({ state: 'error', error: e.message, field: e.data?.field || '' });
      return false;
    }
  }, [id]);

  const touch = () => { dirty.current = true; setSave((s) => ({ ...s, state: 'unsaved' })); clearTimeout(timer.current); timer.current = setTimeout(doSave, 1200); };
  const up = (fn) => { setData((d) => { const n = structuredClone(d); fn(n); return n; }); touch(); };
  const set = (path) => (v) => up((d) => { const ks = path.split('.'); let o = d; ks.slice(0, -1).forEach((k) => { o = o[k] ??= {}; }); o[ks.at(-1)] = v; });

  async function goLive() {
    setPubErr('');
    if (!(await doSave())) return;
    try { const r = await api(`/api/invitations/${id}/publish`, { method: 'POST' }); setInv(r.invitation); setShared(true); }
    catch (e) { setPubErr(e.message); if (e.data?.upgrade) setPublish(true); }
  }

  useEffect(() => {
    const warn = (e) => { if (dirty.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => { window.removeEventListener('beforeunload', warn); clearTimeout(timer.current); };
  }, []);

  if (loadErr) return <div className="wrap section"><p className="form-error">{loadErr}</p><Link to="/dashboard">← Back to invitations</Link></div>;
  if (!data || !site) return <div className="page-loading" aria-busy="true" />;

  const tpl = site.templates.find((t) => t.id === template);
  const published = inv.status === 'published';
  const plan = inv.plan ? site.plans[inv.plan] : null;
  const evOptions = data.events.map((e) => [e.id, en(e.name) || 'Event']);
  const previewSrc = `/i/${inv.slug}${intro ? '' : '?nointro'}`;

  const section = (name, body) => (
    <section className={'ed-sec' + (open === name ? ' open' : '')} key={name} id={'sec-' + name}>
      <button type="button" className="ed-sec-head" aria-expanded={open === name} onClick={() => setOpen(open === name ? '' : name)}>{name}<span aria-hidden="true">{open === name ? '−' : '+'}</span></button>
      {open === name && <div className="ed-sec-body">{body}</div>}
    </section>
  );

  return (
    <div className="editor">
      <header className="ed-bar">
        <Link to="/dashboard" className="btn btn-sm btn-text">← Invitations</Link>
        <div className="ed-title"><b>{en(data.groom.name) || 'Groom'} & {en(data.bride.name) || 'Bride'}</b><span className={'save-state ' + save.state}>{{ saved: 'All changes saved', saving: 'Saving…', unsaved: 'Unsaved changes', error: 'Not saved' }[save.state]}</span></div>
        <div className="row">
          <button className="btn btn-sm btn-ghost only-mobile" onClick={() => { doSave(); setMobilePreview(true); }}>Preview</button>
          {!plan ? <button className="btn btn-sm btn-primary" onClick={() => setPublish(true)}>Choose a plan</button>
            : !published ? <button className="btn btn-sm btn-primary" onClick={goLive}>Publish</button>
            : <>{inv.plan === 'basic' && <button className="btn btn-sm btn-ghost" onClick={() => setPublish(true)}>Upgrade</button>}<a className="btn btn-sm btn-dark" href={`/i/${inv.slug}`} target="_blank" rel="noopener">Open live ↗</a></>}
        </div>
      </header>
      {save.state === 'error' && <p className="ed-error" role="alert">{save.error}</p>}
      {pubErr && <p className="ed-error" role="alert">{pubErr}</p>}
      {shared && <div className="ed-live" role="status"><b>Your invitation is live!</b> Share the link — guests always see the latest version.<ShareBox inv={inv} /><button className="btn btn-sm btn-text" onClick={() => setShared(false)}>Close</button></div>}

      <div className="ed-grid">
        <div className="ed-form">
          {!plan ? <Paywall site={site} tpl={tpl} inv={inv} onBuy={() => setPublish(true)} /> : <Lang2.Provider value={data.secondLanguage ? tpl?.lang2 || null : null}>
          {inv.teamStatus !== 'ready' && <TeamCard inv={inv} />}
          <p className="hint ed-optional">Our team sets everything up for you. Editing here is optional — change anything yourself if you like.</p>
          <nav className="ed-index" aria-label="Sections">{SECTIONS.map((s) => <button key={s} className={open === s ? 'on' : ''} onClick={() => { setOpen(s); setTimeout(() => document.getElementById('sec-' + s)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }}>{s}</button>)}</nav>

          {section('Customisation help', <Customise inv={inv} plan={plan} site={site} />)}

          {section('Design & link', <>
            <div className="tpl-mini">
              {site.templates.map((t) => {
                const locked = plan && !plan.templates.includes(t.id);
                return (
                  <button key={t.id} type="button" className={'tm' + (t.id === template ? ' on' : '')} disabled={locked} title={locked ? 'Royal design — upgrade to use' : ''} onClick={() => { setTemplate(t.id); touch(); }}>
                    <img src={`/t/${t.id}/assets/img/og.jpg`} alt="" /><span>{t.name}</span><TemplateBadge tier={t.tier} />
                  </button>
                );
              })}
            </div>
            <div className="fld">
              <label htmlFor="slug">Your link</label>
              <div className="slug"><span>{location.host}/i/</span><input id="slug" value={slug} maxLength={40} aria-invalid={save.field === 'slug'} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); touch(); }} /></div>
              <p className="hint">Letters, numbers and dashes. Changing it after sharing breaks the old link.</p>
            </div>
            <Toggle label={`Second language (${LANG_NAME[tpl?.lang2]})`} hint="Guests can switch the whole invitation to this language. Fill the second box under each field to translate your own text." checked={data.secondLanguage} onChange={set('secondLanguage')} />
            <Toggle label="Music & sound effects" hint="Starts only when the guest taps to open." checked={data.music} onChange={set('music')} />
          </>)}

          {section('Couple', <>
            <div className="two"><Text label="Groom’s name" value={data.groom.name} onChange={set('groom.name')} max={40} /><Text label="Bride’s name" value={data.bride.name} onChange={set('bride.name')} max={40} /></div>
            <Text label="Groom’s parents" value={data.groom.parents} onChange={set('groom.parents')} max={160} placeholder="Son of Mrs. … & Mr. …" />
            <Text label="Bride’s parents" value={data.bride.parents} onChange={set('bride.parents')} max={160} placeholder="Daughter of Mrs. … & Mr. …" />
            <div className="two"><Text plain label="Monogram" value={data.monogram} onChange={set('monogram')} max={12} hint="e.g. A & K" /><Text plain label="Hashtag" value={data.hashtag} onChange={set('hashtag')} max={40} /></div>
            <Text plain label="Blessing line at the top" value={data.invocation} onChange={set('invocation')} max={60} hint="e.g. ॥ શ્રી ગણેશાય નમઃ ॥ or ॥ શુભ લગ્ન ॥ — leave empty for none" />
            <Text label="Line above your names" value={data.heroLine} onChange={set('heroLine')} max={80} />
          </>)}

          {section('Date & message', <>
            <When label="Main date & time (for the countdown and date reveal)" value={data.date} onChange={set('date')} hint="Indian Standard Time" />
            <Text label="City" value={data.city} onChange={set('city')} max={60} />
            <Area label="Invitation message" value={data.message} onChange={set('message')} max={600} rows={4} />
          </>)}

          {section('Photos', <>
            <p className="hint">Empty slots use the design’s own pictures. Photos are resized on your phone before upload.</p>
            <div className="photo-grid">
              {template !== 1 && <Photo label="Main photo (top)" value={data.photos.hero} fallback={undefined} onChange={set('photos.hero')} invId={inv.id} template={template} />}
              <Photo label="Invitation card photo" value={data.photos.invite} onChange={set('photos.invite')} invId={inv.id} template={template} />
              <Photo label="Venue photo" value={data.photos.venue} onChange={set('photos.venue')} invId={inv.id} template={template} />
              <Photo label="Closing photo" value={data.photos.end} onChange={set('photos.end')} invId={inv.id} template={template} />
            </div>
            {template === 1 && <p className="hint">Chandni Mahal opens with its own animated palace video, so it has no main photo.</p>}
            <h3 className="ed-sub">Gallery</h3>
            <Gallery inv={inv} template={template} items={data.photos.gallery} max={12} planMax={plan?.maxGallery} onChange={(g) => up((d) => { d.photos.gallery = g; })} />
          </>)}

          {section('Events', <Repeat items={data.events} max={8} addLabel="Add event" onChange={(v) => up((d) => { d.events = v; })}
            blank={() => ({ _k: key(), id: 'ev' + key(), icon: 'wedding', name: '', start: data.date, hours: 3, venue: '', address: '', note: '', main: false })}
            render={(e, ch) => (<>
              <div className="two"><Text label="Event name" value={e.name} onChange={(v) => ch({ ...e, name: v })} max={50} /><Select label="Icon" value={e.icon} options={ICONS} onChange={(v) => ch({ ...e, icon: v })} /></div>
              <div className="two"><When label="Starts" value={e.start} onChange={(v) => ch({ ...e, start: v })} /><Text plain label="Duration (hours)" type="number" min="1" max="24" value={e.hours} onChange={(v) => ch({ ...e, hours: Number(v) })} /></div>
              <Text label="Venue name" value={e.venue} onChange={(v) => ch({ ...e, venue: v })} max={100} />
              <Text plain label="Address (for directions)" value={e.address} onChange={(v) => ch({ ...e, address: v })} max={200} />
              <Text label="Short note" value={e.note} onChange={(v) => ch({ ...e, note: v })} max={160} />
              <label className="radio-row"><input type="radio" name="main-event" checked={!!e.main} onChange={() => up((d) => { d.events.forEach((x) => { x.main = x._k === e._k; }); })} /> Main ceremony (highlighted)</label>
            </>)} />)}

          {section('Venue', <>
            <Text label="Main venue name" value={data.venue.name} onChange={set('venue.name')} max={100} />
            <Text plain label="Address" value={data.venue.address} onChange={set('venue.address')} max={200} />
            <Text plain label="Google Maps search text" value={data.venue.map} onChange={set('venue.map')} max={160} hint="What you’d type into Google Maps to find it, e.g. “Shah Niwas Navrangpura Ahmedabad”." />
          </>)}

          {section('Our story', <Repeat items={data.story} max={6} addLabel="Add a moment" onChange={(v) => up((d) => { d.story = v; })}
            blank={() => ({ _k: key(), when: '', title: '', text: '', photo: '' })}
            render={(s, ch) => (<>
              <div className="two"><Text label="When" value={s.when} onChange={(v) => ch({ ...s, when: v })} max={40} placeholder="Navratri 2023" /><Text label="Title" value={s.title} onChange={(v) => ch({ ...s, title: v })} max={80} /></div>
              <Area label="What happened" value={s.text} onChange={(v) => ch({ ...s, text: v })} max={400} />
              <Photo label="Photo" value={s.photo} onChange={(v) => ch({ ...s, photo: v })} invId={inv.id} template={template} />
            </>)} />)}

          {section('Dress code', <Repeat items={data.dress} max={8} addLabel="Add dress code" onChange={(v) => up((d) => { d.dress = v; })}
            blank={() => ({ _k: key(), event: data.events[0]?.id, colors: ['#c2185b', '#f6b819', '#ffffff'], text: '' })}
            render={(x, ch) => (<>
              <div className="two"><Select label="For event" value={x.event} options={evOptions} onChange={(v) => ch({ ...x, event: v })} /><Text label="Suggestion" value={x.text} onChange={(v) => ch({ ...x, text: v })} max={120} /></div>
              <div className="colors">{[0, 1, 2].map((k) => <label key={k}><span className="sr">Colour {k + 1}</span><input type="color" value={x.colors[k] || '#ffffff'} onChange={(e) => { const c = [...x.colors]; c[k] = e.target.value; ch({ ...x, colors: c }); }} /></label>)}</div>
            </>)} />)}

          {section('Travel', <Repeat items={data.travel} max={4} addLabel="Add tip" onChange={(v) => up((d) => { d.travel = v; })}
            blank={() => ({ _k: key(), icon: 'car', title: '', text: '' })}
            render={(x, ch) => (<>
              <div className="two"><Select label="Icon" value={x.icon} options={TRAVEL_ICONS} onChange={(v) => ch({ ...x, icon: v })} /><Text label="Title" value={x.title} onChange={(v) => ch({ ...x, title: v })} max={40} /></div>
              <Area label="Details" value={x.text} onChange={(v) => ch({ ...x, text: v })} max={300} rows={2} />
            </>)} />)}

          {section('Families', <>
            <Text label="Bride’s family title" value={data.families.bride.title} onChange={set('families.bride.title')} max={60} />
            <Area label="Bride’s family members (one per line)" value={data.families.bride.names} onChange={set('families.bride.names')} max={300} />
            <Text label="Groom’s family title" value={data.families.groom.title} onChange={set('families.groom.title')} max={60} />
            <Area label="Groom’s family members (one per line)" value={data.families.groom.names} onChange={set('families.groom.names')} max={300} />
          </>)}

          {section('RSVP & contact', <>
            <div className="two"><When label="Reply by" value={data.rsvp.deadline} onChange={set('rsvp.deadline')} /><Text plain label="Max guests per reply" type="number" min="1" max="20" value={data.rsvp.maxGuests} onChange={(v) => set('rsvp.maxGuests')(Number(v))} /></div>
            <div className="two"><Text label="Contact person" value={data.contact.name} onChange={set('contact.name')} max={60} /><Text plain label="Contact phone" value={data.contact.phone} onChange={set('contact.phone')} max={20} inputMode="tel" /></div>
          </>)}

          {section('Wishes', <>
            <p className="hint">Notes shown on the scrolling wishes wall — add blessings from family.</p>
            <Repeat items={data.wishes} max={10} addLabel="Add wish" onChange={(v) => up((d) => { d.wishes = v; })} blank={() => ({ _k: key(), name: '', text: '' })}
              render={(w, ch) => <div className="two"><Text plain label="From" value={w.name} onChange={(v) => ch({ ...w, name: v })} max={40} /><Text label="Wish" value={w.text} onChange={(v) => ch({ ...w, text: v })} max={200} /></div>} />
          </>)}

          {section('Guest links', <GuestLinks inv={inv} plan={plan} items={data.guests} onChange={(g) => up((d) => { d.guests = g; })} />)}
          </Lang2.Provider>}
        </div>

        <aside className={'ed-preview' + (mobilePreview ? ' show' : '')} aria-label="Live preview">
          <div className="ed-preview-bar">
            <span>Live preview</span>
            <label className="small"><input type="checkbox" checked={intro} onChange={(e) => { setIntro(e.target.checked); setPreviewKey((k) => k + 1); }} /> with opening</label>
            <button className="btn btn-sm btn-ghost only-mobile" onClick={() => setMobilePreview(false)}>Close</button>
          </div>
          <div className="phone"><div className="phone-notch" /><iframe key={previewKey + template} src={previewSrc} title="Invitation preview" allow="autoplay" /></div>
        </aside>
      </div>

      <PublishDialog open={publish} onClose={() => setPublish(false)} inv={inv} data={stripKeys(data)} beforePay={doSave} onPaid={(i) => setInv(i)} />
    </div>
  );
}

function Gallery({ inv, template, items, max, planMax, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function add(e) {
    const files = [...e.target.files].slice(0, max - items.length); e.target.value = '';
    setBusy(true); setErr('');
    const out = [...items];
    for (const f of files) {
      try { out.push({ _k: key(), src: await uploadPhoto(inv.id, f), alt: '' }); } catch (ex) { setErr(ex.message); }
    }
    onChange(out); setBusy(false);
  }
  return (
    <div>
      <div className="gal">
        {items.map((g, i) => (
          <figure key={g._k}>
            <img src={g.src.startsWith('assets/') ? `/t/${template}/${g.src}` : g.src} alt="" />
            <figcaption>
              <button aria-label="Move left" disabled={!i} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>‹</button>
              <button aria-label="Remove" className="danger" onClick={() => onChange(items.filter((_, k) => k !== i))}>×</button>
              <button aria-label="Move right" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }}>›</button>
            </figcaption>
          </figure>
        ))}
        {items.length < max && <label className="gal-add">{busy ? 'Uploading…' : '+ Add photos'}<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr" onChange={add} disabled={busy} /></label>}
      </div>
      {planMax && items.length > planMax && <p className="form-error">Your plan includes {planMax} gallery photos — remove some or upgrade.</p>}
      {err && <p className="form-error" role="alert">{err}</p>}
      <p className="hint">Classic: up to 6 photos · Royal: up to 12.</p>
    </div>
  );
}

function GuestLinks({ inv, plan, items, onChange }) {
  const [label, setLabel] = useState('');
  const [copied, setCopied] = useState('');
  const royal = !plan || plan.guestLinks;
  const token = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
  const url = (t) => `${location.origin}/i/${inv.slug}?to=${t}`;
  return (
    <div>
      <p className="hint">Each family gets their own link that greets them by name — “Dear Shah Family”. {!royal && <b>Royal plan feature — upgrade to add links.</b>}{!plan && ' Available on the Royal plan.'}</p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (!label.trim()) return; onChange([...items, { _k: key(), token: token(), label: label.trim() }]); setLabel(''); }}>
        <input className="grow" value={label} maxLength={60} placeholder="Dear Shah Family" onChange={(e) => setLabel(e.target.value)} aria-label="Greeting" disabled={!royal} />
        <button className="btn btn-sm btn-dark" disabled={!royal || !label.trim()}>Add</button>
      </form>
      <ul className="guest-list">
        {items.map((g) => (
          <li key={g.token}>
            <span><b>{g.label}</b><small>{url(g.token)}</small></span>
            <button className="btn btn-sm btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(url(g.token)); } catch { /* ignore */ } setCopied(g.token); setTimeout(() => setCopied(''), 1500); }}>{copied === g.token ? 'Copied' : 'Copy'}</button>
            <a className="btn btn-sm btn-wa" href={`https://wa.me/?text=${encodeURIComponent(`${g.label}, you are invited! ${url(g.token)}`)}`} target="_blank" rel="noopener">WhatsApp</a>
            <button className="btn btn-sm btn-text danger" onClick={() => onChange(items.filter((x) => x.token !== g.token))}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Paywall({ site, tpl, inv, onBuy }) {
  const plans = Object.values(site.plans);
  return (
    <div className="paywall">
      <p className="eyebrow">The only step for you</p>
      <h2>Choose a plan — our team does the rest</h2>
      <p className="muted">You’re looking at the <b>{tpl?.name}</b> design with sample content. Buy a plan once and our team will WhatsApp you within 24 hours, collect your names, dates, venues and photos, and set up the whole invitation for you — in English and ગુજરાતી.</p>
      <ul className="paywall-plans">
        {plans.map((p) => {
          const ok = p.templates.includes(tpl?.id);
          return <li key={p.id} className={ok ? '' : 'off'}><b>{p.name}</b> <span>₹{p.price}</span><small>{ok ? p.features.slice(1, 3).join(' · ') : `${tpl?.name} is a Royal design`}</small></li>;
        })}
      </ul>
      <div className="row"><button className="btn btn-primary btn-lg" onClick={onBuy}>Choose a plan</button><a className="btn btn-wa btn-lg" href={waLink(site, `Hi! I’m looking at the ${tpl?.name} design and have a question before buying.`)} target="_blank" rel="noopener"><WaIcon /> Ask us first</a></div>
      <p className="small muted">One-time payment · UPI, cards & net-banking · Want a different design first? <Link to="/dashboard">Go back</Link>.</p>
    </div>
  );
}

function Customise({ inv, plan, site }) {
  const [list, setList] = useState(null);
  const [msg, setMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ busy: false, error: '', sent: false });
  useEffect(() => { api(`/api/invitations/${inv.id}/customizations`).then((r) => setList(r.requests)).catch(() => setList([])); }, [inv.id]);
  async function send(e) {
    e.preventDefault();
    setState({ busy: true, error: '', sent: false });
    try { const r = await api(`/api/invitations/${inv.id}/customizations`, { method: 'POST', body: { message: msg, phone } }); setList(r.requests); setMsg(''); setState({ busy: false, error: '', sent: true }); }
    catch (ex) { setState({ busy: false, error: ex.message, sent: false }); }
  }
  const STATUS = { open: 'Received', in_progress: 'In progress', done: 'Done' };
  return (
    <div>
      <p className="hint">Want a different colour, an extra section, your own music or wording? Tell us and our team will do it for you. Included in your {plan?.name} plan{plan?.id === 'premium' ? ' with priority' : ''}.</p>
      <form onSubmit={send}>
        <div className="fld"><label htmlFor="cz-msg">What should we change?</label><textarea id="cz-msg" rows={4} maxLength={2000} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="e.g. Please make the gate pink and add our pre-wedding photo to the opening." /></div>
        <div className="fld"><label htmlFor="cz-ph">WhatsApp number (so we can reach you)</label><input id="cz-ph" inputMode="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" /></div>
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        {state.sent && <p className="form-ok" role="status">Request sent — we’ll get back to you within a day.</p>}
        <button className="btn btn-sm btn-dark" disabled={state.busy || msg.trim().length < 10}>{state.busy ? 'Sending…' : 'Send request'}</button>
        <a className="btn btn-sm btn-wa" href={waLink(site, `Hi! A customisation for “${inv.title}” (${inv.url}): `)} target="_blank" rel="noopener"><WaIcon /> Or tell us on WhatsApp</a>
      </form>
      {list?.length > 0 && (
        <ul className="cz-list">
          {list.map((r) => <li key={r.id}><span className={'status ' + r.status}>{STATUS[r.status] || r.status}</span><p>{r.message}</p><small>{new Date(r.created_at.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small></li>)}
        </ul>
      )}
    </div>
  );
}
