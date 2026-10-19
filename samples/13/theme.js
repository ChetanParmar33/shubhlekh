/* Uttarayan — a bright sky full of kites. Gate: kites bob in the wind; on tap they all fly off and the string writes the names. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var COL = ['#ff5e5b', '#ffd23f', '#3bceac', '#7b2cbf', '#ff8c42', '#00a6fb'];
  function kite(c1, c2) { return '<svg viewBox="-30 -36 60 100" aria-hidden="true"><path d="M0-34L26 0 0 40-26 0Z" fill="' + c1 + '"/><path d="M0-34L26 0H-26Z" fill="' + c2 + '" opacity=".9"/><path d="M0-34V40M-26 0H26" stroke="rgba(0,0,0,.25)" stroke-width="1.4"/><path d="M-6 40h12l-6 10Z" fill="' + c2 + '"/><path d="M0 50C8 58-6 66 2 76" stroke="#555" stroke-width="1" fill="none"/></svg>'; }
  var divider = '<svg viewBox="0 0 120 30" aria-hidden="true"><path d="M4 22C30 8 50 26 74 14S108 8 116 12" stroke="#7b2cbf" stroke-width="1.2" fill="none" stroke-dasharray="2 3"/><g transform="translate(60 14) scale(.32)"><path d="M0-34L26 0 0 40-26 0Z" fill="#ff5e5b"/><path d="M0-34L26 0H-26Z" fill="#ffd23f"/></g></svg>';
  window.THEME = {
    divider: divider,
    seal: K.seal({ outer: '#ff5e5b', ring: '#ffd23f', inner: '#fffdf5', text: '#7b2cbf', mono: C.monogram, font: 'Pacifico, cursive', size: 24, motif: '<g transform="scale(.8)"><path d="M0-34L26 0 0 40-26 0Z" fill="#3bceac"/><path d="M0-34L26 0H-26Z" fill="#ffd23f"/></g>' }),
    scratchShape: 'diamond',
    burstColors: COL,
    fx: { kind: 'kites', count: 9, colors: COL },
    countDeco: '<div class="u-line" aria-hidden="true">' + K.rep(9, function (i) { return '<i style="--i:' + i + ';background:' + COL[i % 6] + '"></i>'; }) + '</div>',
    gate: function (el, api) {
      var spots = [[12, 16], [72, 10], [40, 6], [84, 34], [8, 46], [62, 56], [26, 70], [80, 74]];
      el.innerHTML = '<div class="u-sun"></div><div class="u-clouds"><i></i><i></i><i></i></div>' +
        spots.map(function (p, i) { return '<span class="u-kite" style="left:' + p[0] + '%;top:' + p[1] + '%;--i:' + i + '">' + kite(COL[i % 6], COL[(i + 2) % 6]) + '</span>'; }).join('') +
        '<div class="g-box u-box"><p class="g-greet">' + api.guestLine + '</p><p class="g-names">' + api.names() + '</p>' +
        '<button type="button" class="btn u-btn">' + api.esc(api.t('tap')) + '</button></div><div class="u-roofs"></div>';
      el.querySelector('.u-btn').addEventListener('click', function () {
        api.start(); el.classList.add('u-open');
        setTimeout(api.done, api.reduce ? 0 : 2300);
      });
    },
    hero: function () {
      return '<div class="u-hero"><img src="' + C.photos.hero + '" alt=""></div><div class="u-hero-shade"></div>' +
        '<span class="u-hk u-hk1">' + kite('#ff5e5b', '#ffd23f') + '</span><span class="u-hk u-hk2">' + kite('#3bceac', '#7b2cbf') + '</span>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'diamond');
      g.fillStyle = '#ff5e5b'; g.fillRect(0, 0, W, W);
      g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W, W / 2); g.lineTo(0, W / 2); g.closePath(); g.fill();
      g.fillStyle = '#3bceac'; g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W / 2, W); g.lineTo(0, W / 2); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, W); g.moveTo(0, W / 2); g.lineTo(W, W / 2); g.stroke();
      K.label(g, W, label, '#fff', '24px Pacifico, cursive', W * .66);
    }
  };
})();
