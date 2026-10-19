import { createContext, useContext, useId, useState } from 'react';
import { api } from '../lib/api.js';

// Store dates as "+05:30" ISO strings (what the templates expect); edit them as local IST in <input type="datetime-local">.
export const toLocal = (iso) => {
  if (!iso) return '';
  if (/\+05:30$/.test(iso)) return iso.slice(0, 16);
  const d = new Date(new Date(iso).getTime() + 5.5 * 36e5);
  return d.toISOString().slice(0, 16);
};
export const fromLocal = (v) => (v ? `${v}:00+05:30` : '');

// Second language of the design ('gu') when it is switched on — text fields then show an extra input for it.
export const Lang2 = createContext(null);
const L2_NAME = { gu: 'ગુજરાતી', hi: 'हिन्दी', pa: 'ਪੰਜਾਬੀ', ur: 'اردو', ta: 'தமிழ்' };
// Bilingual values are { en, gu }; plain strings become that shape once the second field is typed in.
const part = (v, k) => (v && typeof v === 'object' ? v[k] : k === 'en' ? v : '') ?? '';
const merge = (v, k, x, l2) => ({ en: part(v, 'en'), [l2]: part(v, l2), [k]: x });

function Field({ tag: Tag, label, value, onChange, hint, max, plain, ...rest }) {
  const id = useId();
  const l2 = useContext(Lang2);
  const bi = l2 && !plain;
  return (
    <div className={'fld' + (bi ? ' fld-bi' : '')}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} value={part(value, 'en')} maxLength={max} onChange={(e) => onChange(bi && typeof value === 'object' ? merge(value, 'en', e.target.value, l2) : e.target.value)} {...rest} />
      {bi && <Tag {...rest} lang={l2} aria-label={`${label} — ${L2_NAME[l2]}`} placeholder={L2_NAME[l2]} value={part(value, l2)} maxLength={max} onChange={(e) => onChange(merge(value, l2, e.target.value, l2))} />}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
export function Text({ max = 120, ...p }) { return <Field tag="input" max={max} {...p} />; }
export function Area({ max = 600, rows = 3, ...p }) { return <Field tag="textarea" max={max} rows={rows} {...p} />; }
export function When({ label, value, onChange, hint }) {
  const id = useId();
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="datetime-local" value={toLocal(value)} onChange={(e) => onChange(fromLocal(e.target.value))} />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
export function Select({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </div>
  );
}
export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="toggle-row">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="tg" aria-hidden="true" />
      <span><b>{label}</b>{hint && <small>{hint}</small>}</span>
    </label>
  );
}

// Phone photos are often 5–12 MB: shrink to ≤1600px JPEG in the browser before uploading.
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please choose a JPG, PNG or WebP photo.');
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 900e3) return file;
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
  } catch { return file; }
}
export async function uploadPhoto(invId, file) {
  const blob = await shrink(file);
  const r = await api(`/api/invitations/${invId}/uploads`, { method: 'POST', body: blob, raw: true });
  return r.src;
}
const srcFor = (src, tpl) => (src?.startsWith('assets/') ? `/t/${tpl}/${src}` : src);

export function Photo({ label, value, onChange, invId, template, hint, fallback }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setBusy(true); setErr('');
    try { onChange(await uploadPhoto(invId, f)); } catch (ex) { setErr(ex.message); }
    setBusy(false);
  }
  const shown = value || fallback;
  return (
    <div className="fld photo-fld">
      <span className="lbl">{label}</span>
      <div className="photo-box">
        {shown ? <img src={srcFor(shown, template)} alt="" /> : <span className="photo-empty">No photo</span>}
        {!value && fallback && <span className="photo-tag">Design’s photo</span>}
      </div>
      <div className="row">
        <label htmlFor={id} className="btn btn-sm btn-dark">{busy ? 'Uploading…' : value ? 'Change' : 'Upload'}</label>
        <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr" onChange={pick} disabled={busy} />
        {value && <button type="button" className="btn btn-sm btn-text" onClick={() => onChange('')}>Use design’s photo</button>}
      </div>
      {hint && <p className="hint">{hint}</p>}
      {err && <p className="form-error" role="alert">{err}</p>}
    </div>
  );
}

// Repeatable list editor: add / remove / reorder rows.
export function Repeat({ items, onChange, max, addLabel, blank, render }) {
  const list = items || [];
  const set = (i, v) => onChange(list.map((x, k) => (k === i ? v : x)));
  const move = (i, d) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  return (
    <div className="repeat">
      {list.map((item, i) => (
        <div className="rep-item" key={item._k || i}>
          <div className="rep-tools">
            <span className="rep-n">{i + 1}</span>
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button type="button" className="danger" aria-label="Remove" onClick={() => onChange(list.filter((_, k) => k !== i))}>Remove</button>
          </div>
          {render(item, (v) => set(i, v), i)}
        </div>
      ))}
      {list.length < max && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange([...list, blank()])}>+ {addLabel}</button>}
    </div>
  );
}
