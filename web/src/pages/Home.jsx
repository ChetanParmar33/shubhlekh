import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../lib/session.jsx';
import { Phone, TemplateGrid, Plans, Faq, useReveal } from '../components/Showcase.jsx';
import { formatINR, waLink } from '../lib/api.js';
import { WaIcon } from '../components/Layout.jsx';

const GUEST_FEATURES = [
  ['✦', 'An opening to remember', 'An envelope opens, haveli doors swing apart, kites take flight — each design has its own entrance.'],
  ['♪', 'Music that fits', 'Original instrumental tracks — shehnai, santoor, sitar, bansuri, dhol. Off with one tap.'],
  ['◐', 'Scratch to reveal', 'Guests scratch a kumkum thali, a kite or a full moon to uncover your date.'],
  ['⏳', 'Live countdown', 'Days, hours, minutes — always in Indian time, wherever your guests are.'],
  ['⌖', 'Maps & calendar', 'Directions for every event and one-tap “add to calendar”.'],
  ['✉', 'RSVP in seconds', 'Accept or decline, number of guests, which functions — straight to your inbox.'],
  ['અ', 'Your family’s language', 'English plus ગુજરાતી — names, events and messages in both, switchable by every guest.'],
  ['❀', '“Dear Shah Family”', 'Royal plan: a personal greeting for every family on their own link.'],
];

