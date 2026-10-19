/* Patola — double-ikat weave. Gate: coloured threads slide in from both sides to form the pattern, then pull apart. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var PAL = ['#5b1236', '#f2b134', '#1d7a6b', '#c94f2b', '#fff3df'];
  var ikat = '<svg viewBox="0 0 120 30" aria-hidden="true"><g>' + K.rep(5, function (i) { var x = 12 + i * 24; return '<path d="M' + x + ' 3l10 12-10 12-10-12Z" fill="' + PAL[i % 4] + '" opacity=".9"/>'; }) + '</g></svg>';
  window.THEME = {
    divider: ikat,
    seal: K.seal({ outer: '#5b1236', ring: '#f2b134', inner: '#fff3df', text: '#5b1236', mono: C.monogram, font: 'Bodoni Moda, serif', motif: '<g>' + K.rep(4, function (i) { return '<path transform="rotate(' + i * 90 + ')" d="M0-30l9 15-9 15-9-15Z" fill="' + PAL[i] + '"/>'; }) + '</g>' }),
    scratchShape: 'diamond',
    burstColors: PAL,
    fx: { kind: 'confetti', count: 14, colors: ['#5b1236', '#f2b134', '#1d7a6b', '#c94f2b'] },
    countDeco: '<div class="pt-band" aria-hidden="true"></div>',
    gate: function (el, api) {
      var bars = K.rep(14, function (i) { return '<i style="--i:' + i + ';--c1:' + PAL[i % 4] + ';--c2:' + PAL[(i + 2) % 4] + '" class="' + (i % 2 ? 'l' : 'r') + '"></i>'; });
      el.innerHTML = '<div class="pt-threads">' + bars + '</div><div class="g-box pt-box">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') +
        '<p class="g-names">' + api.names() + '</p><p class="g-greet">' + api.guestLine + '</p>' +
        '<button type="button" class="g-btn pt-knot" aria-label="' + api.esc(api.t('tap')) + '">' + window.THEME.seal + '</button><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div>';
      el.querySelector('.pt-knot').addEventListener('click', function () {
        api.start(); el.classList.add('pt-open');
        setTimeout(api.done, api.reduce ? 0 : 2200);
      });
    },
    hero: function () {
      return '<div class="pt-hero-bg"></div><div class="pt-diamond"><img src="' + C.photos.hero + '" alt=""></div>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'diamond');
      var rows = 10, h = W / rows;
      for (var r = 0; r < rows; r++) {
        g.fillStyle = PAL[r % 4]; g.fillRect(0, r * h, W, h);
        for (var x = (r % 2) * 28; x < W; x += 56) {
          g.fillStyle = PAL[(r + 2) % 4]; g.globalAlpha = .85; g.beginPath(); g.moveTo(x, r * h + h / 2); g.lineTo(x + 14, r * h + 3); g.lineTo(x + 28, r * h + h / 2); g.lineTo(x + 14, r * h + h - 3); g.closePath(); g.fill(); g.globalAlpha = 1;
        }
      }
      K.label(g, W, label, '#fff3df', 'italic 600 26px "Bodoni Moda", serif', W / 2);
    }
  };
})();
