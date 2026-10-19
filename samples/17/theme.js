/* Shubh Vivah — temple white and gold. Gate: a closed lotus bud glows, opens petal by petal, and rays of light pour out. */
(function () {
  var C = window.INVITE, K = window.KIT;
  function bud() {
    var outer = K.rep(8, function (i) { return '<path class="b-o" style="--r:' + (i * 45) + 'deg" d="M0 0C-16-20-14-52 0-70 14-52 16-20 0 0Z"/>'; });
    var inner = K.rep(8, function (i) { return '<path class="b-i" style="--r:' + (22.5 + i * 45) + 'deg" d="M0 0C-11-16-10-38 0-50 10-38 11-16 0 0Z"/>'; });
    return '<svg class="b-svg" viewBox="-80 -80 160 160" aria-hidden="true"><g class="b-outer" fill="#fffaf0" stroke="#c9a03c" stroke-width="1.4">' + outer + '</g><g class="b-inner" fill="#f7e7bd" stroke="#c9a03c" stroke-width="1.2">' + inner + '</g><circle class="b-core" r="10" fill="#c9a03c"/></svg>';
  }
  var divider = '<svg viewBox="0 0 120 30" aria-hidden="true"><path d="M8 15h40M72 15h40" stroke="#c9a03c" stroke-width=".8"/><path d="M60 4l4 11-4 11-4-11Z" fill="#c9a03c"/><circle cx="48" cy="15" r="1.6" fill="#c9a03c"/><circle cx="72" cy="15" r="1.6" fill="#c9a03c"/></svg>';
  window.THEME = {
    divider: divider,
    seal: K.seal({ outer: '#c9a03c', ring: '#fffaf0', inner: '#fffaf0', text: '#8a6a1e', mono: C.monogram, font: 'Cormorant SC, serif', size: 24, dash: '1 3' }),
    scratchShape: 'circle',
    burstColors: ['#c9a03c', '#f7e7bd', '#ffffff', '#e8c76a'],
    fx: { kind: 'dust', count: 22, colors: ['rgba(201,160,60,1)', 'rgba(232,199,106,1)'] },
    countDeco: '',
    gate: function (el, api) {
      el.innerHTML = '<div class="b-rays"></div><div class="g-box b-box"><button type="button" class="g-btn b-btn" aria-label="' + api.esc(api.t('tap')) + '">' + bud() + '</button>' +
        (C.invocation ? '<p class="g-inv">' + api.tx(C.invocation) + '</p>' : '') + '<p class="g-names">' + api.names() + '</p><p class="g-greet">' + api.guestLine + '</p><p class="g-tap">' + api.esc(api.t('tap')) + '</p></div><div class="b-glow"></div>';
      el.querySelector('.b-btn').addEventListener('click', function () {
        api.start(); el.classList.add('b-open');
        setTimeout(api.done, api.reduce ? 0 : 2800);
      });
    },
    hero: function () { return '<div class="b-hero"><img src="' + C.photos.hero + '" alt=""></div><div class="b-hero-shade"></div><div class="b-arch"></div>'; },
    scratch: function (g, W, label) {
      K.clipShape(g, W, 'circle');
      var gr = g.createLinearGradient(0, 0, W, W); gr.addColorStop(0, '#f4dd9a'); gr.addColorStop(.45, '#c9a03c'); gr.addColorStop(.55, '#e8c76a'); gr.addColorStop(1, '#8a6a1e');
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
      K.sparkle(g, W, 500, 'rgba(255,255,240,.35)');
      g.strokeStyle = 'rgba(255,250,240,.7)'; g.lineWidth = 1.5;
      [.44, .38].forEach(function (r) { g.beginPath(); g.arc(W / 2, W / 2, W * r, 0, 7); g.stroke(); });
      K.label(g, W, label, '#fffaf0', '600 26px "Cormorant SC", serif', W / 2);
    }
  };
})();
