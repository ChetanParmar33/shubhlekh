/* Sample 5 — Kanjivaram: a Tamil wedding in Madurai. Gate: silk curtains with zari borders part as the temple bell rings. */
(function () {
  var C = window.INVITE;
  var bell = '<svg class="bell" viewBox="0 0 80 120" aria-hidden="true"><defs><linearGradient id="b5" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a10"/><stop offset=".4" stop-color="#f6d27a"/><stop offset="1" stop-color="#a86f14"/></linearGradient></defs>' +
    '<path d="M40 0v22" stroke="#a86f14" stroke-width="3"/><circle cx="40" cy="26" r="6" fill="url(#b5)"/><path d="M14 92C14 54 22 34 40 32 58 34 66 54 66 92Z" fill="url(#b5)"/><rect x="8" y="90" width="64" height="8" rx="4" fill="url(#b5)"/><circle class="clapper" cx="40" cy="106" r="7" fill="#a86f14"/><path d="M24 60h32M22 74h36" stroke="#8a5a10" stroke-width="2"/></svg>';
  // kolam: dots + one continuous looping line, drawn on scroll
  function kolam() {
    var dots = '', x, y;
    for (y = -2; y <= 2; y++) for (x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) <= 3) dots += '<circle cx="' + x * 30 + '" cy="' + y * 30 + '" r="2.6"/>';
    var loops = '';
    for (var k = 0; k < 8; k++) loops += '<path pathLength="1" transform="rotate(' + k * 45 + ')" d="M0 0C20 -10 40 -30 30 -60C20 -80 -20 -80 -30 -60C-40 -30 -20 -10 0 0"/>';
    return '<svg class="kolam" viewBox="-110 -110 220 220" aria-hidden="true"><g fill="currentColor" opacity=".8">' + dots + '</g><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' + loops + '<circle pathLength="1" r="95"/></g></svg>';
  }
  var divider = '<svg viewBox="0 0 120 40" aria-hidden="true"><g fill="currentColor"><path d="M60 4l8 16-8 16-8-16Z"/><circle cx="40" cy="20" r="3"/><circle cx="80" cy="20" r="3"/><circle cx="26" cy="20" r="2"/><circle cx="94" cy="20" r="2"/></g><path d="M60 10l4 10-4 10-4-10Z" fill="#fffdf5"/></svg>';
  function jasmineString(n) { var s = ''; for (var i = 0; i < n; i++) s += '<span class="js" style="--i:' + i + '"></span>'; return s; }
  window.THEME = {
    divider: divider,
    seal: '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#8e1450"/><circle cx="100" cy="100" r="84" fill="none" stroke="#d9a21b" stroke-width="6" stroke-dasharray="10 6"/><g transform="translate(100 96) scale(.62)" color="#f6d27a">' + kolam().replace('<svg class="kolam" viewBox="-110 -110 220 220" aria-hidden="true">', '<g>').replace(/<\/svg>$/, '</g>') + '</g><text x="100" y="172" text-anchor="middle" font-family="Gilda Display, serif" font-size="18" fill="#fffdf5">' + C.monogram + '</text></svg>',
    scratchShape: 'leaf',
    burstColors: ['#fffdf5', '#d9a21b', '#8e1450', '#2e8b3e'],
    fx: { kind: 'jasmine', count: 14, colors: ['#fffdf5', '#fff8e6'] },
    countDeco: '<div class="cd-kolam rv">' + kolam() + '</div>',
    gate: function (el, api) {
      el.innerHTML = '<div class="silk s-l"><i class="zari"></i></div><div class="silk s-r"><i class="zari"></i></div><div class="g-jasmine">' + jasmineString(18) + '</div>' +
        '<div class="g-inner"><button type="button" class="g-bell" aria-label="' + api.esc(api.t('tap')) + '">' + bell + '</button>' +
        (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') + '<p class="g-greet">' + api.guestLine + '</p><p class="g-names">' + api.names() + '</p><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div><div class="g-fall"></div>';
      el.querySelector('.g-bell').addEventListener('click', function () {
        api.start();
        var f = ''; for (var i = 0; i < 30; i++) f += '<i style="--x:' + (Math.random() * 100).toFixed(0) + '%;--d:' + (Math.random() * 1).toFixed(2) + 's;--t:' + (2 + Math.random() * 1.5).toFixed(2) + 's;--r:' + (Math.random() * 600).toFixed(0) + 'deg"></i>';
        el.querySelector('.g-fall').innerHTML = f;
        el.classList.add('ring');
        setTimeout(function () { el.classList.add('part'); }, 700);
        setTimeout(api.done, api.reduce ? 0 : 2700);
      });
    },
    hero: function () {
      return '<div class="h-garland">' + jasmineString(24) + '</div><div class="h-gopuram"><img src="' + C.photos.hero + '" alt=""></div>' +
        '<svg class="banana bl" viewBox="0 0 100 200" aria-hidden="true"><path d="M90 200C40 160 10 100 30 10 50 80 80 130 90 200Z" fill="#2e8b3e"/><path d="M90 200C50 140 36 80 30 10" stroke="#a7d39a" stroke-width="2" fill="none"/></svg>' +
        '<svg class="banana br" viewBox="0 0 100 200" aria-hidden="true"><path d="M90 200C40 160 10 100 30 10 50 80 80 130 90 200Z" fill="#2e8b3e"/><path d="M90 200C50 140 36 80 30 10" stroke="#a7d39a" stroke-width="2" fill="none"/></svg>' +
        '<div class="h-kolam">' + kolam() + '</div>';
    },
    scratch: function (g, W, label) { // betel leaf
      g.save(); g.translate(W / 2, W / 2);
      var gr = g.createLinearGradient(-W / 2, -W / 2, W / 2, W / 2); gr.addColorStop(0, '#5fb35a'); gr.addColorStop(1, '#1f6b2c');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, W * .46); g.bezierCurveTo(-W * .62, W * .1, -W * .44, -W * .42, 0, -W * .3); g.bezierCurveTo(W * .44, -W * .42, W * .62, W * .1, 0, W * .46); g.fill();
      g.strokeStyle = 'rgba(220,255,200,.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, W * .44); g.lineTo(0, -W * .28); g.stroke();
      for (var k = -3; k <= 3; k++) { if (!k) continue; g.beginPath(); g.moveTo(0, k * 30 + 40); g.quadraticCurveTo(k > 0 ? 80 : -80, k * 30 - 10, k > 0 ? 150 : -150, k * 34 - 50); g.stroke(); }
      g.restore();
      g.fillStyle = '#fffdf5'; g.font = '700 28px Philosopher, sans-serif'; g.textAlign = 'center'; g.fillText(label, W / 2, W / 2 + 10);
    }
  };
})();
