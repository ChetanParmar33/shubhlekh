// Thin fetch wrapper. Errors carry the server's message (and offending field) for forms to show.
export class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}

export async function api(path, { method = 'GET', body, raw } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body && !raw ? { 'Content-Type': 'application/json' } : undefined,
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = (res.headers.get('content-type') || '').includes('json') ? await res.json() : null;
  if (!res.ok) throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status, data);
  return data;
}

export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const formatDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...opts }).format(new Date(iso)) : '';

// "Chat with our team" link. Without SUPPORT_WHATSAPP set on the server it opens WhatsApp's contact picker.
export const waLink = (site, text) => `https://wa.me/${site?.whatsapp || ''}?text=${encodeURIComponent(text)}`;
// Our team messaging a customer (admin page).
export const waTo = (phone, text) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
// What the customer sees after buying: our team does the work.
export const TEAM_STATUS = {
  new: ['Payment received', 'Our team will WhatsApp you within 24 hours to collect your details.'],
  contacted: ['We’re in touch', 'Send names, dates, photos and wishes on WhatsApp — we’ll do the rest.'],
  building: ['Being designed', 'Our team is setting up your invitation. We’ll share a preview on WhatsApp.'],
  ready: ['Ready to share', 'Your invitation is ready. Check it and share the link with your guests.'],
};
