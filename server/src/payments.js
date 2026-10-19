// Razorpay Orders API + signature checks. https://razorpay.com/docs/payments/server-integration/
import crypto from 'node:crypto';
import { config } from './config.js';

export const paymentMode = () => (config.razorpay.keyId && config.razorpay.keySecret ? 'razorpay' : config.devPayments ? 'dev' : 'off');

export async function createRazorpayOrder({ amountPaise, receipt, notes }) {
  const auth = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
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