export default function Home() {
  const { site } = useSession();
  const tpls = site?.templates || [];
  const [cur, setCur] = useState(6);
  const plans = site?.plans || {};
  useReveal([site]);
  const active = tpls.find((t) => t.id === cur);

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true"><span className="orb o1" /><span className="orb o2" /><span className="orb o3" /></div>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow rise" style={{ '--d': '0ms' }}>Wedding invitations · made for WhatsApp</p>
            <h1 className="rise" style={{ '--d': '80ms' }}>Invitations that <em>open</em> like a celebration.</h1>
            <p className="lead rise" style={{ '--d': '160ms' }}>Pick a design and a plan — <b>our team sets up everything for you</b> on WhatsApp: names, events, photos, music. You just share a link that greets every guest with music, motion and an RSVP.</p>
            <div className="row rise" style={{ '--d': '240ms' }}>
              <Link className="btn btn-primary btn-lg" to="/signup">Create your invitation</Link>
              <Link className="btn btn-ghost btn-lg" to="/templates">See all {tpls.length || 12} designs</Link>
            </div>
            <p className="hero-note rise" style={{ '--d': '320ms' }}>Preview every design free · Plans from {formatINR(plans.basic?.price ?? 299)} · <a href={waLink(site, 'Hi! I’d like to know more about your wedding invitations.')} target="_blank" rel="noopener">Questions? WhatsApp us</a></p>
          </div>
          <div className="hero-phone rise" style={{ '--d': '200ms' }}>
            <Phone key={cur} src={`/t/${cur}/?nointro`} title={`${active?.name || 'Design'} live preview`} />
            <div className="switcher" role="tablist" aria-label="Try a design">
              {tpls.map((t) => (
                <button key={t.id} role="tab" aria-selected={t.id === cur} onClick={() => setCur(t.id)} title={t.name}>
                  <i style={{ background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)` }} /><span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ribbon" aria-hidden="true">
        <div className="ribbon-track">{Array.from({ length: 2 }).map((_, k) => <span key={k}>Sagai ✦ Ganesh Sthapana ✦ Mandap Muhurat ✦ Pithi ✦ Mehndi ✦ Mameru ✦ Garba ✦ Sangeet ✦ Hast Melap ✦ Pheras ✦ Kanyadaan ✦ Reception ✦ </span>)}</div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <header className="sec-head reveal"><p className="eyebrow">How it works</p><h2>You choose. We do the rest.</h2><p className="muted">No forms to fill and no design skills needed — after you buy a plan, our team contacts you on WhatsApp and builds your invitation for you.</p></header>
          <ol className="steps">
            <li className="reveal" style={{ '--d': '0ms' }}><span className="step-n">1</span><h3>Choose a design</h3><p>Twelve designs — kankotri, patola, garba, haveli, stepwell and more. Preview them all for free.</p></li>
            <li className="reveal" style={{ '--d': '90ms' }}><span className="step-n">2</span><h3>Buy a plan</h3><p>One-time {formatINR(plans.basic?.price ?? 299)} or {formatINR(plans.premium?.price ?? 499)}. That’s the only thing you have to do.</p></li>
            <li className="reveal" style={{ '--d': '150ms' }}><span className="step-n">3</span><h3>We WhatsApp you</h3><p>Our team collects names, dates, venues, photos and wishes on WhatsApp and builds your invitation — in English and ગુજરાતી.</p></li>
            <li className="reveal" style={{ '--d': '210ms' }}><span className="step-n">4</span><h3>Approve & share</h3><p>We send you a preview and change anything you like. Then share your link — <code>/i/your-names</code> — and RSVPs come straight to you.</p></li>
          </ol>
          <div className="done-for-you reveal">
            <p><b>Prefer to do it yourself?</b> You can also fill everything in our editor with a live preview — whichever is easier for you.</p>
            <a className="btn btn-wa" href={waLink(site, 'Hi! I’d like to know how the wedding invitation process works.')} target="_blank" rel="noopener"><WaIcon /> Ask us on WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="section section-tint" id="designs">
        <div className="wrap">
          <header className="sec-head reveal"><p className="eyebrow">The designs</p><h2>Twelve designs, one tap away</h2><p className="muted">Tap any design to open the real invitation.</p></header>
          <TemplateGrid />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="sec-head reveal"><p className="eyebrow">For your guests</p><h2>Everything they need, nothing they don’t</h2></header>
          <div className="features">{GUEST_FEATURES.map(([icon, h, p], i) => <div key={h} className="feature reveal" style={{ '--d': `${(i % 4) * 70}ms` }}><span className="f-icon" aria-hidden="true">{icon}</span><h3>{h}</h3><p>{p}</p></div>)}</div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="wrap split">
          <div className="reveal">
            <p className="eyebrow">For you</p>
            <h2>Your RSVPs, counted for you</h2>
            <p className="muted-light">See who is coming, how many guests and to which function — the caterer’s number is ready before you ask for it.</p>
            <ul className="ticks">
              <li>Totals per event: Mehndi, Garba, Hast Melap…</li>
              <li>Messages and blessings from guests</li>
              <li>Views of your invitation</li>
              <li>Download as a spreadsheet (Royal)</li>
            </ul>
          </div>
          <div className="inbox-mock reveal" aria-label="Example of the RSVP inbox">
            <div className="im-stats"><div><b>86</b><span>guests coming</span></div><div><b>41</b><span>replies</span></div><div><b>312</b><span>views</span></div></div>
            {[['Shah family', 'Coming · 4', 'Garba, Hast Melap'], ['Krupa & Jay', 'Coming · 2', 'All events'], ['Desai kaka', 'Can’t make it', '“Blessings to you both!”']].map(([n, s, e]) => (
              <div className="im-row" key={n}><span className="im-av">{n[0]}</span><div><b>{n}</b><small>{e}</small></div><span className={'im-pill' + (s.startsWith('Coming') ? ' yes' : '')}>{s}</span></div>
            ))}
            <p className="im-cap">Example data</p>
          </div>
        </div>
      </section>

      <section className="section scripts-band" aria-label="Languages">
        <div className="wrap scripts reveal"><span lang="gu">શુભ લગ્ન</span><span>Wedding</span><span lang="gu">કંકોત્રી</span><span>You’re invited</span><span lang="gu">સ્નેહભર્યું આમંત્રણ</span></div>
      </section>

      <section className="section section-tint" id="pricing">
        <div className="wrap">
          <header className="sec-head reveal"><p className="eyebrow">Pricing</p><h2>Two plans. Pay once.</h2><p className="muted">No subscription, no per-guest fees.</p></header>
          <Plans />
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap narrow">
          <header className="sec-head reveal"><p className="eyebrow">Questions</p><h2>Good to know</h2></header>
          <Faq />
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-inner reveal">
          <h2>Your families deserve a beautiful “you’re invited”.</h2>
          <p className="cta-sub">Choose a design and a plan — we’ll take it from there.</p>
          <div className="row"><Link className="btn btn-primary btn-lg" to="/templates">See the designs</Link><a className="btn btn-wa btn-lg" href={waLink(site, 'Hi! I want to book a wedding invitation.')} target="_blank" rel="noopener"><WaIcon /> WhatsApp us</a></div>
        </div>
      </section>
    </>
  );
}
