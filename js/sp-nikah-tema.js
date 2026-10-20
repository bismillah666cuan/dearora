/* ==========================================================
   LIMA TEMA UNDANGAN PERNIKAHAN (hiasan SVG orisinal lewat kode):
   Islami Elegan · Rustic Boho · Malam Bintang · Adat Jawa · Klasik Royal.
   Semuanya memakai mesin bersama di sp-pernikahan.js (window.Nikah) sehingga isi, RSVP, dan akun pembeli sama.
   ========================================================== */
(function () {
  'use strict';
  var N = window.Nikah, B = window.Bunga; if (!N) return;
  function rng(s) { s = s >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }
  function svg(vb, isi, ekstra) { return '<svg viewBox="' + vb + '" aria-hidden="true" focusable="false"' + (ekstra || '') + '>' + isi + '</svg>'; }
  function pilih(a) { return a[Math.floor(Math.random() * a.length)]; }
  /* ---------- bentuk dasar ---------- */
  function oktagram(cx, cy, R, fill, stroke, sw, rot) {
    var p = [], i, a, r; for (i = 0; i < 16; i++) { a = (i / 16) * Math.PI * 2 + (rot || 0) - Math.PI / 2; r = i % 2 ? R * 0.62 : R; p.push(f(cx + Math.cos(a) * r) + ',' + f(cy + Math.sin(a) * r)); }
    return '<polygon points="' + p.join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') + '" stroke-width="' + (sw || 1) + '" stroke-linejoin="round"/>';
  }
  function kilau(x, y, r, fill, op) { return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(r / 12) + ')" d="M0 -12C1 -4 4 -1 12 0C4 1 1 4 0 12C-1 4 -4 1 -12 0C-4 -1 -1 -4 0 -12Z" fill="' + fill + '" fill-opacity="' + (op == null ? 1 : op) + '"/>'; }
  function titikEmas(R, n, w, h, warna) { var g = '', i; for (i = 0; i < n; i++) g += '<circle cx="' + f(R() * w) + '" cy="' + f(R() * h) + '" r="' + f(0.8 + R() * 1.6) + '" fill="' + warna + '" fill-opacity="' + f(0.35 + R() * 0.5) + '"/>'; return g; }
  function bulan(x, y, r, fill) { return '<path d="M' + f(x) + ' ' + f(y - r) + 'A' + r + ' ' + r + ' 0 1 0 ' + f(x + r * 0.9) + ' ' + f(y + r * 0.55) + 'A' + f(r * 0.78) + ' ' + f(r * 0.78) + ' 0 1 1 ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + fill + '"/>'; }
  function pemb(pusat, warna) { return svg('0 0 300 40', '<path class="gambar" d="M8 20H122" stroke="' + warna + '" stroke-width="1.2" fill="none"/><path class="gambar" d="M178 20H292" stroke="' + warna + '" stroke-width="1.2" fill="none"/><circle cx="130" cy="20" r="2" fill="' + warna + '"/><circle cx="170" cy="20" r="2" fill="' + warna + '"/><g transform="translate(150 20)">' + pusat + '</g>'); }
  function bundar(isi, bg) { return svg('0 0 120 120', '<circle cx="60" cy="60" r="58" fill="' + bg + '"/>' + isi); }

  /* =================== 1. ISLAMI ELEGAN =================== */
  var IS = { zam: '#0E6B57', dlm: '#0A4A3E', emas: '#C9A25A', mint: '#D6EBE1', krem: '#FBF6E9' };
  N.reg('uislami', {
    id: 'islami', nama: 'Undangan Islami Elegan', kicker: 'WALIMATUL URSY', buka: 'mihrab', gayaOk: 'islami', suaraBuka: 'lonceng', waktuBuka: [1900, 2700],
    atas: function () { return '<p class="nk-arab nk-rev" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p><p class="nk-salam-i nk-rev">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>'; },
    sudut: function () { var R = rng(5), g = '<path d="M0 12H190M12 0V190" stroke="' + IS.emas + '" stroke-width="1.4" fill="none" stroke-opacity=".7"/><path d="M0 22H150M22 0V150" stroke="' + IS.zam + '" stroke-width=".8" fill="none" stroke-opacity=".5"/>';
      g += '<circle cx="64" cy="64" r="76" fill="' + IS.mint + '" fill-opacity=".35" stroke="' + IS.emas + '" stroke-opacity=".6"/>' + oktagram(64, 64, 58, IS.mint, IS.zam, 1.4) + oktagram(64, 64, 36, IS.krem, IS.emas, 1.2, Math.PI / 8) + oktagram(64, 64, 14, IS.zam, 'none');
      g += oktagram(150, 34, 24, IS.mint, IS.zam, 1.1) + oktagram(150, 34, 10, IS.emas, 'none') + oktagram(34, 150, 24, IS.mint, IS.zam, 1.1) + oktagram(34, 150, 10, IS.emas, 'none') + oktagram(120, 120, 18, IS.krem, IS.emas, 1) + oktagram(196, 12, 9, IS.zam, 'none') + oktagram(12, 196, 9, IS.zam, 'none');
      g += '<path d="M64 64L150 34M64 64L34 150M64 64L120 120" stroke="' + IS.zam + '" stroke-opacity=".4" stroke-width=".9" fill="none"/>' + titikEmas(R, 12, 210, 210, IS.emas);
      return svg('0 0 220 220', g); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="150" fill="none" stroke="' + IS.emas + '" stroke-width="1.4"/><circle cx="200" cy="200" r="138" fill="none" stroke="' + IS.zam + '" stroke-opacity=".5" stroke-width="1"/><circle cx="200" cy="200" r="128" fill="none" stroke="' + IS.emas + '" stroke-opacity=".5"/>', i, a;
      for (i = 0; i < 16; i++) { a = (i / 16) * Math.PI * 2; g += oktagram(200 + Math.cos(a) * 160, 200 + Math.sin(a) * 160, i % 2 ? 11 : 16, i % 2 ? IS.emas : IS.zam, IS.krem, 1); }
      for (i = 0; i < 8; i++) { a = (i / 8) * Math.PI * 2 + Math.PI / 8; g += oktagram(200 + Math.cos(a) * 170, 200 + Math.sin(a) * 170, 22, IS.mint, IS.zam, 1.2) + oktagram(200 + Math.cos(a) * 170, 200 + Math.sin(a) * 170, 8, IS.emas, 'none'); }
      return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(oktagram(0, 0, 11, IS.zam, IS.emas, 1), IS.emas); },
    pengganti: function () { return bundar(oktagram(60, 60, 40, IS.krem, IS.zam, 2) + oktagram(60, 60, 24, IS.mint, IS.emas, 1.5, Math.PI / 8) + oktagram(60, 60, 9, IS.zam, 'none'), '#EAF4EE'); },
    sdt: function () { return svg('0 0 52 52', oktagram(26, 26, 22, IS.mint, IS.zam, 1.2) + oktagram(26, 26, 9, IS.emas, 'none')); },
    bingkai: function () { var g = '<path d="M14 320V118A106 106 0 0 1 226 118V320" fill="none" stroke="' + IS.emas + '" stroke-width="3"/><path d="M26 320V120A94 94 0 0 1 214 120V320" fill="none" stroke="' + IS.krem + '" stroke-opacity=".6" stroke-width="1.4"/>', i, a;
      for (i = 1; i < 6; i++) { a = Math.PI + (i / 6) * Math.PI; g += oktagram(120 + Math.cos(a) * 100, 118 + Math.sin(a) * 100, 8, IS.emas, 'none'); } return svg('0 0 240 320', g); },
    partikel: { palet: ['#E8C86A', '#F6E3A1', '#C9A25A', '#FFFFFF'], svg: function (w) { return svg('0 0 24 24', '<path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="' + w + '"/>'); }, n: 12 }
  });

  /* =================== 2. RUSTIC BOHO =================== */
  var RU = { sage: ['#B7C6A3', '#9CAF88', '#7F9670', '#6B8060'], terra: '#C97B5A', krem: '#F7EDDC', coklat: '#6B4E36', perak: '#A9BBA0' };
  function daunBulat(x, y, r, rot, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><ellipse cx="0" cy="' + f(-r) + '" rx="' + f(r * 0.62) + '" ry="' + f(r) + '" fill="' + col + '"/><path d="M0 0V' + f(-r * 1.9) + '" stroke="rgba(255,255,255,.35)" stroke-width=".8"/></g>'; }
  function bungaKering(x, y, r, col) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">', i, a; for (i = 0; i < 6; i++) { a = (i / 6) * Math.PI * 2; g += '<circle cx="' + f(Math.cos(a) * r) + '" cy="' + f(Math.sin(a) * r) + '" r="' + f(r * 0.7) + '" fill="' + col + '" fill-opacity=".9"/>'; } return g + '<circle r="' + f(r * 0.6) + '" fill="#8C5A3C"/></g>'; }
  function cabang(x0, y0, cx, cy, x1, y1, n, r, seed) { var R = rng(seed), g = '<path d="M' + x0 + ' ' + y0 + 'Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1 + '" fill="none" stroke="' + RU.coklat + '" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>', i, t, px, py, tx, ty, s;
    for (i = 1; i <= n; i++) { t = i / (n + 1); px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1; py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1; tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx); ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy); s = Math.atan2(ty, tx) * 180 / Math.PI + 90;
      g += daunBulat(px, py, r * (0.8 + R() * 0.5), s + 38 + R() * 12, RU.sage[i % 4]) + daunBulat(px, py, r * (0.8 + R() * 0.5), s - 38 - R() * 12, RU.sage[(i + 1) % 4]); } return g; }
  N.reg('urustik', {
    id: 'rustik', nama: 'Undangan Rustic Boho', kicker: 'we’re getting married', buka: 'amplop', gayaOk: 'rustik', suaraBuka: 'kertas',
    sudut: function () { var R = rng(9); return svg('0 0 260 260', cabang(-6, 34, 120, 6, 250, 120, 7, 17, 3) + cabang(34, -6, 6, 120, 120, 250, 7, 17, 5) + cabang(-4, -4, 70, 90, 150, 170, 4, 13, 8) + bungaKering(70, 70, 8, RU.terra) + bungaKering(150, 40, 6, '#E8C9A6') + bungaKering(40, 150, 6, '#E8C9A6') + bungaKering(110, 110, 7, RU.terra) + bungaKering(188, 84, 5, '#D9A388') + bungaKering(84, 188, 5, '#D9A388') + titikEmas(R, 6, 240, 240, '#C99A5B')); },
    karangan: function () { var g = '', i, a, x, y, R = rng(12); for (i = 0; i < 18; i++) { a = (i / 18) * Math.PI * 2; x = 200 + Math.cos(a) * 156; y = 200 + Math.sin(a) * 156; g += daunBulat(x, y, 24 + R() * 8, a * 180 / Math.PI + 90 + (i % 2 ? 28 : -28), RU.sage[i % 4]); }
      for (i = 0; i < 9; i++) { a = (i / 9) * Math.PI * 2 + 0.2; g += bungaKering(200 + Math.cos(a) * 158, 200 + Math.sin(a) * 158, 8 + R() * 3, i % 2 ? RU.terra : '#E8C9A6'); }
      return svg('0 0 400 400', '<circle cx="200" cy="200" r="134" fill="none" stroke="' + RU.coklat + '" stroke-opacity=".35" stroke-dasharray="3 5"/>' + g); },
    pembatas: function () { return pemb(daunBulat(-12, 4, 10, -70, RU.sage[1]) + daunBulat(12, 4, 10, 70, RU.sage[1]) + bungaKering(0, 0, 5, RU.terra), RU.coklat); },
    pengganti: function () { return bundar(daunBulat(60, 80, 34, -30, RU.sage[1]) + daunBulat(60, 80, 34, 30, RU.sage[2]) + daunBulat(60, 80, 30, 0, RU.sage[0]) + bungaKering(60, 40, 10, RU.terra), '#F2E6D2'); },
    sdt: function () { return svg('0 0 52 52', daunBulat(26, 40, 14, -30, RU.sage[1]) + daunBulat(26, 40, 14, 30, RU.sage[2]) + bungaKering(26, 20, 6, RU.terra)); },
    partikel: { palet: ['#9CAF88', '#B7C6A3', '#C97B5A', '#D9A388'], svg: function (w) { return svg('0 0 24 30', '<ellipse cx="12" cy="15" rx="8" ry="14" fill="' + w + '" fill-opacity=".9"/><path d="M12 2V28" stroke="rgba(255,255,255,.5)" stroke-width="1"/>'); }, n: 9 }
  });

  /* =================== 3. MALAM BINTANG =================== */
  var BT = { navy: '#0B1030', emas: '#E8C86A', pucat: '#F4EFE0' };
  function rasi(R, n, rad, cx, cy, w) { var p = [], g = '', i, a; for (i = 0; i < n; i++) { a = (i / n) * Math.PI * 2 + R() * 0.2; var rr = rad * (0.9 + R() * 0.2); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    g += '<polyline class="gambar" points="' + p.map(function (q) { return f(q[0]) + ',' + f(q[1]); }).concat([f(p[0][0]) + ',' + f(p[0][1])]).join(' ') + '" fill="none" stroke="' + BT.emas + '" stroke-opacity=".55" stroke-width="' + (w || 1) + '"/>'; p.forEach(function (q, i) { g += kilau(q[0], q[1], i % 3 ? 7 : 11, i % 3 ? BT.pucat : BT.emas); }); return g; }
  N.reg('ubintang', {
    id: 'bintang', nama: 'Undangan Malam Bintang', kicker: 'UNDER THE STARS', buka: 'bintang', gayaOk: 'bintang', suaraBuka: 'kerlip', waktuBuka: [2000, 2800],
    langit: function () { var R = rng(77), g = '<defs><radialGradient id="bgl" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#2B3475"/><stop offset=".6" stop-color="#121A4A"/><stop offset="1" stop-color="#070B24"/></radialGradient></defs><rect width="400" height="800" fill="url(#bgl)"/>', i, x, y, r;
      for (i = 0; i < 90; i++) { x = R() * 400; y = R() * 800; r = 0.5 + R() * 1.5; g += '<circle class="kerlip" style="animation-delay:' + f(R() * 5) + 's;animation-duration:' + f(2 + R() * 4) + 's" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + (i % 6 ? '#fff' : BT.emas) + '"/>'; }
      for (i = 0; i < 7; i++) g += '<g class="kerlip" style="animation-delay:' + f(R() * 4) + 's">' + kilau(R() * 400, R() * 700, 5 + R() * 5, BT.pucat, 0.9) + '</g>';
      return '<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + g + '</svg>'; },
    bingkai: function () { var R = rng(31), g = '<circle cx="150" cy="150" r="128" fill="none" stroke="' + BT.emas + '" stroke-opacity=".25" stroke-dasharray="2 6"/>' + rasi(R, 12, 112, 150, 150, 1.1); return svg('0 0 300 300', g); },
    sudut: function (p) { var R = rng(p.charCodeAt(0) * 7), g = rasi(R, 6, 70, 80, 80, 1) + rasi(R, 4, 34, 150, 40, 0.8) + kilau(30, 160, 6, BT.pucat) + kilau(190, 100, 5, BT.emas) + titikEmas(R, 14, 210, 210, BT.emas); return svg('0 0 220 220', g); },
    karangan: function () { var R = rng(21), g = '<circle cx="200" cy="200" r="150" fill="none" stroke="' + BT.emas + '" stroke-opacity=".5"/><circle cx="200" cy="200" r="140" fill="none" stroke="' + BT.emas + '" stroke-opacity=".25" stroke-dasharray="2 6"/>', i, a;
      for (i = 0; i < 28; i++) { a = (i / 28) * Math.PI * 2; g += kilau(200 + Math.cos(a) * 158, 200 + Math.sin(a) * 158, i % 4 ? 5 : 10, i % 4 ? BT.pucat : BT.emas); } g += bulan(200, 40, 24, BT.emas) + kilau(236, 34, 8, BT.pucat) + titikEmas(R, 20, 400, 400, BT.emas); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(bulan(0, 0, 9, BT.emas) + kilau(16, -2, 5, BT.pucat), BT.emas); },
    pengganti: function () { return bundar(bulan(52, 56, 26, BT.emas) + kilau(76, 40, 9, BT.pucat) + kilau(40, 88, 5, BT.pucat), '#1B2350'); },
    sdt: function () { return svg('0 0 52 52', kilau(26, 26, 20, BT.emas) + kilau(12, 40, 6, BT.pucat) + kilau(42, 12, 5, BT.pucat)); },
    partikel: { palet: ['#E8C86A', '#F4EFE0', '#FFFFFF'], svg: function (w) { return svg('0 0 24 24', '<path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="' + w + '"/>'); }, n: 14 }
  });

  /* =================== 4. ADAT JAWA =================== */
  var JW = { coklat: '#5A2E1A', marun: '#7A2A22', emas: '#D2A64B', krem: '#FBF1DC', soga: '#8B5A2B' };
  function kawung(cx, cy, r, fill, stroke) { var g = '', k; [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) { g += '<ellipse cx="' + f(cx + d[0] * r * 0.52) + '" cy="' + f(cy + d[1] * r * 0.52) + '" rx="' + f(d[0] ? r * 0.52 : r * 0.34) + '" ry="' + f(d[1] ? r * 0.52 : r * 0.34) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.1"/>'; }); return g + '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * 0.16) + '" fill="' + stroke + '"/>'; }
  function gunungan(w, h, fill, stroke) { return '<path d="M' + w * 0.5 + ' 0C' + w * 0.56 + ' ' + h * 0.16 + ' ' + w * 0.78 + ' ' + h * 0.3 + ' ' + w * 0.8 + ' ' + h * 0.58 + 'C' + w * 0.82 + ' ' + h * 0.82 + ' ' + w * 0.92 + ' ' + h * 0.9 + ' ' + w + ' ' + h + 'H0C' + w * 0.08 + ' ' + h * 0.9 + ' ' + w * 0.18 + ' ' + h * 0.82 + ' ' + w * 0.2 + ' ' + h * 0.58 + 'C' + w * 0.22 + ' ' + h * 0.3 + ' ' + w * 0.44 + ' ' + h * 0.16 + ' ' + w * 0.5 + ' 0Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.6"/><path d="M' + w * 0.5 + ' ' + h * 0.18 + 'V' + h * 0.9 + 'M' + w * 0.34 + ' ' + h * 0.5 + 'Q' + w * 0.5 + ' ' + h * 0.4 + ' ' + w * 0.66 + ' ' + h * 0.5 + 'M' + w * 0.28 + ' ' + h * 0.7 + 'Q' + w * 0.5 + ' ' + h * 0.58 + ' ' + w * 0.72 + ' ' + h * 0.7 + '" fill="none" stroke="' + stroke + '" stroke-width="1.1" stroke-opacity=".8"/>'; }
  N.reg('ujawa', {
    id: 'jawa', nama: 'Undangan Adat Jawa', kicker: 'SUGENG RAWUH', buka: 'kelir', gayaOk: 'jawa', suaraBuka: 'kenong', waktuBuka: [1900, 2700],
    bingkai: function () { return svg('0 0 120 150', gunungan(120, 150, JW.emas, JW.coklat) + kawung(60, 100, 28, '#F2D58C', JW.marun)); },
    sudut: function () { var R = rng(3), g = '<path d="M0 14H200M14 0V200" stroke="' + JW.emas + '" stroke-width="2" fill="none"/><path d="M0 24H160M24 0V160" stroke="' + JW.marun + '" stroke-opacity=".6" fill="none"/>' + kawung(70, 70, 54, '#F2D58C', JW.marun) + kawung(150, 40, 30, JW.krem, JW.soga) + kawung(40, 150, 30, JW.krem, JW.soga) + kawung(118, 118, 24, '#F2D58C', JW.marun) + titikEmas(R, 10, 210, 210, JW.emas); return svg('0 0 220 220', g); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="150" fill="none" stroke="' + JW.emas + '" stroke-width="2"/><circle cx="200" cy="200" r="138" fill="none" stroke="' + JW.marun + '" stroke-opacity=".55"/>', i, a; for (i = 0; i < 12; i++) { a = (i / 12) * Math.PI * 2; g += kawung(200 + Math.cos(a) * 162, 200 + Math.sin(a) * 162, 20, i % 2 ? JW.krem : '#F2D58C', JW.marun); } return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(kawung(0, 0, 12, '#F2D58C', JW.marun), JW.emas); },
    pengganti: function () { return bundar('<g transform="translate(32 18)">' + gunungan(56, 80, JW.emas, JW.coklat) + '</g>' + kawung(60, 86, 14, '#F2D58C', JW.marun), '#F7E7C6'); },
    sdt: function () { return svg('0 0 52 52', kawung(26, 26, 22, '#F2D58C', JW.marun)); },
    partikel: { palet: ['#FFFFFF', '#FFF8E7', '#FFFDF6'], svg: function (w) { var g = '', i; for (i = 0; i < 5; i++) g += '<ellipse cx="12" cy="6" rx="3.4" ry="6" transform="rotate(' + i * 72 + ' 12 12)" fill="' + w + '" stroke="rgba(160,130,60,.35)" stroke-width=".5"/>'; return svg('0 0 24 24', g + '<circle cx="12" cy="12" r="2" fill="#E9C46A"/>'); }, n: 12 }
  });

  /* =================== 5. KLASIK ROYAL =================== */
  var RY = { wine: '#5A1020', wine2: '#7B1E33', emas: '#C9A25A', krem: '#FBF4E6' };
  function fleur(x, y, s, fill) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')" fill="' + fill + '"><path d="M0 -22C7 -12 9 0 0 12C-9 0 -7 -12 0 -22Z"/><path d="M-3 4C-15 -7 -24 -4 -24 5C-24 13 -13 15 -6 11C-11 7 -11 2 -3 4Z"/><path d="M3 4C15 -7 24 -4 24 5C24 13 13 15 6 11C11 7 11 2 3 4Z"/><rect x="-10" y="11" width="20" height="4" rx="1.5"/><path d="M-5 15L0 24L5 15Z"/></g>'; }
  function gulir(x, y, s, rot, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + f(s) + ')" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-linecap="round"><path d="M0 0C12 -16 34 -16 38 -2C42 10 28 20 17 13C9 8 13 -2 21 0"/><path d="M0 0C-10 8 -8 20 4 24"/></g>'; }
  N.reg('uroyal', {
    id: 'royal', nama: 'Undangan Klasik Royal', kicker: 'THE ROYAL WEDDING', buka: 'tirai', gayaOk: 'royal', suaraBuka: 'tirai', waktuBuka: [2000, 2800],
    bingkai: function () { var g = '<rect x="8" y="8" width="184" height="244" rx="6" fill="none" stroke="' + RY.emas + '" stroke-width="2"/><rect x="16" y="16" width="168" height="228" rx="3" fill="none" stroke="' + RY.emas + '" stroke-opacity=".5"/>' + gulir(18, 18, 0.7, 0, RY.emas) + gulir(182, 18, 0.7, 90, RY.emas) + gulir(182, 242, 0.7, 180, RY.emas) + gulir(18, 242, 0.7, 270, RY.emas) + fleur(100, 40, 0.8, RY.emas); return svg('0 0 200 260', g); },
    sudut: function () { var R = rng(14), g = '<path d="M0 12H190M12 0V190" stroke="' + RY.emas + '" stroke-width="1.6" fill="none"/><path d="M0 22H150M22 0V150" stroke="' + RY.emas + '" stroke-opacity=".5" fill="none"/>' + gulir(26, 26, 1.5, 20, RY.emas) + gulir(26, 26, 1.1, 70, RY.emas) + gulir(70, 20, 0.8, 0, RY.emas) + gulir(20, 70, 0.8, 90, RY.emas) + fleur(112, 112, 0.9, RY.emas) + titikEmas(R, 10, 200, 200, RY.emas); return svg('0 0 220 220', g); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="140" fill="none" stroke="' + RY.emas + '" stroke-width="1.6"/><circle cx="200" cy="200" r="130" fill="none" stroke="' + RY.emas + '" stroke-opacity=".45"/>', i, a, x, y; for (i = 0; i < 26; i++) { a = (i / 26) * Math.PI * 2; x = 200 + Math.cos(a) * 156; y = 200 + Math.sin(a) * 156; g += (B ? B.daun(x, y, 34, a * 180 / Math.PI + 90 + (i % 2 ? 32 : -32), RY.emas) : ''); } g += fleur(200, 30, 1.2, RY.wine2) + fleur(200, 372, 0.9, RY.wine2); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(fleur(0, 0, 0.55, RY.wine2) + gulir(-30, 2, 0.3, 180, RY.emas) + gulir(30, 2, 0.3, 0, RY.emas), RY.emas); },
    pengganti: function () { return bundar(fleur(60, 60, 1.5, RY.wine2) + '<circle cx="60" cy="60" r="50" fill="none" stroke="' + RY.emas + '"/>', '#F7EBD3'); },
    sdt: function () { return svg('0 0 52 52', fleur(26, 26, 0.9, RY.wine2)); },
    partikel: { palet: ['#E3C27E', '#C9A25A', '#F4E3B5', '#FFFFFF'], svg: function (w) { return svg('0 0 24 24', '<path d="M12 1L22 12L12 23L2 12Z" fill="' + w + '" fill-opacity=".9"/>'); }, n: 10 }
  });
})();
