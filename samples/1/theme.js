/* Sample 1 — Chandni Mahal: moonlit palace on a lake. Gate: lotus seal → generated door-opening video. */
(function () {
  var lotus = '<svg viewBox="0 0 120 70" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M60 62C46 46 46 22 60 6c14 16 14 40 0 56Z"/><path d="M60 62C40 56 28 40 30 20c16 6 26 22 30 42Zm0 0c20-6 32-22 30-42-16 6-26 22-30 42Z"/><path d="M60 62C36 64 16 54 8 38c20-2 38 8 52 24Zm0 0c24 2 44-8 52-24-20-2-38 8-52 24Z"/><path d="M28 66h64"/></g></svg>';
  function seal(mono) {
    return '<svg class="seal" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="sg1" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#e3bd6c"/><stop offset="1" stop-color="#9a6a24"/></radialGradient>' +
      '<linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9e2"/><stop offset="1" stop-color="#d9708c"/></linearGradient></defs>' +
      '<circle cx="100" cy="100" r="96" fill="url(#sg1)"/><circle cx="100" cy="100" r="86" fill="none" stroke="#7a5216" stroke-width="1.5" stroke-dasharray="2 4"/><circle cx="100" cy="100" r="78" fill="#0e1738"/>' +
      '<g transform="translate(100 104)">' + [-62, -32, 0, 32, 62].map(function (a) { return '<path transform="rotate(' + a + ')" d="M0 0C-12-14-12-34 0-48 12-34 12-14 0 0Z" fill="url(#pg1)"/>'; }).join('') + '<path d="M-40 6h80" stroke="#e3bd6c" stroke-width="1.5"/></g>' +
      '<text x="100" y="146" text-anchor="middle" font-family="Marcellus, serif" font-size="17" letter-spacing="4" fill="#f3dfa2">' + mono + '</text></svg>';
  }
  var C = window.INVITE;
  window.THEME = {
    divider: lotus,
    seal: seal(C.monogram),
    scratchShape: 'circle',
    burstColors: ['#f3dfa2', '#f2a7b8', '#ffd27a', '#ffffff'],
    fx: { kind: 'fireflies', count: 24, colors: ['rgba(246,230,160,1)'] },
    countDeco: '<div class="lamps" aria-hidden="true">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<span class="lamp" style="--i:' + i + '"></span>'; }).join('') + '</div>',
    gate: function (el, api) {
      var stars = ''; for (var i = 0; i < 70; i++) stars += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (Math.random() * 4).toFixed(1) + 's;--s:' + (1 + Math.random() * 2).toFixed(1) + 'px"></i>';
      el.innerHTML = '<div class="g-stars" aria-hidden="true">' + stars + '</div><div class="g-inner">' +
        (C.invocation ? '<p class="invocation">' + api.tx(C.invocation) + '</p>' : '') +
        '<p class="g-greet">' + api.guestLine + ',</p><p class="g-sub">' + api.esc(api.t('invited')) + '</p>' +
        '<button class="g-seal" type="button" aria-label="' + api.esc(api.t('tap')) + '">' + seal(C.monogram) + '<span class="ring"></span><span class="ring r2"></span></button>' +
        '<p class="g-tap">' + api.esc(api.t('tap')) + '</p></div>' +
        '<video class="g-video" muted playsinline preload="auto" poster="' + C.media.introPoster + '" src="' + C.media.intro + '"></video>' +
        '<p class="g-names" aria-hidden="true">' + api.names() + '</p>';
      var v = el.querySelector('.g-video');
      el.querySelector('.g-seal').addEventListener('click', function () {
        api.start();
        if (api.reduce) return api.done();
        var p = v.play(); if (p && p.catch) p.catch(api.done);
        v.addEventListener('timeupdate', function () { if (v.duration && v.currentTime > v.duration - 1.6) el.classList.add('names-in'); if (v.duration && v.currentTime > v.duration - .35) api.done(); });
        v.addEventListener('ended', api.done); v.addEventListener('error', api.done);
      });
    },
    hero: function () {
      return '<video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="' + C.media.heroPoster + '" src="' + C.media.hero + '"></video><div class="hero-shade"></div>';
    },
    scratch: function (g, W, label) {
      var grd = g.createRadialGradient(W * .38, W * .35, 20, W / 2, W / 2, W / 2);
      grd.addColorStop(0, '#fffaf0'); grd.addColorStop(.55, '#ecdcb7'); grd.addColorStop(1, '#b9965a');
      g.fillStyle = grd; g.beginPath(); g.arc(W / 2, W / 2, W / 2, 0, 7); g.fill();
      g.fillStyle = 'rgba(150,120,70,.22)';
      [[.32, .4, .1], [.62, .58, .07], [.55, .3, .05], [.4, .68, .06], [.72, .4, .04]].forEach(function (c) { g.beginPath(); g.arc(W * c[0], W * c[1], W * c[2], 0, 7); g.fill(); });
      for (var i = 0; i < 900; i++) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * .5).toFixed(2) + ')'; g.fillRect(Math.random() * W, Math.random() * W, 1.6, 1.6); }
      g.save(); g.beginPath(); g.arc(W / 2, W / 2, W / 2, 0, 7); g.clip();
      g.fillStyle = 'rgba(80,60,30,.6)'; g.font = '600 30px Marcellus, serif'; g.textAlign = 'center'; g.fillText('✦ ' + label + ' ✦', W / 2, W / 2 + 10); g.restore();
    }
  };
})();
