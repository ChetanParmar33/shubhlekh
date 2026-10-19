import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../lib/session.jsx';
import { waLink } from '../lib/api.js';

export const WaIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="wa-ic"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm-3.4 5.2c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.3 0 .6.5.9 1.3 1.7 2.2 2.2.3.2.4.1.6 0l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.4.4 0 .6-.2 1.4-.8 1.8-.6.4-1.5.6-2.4.3-2.6-.8-4.6-2.8-5.5-5.3-.3-.9-.1-2 .3-2.3Z"/></svg>;

// Floating “WhatsApp us” button on every page.
export function WaFab() {
  const { site, user } = useSession();
  if (user?.admin) return null; // our own team doesn't need it
  return <a className="wa-fab" href={waLink(site, 'Hi! I’d like to know more about your wedding invitations.')} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"><WaIcon /><span>WhatsApp us</span></a>;
}

export function Logo({ light }) {
  const { site } = useSession();
  return (
    <Link to="/" className={'logo' + (light ? ' light' : '')} aria-label={(site?.brand || 'Shubhlekh') + ' home'}>
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 54C17 43 17 24 32 9c15 15 15 34 0 45Z" fill="#f2a541" /><path d="M32 54c-7-9-7-20 0-31 7 11 7 22 0 31Z" fill="#e4572e" /></svg>
      <span>{site?.brand || 'Shubhlekh'}</span>
    </Link>
  );
}

export function Nav() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '') + (open ? ' open' : '')}>
      <div className="wrap nav-row">
        <Logo />
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/templates">Designs</NavLink>
          <Link to="/#how">How it works</Link>
          <NavLink to="/pricing">Pricing</NavLink>
          <Link to="/#faq">FAQ</Link>
        </nav>
        <div className="nav-cta">
          {user ? <Link className="btn btn-dark" to="/dashboard">My invitations</Link> : <>
            <Link className="nav-login" to="/login">Log in</Link>
            <Link className="btn btn-dark" to="/signup">Start free</Link>
          </>}
        </div>
        <button className="menu-btn" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}><i /><i /></button>
      </div>
      <div className="sheet" hidden={!open}>
        <Link to="/templates">Designs</Link><Link to="/#how">How it works</Link><Link to="/pricing">Pricing</Link><Link to="/#faq">FAQ</Link><Link to="/contact">Contact</Link>
        {user ? <Link className="btn btn-dark" to="/dashboard">My invitations</Link> : <><Link to="/login">Log in</Link><Link className="btn btn-dark" to="/signup">Start free</Link></>}
      </div>
    </header>
  );
}

export function Footer() {
  const { site } = useSession();
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Logo light />
          <p className="muted-light">Digital wedding invitations with cinematic openings, music and RSVPs — made in India.</p>
        </div>
        <div><h4>Product</h4><Link to="/templates">Designs</Link><Link to="/pricing">Pricing</Link><Link to="/signup">Create an invitation</Link></div>
        <div><h4>Help</h4><a href={waLink(site, 'Hi! I have a question about your wedding invitations.')} target="_blank" rel="noopener">WhatsApp us</a><Link to="/#faq">FAQ</Link><Link to="/contact">Contact us</Link>{site?.supportEmail && <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>}</div>
        <div><h4>Legal</h4><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/refunds">Refunds</Link></div>
      </div>
      <div className="wrap footer-base">© {new Date().getFullYear()} {site?.brand || 'Shubhlekh'} · Digital service, nothing is shipped.</div>
    </footer>
  );
}

export function SiteLayout() {
  const { hash } = useLocation();
  useEffect(() => { if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60); }, [hash]);
  return <><a className="skip" href="#main">Skip to content</a><Nav /><main id="main"><Outlet /></main><Footer /><WaFab /></>;
}

// Used by the account area
export function AppBar() {
  const { user, logout } = useSession();
  const nav = useNavigate();
  return (<>
    <header className="appbar">
      <div className="wrap nav-row">
        <Logo />
        <nav className="app-links" aria-label="Account">
          <NavLink to="/dashboard" end>Invitations</NavLink>
          <NavLink to="/dashboard/account">Account</NavLink>
          {user?.admin && <NavLink to="/dashboard/team">Team</NavLink>}
        </nav>
        <button className="btn btn-ghost btn-sm" onClick={async () => { await logout(); nav('/'); }}>Log out{user ? ` · ${user.name.split(' ')[0]}` : ''}</button>
      </div>
    </header>
    <WaFab />
  </>);
}
