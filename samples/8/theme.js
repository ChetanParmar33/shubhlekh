/* Gharchola — festive red & green with golden zari checks. Gate: zari squares weave in one by one, then flip away in a wave. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var motif = '<g fill="#e2b54e">' + K.petalRing(8, 4, 16, 5) + '<circle r="4"/></g>';
  window.THEME = {
    divider: '<svg viewBox="0 0 120 30" aria-hidden="true"><g stroke="#e2b54e" stroke-width="2" fill="none"><rect x="47" y="2" width="26" height="26" transform="rotate(45 60 15)"/><path d="M0 15h40M80 15h40"/></g><g transform="translate(60 15) scale(.55)">' + motif + '</g></svg>',
    seal: K.seal({ outer: '#7d0d16', ring: '#e2b54e', inner: '#1f6b3a', text: '#e2b54e', mono: C.monogram, font: 'Abril Fatface, serif', motif: '<g transform="scale(1.6)">' + motif + '</g>' }),
    scratchShape: 'rect',
    burstColors: ['#e2b54e', '#7d0d16', '#1f6b3a', '#fff'],
    fx: { kind: 'dust', count: 26, colors: ['rgba(240,200,110,1)'] },
    countDeco: '',
    gate: function (el, api) {
      var cells = K.rep(60, function (i) { var c = i % 6, r = Math.floor(i / 6); return '<i style="--d:' + ((c + r) * .06).toFixed(2) + 's" class="' + ((c + r) % 2 ? 'gr' : 'rd') + '"><svg viewBox="-20 -20 40 40">' + motif + '</svg></i>'; });
      el.innerHTML = '<div class="gc-grid">' + cells + '</div><div class="g-box gc-box">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') +
        '<p class="g-names">' + api.names() + '</p><p class="g-greet">' + api.guestLine + '</p><button type="button" class="btn gc-btn">' + api.esc(api.t('tap')) + '</button></div>';
      el.querySelector('.gc-btn').addEventListener('click', function () {
        api.start(); el.classList.add('gc-open');
        setTimeout(api.done, api.reduce ? 0 : 2300);
      });
    },
    hero: function () {
      return '<div class="gc-hero-bg"></div><div class="gc-photo"><img src="' + C.photos.hero + '" alt=""></div>';
    },
    scratch: function (g, W, label) {
      var n = 8, s = W / n;
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
        g.fillStyle = (r + c) % 2 ? '#1f6b3a' : '#7d0d16'; g.fillRect(c * s, r * s, s, s);
        g.strokeStyle = '#e2b54e'; g.lineWidth = 3; g.strokeRect(c * s + 3, r * s + 3, s - 6, s - 6);
        g.fillStyle = '#e2b54e'; g.beginPath(); g.arc(c * s + s / 2, r * s + s / 2, 5, 0, 7); g.fill();
      }
      g.fillStyle = '#7d0d16'; g.fillRect(W * .1, W * .42, W * .8, 80); g.strokeStyle = '#e2b54e'; g.strokeRect(W * .1 + 6, W * .42 + 6, W * .8 - 12, 68);
      K.label(g, W, label, '#e2b54e', '28px "Abril Fatface", serif', W * .42 + 40);
    }
  };
})();
