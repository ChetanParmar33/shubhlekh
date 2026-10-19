import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section page-top center">
      <div className="wrap narrow">
        <p className="big-404" aria-hidden="true">❀ 404</p>
        <h1>This page wandered off</h1>
        <p className="muted">The page you were looking for doesn’t exist. If you were opening an invitation, check the link with whoever sent it.</p>
        <div className="row center"><Link className="btn btn-primary" to="/">Home</Link><Link className="btn btn-ghost" to="/templates">See the designs</Link></div>
      </div>
    </section>
  );
}
