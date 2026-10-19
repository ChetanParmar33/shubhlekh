/* Sample 2 — Genda Phool: Punjabi haldi-mehndi festivity. Gate: a curtain of marigold garlands parts from the middle. */
(function () {
  var C = window.INVITE;
  var marigold = '<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(32 32)">' +
    [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<ellipse transform="rotate(' + a + ')" cx="0" cy="-17" rx="7" ry="12" fill="#f39a1e"/>'; }).join('') +
    [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map(function (a) { return '<ellipse transform="rotate(' + a + ')" cx="0" cy="-11" rx="6" ry="9" fill="#ffc53d"/>'; }).join('') +
    '<circle r="7" fill="#e8641a"/></g></svg>';
  var divider = '<svg viewBox="0 0 120 40" aria-hidden="true"><g transform="translate(60 20)"><circle r="11" fill="#f39a1e"/><circle r="7" fill="#ffc53d"/><circle r="3" fill="#e8641a"/></g>' +
    '<path d="M8 20q10-12 20 0t20 0M72 20q10-12 20 0t20 0" fill="none" stroke="#2f7d32" stroke-width="2.5" stroke-linecap="round"/><circle cx="30" cy="20" r="4" fill="#e2337a"/><circle cx="90" cy="20" r="4" fill="#e2337a"/></svg>';
  function strings(n) { // hanging marigold garlands
    var s = ''; for (var i = 0; i < n; i++) s += '<span class="mg-str" style="--i:' + i + ';--n:' + n + ';--l:' + (55 + (i * 37 % 40)) + '%"></span>'; return s;
  }
  window.THEME = {
    divider: divider,
    seal: marigold,
    scratchShape: 'circle',
    burstColors: ['#f39a1e', '#ffc53d', '#e2337a', '#2f7d32', '#e8641a'],
    fx: { kind: 'petals', count: 18, colors: ['#f39a1e', '#ffc53d', '#e8641a', '#e2337a'] },
    countDeco: '<div class="dhol-row" aria-hidden="true"><span></span><span></span><span></span></div>',
    gate: function (el, api) {
      el.innerHTML = '<div class="g-curtain g-left">' + strings(9) + '</div><div class="g-curtain g-right">' + strings(9) + '</div>' +
        '<div class="g-card"><p class="g-oh">' + (C.invocation ? api.tx(C.invocation) : '') + '</p><p class="g-greet">' + api.guestLine + '</p>' +
        '<button type="button" class="g-flower" aria-label="' + api.esc(api.t('tap')) + '">' + marigold + '</button>' +
        '<p class="g-names">' + api.names() + '</p><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div><div class="g-confetti"></div>';
      el.querySelector('.g-flower').addEventListener('click', function () {
        api.start();
        var conf = '', cols = ['#f39a1e', '#ffc53d', '#e2337a', '#2f7d32', '#fff'];
        for (var i = 0; i < 46; i++) conf += '<i style="--x:' + (Math.random() * 100).toFixed(0) + '%;--d:' + (Math.random() * .6).toFixed(2) + 's;--c:' + cols[i % 5] + ';--r:' + (Math.random() * 720 - 360).toFixed(0) + 'deg;--t:' + (1.6 + Math.random()).toFixed(2) + 's"></i>';
        el.querySelector('.g-confetti').innerHTML = conf;
        el.classList.add('open-anim');
        setTimeout(api.done, api.reduce ? 0 : 2300);
      });
    },
    hero: function (a) {
      return '<div class="h-photo"><img src="' + C.photos.hero + '" alt=""></div><div class="h-sun" aria-hidden="true"></div><div class="h-toran" aria-hidden="true">' + strings(11) + '</div><div class="h-shade"></div>';
    },
    scratch: function (g, W, label) { // a big marigold to scratch
      g.translate(W / 2, W / 2);
      for (var ring = 0; ring < 4; ring++) {
        var n = 18 + ring * 4, rr = W / 2 - ring * 52;
        for (var k = 0; k < n; k++) {
          g.save(); g.rotate(k * Math.PI * 2 / n + ring * .3);
          var gr = g.createLinearGradient(0, -rr, 0, -rr + 120); gr.addColorStop(0, ['#f39a1e', '#f7b733', '#ffc53d', '#ffd66b'][ring]); gr.addColorStop(1, ['#d9640f', '#e8841f', '#f39a1e', '#f7b733'][ring]);
          g.fillStyle = gr; g.beginPath(); g.ellipse(0, -rr + 60, 34 - ring * 4, 62 - ring * 6, 0, 0, 7); g.fill(); g.restore();
        }
      }
      g.fillStyle = '#c4500c'; g.beginPath(); g.arc(0, 0, 58, 0, 7); g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#5a1f00'; g.font = '700 30px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText(label, W / 2, W / 2 + 10);
    }
  };
})();
