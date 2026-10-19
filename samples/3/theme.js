/* Sample 3 — Rajwada: royal Rajput wedding, Jodhpur. Gate: a golden mandala spins open and shatters into petals. */
(function () {
  var C = window.INVITE;
  function petals(n, r1, r2, w) { var s = ''; for (var i = 0; i < n; i++) s += '<path transform="rotate(' + (360 / n * i).toFixed(2) + ')" d="M0 ' + -r1 + 'C' + w + ' ' + -(r1 + r2) / 2 + ' ' + w * .5 + ' ' + -r2 + ' 0 ' + -r2 + 'C' + -w * .5 + ' ' + -r2 + ' ' + -w + ' ' + -(r1 + r2) / 2 + ' 0 ' + -r1 + 'Z"/>'; return s; }
  function ring(cls, inner) { return '<g class="mr ' + cls + '">' + inner + '</g>'; }
  var mandala = '<svg class="mandala" viewBox="-200 -200 400 400" aria-hidden="true"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".45" stop-color="#d9ad52"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs>' +
    '<g fill="none" stroke="url(#g3)" stroke-width="2">' +
    ring('m1', '<circle r="26"/><circle r="34" stroke-dasharray="3 5"/>' + petals(8, 36, 80, 22)) +
    ring('m2', '<circle r="88"/>' + petals(16, 90, 132, 16)) +
    ring('m3', '<circle r="138"/><circle r="146" stroke-dasharray="2 6"/>' + petals(24, 148, 182, 12)) +
    ring('m4', '<circle r="188"/>' + petals(48, 188, 199, 4)) +
    '</g><g class="mr m1" fill="url(#g3)"><circle r="14"/></g></svg>';
  var crown = '<svg viewBox="0 0 120 50" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M30 40h60l6-24-16 10-20-20-20 20-16-10Z"/><path d="M30 46h60"/></g><g fill="currentColor"><circle cx="60" cy="6" r="3"/><circle cx="24" cy="14" r="2.5"/><circle cx="96" cy="14" r="2.5"/><circle cx="60" cy="32" r="3"/></g></svg>';
  function seal() {
    return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="s3" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff0b8"/><stop offset=".55" stop-color="#c9a24a"/><stop offset="1" stop-color="#7a5414"/></radialGradient></defs><circle cx="100" cy="100" r="96" fill="url(#s3)"/><circle cx="100" cy="100" r="80" fill="#5a0f22"/><g transform="translate(40 60)" color="#e8c879">' + crown.replace('<svg viewBox="0 0 120 50" aria-hidden="true">', '<svg width="120" height="50" viewBox="0 0 120 50">') + '</g><text x="100" y="140" text-anchor="middle" font-family="Cinzel Decorative, serif" font-size="20" fill="#e8c879">' + C.monogram + '</text></svg>';
  }
  window.THEME = {
    divider: crown,
    seal: seal(),
    scratchShape: 'diamond',
    burstColors: ['#e8c879', '#fff0b8', '#c9a24a', '#e07b24'],
    fx: { kind: 'dust', count: 30, colors: ['rgba(255,226,150,1)', 'rgba(255,240,200,1)'] },
    countDeco: '',
    gate: function (el, api) {
      el.innerHTML = '<div class="g-velvet"></div><div class="g-rays"></div><div class="g-wrap">' + mandala + '<button type="button" class="g-center" aria-label="' + api.esc(api.t('tap')) + '"><span class="g-mono">' + api.esc(C.monogram) + '</span></button></div>' +
        '<div class="g-text">' + (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') + '<p class="g-greet">' + api.guestLine + '</p><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div><div class="g-flash"></div>';
      el.querySelector('.g-center').addEventListener('click', function () {
        api.start(); el.classList.add('burst-open');
        setTimeout(api.done, api.reduce ? 0 : 2600);
      });
    },
    hero: function () {
      return '<div class="h-bg"><img src="' + C.photos.hero + '" alt=""></div><div class="h-shade"></div>' +
        '<svg class="h-frame" viewBox="0 0 400 700" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M20 680V120Q20 30 200 20Q380 30 380 120V680Z"/><path pathLength="1" d="M34 666V128Q34 46 200 36Q366 46 366 128V666Z"/></svg>';
    },
    scratch: function (g, W, label) { // gold-leaf panel with an embossed mandala
      var gr = g.createLinearGradient(0, 0, W, W); gr.addColorStop(0, '#fff0b8'); gr.addColorStop(.3, '#d9ad52'); gr.addColorStop(.6, '#f6dc8e'); gr.addColorStop(1, '#8a6420');
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
      g.translate(W / 2, W / 2); g.strokeStyle = 'rgba(120,80,20,.45)'; g.lineWidth = 2;
      for (var r = 30; r < W / 2; r += 34) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); var n = Math.round(r / 6); for (var k = 0; k < n; k++) { g.save(); g.rotate(k * Math.PI * 2 / n); g.beginPath(); g.ellipse(0, -r - 14, 6, 14, 0, 0, 7); g.stroke(); g.restore(); } }
      g.setTransform(1, 0, 0, 1, 0, 0);
      for (var i = 0; i < 600; i++) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * .6).toFixed(2) + ')'; g.fillRect(Math.random() * W, Math.random() * W, 2, 2); }
      g.fillStyle = '#5a0f22'; g.font = '700 28px Cinzel, serif'; g.textAlign = 'center'; g.fillText(label, W / 2, W / 2 + 10);
    }
  };
})();
