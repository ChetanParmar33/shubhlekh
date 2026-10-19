/* Safed Rann — the white salt desert under a full moon. Gate: the moon rises over the horizon, mirror-work sparkles, the moon fills the sky. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var mirror = '<svg viewBox="0 0 120 30" aria-hidden="true"><g fill="none" stroke="#9fb4d8" stroke-width="1.5">' + K.rep(5, function (i) { return '<circle cx="' + (20 + i * 20) + '" cy="15" r="' + (i === 2 ? 9 : 5) + '"/>'; }) + '</g><circle cx="60" cy="15" r="5" fill="#dfe8ff"/></svg>';
  window.THEME = {
    divider: mirror,
    seal: K.seal({ outer: '#0d1b3d', ring: '#9fb4d8', inner: '#f4f7ff', text: '#0d1b3d', mono: C.monogram, font: 'Tenor Sans, sans-serif', size: 20 }),
    scratchShape: 'circle',
    burstColors: ['#ffffff', '#dfe8ff', '#9fb4d8', '#ffd98a'],
    fx: { kind: 'dust', count: 30, colors: ['rgba(255,255,255,1)', 'rgba(220,232,255,1)'] },
    countDeco: '',
    gate: function (el, api) {
      el.innerHTML = '<div class="sr-sky"></div><div class="sr-moon"></div><div class="sr-desert"><div class="sr-mirrors">' + K.rep(18, function (i) { return '<i style="left:' + (3 + i * 5.4) + '%;--d:' + (i * .17).toFixed(2) + 's"></i>'; }) + '</div></div>' +
        '<div class="g-box sr-box">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') + '<p class="g-greet">' + api.guestLine + '</p>' +
        '<p class="g-names">' + api.names() + '</p><button type="button" class="btn sr-btn">' + api.esc(api.t('tap')) + '</button></div>';
      el.querySelector('.sr-btn').addEventListener('click', function () {
        api.start(); el.classList.add('sr-open');
        setTimeout(api.done, api.reduce ? 0 : 2600);
      });
    },
    hero: function () { return '<div class="sr-hero"><img src="' + C.photos.hero + '" alt=""></div><div class="sr-hero-shade"></div><div class="sr-hero-moon"></div>'; },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'circle');
      var gr = g.createRadialGradient(W * .4, W * .36, 10, W / 2, W / 2, W / 2); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.6, '#dde6f7'); gr.addColorStop(1, '#a8b8d6');
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
      g.fillStyle = 'rgba(120,140,180,.22)'; [[.3, .38, .09], [.62, .56, .07], [.5, .28, .05], [.42, .7, .06]].forEach(function (c) { g.beginPath(); g.arc(W * c[0], W * c[1], W * c[2], 0, 7); g.fill(); });
      K.sparkle(g, W, 700);
      K.label(g, W, label, '#0d1b3d', '24px "Tenor Sans", sans-serif', W / 2);
    }
  };
})();
