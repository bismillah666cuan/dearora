/* ==========================================================
   EMPAT UNDANGAN MODERN (hiasan SVG orisinal): Boarding Pass (pernikahan), Wisuda, Birthday Pop, dan Grand Opening.
   Memakai mesin bersama sp-pernikahan.js; pembuka baru didaftarkan lewat Nikah.bukaX (tiket, gulungan, balon, pita).
   ========================================================== */
(function () {
  'use strict';
  var N = window.Nikah; if (!N || !N.bukaX) return;
  function f(n) { return Math.round(n * 10) / 10; }
  function svg(vb, isi, ekstra) { return '<svg viewBox="' + vb + '" aria-hidden="true" focusable="false"' + (ekstra || '') + '>' + isi + '</svg>'; }
  function bintang(x, y, r, fill, stroke) { var p = [], i, a, rr; for (i = 0; i < 10; i++) { a = (i / 10) * Math.PI * 2 - Math.PI / 2; rr = i % 2 ? r * 0.45 : r; p.push(f(x + Math.cos(a) * rr) + ',' + f(y + Math.sin(a) * rr)); } return '<polygon points="' + p.join(' ') + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.2" stroke-linejoin="round"' : '') + '/>'; }
  function kilau(x, y, r, fill) { return '<path d="M' + x + ' ' + (y - r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'Z" fill="' + fill + '"/>'; }
  function ringkas(s, n) { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function bundar(isi, bg) { return svg('0 0 120 120', '<circle cx="60" cy="60" r="58" fill="' + bg + '"/>' + isi); }
  function gelap(hex, k) { var m = /^#([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; var v = parseInt(m[1], 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255; function c(x) { return Math.max(0, Math.round(x * (1 - k))).toString(16).padStart(2, '0'); } return '#' + c(r) + c(g) + c(b); }
  function tglPendek(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''), BL = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']; return m && BL[Number(m[2]) - 1] ? Number(m[3]) + ' ' + BL[Number(m[2]) - 1] + ' ' + m[1] : '— — —'; }
  function pesawat(fill) { return '<g fill="' + fill + '"><path d="M32 3c3 0 4 6 4 15v26c0 8-2 14-4 16-2-2-4-8-4-16V18c0-9 1-15 4-15z"/><path d="M28 24 5 40v5l23-7zM36 24l23 16v5l-23-7z"/><path d="M28 50 16 56v3l12-3zM36 50l12 6v3l-12-3z"/></g>'; }
  function awan(x, y, s, op) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="#fff" opacity="' + (op || 0.92) + '"><circle cx="30" cy="30" r="18"/><circle cx="52" cy="22" r="22"/><circle cx="78" cy="30" r="17"/><rect x="14" y="30" width="80" height="18" rx="9"/></g>'; }
  function garis(x1, x2, warna, tebal, pola) { return '<path d="M' + x1 + ' 20H' + x2 + '" stroke="' + warna + '" stroke-width="' + (tebal || 1.4) + '" fill="none"' + (pola ? ' stroke-dasharray="' + pola + '"' : '') + ' stroke-linecap="round"/>'; }
  function pemb(pusat, warna, pola) { return svg('0 0 300 40', garis(8, 126, warna, 1.4, pola) + garis(174, 292, warna, 1.4, pola) + '<g transform="translate(150 20)">' + pusat + '</g>'); }
  function lingkar(R, n, buat) { var g = '', i, a; for (i = 0; i < n; i++) { a = (i / n) * Math.PI * 2; g += buat(200 + Math.cos(a) * R, 200 + Math.sin(a) * R, a, i); } return g; }

  /* ---------------------------------- PEMBUKA BARU ---------------------------------- */
  /** Tiket pesawat: sobek di garis putus-putus. */
  N.bukaX.tiket = function (x) {
    var a = x.a0 || {}, e = x.esc;
    return { bg: '<div class="nk-bg-tk" aria-hidden="true"><i></i><i></i><i></i></div>',
      inti: '<div class="nk-tk nk-stage"><div class="nk-tk-tiket" aria-hidden="true"><div class="nk-tk-badan"><div class="nk-tk-atas"><span>BOARDING PASS</span><span>LOVE AIR</span></div>' +
        '<div class="nk-tk-rute"><div><small>DARI</small><b>KITA</b></div><span class="nk-tk-pes">' + svg('0 0 64 64', pesawat('#1E6FBF')) + '</span><div><small>KE</small><b>SELAMANYA</b></div></div>' +
        '<div class="nk-tk-info"><div><small>TANGGAL</small><b>' + tglPendek(a.tanggal) + '</b></div><div><small>JAM</small><b>' + e(ringkas(a.jam, 9) || '--.--') + '</b></div><div><small>GATE</small><b>' + e(ringkas(a.tempat, 13) || 'Lokasi acara') + '</b></div></div></div>' +
        '<div class="nk-tk-sobek"><small>KURSI</small><b>1A</b><i class="nk-tk-bar"></i></div></div>' +
        '<button type="button" class="ud-segel nk-segel" aria-label="Sobek tiket untuk membuka undangan"><span>SOBEK</span></button></div>' };
  };
  /** Gulungan ijazah: pita diurai, gulungan terbentang, toga melayang. */
  N.bukaX.gulungan = function (x) {
    var T = x.T;
    return { bg: '<div class="nk-bg-gl" aria-hidden="true"></div>',
      inti: '<div class="nk-gl nk-stage"><div class="nk-gl-toga" aria-hidden="true">' + (T.toga ? T.toga() : '') + '</div><div class="nk-gl-kertas" aria-hidden="true"><div class="nk-gl-isi"><small>SELAMAT &amp; SUKSES</small><b>' + x.inisial + '</b><i class="nk-gl-garis"></i><i class="nk-gl-garis p"></i></div></div>' +
        '<i class="nk-gl-r a" aria-hidden="true"></i><i class="nk-gl-r b" aria-hidden="true"></i><i class="nk-gl-pita" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka gulungan untuk membuka undangan"><span>' + x.inisial + '</span></button></div>' };
  };
  /** Balon: dipecahkan dengan "POP!". */
  N.bukaX.balon = function (x) {
    var T = x.T, serpih = '', i, a, w = ['#FF4F8B', '#FFC83D', '#3FB6F0', '#7ED957', '#B57BFF'];
    for (i = 0; i < 12; i++) { a = (i / 12) * Math.PI * 2; serpih += '<i style="--dx:' + Math.round(Math.cos(a) * (70 + (i % 3) * 18)) + 'px;--dy:' + Math.round(Math.sin(a) * (70 + (i % 3) * 18)) + 'px;--c:' + w[i % 5] + '"></i>'; }
    return { bg: '<div class="nk-bg-bl" aria-hidden="true"></div>',
      inti: '<div class="nk-bl nk-stage"><div class="nk-bl-b kecil kiri" aria-hidden="true">' + (T.balon ? T.balon('#3FB6F0', 'k1') : '') + '</div><div class="nk-bl-b kecil kanan" aria-hidden="true">' + (T.balon ? T.balon('#FFC83D', 'k2') : '') + '</div>' +
        '<div class="nk-bl-b besar" aria-hidden="true">' + (T.balon ? T.balon('#FF4F8B', 'b1') : '') + '<span class="nk-bl-teks">' + x.inisial + '</span></div><div class="nk-bl-bum" aria-hidden="true">' + (T.bum ? T.bum() : '') + '</div><div class="nk-bl-serpih" aria-hidden="true">' + serpih + '</div>' +
        '<button type="button" class="ud-segel nk-segel" aria-label="Pecahkan balon untuk membuka undangan"><span>POP!</span></button></div>' };
  };
  /** Pita peresmian: digunting, tirai terbuka. */
  N.bukaX.pita = function (x) {
    var T = x.T;
    return { bg: '<div class="nk-bg-pt" aria-hidden="true"></div>',
      inti: '<div class="nk-pt nk-stage"><div class="nk-pt-papan" aria-hidden="true"><small>GRAND OPENING</small><b>' + x.inisial + '</b><i></i></div><i class="nk-pt-tirai kiri" aria-hidden="true"></i><i class="nk-pt-tirai kanan" aria-hidden="true"></i>' +
        '<i class="nk-pt-pita a" aria-hidden="true"></i><i class="nk-pt-pita b" aria-hidden="true"></i><div class="nk-pt-simpul" aria-hidden="true">' + (T.simpul ? T.simpul() : '') + '</div>' +
        '<button type="button" class="ud-segel nk-segel" aria-label="Gunting pita untuk membuka undangan"><span>' + (T.gunting ? T.gunting() : '') + '</span></button></div>' };
  };

  /* ---------------------------------- 1. BOARDING PASS (pernikahan) ---------------------------------- */
  var TK = { biru: '#1E6FBF', dlm: '#124A85', kuning: '#FFC83D', langit: '#9CCBFF' };
  N.reg('utiket', {
    id: 'tiket', mode: 'nikah', nama: 'Undangan Boarding Pass', kicker: 'BOARDING PASS · WEDDING', buka: 'tiket', gayaOk: 'elegan', suaraBuka: 'utiket', waktuBuka: [1500, 2500], petunjuk: 'Ketuk tag untuk menyobek tiket',
    label: { mempelai: 'Penumpang', kisah: 'Rute Perjalanan', acara: 'Jadwal Keberangkatan', galeri: 'Album Perjalanan', hitung: 'Menuju Keberangkatan' },
    atas: function () { return ''; },
    karangan: function () { return svg('0 0 400 400', '<defs><path id="nkTkT" d="M200 200m-170 0a170 170 0 1 1 340 0a170 170 0 1 1 -340 0"/></defs><circle cx="200" cy="200" r="150" fill="none" stroke="' + TK.biru + '" stroke-width="3" stroke-dasharray="3 7"/><circle cx="200" cy="200" r="140" fill="none" stroke="' + TK.kuning + '" stroke-width="2.4"/><text font-family="Rajdhani, sans-serif" font-size="15" font-weight="700" letter-spacing="3.2" fill="' + TK.biru + '"><textPath href="#nkTkT">WELCOME ABOARD ✦ LOVE AIR ✦ WELCOME ABOARD ✦ LOVE AIR ✦ WELCOME ✦</textPath></text>'); },
    pembatas: function () { return pemb('<g transform="rotate(90) scale(.42) translate(-32 -32)">' + pesawat(TK.biru) + '</g>', '#7FB2E5', '3 6'); },
    pengganti: function () { return bundar('<circle cx="60" cy="46" r="18" fill="#8DB9E8"/><path d="M24 106c4-24 20-32 36-32s32 8 36 32z" fill="#8DB9E8"/>', '#DCEBFA'); },
    sdt: function () { return svg('0 0 52 52', '<path d="M5 15h42v8a4 4 0 0 0 0 8v8H5v-8a4 4 0 0 0 0-8z" fill="' + TK.kuning + '" stroke="#C99200" stroke-width="1.5" stroke-linejoin="round"/><path d="M19 15v24" stroke="#C99200" stroke-dasharray="2 3"/>'); },
    sudut: function (p) { var pos = { a: [10, 6, 0.9], b: [60, 20, 0.7], c: [4, 18, 0.8], d: [30, 2, 1] }[p] || [10, 6, 0.9]; return svg('0 0 200 90', awan(pos[0], pos[1], pos[2]) + awan(pos[0] + 84, pos[1] + 26, pos[2] * 0.62, 0.7)); },
    partikel: { palet: ['#FFFFFF', '#FFD54A', '#9CCBFF', '#FF9AA2'], svg: function (w) { return svg('0 0 24 24', bintang(12, 12, 10, w)); }, n: 10 }
  });

  /* ---------------------------------- 2. WISUDA (acara) ---------------------------------- */
  var WS = { navy: '#1E3A8A', dlm: '#122766', emas: '#D9A82F', krem: '#FFFBEF', merah: '#C0392B' };
  function toga() {
    return svg('0 0 200 130', '<defs><linearGradient id="nkWg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3250B5"/><stop offset="1" stop-color="' + WS.dlm + '"/></linearGradient></defs><path d="M50 62v34c0 14 100 14 100 0V62l-50 24z" fill="' + WS.dlm + '"/><polygon points="100,8 196,46 100,84 4,46" fill="url(#nkWg)" stroke="' + WS.dlm + '" stroke-width="2" stroke-linejoin="round"/><path d="M100 46L168 60V100" stroke="' + WS.emas + '" stroke-width="3.2" fill="none" stroke-linecap="round"/><rect x="162" y="98" width="12" height="22" rx="3" fill="' + WS.emas + '"/><circle cx="100" cy="46" r="7" fill="' + WS.emas + '"/>');
  }
  N.reg('uwisuda', {
    id: 'gelar', mode: 'acara', nama: 'Undangan Wisuda', kicker: 'SYUKURAN WISUDA', judulTokoh: 'Sang Wisudawan', buka: 'gulungan', gayaOk: 'sultan', suaraBuka: 'uwisuda', waktuBuka: [2000, 2900], petunjuk: 'Ketuk simpul pita untuk membuka gulungan',
    label: { hitung: 'Menuju Hari Wisuda' },
    atas: function () { return ''; },
    toga: toga,
    karangan: function () { var g = '<circle cx="200" cy="200" r="150" fill="none" stroke="' + WS.emas + '" stroke-width="2.4"/><circle cx="200" cy="200" r="141" fill="none" stroke="' + WS.navy + '" stroke-width="1.4"/>'; [-1, 1].forEach(function (sisi) { var i, a, x, y; for (i = 0; i < 11; i++) { a = Math.PI * (0.62 + i * 0.075); x = 200 + sisi * Math.cos(a) * 160 * -1; y = 200 + Math.sin(a) * 160; g += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="12" ry="5.2" fill="' + (i % 2 ? WS.emas : '#E9C45A') + '" transform="rotate(' + f((sisi < 0 ? 1 : -1) * (a * 180 / Math.PI - 90) + (sisi < 0 ? 0 : 0)) + ' ' + f(x) + ' ' + f(y) + ')"/>'; } }); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<g transform="translate(-14 -7)"><rect x="0" y="2" width="28" height="11" rx="5.5" fill="' + WS.krem + '" stroke="' + WS.emas + '" stroke-width="1.4"/><path d="M14 2v11" stroke="' + WS.merah + '" stroke-width="3"/></g>', WS.emas); },
    pengganti: function () { return bundar('<g transform="translate(14 28) scale(.46)">' + toga().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>', '#DDE6FA'); },
    sdt: function () { return svg('0 0 52 52', '<g transform="translate(3 9) scale(.23)">' + toga().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c'; return svg('0 0 200 110', '<path d="M' + (kiri ? 0 : 200) + ' 12Q' + (kiri ? 70 : 130) + ' 24 ' + (kiri ? 120 : 80) + ' 80" fill="none" stroke="' + WS.emas + '" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1 8"/>' + bintang(kiri ? 30 : 170, 34, 9, WS.emas) + bintang(kiri ? 74 : 126, 68, 6, WS.navy) + kilau(kiri ? 110 : 90, 22, 7, '#F6D77A')); },
    partikel: { palet: ['#F2C94C', '#1E3A8A', '#FFFFFF', '#C0392B', '#E9C45A'], svg: function (w) { return svg('0 0 24 24', bintang(12, 12, 10, w)); }, n: 12 }
  });

  /* ---------------------------------- 3. BIRTHDAY POP (acara) ---------------------------------- */
  var PP = { pink: '#FF4F8B', kuning: '#FFC83D', biru: '#3FB6F0', hijau: '#7ED957', ungu: '#B57BFF' };
  function balon(warna, id) {
    return svg('0 0 120 176', '<defs><radialGradient id="nkB' + id + '" cx=".34" cy=".28" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".2" stop-color="' + warna + '"/><stop offset="1" stop-color="' + gelap(warna, 0.28) + '"/></radialGradient></defs><path d="M60 5C27 5 10 31 10 60c0 35 24 58 50 68 26-10 50-33 50-68C110 31 93 5 60 5z" fill="url(#nkB' + id + ')"/><path d="M53 129l7-8 7 8z" fill="' + gelap(warna, 0.3) + '"/><path d="M60 129c-11 16 11 24 0 46" fill="none" stroke="#6B6B7A" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="38" cy="38" rx="9" ry="15" fill="#fff" opacity=".42" transform="rotate(24 38 38)"/>');
  }
  function bum() { var p = [], i, r, a; for (i = 0; i < 24; i++) { a = (i / 24) * Math.PI * 2; r = i % 2 ? 62 : 96; p.push(f(100 + Math.cos(a) * r) + ',' + f(100 + Math.sin(a) * r)); } return svg('0 0 200 200', '<polygon points="' + p.join(' ') + '" fill="' + PP.kuning + '" stroke="' + PP.pink + '" stroke-width="5" stroke-linejoin="round"/><text x="100" y="116" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="52" fill="' + PP.pink + '">POP!</text>'); }
  N.reg('upop', {
    id: 'pop', mode: 'acara', nama: 'Undangan Birthday Pop', kicker: "LET'S PARTY!", judulTokoh: 'Si Bintang Pesta', buka: 'balon', gayaOk: 'ceria', suaraBuka: 'upop', waktuBuka: [1300, 2200], petunjuk: 'Ketuk balon untuk memecahkannya!',
    label: { hitung: 'Hitung Mundur Pesta' },
    atas: function () { return ''; },
    balon: balon, bum: bum,
    karangan: function () { var w = [PP.pink, PP.kuning, PP.biru, PP.hijau, PP.ungu]; return svg('0 0 400 400', '<circle cx="200" cy="200" r="148" fill="none" stroke="' + PP.pink + '" stroke-width="3" stroke-dasharray="1 11" stroke-linecap="round"/>' + lingkar(160, 22, function (x, y, a, i) { return i % 3 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (3 + (i % 4)) + '" fill="' + w[i % 5] + '"/>' : bintang(f(x), f(y), 8, w[i % 5]); })); },
    pembatas: function () { return pemb(bintang(0, 0, 11, PP.kuning, PP.pink), PP.pink, '2 8'); },
    pengganti: function () { return bundar('<circle cx="42" cy="52" r="5" fill="#5B3A29"/><circle cx="78" cy="52" r="5" fill="#5B3A29"/><path d="M36 74q24 26 48 0" stroke="#5B3A29" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M30 14 60 2l30 12-30 14z" fill="' + PP.pink + '" opacity="0"/>', '#FFE48A'); },
    sdt: function () { return svg('0 0 52 52', '<path d="M26 6 41 44H11z" fill="' + PP.pink + '" stroke="' + PP.kuning + '" stroke-width="2" stroke-linejoin="round"/><path d="M19 28h14M15 38h22" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="26" cy="6" r="4.4" fill="' + PP.kuning + '"/>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c', w = [PP.pink, PP.kuning, PP.biru, PP.hijau, PP.ungu], g = '<path d="M' + (kiri ? -4 : 204) + ' 10Q' + (kiri ? 90 : 110) + ' 64 ' + (kiri ? 190 : 10) + ' 14" fill="none" stroke="#9A8A7A" stroke-width="1.4"/>', i, t, x, y; for (i = 0; i < 6; i++) { t = (i + 0.5) / 6; x = (kiri ? -4 : 204) * (1 - t) * (1 - t) + 2 * (1 - t) * t * (kiri ? 90 : 110) + t * t * (kiri ? 190 : 10); y = 10 * (1 - t) * (1 - t) + 2 * (1 - t) * t * 64 + t * t * 14; g += '<path d="M' + f(x - 11) + ' ' + f(y) + 'L' + f(x + 11) + ' ' + f(y) + 'L' + f(x) + ' ' + f(y + 24) + 'Z" fill="' + w[i % 5] + '"/>'; } return svg('0 0 200 90', g); },
    partikel: { palet: ['#FF4F8B', '#FFC83D', '#3FB6F0', '#7ED957', '#B57BFF'], svg: function (w) { return svg('0 0 24 24', '<rect x="5" y="5" width="14" height="14" rx="4" fill="' + w + '"/>'); }, n: 14 }
  });

  /* ---------------------------------- 4. GRAND OPENING (acara) ---------------------------------- */
  var GO = { marun: '#8E2447', dlm: '#5E1230', emas: '#D4A64A', krem: '#FFF6E6' };
  function gunting() { return svg('0 0 48 48', '<circle cx="11" cy="12" r="6.5" fill="none" stroke="#fff" stroke-width="3.4"/><circle cx="11" cy="36" r="6.5" fill="none" stroke="#fff" stroke-width="3.4"/><path d="M16 16.5 43 31M16 31.5 43 17" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'); }
  function simpul() { return svg('0 0 120 90', '<path d="M60 44 22 16c-12-8-20 6-14 16 6 10 26 14 52 12z" fill="#C2334F"/><path d="M60 44 98 16c12-8 20 6 14 16-6 10-26 14-52 12z" fill="#A82342"/><path d="M52 50 36 84l10-6 8 10 8-30zM68 50 84 84l-10-6-8 10-8-30z" fill="#8E1D38"/><circle cx="60" cy="44" r="12" fill="#E0506C" stroke="#8E1D38" stroke-width="2"/><path d="M52 40q8-8 16 0" stroke="#F7A3B3" stroke-width="2.4" fill="none" stroke-linecap="round"/>'); }
  N.reg('uresmi', {
    id: 'resmi', mode: 'acara', nama: 'Undangan Grand Opening', kicker: 'GRAND OPENING', judulTokoh: 'Tentang Kami', buka: 'pita', gayaOk: 'sultan', suaraBuka: 'uresmi', waktuBuka: [1800, 2800], petunjuk: 'Ketuk gunting untuk meresmikan',
    label: { hitung: 'Menuju Pembukaan', denah: 'Lokasi & Jam Buka', susunan: 'Rangkaian Acara' },
    atas: function () { return ''; },
    gunting: gunting, simpul: simpul,
    karangan: function () { var g = '<circle cx="200" cy="200" r="150" fill="none" stroke="' + GO.emas + '" stroke-width="2.6"/><circle cx="200" cy="200" r="140" fill="none" stroke="' + GO.marun + '" stroke-width="1.2"/>'; g += lingkar(166, 40, function (x, y, a, i) { var x2 = 200 + Math.cos(a) * (i % 2 ? 176 : 184), y2 = 200 + Math.sin(a) * (i % 2 ? 176 : 184); return '<path d="M' + f(x) + ' ' + f(y) + 'L' + f(x2) + ' ' + f(y2) + '" stroke="' + GO.emas + '" stroke-width="' + (i % 2 ? 1.4 : 2.2) + '" stroke-linecap="round"/>'; }); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<path d="M0-9 9 0 0 9-9 0z" fill="' + GO.emas + '" stroke="' + GO.marun + '" stroke-width="1.4"/>', GO.emas); },
    pengganti: function () { return bundar('<path d="M24 44h72l-6 16H30z" fill="' + GO.marun + '"/><path d="M30 60h60v36H30z" fill="#F2D9A4"/><rect x="50" y="70" width="20" height="26" rx="2" fill="' + GO.dlm + '"/><path d="M24 44l8-14h56l8 14z" fill="' + GO.emas + '"/>', '#F8E8CC'); },
    sdt: function () { return svg('0 0 52 52', '<path d="M7 18h38l-3-9H10z" fill="' + GO.marun + '"/><path d="M9 18h34v22H9z" fill="#F2D9A4" stroke="' + GO.emas + '" stroke-width="1.5"/><rect x="21" y="26" width="10" height="14" fill="' + GO.dlm + '"/>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c'; return svg('0 0 200 110', kilau(kiri ? 40 : 160, 30, 14, GO.emas) + kilau(kiri ? 92 : 108, 64, 8, '#E9C77C') + kilau(kiri ? 18 : 182, 78, 6, GO.marun) + '<path d="M' + (kiri ? 0 : 200) + ' 4Q' + (kiri ? 66 : 134) + ' 12 ' + (kiri ? 130 : 70) + ' 70" fill="none" stroke="' + GO.emas + '" stroke-width="1.6" stroke-dasharray="1 7" stroke-linecap="round"/>'); },
    partikel: { palet: ['#D4A64A', '#8E2447', '#FFFFFF', '#E9C77C'], svg: function (w) { return svg('0 0 24 24', kilau(12, 12, 11, w)); }, n: 12 }
  });
})();
