/* Kesudo — modern minimal, flame-of-the-forest blossoms. Gate: a calm pastel card while kesudo flowers drift down; on tap the card lifts and dissolves. */
(function () {
  var C = window.INVITE, K = window.KIT;
  var flower = '<svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0 18C-4 6-14 2-16-8-8-4-2 4 0 18Z" fill="#f26b1d"/><path d="M0 18C4 4 2-10-6-18 6-14 10-2 0 18Z" fill="#ff8a3d"/><path d="M0 18C6 8 14 6 18-4 8-2 2 6 0 18Z" fill="#e2550d"/><path d="M0 18c-2 2-2 4 0 6" stroke="#6b3a1e" stroke-width="2" fill="none"/></svg>';
  var divider = '<svg viewBox="0 0 120 30" aria-hidden="true"><path d="M14 15H50M70 15h36" stroke="#d9b8a2" stroke-width="1"/><g transform="translate(60 13) scale(.5)">' + flower.replace(/<\/?svg[^>]*>/g, '') + '</g></svg>';
  window.THEME = {
    divider: divider,
    seal: K.seal({ outer: '#f26b1d', ring: '#fde8d7', inner: '#fff9f4', text: '#f26b1d', mono: C.monogram, font: 'DM Serif Display, serif', size: 22, dash: '0.1 6' }),
    scratchShape: 'leaf',
    burstColors: ['#f26b1d', '#ff8a3d', '#fde8d7', '#8aa58c'],
    fx: { kind: 'petals', count: 12, colors: ['#f26b1d', '#ff8a3d', '#ffb07a'] },
    countDeco: '',
    gate: function (el, api) {
      el.innerHTML = '<div class="m-rain">' + K.scatter(14, function (i, x, y, r) { return '<span style="left:' + x + '%;--d:' + (r * 6).toFixed(2) + 's;--s:' + (.6 + r * .8).toFixed(2) + ';--t:' + (7 + r * 5).toFixed(1) + 's">' + flower + '</span>'; }) + '</div>' +
        '<div class="g-box m-card"><p class="m-save">' + api.esc(api.t('saveDate') || 'Save the date') + '</p><p class="g-names">' + api.names() + '</p>' +
        '<p class="m-date">' + api.esc(api.fmt(C.date, { day: 'numeric', month: 'long', year: 'numeric' })) + '</p><p class="g-greet">' + api.guestLine + '</p>' +
        '<button type="button" class="btn m-btn">' + api.esc(api.t('tap')) + ' →</button></div>';
      el.querySelector('.m-btn').addEventListener('click', function () {
        api.start(); el.classList.add('m-open');
        setTimeout(api.done, api.reduce ? 0 : 1800);
      });
    },
    hero: function () { return '<div class="m-split"><img src="' + C.photos.hero + '" alt=""></div><span class="m-blob"></span>'; },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'leaf');
      var gr = g.createLinearGradient(0, W, W, 0); gr.addColorStop(0, '#e2550d'); gr.addColorStop(1, '#ffb07a');
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .08, W * .92); g.lineTo(W * .92, W * .08); g.stroke();
      for (var i = 1; i < 7; i++) { var t = i / 7; g.beginPath(); g.moveTo(W * (.08 + .84 * t), W * (.92 - .84 * t)); g.lineTo(W * (.08 + .84 * t) - 30, W * (.92 - .84 * t) - 30); g.moveTo(W * (.08 + .84 * t), W * (.92 - .84 * t)); g.lineTo(W * (.08 + .84 * t) + 30, W * (.92 - .84 * t) + 30); g.stroke(); }
      K.label(g, W, label, '#fff', 'italic 24px "DM Serif Display", serif', W / 2);
    }
  };
})();
