import { useState } from 'react';
import { TemplateGrid, useReveal } from '../components/Showcase.jsx';
import { useSession } from '../lib/session.jsx';

const FILTERS = ['All', 'Traditional', 'Textile', 'Festive', 'Heritage', 'Devotional', 'Modern'];

export default function Templates() {
  const [filter, setFilter] = useState('All');
  const { site } = useSession();
  useReveal([filter, site]);
  return (
    <section className="section page-top">
      <div className="wrap">
        <header className="sec-head"><p className="eyebrow">Designs</p><h1>Choose the world your invitation opens into</h1><p className="muted">Every design has its own opening animation, music and colours, in English and ગુજરાતી. Tap one to try it live — no sign-up needed.</p></header>
        <div className="chips" role="group" aria-label="Filter by style">
          {FILTERS.map((f) => <button key={f} className={'chip' + (f === filter ? ' on' : '')} aria-pressed={f === filter} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <TemplateGrid filter={filter} />
        <p className="muted small center">Royal designs are included in the Royal plan; Classic designs work with either plan.</p>
      </div>
    </section>
  );
}
