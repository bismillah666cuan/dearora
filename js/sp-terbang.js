/* ==========================================================
   PENERBANGAN MENUJU USIA KE-N — boarding pass disobek, jendela pesawat berawan di senja, peta penerbangan dengan persinggahan
   (tiap persinggahan satu usia dengan foto dan cerita), pendaratan di kota yang bersinar, papan kedatangan, dan kartu pesan. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var EMAS = ['#FFC46B', '#FF8A3D', '#FFE3A8', '#fff'];
  var PESAWAT = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M60 30 38 24 24 4h-6l6 20-14 2-6-6H0l4 12-4 12h4l6-6 14 2-6 20h6l14-20 22-6c3-1 4-6 0-6z" fill="currentColor"/></svg>';
  function kota() { var g = '', i, x = 0, h; for (i = 0; i < 22; i++) { h = 30 + ((i * 37) % 70); g += '<rect x="' + x + '" y="' + (120 - h) + '" width="22" height="' + h + '" fill="#10192E"/>'; for (var k = 0; k < 6; k++) if ((i + k) % 3) g += '<rect x="' + (x + 4 + (k % 2) * 8) + '" y="' + (126 - h + Math.floor(k / 2) * 14) + '" width="4" height="5" fill="#FFD27A" opacity=".85"/>'; x += 22; } return '<svg viewBox="0 0 484 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + g + '</svg>'; }
  S.reg('terbang', {
    nama: 'Penerbangan Usia',
    adapt: function (f, c) {
      var d = f.pendaratan || {}, u = String(f.usia || '').replace(/[^0-9]/g, '').slice(0, 3) || '25';
      return { penerima: c.penerima, pengirim: c.pengirim, maskapai: f.maskapai || 'Dearora Air', usia: u, singgah: (f.singgah || []).map(function (x) { return { usia: x.usia, tempat: x.tempat, cerita: x.cerita, foto: x.foto }; }),
        pengumuman: d.pengumuman || 'Bapak dan Ibu penumpang, kita akan segera mendarat. Siapkan hati, ada kejutan yang menunggu di bawah sana.', pesan: d.pesan || '' };
    },
    mulai: function (root, d) {
      var n = d.singgah.length;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar tb-layar ' + (k || '') + '">' + h + '<div class="sn-grain" aria-hidden="true"></div><div class="sn-vig" aria-hidden="true"></div></div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function langit(extra) { return '<div class="tb-jendela ' + (extra || '') + '" aria-hidden="true"><div class="tb-langit"><i class="tb-matahari"></i><i class="tb-awan a"></i><i class="tb-awan b"></i><i class="tb-awan c"></i><i class="tb-awan d"></i></div><div class="tb-kaca"></div></div>'; }
      function tiket() {
        var el = layar('<p class="tb-kop">' + esc(d.maskapai.toUpperCase()) + ' · CHECK-IN</p><div class="tb-tiket"><div class="tb-tk-utama"><div class="tb-tk-atas"><b>' + esc(d.maskapai) + '</b><span>BOARDING PASS</span></div><div class="tb-tk-baris"><div><small>PENUMPANG</small><strong>' + esc(d.penerima) + '</strong></div><div><small>KURSI</small><strong>' + esc(d.usia) + 'A</strong></div></div><div class="tb-tk-baris"><div><small>DARI</small><strong>MASA LALU</strong></div><div class="tb-tk-pesawat">' + PESAWAT + '</div><div><small>MENUJU</small><strong>USIA KE-' + esc(d.usia) + '</strong></div></div><div class="tb-tk-baris kecil"><div><small>GERBANG</small><strong>07</strong></div><div><small>BOARDING</small><strong>SEKARANG</strong></div><div><small>KELAS</small><strong>SPESIAL</strong></div></div></div><div class="tb-stub" aria-hidden="true"><i class="tb-bar"></i><small>' + esc(d.maskapai.slice(0, 2).toUpperCase()) + '-' + esc(d.usia) + '</small></div></div><button type="button" class="tb-btn" id="tbNaik">Naik pesawat</button>', 'tb-tiket-l');
        el.querySelector('#tbNaik').addEventListener('click', function (e) { e.currentTarget.disabled = true; el.querySelector('.tb-tiket').classList.add('sobek'); if (window.Suara) { window.Suara.kertas(); window.Suara.whoosh(); } S.jeda(kabin, 1300); });
      }
      function kabin() {
        var el = layar(langit('besar') + '<div class="tb-sabuk" aria-hidden="true"><i></i><span>Kenakan sabuk pengaman</span></div><p class="tb-sub" id="tbS"></p><div class="tb-aksi"><button type="button" class="tb-btn" id="tbL" hidden>Lepas sabuk pengaman</button></div>', 'tb-kabin');
        S.jeda(function () { if (window.Suara) window.Suara.ding(); el.classList.add('ting'); }, 700);
        S.jeda(function () { var s = el.querySelector('#tbS'); if (s) s.innerHTML = S.kata('Selamat datang di penerbangan ' + d.maskapai + ' menuju usia ke-' + d.usia + '. Dalam perjalanan ini kita akan singgah di ' + n + ' tempat. Silakan nikmati pemandangannya, ' + d.penerima + '.', 4600, 60); }, 1400);
        S.jeda(function () { var b = el.querySelector('#tbL'); if (b) b.hidden = false; }, 3600);
        el.querySelector('#tbL').addEventListener('click', function () { if (window.Suara) window.Suara.klik && window.Suara.klik(); singgah(0); });
      }
      function peta(k) {
        var f = (k + 1) / (n + 1), titik = '';
        for (var i = 0; i <= n + 1; i++) titik += '<i class="' + (i <= k ? 'lalu' : '') + '" style="left:' + (i / (n + 1) * 100) + '%"></i>';
        return '<div class="tb-peta" role="img" aria-label="Peta penerbangan: persinggahan ' + (k + 1) + ' dari ' + n + '"><span class="tb-garis"><b style="width:' + (f * 100) + '%"></b></span>' + titik + '<em class="tb-pesawat" style="left:' + (f * 100) + '%">' + PESAWAT + '</em></div>';
      }
      function singgah(k) {
        if (k >= n) return mendarat(); var t = d.singgah[k];
        var el = layar(peta(k) + langit('laju') + '<div class="tb-transit"><p class="tb-tag">PERSINGGAHAN ' + (k + 1) + ' DARI ' + n + ' · ' + esc(t.usia) + '</p><h2>' + esc(t.tempat) + '</h2>' + (t.foto ? '<img alt="" src="' + esc(S.src(t.foto, k)) + '">' : '') + '<p class="tb-cerita">' + esc(t.cerita) + '</p></div><div class="tb-aksi"><button type="button" class="tb-btn" id="tbN">' + (k < n - 1 ? 'Lanjut terbang ›' : 'Bersiap mendarat ›') + '</button></div>', 'tb-singgah');
        if (window.Suara) window.Suara.whoosh(); S.jeda(function () { var w = el.querySelector('.tb-jendela'); if (w) w.classList.remove('laju'); }, 1500);
        el.querySelector('#tbN').addEventListener('click', function () { singgah(k + 1); });
      }
      function mendarat() {
        var el = layar('<div class="tb-langit-l" aria-hidden="true"><i class="tb-matahari"></i><i class="tb-awan a"></i><i class="tb-awan b"></i></div><div class="tb-kota" aria-hidden="true">' + kota() + '</div><div class="tb-sabuk on" aria-hidden="true"><i></i><span>Bersiap mendarat</span></div><p class="tb-sub" id="tbP">' + esc(d.pengumuman) + '</p><div class="tb-tiba" id="tbT" hidden><div class="tb-papan" aria-label="Tiba di usia ke-' + esc(d.usia) + '"><small>TIBA</small><b>' + String('USIA KE-' + d.usia).split('').map(function (h, i) { return '<span style="--i:' + i + '">' + (h === ' ' ? '&nbsp;' : esc(h)) + '</span>'; }).join('') + '</b></div><div class="tb-kartu"><span class="tb-cap" aria-hidden="true">SELAMAT<br>ULANG TAHUN</span><p>' + S.kata(d.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim) + '</div></div>', 'tb-mendarat');
        if (window.Suara) window.Suara.whoosh();
        S.jeda(function () { var p = el.querySelector('#tbP'); if (p) p.hidden = true; var tb = el.querySelector('#tbT'); tb.hidden = false; el.classList.add('tiba'); if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); } S.confetti(innerWidth / 2, innerHeight * 0.3, 80, EMAS, { kuat: 10 }); S.jeda(function () { S.confetti(innerWidth * 0.25, innerHeight * 0.35, 46, EMAS, { kuat: 8 }); S.confetti(innerWidth * 0.75, innerHeight * 0.35, 46, EMAS, { kuat: 8 }); }, 800); S.akhir(); }, 3800);
      }
      tiket();
    }
  });
})();
