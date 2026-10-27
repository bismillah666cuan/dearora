/* ==========================================================
   EMPAT UNDANGAN LANJUTAN (hiasan SVG orisinal): Sunda Modern, Betawi Ceria (pernikahan), Baby Shower, dan Bukber & Halal Bihalal (acara).
   Memakai mesin bersama sp-pernikahan.js; pembuka baru: gapura, pintu, kado, bedug (Nikah.bukaX).
   Hiasan memakai bentuk umum (padi, gapura, gigi balang, tumpal, lentera), tanpa tokoh atau lambang budaya yang spesifik.
   ========================================================== */
(function () {
  'use strict';
  var N = window.Nikah; if (!N || !N.bukaX) return;
  function f(n) { return Math.round(n * 10) / 10; }
  function svg(vb, isi, ekstra) { return '<svg viewBox="' + vb + '" aria-hidden="true" focusable="false"' + (ekstra || '') + '>' + isi + '</svg>'; }
  function bintang(x, y, r, fill, stroke) { var p = [], i, a, rr; for (i = 0; i < 10; i++) { a = (i / 10) * Math.PI * 2 - Math.PI / 2; rr = i % 2 ? r * 0.45 : r; p.push(f(x + Math.cos(a) * rr) + ',' + f(y + Math.sin(a) * rr)); } return '<polygon points="' + p.join(' ') + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.2" stroke-linejoin="round"' : '') + '/>'; }
  function kilau(x, y, r, fill) { return '<path d="M' + x + ' ' + (y - r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'Z" fill="' + fill + '"/>'; }
  function bundar(isi, bg) { return svg('0 0 120 120', '<circle cx="60" cy="60" r="58" fill="' + bg + '"/>' + isi); }
  function gelap(hex, k) { var m = /^#([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; var v = parseInt(m[1], 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255; function c(x) { return Math.max(0, Math.round(x * (1 - k))).toString(16).padStart(2, '0'); } return '#' + c(r) + c(g) + c(b); }
  function garis(x1, x2, warna, tebal, pola) { return '<path d="M' + x1 + ' 20H' + x2 + '" stroke="' + warna + '" stroke-width="' + (tebal || 1.4) + '" fill="none"' + (pola ? ' stroke-dasharray="' + pola + '"' : '') + ' stroke-linecap="round"/>'; }
  function pemb(pusat, warna, pola) { return svg('0 0 300 40', garis(8, 126, warna, 1.4, pola) + garis(174, 292, warna, 1.4, pola) + '<g transform="translate(150 20)">' + pusat + '</g>'); }
  function lingkar(R, n, buat) { var g = '', i, a; for (i = 0; i < n; i++) { a = (i / n) * Math.PI * 2; g += buat(200 + Math.cos(a) * R, 200 + Math.sin(a) * R, a, i); } return g; }
  function daun(x, y, rot, s, fill) { return '<path d="M0 0C6-10 18-10 24 0C18 10 6 10 0 0Z" fill="' + fill + '" transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + s + ')"/>'; }
  var ARAB = '<p class="nk-arab nk-rev" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>';

  /* ---------------------------------- PEMBUKA BARU ---------------------------------- */
  N.bukaX.gapura = function (x) {
    var T = x.T;
    return { bg: '<div class="nk-bg-gp" aria-hidden="true"></div>',
      inti: '<div class="nk-gp nk-stage"><div class="nk-gp-sawah" aria-hidden="true">' + (T.sawah ? T.sawah() : '') + '</div><div class="nk-gp-kartu" aria-hidden="true"><b>' + x.inisial + '</b></div>' +
        '<i class="nk-gp-daun kiri" aria-hidden="true"></i><i class="nk-gp-daun kanan" aria-hidden="true"></i><i class="nk-gp-atas" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka gapura untuk membuka undangan"><span>' + x.inisial + '</span></button></div>' };
  };
  N.bukaX.pintu = function (x) {
    var T = x.T;
    return { bg: '<div class="nk-bg-pn" aria-hidden="true"></div>',
      inti: '<div class="nk-pn nk-stage"><div class="nk-pn-dalam" aria-hidden="true"><b>' + x.inisial + '</b></div><i class="nk-pn-daun kiri" aria-hidden="true"></i><i class="nk-pn-daun kanan" aria-hidden="true"></i><div class="nk-pn-atap" aria-hidden="true">' + (T.atap ? T.atap() : '') + '</div>' +
        '<button type="button" class="ud-segel nk-segel" aria-label="Buka pintu untuk membuka undangan"><span>' + x.inisial + '</span></button></div>' };
  };
  N.bukaX.kado = function (x) {
    var T = x.T, b = '', i, pos = [[8, 36, 1], [38, 14, 0.8], [66, 30, 0.9]], w = ['var(--ak1)', 'var(--ak2)', '#FFFFFF'];
    for (i = 0; i < 3; i++) b += '<div class="nk-kd-b b' + i + '" aria-hidden="true">' + (T.balonKecil ? T.balonKecil(i) : '') + '</div>';
    return { bg: '<div class="nk-bg-kd" aria-hidden="true"></div>',
      inti: '<div class="nk-kd nk-stage"><div class="nk-kd-isi" aria-hidden="true"><b>' + x.inisial + '</b></div>' + b +
        '<div class="nk-kd-kotak" aria-hidden="true"><i class="nk-kd-pv"></i></div><div class="nk-kd-tutup" aria-hidden="true"><i class="nk-kd-pv"></i></div><div class="nk-kd-simpul" aria-hidden="true">' + (T.simpul ? T.simpul() : '') + '</div>' +
        '<button type="button" class="ud-segel nk-segel" aria-label="Tarik pita kado untuk membuka undangan"><span>' + x.inisial + '</span></button></div>' };
  };
  N.bukaX.bedug = function (x) {
    var T = x.T, l = [0, 1, 2].map(function (i) { return '<div class="nk-bd-l l' + i + '" aria-hidden="true">' + (T.lentera ? T.lentera(i) : '') + '</div>'; }).join('');
    return { bg: '<div class="nk-bg-bd" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>',
      inti: '<div class="nk-bd nk-stage"><div class="nk-bd-bulan" aria-hidden="true">' + (T.bulan ? T.bulan() : '') + '</div>' + l + '<div class="nk-bd-kartu" aria-hidden="true"><b>' + x.inisial + '</b></div>' +
        '<div class="nk-bd-bedug" aria-hidden="true">' + (T.bedug ? T.bedug() : '') + '</div><i class="nk-bd-gema a" aria-hidden="true"></i><i class="nk-bd-gema b" aria-hidden="true"></i><i class="nk-bd-pukul" aria-hidden="true"></i>' +
        '<button type="button" class="ud-segel nk-segel" aria-label="Tabuh bedug untuk membuka undangan"><span>' + x.inisial + '</span></button></div>' };
  };

  /* ---------------------------------- 1. SUNDA MODERN (pernikahan) ---------------------------------- */
  var SD = { hijau: '#2F6B4F', dlm: '#1F4D38', emas: '#C9A24A', krem: '#F7F0DD', padi: '#D9B24E' };
  function tangkaiPadi(x, y, rot, s) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + s + ')"><path d="M0 0C-2 -30 4 -60 18 -84" fill="none" stroke="' + SD.hijau + '" stroke-width="2.4" stroke-linecap="round"/>', i; for (i = 0; i < 7; i++) g += '<ellipse cx="' + f(2 + i * 2.6) + '" cy="' + f(-34 - i * 7.2) + '" rx="3.2" ry="6.4" fill="' + SD.padi + '" transform="rotate(' + f(-18 + i * 3) + ' ' + f(2 + i * 2.6) + ' ' + f(-34 - i * 7.2) + ')"/>' + '<ellipse cx="' + f(11 + i * 2.6) + '" cy="' + f(-36 - i * 7.2) + '" rx="3.2" ry="6.4" fill="#E6C265" transform="rotate(' + f(20 + i * 3) + ' ' + f(11 + i * 2.6) + ' ' + f(-36 - i * 7.2) + ')"/>'; return g + '</g>'; }
  function sawah() {
    return svg('0 0 300 200', '<defs><linearGradient id="nkSdL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE9F6"/><stop offset="1" stop-color="#F5F1D6"/></linearGradient></defs><rect width="300" height="200" fill="url(#nkSdL)"/><path d="M0 92 60 52 104 80 160 38 230 84 300 58V200H0Z" fill="#8DB59C"/><path d="M0 110C60 92 110 100 160 92S250 98 300 90V200H0Z" fill="#5F9A6D"/><path d="M0 128C70 112 120 122 170 114S260 120 300 112V200H0Z" fill="#7DB366"/><path d="M0 148C80 134 130 144 190 136S270 142 300 134V200H0Z" fill="#A8C95A"/><path d="M0 170C90 158 140 166 200 160S270 164 300 158V200H0Z" fill="#6FA250"/><path d="M0 40q20-10 40 0t40 0 40 0" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".6"/><circle cx="238" cy="30" r="14" fill="#FFE9A8"/>');
  }
  N.reg('usunda', {
    id: 'sunda', mode: 'nikah', nama: 'Undangan Sunda Modern', kicker: 'THE WEDDING OF', buka: 'gapura', gayaOk: 'elegan', suaraBuka: 'usunda', waktuBuka: [1900, 2800], petunjuk: 'Ketuk palang untuk membuka gapura',
    label: { mempelai: 'Sang Mempelai', acara: 'Waktos jeung Tempat', hitung: 'Menuju Hari Bahagia' },
    atas: function () { return '<p class="nk-wls nk-rev">Wilujeng Sumping</p>'; },
    sawah: sawah,
    karangan: function () { var g = '<circle cx="200" cy="200" r="148" fill="none" stroke="' + SD.emas + '" stroke-width="2.4"/><circle cx="200" cy="200" r="139" fill="none" stroke="' + SD.hijau + '" stroke-width="1.2"/>'; [0, 60, 120, 180, 240, 300].forEach(function (d) { var a = d * Math.PI / 180; g += tangkaiPadi(200 + Math.cos(a) * 166, 200 + Math.sin(a) * 166, d + 90, 0.5); }); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<path d="M-14 4c3-8 9-8 14-14 5 6 11 6 14 14" fill="none" stroke="' + SD.hijau + '" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="0" r="3.4" fill="' + SD.emas + '"/>', SD.emas); },
    pengganti: function () { return bundar('<circle cx="60" cy="46" r="18" fill="#9CC3A8"/><path d="M24 106c4-24 20-32 36-32s32 8 36 32z" fill="#9CC3A8"/>', '#E4EFE1'); },
    sdt: function () { return svg('0 0 52 52', '<path d="M8 10h36M8 10v32M44 10v32" fill="none" stroke="' + SD.hijau + '" stroke-width="2.4" stroke-linecap="round"/><rect x="14" y="14" width="6" height="22" rx="2" fill="' + SD.emas + '"/><rect x="24" y="14" width="6" height="28" rx="2" fill="' + SD.padi + '"/><rect x="34" y="14" width="6" height="18" rx="2" fill="' + SD.emas + '"/>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c'; return svg('0 0 200 110', tangkaiPadi(kiri ? 26 : 174, 104, kiri ? -6 : 6, 0.9) + tangkaiPadi(kiri ? 54 : 146, 108, kiri ? 18 : -18, 0.62) + daun(kiri ? 92 : 108, 98, kiri ? -30 : -150, 1.1, '#8DB59C')); },
    partikel: { palet: ['#8DB59C', '#D9B24E', '#FFFFFF', '#C7DDB0'], svg: function (w) { return svg('0 0 24 24', '<path d="M2 12C6 2 18 2 22 12C18 22 6 22 2 12Z" fill="' + w + '"/>'); }, n: 10 }
  });

  /* ---------------------------------- 2. BETAWI CERIA (pernikahan) ---------------------------------- */
  var BT = { merah: '#C8283B', hijau: '#1F8A4C', kuning: '#F6C945', krem: '#FFF8EA', coklat: '#5A2A12' };
  function gigi(n, w, h, warna) { var g = '', i; for (i = 0; i < n; i++) g += '<path d="M' + f(i * w) + ' 0L' + f(i * w + w) + ' 0L' + f(i * w + w / 2) + ' ' + h + 'Z" fill="' + warna[i % warna.length] + '"/>'; return g; }
  N.reg('ubetawi', {
    id: 'betawi', mode: 'nikah', nama: 'Undangan Betawi Ceria', kicker: 'THE WEDDING OF', buka: 'pintu', gayaOk: 'ceria', suaraBuka: 'ubetawi', waktuBuka: [1800, 2700], petunjuk: 'Ketuk gagang pintu untuk membuka',
    label: { mempelai: 'Mempelai Kita', acara: 'Acara Meriah', hitung: 'Hitung Mundur Acara' },
    atas: function () { return ''; },
    atap: function () { return svg('0 0 300 70', '<rect x="0" y="0" width="300" height="26" rx="4" fill="' + BT.merah + '"/><rect x="0" y="22" width="300" height="6" fill="' + BT.kuning + '"/><g transform="translate(0 28)">' + gigi(15, 20, 30, [BT.hijau, BT.kuning, BT.merah]) + '</g>'); },
    karangan: function () { var g = '<circle cx="200" cy="200" r="146" fill="none" stroke="' + BT.merah + '" stroke-width="2.6"/><circle cx="200" cy="200" r="137" fill="none" stroke="' + BT.kuning + '" stroke-width="2"/>'; g += lingkar(160, 28, function (x, y, a, i) { var xo = 200 + Math.cos(a) * 174, yo = 200 + Math.sin(a) * 174, xl = 200 + Math.cos(a + 0.11) * 160, yl = 200 + Math.sin(a + 0.11) * 160, xr = 200 + Math.cos(a - 0.11) * 160, yr = 200 + Math.sin(a - 0.11) * 160; return '<polygon points="' + f(xl) + ',' + f(yl) + ' ' + f(xr) + ',' + f(yr) + ' ' + f(xo) + ',' + f(yo) + '" fill="' + [BT.merah, BT.kuning, BT.hijau][i % 3] + '"/>'; }); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<g transform="translate(-30 -8)">' + gigi(6, 10, 14, [BT.merah, BT.kuning, BT.hijau]) + '</g>', BT.kuning); },
    pengganti: function () { return bundar('<circle cx="60" cy="46" r="18" fill="#E8A090"/><path d="M24 106c4-24 20-32 36-32s32 8 36 32z" fill="#E8A090"/>', '#FCE9C9'); },
    sdt: function () { return svg('0 0 52 52', '<path d="M6 20 26 6l20 14z" fill="' + BT.merah + '"/><g transform="translate(6 20) scale(.8)">' + gigi(5, 10, 8, [BT.kuning, BT.hijau]) + '</g><rect x="10" y="28" width="32" height="16" fill="#F6D9A0" stroke="' + BT.coklat + '" stroke-width="1.2"/><rect x="22" y="32" width="8" height="12" fill="' + BT.hijau + '"/>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c'; return svg('0 0 200 90', '<g transform="translate(' + (kiri ? 0 : 60) + ' 0)">' + gigi(7, 20, 26, [BT.merah, BT.kuning, BT.hijau]) + '</g>' + kilau(kiri ? 150 : 40, 54, 9, BT.kuning)); },
    partikel: { palet: ['#F6C945', '#C8283B', '#1F8A4C', '#FFFFFF'], svg: function (w) { return svg('0 0 24 24', '<path d="M12 2 22 22H2Z" fill="' + w + '"/>'); }, n: 14 }
  });

  /* ---------------------------------- 3. BABY SHOWER (acara; aksen: netral, biru, pink) ---------------------------------- */
  function balonK(i) { var w = ['var(--ak1)', 'var(--ak2)', '#FFFFFF'][i % 3]; return svg('0 0 60 90', '<path d="M30 3C14 3 5 17 5 32c0 19 13 31 25 36 12-5 25-17 25-36C55 17 46 3 30 3z" fill="' + w + '" stroke="rgba(0,0,0,.08)"/><path d="M26 69l4-5 4 5z" fill="rgba(0,0,0,.15)"/><path d="M30 69c-6 9 6 13 0 20" fill="none" stroke="#9AA0A6" stroke-width="1.2"/><ellipse cx="20" cy="20" rx="5" ry="8" fill="#fff" opacity=".5" transform="rotate(24 20 20)"/>'); }
  function simpulKado() { return svg('0 0 120 70', '<path d="M60 38 22 12C10 4 2 18 8 28c6 9 26 14 52 10z" fill="var(--ak1)"/><path d="M60 38 98 12c12-8 20 6 14 16-6 9-26 14-52 10z" fill="var(--ak2)"/><circle cx="60" cy="38" r="11" fill="var(--ak3)"/>'); }
  var BY = { teks: '#7B6B5A' };
  N.reg('ubayi', {
    id: 'bayi', mode: 'acara', nama: 'Undangan Baby Shower', kicker: 'BABY SHOWER', judulTokoh: 'Yang Kami Nantikan', buka: 'kado', gayaOk: 'ceria', suaraBuka: 'ubayi', waktuBuka: [1800, 2700], petunjuk: 'Ketuk pita untuk membuka kado',
    label: { hitung: 'Menuju Hari Penyambutan' },
    atas: function () { return ''; },
    balonKecil: balonK, simpul: simpulKado,
    karangan: function () { var g = '<circle cx="200" cy="200" r="148" fill="none" stroke="var(--ak2)" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>'; g += lingkar(160, 14, function (x, y, a, i) { return i % 2 ? bintang(f(x), f(y), 9, '#F4D987') : '<path d="M' + f(x - 12) + ' ' + f(y + 4) + 'a7 7 0 0 1 4-12 9 9 0 0 1 17 2 6 6 0 0 1 3 10z" fill="#FFFFFF" stroke="var(--ak2)" stroke-width="1.2"/>'; }); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<g fill="var(--ak2)"><ellipse cx="-12" cy="2" rx="5" ry="7"/><circle cx="-16" cy="-8" r="1.8"/><circle cx="-12" cy="-9.6" r="1.8"/><circle cx="-8" cy="-8" r="1.8"/><ellipse cx="12" cy="2" rx="5" ry="7"/><circle cx="8" cy="-8" r="1.8"/><circle cx="12" cy="-9.6" r="1.8"/><circle cx="16" cy="-8" r="1.8"/></g>', '#D9CFC0', '2 7'); },
    pengganti: function () { return bundar('<path d="M60 34c-14 0-22 11-22 24 0 16 10 26 22 30 12-4 22-14 22-30 0-13-8-24-22-24z" fill="#F2D9C3"/><circle cx="50" cy="58" r="3" fill="#5B3A29"/><circle cx="70" cy="58" r="3" fill="#5B3A29"/><path d="M52 70q8 6 16 0" stroke="#5B3A29" stroke-width="2.4" fill="none" stroke-linecap="round"/>', '#FFF1E0'); },
    sdt: function () { return svg('0 0 52 52', '<rect x="8" y="22" width="36" height="22" rx="3" fill="var(--ak1)"/><rect x="6" y="16" width="40" height="9" rx="3" fill="var(--ak2)"/><path d="M26 16v28" stroke="#fff" stroke-width="3"/>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c'; return svg('0 0 200 120', '<path d="M' + (kiri ? 20 : 180) + ' 0V40" stroke="#CFC5B6" stroke-width="1.4"/><path d="M' + (kiri ? 60 : 140) + ' 0V62" stroke="#CFC5B6" stroke-width="1.4"/><path d="M' + (kiri ? 100 : 100) + ' 0V30" stroke="#CFC5B6" stroke-width="1.4"/>' + bintang(kiri ? 20 : 180, 52, 11, '#F4D987') + '<path d="M' + (kiri ? 46 : 126) + ' 74a11 11 0 1 0 22 0c-4 6-14 6-22 0z" fill="var(--ak2)" transform="translate(0 -4)"/><path d="M' + (kiri ? 100 : 100) + ' 30m-10 8a8 8 0 0 1 4-10 9 9 0 0 1 16 2 6 6 0 0 1 3 8z" fill="#fff" stroke="var(--ak1)" stroke-width="1.2" transform="translate(0 8)"/>'); },
    partikel: { palet: ['#F4D987', '#FFFFFF', '#CFE3F5', '#F8CFD8'], svg: function (w) { return svg('0 0 24 24', bintang(12, 12, 10, w)); }, n: 10 }
  });

  /* ---------------------------------- 4. BUKBER & HALAL BIHALAL (acara; jenis: bukber, halal, reuni) ---------------------------------- */
  var BK = { zamrud: '#0F6B54', dlm: '#0A4A3A', emas: '#E3B341', malam: '#1B1A3D', krem: '#FFF7DC' };
  function lenteraB(i) { var c = [BK.emas, '#F28C38', '#F6C945'][i % 3]; return svg('0 0 60 120', '<path d="M30 0V14" stroke="#B8841C" stroke-width="2"/><path d="M20 14H40L44 24H16Z" fill="#B8841C"/><path d="M16 24H44C48 52 46 74 40 90H20C14 74 12 52 16 24Z" fill="' + c + '" stroke="#B8841C" stroke-width="1.6"/><path d="M30 24V90M22 26C20 50 22 74 24 90M38 26C40 50 38 74 36 90" stroke="#B8841C" stroke-width="1" opacity=".55" fill="none"/><path d="M20 90H40L37 100H23Z" fill="#B8841C"/>'); }
  function bulan() { return svg('0 0 80 80', '<path d="M52 8A32 32 0 1 0 72 52 26 26 0 0 1 52 8Z" fill="' + BK.emas + '"/>' + bintang(64, 20, 7, '#FFF3C4')); }
  function bedug() { return svg('0 0 200 170', '<defs><linearGradient id="nkBdG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8B4A22"/><stop offset=".5" stop-color="#C77A3B"/><stop offset="1" stop-color="#8B4A22"/></linearGradient></defs><path d="M30 130 18 160M170 130l12 30M100 130v30" stroke="#5A2E14" stroke-width="7" stroke-linecap="round"/><path d="M34 40c-14 30-14 66 0 92h132c14-26 14-62 0-92z" fill="url(#nkBdG)" stroke="#5A2E14" stroke-width="3"/><ellipse cx="100" cy="40" rx="68" ry="20" fill="#EBD19C" stroke="#5A2E14" stroke-width="3"/><ellipse cx="100" cy="40" rx="50" ry="13" fill="none" stroke="#B88A4A" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<circle cx="' + (40 + i * 17) + '" cy="' + (50 + Math.sin(i / 7 * Math.PI) * 6) + '" r="3" fill="' + BK.emas + '"/>'; }).join('')); }
  N.reg('ubukber', {
    id: 'bukber', mode: 'acara', nama: 'Undangan Bukber & Halal Bihalal', kicker: 'BUKA PUASA BERSAMA', kickerMap: { bukber: 'BUKA PUASA BERSAMA', halal: 'HALAL BIHALAL', reuni: 'SILATURAHMI' }, judulTokoh: 'Penyelenggara', buka: 'bedug', gayaOk: 'lentera', suaraBuka: 'ubukber', waktuBuka: [1900, 2800], petunjuk: 'Ketuk bedug untuk membuka undangan',
    label: { hitung: function (d) { return d.jenis === 'halal' ? 'Menuju Halal Bihalal' : (d.jenis === 'reuni' ? 'Menuju Silaturahmi' : 'Menuju Waktu Berbuka'); } },
    atas: function (d) { return d && d.basmalah ? ARAB : ''; },
    lentera: lenteraB, bulan: bulan, bedug: bedug,
    karangan: function () { var g = '<circle cx="200" cy="200" r="148" fill="none" stroke="' + BK.emas + '" stroke-width="2.6"/><circle cx="200" cy="200" r="139" fill="none" stroke="' + BK.zamrud + '" stroke-width="1.4"/>'; g += lingkar(162, 16, function (x, y, a, i) { return i % 2 ? bintang(f(x), f(y), 8, BK.emas) : '<path d="M' + f(x) + ' ' + f(y - 9) + 'A9 9 0 1 0 ' + f(x + 8) + ' ' + f(y + 5) + 'A7 7 0 0 1 ' + f(x) + ' ' + f(y - 9) + 'Z" fill="' + BK.zamrud + '"/>'; }); return svg('0 0 400 400', g); },
    pembatas: function () { return pemb('<path d="M0-9A9 9 0 1 0 8 5 7 7 0 0 1 0-9Z" fill="' + BK.emas + '"/>', BK.emas); },
    pengganti: function () { return bundar('<path d="M70 26A34 34 0 1 0 92 70 28 28 0 0 1 70 26Z" fill="' + BK.emas + '"/>' + bintang(84, 40, 7, '#FFF3C4'), BK.zamrud); },
    sdt: function () { return svg('0 0 52 52', '<path d="M26 2V9" stroke="#B8841C" stroke-width="1.6"/><path d="M19 9H33L36 16H16Z" fill="#B8841C"/><path d="M16 16H36C40 28 38 38 33 46H19C14 38 12 28 16 16Z" fill="' + BK.emas + '" stroke="#B8841C" stroke-width="1.4"/>'); },
    sudut: function (p) { var kiri = p === 'a' || p === 'c'; return svg('0 0 200 120', '<g transform="translate(' + (kiri ? 14 : 150) + ' 0) scale(.46)">' + lenteraB(0).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g><g transform="translate(' + (kiri ? 58 : 106) + ' 0) scale(.36)">' + lenteraB(1).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g>' + bintang(kiri ? 100 : 100, 30, 8, BK.emas)); },
    partikel: { palet: ['#E3B341', '#FFF3C4', '#0F6B54', '#FFFFFF'], svg: function (w) { return svg('0 0 24 24', bintang(12, 12, 10, w)); }, n: 10 }
  });
})();
