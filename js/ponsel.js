/* ==========================================================
   PONSEL — tampilan kartu desain berupa dua ponsel (mockup) dengan pratinjau HIDUP dari desainnya sendiri.
   Hanya tampilan: isi dan tema desain tidak diubah. Pratinjau hidup (iframe) dimuat malas dan dibatasi jumlahnya;
   sisanya memakai gambar adegan statis. Dapat dimatikan lewat DEARORA_CONFIG.PONSEL = false.
   ========================================================== */
(function () {
  'use strict';
  var LEBAR = 390, cfg = window.DEARORA_CONFIG || {}, aktifSet = new Map(), jadwal = 0;
  function hemat() { var c = navigator.connection || {}; return !!c.saveData || (navigator.deviceMemory && navigator.deviceMemory < 2); }
  function aktif() { return cfg.PONSEL !== false; }
  function maks() { if (hemat()) return 0; var n = navigator.hardwareConcurrency || 4; return n >= 8 ? 6 : (n <= 2 ? 2 : 4); }
  function daftar() { return Array.prototype.slice.call(document.querySelectorAll('.ponsel')); }
  function skala(el) {
    var l = el.querySelector('.ph-depan .layar'), b = el.querySelector('.ph-belakang .layar'); if (!l) return;
    if (l.clientWidth) el.style.setProperty('--s', (l.clientWidth / LEBAR).toFixed(4));
    if (b && b.clientWidth) el.style.setProperty('--sb', (b.clientWidth / LEBAR).toFixed(4));
  }
  function nyalakan(el) {
    if (aktifSet.has(el)) return; var kanvas = el.querySelector('.ph-depan .kanvas'); if (!kanvas) return;
    var f = document.createElement('iframe'); f.className = 'ph-iframe'; f.src = el.getAttribute('data-src'); f.title = 'Pratinjau ' + (el.getAttribute('data-nama') || 'desain');
    f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true'); f.setAttribute('scrolling', 'no');
    f.addEventListener('load', function () { el.classList.add('hidup'); }); kanvas.appendChild(f); aktifSet.set(el, f);
  }
  function matikan(el) { var f = aktifSet.get(el); if (f) { f.remove(); aktifSet.delete(el); } el.classList.remove('hidup'); }
  function perbarui() {
    jadwal = 0; var all = daftar(), tinggi = window.innerHeight || 800, tengah = tinggi / 2, M = aktif() ? maks() : 0;
    aktifSet.forEach(function (f, el) { if (!document.body.contains(el)) aktifSet.delete(el); });
    var terlihat = [];
    all.forEach(function (el) { Array.prototype.forEach.call(el.querySelectorAll('.ph-snap:not(.siap)'), function (im) { if (im.complete && im.naturalWidth) { im.classList.add('siap'); if (im.parentNode) im.parentNode.classList.add('snap-siap'); } }); skala(el); if (!el.hasAttribute('data-src')) return; var r = el.getBoundingClientRect(); if (r.height && r.bottom > -40 && r.top < tinggi + 40) terlihat.push({ el: el, d: Math.abs((r.top + r.bottom) / 2 - tengah) }); });
    terlihat.sort(function (a, b) { return a.d - b.d; });
    var pilih = terlihat.slice(0, M).map(function (x) { return x.el; });
    all.forEach(function (el) { if (pilih.indexOf(el) < 0) matikan(el); });
    pilih.forEach(nyalakan);
  }
  function tunda() { if (!jadwal) jadwal = requestAnimationFrame(perbarui); }
  function mulai() {
    window.addEventListener('scroll', tunda, { passive: true }); window.addEventListener('resize', tunda);
    document.addEventListener('load', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('ph-snap')) { t.classList.add('siap'); if (t.parentNode) t.parentNode.classList.add('snap-siap'); } }, true);          // gambar layar kedua: tampil halus setelah termuat; bila gagal, adegan statis tetap terlihat
    var mo = new MutationObserver(tunda); mo.observe(document.body, { childList: true, subtree: true });
    if (window.ResizeObserver) { var ro = new ResizeObserver(tunda); ro.observe(document.body); }
    tunda();
  }
  /** Markup mockup dua ponsel untuk satu desain. adegan = HTML adegan statis (cadangan); src = alamat pratinjau hidup. */
  function html(opsi) {
    var s = opsi.adegan || '', statis = !!opsi.statis, kunci = opsi.kunci || '';
    function snap(nama) { return kunci ? '<img class="ph-snap" src="/assets/ponsel/' + nama + '.webp" alt="" width="234" height="507" loading="lazy" decoding="async">' : ''; }
    return '<div class="ponsel' + (statis ? ' ponsel-statis' : '') + '" aria-hidden="true"' + (statis ? '' : ' data-src="' + opsi.src + '"') + ' data-nama="' + opsi.nama + '" style="--a:' + opsi.aksen + ';--b:' + opsi.latar + '"><i class="ponsel-kilau"></i>' +
      '<div class="ph ph-belakang"><div class="layar"><div class="kanvas">' + s + '</div>' + snap(kunci) + '</div></div>' +
      '<div class="ph ph-depan"><div class="layar">' + snap(kunci + '-1') + '<div class="kanvas"><div class="poster">' + s + '</div></div></div></div></div>';
  }
  window.Ponsel = { aktif: aktif, html: html, perbarui: perbarui };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
