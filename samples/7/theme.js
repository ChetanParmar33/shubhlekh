/* Panetar — bridal white & red with bandhani dots. Gate: a red bandhani veil; dots bloom outward from the tap and the veil lifts. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var dotRow = '<svg viewBox="0 0 120 24" aria-hidden="true"><g fill="#b0141e">' + K.rep(7, function (i) { return '<circle cx="' + (12 + i * 16) + '" cy="12" r="' + (i === 3 ? 5 : 3) + '"/>'; }) + '</g><g fill="#fff">' + K.rep(7, function (i) { return '<circle cx="' + (12 + i * 16) + '" cy="12" r="1.3"/>'; }) + '</g></svg>';
  window.THEME = {
    divider: dotRow,
    seal: K.seal({ outer: '#b0141e', ring: '#fff', inner: '#fffaf4', text: '#b0141e', mono: C.monogram, font: 'Great Vibes, cursive', size: 30, dash: '1 6' }),
    scratchShape: 'arch',
    burstColors: ['#b0141e', '#ffffff', '#d4a24c'],
    fx: { kind: 'bandhani', count: 20, colors: ['#b0141e', '#d4a24c'] },
    countDeco: '',
    gate: function (el, api) {
      var dots = K.rep(90, function (i) { var x = (i % 9) * 11.5 + 4 + (Math.floor(i / 9) % 2) * 5.5, y = Math.floor(i / 9) * 10.5 + 3; return '<i style="left:' + x + '%;top:' + y + '%;--d:' + (Math.hypot(x - 50, y - 50) / 60).toFixed(2) + 's"></i>'; });
      el.innerHTML = '<div class="p-veil"><div class="p-dots">' + dots + '</div></div><div class="g-box p-box">' +
        (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') + '<p class="g-greet">' + api.guestLine + '</p>' +
        '<button type="button" class="g-btn p-seal" aria-label="' + api.esc(api.t('tap')) + '">' + window.THEME.seal + '</button>' +
        '<p class="g-names">' + api.names() + '</p><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div>';
      el.querySelector('.p-seal').addEventListener('click', function () {
        api.start(); el.classList.add('p-open');
        setTimeout(api.done, api.reduce ? 0 : 2600);
      });
    },
    hero: function () {
      return '<div class="p-hero"><img src="' + C.photos.hero + '" alt=""><span class="p-border"></span></div>';
    },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'arch');
      g.fillStyle = '#b0141e'; g.fillRect(0, 0, W, W);
      for (var y = 20; y < W; y += 34) for (var x = 18 + (y / 34 % 2) * 17; x < W; x += 34) {
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
        g.fillStyle = '#b0141e'; g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill();
      }
      g.fillStyle = 'rgba(176,20,30,.85)'; g.fillRect(W * .12, W * .48, W * .76, 64);
      K.label(g, W, label, '#fff', 'italic 600 30px "Cormorant Garamond", serif', W * .48 + 32);
    }
  };
})();
