/* ==========================================================
   ART — pustaka ilustrasi SVG kecil (datar, ramah, tanpa gambar eksternal).
   Dipakai halaman kartu (dekorasi) dan katalog (adegan pratinjau).
   Semua fungsi mengembalikan string SVG; tidak ada data pengguna di sini.
   ========================================================== */
(function () {
  'use strict';
  function s(vb, inner, kls) { return '<svg class="art ' + (kls || '') + '" viewBox="' + vb + '" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
  var A = {};

  /* ---- Bentuk dasar ---- */
  A.hati = function (c, k) { return s('0 0 24 24', '<path d="M12 21S2 14 2 7.5A5 5 0 0 1 12 5a5 5 0 0 1 10 2.5C22 14 12 21 12 21z" fill="' + (c || 'currentColor') + '"/>', k); };
  A.bintang = function (c, k) { return s('0 0 24 24', '<path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="' + (c || 'currentColor') + '"/>', k); };
  A.kilau = function (c, k) { return s('0 0 24 24', '<path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z" fill="' + (c || 'currentColor') + '"/>', k); };
  A.coretan = function (c, k) { return s('0 0 60 16', '<path d="M2 9c5-9 9 7 14 0s9 7 14 0 9 7 14 0 9 7 14 0" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="3" stroke-linecap="round"/>', k); };
  A.lingkaran = function (c, k) { return s('0 0 40 40', '<circle cx="20" cy="20" r="14" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"/>', k); };
  A.balon = function (c, k) {
    c = c || '#FF6B6B';
    return s('0 0 60 96', '<ellipse cx="30" cy="31" rx="24" ry="28" fill="' + c + '"/><path d="M26 58l4 8 4-8z" fill="' + c + '"/><path d="M30 66c-7 9 7 15 0 28" fill="none" stroke="#7a6a6a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="21" cy="20" rx="5" ry="9" fill="#fff" opacity=".4" transform="rotate(25 21 20)"/>', k);
  };
  A.kelopak = function (c, k) { return s('0 0 24 32', '<path d="M12 1C20 8 24 18 12 31 0 18 4 8 12 1z" fill="' + (c || '#E8A7A2') + '"/><path d="M12 6v22" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>', k); };
  A.daun = function (c, k) { return s('0 0 40 40', '<path d="M4 36C4 16 16 4 36 4c0 20-12 32-32 32z" fill="' + (c || '#6BB36F') + '"/><path d="M4 36L28 12" stroke="#fff" stroke-opacity=".4" stroke-width="1.6" fill="none"/>', k); };
  A.bunga = function (c1, c2, k) {
    var p = '', i, a, x, y;
    for (i = 0; i < 6; i++) { a = i * Math.PI / 3; x = 24 + Math.cos(a) * 12; y = 24 + Math.sin(a) * 12; p += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="9" fill="' + (c1 || '#FF8FA3') + '"/>'; }
    return s('0 0 48 48', p + '<circle cx="24" cy="24" r="7.5" fill="' + (c2 || '#FFC93C') + '"/>', k);
  };

  /* ---- Wajah & karakter ---- */
  A.matahari = function (k) {
    var r = '', i, a;
    for (i = 0; i < 12; i++) { a = i * Math.PI / 6; r += '<line x1="' + (50 + Math.cos(a) * 30).toFixed(1) + '" y1="' + (50 + Math.sin(a) * 30).toFixed(1) + '" x2="' + (50 + Math.cos(a) * 42).toFixed(1) + '" y2="' + (50 + Math.sin(a) * 42).toFixed(1) + '" stroke="#FFB81C" stroke-width="5" stroke-linecap="round"/>'; }
    return s('0 0 100 100', '<g class="sinar-m">' + r + '</g><circle cx="50" cy="50" r="24" fill="#FFD23F"/><circle cx="42" cy="46" r="2.8" fill="#6B4300"/><circle cx="58" cy="46" r="2.8" fill="#6B4300"/><path d="M42 56q8 8 16 0" fill="none" stroke="#6B4300" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="36" cy="55" rx="4.5" ry="3" fill="#FF8FA3" opacity=".55"/><ellipse cx="64" cy="55" rx="4.5" ry="3" fill="#FF8FA3" opacity=".55"/>', k);
  };
  A.awan = function (wajah, c, k) {
    c = c || '#fff';
    var f = wajah ? '<circle cx="42" cy="36" r="2.6" fill="#5B6B8C"/><circle cx="58" cy="36" r="2.6" fill="#5B6B8C"/><path d="M45 42q5 5 10 0" fill="none" stroke="#5B6B8C" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="37" cy="42" rx="4" ry="2.6" fill="#FFB3C7" opacity=".7"/><ellipse cx="63" cy="42" rx="4" ry="2.6" fill="#FFB3C7" opacity=".7"/>' : '';
    return s('0 0 100 60', '<g fill="' + c + '"><circle cx="26" cy="38" r="15"/><circle cx="45" cy="28" r="20"/><circle cx="68" cy="33" r="17"/><circle cx="82" cy="42" r="12"/><rect x="18" y="38" width="72" height="16" rx="8"/></g>' + f, k);
  };
  A.beruang = function (c, k) {
    c = c || '#C89B6D';
    return s('0 0 100 100', '<circle cx="20" cy="24" r="15" fill="' + c + '"/><circle cx="80" cy="24" r="15" fill="' + c + '"/><circle cx="20" cy="24" r="8" fill="#F3D3B0"/><circle cx="80" cy="24" r="8" fill="#F3D3B0"/><circle cx="50" cy="56" r="38" fill="' + c + '"/><ellipse cx="50" cy="68" rx="15" ry="12" fill="#F3D3B0"/><ellipse cx="50" cy="62" rx="5" ry="3.6" fill="#4A2F1B"/><circle cx="37" cy="48" r="4" fill="#4A2F1B"/><circle cx="63" cy="48" r="4" fill="#4A2F1B"/><circle cx="38.4" cy="46.6" r="1.3" fill="#fff"/><circle cx="64.4" cy="46.6" r="1.3" fill="#fff"/><path d="M44 71q6 6 12 0" fill="none" stroke="#4A2F1B" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="27" cy="63" rx="6" ry="4" fill="#FF8FA3" opacity=".55"/><ellipse cx="73" cy="63" rx="6" ry="4" fill="#FF8FA3" opacity=".55"/>', k);
  };
  A.bulan = function (k) {
    return s('0 0 60 60', '<path d="M38 5A26 26 0 1 0 56 42 21 21 0 0 1 38 5z" fill="#FFE8A3"/><path d="M19 30q3 3.4 6 0M18 40q5 5 10 0" fill="none" stroke="#B88F2D" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="17" cy="38" rx="3.5" ry="2.4" fill="#FFB3C7" opacity=".7"/>', k);
  };
  A.kupu = function (c1, c2, k) {
    c1 = c1 || '#FF8FB1'; c2 = c2 || '#FFD166';
    return s('0 0 60 50', '<g class="sayap sayap-kiri" style="transform-origin:30px 26px"><ellipse cx="18" cy="17" rx="15" ry="11" transform="rotate(-24 18 17)" fill="' + c1 + '"/><ellipse cx="21" cy="35" rx="11" ry="8.5" transform="rotate(18 21 35)" fill="' + c2 + '"/></g><g class="sayap sayap-kanan" style="transform-origin:30px 26px"><ellipse cx="42" cy="17" rx="15" ry="11" transform="rotate(24 42 17)" fill="' + c1 + '"/><ellipse cx="39" cy="35" rx="11" ry="8.5" transform="rotate(-18 39 35)" fill="' + c2 + '"/></g><rect x="28" y="14" width="4" height="26" rx="2" fill="#5B3A3A"/><path d="M29 14q-4-8-9-9M31 14q4-8 9-9" fill="none" stroke="#5B3A3A" stroke-width="1.4" stroke-linecap="round"/>', k);
  };

  /* ---- Wisuda ---- */
  A.topi = function (c, k) {
    c = c || '#D4AF55';
    return s('0 0 64 50', '<path d="M32 4L2 17l30 13 30-13z" fill="#16264A" stroke="' + c + '" stroke-width="1.6"/><path d="M15 24v11c0 6 34 6 34 0V24l-17 7z" fill="#0F1F3D" stroke="' + c + '" stroke-width="1.2"/><path d="M58 19v17" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/><circle cx="58" cy="39" r="3.4" fill="' + c + '"/><circle cx="32" cy="17" r="2.2" fill="' + c + '"/>', k);
  };
  A.gulungan = function (c, k) {
    c = c || '#D4AF55';
    return s('0 0 90 64', '<rect x="10" y="8" width="70" height="42" rx="3" fill="#FBF6E9" stroke="' + c + '" stroke-width="1.6"/><rect x="5" y="6" width="9" height="46" rx="4.5" fill="#EFE3C2" stroke="' + c + '" stroke-width="1.2"/><rect x="76" y="6" width="9" height="46" rx="4.5" fill="#EFE3C2" stroke="' + c + '" stroke-width="1.2"/><path d="M24 20h42M28 28h34M32 36h26" stroke="#B89A55" stroke-width="2" stroke-linecap="round"/><circle cx="45" cy="52" r="7" fill="' + c + '"/><path d="M40 57l-3 8 8-3 8 3-3-8" fill="#B8903A"/>', k);
  };
  A.laurel = function (c, k) {
    c = c || '#D4AF55';
    var g = '', i, t, x, y, a;
    for (i = 0; i < 7; i++) {
      t = i / 6; a = 200 + t * 120;
      x = 60 - Math.cos((a - 180) * Math.PI / 180) * 38 + 0; y = 8 + t * 46;
      g += '<ellipse cx="' + (24 + t * 6).toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="9" ry="3.6" transform="rotate(' + (-55 + t * 30).toFixed(0) + ' ' + (24 + t * 6).toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + c + '" opacity="' + (0.95 - t * 0.2).toFixed(2) + '"/>';
      g += '<ellipse cx="' + (96 - t * 6).toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="9" ry="3.6" transform="rotate(' + (55 - t * 30).toFixed(0) + ' ' + (96 - t * 6).toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + c + '" opacity="' + (0.95 - t * 0.2).toFixed(2) + '"/>';
    }
    return s('0 0 120 64', '<path d="M30 6C14 20 16 44 36 58M90 6c16 14 14 38-6 52" fill="none" stroke="' + c + '" stroke-width="1.6" stroke-linecap="round"/>' + g, k);
  };

  /* ---- Ikon keibuan ---- */
  A.cangkir = function (k) { return s('0 0 48 44', '<path d="M8 16h28v10a13 13 0 0 1-13 13h-2A13 13 0 0 1 8 26z" fill="currentColor"/><path d="M36 20h3a5.5 5.5 0 0 1 0 11h-4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M15 9c-2-3 2-4 0-7M22 9c-2-3 2-4 0-7M29 9c-2-3 2-4 0-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/>', k); };
  A.rumah = function (k) { return s('0 0 44 44', '<path d="M3 21L22 5l19 16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 19v19h28V19" fill="currentColor"/><rect x="18" y="26" width="8" height="12" rx="1.5" fill="#fff" opacity=".85"/>', k); };
  A.resep = function (k) { return s('0 0 44 44', '<rect x="7" y="4" width="30" height="36" rx="4" fill="currentColor"/><rect x="11" y="4" width="3" height="36" fill="#fff" opacity=".3"/><path d="M26 17.5S19 13 19 9.5A3.4 3.4 0 0 1 26 9a3.4 3.4 0 0 1 7 .5c0 3.5-7 8-7 8z" transform="translate(-3 8) scale(.9)" fill="#fff" opacity=".9"/>', k); };
  A.sendok = function (k) { return s('0 0 44 44', '<ellipse cx="22" cy="12" rx="9" ry="11" fill="currentColor"/><path d="M19.5 22h5l-1 18a1.5 1.5 0 0 1-3 0z" fill="currentColor"/>', k); };
  A.pelukan = function (k) { return s('0 0 44 44', '<path d="M22 37S5 27 5 15.5A8 8 0 0 1 22 12a8 8 0 0 1 17 3.5C39 27 22 37 22 37z" fill="currentColor"/>', k); };
  A.ikon = function (nama, k) {
    var f = { cangkir: A.cangkir, bunga: function (kk) { return A.bunga('currentColor', '#fff', kk); }, rumah: A.rumah, hati: A.pelukan, resep: A.resep, sendok: A.sendok };
    return (f[nama] || A.pelukan)(k);
  };

  /* ---- Medali / ornamen ---- */
  A.pojok = function (c, k) { return s('0 0 60 60', '<path d="M3 57V12C3 6 6 3 12 3h45M3 57h0" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="1.6"/><path d="M10 50V16c0-4 2-6 6-6h34" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width=".9"/><circle cx="3" cy="3" r="2.6" fill="' + (c || 'currentColor') + '"/>', k); };

  window.Art = A;
})();
