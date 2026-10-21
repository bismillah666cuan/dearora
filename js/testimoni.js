/* ==========================================================
   TESTIMONI PUBLIK — hanya testimoni yang dipilih admin untuk tampil. Tidak ada rata-rata bintang gabungan:
   setiap testimoni ditampilkan apa adanya dengan bintangnya sendiri.
   ========================================================== */
(function () {
  'use strict';
  var U = window.Util || {}, esc = U.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cache = null, waktu = 0, sedang = null, BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  function muat() {
    if (cache && Date.now() - waktu < 300000) return Promise.resolve(cache);
    if (sedang) return sedang;
    if (!(window.DearoraAPI && window.DearoraAPI.siap && window.DearoraAPI.siap())) return Promise.resolve({ daftar: [], jumlah: 0 });
    sedang = window.DearoraAPI.get('getTestimoni', {}, { coba: 1, timeout: 12000 }).then(function (r) { sedang = null; cache = (r && r.success && r.data) ? r.data : { daftar: [], jumlah: 0 }; waktu = Date.now(); return cache; }, function () { sedang = null; return { daftar: [], jumlah: 0 }; });
    return sedang;
  }
  function bulan(s) { var m = /^(\d{4})-(\d{2})/.exec(String(s || '')); return m ? BULAN[Number(m[2]) - 1] + ' ' + m[1] : ''; }
  function kartu(x) {
    var n = Math.max(1, Math.min(5, Number(x.rating) || 5)), b = '', i; for (i = 1; i <= 5; i++) b += '<span class="bt' + (i <= n ? ' on' : '') + '" aria-hidden="true">★</span>';
    return '<figure class="card testi-kartu"><div class="bintang" role="img" aria-label="' + n + ' dari 5 bintang">' + b + '</div><blockquote class="testi-isi">' + esc(x.isi) + '</blockquote>' +
      '<figcaption><span><strong>' + esc(x.nama) + '</strong>' + (x.keterangan ? ' · ' + esc(x.keterangan) : '') + '</span><span class="small muted">' + (x.paket ? 'Paket ' + esc(x.paket) : '') + (x.paket && bulan(x.bulan) ? ' · ' : '') + esc(bulan(x.bulan)) + '</span></figcaption></figure>';
  }
  /** Bagian di beranda: tersembunyi sampai ada testimoni yang ditampilkan. */
  function bagianHome() { return '<section class="section" id="testiHome" aria-labelledby="testiJudul" hidden><div class="container"><div class="section-head"><p class="eyebrow">Kata Mereka</p><h2 class="h2" id="testiJudul">Cerita dari yang sudah mencoba</h2></div><div class="testi-grid" id="testiGrid"></div><p class="center" id="testiLink" style="margin-top:1.25rem" hidden><a class="btn btn-secondary" href="#/testimoni">Lihat semua testimoni</a></p></div></section>'; }
  function afterHome() {
    muat().then(function (d) {
      var s = document.getElementById('testiHome'); if (!s || !d || !d.daftar || !d.daftar.length) return;
      document.getElementById('testiGrid').innerHTML = d.daftar.slice(0, 6).map(kartu).join(''); s.hidden = false;
      if (d.daftar.length > 6) document.getElementById('testiLink').hidden = false;
    });
  }
  function halaman() { return '<section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Kata Mereka</p><h1 class="h1">Testimoni</h1><p class="lead">Cerita dari pembeli Dearora, ditampilkan apa adanya.</p></div><div id="testiSemua"><p class="muted center">Memuat…</p></div></div></section>'; }
  function afterHalaman() {
    muat().then(function (d) {
      var e = document.getElementById('testiSemua'); if (!e) return;
      e.innerHTML = d && d.daftar && d.daftar.length ? '<div class="testi-grid">' + d.daftar.map(kartu).join('') + '</div>' : '<div class="state-box"><p>Belum ada testimoni yang ditampilkan.</p><a class="btn btn-primary btn-sm" href="#/contoh-desain">Lihat Contoh Desain</a></div>';
    });
  }
  window.Testi = { bagianHome: bagianHome, afterHome: afterHome, halaman: halaman, afterHalaman: afterHalaman, muat: muat };
})();
