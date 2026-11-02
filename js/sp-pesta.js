/* ==========================================================
   PESTA KEJUTAN — ruang pesta pastel yang awalnya redup. Penerima menyalakan lampu, membuka kotak hadiah satu per satu
   (tiap kotak berisi ucapan atau kenangan), memecahkan balon, lalu spanduk dan pesan utama muncul. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var PAL = ['#FFC4D6', '#CDB8F5', '#BDEBD8', '#FFE3A3', '#BFDDF7'], PAL2 = ['#FF9DBB', '#A98BE8', '#8FD6B8', '#FFCB5C', '#8DBCEB'];
  function kado(i) { var a = PAL[i % 5], b = PAL2[i % 5]; return '<svg viewBox="0 0 90 90" aria-hidden="true"><rect x="10" y="38" width="70" height="46" rx="8" fill="' + a + '"/><rect x="6" y="26" width="78" height="18" rx="7" fill="' + b + '"/><rect x="40" y="26" width="10" height="58" fill="#fff" opacity=".85"/><path d="M45 26C34 8 18 12 24 22c4 6 15 4 21 4zM45 26c11-18 27-14 21-4-4 6-15 4-21 4z" fill="#fff"/><circle cx="45" cy="25" r="5" fill="' + b + '"/></svg>'; }
  function balon(i) { var a = PAL2[i % 5]; return '<svg viewBox="0 0 60 90" aria-hidden="true"><path d="M30 4C14 4 6 18 6 33c0 19 14 31 24 36 10-5 24-17 24-36C54 18 46 4 30 4z" fill="' + a + '"/><ellipse cx="20" cy="22" rx="5" ry="9" fill="#fff" opacity=".5" transform="rotate(22 20 22)"/><path d="M26 70l4-5 4 5z" fill="' + a + '"/><path d="M30 70c-6 8 6 12 0 19" fill="none" stroke="#B7A9C9" stroke-width="1.4"/></svg>'; }
  S.reg('pesta', {
    nama: 'Pesta Kejutan',
    adapt: function (f, c) {
      var h = f.hadiah || [], p = f.puncak || {};
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Pesta Kejutan', usia: String(f.usia || '').replace(/[^0-9]/g, '').slice(0, 3),
        hadiah: h.map(function (x) { return { judul: x.judul, isi: x.isi, foto: x.foto }; }), spanduk: p.judul || 'Selamat Ulang Tahun!', pesan: p.pesan || '' };
    },
    mulai: function (root, d) {
      var lampu = '', bendera = '', i;
      for (i = 0; i < 12; i++) lampu += '<i style="--d:' + (i * 90) + 'ms"></i>';
      for (i = 0; i < 9; i++) bendera += '<i style="--c:' + PAL[i % 5] + ';--d:' + (i * 70) + 'ms"></i>';
      root.innerHTML = '<div class="sp-layar pt-layar gelap"><div class="pt-lampu" aria-hidden="true">' + lampu + '</div><div class="pt-bendera" aria-hidden="true">' + bendera + '</div><div class="pt-isi" id="ptIsi"></div></div>';
      var el = root.firstChild, isi = el.querySelector('#ptIsi');
      function ganti(h) { isi.innerHTML = h; isi.classList.remove('masuk'); void isi.offsetWidth; isi.classList.add('masuk'); el.scrollTop = 0; }
      function gelap() {
        ganti('<p class="pt-kop">RUANG PESTA</p><h1>' + esc(d.judul) + '</h1><p class="pt-pet">Ruangannya masih gelap. Ada sesuatu yang menunggumu di sini, ' + esc(d.penerima) + '.</p><button type="button" class="pt-btn" id="ptNyala">Nyalakan lampu</button>');
        isi.querySelector('#ptNyala').addEventListener('click', function (e) {
          e.currentTarget.disabled = true; el.classList.remove('gelap'); el.classList.add('terang'); if (window.Suara) { window.Suara.ding(); window.Suara.whoosh(); }
          S.dariEl(isi.querySelector('h1'), 24, PAL2.concat(['#fff']), { kuat: 7 }); S.jeda(hadiah, 1700);
        });
      }
      function hadiah() {
        var n = d.hadiah.length, buka = 0;
        ganti('<h2>Buka hadiahnya</h2><p class="pt-pet" id="ptP">Ketuk kotaknya satu per satu.</p><div class="pt-rak">' + d.hadiah.map(function (h, k) { return '<button type="button" class="pt-kado" data-i="' + k + '" aria-label="Hadiah ' + (k + 1) + '">' + kado(k) + '<span>' + (k + 1) + '</span></button>'; }).join('') + '</div><div class="pt-kartu" id="ptK" aria-live="polite"></div><button type="button" class="pt-btn" id="ptLanjut" hidden>Lanjut ke balon ›</button>');
        isi.querySelectorAll('.pt-kado').forEach(function (b) {
          b.addEventListener('click', function () {
            var h = d.hadiah[Number(b.dataset.i)];
            if (!b.classList.contains('buka')) { b.classList.add('buka'); buka++; if (window.Suara) window.Suara.hadiah(); S.dariEl(b, 16, PAL2.concat(['#fff']), { kuat: 6 }); }
            isi.querySelector('#ptK').innerHTML = '<h3>' + esc(h.judul) + '</h3>' + (h.foto ? '<img alt="" src="' + esc(S.src(h.foto, Number(b.dataset.i))) + '">' : '') + '<p>' + esc(h.isi) + '</p>';
            isi.querySelector('#ptP').textContent = buka < n ? buka + ' dari ' + n + ' hadiah sudah dibuka.' : 'Semua hadiah sudah dibuka!';
            if (buka === n) isi.querySelector('#ptLanjut').hidden = false;
          });
        });
        isi.querySelector('#ptLanjut').addEventListener('click', balonan);
      }
      function balonan() {
        var sisa = 5, kiri = [8, 28, 48, 66, 82];
        ganti('<h2>Pecahkan balonnya!</h2><p class="pt-pet" id="ptP2">Ketuk balon sampai habis.</p><div class="pt-langit">' + kiri.map(function (x, k) { return '<button type="button" class="pt-balon" style="left:' + x + '%;--w:' + (3.2 + k * 0.45) + 's" aria-label="Balon ' + (k + 1) + '">' + balon(k) + '</button>'; }).join('') + '</div>');
        isi.querySelectorAll('.pt-balon').forEach(function (b, k) {
          b.addEventListener('click', function () {
            if (b.classList.contains('pecah')) return; b.classList.add('pecah'); sisa--; if (window.Suara) window.Suara.pop(); S.dariEl(b, 14, [PAL2[k % 5], PAL[k % 5], '#fff'], { kuat: 7 });
            isi.querySelector('#ptP2').textContent = sisa ? 'Tinggal ' + sisa + ' balon lagi.' : 'Semua balon pecah!';
            if (!sisa) S.jeda(puncak, 800);
          });
        });
      }
      function puncak() {
        ganti('<div class="pt-spanduk"><span>' + esc(d.spanduk) + '</span></div>' + (d.usia ? '<div class="pt-usia" aria-label="Usia ' + esc(d.usia) + '"><b>' + esc(d.usia) + '</b></div>' : '') + '<div class="pt-pesan"><p>' + S.kata(d.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim) + '</div>');
        if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); }
        S.confetti(innerWidth / 2, innerHeight * 0.25, 70, PAL2.concat(PAL, ['#fff']), { kuat: 9 }); S.jeda(function () { S.confetti(innerWidth * 0.2, innerHeight * 0.3, 40, PAL2, { kuat: 8 }); S.confetti(innerWidth * 0.8, innerHeight * 0.3, 40, PAL2, { kuat: 8 }); }, 700);
        S.akhir();
      }
      gelap();
    }
  });
})();
