/* ==========================================================
   EMPAT TEMA UNDANGAN ACARA KELUARGA (hiasan SVG orisinal): khitanan (Sultan Cilik, Islami Ceria) dan syukuran (Tumpeng & Doa, Rumah Baru).
   Memakai mesin bersama sp-pernikahan.js dalam mode "acara": satu tokoh (anak atau tuan rumah), susunan acara, petunjuk lokasi, siaran langsung.
   ========================================================== */
(function () {
  'use strict';
  var N = window.Nikah; if (!N) return;
  function rng(s) { s = s >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }
  function svg(vb, isi, ekstra) { return '<svg viewBox="' + vb + '" aria-hidden="true" focusable="false"' + (ekstra || '') + '>' + isi + '</svg>'; }
  function bintang5(x, y, r, fill, stroke) { var p = [], i, a, rr; for (i = 0; i < 10; i++) { a = (i / 10) * Math.PI * 2 - Math.PI / 2; rr = i % 2 ? r * 0.45 : r; p.push(f(x + Math.cos(a) * rr) + ',' + f(y + Math.sin(a) * rr)); } return '<polygon points="' + p.join(' ') + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1"' : '') + ' stroke-linejoin="round"/>'; }
  function bulanSabit(x, y, r, fill) { return '<path d="M' + f(x) + ' ' + f(y - r) + 'A' + r + ' ' + r + ' 0 1 0 ' + f(x + r * 0.9) + ' ' + f(y + r * 0.55) + 'A' + f(r * 0.78) + ' ' + f(r * 0.78) + ' 0 1 1 ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + fill + '"/>'; }
  function titik(R, n, w, h, warna) { var g = '', i; for (i = 0; i < n; i++) g += '<circle cx="' + f(R() * w) + '" cy="' + f(R() * h) + '" r="' + f(1 + R() * 1.8) + '" fill="' + warna + '" fill-opacity="' + f(0.4 + R() * 0.5) + '"/>'; return g; }
  function pemb(pusat, warna) { return svg('0 0 300 40', '<path class="gambar" d="M8 20H122" stroke="' + warna + '" stroke-width="1.2" fill="none"/><path class="gambar" d="M178 20H292" stroke="' + warna + '" stroke-width="1.2" fill="none"/><circle cx="130" cy="20" r="2" fill="' + warna + '"/><circle cx="170" cy="20" r="2" fill="' + warna + '"/><g transform="translate(150 20)">' + pusat + '</g>'); }
  function bundar(isi, bg) { return svg('0 0 120 120', '<circle cx="60" cy="60" r="58" fill="' + bg + '"/>' + isi); }
  /* bendera segitiga (bunting) sepanjang kurva kuadrat */
  function bendera(x0, y0, cx, cy, x1, y1, n, cols) { var g = '<path d="M' + x0 + ' ' + y0 + 'Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1 + '" fill="none" stroke="#6B5B3A" stroke-width="1.6"/>', i, t, px, py; for (i = 1; i <= n; i++) { t = i / (n + 1); px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1; py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1; g += '<polygon points="' + f(px - 11) + ',' + f(py) + ' ' + f(px + 11) + ',' + f(py) + ' ' + f(px) + ',' + f(py + 26) + '" fill="' + cols[i % cols.length] + '" stroke="rgba(0,0,0,.12)"/>'; } return g; }

  /* =================== SULTAN CILIK (khitanan) =================== */
  var SC = { navy: '#14307A', biru: '#2547B5', emas: '#E8B93A', merah: '#D64545', krem: '#FFF7E0' };
  function mahkota() { return svg('0 0 200 150', '<defs><linearGradient id="gmk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE59A"/><stop offset=".55" stop-color="#E8B93A"/><stop offset="1" stop-color="#B8841C"/></linearGradient></defs><rect x="30" y="108" width="140" height="28" rx="6" fill="url(#gmk)" stroke="#9A6E14"/><path d="M30 110L20 40L64 80L100 22L136 80L180 40L170 110Z" fill="url(#gmk)" stroke="#9A6E14" stroke-linejoin="round"/><circle cx="20" cy="36" r="9" fill="#FFE59A" stroke="#9A6E14"/><circle cx="100" cy="16" r="9" fill="#FFE59A" stroke="#9A6E14"/><circle cx="180" cy="36" r="9" fill="#FFE59A" stroke="#9A6E14"/><circle cx="62" cy="122" r="7" fill="' + SC.merah + '"/><circle cx="100" cy="122" r="8" fill="' + SC.biru + '"/><circle cx="138" cy="122" r="7" fill="' + SC.merah + '"/><path d="M44 104L40 66M156 104L160 66M100 104V46" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none"/>'); }
  N.reg('usultan', {
    id: 'sultan', mode: 'acara', nama: 'Undangan Sultan Cilik', kicker: 'WALIMATUL KHITAN', judulTokoh: 'Sang Jagoan', buka: 'mahkota', gayaOk: 'sultan', suaraBuka: 'fanfare', waktuBuka: [1900, 2700],
    atas: function () { return '<p class="nk-arab nk-rev" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>'; },
    mahkota: mahkota,
    sudut: function (p) { var R = rng(p.charCodeAt(0) * 3), c = [SC.biru, SC.emas, SC.merah, SC.krem]; return svg('0 0 240 170', bendera(-6, 14, 120, 66, 246, 24, 6, c) + bendera(-6, 52, 90, 100, 190, 70, 4, [SC.emas, SC.biru, SC.merah]) + bintang5(40, 120, 12, SC.emas, '#B8841C') + bintang5(150, 130, 8, SC.biru) + titik(R, 12, 230, 160, SC.emas)); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="148" fill="none" stroke="' + SC.emas + '" stroke-width="3"/><circle cx="200" cy="200" r="136" fill="none" stroke="' + SC.biru + '" stroke-opacity=".5" stroke-dasharray="3 7" stroke-width="2"/>', i, a; for (i = 0; i < 16; i++) { a = (i / 16) * Math.PI * 2; g += bintang5(200 + Math.cos(a) * 160, 200 + Math.sin(a) * 160, i % 4 ? 8 : 13, i % 4 ? SC.emas : SC.merah, '#B8841C'); } return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(bintang5(0, 0, 11, SC.emas, '#B8841C'), SC.emas); },
    pengganti: function () { return bundar('<g transform="translate(20 22) scale(.4)">' + mahkota().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>' + bintang5(60, 92, 8, SC.emas), '#DCE6FF'); },
    sdt: function () { return svg('0 0 52 52', bintang5(26, 26, 20, SC.emas, '#B8841C')); },
    partikel: { palet: ['#F6D77A', '#E8B93A', '#FFFFFF', '#7FA0FF', '#F29A9A'], svg: function (w) { return svg('0 0 24 24', bintang5(12, 12, 11, w)); }, n: 12 }
  });

  /* =================== ISLAMI CERIA (khitanan) =================== */
  var IC = { teal: '#1F8A70', dlm: '#0F5C4B', kuning: '#F6C945', oren: '#F28C38', krem: '#FFF9E6', mint: '#CDEFE3' };
  function lentera(i) { var c = [IC.oren, IC.kuning, IC.teal][i % 3]; return svg('0 0 60 120', '<path d="M30 0V12" stroke="#7A5A22" stroke-width="2"/><path d="M20 12H40L44 22H16Z" fill="#B8841C"/><path d="M14 22C6 40 6 78 14 96H46C54 78 54 40 46 22Z" fill="' + c + '" stroke="#7A5A22" stroke-width="1.5"/><path d="M30 22V96M20 26C14 46 14 74 20 94M40 26C46 46 46 74 40 94" stroke="rgba(255,255,255,.55)" stroke-width="1.4" fill="none"/><ellipse cx="30" cy="60" rx="9" ry="16" fill="#FFF3C0" fill-opacity=".85"/><path d="M14 96H46L42 104H18Z" fill="#B8841C"/><path d="M30 104V118M24 104L22 116M36 104L38 116" stroke="#B8841C" stroke-width="1.6"/>'); }
  N.reg('ulentera', {
    id: 'lentera', mode: 'acara', nama: 'Undangan Islami Ceria', kicker: 'WALIMATUL KHITAN', judulTokoh: 'Si Kecil yang Berbahagia', buka: 'lentera', gayaOk: 'lentera', suaraBuka: 'lonceng', waktuBuka: [1900, 2700],
    atas: function () { return '<p class="nk-arab nk-rev" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p><p class="nk-salam-i nk-rev">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>'; },
    lentera: lentera,
    sudut: function (p) { var R = rng(p.charCodeAt(0) * 5); return svg('0 0 220 190', '<g transform="translate(14 -6) scale(.8)">' + lentera(0).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g><g transform="translate(70 -14) scale(.62)">' + lentera(2).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>' + bulanSabit(160, 70, 22, IC.kuning) + bintang5(188, 40, 9, IC.kuning) + bintang5(120, 110, 7, IC.oren) + bintang5(30, 140, 8, IC.teal) + titik(R, 12, 210, 180, IC.kuning)); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="150" fill="none" stroke="' + IC.kuning + '" stroke-width="3"/><circle cx="200" cy="200" r="138" fill="none" stroke="' + IC.teal + '" stroke-opacity=".5" stroke-dasharray="2 7" stroke-width="2"/>', i, a; for (i = 0; i < 14; i++) { a = (i / 14) * Math.PI * 2; g += i % 2 ? bintang5(200 + Math.cos(a) * 160, 200 + Math.sin(a) * 160, 10, IC.kuning, '#C99A1C') : bulanSabit(200 + Math.cos(a) * 160, 200 + Math.sin(a) * 160, 13, IC.oren); } return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(bulanSabit(-4, 2, 9, IC.kuning) + bintang5(12, -2, 6, IC.oren), IC.teal); },
    pengganti: function () { return bundar(bulanSabit(54, 58, 28, IC.kuning) + bintang5(80, 40, 10, IC.oren), '#CDEFE3'); },
    sdt: function () { return svg('0 0 52 52', '<g transform="translate(10 0) scale(.36)">' + lentera(1).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>'); },
    partikel: { palet: ['#F6C945', '#F28C38', '#FFFFFF', '#9BE0C6'], svg: function (w) { return svg('0 0 24 24', bintang5(12, 12, 11, w)); }, n: 12 }
  });

  /* =================== TUMPENG & DOA BERSAMA (syukuran) =================== */
  var TP = { daun: ['#4E9A55', '#2E7D3C', '#1F5A2B'], kunyit: '#F2B632', cabai: '#D9432B', krem: '#FFF8E4', coklat: '#7A5230', oren: '#F08A24' };
  function daunPisang(x, y, p, rot, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><path d="M0 0C' + f(p * 0.3) + ' ' + f(-p * 0.22) + ' ' + f(p * 0.75) + ' ' + f(-p * 0.2) + ' ' + f(p) + ' 0C' + f(p * 0.75) + ' ' + f(p * 0.2) + ' ' + f(p * 0.3) + ' ' + f(p * 0.22) + ' 0 0Z" fill="' + col + '"/><path d="M2 0H' + f(p * 0.97) + '" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>' + [0.2, 0.4, 0.6, 0.8].map(function (t) { return '<path d="M' + f(p * t) + ' 0L' + f(p * t + p * 0.12) + ' ' + f(-p * 0.14) + 'M' + f(p * t) + ' 0L' + f(p * t + p * 0.12) + ' ' + f(p * 0.14) + '" stroke="rgba(255,255,255,.28)" stroke-width=".9"/>'; }).join('') + '</g>'; }
  function marigold(x, y, r, col) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">', i; for (i = 0; i < 10; i++) g += '<ellipse cx="0" cy="' + f(-r * 0.62) + '" rx="' + f(r * 0.3) + '" ry="' + f(r * 0.5) + '" transform="rotate(' + i * 36 + ')" fill="' + col + '" fill-opacity=".92"/>'; return g + '<circle r="' + f(r * 0.3) + '" fill="#C2641A"/></g>'; }
  function tumpeng() { var g = '<ellipse cx="120" cy="192" rx="112" ry="28" fill="' + TP.daun[1] + '"/><ellipse cx="120" cy="188" rx="100" ry="22" fill="' + TP.daun[0] + '"/><path d="M30 190H210M50 180L40 198M80 176L72 202M120 174V204M160 176L168 202M190 180L200 198" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/>', i;
    g += '<defs><linearGradient id="gtp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="' + TP.kunyit + '"/></linearGradient></defs><path d="M120 22L194 184Q120 206 46 184Z" fill="url(#gtp)" stroke="#C98B14" stroke-width="1.5" stroke-linejoin="round"/>';
    for (i = 0; i < 46; i++) g += '<circle cx="' + f(66 + ((i * 53) % 108)) + '" cy="' + f(70 + ((i * 37) % 110)) + '" r="1.3" fill="#fff" fill-opacity=".55"/>';
    g += '<path d="M120 6C128 16 130 26 120 34C110 26 112 16 120 6Z" fill="' + TP.cabai + '"/>';
    for (i = 0; i < 5; i++) g += '<ellipse cx="' + (46 + i * 12) + '" cy="' + (192 - (i % 2) * 4) + '" rx="7" ry="4" fill="#BFE3A5" stroke="#6AA84F"/>';
    g += '<circle cx="190" cy="196" r="7" fill="' + TP.coklat + '"/><circle cx="204" cy="190" r="6" fill="#9C6B3C"/><circle cx="176" cy="200" r="5" fill="#B9773A"/>' + marigold(30, 186, 9, TP.oren);
    return svg('0 0 240 230', g); }
  N.reg('utumpeng', {
    id: 'tumpeng', mode: 'acara', nama: 'Undangan Tumpeng & Doa', kicker: 'TASYAKURAN', judulTokoh: 'Yang Berbahagia', buka: 'tumpeng', gayaOk: 'tumpeng', suaraBuka: 'kenong', waktuBuka: [1800, 2600],
    tumpeng: tumpeng,
    sudut: function (p) { var R = rng(p.charCodeAt(0) * 9); return svg('0 0 240 240', daunPisang(-6, 40, 200, 12, TP.daun[1]) + daunPisang(-4, 8, 170, 38, TP.daun[0]) + daunPisang(30, -6, 190, 62, TP.daun[2]) + marigold(70, 70, 14, TP.oren) + marigold(118, 44, 10, '#F7B733') + marigold(48, 118, 10, '#F7B733') + titik(R, 8, 230, 230, TP.kunyit)); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="140" fill="none" stroke="' + TP.kunyit + '" stroke-width="2.5"/>', i, a, R = rng(3); for (i = 0; i < 14; i++) { a = (i / 14) * Math.PI * 2; g += daunPisang(200 + Math.cos(a) * 150, 200 + Math.sin(a) * 150, 46 + R() * 12, a * 180 / Math.PI + 90 + (i % 2 ? 40 : -40), TP.daun[i % 3]); } for (i = 0; i < 8; i++) { a = (i / 8) * Math.PI * 2 + 0.2; g += marigold(200 + Math.cos(a) * 158, 200 + Math.sin(a) * 158, 11, i % 2 ? TP.oren : '#F7B733'); } return svg('0 0 400 400', g); },
    pembatas: function () { return pemb(daunPisang(-14, 4, 16, 200, TP.daun[1]) + daunPisang(14, 4, 16, -20, TP.daun[1]) + marigold(0, 0, 6, TP.oren), TP.daun[1]); },
    pengganti: function () { return bundar('<g transform="translate(18 14) scale(.36)">' + tumpeng().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>', '#F1F8E8'); },
    sdt: function () { return svg('0 0 52 52', daunPisang(6, 40, 34, -50, TP.daun[1]) + marigold(30, 20, 8, TP.oren)); },
    partikel: { palet: ['#F08A24', '#F7B733', '#FFD56B', '#FFFFFF'], svg: function (w) { return svg('0 0 24 30', '<ellipse cx="12" cy="15" rx="7" ry="13" fill="' + w + '" fill-opacity=".92"/>'); }, n: 10 }
  });

  /* =================== RUMAH BARU (syukuran) =================== */
  var RB = { atap: '#C8573D', dinding: '#FFF1DE', hijau: '#7C8B4A', coklat: '#5A3A28', lampu: '#FFD580' };
  function rumah() { var g = '<ellipse cx="130" cy="244" rx="120" ry="10" fill="rgba(90,58,40,.18)"/><rect x="40" y="112" width="180" height="132" rx="3" fill="' + RB.dinding + '" stroke="#D9B48A"/><polygon points="16,116 130,26 244,116" fill="' + RB.atap + '" stroke="#9C3B25" stroke-linejoin="round"/><path d="M40 98H220M60 80H200M82 62H178" stroke="rgba(0,0,0,.14)" fill="none"/><rect x="184" y="34" width="22" height="42" fill="#9C3B25"/><rect x="58" y="138" width="50" height="46" rx="3" fill="#8BB6D6" stroke="' + RB.coklat + '" stroke-width="3"/><rect x="152" y="138" width="50" height="46" rx="3" fill="#8BB6D6" stroke="' + RB.coklat + '" stroke-width="3"/><path d="M83 138V184M58 161H108M177 138V184M152 161H202" stroke="' + RB.coklat + '" stroke-width="2.4"/><rect x="100" y="150" width="60" height="94" fill="#3B2316" fill-opacity=".12"/><circle cx="26" cy="226" r="18" fill="' + RB.hijau + '"/><circle cx="46" cy="232" r="14" fill="#93A35A"/><circle cx="236" cy="226" r="18" fill="' + RB.hijau + '"/><circle cx="216" cy="232" r="14" fill="#93A35A"/>'; return svg('0 0 260 260', g); }
  function lampuHias(p) { var g = '<path d="M-6 16Q60 70 130 26T246 30" fill="none" stroke="#6B5B3A" stroke-width="1.4"/>', i, t, x, y; for (i = 1; i <= 8; i++) { t = i / 9; x = -6 + t * 252; y = 16 + Math.sin(t * Math.PI * 2.2) * 26 + t * 14; g += '<circle cx="' + f(x) + '" cy="' + f(y + 6) + '" r="5" fill="' + RB.lampu + '" stroke="#E8B34A"/><circle cx="' + f(x) + '" cy="' + f(y + 6) + '" r="10" fill="' + RB.lampu + '" fill-opacity=".25"/>'; } return g; }
  function daunIvy(x, y, s, rot, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + f(s) + ')"><path d="M0 0C-12 -6 -14 -22 0 -30C14 -22 12 -6 0 0Z" fill="' + col + '"/><path d="M0 0V-26" stroke="rgba(255,255,255,.4)"/></g>'; }
  N.reg('urumah', {
    id: 'rumah', mode: 'acara', nama: 'Undangan Rumah Baru', kicker: 'SYUKURAN RUMAH BARU', judulTokoh: 'Tuan Rumah', buka: 'rumah', gayaOk: 'rumah', suaraBuka: 'bukaPintu', waktuBuka: [2000, 2800],
    rumah: rumah,
    sudut: function (p) { var R = rng(p.charCodeAt(0) * 11), g = lampuHias(), i; for (i = 0; i < 9; i++) g += daunIvy(8 + i * 6, 60 + i * 12, 0.8 + R() * 0.5, 160 + R() * 40, i % 2 ? RB.hijau : '#93A35A') + daunIvy(8 + R() * 30, 90 + i * 11, 0.7 + R() * 0.4, 90 + R() * 60, '#6B7A3F'); return svg('0 0 250 190', g); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="140" fill="none" stroke="#E0B060" stroke-width="2.5"/>', i, a, R = rng(4); for (i = 0; i < 26; i++) { a = (i / 26) * Math.PI * 2; g += daunIvy(200 + Math.cos(a) * 156, 200 + Math.sin(a) * 156, 1.1 + R() * 0.4, a * 180 / Math.PI + 90 + (i % 2 ? 24 : -24), i % 3 ? RB.hijau : '#93A35A'); } for (i = 0; i < 10; i++) { a = (i / 10) * Math.PI * 2 + 0.1; g += '<circle cx="' + f(200 + Math.cos(a) * 158) + '" cy="' + f(200 + Math.sin(a) * 158) + '" r="6" fill="' + RB.lampu + '" stroke="#E8B34A"/>'; } return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<path d="M-12 8L0 -8L12 8Z" fill="' + RB.atap + '"/><rect x="-9" y="8" width="18" height="10" fill="' + RB.dinding + '" stroke="#D9B48A"/>', '#E0B060'); },
    pengganti: function () { return bundar('<g transform="translate(18 14) scale(.34)">' + rumah().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>', '#FFEBD6'); },
    sdt: function () { return svg('0 0 52 52', '<circle cx="26" cy="26" r="9" fill="' + RB.lampu + '" stroke="#E8B34A"/><circle cx="26" cy="26" r="18" fill="' + RB.lampu + '" fill-opacity=".3"/>' + daunIvy(10, 46, 0.9, 200, RB.hijau)); },
    partikel: { palet: ['#FFD580', '#FFE9B0', '#FFFFFF', '#F4A261'], svg: function (w) { return svg('0 0 24 24', '<circle cx="12" cy="12" r="10" fill="' + w + '" fill-opacity=".35"/><circle cx="12" cy="12" r="4.5" fill="' + w + '"/>'); }, n: 14 }
  });
})();
