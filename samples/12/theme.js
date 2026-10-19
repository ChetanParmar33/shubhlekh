/* Pol ni Haveli — old-city wooden mansion. Gate: carved teak doors swing open in 3D, pigeons take off from the ledge. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var bird = '<svg viewBox="0 0 40 20" aria-hidden="true"><path d="M2 12C10 2 16 4 20 12 24 4 30 2 38 12 30 8 24 10 20 16 16 10 10 8 2 12Z" fill="currentColor"/></svg>';
  var jharukho = '<svg viewBox="0 0 120 30" aria-hidden="true"><g fill="none" stroke="#8a5a2b" stroke-width="1.6"><path d="M30 28V14C30 4 44 2 60 2s30 2 30 12v14"/><path d="M40 28V16c0-7 9-9 20-9s20 2 20 9v12"/><path d="M8 28h104"/></g><circle cx="60" cy="18" r="3" fill="#2f4f7a"/></svg>';
  function door(side) {
    return '<div class="h-door h-' + side + '"><div class="h-panel">' + K.rep(3, function () { return '<span class="h-inset"></span>'; }) + '</div><i class="h-ring"></i>' + K.rep(8, function (i) { return '<b class="h-stud" style="--i:' + i + '"></b>'; }) + '</div>';
  }
  window.THEME = {
    divider: jharukho,
    seal: K.seal({ outer: '#5a3418', ring: '#d9a441', inner: '#f6ecd8', text: '#5a3418', mono: C.monogram, font: 'Alegreya SC, serif', size: 21, dash: '1 4' }),
    scratchShape: 'arch',
    burstColors: ['#d9a441', '#2f4f7a', '#b4472c', '#f6ecd8'],
    fx: null,
    countDeco: '<div class="h-pigeons" aria-hidden="true">' + K.rep(5, function (i) { return '<span style="--i:' + i + '">' + bird + '</span>'; }) + '</div>',
    gate: function (el, api) {
      el.innerHTML = '<div class="h-wall"></div><div class="h-arch"><div class="h-inside"><div class="g-box h-box">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') +
        '<p class="g-greet">' + api.guestLine + '</p><p class="g-names">' + api.names() + '</p></div></div>' + door('l') + door('r') + '</div>' +
        '<div class="h-birds">' + K.rep(6, function (i) { return '<span style="--i:' + i + '">' + bird + '</span>'; }) + '</div>' +
        '<button type="button" class="btn h-knock">' + api.esc(api.t('tap')) + '</button>';
      el.querySelector('.h-knock').addEventListener('click', function () {
        api.start(); el.classList.add('h-open');
        setTimeout(api.done, api.reduce ? 0 : 2800);
      });
    },
    hero: function () {
      return '<div class="h-hero-bg"></div><div class="h-jharukho"><img src="' + C.photos.hero + '" alt=""><i class="h-jali"></i></div>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'arch');
      var wood = g.createLinearGradient(0, 0, W, 0); wood.addColorStop(0, '#4a2a12'); wood.addColorStop(.5, '#7a4a22'); wood.addColorStop(1, '#4a2a12');
      g.fillStyle = wood; g.fillRect(0, 0, W, W);
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1;
      for (var y = 0; y < W; y += 7) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + 4, W * .6, y - 4, W, y + 2); g.stroke(); }
      g.strokeStyle = '#d9a441'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .12, W); g.lineTo(W * .12, W * .44); g.quadraticCurveTo(W * .12, W * .1, W / 2, W * .1); g.quadraticCurveTo(W * .88, W * .1, W * .88, W * .44); g.lineTo(W * .88, W); g.stroke();
      g.fillStyle = '#d9a441'; for (var i = 0; i < 6; i++) { g.beginPath(); g.arc(W * .2 + i * W * .12, W * .9, 4, 0, 7); g.fill(); }
      K.label(g, W, label, '#f6ecd8', '600 24px "Alegreya SC", serif', W * .6);
    }
  };
})();
