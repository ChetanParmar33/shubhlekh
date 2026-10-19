/* Kankotri — a classic red & turmeric wedding card. Gate: the envelope flap lifts, the card rises, a kumkum tilak is stamped. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var ganesh = '<svg viewBox="-60 -60 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M-30-26C-34-46-14-56 0-50 14-56 34-46 30-26"/><path d="M-30-26C-46-22-50 0-36 10M30-26C46-22 50 0 36 10"/>' +
    '<path d="M-14-24C-16-6-10 8 0 12 6 14 8 24 4 34 0 42 10 46 16 40"/><path d="M14-24C16-8 12 4 6 8"/><circle cx="-10" cy="-30" r="2.5" fill="currentColor"/><circle cx="10" cy="-30" r="2.5" fill="currentColor"/>' +
    '<path d="M-26 22C-20 40 20 40 26 22"/><path d="M0-50V-58M-8-56L0-62 8-56"/></g></svg>';
  var divider = '<svg viewBox="0 0 120 30" aria-hidden="true"><g fill="#f6c21a"><circle cx="20" cy="15" r="3"/><circle cx="100" cy="15" r="3"/><circle cx="34" cy="15" r="2"/><circle cx="86" cy="15" r="2"/></g><path d="M60 3l9 12-9 12-9-12Z" fill="#b3121f"/><circle cx="60" cy="15" r="3" fill="#f6c21a"/></svg>';
  window.THEME = {
    divider: divider,
    seal: K.seal({ outer: '#b3121f', ring: '#f6c21a', inner: '#fff4dc', text: '#b3121f', mono: C.monogram, font: 'Rozha One, serif', motif: '<g color="#b3121f" transform="scale(.55)">' + ganesh.replace(/<\/?svg[^>]*>/g, '') + '</g>' }),
    scratchShape: 'circle',
    burstColors: ['#b3121f', '#f6c21a', '#f28c28', '#fff4dc'],
    fx: { kind: 'petals', count: 16, colors: ['#f28c28', '#f6c21a', '#e8641a', '#b3121f'] },
    countDeco: '<div class="toran-mini" aria-hidden="true">' + K.rep(13, function (i) { return '<i style="--i:' + i + '"></i>'; }) + '</div>',
    gate: function (el, api) {
      el.innerHTML = '<div class="k-dots"></div><div class="k-env"><div class="k-back"></div>' +
        '<div class="k-card"><span class="k-ganesh">' + ganesh + '</span>' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') +
        '<p class="k-title">' + api.tx({ en: 'Kankotri', gu: 'કંકોત્રી' }) + '</p><p class="g-names">' + api.names() + '</p><p class="g-greet">' + api.guestLine + '</p></div>' +
        '<div class="k-front"></div><div class="k-flap"></div><button type="button" class="k-seal" aria-label="' + api.esc(api.t('tap')) + '"><span>' + api.esc(C.monogram) + '</span></button></div>' +
        '<p class="g-tap k-tap">' + api.esc(api.t('tap')) + '</p><i class="k-tilak"></i>';
      el.querySelector('.k-seal').addEventListener('click', function () {
        api.start(); el.classList.add('k-open');
        setTimeout(api.done, api.reduce ? 0 : 2900);
      });
    },
    hero: function () {
      return '<div class="k-hero-bg"></div><div class="k-frame"><img src="' + C.photos.hero + '" alt=""></div>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'circle');
      var gr = g.createRadialGradient(W * .38, W * .32, 10, W / 2, W / 2, W / 2);
      gr.addColorStop(0, '#fff1b8'); gr.addColorStop(.5, '#d9a43a'); gr.addColorStop(1, '#8a5a12');
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
      g.strokeStyle = 'rgba(110,60,0,.45)'; g.lineWidth = 3;
      [W * .46, W * .4].forEach(function (r) { g.beginPath(); g.arc(W / 2, W / 2, r, 0, 7); g.stroke(); });
      var kk = g.createRadialGradient(W / 2, W * .48, 4, W / 2, W / 2, W * .2); kk.addColorStop(0, '#ff3b3b'); kk.addColorStop(1, '#8e0a12');
      g.fillStyle = kk; g.beginPath(); g.arc(W / 2, W / 2, W * .19, 0, 7); g.fill();
      for (var i = 0; i < 70; i++) { var a = Math.random() * 7, r = W * (.24 + Math.random() * .12); g.fillStyle = '#fffbe6'; g.beginPath(); g.ellipse(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r, 5, 2.4, a, 0, 7); g.fill(); }
      K.label(g, W, label, '#fff4dc', '600 26px "Hind Vadodara", sans-serif', W * .86);
    }
  };
})();
