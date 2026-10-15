/* ==========================================================
   PENGUMUMAN KELAHIRAN — kartu gosok berisi kabar bahagia, balon kejutan berisi fakta tentang si kecil, dan hitung mundur
   menuju hari lahir. Palet netral (tidak terpaku warna tertentu). Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var BALON = ['#BFD8C6', '#FFD3B8', '#D9CCF5', '#FFE9A3', '#BFE3F7'];
  S.reg('lahir', {
    nama: 'Pengumuman Kelahiran',
    adapt: function (f, c) { return { penerima: c.penerima, pengirim: c.pengirim, kabar: f.kabar || '', foto: f.foto, tanggal: f.tanggal || '', fakta: (f.fakta || []).map(function (x) { return { judul: x.judul, isi: x.isi }; }), penutup: f.penutup || '' }; },
    mulai: function (root, d) {
      function layar(h, k) { root.innerHTML = '<div class="sp-layar lh-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function kartu() {
        var el = layar('<div class="lh-isi"><p class="lh-kicker">KABAR BAHAGIA UNTUK ' + esc(d.penerima).toUpperCase() + '</p><div class="lh-kartu"><div class="lh-bawah">' + (d.foto ? '<img alt="" src="' + esc(S.src(d.foto, 1)) + '">' : '') + '<h2>' + esc(d.kabar) + '</h2></div><canvas class="lh-gosok" aria-hidden="true"></canvas></div><p class="lh-pet" id="lhP">Gosok kartu dengan jarimu untuk melihat kabarnya</p><button type="button" class="lh-btn" id="lhLewat" hidden>Tampilkan saja</button><button type="button" class="lh-btn" id="lhNext" hidden>Lanjut ›</button></div>', 'lh-kartul');
        var k = el.querySelector('.lh-kartu'), cv = el.querySelector('canvas'), r = k.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = r.width * dpr; cv.height = r.height * dpr; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; var x = cv.getContext('2d'); x.scale(dpr, dpr);
        var g = x.createLinearGradient(0, 0, r.width, r.height); g.addColorStop(0, '#C9D3CC'); g.addColorStop(0.5, '#E6EDE8'); g.addColorStop(1, '#B6C3BB'); x.fillStyle = g; x.fillRect(0, 0, r.width, r.height);
        x.fillStyle = 'rgba(70,90,80,.55)'; x.font = '800 15px Plus Jakarta Sans, sans-serif'; x.textAlign = 'center'; x.fillText('GOSOK DI SINI', r.width / 2, r.height / 2); for (var i = 0; i < 240; i++) { x.fillStyle = 'rgba(255,255,255,' + Math.random() * 0.3 + ')'; x.fillRect(Math.random() * r.width, Math.random() * r.height, 2, 2); }
        var turun = false, hitung = 0, tuntas = false;
        function selesai() { if (tuntas) return; tuntas = true; cv.classList.add('hilang'); if (window.Suara) window.Suara.sukses(); S.dariEl(k, 50, ['#BFD8C6', '#FFD3B8', '#D9CCF5', '#FFE9A3'], { kuat: 9, naik: 7 }); el.querySelector('#lhP').textContent = 'Selamat! Ini kabar bahagianya.'; el.querySelector('#lhLewat').hidden = true; el.querySelector('#lhNext').hidden = false; }
        function cek() { var sm = document.createElement('canvas'); sm.width = 28; sm.height = 20; var s2 = sm.getContext('2d'); s2.drawImage(cv, 0, 0, 28, 20); var dt = s2.getImageData(0, 0, 28, 20).data, c = 0, q; for (q = 3; q < dt.length; q += 4) if (dt[q] < 100) c++; if (c / (28 * 20) > 0.5) selesai(); }
        function gosok(e) { if (!turun) return; var b = cv.getBoundingClientRect(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); x.arc(e.clientX - b.left, e.clientY - b.top, 26, 0, 6.3); x.fill(); x.globalCompositeOperation = 'source-over'; if (window.Suara) window.Suara.gosok(); if (++hitung % 5 === 0) cek(); }
        cv.addEventListener('pointerdown', function (e) { turun = true; gosok(e); }); cv.addEventListener('pointermove', gosok); ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { cv.addEventListener(n, function () { turun = false; cek(); }); });
        S.jeda(function () { var b = el.querySelector('#lhLewat'); if (b && !tuntas) b.hidden = false; }, 7000);
        el.querySelector('#lhLewat').addEventListener('click', selesai); el.querySelector('#lhNext').addEventListener('click', balon);
      }
      function balon() {
        var n = d.fakta.length, pecah = 0;
        var bl = d.fakta.map(function (f, i) { return '<button type="button" class="lh-balon" data-i="' + i + '" style="--w:' + BALON[i % BALON.length] + ';left:' + (8 + (i * 84) / Math.max(1, n - 1) * 0.86) + '%;animation-delay:' + (i * 0.5) + 's" aria-label="Pecahkan balon ' + (i + 1) + '"><span>?</span></button>'; }).join('');
        var el = layar('<div class="lh-isi"><p class="lh-kicker">BALON KEJUTAN</p><h2 class="lh-judul">Pecahkan semua balon</h2><div class="lh-langit">' + bl + '</div><div class="lh-fakta" id="lhF" aria-live="polite"></div><button type="button" class="lh-btn" id="lhNext" hidden>Lanjut ›</button></div>', 'lh-balonl');
        el.querySelectorAll('.lh-balon').forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.classList.contains('pecah')) return; b.classList.add('pecah'); pecah++; if (window.Suara) window.Suara.balon(); S.dariEl(b, 22, ['#BFD8C6', '#FFD3B8', '#D9CCF5', '#FFE9A3'], { kuat: 7, naik: 6 });
            var f = d.fakta[Number(b.dataset.i)]; el.querySelector('#lhF').insertAdjacentHTML('afterbegin', '<div class="lh-ft"><b>' + esc(f.judul) + '</b><span>' + esc(f.isi) + '</span></div>');
            if (pecah === n) el.querySelector('#lhNext').hidden = false;
          });
        });
        el.querySelector('#lhNext').addEventListener('click', hitung);
      }
      function hitung() {
        var teksHitung = '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal)) {
          var t = new Date(d.tanggal + 'T00:00:00'), sisa = Math.ceil((t - Date.now()) / 86400000);
          teksHitung = isNaN(sisa) ? '' : sisa > 0 ? '<p class="lh-hitung"><b>' + sisa + '</b><span>hari lagi menuju hari yang kami nantikan</span></p>' : '<p class="lh-hitung"><span>Hari yang kami nantikan sudah tiba. Terima kasih untuk doa dan dukunganmu.</span></p>';
        }
        layar('<div class="lh-isi"><p class="lh-kicker">MENUJU HARI BAHAGIA</p>' + teksHitung + '<p class="lh-pesan">' + S.kata(d.penutup, 4200, 55) + '</p>' + S.kredit(d.pengirim) + '</div>', 'lh-hitungl');
        S.confetti(innerWidth / 2, innerHeight * 0.3, 44, ['#BFD8C6', '#FFD3B8', '#D9CCF5', '#FFE9A3'], { kuat: 8 }); if (window.Suara) window.Suara.sukses(); S.akhir();
      }
      kartu();
    }
  });
})();
