/* Raas Garba — a glowing garbo spins under the night sky; on tap the dandiyas clash and the lights burst into a circle of dancers. */
(function () {
  var C = window.INVITE, K = window.KIT;
  function garbo(cls) {
    return '<svg class="garbo ' + (cls || '') + '" viewBox="-60 -70 120 140" aria-hidden="true"><defs><radialGradient id="gb" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffb877"/><stop offset=".6" stop-color="#c2591f"/><stop offset="1" stop-color="#6b2a0a"/></radialGradient>' +
      '<radialGradient id="gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#ffb21e" stop-opacity="0"/></radialGradient></defs>' +
      '<circle r="62" fill="url(#gl)" class="garbo-glow"/><path d="M-26-46h52l-6 12c26 6 40 26 40 46 0 30-26 50-60 50s-60-20-60-50c0-20 14-40 40-46Z" fill="url(#gb)" stroke="#ffd27a" stroke-width="1.5"/>' +
      '<g fill="#fff3b0" transform="translate(0 16)">' + K.rep(3, function (r) { return K.dots(10 + r * 4, 14 + r * 12, 2.6 - r * .5); }) + '</g>' +
      '<path d="M-6-46c0-14 12-18 6-30 10 10 6 18 6 30Z" fill="#ffd27a"/></svg>';
  }
  var sticks = '<svg viewBox="0 0 120 30" aria-hidden="true"><g transform="rotate(-18 60 15)"><rect x="18" y="12" width="84" height="6" rx="3" fill="#ffb21e"/><path d="M34 12v6M50 12v6M70 12v6M86 12v6" stroke="#ff3d8b" stroke-width="4"/></g><g transform="rotate(18 60 15)"><rect x="18" y="12" width="84" height="6" rx="3" fill="#ff3d8b"/><path d="M34 12v6M50 12v6M70 12v6M86 12v6" stroke="#4dd1ff" stroke-width="4"/></g></svg>';
  window.THEME = {
    divider: sticks,
    seal: K.seal({ outer: '#ff3d8b', ring: '#ffb21e', inner: '#14112e', text: '#ffb21e', mono: C.monogram, font: 'Kumar One, sans-serif', size: 18 }),
    scratchShape: 'circle',
    burstColors: ['#ff3d8b', '#ffb21e', '#4dd1ff', '#ffffff', '#7cff6b'],
    fx: { kind: 'confetti', count: 22, colors: ['#ff3d8b', '#ffb21e', '#4dd1ff', '#7cff6b'] },
    countDeco: '<div class="gb-ring" aria-hidden="true">' + K.rep(12, function (i) { return '<i style="--i:' + i + '"></i>'; }) + '</div>',
    gate: function (el, api) {
      el.innerHTML = '<div class="gb-stars"></div><div class="gb-orbit">' + K.rep(16, function (i) { return '<i style="--i:' + i + '"></i>'; }) + '</div>' +
        '<div class="g-box gb-box"><button type="button" class="g-btn gb-pot" aria-label="' + api.esc(api.t('tap')) + '">' + garbo() + '</button>' +
        '<p class="g-names">' + api.names() + '</p><p class="g-greet">' + api.guestLine + '</p><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div>' +
        '<div class="gb-sticks"><i class="s1"></i><i class="s2"></i></div><div class="gb-flash"></div>';
      el.querySelector('.gb-pot').addEventListener('click', function () {
        api.start(); el.classList.add('gb-open');
        setTimeout(api.done, api.reduce ? 0 : 2400);
      });
    },
    hero: function () {
      return '<div class="gb-hero"><img src="' + C.photos.hero + '" alt=""></div><div class="gb-hero-shade"></div><div class="gb-lights">' + K.rep(24, function (i) { return '<i style="--i:' + i + '"></i>'; }) + '</div>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'circle');
      var bg = g.createRadialGradient(W / 2, W / 2, 10, W / 2, W / 2, W / 2); bg.addColorStop(0, '#3a2a6e'); bg.addColorStop(1, '#14112e');
      g.fillStyle = bg; g.fillRect(0, 0, W, W);
      var pot = g.createRadialGradient(W * .45, W * .45, 10, W / 2, W * .55, W * .32); pot.addColorStop(0, '#ffb877'); pot.addColorStop(.6, '#c2591f'); pot.addColorStop(1, '#6b2a0a');
      g.fillStyle = pot; g.beginPath(); g.ellipse(W / 2, W * .56, W * .3, W * .26, 0, 0, 7); g.fill();
      g.fillRect(W * .39, W * .26, W * .22, W * .1);
      for (var r = 0; r < 3; r++) for (var k = 0; k < 9 + r * 3; k++) { var a = k / (9 + r * 3) * Math.PI * 2; g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(W / 2 + Math.cos(a) * (40 + r * 34), W * .56 + Math.sin(a) * (30 + r * 26), 6 - r, 0, 7); g.fill(); }
      K.label(g, W, label, '#ffb21e', '22px "Kumar One", sans-serif', W * .9);
    }
  };
})();
