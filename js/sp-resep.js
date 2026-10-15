/* ==========================================================
   RESEP KASIH SAYANG — kartu resep tulisan tangan; tiap bahan yang dimasukkan ke panci membuka satu kenangan atau
   ucapan terima kasih; hidangan jadi berisi pesan utama. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var TOPLES = function (w) { return '<svg viewBox="0 0 60 70" aria-hidden="true"><rect x="10" y="2" width="40" height="10" rx="4" fill="#C98A4B"/><rect x="6" y="12" width="48" height="52" rx="12" fill="' + w + '" opacity=".9"/><rect x="6" y="12" width="48" height="52" rx="12" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M14 22c-2 10-2 24 0 34" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/></svg>'; };
  var PALET = ['#F2B45A', '#F28B82', '#9AD18B', '#8FC7E8', '#C7A6E8', '#F5D36B'];
  var PANCI = '<svg viewBox="0 0 160 110" aria-hidden="true"><path d="M20 30h120v40c0 24-16 36-60 36S20 94 20 70z" fill="#C8573D"/><path d="M12 30h136" stroke="#8E3623" stroke-width="8" stroke-linecap="round"/><path d="M4 44h16M140 44h16" stroke="#8E3623" stroke-width="7" stroke-linecap="round"/><path d="M30 44c-2 20 0 34 8 44" stroke="#fff" stroke-width="4" opacity=".35" fill="none" stroke-linecap="round"/></svg>';
  var MANGKUK = '<svg viewBox="0 0 160 110" aria-hidden="true"><path d="M10 52h140c0 36-30 54-70 54S10 88 10 52z" fill="#fff" stroke="#E8745A" stroke-width="4"/><path d="M30 52c10-28 90-28 100 0z" fill="#F2B45A"/><path d="M55 44c6-12 14-12 20 0s14 12 20 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M80 30l4-10 4 10" stroke="#E8745A" stroke-width="3" fill="none"/></svg>';
  S.reg('resep', {
    nama: 'Resep Kasih Sayang',
    adapt: function (f, c) { var h = f.hidangan || {}; return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Resep Kasih Sayang', bahan: (f.bahan || []).map(function (b) { return { nama: b.nama, cerita: b.cerita, foto: b.foto }; }), hidangan: { nama: h.nama || 'Semangkuk Kasih Sayang', pesan: h.pesan || '' } }; },
    mulai: function (root, d) {
      function layar(h, k) { root.innerHTML = '<div class="sp-layar rs-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function kartu() {
        var el = layar('<div class="rs-kartu"><p class="rs-kop">KARTU RESEP</p><h1>' + esc(d.judul) + '</h1><p class="rs-untuk">Disiapkan untuk ' + esc(d.penerima) + '</p><ul class="rs-daftar">' + d.bahan.map(function (b) { return '<li>' + esc(b.nama) + '</li>'; }).join('') + '</ul><button type="button" class="rs-btn">Mulai Memasak</button></div>', 'rs-kartul');
        el.querySelector('.rs-btn').addEventListener('click', function () { if (window.Suara) window.Suara.kertas(); masak(); });
      }
      function masak() {
        var n = d.bahan.length, pakai = 0;
        var rak = d.bahan.map(function (b, i) { return '<button type="button" class="rs-jar" data-i="' + i + '">' + TOPLES(PALET[i % PALET.length]) + '<span>' + esc(b.nama) + '</span></button>'; }).join('');
        var el = layar('<div class="rs-dapur"><h2>Tambahkan bahannya</h2><p class="rs-pet" id="rsP">Ketuk satu per satu. Tiap bahan menyimpan sebuah cerita.</p><div class="rs-panci" id="rsPc" style="--isi:0%"><i class="rs-uap u1"></i><i class="rs-uap u2"></i><i class="rs-uap u3"></i>' + PANCI + '<span class="rs-isi"></span></div><div class="rs-rak">' + rak + '</div><div class="rs-cerita" id="rsC" aria-live="polite"></div><button type="button" class="rs-btn" id="rsSaji" hidden>Aduk dan sajikan ›</button></div>', 'rs-dapurl');
        el.querySelectorAll('.rs-jar').forEach(function (j) {
          j.addEventListener('click', function () {
            if (j.classList.contains('pakai')) return; j.classList.add('pakai'); pakai++; var b = d.bahan[Number(j.dataset.i)];
            if (window.Suara) window.Suara.tumbuh(); el.querySelector('#rsPc').style.setProperty('--isi', (pakai / n * 70) + '%'); el.querySelector('#rsPc').classList.add('masuk'); S.jeda(function () { var p = el.querySelector('#rsPc'); if (p) p.classList.remove('masuk'); }, 600);
            el.querySelector('#rsC').innerHTML = '<div class="rs-bahan"><h3>' + esc(b.nama) + '</h3>' + (b.foto ? '<img alt="" src="' + esc(S.src(b.foto, pakai)) + '">' : '') + '<p>' + esc(b.cerita) + '</p></div>'; el.querySelector('#rsP').textContent = pakai + ' dari ' + n + ' bahan sudah masuk';
            if (pakai === n) el.querySelector('#rsSaji').hidden = false;
          });
        });
        el.querySelector('#rsSaji').addEventListener('click', function (e) { e.currentTarget.hidden = true; el.querySelector('#rsPc').classList.add('aduk'); if (window.Suara) window.Suara.whoosh(); S.jeda(sajikan, 1700); });
      }
      function sajikan() {
        layar('<div class="rs-hidang"><div class="rs-mangkuk" aria-hidden="true">' + MANGKUK + '</div><p class="rs-kop">HIDANGAN SIAP</p><h2>' + esc(d.hidangan.nama) + '</h2><p class="rs-pesan">' + S.kata(d.hidangan.pesan, 4500, 52) + '</p>' + S.kredit(d.pengirim) + '</div>', 'rs-hidangl');
        if (window.Suara) window.Suara.sukses(); S.confetti(innerWidth / 2, innerHeight * 0.3, 44, ['#E8745A', '#F2B45A', '#F28B82', '#fff'], { kuat: 8 }); S.akhir();
      }
      kartu();
    }
  });
})();
