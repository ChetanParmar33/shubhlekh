/* Sample 4 — Mehndi Bagh: a Lucknowi Nikah in emerald & blush. Gate: henna art draws itself, then two arched panels part. */
(function () {
  var C = window.INVITE;
  function henna() {
    var s = '', i, a;
    for (i = 0; i < 12; i++) { a = i * 30; s += '<path pathLength="1" transform="rotate(' + a + ')" d="M0 -30C14 -48 14 -72 0 -88C-14 -72 -14 -48 0 -30Z"/><path pathLength="1" transform="rotate(' + (a + 15) + ')" d="M0 -38C7 -50 7 -62 0 -68C-7 -62 -7 -50 0 -38Z"/>'; }
    var vine = ''; for (i = 0; i < 8; i++) { a = i * 45; vine += '<g transform="rotate(' + a + ')"><path pathLength="1" d="M0 -100C22 -114 24 -136 8 -154"/><path pathLength="1" d="M12 -122C26 -120 32 -128 32 -138C22 -138 14 -132 12 -122Z"/><path pathLength="1" d="M4 -142C-10 -144 -16 -154 -14 -164C-4 -162 2 -154 4 -142Z"/><circle pathLength="1" cx="8" cy="-162" r="4"/></g>'; }
    return '<svg class="henna" viewBox="-185 -185 370 370" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<circle pathLength="1" r="12"/><circle pathLength="1" r="22"/>' + s + '<circle pathLength="1" r="94"/><circle pathLength="1" r="100" stroke-dasharray=".01 .02"/>' + vine + '<circle pathLength="1" r="176"/></svg>';
  }
  var leaf = '<svg viewBox="0 0 120 40" aria-hidden="true"><path d="M60 20C44 4 20 6 6 20 20 34 44 36 60 20Zm0 0c16-16 40-14 54 0-14 14-38 16-54 0Z" fill="currentColor" opacity=".9"/><path d="M8 20h104" stroke="#fbf6ee" stroke-width="1.2"/><circle cx="60" cy="20" r="5" fill="#ebb8c3"/></svg>';
  function lantern(cls) {
    return '<svg class="lantern ' + cls + '" viewBox="0 0 60 160" aria-hidden="true"><path d="M30 0v40" stroke="#b8955a" stroke-width="1.5"/><path d="M18 40h24l6 14H12Z" fill="#b8955a"/><path d="M12 54h36l-4 50H16Z" fill="rgba(255,214,140,.35)" stroke="#b8955a" stroke-width="2"/><path d="M22 54v50M30 54v50M38 54v50" stroke="#b8955a" stroke-width="1"/><ellipse cx="30" cy="80" rx="8" ry="12" fill="#ffd27a" class="glow"/><path d="M16 104h28l-6 12H22Z" fill="#b8955a"/><path d="M30 116v20" stroke="#b8955a" stroke-width="1.5"/><circle cx="30" cy="140" r="4" fill="#ebb8c3"/></svg>';
  }
  window.THEME = {
    divider: leaf,
    seal: '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#0f4d3a"/><circle cx="100" cy="100" r="84" fill="none" stroke="#b8955a" stroke-width="2" stroke-dasharray="3 5"/><g transform="translate(40 80)" color="#ebb8c3">' + leaf.replace('<svg viewBox="0 0 120 40" aria-hidden="true">', '<svg width="120" height="40" viewBox="0 0 120 40">') + '</g><text x="100" y="150" text-anchor="middle" font-family="Italiana, serif" font-size="22" fill="#fbf6ee">' + C.monogram + '</text></svg>',
    scratchShape: 'arch',
    burstColors: ['#ebb8c3', '#0f4d3a', '#b8955a', '#9bb39b'],
    fx: { kind: 'leaves', count: 14, colors: ['#5f8f6a', '#9bb39b', '#ebb8c3', '#3f7a5c'] },
    countDeco: '',
    gate: function (el, api) {
      el.innerHTML = '<div class="g-panel g-l"></div><div class="g-panel g-r"></div><div class="g-inner">' +
        (C.invocation ? '<p class="g-bism" lang="ar" dir="rtl">' + api.tx(C.invocation) + '</p>' : '') + henna() +
        '<p class="g-greet">' + api.guestLine + '</p><p class="g-names">' + api.names() + '</p>' +
        '<button type="button" class="btn g-btn">' + api.esc(api.t('tap')) + '</button></div><div class="g-leaves"></div>';
      requestAnimationFrame(function () { el.classList.add('draw'); });
      el.querySelector('.g-btn').addEventListener('click', function () {
        api.start();
        var lv = '', cols = ['#5f8f6a', '#9bb39b', '#ebb8c3', '#3f7a5c'];
        for (var i = 0; i < 26; i++) lv += '<i style="--x:' + (30 + Math.random() * 40).toFixed(0) + '%;--y:' + (35 + Math.random() * 30).toFixed(0) + '%;--dx:' + (Math.random() * 300 - 150).toFixed(0) + 'px;--dy:' + (-200 - Math.random() * 300).toFixed(0) + 'px;--r:' + (Math.random() * 540).toFixed(0) + 'deg;--c:' + cols[i % 4] + ';--d:' + (Math.random() * .4).toFixed(2) + 's"></i>';
        el.querySelector('.g-leaves').innerHTML = lv;
        el.classList.add('part');
        setTimeout(api.done, api.reduce ? 0 : 2200);
      });
    },
    hero: function () {
      return '<div class="h-arch"><img src="' + C.photos.hero + '" alt=""></div>' + lantern('l1') + lantern('l2') + '<div class="h-jaali" aria-hidden="true"></div>';
    },
    scratch: function (g, W, label) { // blush card with henna lines
      var gr = g.createLinearGradient(0, 0, 0, W); gr.addColorStop(0, '#f6d5dc'); gr.addColorStop(1, '#e3a3b1');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, W); g.lineTo(0, W * .4); g.quadraticCurveTo(0, 0, W / 2, 0); g.quadraticCurveTo(W, 0, W, W * .4); g.lineTo(W, W); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(122,52,24,.55)'; g.lineWidth = 2.2; g.translate(W / 2, W * .55);
      for (var r = 40; r < 260; r += 44) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); var n = Math.round(r / 7); for (var k = 0; k < n; k++) { g.save(); g.rotate(k * Math.PI * 2 / n); g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(10, -r - 16, 0, -r - 26); g.quadraticCurveTo(-10, -r - 16, 0, -r); g.stroke(); g.restore(); } }
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#0f4d3a'; g.font = '500 30px Jost, sans-serif'; g.textAlign = 'center'; g.fillText(label, W / 2, W * .58);
    }
  };
})();
