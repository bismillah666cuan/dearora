/* ==========================================================
   DEARORA MALL — penerima mendapat "paket kejutan" dari toko online fiktif.
   Tidak ada transaksi uang. Hadiah = bentuk ucapan (teks, foto, kupon). Penerima memilih
   hadiah → keranjang → kupon → pengiriman fiktif → "Buka Paketku".
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, ic = S.ic, A = window.Art;
  var DEMO = {
    penerima: 'Rani', pengirim: 'Dimas', minimal: 3, kupon: 'LOVE100',
    kuponBonus: 'Bonus kupon: kamu boleh mengambek 1 hari, lalu wajib dipeluk. Berlaku seumur hidup.',
    kategori: ['Cinta & Romansa', 'Doa Ulang Tahun', 'Gemas & Lucu', 'Terima Kasih', 'Pelukan & Penghibur'],
    hadiah: [
      { id: 'peluk', nama: 'Satu Pelukan Gratis', kat: 'Pelukan & Penghibur', harga: 'Tukar kapan saja', ilus: 'hati', warna: '#FFE3D0', desk: 'Berlaku di mana saja, kapan saja, tanpa syarat.', isi: 'Kapan pun kamu butuh pelukan, tinggal bilang. Tidak ada batas penukaran dan tidak ada tanggal kedaluwarsa.' },
      { id: 'cium', nama: 'Seribu Ciuman', kat: 'Cinta & Romansa', harga: '100% Cinta, tak ternilai', ilus: 'bintang', warna: '#FFD9E4', desk: 'Dikirim bertahap, sebanyak yang kamu mau.', isi: 'Kupon ini bisa kamu tukar satu per satu. Stok kupon otomatis bertambah setiap kamu tersenyum.' },
      { id: 'surat', nama: 'Surat Cinta Kecil', kat: 'Cinta & Romansa', harga: 'Gratis selamanya', ilus: 'surat', warna: '#FFF0C9', desk: 'Sepucuk surat pendek yang ditulis dengan tangan sendiri.', isi: 'Hai, ini surat kecil dariku. Aku hanya ingin bilang bahwa hari-hariku lebih ringan karena ada kamu.' },
      { id: 'apresiasi', nama: 'Apresiasi Tanpa Batas', kat: 'Terima Kasih', harga: 'Tak terbatas', ilus: 'bintang', warna: '#DDF1DC', desk: 'Terima kasih untuk hal-hal kecil yang jarang kamu sadari.', isi: 'Terima kasih sudah selalu ada, bahkan di hari yang tidak ada yang melihat perjuanganmu.' },
      { id: 'doa', nama: 'Doa Ulang Tahun Premium', kat: 'Doa Ulang Tahun', harga: 'Dikirim langsung ke langit', ilus: 'hati', warna: '#E7DEFF', desk: 'Daftar doa terbaik, dikurasi khusus untukmu.', isi: 'Semoga sehat, tenang, dicintai dengan benar, dan semua yang kamu perjuangkan pelan-pelan menemukan jalannya.' },
      { id: 'gemas', nama: 'Gemas Level Maksimal', kat: 'Gemas & Lucu', harga: 'Gratis ongkir cinta', ilus: 'surat', warna: '#D7EEFF', desk: 'Untuk dibuka ketika kamu sedang tidak ingin serius.', isi: 'Kamu itu gemas, titik. Kalau kamu membantah, lihat lagi bagian awal kalimat ini.' }
    ],
    utama: { judul: 'Hadiah Utama: Surat dari ' + 'Dimas', foto: '', pesan: 'Rani, semua hadiah tadi hanya pembuka. Hadiah yang sebenarnya adalah ini: aku bersyukur sekali mengenalmu. Terima kasih sudah menjadi alasan banyak hariku terasa baik. Selamat ulang tahun, dan semoga kamu tahu bahwa kamu dicintai.' }
  };
  var ILUS = { hati: function () { return A.hati('#E8336D'); }, bintang: function () { return A.bintang('#FFB020'); }, surat: function () { return '<svg class="art" viewBox="0 0 64 48" aria-hidden="true"><rect x="4" y="8" width="56" height="36" rx="5" fill="#fff" stroke="#E8704A" stroke-width="2.5"/><path d="M5 11l27 20 27-20" fill="none" stroke="#E8704A" stroke-width="2.5" stroke-linejoin="round"/></svg>'; } };
  var LANGKAH = ['Hadiahmu sedang disiapkan', 'Dibungkus dengan cinta', 'Dalam perjalanan', 'Kejutanmu telah tiba!'];

  S.reg('mall', {
    nama: 'Dearora Mall', demo: DEMO,
    adapt: function (f, c) {
      var P = ['#FFE3D0', '#FFD9E4', '#FFF0C9', '#DDF1DC', '#E7DEFF', '#D7EEFF'], u = f.utama || {};
      return { penerima: c.penerima, pengirim: c.pengirim, minimal: Math.min(3, (f.hadiah || []).length), kupon: f.kupon || 'LOVE100',
        kuponBonus: f.kuponBonus || 'Bonus kupon: kamu boleh mengambek 1 hari, lalu wajib dipeluk. Berlaku seumur hidup.',
        kategori: ['Cinta & Romansa', 'Doa Ulang Tahun', 'Gemas & Lucu', 'Terima Kasih', 'Pelukan & Penghibur'],
        hadiah: (f.hadiah || []).map(function (h, i) { return { id: 'h' + i, nama: h.nama, kat: h.kat, harga: h.harga || 'Tak ternilai', ilus: h.ilus, warna: P[i % 6], desk: h.desk || '', isi: h.isi }; }),
        utama: { judul: u.judul || 'Hadiah Utama: Sepucuk Surat', foto: u.foto, pesan: u.pesan } };
    },
    mulai: function (root, d) {
      var pilih = [], filter = '', kuponPakai = false;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar ' + (k || '') + '">' + h + '</div>'; return root.firstChild; }
      function sheet(h) { var s = document.createElement('div'); s.className = 'ml-sheet'; s.innerHTML = '<div class="ml-sheet-isi" role="dialog" aria-modal="true">' + h + '</div>'; root.appendChild(s); s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-tutup]')) s.remove(); }); return s; }
      function header() { return '<header class="ml-head"><div class="ml-baris"><span class="ml-logo">' + ic('gift') + ' Dearora Mall</span><button type="button" class="ml-troli" data-a="troli" aria-label="Keranjang, ' + pilih.length + ' hadiah">' + ic('gift') + '<b id="mlJml">' + pilih.length + '</b></button></div><div class="ml-cari" aria-hidden="true">' + ic('search') + '<span>Cari hadiah cinta, doa, pelukan…</span></div></header>'; }
      function beranda() {
        var cats = ['Semua'].concat(d.kategori);
        var daftar = d.hadiah.filter(function (h) { return !filter || h.kat === filter; });
        var el = layar(header() +
          '<section class="ml-banner"><div><span class="ml-flash">KIRIMAN SPESIAL</span><h1>Paket Spesial untuk ' + esc(d.penerima) + '!</h1><p>Pilih hadiah favoritmu, masukkan ke keranjang, lalu kami kirim.</p></div><div class="ml-truk" aria-hidden="true">' + ic('gift') + '</div></section>' +
          '<div class="ml-kat" role="tablist">' + cats.map(function (c) { return '<button type="button" role="tab" class="ml-chip' + ((c === 'Semua' ? !filter : c === filter) ? ' on' : '') + '" data-kat="' + (c === 'Semua' ? '' : esc(c)) + '" aria-selected="' + (c === 'Semua' ? !filter : c === filter) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
          '<p class="ml-info">Pilih minimal <b>' + d.minimal + '</b> hadiah. Tidak ada transaksi uang sungguhan.</p>' +
          '<div class="ml-grid">' + daftar.map(function (h) {
            var on = pilih.indexOf(h.id) >= 0;
            return '<button type="button" class="ml-prod' + (on ? ' dipilih' : '') + '" data-id="' + esc(h.id) + '"><span class="ml-gambar" style="background:' + h.warna + '">' + ILUS[h.ilus]() + (on ? '<i class="ml-ceklis">' + ic('check') + '</i>' : '') + '</span><strong>' + esc(h.nama) + '</strong><em>' + esc(h.harga) + '</em><small>★ 5.0 · Terjual 999+</small></button>';
          }).join('') + '</div><div class="ml-spasi"></div>' +
          '<div class="ml-bawah"><button type="button" class="ml-lanjut" data-a="troli">Lihat Keranjang (' + pilih.length + ')</button></div>');
        el.addEventListener('click', function (ev) {
          var c = ev.target.closest('[data-kat]'); if (c) { filter = c.dataset.kat; beranda(); return; }
          var p = ev.target.closest('.ml-prod'); if (p) { detail(p.dataset.id); return; }
          if (ev.target.closest('[data-a="troli"]')) troli();
        });
      }
      function detail(id) {
        var h = d.hadiah.filter(function (x) { return x.id === id; })[0], on = pilih.indexOf(id) >= 0;
        var s = sheet('<button type="button" class="ml-x" data-tutup aria-label="Tutup">' + ic('x') + '</button><div class="ml-det-img" style="background:' + h.warna + '">' + ILUS[h.ilus]() + '</div><h2>' + esc(h.nama) + '</h2><p class="ml-harga">' + esc(h.harga) + '</p><p>' + esc(h.desk) + '</p><p class="ml-tag">Kategori: ' + esc(h.kat) + '</p>' +
          '<button type="button" class="ml-klaim' + (on ? ' sudah' : '') + '">' + (on ? 'Sudah di Keranjang' : 'Klaim Hadiah Ini') + '</button>');
        s.querySelector('.ml-klaim').addEventListener('click', function () {
          if (pilih.indexOf(id) < 0) { pilih.push(id); if (window.Suara) window.Suara.sukses(); S.dariEl(s.querySelector('.ml-klaim'), 22, ['#FF7A1A', '#FFB020', '#fff'], { kuat: 6 }); S.toast('Masuk keranjang digital'); }
          s.remove(); beranda();
        });
      }
      function troli() {
        var item = pilih.map(function (id) { return d.hadiah.filter(function (x) { return x.id === id; })[0]; });
        var cukup = pilih.length >= d.minimal;
        var s = sheet('<button type="button" class="ml-x" data-tutup aria-label="Tutup">' + ic('x') + '</button><h2>Keranjang Hadiah</h2>' + (item.length ? item.map(function (h) { return '<div class="ml-item"><span class="ml-mini" style="background:' + h.warna + '">' + ILUS[h.ilus]() + '</span><div><strong>' + esc(h.nama) + '</strong><small>' + esc(h.harga) + '</small></div><button type="button" class="ml-hapus" data-hapus="' + esc(h.id) + '" aria-label="Keluarkan ' + esc(h.nama) + '">' + ic('x') + '</button></div>'; }).join('') : '<p class="ml-kosong">Keranjang masih kosong. Klaim hadiah dulu, ya.</p>') +
          '<form class="ml-kupon" novalidate><label for="mlKupon" class="sr-only">Kode kupon</label><input id="mlKupon" placeholder="Kode kupon (coba: ' + esc(d.kupon) + ')" value="' + (kuponPakai ? esc(d.kupon) : '') + '" autocomplete="off"><button type="submit">' + (kuponPakai ? 'Terpakai' : 'Pakai') + '</button></form><p class="ml-kmsg" role="status">' + (kuponPakai ? 'Kupon ' + esc(d.kupon) + ' dipakai: diskon 100%, gratis selamanya.' : '') + '</p>' +
          '<div class="ml-total"><span>Total</span><b>' + (kuponPakai ? 'Rp 0 · Gratis' : 'Tak ternilai') + '</b></div><button type="button" class="ml-klaim" ' + (cukup ? '' : 'disabled') + '>' + (cukup ? 'Kirim Paketnya' : 'Pilih ' + (d.minimal - pilih.length) + ' hadiah lagi') + '</button>');
        s.addEventListener('click', function (e) { var h = e.target.closest('[data-hapus]'); if (h) { pilih.splice(pilih.indexOf(h.dataset.hapus), 1); s.remove(); beranda(); troli(); } });
        s.querySelector('.ml-kupon').addEventListener('submit', function (e) {
          e.preventDefault(); var v = s.querySelector('#mlKupon').value.trim().toUpperCase(), m = s.querySelector('.ml-kmsg');
          if (v === d.kupon.toUpperCase()) { kuponPakai = true; m.textContent = 'Kupon ' + d.kupon + ' dipakai: diskon 100%, gratis selamanya.'; s.querySelector('.ml-total b').textContent = 'Rp 0 · Gratis'; s.querySelector('.ml-kupon button').textContent = 'Terpakai'; S.dariEl(m, 24, ['#FF7A1A', '#FFB020', '#fff'], { kuat: 6 }); }
          else m.textContent = 'Kupon tidak dikenal. Coba ' + d.kupon + '.';
        });
        s.querySelector('.ml-klaim').addEventListener('click', function () { if (cukup) { s.remove(); kirim(); } });
      }
      function kirim() {
        var el = layar('<div class="ml-kirim"><div class="ml-truk-b" aria-hidden="true">' + ic('gift') + '</div><h1>Pesanan Dikirim</h1><ol class="ml-langkah">' + LANGKAH.map(function (l, i) { return '<li data-i="' + i + '"><i></i><span>' + esc(l) + '</span></li>'; }).join('') + '</ol><button type="button" class="ml-klaim" id="mlBuka" hidden>Buka Paketku</button></div>');
        LANGKAH.forEach(function (_, i) { S.jeda(function () { var li = el.querySelector('[data-i="' + i + '"]'); if (li) { li.classList.add('on'); if (i === 3) { var b = el.querySelector('#mlBuka'); b.hidden = false; S.dariEl(b, 40, ['#FF7A1A', '#FFB020', '#fff'], { kuat: 8 }); } } }, 700 + i * 1300); });
        el.querySelector('#mlBuka').addEventListener('click', buka);
      }
      function buka() {
        var isi = pilih.map(function (id) { return d.hadiah.filter(function (x) { return x.id === id; })[0]; });
        var kartu = isi.map(function (h) { return { judul: h.nama, teks: h.isi, warna: h.warna, ilus: h.ilus }; });
        if (kuponPakai) kartu.push({ judul: 'Bonus Kupon ' + d.kupon, teks: d.kuponBonus, warna: '#FFE9A8', ilus: 'bintang' });
        kartu.push({ judul: d.utama.judul, teks: d.utama.pesan, warna: '#FFD9C2', ilus: 'hati', utama: true, foto: d.utama.foto });
        var i = 0;
        var el = layar('<div class="ml-paket"><div class="ml-kotak" id="mlKotak" aria-hidden="true"><i class="ml-tutup"></i><i class="ml-badan"></i></div><div class="ml-isi-paket" id="mlIsi" hidden></div></div>');
        S.jeda(function () { el.querySelector('#mlKotak').classList.add('terbuka'); if (window.Suara) window.Suara.hadiah(); S.dariEl(el.querySelector('#mlKotak'), 70, ['#FF7A1A', '#FFB020', '#E8336D', '#fff'], { kuat: 10, naik: 8 }); }, 400);
        S.jeda(function () { el.querySelector('#mlKotak').classList.add('hilang'); tampil(); }, 1800);
        function tampil() {
          var k = kartu[i], box = el.querySelector('#mlIsi'); box.hidden = false;
          box.innerHTML = '<p class="ml-hit">Hadiah ' + (i + 1) + ' dari ' + kartu.length + '</p><article class="ml-kado" style="--w:' + k.warna + '"><div class="ml-kado-g">' + ILUS[k.ilus]() + '</div><h2>' + esc(k.judul) + '</h2>' + (k.utama ? '<figure class="ml-foto"><img alt="Foto personal" src="' + esc(S.src(k.foto, 1)) + '"></figure>' : '') + '<p>' + esc(k.teks) + '</p></article>' +
            '<button type="button" class="ml-klaim" id="mlNext">' + (i < kartu.length - 1 ? 'Hadiah Berikutnya' : 'Selesai') + '</button>';
          el.querySelector('.ml-kado').classList.add('masuk');
          box.querySelector('#mlNext').addEventListener('click', function () { if (i < kartu.length - 1) { i++; tampil(); } else selesai(); });
        }
        function selesai() {
          el.querySelector('#mlIsi').innerHTML = '<div class="ml-akhir"><h1>Kejutanmu telah tiba!</h1><p>Terima kasih sudah membuka semua hadiah.</p><button type="button" class="ml-klaim" id="mlUlang">Belanja Hadiah Lagi</button></div>';
          el.querySelector('.ml-akhir').insertAdjacentHTML('beforeend', S.kredit(d.pengirim)); S.akhir();
          S.dariEl(el.querySelector('.ml-akhir h1'), 60, ['#FF7A1A', '#FFB020', '#E8336D', '#fff'], { kuat: 9 });
          el.querySelector('#mlUlang').addEventListener('click', function () { pilih = []; kuponPakai = false; filter = ''; beranda(); });
        }
      }
      beranda();
    }
  });
})();
