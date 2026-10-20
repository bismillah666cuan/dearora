/* ==========================================================
   PUSTAKA HIASAN BUNGA (SVG orisinal, dibuat lewat kode) untuk Undangan Pernikahan:
   mawar, daun, ranting, sudut bunga, karangan (wreath), pembatas emas, tirai bunga, dan kelopak yang berguguran.
   ========================================================== */
(function () {
  'use strict';
  var P = { blush: ['#F9D9DF', '#F3B9C6', '#EA93A9', '#D66D8A'], peach: ['#FCE5D8', '#F7C9B4', '#EFA78F', '#DC8A72'], ivory: ['#FFFEFA', '#F8EEE0', '#EBD9C3', '#D9BE9E'], rose: ['#F2B3C0', '#E58CA3', '#CF6482', '#B4466A'] };
  var DAUN = ['#A9C3A4', '#8DAE89', '#6F9470'], EMAS = '#C9A25A';
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }
  function kelopak(len, warna, rot, op, lebar) {
    var w = (lebar || 0.55) * len;
    return '<path transform="rotate(' + f(rot) + ')" d="M0 0C' + f(-w) + ' ' + f(-len * 0.12) + ' ' + f(-w * 0.92) + ' ' + f(-len * 0.98) + ' 0 ' + f(-len) + 'C' + f(w * 0.92) + ' ' + f(-len * 0.98) + ' ' + f(w) + ' ' + f(-len * 0.12) + ' 0 0Z" fill="' + warna + '" fill-opacity="' + (op || 0.95) + '" stroke="rgba(120,40,70,.10)" stroke-width=".6"/>';
  }
  /** Mawar/peoni: tiga lapis kelopak + pusat berputar. */
  function mawar(x, y, r, pal, rot, acak) {
    var R = acak || rng(Math.round(x * 7 + y * 13 + r)), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')">', i;
    for (i = 0; i < 8; i++) g += kelopak(r * 0.98, pal[0], i * 45 + R() * 10, 0.96, 0.5);
    for (i = 0; i < 6; i++) g += kelopak(r * 0.74, pal[1], i * 60 + 18 + R() * 10, 0.97, 0.52);
    for (i = 0; i < 5; i++) g += kelopak(r * 0.52, pal[2], i * 72 + 6 + R() * 10, 0.98, 0.55);
    g += '<circle r="' + f(r * 0.2) + '" fill="' + pal[3] + '"/><path d="M0 ' + f(-r * 0.2) + 'C' + f(r * 0.2) + ' ' + f(-r * 0.2) + ' ' + f(r * 0.22) + ' ' + f(r * 0.1) + ' 0 ' + f(r * 0.16) + 'C' + f(-r * 0.14) + ' ' + f(r * 0.2) + ' ' + f(-r * 0.2) + ' ' + f(-r * 0.04) + ' ' + f(-r * 0.04) + ' ' + f(-r * 0.12) + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="' + f(r * 0.04) + '" stroke-linecap="round"/>';
    return g + '</g>';
  }
  function kuncup(x, y, r, rot, pal) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')">' + kelopak(r * 1.5, pal[1], -22, 0.95, 0.4) + kelopak(r * 1.5, pal[1], 22, 0.95, 0.4) + kelopak(r * 1.7, pal[0], 0, 0.98, 0.42) +
      '<path d="M' + f(-r * 0.5) + ' 2Q0 ' + f(r * 0.8) + ' ' + f(r * 0.5) + ' 2L0 ' + f(-r * 0.2) + 'Z" fill="' + DAUN[1] + '"/></g>';
  }
  function daun(x, y, len, rot, warna) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><path d="M0 0C' + f(len * 0.25) + ' ' + f(-len * 0.3) + ' ' + f(len * 0.75) + ' ' + f(-len * 0.3) + ' ' + f(len) + ' 0C' + f(len * 0.75) + ' ' + f(len * 0.3) + ' ' + f(len * 0.25) + ' ' + f(len * 0.3) + ' 0 0Z" fill="' + warna + '"/><path d="M2 0H' + f(len * 0.92) + '" stroke="rgba(255,255,255,.4)" stroke-width=".8"/></g>';
  }
  /** Ranting melengkung (kurva kuadrat) dengan daun berselang-seling. */
  function ranting(x0, y0, cx, cy, x1, y1, n, ukuran, seed) {
    var R = rng(seed || 7), g = '<path d="M' + x0 + ' ' + y0 + 'Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1 + '" fill="none" stroke="' + DAUN[2] + '" stroke-width="2.2" stroke-linecap="round"/>', i, t, px, py, tx, ty, sudut;
    for (i = 1; i <= n; i++) {
      t = i / (n + 1); px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1; py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx); ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy); sudut = Math.atan2(ty, tx) * 180 / Math.PI;
      g += daun(px, py, ukuran * (0.8 + R() * 0.5), sudut + (i % 2 ? -42 : 42) + R() * 14, DAUN[i % 3]);
    }
    return g;
  }
  function titik(R, n, w, h) { var g = '', i; for (i = 0; i < n; i++) g += '<circle cx="' + f(R() * w) + '" cy="' + f(R() * h) + '" r="' + f(1 + R() * 2) + '" fill="' + EMAS + '" fill-opacity="' + f(0.4 + R() * 0.5) + '"/>'; return g; }
  /** Rangkaian bunga di sudut (sumbu di kiri-atas); dicerminkan lewat CSS untuk sudut lain. */
  function sudut(seed) {
    var R = rng(seed || 11), g = '<svg viewBox="0 0 320 320" aria-hidden="true" focusable="false">';
    g += ranting(-10, 46, 150, 6, 292, 150, 6, 34, 3) + ranting(46, -10, 8, 150, 150, 296, 6, 34, 5) + ranting(-6, -6, 90, 100, 190, 200, 4, 26, 9);
    g += mawar(74, 74, 60, P.blush, 10, R) + mawar(178, 60, 36, P.peach, -20, R) + mawar(58, 182, 36, P.blush, 30, R) + mawar(132, 136, 28, P.ivory, 5, R);
    g += kuncup(250, 112, 12, 70, P.rose) + kuncup(104, 250, 12, 160, P.rose) + kuncup(214, 160, 10, 120, P.peach) + kuncup(160, 220, 10, 200, P.peach);
    g += daun(120, 84, 30, 25, DAUN[0]) + daun(84, 122, 30, 65, DAUN[1]) + titik(R, 16, 300, 300) + '<path d="M-4 90Q70 70 150 110T300 70" fill="none" stroke="' + EMAS + '" stroke-opacity=".5" stroke-width="1"/>';
    return g + '</svg>';
  }
  /** Karangan melingkar (wreath) untuk bingkai monogram/foto. */
  function karangan(seed) {
    var R = rng(seed || 21), g = '<svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">', i, a, x, y, n = 16, pal = [P.blush, P.peach, P.ivory, P.rose];
    g += '<circle cx="200" cy="200" r="132" fill="none" stroke="' + EMAS + '" stroke-opacity=".55" stroke-width="1.2"/><circle cx="200" cy="200" r="126" fill="none" stroke="' + EMAS + '" stroke-opacity=".3" stroke-width=".8"/>';
    for (i = 0; i < n * 2; i++) { a = (i / (n * 2)) * Math.PI * 2; x = 200 + Math.cos(a) * 160; y = 200 + Math.sin(a) * 160; g += daun(x, y, 34 + R() * 14, a * 180 / Math.PI + 90 + (i % 2 ? 30 : -30), DAUN[i % 3]); }
    for (i = 0; i < n; i++) { a = (i / n) * Math.PI * 2 + 0.1; x = 200 + Math.cos(a) * 158; y = 200 + Math.sin(a) * 158; g += (i % 4 === 3) ? kuncup(x, y, 10, a * 180 / Math.PI + 90, P.rose) : mawar(x, y, 22 + R() * 14, pal[i % 4], R() * 360, R); }
    g += mawar(200, 42, 36, P.blush, 0, R) + mawar(200, 358, 32, P.peach, 40, R) + titik(R, 24, 400, 400);
    return g + '</svg>';
  }
  /** Garis pembatas emas dengan mawar kecil di tengah. */
  function pembatas() {
    return '<svg viewBox="0 0 300 40" aria-hidden="true" focusable="false"><path class="gambar" d="M8 20H118" stroke="' + EMAS + '" stroke-width="1.2" fill="none"/><path class="gambar" d="M182 20H292" stroke="' + EMAS + '" stroke-width="1.2" fill="none"/>' +
      daun(128, 20, 18, -20, DAUN[0]) + daun(172, 20, 18, 200, DAUN[0]) + mawar(150, 20, 13, P.blush, 0) + '<circle cx="124" cy="20" r="2" fill="' + EMAS + '"/><circle cx="176" cy="20" r="2" fill="' + EMAS + '"/></svg>';
  }
  /** Tirai bunga menggantung di bagian atas layar. */
  function tirai(seed) {
    var R = rng(seed || 31), g = '<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">', i, x, y;
    g += ranting(-10, 14, 100, 78, 200, 34, 7, 22, 4) + ranting(200, 34, 300, -4, 410, 22, 7, 22, 6);
    [[44, 38, 20, P.blush], [112, 50, 16, P.peach], [200, 36, 24, P.blush], [284, 30, 16, P.ivory], [350, 26, 20, P.peach]].forEach(function (b, k) { g += mawar(b[0], b[1], b[2], b[3], k * 40, R); });
    for (i = 0; i < 6; i++) { x = 30 + i * 68 + R() * 20; y = 50 + R() * 20; g += '<path d="M' + f(x) + ' ' + f(y) + 'q4 ' + f(14 + R() * 14) + ' 0 ' + f(26 + R() * 14) + '" stroke="' + DAUN[2] + '" stroke-width="1.4" fill="none"/>' + kuncup(x, y + 34 + R() * 12, 7, 180, P.rose); }
    return g + titik(R, 12, 400, 100) + '</svg>';
  }
  /** Satu kelopak untuk efek berguguran (warna acak dari palet). */
  function kelopakJatuh(warna) { return '<svg viewBox="0 0 24 30" aria-hidden="true" focusable="false"><path d="M12 0C22 6 24 18 12 30C0 18 2 6 12 0Z" fill="' + warna + '" fill-opacity=".9"/><path d="M12 4Q13 16 12 27" stroke="rgba(255,255,255,.45)" stroke-width="1" fill="none"/></svg>'; }
  /** Mawar tunggal dalam lingkaran (pengganti foto bila tidak ada foto). */
  function mawarTunggal(seed) { var R = rng(seed || 5); return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + daun(60, 60, 44, -35, DAUN[1]) + daun(60, 60, 44, 215, DAUN[1]) + daun(60, 60, 40, -90, DAUN[0]) + mawar(60, 56, 34, P.blush, 8, R) + '</svg>'; }
  window.Bunga = { mawar: mawar, kuncup: kuncup, daun: daun, ranting: ranting, sudut: sudut, karangan: karangan, pembatas: pembatas, tirai: tirai, kelopakJatuh: kelopakJatuh, mawarTunggal: mawarTunggal, palet: ['#F9D9DF', '#F3B9C6', '#EA93A9', '#FCE5D8', '#F7C9B4', '#FFFEFA'] };
})();
