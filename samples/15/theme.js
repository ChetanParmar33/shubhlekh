/* Shreeji — pichwai painting. Gate: a grid of lotuses blooms one by one, then a peacock fan spreads across the screen. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var lotus = '<svg viewBox="-50 -40 100 80" aria-hidden="true">' + K.lotus('#e86a92', '#fff5e8') + '<circle cy="20" r="5" fill="#d4a53c"/></svg>';
  var divider = '<svg viewBox="0 0 120 30" aria-hidden="true"><g transform="translate(60 16) scale(.34)">' + K.lotus('#e86a92') + '</g><g fill="#d4a53c"><circle cx="30" cy="20" r="2.4"/><circle cx="90" cy="20" r="2.4"/><circle cx="16" cy="20" r="1.6"/><circle cx="104" cy="20" r="1.6"/></g></svg>';
  function feather(i, n) { var a = -80 + i * (160 / (n - 1)); return '<span class="s-fth" style="--a:' + a.toFixed(1) + 'deg;--i:' + i + '"><i></i></span>'; }
  window.THEME = {
    divider: divider,
    seal: K.seal({ outer: '#0f4c45', ring: '#d4a53c', inner: '#fff5e8', text: '#0f4c45', mono: C.monogram, font: 'Gilda Display, serif', size: 20, motif: '<g transform="scale(.7) translate(0 -8)">' + K.lotus('#e86a92') + '</g>' }),
    scratchShape: 'circle',
    burstColors: ['#e86a92', '#d4a53c', '#0f4c45', '#fff5e8', '#3b9c8f'],
    fx: { kind: 'petals', count: 14, colors: ['#e86a92', '#f4a6bf', '#f7c6d6'] },
    countDeco: '<div class="s-row" aria-hidden="true">' + K.rep(5, function (i) { return '<span style="--i:' + i + '">' + lotus + '</span>'; }) + '</div>',
    gate: function (el, api) {
      el.innerHTML = '<div class="s-grid">' + K.rep(24, function (i) { return '<span style="--i:' + i + '">' + lotus + '</span>'; }) + '</div>' +
        '<div class="s-fan">' + K.rep(15, feather) + '</div>' +
        '<div class="g-box s-box">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') + '<p class="g-names">' + api.names() + '</p>' +
        '<p class="g-greet">' + api.guestLine + '</p><button type="button" class="g-btn s-seal" aria-label="' + api.esc(api.t('tap')) + '">' + window.THEME.seal + '</button><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div>';
      el.querySelector('.s-seal').addEventListener('click', function () {
        api.start(); el.classList.add('s-open');
        setTimeout(api.done, api.reduce ? 0 : 2800);
      });
    },
    hero: function () {
      return '<div class="s-hero-bg"></div><div class="s-frame"><img src="' + C.photos.hero + '" alt=""></div><div class="s-hero-row">' + K.rep(7, function (i) { return '<span style="--i:' + i + '">' + lotus + '</span>'; }) + '</div>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'circle');
      g.fillStyle = '#0f4c45'; g.fillRect(0, 0, W, W);
      g.save(); g.translate(W / 2, W / 2);
      for (var r = 0; r < 2; r++) for (var i = 0; i < 12; i++) {
        g.save(); g.rotate(i / 12 * Math.PI * 2 + r * .26); g.fillStyle = r ? '#f4a6bf' : '#e86a92';
        g.beginPath(); g.ellipse(0, -(W * (r ? .2 : .32)), W * .05, W * (r ? .1 : .14), 0, 0, 7); g.fill(); g.restore();
      }
      g.fillStyle = '#d4a53c'; g.beginPath(); g.arc(0, 0, W * .1, 0, 7); g.fill(); g.restore();
      g.strokeStyle = '#d4a53c'; g.lineWidth = 4; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 6, 0, 7); g.stroke();
      K.label(g, W, label, '#0f4c45', '600 18px "Gilda Display", serif', W / 2);
    }
  };
})();
