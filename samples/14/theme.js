/* Vav — a carved stepwell. Gate: you descend through nested stone levels while diyas light up on every step. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var divider = '<svg viewBox="0 0 120 30" aria-hidden="true"><g fill="none" stroke="#a07848" stroke-width="1.4"><path d="M10 26h100M22 20h76M34 14h52M46 8h28"/></g><path d="M60 2c3 3 3 6 0 7-3-1-3-4 0-7Z" fill="#ffb347"/></svg>';
  window.THEME = {
    divider: divider,
    seal: K.seal({ outer: '#3b2a1e', ring: '#c9a27a', inner: '#efe0c8', text: '#3b2a1e', mono: C.monogram, font: 'Cinzel, serif', size: 19, dash: '8 4' }),
    scratchShape: 'arch',
    burstColors: ['#ffb347', '#ffd98a', '#c9a27a', '#fff3d6'],
    fx: { kind: 'fireflies', count: 18, colors: ['#ffb347', '#ffd98a'] },
    countDeco: '<div class="v-diyas" aria-hidden="true">' + K.rep(7, function (i) { return '<i style="--i:' + i + '"></i>'; }) + '</div>',
    gate: function (el, api) {
      var levels = K.rep(6, function (i) { return '<div class="v-lvl" style="--i:' + i + '">' + K.rep(2, function () { return '<i class="v-diya"></i>'; }) + '</div>'; });
      el.innerHTML = '<div class="v-well">' + levels + '</div><div class="g-box v-box">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') +
        '<p class="g-names">' + api.names() + '</p><p class="g-greet">' + api.guestLine + '</p><button type="button" class="btn v-btn">' + api.esc(api.t('tap')) + '</button></div>';
      el.querySelector('.v-btn').addEventListener('click', function () {
        api.start(); el.classList.add('v-open');
        setTimeout(api.done, api.reduce ? 0 : 2700);
      });
    },
    hero: function () { return '<div class="v-hero"><img src="' + C.photos.hero + '" alt=""></div><div class="v-hero-shade"></div><div class="v-pillars"><i></i><i></i></div>'; },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'arch');
      var st = g.createLinearGradient(0, 0, 0, W); st.addColorStop(0, '#d8b88e'); st.addColorStop(1, '#8a6440');
      g.fillStyle = st; g.fillRect(0, 0, W, W);
      for (var i = 0; i < 2500; i++) { g.fillStyle = 'rgba(' + (Math.random() > .5 ? '255,240,210' : '60,40,20') + ',' + (Math.random() * .18).toFixed(2) + ')'; g.fillRect(Math.random() * W, Math.random() * W, 2, 2); }
      g.strokeStyle = 'rgba(59,42,30,.5)'; g.lineWidth = 2;
      for (var k = 1; k < 5; k++) { var m = k * W * .09; g.beginPath(); g.moveTo(m, W); g.lineTo(m, W * .4 + m * .3); g.quadraticCurveTo(m, m, W / 2, m); g.quadraticCurveTo(W - m, m, W - m, W * .4 + m * .3); g.lineTo(W - m, W); g.stroke(); }
      K.label(g, W, label, '#fff3d6', '600 22px Cinzel, serif', W * .72);
    }
  };
})();
