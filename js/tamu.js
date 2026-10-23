/* ==========================================================
   TAMU UNDANGAN — mengurai daftar nama + sebutan menjadi sapaan ("Kepada Yth. Saudari Laiba") dan tautan personal.
   Dipakai bersama oleh form pemesanan (langkah Daftar Tamu) dan Portal (pembuat tautan).
   ========================================================== */
(function () {
  'use strict';
  var SEB_KUNCI = { 'bapak/ibu': 'bapakibu', 'saudara/i': 'saudarai', bapak: 'bapak', bpk: 'bapak', pak: 'bapak', ibu: 'ibu', bu: 'ibu', saudara: 'saudara', sdr: 'saudara', saudari: 'saudari', sdri: 'saudari', kakak: 'kak', kak: 'kak' };
  var SEB_TEKS = { bapak: 'Bapak', ibu: 'Ibu', saudara: 'Saudara', saudari: 'Saudari', kak: 'Kak', bapakibu: 'Bapak/Ibu', saudarai: 'Saudara/i' }, SUF_TEKS = { keluarga: 'beserta Keluarga', pasangan: '& Pasangan' };
  var RE_SEB = /^(bapak\/ibu|saudara\/i|bapak|bpk|pak|ibu|bu|saudara|sdr|saudari|sdri|kakak|kak)\.?\s+(.+)$/i, RE_SUF = /\s*(?:&|dan|\+|beserta)?\s*\(?\b(keluarga|pasangan)\)?\s*$/i;
  /** "Saudari Laiba" → {nama:'Laiba', s:'saudari', x:''}; "Ibu Ani dan keluarga" → {nama:'Ani', s:'ibu', x:'keluarga'}; tanpa sebutan memakai sebutan bawaan. */
  function urai(baris, bawaan) {
    var t = String(baris || '').trim(), x = '', s = '', mx = RE_SUF.exec(t);
    if (mx && t.length > mx[0].length) { x = mx[1].toLowerCase(); t = t.slice(0, mx.index).trim(); }
    var ms = RE_SEB.exec(t);
    if (ms) { s = SEB_KUNCI[ms[1].toLowerCase()]; t = ms[2].trim(); } else s = bawaan || '';
    return { nama: t.replace(/[<>]/g, '').replace(/\s+/g, ' ').slice(0, 60), s: s, x: x };
  }
  function sapa(u) { return [SEB_TEKS[u.s] || '', u.nama, SUF_TEKS[u.x] || ''].filter(Boolean).join(' '); }
  /** Teks (satu nama per baris) → daftar objek server {n, s, x}, maksimal 300. */
  function daftar(teks, bawaan) {
    return String(teks || '').split(/\r?\n/).map(function (b) { return b.trim(); }).filter(Boolean).slice(0, 300).map(function (b) { var u = urai(b, bawaan); return { n: u.nama, s: u.s, x: u.x }; }).filter(function (u) { return u.n; });
  }
  /** Daftar objek server → teks untuk kotak isian (sebutan ditulis di depan nama). */
  function teks(arr) { return (arr || []).map(function (u) { return [SEB_TEKS[u.s] || '', u.n, u.x === 'keluarga' ? 'dan keluarga' : (u.x === 'pasangan' ? '& pasangan' : '')].filter(Boolean).join(' '); }).join('\n'); }
  function tautan(url, u) { return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'u=' + encodeURIComponent(u.nama) + (u.s ? '&s=' + u.s : '') + (u.x ? '&x=' + u.x : ''); }
  window.Tamu = { urai: urai, sapa: sapa, daftar: daftar, teks: teks, tautan: tautan, SEB_TEKS: SEB_TEKS };
})();
