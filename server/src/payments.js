// Razorpay Orders API + signature checks. https://razorpay.com/docs/payments/server-integration/
import crypto from 'node:crypto';
import { config } from './config.js';

export const paymentMode = () => (config.razorpay.keyId && config.razorpay.keySecret ? 'razorpay' : config.devPayments ? 'dev' : 'off');

export async function createRazorpayOrder({ amountPaise, receipt, notes }) {
  if (!Number.isInteger(amountPaise) || amountPaise < 100) throw Object.assign(new Error('Razorpay orders need at least 100 paise'), { status: 400 });
  const auth = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  });
  if (!res.ok) {
    const why = (await res.json().catch(() => null))?.error?.description || '';
    // 401 = the key id / secret in .env are wrong (or test and live keys are mixed)
    throw Object.assign(new Error(`Razorpay order failed (${res.status}) ${why}`.trim()), { status: res.status, auth: res.status === 401 });
  }
  return res.json();
}

const hmac = (secret, text) => crypto.createHmac('sha256', secret).update(text).digest('hex');
const same = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  return same(hmac(config.razorpay.keySecret, `${orderId}|${paymentId}`), signature);
}
export function verifyWebhook(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return !!secret && same(hmac(secret, rawBody), signature);
}
