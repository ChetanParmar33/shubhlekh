import { useSession } from '../lib/session.jsx';

// ⚠ Starting-point text only — have it reviewed for your business (GST details, registered address, jurisdiction) before launch.
const DOCS = {
  terms: { title: 'Terms of service', body: (b, mail) => [
    ['The service', `${b} lets you create a wedding invitation webpage, share its link and collect RSVPs. It is a digital service; nothing is shipped.`],
    ['Your account', 'Keep your password safe. You are responsible for what is published from your account, including names, photos and text, and you must have the right to use every photo you upload.'],
    ['Payments', 'Plans are one-time payments per invitation, paid before you start personalising. Publishing is then free. Upgrades from Classic to Royal cost the difference between the two plans.'],
    ['How long invitations stay online', 'Classic invitations stay online until 15 days after the last event; Royal invitations until 60 days after. After that the link shows a short thank-you message.'],
    ['Acceptable use', 'Do not use the service for anything unlawful, misleading or hurtful, or to collect guests’ data for any purpose other than the wedding.'],
    ['Changes and contact', `We may update these terms; the latest version is always on this page. Questions: ${mail}.`],
  ] },
  privacy: { title: 'Privacy policy', body: (b, mail) => [
    ['What we collect', 'Your name, email and password (stored only as a secure hash), the content and photos you add to your invitations, and payment references from our payment partner. We never see or store card or UPI details.'],
    ['Your guests', 'When guests RSVP we store the name, attendance, number of guests, chosen events and message they type. Only you can see them, in your dashboard.'],
    ['How we use it', 'To run your invitation, show your RSVPs and contact you about your account. We do not sell personal data.'],
    ['Cookies', 'We use one essential cookie to keep you logged in. There are no advertising trackers.'],
    ['Deleting data', `Deleting an invitation removes it and its RSVPs. To delete your account, write to ${mail}.`],
  ] },
  refunds: { title: 'Refund & cancellation policy', body: (b, mail) => [
    ['Before you pay', 'You can design and preview your invitation for free, as often as you like, so you see exactly what you are buying.'],
    ['After publishing', 'Because the invitation is delivered immediately, payments are generally non-refundable once published.'],
    ['Duplicate or failed payments', 'If you were charged twice or charged without the invitation being published, write to us within 7 days and we will refund the extra amount to the original payment method, usually within 5–7 working days.'],
    ['Contact', `Email ${mail} with your registered email address and payment reference.`],
  ] },
};

export default function Legal({ doc }) {
  const { site } = useSession();
  const d = DOCS[doc];
  const mail = site?.supportEmail || 'our support email';
  return (
    <section className="section page-top">
      <article className="wrap narrow prose">
        <h1>{d.title}</h1>
        {d.body(site?.brand || 'Shubhlekh', mail).map(([h, p]) => <div key={h}><h2>{h}</h2><p>{p}</p></div>)}
      </article>
    </section>
  );
}
