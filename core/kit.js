/* Small helpers shared by the design themes (theme.js). Pure functions that return SVG/HTML strings or paint canvases. */
window.KIT = (function () {
  function rep(n, fn) { var s = ''; for (var i = 0; i < n; i++) s += fn(i, n); return s; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function f(n) { return Math.round(n * 10) / 10; }
  function petalRing(n, r1, r2, w, attrs) {
    return rep(n, function (i) {
      return '<path ' + (attrs || '') + ' transform="rotate(' + f(360 / n * i) + ')" d="M0 ' + -r1 + 'C' + w + ' ' + -(r1 + r2) / 2 + ' ' + f(w * .5) + ' ' + -r2 + ' 0 ' + -r2 + 'C' + f(-w * .5) + ' ' + -r2 + ' ' + -w + ' ' + -(r1 + r2) / 2 + ' 0 ' + -r1 + 'Z"/>';
    });
  }
  function dots(n, r, size, attrs) {
    return rep(n, function (i) { var a = i / n * Math.PI * 2; return '<circle ' + (attrs || '') + ' cx="' + f(Math.sin(a) * r) + '" cy="' + f(-Math.cos(a) * r) + '" r="' + size + '"/>'; });
  }
  // Circular seal: outer colour, ring colour, inner colour, text (monogram) and an optional centre motif (SVG string drawn in a -50..50 box).
  function seal(o) {
    return '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="' + o.outer + '"/>' +
      '<circle cx="100" cy="100" r="86" fill="none" stroke="' + o.ring + '" stroke-width="2" stroke-dasharray="' + (o.dash || '3 5') + '"/>' +
      '<circle cx="100" cy="100" r="76" fill="' + o.inner + '"/>' + (o.motif ? '<g transform="translate(100 88) scale(.9)">' + o.motif + '</g>' : '') +
      '<text x="100" y="' + (o.motif ? 152 : 112) + '" text-anchor="middle" font-family="' + (o.font || 'serif') + '" font-size="' + (o.size || 22) + '" fill="' + o.text + '" letter-spacing="2">' + o.mono + '</text></svg>';
  }
  function lotus(fill, stroke) {
    return '<g fill="' + fill + '" stroke="' + (stroke || 'none') + '" stroke-width="1.5"><path d="M0 30C-12 14-12-8 0-30 12-8 12 14 0 30Z"/><path d="M0 30C-22 24-32 6-30-14-14-8-4 8 0 30Z"/><path d="M0 30C22 24 32 6 30-14 14-8 4 8 0 30Z"/><path d="M0 30C-28 32-44 20-48 4-28 2-12 14 0 30Z" opacity=".8"/><path d="M0 30C28 32 44 20 48 4 28 2 12 14 0 30Z" opacity=".8"/></g>';
  }
  function swastik(c) { return '<g stroke="' + c + '" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-22 -22V0H22V22M22 -22H0V22H-22"/><path d="M-22 -22H-10M22 -22V-10M22 22H10M-22 22V10"/></g><g fill="' + c + '"><circle cx="-11" cy="-11" r="3"/><circle cx="11" cy="-11" r="3"/><circle cx="11" cy="11" r="3"/><circle cx="-11" cy="11" r="3"/></g>'; }
  function scatter(n, fn) { return rep(n, function (i) { return fn(i, rnd(0, 100).toFixed(1), rnd(0, 100).toFixed(1), rnd(0, 1)); }); }
  function wordmark(api, C) { return api.names(); }

  // Scratch-card painting helpers (canvas 2D). The painted (opaque) area is what the guest must scratch.
  function clipShape(g, W, shape) {
    g.beginPath();
    if (shape === 'circle') g.arc(W / 2, W / 2, W / 2, 0, 7);
    else if (shape === 'diamond') { g.moveTo(W / 2, 0); g.lineTo(W, W / 2); g.lineTo(W / 2, W); g.lineTo(0, W / 2); g.closePath(); }
    else if (shape === 'arch') { g.moveTo(0, W); g.lineTo(0, W * .4); g.quadraticCurveTo(0, 0, W / 2, 0); g.quadraticCurveTo(W, 0, W, W * .4); g.lineTo(W, W); g.closePath(); }
    else if (shape === 'leaf') { g.moveTo(0, W); g.quadraticCurveTo(0, 0, W, 0); g.quadraticCurveTo(W, W, 0, W); }
    else g.rect(0, 0, W, W);
    g.clip();
  }
  function label(g, W, text, color, font, y) {
    g.fillStyle = color; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, y || W / 2);
  }
  function sparkle(g, W, n, color) { for (var i = 0; i < n; i++) { g.fillStyle = color || 'rgba(255,255,255,' + (Math.random() * .5).toFixed(2) + ')'; g.fillRect(Math.random() * W, Math.random() * W, 2, 2); } }

  return { rep: rep, rnd: rnd, petalRing: petalRing, dots: dots, seal: seal, lotus: lotus, swastik: swastik, scatter: scatter, wordmark: wordmark, clipShape: clipShape, label: label, sparkle: sparkle };
})();
