import { Plans, Faq, useReveal } from '../components/Showcase.jsx';
import { useSession } from '../lib/session.jsx';
import { formatINR } from '../lib/api.js';

export default function Pricing() {
  const { site } = useSession();
  useReveal([site]);
  const b = site?.plans?.basic, p = site?.plans?.premium;
  const names = (ids) => (site?.templates || []).filter((t) => ids?.includes(t.id)).map((t) => t.name).join(', ');
  const rows = b && p ? [
    ['Price (one-time)', formatINR(b.price), formatINR(p.price)],
    ['Designs', names(b.templates), names(p.templates)],
    ['Gallery photos', `Up to ${b.maxGallery}`, `Up to ${p.maxGallery}`],
    ['Music & sound effects', '✓', '✓'],
    ['English + ગુજરાતી', '✓', '✓'],
    ['Full setup by our team on WhatsApp', '✓', '✓ priority'],
    ['Customisation on request', '✓', '✓ unlimited'],
    ['RSVP inbox with totals', '✓', '✓'],
    ['Maps, calendar & WhatsApp share', '✓', '✓'],
    ['Personalised guest links', '—', '✓'],
    ['Download RSVPs (CSV)', '—', '✓'],
    ['Online until', `${b.daysAfterEvent} days after the event`, `${p.daysAfterEvent} days after the event`],
  ] : [];
  return (
    <>
      <section className="section page-top">
        <div className="wrap">
          <header className="sec-head"><p className="eyebrow">Pricing</p><h1>Simple, one-time pricing</h1><p className="muted">Preview every design for free. You only buy the plan — our team contacts you on WhatsApp and sets up the whole invitation for you, in both plans. Already on Classic? Upgrade to Royal by paying just the difference.</p></header>
          <Plans />
        </div>
      </section>
      <section className="section section-tint">
        <div className="wrap narrow">
          <h2 className="center reveal">Compare plans</h2>
          <div className="table-wrap reveal">
            <table className="compare">
              <thead><tr><th scope="col">Feature</th><th scope="col">{b?.name}</th><th scope="col">{p?.name}</th></tr></thead>
              <tbody>{rows.map(([f, x, y]) => <tr key={f}><th scope="row">{f}</th><td>{x}</td><td>{y}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="muted small center">Prices include GST where applicable. Payments are handled securely by Razorpay (UPI, cards, net-banking).</p>
        </div>
      </section>
      <section className="section"><div className="wrap narrow"><h2 className="center reveal">Questions</h2><Faq /></div></section>
    </>
  );
}
