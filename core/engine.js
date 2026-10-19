/* Shared invitation engine. Each sample supplies:
   window.INVITE (content, config.js) and window.THEME (theme.js):
     THEME.gate(el, api)      – builds + animates the opening; call api.start() on the guest's tap, api.done() when finished
     THEME.hero(api)          – returns the hero background markup (video / photo / art layers)
     THEME.divider            – SVG string used under every section title
     THEME.seal               – SVG string for the RSVP-done badge
     THEME.scratch(g, W, txt) – paints the scratch-card cover; THEME.scratchShape = 'circle' | 'heart' | 'arch' | 'diamond' | 'leaf'
     THEME.fx                 – { kind: 'fireflies' | 'petals' | 'dust' | 'leaves' | 'jasmine', count }                     */
(function () {
  'use strict';
  var C = window.INVITE, T = window.THEME, I = window.I18N;
  var TZ = 'Asia/Kolkata', reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, qs = new URLSearchParams(location.search);
  var KEYP = 'inv' + (C.id || '') + ':';
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(KEYP + k); localStorage.setItem(KEYP + k, v); } catch (e) { return null; } }
  function sess(k, v) { try { if (v === undefined) return sessionStorage.getItem(KEYP + k); sessionStorage.setItem(KEYP + k, v); } catch (e) { return null; } }

  var langs = C.langs || ['en'];
  var lang = langs.indexOf(qs.get('lang')) > -1 ? qs.get('lang') : (langs.indexOf(store('lang')) > -1 ? store('lang') : langs[0]);
  function L() { return I[lang] || I.en; }
  function t(k) { return L()[k] != null ? L()[k] : I.en[k]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function raw(v) { return v == null ? '' : typeof v === 'string' ? v : (v[lang] || v.en || ''); }
  function tx(v) { return esc(raw(v)); }
  var LOCALE = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', ur: 'ur-IN', ta: 'ta-IN', gu: 'gu-IN' };
  // Chrome/Android ship no Punjabi month names (they print "M01"), so Punjabi dates are built from English parts + these names.
  var PA = { month: ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'],
    weekday: { Sun: 'ਐਤਵਾਰ', Mon: 'ਸੋਮਵਾਰ', Tue: 'ਮੰਗਲਵਾਰ', Wed: 'ਬੁੱਧਵਾਰ', Thu: 'ਵੀਰਵਾਰ', Fri: 'ਸ਼ੁੱਕਰਵਾਰ', Sat: 'ਸ਼ਨਿੱਚਰਵਾਰ' } };
  function fmt(iso, o) {
    var opts = Object.assign({ timeZone: TZ }, o);
    if (lang !== 'pa') return new Intl.DateTimeFormat(LOCALE[lang] || 'en-IN', opts).format(new Date(iso));
    var parts = new Intl.DateTimeFormat('en-IN', Object.assign({}, opts, o.month ? { month: 'numeric' } : {}, o.weekday ? { weekday: 'short' } : {})).formatToParts(new Date(iso));
    var get = function (k) { var p = parts.filter(function (x) { return x.type === k; })[0]; return p && p.value; };
    if (o.hour) return parts.map(function (p) { return p.value; }).join('');
    var out = [];
    if (o.weekday) out.push(PA.weekday[get('weekday')]);
    var d = [get('day'), o.month ? PA.month[+get('month') - 1] : null, get('year')].filter(Boolean).join(' ');
    if (d) out.push(d);
    return out.join(', ');
  }
  function time(iso) { var s = fmt(iso, { hour: 'numeric', minute: '2-digit' }); return lang === 'en' || lang === 'pa' ? s.toUpperCase() : s; }
  function names(sep) { return tx(C.groom.name) + (sep || ' <span class="amp-i">&amp;</span> ') + tx(C.bride.name); }
  function title(key) { var o = C.titles && C.titles[key], d = L().t[key] || I.en.t[key]; return [o && o[0] ? raw(o[0]) : d[0], o && o[1] ? raw(o[1]) : d[1]]; }
  var guest = C.guests && C.guests[qs.get('to')];
  var main = C.events.filter(function (e) { return e.main; })[0] || C.events[0];

  var ICON = {
    mehndi: '<path d="M24 44c-9-2-15-10-14-20 1-9 9-16 18-15 7 1 11 7 9 13-2 5-8 6-11 3-2-2-1-6 2-6"/><circle cx="31" cy="24" r="1.6" fill="currentColor"/><path d="M14 40c4 4 10 6 16 4"/>',
    haldi: '<circle cx="24" cy="24" r="6"/><path d="M24 8c3 4 3 8 0 10-3-2-3-6 0-10Zm0 32c3-4 3-8 0-10-3 2-3 6 0 10ZM8 24c4-3 8-3 10 0-2 3-6 3-10 0Zm32 0c-4-3-8-3-10 0 2 3 6 3 10 0Z"/>',
    sangeet: '<ellipse cx="24" cy="15" rx="13" ry="5"/><path d="M11 15v16c0 3 6 6 13 6s13-3 13-6V15M16 19l3 16m5-15v17m8-18-3 16"/>',
    wedding: '<path d="M8 40h32M12 40V20m24 20V20M8 20h32M10 20c0-8 6-12 14-14 8 2 14 6 14 14"/><path d="M24 36c-5-2-5-7-2-11 0 3 2 4 3 2 2 3 4 7-1 9Z"/>',
    reception: '<path d="M16 6h16l-2 14a6 6 0 0 1-12 0L16 6Zm8 20v12m-6 0h12"/><path d="M34 10l4-4m-2 10h5M14 10l-4-4m2 10H7"/>',
    rings: '<circle cx="18" cy="28" r="10"/><circle cx="30" cy="28" r="10"/><path d="M14 12l4-5 4 5-4 4Z"/>',
    gurdwara: '<path d="M8 40h32M12 40V24h24v16M10 24h28M16 24c0-6 4-10 8-12 4 2 8 6 8 12M24 8v4M20 40v-8h8v8"/>',
    moon: '<path d="M30 8a16 16 0 1 0 10 26A14 14 0 0 1 30 8Z"/><path d="M14 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
    lamp: '<path d="M8 30q16 14 32 0-8-4-12-2h-8q-4-2-12 2Z"/><path d="M24 26c-5-5-2-12 0-16 2 4 5 11 0 16Z"/>',
    plane: '<path d="M6 28l14-4 8-14 4 1-4 12 12-2 3-5 3 1-2 8-26 7-6 2-3-3Z"/><path d="M6 40h36"/>',
    stay: '<path d="M6 36V14m0 12h36v10M6 22h12a5 5 0 0 1 5 5M42 26a6 6 0 0 0-6-6H24v6"/><circle cx="13" cy="18" r="3"/>',
    boat: '<path d="M4 30h40l-6 9H10Z"/><path d="M24 30V6l12 18H24"/>',
    car: '<path d="M6 30l4-10h28l4 10v8H6Z"/><circle cx="14" cy="38" r="3"/><circle cx="34" cy="38" r="3"/><path d="M12 20l3-6h18l3 6"/>',
    pin: '<path d="M24 44s14-15 14-26a14 14 0 0 0-28 0c0 11 14 26 14 26Z"/><circle cx="24" cy="18" r="5"/>',
    cal: '<rect x="6" y="10" width="36" height="32" rx="4"/><path d="M6 20h36M16 6v8m16-8v8"/>',
    mute: '<path d="M8 18h8l10-8v28l-10-8H8Z"/><path d="M34 18l8 12m0-12-8 12"/>'
  };
  function icon(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICON[n] || ICON.wedding) + '</svg>'; }
  function divider() { return '<div class="divider" aria-hidden="true"><i></i>' + T.divider + '<i></i></div>'; }
  function head(key) { var h = title(key); return '<header class="sec-head">' + (h[0] ? '<p class="kicker rv">' + esc(h[0]) + '</p>' : '') + '<h2 class="title" data-words>' + esc(h[1]) + '</h2>' + divider() + '</header>'; }
  function img(src, alt, cls) { return '<img class="' + (cls || '') + '" src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">'; }

  /* calendar + links */
  function stamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function range(ev) { var s = new Date(ev.start); return [s, new Date(s.getTime() + (ev.hours || 3) * 36e5)]; }
  function evTitle(ev) { return raw(ev.name) + ' · ' + raw(C.groom.name) + ' & ' + raw(C.bride.name); }
  function gcal(ev) { var r = range(ev); return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(evTitle(ev)) + '&dates=' + stamp(r[0]) + '/' + stamp(r[1]) + '&location=' + encodeURIComponent(raw(ev.venue) + ', ' + ev.address) + '&details=' + encodeURIComponent(shareUrl()); }
  function ics(ev) { var r = range(ev); function c(s) { return String(s).replace(/([,;\\])/g, '\\$1'); } return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//invite//EN', 'BEGIN:VEVENT', 'UID:' + ev.id + stamp(r[0]) + '@invite', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(r[0]), 'DTEND:' + stamp(r[1]), 'SUMMARY:' + c(evTitle(ev)), 'LOCATION:' + c(raw(ev.venue) + ', ' + ev.address), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'); }
  function calMenu(ev, label) { return '<details class="cal"><summary class="btn ghost small">' + icon('cal') + esc(label || t('calendar')) + '</summary><div class="cal-menu"><a href="' + esc(gcal(ev)) + '" target="_blank" rel="noopener">' + t('google') + '</a><button type="button" data-ics="' + esc(ev.id) + '">' + t('apple') + '</button></div></details>'; }
  function dirUrl(a) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(a); }
  function shareUrl() { return /^https?:/.test(location.protocol) ? location.origin + location.pathname : C.siteUrl; }

  /* ================= SECTIONS ================= */
  var api = { t: t, tx: tx, raw: raw, esc: esc, fmt: fmt, time: time, names: names, C: C, img: img, icon: icon, reduce: reduce };

  function hero() {
    return '<section id="home" class="hero">' + T.hero(api) + '<div class="hero-copy">' +
      (C.invocation ? '<p class="invocation hs hs1">' + tx(C.invocation) + '</p>' : '') +
      '<p class="kicker hs hs2">' + tx(C.heroLine) + '</p>' +
      '<h1 class="names"><span class="nm hs hs3">' + tx(C.groom.name) + '</span><span class="amp hs hs4">&amp;</span><span class="nm hs hs5">' + tx(C.bride.name) + '</span></h1>' +
      '<p class="hero-date hs hs6">' + esc(fmt(C.date, { day: 'numeric', month: 'long', year: 'numeric' })) + ' · ' + tx(C.city) + '</p></div>' +
      '<a class="scroll-cue" href="#invite"><span>' + t('scroll') + '</span><i></i></a></section>';
  }
  function invite() {
    return '<section id="invite" class="sec">' + head('invite') + '<div class="invite-card rv">' + (C.photos.invite ? '<div class="invite-photo">' + img(C.photos.invite, raw(C.groom.name) + ' & ' + raw(C.bride.name)) + '</div>' : '') +
      '<p class="msg" data-words>' + tx(C.message) + '</p><div class="couple">' +
      '<div><p class="pn">' + tx(C.groom.name) + '</p><p class="parents">' + tx(C.groom.parents) + '</p></div><span class="amp">&amp;</span>' +
      '<div><p class="pn">' + tx(C.bride.name) + '</p><p class="parents">' + tx(C.bride.parents) + '</p></div></div></div></section>';
  }
  function scratch() {
    var d = C.date;
    return '<section id="date" class="sec">' + head('date') + '<div class="scratch shape-' + (T.scratchShape || 'circle') + ' rv"><div class="scratch-reveal" aria-live="polite">' +
      '<p class="sr-day">' + esc(fmt(d, { weekday: 'long' })) + '</p><p class="sr-date">' + esc(fmt(d, { day: 'numeric' })) + '</p><p class="sr-month">' + esc(fmt(d, { month: 'long', year: 'numeric' })) + '</p><p class="sr-time">' + esc(time(d)) + '</p></div>' +
      '<canvas class="scratch-canvas" width="560" height="560" aria-label="' + esc(t('scratchHint')) + '"></canvas><div class="burst" aria-hidden="true"></div></div>' +
      '<p class="hint rv">' + esc(t('scratchHint')) + ' · <button type="button" class="linkish" data-reveal>' + esc(t('revealBtn')) + '</button></p><div class="center rv">' + calMenu(main, t('saveDate')) + '</div></section>';
  }
  function countdown() {
    function u(k) { return '<div class="cd"><span class="cd-n" data-cd="' + k + '">00</span><span class="cd-l">' + esc(t(k)) + '</span></div>'; }
    return '<section id="count" class="sec">' + head('count') + '<div class="cd-row rv">' + u('days') + u('hours') + u('mins') + u('secs') + '</div><p class="cd-done" hidden></p>' + (T.countDeco || '') + '</section>';
  }
  function story() {
    return '<section id="story" class="sec">' + head('story') + '<div class="story-track" tabindex="0">' + C.story.map(function (s, i) {
      return '<article class="story-card rv" style="--d:' + i * .08 + 's"><div class="story-photo">' + img(s.photo, raw(s.title)) + '</div><p class="when">' + tx(s.when) + '</p><h3>' + tx(s.title) + '</h3><p class="st">' + tx(s.text) + '</p></article>';
    }).join('') + '</div><div class="swipe-hint" aria-hidden="true">⟵ ⟶</div></section>';
  }
  function gallery() {
    var g = C.photos.gallery;
    return '<section id="gallery" class="sec">' + head('gallery') + '<div class="slides rv"><div class="slide-track">' + g.map(function (p, i) {
      return '<figure class="slide' + (i ? '' : ' on') + '">' + img(p.src, raw(p.alt)) + (p.caption ? '<figcaption>' + tx(p.caption) + '</figcaption>' : '') + '</figure>';
    }).join('') + '</div><div class="dots">' + g.map(function (_, i) { return '<button type="button" aria-label="' + (i + 1) + '"' + (i ? '' : ' class="on"') + ' data-dot="' + i + '"></button>'; }).join('') + '</div></div></section>';
  }
  function events() {
    return '<section id="events" class="sec">' + head('events') + '<ol class="tl"><span class="tl-line" aria-hidden="true"><i></i></span>' + C.events.map(function (e, i) {
      return '<li class="ev' + (e.main ? ' main' : '') + '" style="--d:' + (i % 2) * .08 + 's;--c:' + (e.color || 'currentColor') + '"><span class="ev-dot">' + icon(e.icon) + '</span><div class="ev-card">' +
        '<p class="ev-when">' + esc(fmt(e.start, { weekday: 'short', day: 'numeric', month: 'short' })) + ' · ' + esc(time(e.start)) + '</p><h3>' + tx(e.name) + '</h3><p class="ev-venue">' + tx(e.venue) + '</p><p class="ev-note">' + tx(e.note) + '</p>' +
        '<div class="row"><a class="btn ghost small" href="' + esc(dirUrl(raw(e.venue) + ', ' + e.address)) + '" target="_blank" rel="noopener">' + icon('pin') + esc(t('directions')) + '</a>' + calMenu(e) + '</div></div></li>';
    }).join('') + '</ol></section>';
  }
  function venue() {
    var v = C.venue;
    return '<section id="venue" class="sec">' + head('venue') + '<div class="venue-card rv"><div class="map" data-map="' + esc(v.map) + '">' + img(C.photos.venue, raw(v.name)) +
      '<span class="map-pin">' + icon('pin') + '</span><button type="button" class="btn small" data-load-map>' + esc(t('showMap')) + '</button></div><h3>' + tx(v.name) + '</h3><p class="addr">' + esc(v.address) + '</p>' +
      '<div class="row center"><a class="btn" href="' + esc(dirUrl(v.address)) + '" target="_blank" rel="noopener">' + icon('pin') + esc(t('directions')) + '</a><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.map) + '" target="_blank" rel="noopener">' + esc(t('openMaps')) + '</a></div></div></section>';
  }
  function dress() {
    return '<section id="dress" class="sec">' + head('dress') + '<div class="dress-grid">' + C.dress.map(function (d, i) {
      var ev = C.events.filter(function (e) { return e.id === d.event; })[0];
      return '<div class="dress rv" style="--d:' + (i % 2) * .08 + 's"><div class="swatches">' + d.colors.map(function (c, k) { return '<span style="background:' + esc(c) + ';--k:' + k + '"></span>'; }).join('') + '</div><h3>' + (ev ? tx(ev.name) : '') + '</h3><p>' + tx(d.text) + '</p></div>';
    }).join('') + '</div></section>';
  }
  function travel() {
    return '<section id="travel" class="sec">' + head('travel') + '<div class="tiles">' + C.travel.map(function (x, i) {
      return '<div class="tile rv" style="--d:' + i * .08 + 's">' + icon(x.icon) + '<h3>' + tx(x.title) + '</h3><p>' + tx(x.text) + '</p></div>';
    }).join('') + '</div><p class="help rv">' + esc(t('help')) + ' ' + tx(C.contact.name) + ' · <a href="tel:' + esc(C.contact.phone) + '" dir="ltr">' + esc(C.contact.phone.replace(/^\+91/, '+91 ')) + '</a></p></section>';
  }
  function families() {
    function f(x) { return '<div class="fam rv"><h3>' + tx(x.title) + '</h3>' + raw(x.names).split('\n').map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>'; }
    return '<section id="family" class="sec">' + head('family') + '<div class="fams">' + f(C.families.bride) + '<span class="knot" aria-hidden="true">' + T.divider + '</span>' + f(C.families.groom) + '</div></section>';
  }
  function rsvp() {
    var h = title('rsvp');
    return '<section id="rsvp" class="sec">' + head('rsvp') + (C.rsvp.deadline ? '<p class="lead rv">' + esc(t('by')) + ' <strong>' + esc(fmt(C.rsvp.deadline, { day: 'numeric', month: 'long', year: 'numeric' })) + '</strong></p>' : '') +
      '<form class="rsvp-card rv" novalidate><input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label class="f" data-f="name"><span>' + esc(t('name')) + '</span><input name="name" autocomplete="name" maxlength="80" required><em class="err"></em></label>' +
      '<fieldset class="f" data-f="attending"><legend class="sr">' + esc(h[1]) + '</legend><div class="toggle"><label><input type="radio" name="attending" value="yes"><span>' + esc(t('yes')) + '</span></label><label><input type="radio" name="attending" value="no"><span>' + esc(t('no')) + '</span></label></div><em class="err"></em></fieldset>' +
      '<div class="more" hidden><div class="f"><span>' + esc(t('guests')) + '</span><div class="stepper"><button type="button" data-step="-1" aria-label="−">−</button><output name="guests">1</output><button type="button" data-step="1" aria-label="+">+</button></div></div>' +
      '<fieldset class="f" data-f="events"><legend>' + esc(t('which')) + '</legend><div class="chips">' + C.events.map(function (e) { return '<label class="chip"><input type="checkbox" name="events" value="' + esc(e.id) + '" checked><span>' + tx(e.name) + '</span></label>'; }).join('') + '</div><em class="err"></em></fieldset></div>' +
      '<label class="f"><span>' + esc(t('msg')) + ' <small>(' + esc(t('optional')) + ')</small></span><textarea name="message" rows="3" maxlength="400"></textarea></label>' +
      '<p class="form-msg" role="status" aria-live="polite"></p><button class="btn wide" type="submit">' + esc(t('send')) + '</button></form>' +
      '<div class="rsvp-done" hidden><span class="done-seal">' + T.seal + '</span><p class="done-text"></p><button type="button" class="btn ghost small" data-again>' + esc(t('again')) + '</button></div></section>';
  }
  function wishes() {
    var cards = C.wishes.map(function (w) { return '<figure class="wish"><blockquote>' + tx(w.text) + '</blockquote><figcaption>— ' + esc(w.name) + '</figcaption></figure>'; }).join('');
    return '<section id="wishes" class="sec">' + head('wishes') + '<div class="marquee rv"><div class="marquee-track">' + cards + cards + '</div></div><p class="tag rv">' + esc(C.hashtag) + '</p></section>';
  }
  function end() {
    var h = title('end');
    return '<section id="end" class="sec end">' + (C.photos.end ? '<div class="end-photo rv">' + img(C.photos.end, raw(C.groom.name) + ' & ' + raw(C.bride.name)) + '</div>' : '') +
      '<h2 class="title big" data-words>' + esc(h[1]) + '</h2>' + divider() + '<p class="end-names rv">' + names() + '</p><p class="end-date rv">' + esc(fmt(C.date, { day: 'numeric', month: 'long', year: 'numeric' })) + ' · ' + tx(C.city) + '</p>' +
      '<div class="row center rv"><a class="btn" data-wa href="#">' + esc(t('whatsapp')) + '</a><button class="btn ghost" type="button" data-share>' + esc(t('share')) + '</button><button class="btn ghost" type="button" data-copy>' + esc(t('copy')) + '</button></div>' +
      '<footer class="foot">' + esc(C.hashtag) + (C.credits ? '<br><small>' + C.credits + '</small>' : '') + '</footer></section>';
  }
  function chrome() {
    var next = langs[(langs.indexOf(lang) + 1) % langs.length];
    return (C.media.music ? '<button class="fab-music" type="button" data-music aria-pressed="false" aria-label="' + esc(t('musicOn')) + '"><span class="eq"><i></i><i></i><i></i></span>' + icon('mute', 'muted-ic') + '</button>' : '') +
      (langs.length > 1 ? '<button class="fab-lang" type="button" data-lang aria-label="Language">' + esc((I[next] || I.en).short) + '</button>' : '') +
      '<a class="fab-rsvp" href="#rsvp">' + esc(t('rsvpPill')) + '</a>';
  }

  function render() {
    var root = document.documentElement;
    root.lang = lang; root.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.body.className = document.body.className.replace(/\blang-\w+/g, '').trim() + ' lang-' + lang;
    document.title = raw(C.groom.name) + ' & ' + raw(C.bride.name) + ' · ' + fmt(C.date, { day: 'numeric', month: 'short', year: 'numeric' });
    document.getElementById('page').innerHTML = hero() + invite() + scratch() + countdown() + story() + gallery() + events() + venue() + dress() + travel() + families() + rsvp() + wishes() + end();
    document.getElementById('chrome').innerHTML = chrome();
    bind();
  }

  /* ================= BEHAVIOUR ================= */
  var audio = {}, musicOn = false, io, timers = [];
  function sfx(name, vol) {
    var src = C.media.sfx && C.media.sfx[name]; if (!src) return null;
    if (!audio[name]) { audio[name] = new Audio(src); audio[name].preload = 'auto'; }
    var a = audio[name]; a.volume = vol || .6; try { a.currentTime = 0; } catch (e) {} a.play().catch(function () {}); return a;
  }
  function fade(a, to, ms, done) { clearInterval(a._f); var from = a.volume, t0 = performance.now(); a._f = setInterval(function () { var k = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (to - from) * k; if (k === 1) { clearInterval(a._f); if (done) done(); } }, 40); }
  function music(on) {
    if (!C.media.music) return;
    if (!audio.music) { audio.music = new Audio(C.media.music); audio.music.loop = true; audio.music.volume = 0; }
    var a = audio.music; musicOn = on;
    if (on) { a.play().catch(function () {}); fade(a, C.media.musicVolume || .5, 1600); } else fade(a, 0, 500, function () { a.pause(); });
    var b = document.querySelector('[data-music]'); if (b) { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('on', on); b.setAttribute('aria-label', on ? t('musicOff') : t('musicOn')); }
  }
  document.addEventListener('visibilitychange', function () { if (audio.music && musicOn) { if (document.hidden) audio.music.pause(); else audio.music.play().catch(function () {}); } });

  function setupGate() {
    var g = document.getElementById('gate');
    if (sess('opened') || qs.has('nointro')) { g.remove(); document.body.classList.add('open'); return; }
    document.body.classList.add('locked');
    var finished = false, started = false;
    var gapi = Object.assign({}, api, {
      guestLine: guest ? tx(guest) : esc(t('dear')),
      start: function () { if (started) return; started = true; sfx('open', .75); music(true); if (navigator.vibrate) navigator.vibrate(20); g.classList.add('playing'); skip.hidden = false; },
      done: finish
    });
    function finish() {
      if (finished) return; finished = true; sess('opened', '1');
      g.classList.add('out'); document.body.classList.remove('locked'); document.body.classList.add('open');
      var hv = document.querySelector('.hero video'); if (hv) { hv.currentTime = 0; hv.play().catch(function () {}); }
      setTimeout(function () { g.remove(); }, 1300);
    }
    T.gate(g, gapi);
    var skip = document.createElement('button'); skip.type = 'button'; skip.className = 'skip'; skip.hidden = true; skip.textContent = t('skip') + ' ›';
    skip.addEventListener('click', finish); g.appendChild(skip);
    if (reduce) g.addEventListener('click', function () { setTimeout(finish, 300); });
    setTimeout(function () { if (started) finish(); }, 14000); // never trap a guest
  }

  function bind() { timers.forEach(clearInterval); timers = []; words(); reveal(); setupScratch(); setupCountdown(); setupGallery(); setupTimeline(); setupMap(); setupRsvp(); setupShare(); setupChrome(); if (T.afterRender) T.afterRender(api); }
  function words() { document.querySelectorAll('[data-words]').forEach(function (el) { var s = el.textContent.trim(); el.setAttribute('aria-label', s); el.innerHTML = s.split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + esc(w) + '</span>'; }).join(' '); }); }
  function reveal() {
    if (io) io.disconnect();
    var els = document.querySelectorAll('.rv, [data-words], .divider, .ev, .sec');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function setupScratch() {
    var cv = document.querySelector('.scratch-canvas'); if (!cv) return;
    var wrap = cv.parentNode, g = cv.getContext('2d'), W = cv.width, done = false, down, last, moves = 0, snd, mask = [];
    T.scratch(g, W, t('scratchHint'));
    var d0 = g.getImageData(0, 0, W, W).data;
    for (var y = 14; y < W; y += 20) for (var x = 14; x < W; x += 20) if (d0[(y * W + x) * 4 + 3] > 200) mask.push(y * W + x);
    g.globalCompositeOperation = 'destination-out';
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * W / r.height }; }
    function draw(p) { g.lineCap = 'round'; g.lineWidth = 66; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); g.beginPath(); g.arc(p.x, p.y, 33, 0, 7); g.fill(); last = p; if (++moves % 8 === 0 && cleared() > .5) win(); }
    function cleared() { var d = g.getImageData(0, 0, W, W).data, c = 0; mask.forEach(function (i) { if (d[i * 4 + 3] < 40) c++; }); return c / mask.length; }
    function win() { if (done) return; done = true; wrap.classList.add('won'); sfx('reveal', .8); if (snd) snd.pause(); if (navigator.vibrate) navigator.vibrate([30, 40, 30]); burst(wrap.querySelector('.burst')); }
    cv.addEventListener('pointerdown', function (e) { if (done) return; down = true; last = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} snd = sfx('scratch', .22); if (snd) snd.loop = true; draw(last); });
    cv.addEventListener('pointermove', function (e) { if (down && !done) draw(pos(e)); });
    ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { down = false; if (snd) snd.pause(); }); });
    document.querySelector('[data-reveal]').addEventListener('click', win);
  }
  function burst(box) {
    if (reduce || !box) return; var cols = T.burstColors || ['#f3dfa2', '#f2a7b8', '#ffd27a', '#fff'], s = '';
    for (var i = 0; i < 28; i++) s += '<i style="--a:' + (i * 360 / 28).toFixed(0) + 'deg;--r:' + (110 + Math.random() * 100).toFixed(0) + 'px;--c:' + cols[i % cols.length] + '"></i>';
    box.innerHTML = s; box.classList.remove('go'); void box.offsetWidth; box.classList.add('go');
  }
  function setupCountdown() {
    var target = new Date(C.date).getTime(), n = {}, row = document.querySelector('.cd-row'), doneEl = document.querySelector('.cd-done');
    document.querySelectorAll('[data-cd]').forEach(function (e) { n[e.dataset.cd] = e; });
    function set(el, v) { if (el.textContent !== v) { el.textContent = v; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } }
    function p(x) { return (x < 10 ? '0' : '') + x; }
    function tick() { var d = target - Date.now(); if (d <= 0) { row.hidden = true; doneEl.hidden = false; doneEl.textContent = d > -864e5 ? t('today') : t('after'); return false; }
      set(n.days, String(Math.floor(d / 864e5))); set(n.hours, p(Math.floor(d % 864e5 / 36e5))); set(n.mins, p(Math.floor(d % 36e5 / 6e4))); set(n.secs, p(Math.floor(d % 6e4 / 1e3))); return true; }
    if (tick()) timers.push(setInterval(function () { if (!tick()) timers.forEach(clearInterval); }, 1000));
  }
  function setupGallery() {
    var box = document.querySelector('.slides'); if (!box) return;
    var slides = box.querySelectorAll('.slide'), dots = box.querySelectorAll('[data-dot]'), i = 0, x0 = null, timer;
    function go(k) { i = (k + slides.length) % slides.length; slides.forEach(function (s, j) { s.classList.toggle('on', j === i); }); dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); }
    function restart() { clearInterval(timer); if (!reduce) { timer = setInterval(function () { go(i + 1); }, 4200); timers.push(timer); } }
    dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.dataset.dot); restart(); }); });
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { go(i + ((dx < 0) !== (lang === 'ur') ? 1 : -1)); restart(); } });
    restart();
  }
  function setupTimeline() {
    var tl = document.querySelector('.tl'), bar = tl && tl.querySelector('.tl-line i'); if (!bar) return;
    function upd() { var r = tl.getBoundingClientRect(), k = (innerHeight * .7 - r.top) / r.height; bar.style.transform = 'scaleY(' + Math.max(0, Math.min(1, k)).toFixed(3) + ')'; }
    addEventListener('scroll', upd, { passive: true }); upd();
  }
  function setupMap() {
    var b = document.querySelector('[data-load-map]'); if (!b) return;
    b.addEventListener('click', function () { var box = b.closest('[data-map]'), f = document.createElement('iframe'); f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(box.dataset.map) + '&output=embed'; f.title = box.dataset.map; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; box.innerHTML = ''; box.appendChild(f); box.classList.add('live'); });
  }
  function setupRsvp() {
    var f = document.querySelector('.rsvp-card'); if (!f) return;
    var more = f.querySelector('.more'), msg = f.querySelector('.form-msg'), out = f.querySelector('output'), done = document.querySelector('.rsvp-done');
    var prev = JSON.parse(store('rsvp') || 'null');
    if (prev) { f.hidden = true; done.hidden = false; done.querySelector('.done-text').textContent = prev.attending === 'yes' ? t('thanksYes') : t('thanksNo'); }
    done.querySelector('[data-again]').addEventListener('click', function () { done.hidden = true; f.hidden = false; f.name.focus(); });
    f.addEventListener('change', function (e) { if (e.target.name === 'attending') more.hidden = e.target.value !== 'yes'; clear(e.target); });
    f.addEventListener('input', function (e) { clear(e.target); });
    f.querySelectorAll('[data-step]').forEach(function (b) { b.addEventListener('click', function () { out.value = Math.max(1, Math.min(C.rsvp.maxGuests, +out.value + +b.dataset.step)); }); });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); msg.textContent = ''; msg.className = 'form-msg'; if (f.company.value) return;
      var data = { name: f.name.value.trim(), attending: (f.querySelector('[name=attending]:checked') || {}).value || '', guests: +out.value, events: [].map.call(f.querySelectorAll('[name=events]:checked'), function (c) { return c.value; }), message: f.message.value.trim(), invite: qs.get('to') || '', lang: lang, sentAt: new Date().toISOString() };
      var ok = true;
      if (!data.name) ok = err('name', t('req'));
      if (!data.attending) ok = err('attending', t('pickOne'));
      if (data.attending === 'yes' && !data.events.length) ok = err('events', t('pickOne'));
      if (!ok) return;
      if (data.attending === 'no') { data.guests = 0; data.events = []; }
      if (!C.rsvp.endpoint) { msg.textContent = t('notConnected'); msg.classList.add('warn'); return; }
      var btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = t('sending');
      fetch(C.rsvp.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; store('rsvp', JSON.stringify(data)); f.hidden = true; done.hidden = false; done.classList.add('in'); done.querySelector('.done-text').textContent = data.attending === 'yes' ? t('thanksYes') : t('thanksNo'); sfx('reveal', .6); })
        .catch(function () { msg.textContent = t('failed'); msg.classList.add('warn'); })
        .then(function () { btn.disabled = false; btn.textContent = t('send'); });
    });
    function err(k, m) { var el = f.querySelector('[data-f="' + k + '"]'); el.classList.add('bad'); el.querySelector('.err').textContent = m; return false; }
    function clear(input) { var el = input.closest && input.closest('[data-f]'); if (el) { el.classList.remove('bad'); el.querySelector('.err').textContent = ''; } }
  }
  function setupShare() {
    var url = shareUrl(), text = raw(C.groom.name) + ' & ' + raw(C.bride.name) + ' — ' + fmt(C.date, { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + raw(C.city);
    var wa = document.querySelector('[data-wa]'); if (wa) { wa.href = 'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url); wa.target = '_blank'; wa.rel = 'noopener'; }
    var sh = document.querySelector('[data-share]'); if (sh) { if (!navigator.share) sh.remove(); else sh.addEventListener('click', function () { navigator.share({ title: document.title, text: text, url: url }).catch(function () {}); }); }
    var cp = document.querySelector('[data-copy]'); if (cp) cp.addEventListener('click', function () {
      (navigator.clipboard && isSecureContext ? navigator.clipboard.writeText(url) : Promise.reject()).catch(function () { var ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }).then(function () { toast(t('copied')); });
    });
  }
  function toast(m) { var el = document.getElementById('toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2000); }
  var chromeBound = false;
  function setupChrome() {
    var mb = document.querySelector('[data-music]'); if (mb) mb.addEventListener('click', function () { music(!musicOn); });
    if (musicOn) music(true);
    var lb = document.querySelector('[data-lang]');
    if (lb) lb.addEventListener('click', function () { lang = langs[(langs.indexOf(lang) + 1) % langs.length]; store('lang', lang); var y = scrollY; render(); scrollTo(0, y); });
    if (chromeBound) return; chromeBound = true;
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ics]');
      if (b) { var ev = C.events.filter(function (x) { return x.id === b.dataset.ics; })[0], u = URL.createObjectURL(new Blob([ics(ev)], { type: 'text/calendar' })); var a = document.createElement('a'); a.href = u; a.download = ev.id + '.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000); }
      document.querySelectorAll('details.cal[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
    });
    addEventListener('scroll', function () { document.body.classList.toggle('past-hero', scrollY > innerHeight * .8); }, { passive: true });
  }

  /* page-wide ambient particles (theme picks the kind) */
  function fx() {
    var cv = document.getElementById('fx'), cfg = T.fx; if (reduce || !cv || !cfg) return;
    var g = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), P = [], w, h, kind = cfg.kind;
    function size() { w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr; }
    size(); addEventListener('resize', size);
    var cols = cfg.colors || ['#f6e6a0'];
    for (var i = 0; i < (cfg.count || 22); i++) P.push({ x: Math.random(), y: Math.random(), s: .6 + Math.random(), ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .02, c: cols[i % cols.length], v: .3 + Math.random() * .7 });
    function shape(p, x, y, now) {
      var s = p.s * dpr;
      if (kind === 'fireflies' || kind === 'dust') {
        var a = kind === 'dust' ? .35 + .65 * Math.abs(Math.sin(now / 900 + p.ph)) : .2 + .8 * Math.pow(.5 + .5 * Math.sin(now / 700 + p.ph), 3), r = (kind === 'dust' ? 2.2 : 4.2) * s;
        var gr = g.createRadialGradient(x, y, 0, x, y, r * 2); gr.addColorStop(0, p.c); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2, 0, 7); g.fill();
        if (kind === 'dust' && a > .85) { g.strokeStyle = p.c; g.lineWidth = .8 * dpr; g.beginPath(); g.moveTo(x - r * 3, y); g.lineTo(x + r * 3, y); g.moveTo(x, y - r * 3); g.lineTo(x, y + r * 3); g.stroke(); }
        return;
      }
      g.save(); g.translate(x, y); g.rotate(p.rot); g.globalAlpha = .85; g.fillStyle = p.c;
      if (kind === 'petals') { g.beginPath(); g.ellipse(0, 0, 7 * s, 4.5 * s, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-2 * s, -1 * s, 3 * s, 1.5 * s, 0, 0, 7); g.fill(); }
      else if (kind === 'leaves') { g.beginPath(); g.moveTo(-9 * s, 0); g.quadraticCurveTo(0, -7 * s, 9 * s, 0); g.quadraticCurveTo(0, 7 * s, -9 * s, 0); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .8 * dpr; g.beginPath(); g.moveTo(-8 * s, 0); g.lineTo(8 * s, 0); g.stroke(); }
      else if (kind === 'confetti') { g.fillRect(-4 * s, -2.5 * s, 8 * s, 5 * s); }
      else if (kind === 'kites') { g.globalAlpha = .9; g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(8 * s, 0); g.lineTo(0, 13 * s); g.lineTo(-8 * s, 0); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = dpr; g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(0, 13 * s); g.moveTo(-8 * s, 0); g.lineTo(8 * s, 0); g.stroke(); g.strokeStyle = p.c; g.beginPath(); g.moveTo(0, 13 * s); g.quadraticCurveTo(6 * s, 22 * s, 0, 32 * s); g.stroke(); }
      else if (kind === 'bandhani') { g.globalAlpha = .75; g.beginPath(); g.arc(0, 0, 3.2 * s, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(0, 0, 1.2 * s, 0, 7); g.fill(); }
      else if (kind === 'jasmine') { for (var k = 0; k < 5; k++) { g.rotate(1.2566); g.beginPath(); g.ellipse(0, -4 * s, 2.2 * s, 4 * s, 0, 0, 7); g.fill(); } g.fillStyle = '#f5d76e'; g.beginPath(); g.arc(0, 0, 1.4 * s, 0, 7); g.fill(); }
      g.restore();
    }
    (function loop(now) {
      if (!document.hidden) {
        g.clearRect(0, 0, w, h); g.globalAlpha = 1;
        P.forEach(function (p) {
          if (kind === 'fireflies' || kind === 'dust') { p.y -= .00012 * p.v * 16; p.x += Math.sin(now / 1800 + p.ph) * .00018; }
          else if (kind === 'kites') { p.y -= .0004 * p.v; p.x += Math.sin(now / 2200 + p.ph) * .0012; p.rot = Math.sin(now / 900 + p.ph) * .35; }
          else { p.y += .0007 * p.v; p.x += Math.sin(now / 1400 + p.ph) * .0009; p.rot += p.vr; }
          if (p.y < -.03) { p.y = 1.03; p.x = Math.random(); } if (p.y > 1.03) { p.y = -.03; p.x = Math.random(); }
          shape(p, p.x * w, p.y * h, now);
        });
      }
      requestAnimationFrame(loop);
    })(0);
  }

  render(); setupGate(); fx();
  window.INVITE_API = api;
})();
