import { StrictMode, lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from './lib/session.jsx';
import { SiteLayout } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import './styles.css';

// Marketing pages load with the first bundle; the account area is split out.
const Templates = lazy(() => import('./pages/Templates.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Legal = lazy(() => import('./pages/Legal.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Editor = lazy(() => import('./pages/Editor.jsx'));
const Inbox = lazy(() => import('./pages/Inbox.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Team = lazy(() => import('./pages/Team.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function RequireUser({ children }) {
  const { user } = useSession();
  const loc = useLocation();
  if (user === undefined) return <div className="page-loading" aria-busy="true" />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return children;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Legal doc="terms" />} />
              <Route path="/privacy" element={<Legal doc="privacy" />} />
              <Route path="/refunds" element={<Legal doc="refunds" />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/dashboard" element={<RequireUser><Dashboard /></RequireUser>} />
            <Route path="/dashboard/edit/:id" element={<RequireUser><Editor /></RequireUser>} />
            <Route path="/dashboard/inbox/:id" element={<RequireUser><Inbox /></RequireUser>} />
            <Route path="/dashboard/account" element={<RequireUser><Account /></RequireUser>} />
            <Route path="/dashboard/team" element={<RequireUser><Team /></RequireUser>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SessionProvider>
  </StrictMode>
);
