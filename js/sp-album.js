/* ==========================================================
   ALBUM TAHUN-TAHUNKU — album foto bernuansa pastel: tiap halaman satu usia atau tahun penting (polaroid, stiker usia, cerita).
   Halaman terakhir menampilkan usia sekarang dan pesan utama. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var PAL = ['#FFC4D6', '#CDB8F5', '#BDEBD8', '#FFE3A3', '#BFDDF7'], PAL2 = ['#FF9DBB', '#A98BE8', '#8FD6B8', '#FFCB5C', '#8DBCEB'];
  function kosong(i) { var a = PAL[i % 5], b = PAL2[i % 5]; return '<svg viewBox="0 0 120 150" aria-hidden="true"><rect width="120" height="150" fill="' + a + '"/><circle cx="60" cy="62" r="28" fill="#fff" opacity=".7"/><path d="M60 38c-12 0-18 9-18 19 0 14 11 22 18 25 7-3 18-11 18-25 0-10-6-19-18-19z" fill="' + b + '"/><path d="M60 82c-4 8 4 10 0 18" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M20 130c14-14 26-14 40 0s26 14 40 0" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/></svg>'; }
  S.reg('album', {
    nama: 'Album Tahun-Tahunku',
    adapt: function (f, c) {
      var k = f.kini || {};
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Album Tahun-Tahunku', tahun: (f.tahun || []).map(function (x) { return { usia: x.usia, judul: x.judul, cerita: x.cerita, foto: x.foto }; }), kini: { usia: k.usia || '', pesan: k.pesan || '' } };
    },
    mulai: function (root, d) {
      var n = d.tahun.length, i = 0;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar ab-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function sampul() {
        var el = layar('<div class="ab-sampul"><p class="ab-kop">ALBUM KELUARGA</p><h1>' + esc(d.judul) + '</h1><div class="ab-hias" aria-hidden="true">' + kosong(0) + '</div><p class="ab-untuk">Untuk ' + esc(d.penerima) + '</p><button type="button" class="ab-btn" id="abBuka">Buka album</button></div>');
        el.querySelector('#abBuka').addEventListener('click', function () { if (window.Suara) { window.Suara.kertas(); window.Suara.buka(); } halaman(0, 1); });
      }
      function garis(k) { return '<ol class="ab-garis" aria-label="Garis waktu">' + d.tahun.map(function (t, j) { return '<li class="' + (j === k ? 'on' : (j < k ? 'lalu' : '')) + '"><i></i></li>'; }).join('') + '<li class="' + (k >= n ? 'on' : '') + '"><i></i></li></ol>'; }
      function halaman(k, arah) {
        if (k >= n) return kini();
        i = k; var t = d.tahun[k];
        var el = layar(garis(k) + '<div class="ab-hal ' + (arah > 0 ? 'maju' : 'mundur') + '"><div class="ab-polaroid" style="--r:' + (k % 2 ? 2.2 : -2.2) + 'deg"><span class="ab-pita" aria-hidden="true"></span><div class="ab-foto">' + (t.foto ? '<img alt="" src="' + esc(S.src(t.foto, k)) + '">' : kosong(k)) + '</div><span class="ab-stiker" style="--c:' + PAL2[k % 5] + '">' + esc(t.usia) + '</span></div><h2>' + esc(t.judul) + '</h2><p class="ab-cerita">' + esc(t.cerita) + '</p></div><div class="ab-nav">' + (k > 0 ? '<button type="button" class="ab-kecil" id="abK" aria-label="Halaman sebelumnya">‹ Kembali</button>' : '<span></span>') + '<button type="button" class="ab-btn" id="abL">' + (k < n - 1 ? 'Halaman berikutnya ›' : 'Tahun ini ›') + '</button></div>');
        if (window.Suara && k) window.Suara.kertas();
        el.querySelector('#abL').addEventListener('click', function () { halaman(k + 1, 1); });
        var b = el.querySelector('#abK'); if (b) b.addEventListener('click', function () { halaman(k - 1, -1); });
        var x0 = null; el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        el.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -60) halaman(k + 1, 1); else if (dx > 60 && k > 0) halaman(k - 1, -1); }, { passive: true });
      }
      function kini() {
        layar(garis(n) + '<div class="ab-kini"><p class="ab-kop">DAN SEKARANG</p><div class="ab-besar" aria-label="' + esc(d.kini.usia) + '"><b>' + esc(d.kini.usia) + '</b></div><div class="ab-pesan"><p>' + S.kata(d.kini.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim) + '</div></div>');
        if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); } S.confetti(innerWidth / 2, innerHeight * 0.28, 70, PAL2.concat(PAL, ['#fff']), { kuat: 9 }); S.akhir();
      }
      sampul();
    }
  });
})();
