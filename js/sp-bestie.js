/* ==========================================================
   DUNIA SAHABAT — dunia petualangan orisinal bergaya blok.
   Penerima menjelajah tiga lokasi, mengumpulkan item (memori), membuka lencana,
   lalu membuka peti harta. Tanpa akun, tanpa penyimpanan: progres hanya di layar.
   Karakter dan dunia dibuat orisinal Dearora (bukan aset game mana pun).
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, ic = S.ic;
  var DEMO = {
    penerima: 'Rani', pengirim: 'Dimas', syaratPulau: 5,
    pesanMisi: 'Ada 6 memori tersembunyi di dunia ini. Temukan minimal 5 untuk membuka Pulau Harta. Selamat berpetualang, sahabatku!',
    avatar: { kulit: '#F2C28B', baju: '#FF6B6B', celana: '#4B6BFF', rambut: '#5B3A29' },
    lokasi: [
      { id: 'padang', nama: 'Padang Kenangan', desk: 'Tempat menemukan foto kenangan.', warna: ['#BDEBFF', '#A7E58C'], item: [
        { tipe: 'hati', judul: 'Hari pertama kita', teks: 'Ingat saat kita baru kenal dan sama-sama canggung? Siapa sangka jadi sedekat ini.', foto: '' },
        { tipe: 'bintang', judul: 'Tertawa sampai lupa waktu', teks: 'Hari itu kita tertawa sampai perut sakit. Itu salah satu hari terbaikku.', foto: '' },
        { tipe: 'kristal', judul: 'Perjalanan tak terencana', teks: 'Rencananya cuma sebentar, jadinya seharian. Dan aku tidak menyesal.', foto: '' }] },
      { id: 'rumah', nama: 'Rumah Persahabatan', desk: 'Tempat membaca pesan dari sahabat.', warna: ['#FFE6B8', '#FFB36B'], item: [
        { tipe: 'kotak', judul: 'Untuk hari yang berat', teks: 'Kalau kamu lelah, ingat ada aku yang siap mendengarkan, tanpa menghakimi.', foto: '' },
        { tipe: 'hati', judul: 'Hal yang kusyukuri', teks: 'Aku bersyukur punya sahabat yang tulus. Terima kasih sudah menjadi kamu.', foto: '' },
        { tipe: 'bintang', judul: 'Rahasia kecil', teks: 'Diam-diam, aku selalu bangga melihat kamu terus bertumbuh.', foto: '' }] },
      { id: 'pulau', nama: 'Pulau Harta', desk: 'Lokasi hadiah utama.', warna: ['#8FD6FF', '#FFE08A'], item: [] }
    ],
    lencana: [
      { nama: 'Orang Favorit', syarat: 2, ikon: 'hati' }, { nama: 'Si Paling Keren', syarat: 4, ikon: 'bintang' },
      { nama: 'Partner Usil', syarat: 5, ikon: 'kotak' }, { nama: 'Duniaku', syarat: 6, ikon: 'kristal' }
    ],
    peti: { foto: '', pesan: 'Rani, harta karun yang sesungguhnya bukan di peti ini. Harta karun itu kamu. Terima kasih sudah menjadi sahabat yang membuat dunia terasa lebih ramah. Aku sayang kamu!' }
  };
  var SVG = {
    hati: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21S2 14 2 7.5A5 5 0 0 1 12 5a5 5 0 0 1 10 2.5C22 14 12 21 12 21z" fill="#FF5D8F"/></svg>',
    bintang: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="#FFC93C"/></svg>',
    kristal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 7-7 13L5 9z" fill="#5AD1FF"/><path d="M5 9h14M12 2l-3 7 3 13 3-13z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/></svg>',
    kotak: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="2" fill="#B58CFF"/><rect x="2" y="6" width="20" height="5" rx="1.5" fill="#9B6BFF"/><path d="M12 6v15" stroke="#FFD166" stroke-width="3"/></svg>'
  };
  function avatar(a, k) {
    return '<div class="bw-avatar ' + (k || '') + '" style="--kulit:' + a.kulit + ';--baju:' + a.baju + ';--celana:' + a.celana + ';--rambut:' + a.rambut + '" aria-hidden="true"><i class="rambut"></i><i class="kepala"><b></b><b></b><u></u></i><i class="badan"></i><i class="lengan l"></i><i class="lengan r"></i><i class="kaki l"></i><i class="kaki r"></i></div>';
  }

  S.reg('bestie', {
    nama: 'Dunia Sahabat', demo: DEMO,
    mulai: function (root, d) {
      var temu = {}, lencanaBuka = {}, lokasiSkr = 'padang';
      function jml() { return Object.keys(temu).length; }
      var total = d.lokasi.reduce(function (n, l) { return n + l.item.length; }, 0);
      function layar(h, k, warna) { root.innerHTML = '<div class="sp-layar bw-dunia ' + (k || '') + '"' + (warna ? ' style="--a:' + warna[0] + ';--b:' + warna[1] + '"' : '') + '>' + h + '</div>'; return root.firstChild; }
      function awan() { return '<i class="bw-awan a1"></i><i class="bw-awan a2"></i><i class="bw-awan a3"></i>'; }

      function sambutan() {
        var el = layar(awan() + '<div class="bw-tengah"><p class="bw-kpd">Selamat datang di</p><h1>Dunia ' + esc(d.penerima) + '</h1>' + avatar(d.avatar, 'besar') +
          '<div class="bw-misi"><strong>Misi kamu</strong><p>' + esc(d.pesanMisi) + '</p><span class="bw-info">' + ic('sparkles') + ' ' + total + ' item bisa dikumpulkan · ' + d.lencana.length + ' lencana</span></div><button type="button" class="bw-tombol" id="bwMulai">Mulai Petualangan</button><p class="bw-dari">Pesan dari ' + esc(d.pengirim) + '</p></div>', 'bw-langit', ['#8FD6FF', '#DFF7C8']);
        el.querySelector('#bwMulai').addEventListener('click', peta);
      }

      function hud() {
        var persen = Math.round(jml() / total * 100);
        return '<header class="bw-hud"><div class="bw-prog" role="img" aria-label="' + jml() + ' dari ' + total + ' memori ditemukan"><span>' + jml() + '/' + total + ' memori ditemukan</span><i><b style="width:' + persen + '%"></b></i></div><button type="button" class="bw-koleksi" data-a="koleksi">' + ic('sparkles') + ' Koleksi</button></header>';
      }

      function peta() {
        var buka = jml() >= d.syaratPulau;
        var tombol = d.lokasi.map(function (l, i) {
          var kunci = l.id === 'pulau' && !buka;
          return '<button type="button" class="bw-lok l' + i + (kunci ? ' terkunci' : '') + (l.id === lokasiSkr ? ' sini' : '') + '" data-lok="' + esc(l.id) + '" aria-label="' + esc(l.nama) + (kunci ? ', terkunci' : '') + '"><span class="bw-pin">' + (kunci ? ic('lock') : (l.id === 'pulau' ? SVG.kotak : l.id === 'rumah' ? '<span class="bw-rumah"></span>' : SVG.hati)) + '</span><strong>' + esc(l.nama) + '</strong><small>' + (kunci ? 'Kumpulkan ' + d.syaratPulau + ' memori' : esc(l.desk)) + '</small></button>';
        }).join('');
        var el = layar(hud() + '<div class="bw-peta">' + awan() + '<div class="bw-pulau-besar" aria-hidden="true"></div>' + tombol + avatar(d.avatar, 'kecil bw-tokoh p-' + lokasiSkr) + '</div><p class="bw-petunjuk">Ketuk sebuah lokasi untuk berjalan ke sana.</p>', 'bw-langit', ['#9BDCFF', '#CFF3B5']);
        el.addEventListener('click', function (ev) {
          var k = ev.target.closest('[data-a="koleksi"]'); if (k) { koleksi(); return; }
          var b = ev.target.closest('.bw-lok'); if (!b) return;
          if (b.classList.contains('terkunci')) { S.toast('Kumpulkan ' + d.syaratPulau + ' memori dulu untuk membuka Pulau Harta.'); return; }
          lokasiSkr = b.dataset.lok; var t = el.querySelector('.bw-tokoh'); t.className = t.className.replace(/p-\w+/, 'p-' + lokasiSkr) + ' jalan';
          S.jeda(function () { lokasi(lokasiSkr); }, 900);
        });
      }

      function lokasi(id) {
        var l = d.lokasi.filter(function (x) { return x.id === id; })[0]; if (id === 'pulau') { pulau(l); return; }
        var items = l.item.map(function (it, i) {
          var kunci = id + i, ada = temu[kunci];
          return '<button type="button" class="bw-item i' + i + (ada ? ' ambil' : '') + '" data-k="' + kunci + '" data-i="' + i + '" aria-label="Item ' + (i + 1) + (ada ? ' sudah diambil' : '') + '">' + SVG[it.tipe] + '</button>';
        }).join('');
        var el = layar(hud() + '<div class="bw-scene"><h2>' + esc(l.nama) + '</h2><p>' + esc(l.desk) + ' Ketuk benda yang berkilau!</p><div class="bw-area">' + items + avatar(d.avatar, 'kecil bw-tengahnya') + '</div><button type="button" class="bw-balik" data-a="peta">‹ Kembali ke peta</button></div>', 'bw-langit ' + (id === 'rumah' ? 'bw-hangat' : ''), l.warna);
        el.addEventListener('click', function (ev) {
          if (ev.target.closest('[data-a="peta"]')) { peta(); return; }
          if (ev.target.closest('[data-a="koleksi"]')) { koleksi(); return; }
          var b = ev.target.closest('.bw-item'); if (!b) return; var it = l.item[Number(b.dataset.i)];
          S.dariEl(b, 30, ['#FFC93C', '#FF5D8F', '#5AD1FF', '#fff'], { kuat: 8 });
          var baru = !temu[b.dataset.k]; temu[b.dataset.k] = true; b.classList.add('ambil');
          kartu(it, baru, function () { lokasi(id); });
        });
      }

      function kartu(it, baru, tutup) {
        var s = document.createElement('div'); s.className = 'bw-modal';
        s.innerHTML = '<article class="bw-kartu" role="dialog" aria-modal="true"><div class="bw-ik">' + SVG[it.tipe] + '</div><span class="bw-baru">' + (baru ? 'Memori ditemukan!' : 'Memori ini sudah kamu simpan') + '</span><h3>' + esc(it.judul) + '</h3>' +
          '<figure><img alt="" src="' + esc(S.src(it.foto, it.judul.length)) + '"></figure><p>' + esc(it.teks) + '</p><button type="button" class="bw-tombol">Simpan ke Koleksi</button></article>';
        root.appendChild(s); s.querySelector('button').focus();
        s.querySelector('button').addEventListener('click', function () { s.remove(); var yangBaru = []; d.lencana.forEach(function (lc) { if (jml() >= lc.syarat && !lencanaBuka[lc.nama]) { lencanaBuka[lc.nama] = true; yangBaru.push(lc.nama); } }); tutup(); yangBaru.forEach(function (n, i) { S.jeda(function () { S.toast('Lencana terbuka: ' + n); S.confetti(innerWidth / 2, innerHeight / 3, 40, ['#FFC93C', '#FF5D8F', '#5AD1FF', '#fff'], { kuat: 9 }); }, 300 + i * 900); }); });
      }

      function koleksi() {
        var s = document.createElement('div'); s.className = 'bw-modal';
        s.innerHTML = '<article class="bw-kartu" role="dialog" aria-modal="true"><h3>Koleksi Lencana</h3><p>' + jml() + ' dari ' + total + ' memori ditemukan</p><div class="bw-lencana">' +
          d.lencana.map(function (lc) { var on = lencanaBuka[lc.nama]; return '<div class="bw-lc' + (on ? ' on' : '') + '"><span>' + SVG[lc.ikon] + '</span><strong>' + (on ? esc(lc.nama) : '???') + '</strong><small>' + (on ? 'Terbuka' : 'Kumpulkan ' + lc.syarat + ' memori') + '</small></div>'; }).join('') + '</div><button type="button" class="bw-tombol">Tutup</button></article>';
        root.appendChild(s); s.querySelector('button').addEventListener('click', function () { s.remove(); });
      }

      function pulau(l) {
        var el = layar(hud() + '<div class="bw-scene"><h2>' + esc(l.nama) + '</h2><p>Peti harta karun menunggumu. Ketuk untuk membukanya!</p><div class="bw-area bw-pantai"><button type="button" class="bw-peti" id="bwPeti" aria-label="Buka peti harta karun"><i class="tutup"></i><i class="badan"></i><i class="kunci"></i></button>' + avatar(d.avatar, 'kecil bw-tengahnya') + '</div><button type="button" class="bw-balik" data-a="peta">‹ Kembali ke peta</button></div>', 'bw-langit', l.warna);
        el.querySelector('[data-a="peta"]').addEventListener('click', peta);
        el.querySelector('#bwPeti').addEventListener('click', function () {
          var p = el.querySelector('#bwPeti'); if (p.classList.contains('buka')) return; p.classList.add('buka'); S.dariEl(p, 80, ['#FFC93C', '#FFE08A', '#fff', '#FF5D8F'], { kuat: 11, naik: 9 });
          S.jeda(akhir, 1300);
        });
      }

      function akhir() {
        var el = layar(awan() + '<div class="bw-tengah"><p class="bw-kpd">Harta karun terbuka</p><h1>' + esc(d.penerima) + '</h1><figure class="bw-foto"><img alt="Foto pilihan" src="' + esc(S.src(d.peti.foto, 3)) + '"></figure><p class="bw-pesan">' + esc(d.peti.pesan) + '</p><p class="bw-final">Kamu adalah harta karun yang sesungguhnya.</p>' +
          '<button type="button" class="bw-tombol" id="bwUlang">Jelajahi Dunia Sekali Lagi</button></div>', 'bw-langit bw-emas', ['#FFE08A', '#FFC4A0']);
        S.dariEl(el.querySelector('.bw-final'), 70, ['#FFC93C', '#FF5D8F', '#5AD1FF', '#fff'], { kuat: 10 });
        el.querySelector('#bwUlang').addEventListener('click', function () { temu = {}; lencanaBuka = {}; lokasiSkr = 'padang'; sambutan(); });
      }
      sambutan();
    }
  });
})();
