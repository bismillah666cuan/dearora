/* ==========================================================
   DETEKTIF: KASUS KUE YANG HILANG — kisah misteri bergaya noir: berkas rahasia di bawah lampu meja, papan bukti dengan benang merah,
   kesaksian para saksi, deretan tersangka (semua punya alibi), lalu lampu menyala dan pelaku sebenarnya terungkap. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, EMAS = ['#F2C879', '#FFE3A8', '#C8373D', '#fff'];
  var SIDIK = '<svg viewBox="0 0 80 80" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M16 56c0-16 10-30 24-30s24 14 24 30"/><path d="M24 58c0-12 7-22 16-22s16 10 16 22"/><path d="M32 60c0-8 4-14 8-14s8 6 8 14"/><path d="M40 62c0-4 0-8 0-8"/><path d="M12 46c2-18 14-30 28-30"/></g></svg>';
  function siluet(i) { var w = [30, 34, 28][i % 3]; return '<svg viewBox="0 0 80 110" aria-hidden="true"><path d="M40 6c-10 0-16 8-16 18 0 8 4 15 10 18-14 4-22 14-22 30v34h56V72c0-16-8-26-22-30 6-3 10-10 10-18C56 14 50 6 40 6z" fill="#0B0D10" opacity=".9"/><rect x="0" y="' + (14 + w) + '" width="80" height="2" fill="#F2C87933"/></svg>'; }
  function kode(s) { var h = 0, i; for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9000; return 'DR-' + String(1000 + h); }
  S.reg('detektif', {
    nama: 'Detektif: Kasus Kue yang Hilang',
    adapt: function (f, c) {
      var p = f.penutup || {};
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Kasus Kue yang Hilang', bukti: (f.bukti || []).map(function (x) { return { judul: x.judul, saksi: x.saksi, kesaksian: x.kesaksian, foto: x.foto }; }),
        tersangka: (f.tersangka || []).map(function (x) { return { nama: x.nama, alibi: x.alibi }; }), pelaku: p.pelaku || c.pengirim || 'Kejutan pesta ulang tahun', pesan: p.pesan || '' };
    },
    mulai: function (root, d) {
      var n = d.bukti.length;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar dt-layar ' + (k || '') + '">' + h + '<div class="sn-grain" aria-hidden="true"></div><div class="sn-vig" aria-hidden="true"></div></div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function berkas() {
        var el = layar('<div class="dt-lampu" aria-hidden="true"></div><div class="dt-map"><span class="dt-tab">KASUS NO. ' + kode(d.penerima + d.judul) + '</span><div class="dt-cap" aria-hidden="true">RAHASIA</div><h1>' + esc(d.judul) + '</h1><p class="dt-narasi" id="dtN"></p></div><button type="button" class="dt-btn" id="dtBuka" hidden>Buka berkas</button>', 'dt-buka-l');
        S.jeda(function () { var x = el.querySelector('#dtN'); if (x) x.innerHTML = S.kata('Seseorang menyembunyikan kue ulang tahun ' + d.penerima + '. Hanya detektif terbaik yang bisa memecahkan kasus ini.', 4200, 60); if (window.Suara) window.Suara.drum && window.Suara.drum(); }, 700);
        S.jeda(function () { var b = el.querySelector('#dtBuka'); if (b) b.hidden = false; }, 3300);
        el.querySelector('#dtBuka').addEventListener('click', function () { if (window.Suara) window.Suara.kertas(); papan(); });
      }
      function papan() {
        var buka = 0, urut = [], rot = [-3, 2.5, -1.5, 3, -2.5];
        var el = layar('<p class="dt-kop">PAPAN BUKTI</p><p class="dt-sub" id="dtP">Ketuk tiap barang bukti untuk mendengar kesaksiannya.</p><div class="dt-papan" id="dtB"><svg class="dt-benang" id="dtSvg" aria-hidden="true"></svg>' + d.bukti.map(function (b, i) { return '<button type="button" class="dt-bukti" data-i="' + i + '" style="--r:' + rot[i % 5] + 'deg" aria-label="Barang bukti ' + (i + 1) + '"><span class="dt-peniti"></span><span class="dt-gbr">' + (b.foto ? '<img alt="" src="' + esc(S.src(b.foto, i)) + '">' : SIDIK) + '</span><b>BUKTI ' + (i + 1) + '</b><small>?</small></button>'; }).join('') + '</div><div class="dt-kesaksian" id="dtK" aria-live="polite"></div><div class="dt-aksi"><button type="button" class="dt-btn" id="dtT" hidden>Tentukan pelaku</button></div>', 'dt-papan-l');
        var board = el.querySelector('#dtB'), svg = el.querySelector('#dtSvg');
        function tali() {
          var r0 = board.getBoundingClientRect(), h = '';
          svg.setAttribute('width', r0.width); svg.setAttribute('height', r0.height); svg.setAttribute('viewBox', '0 0 ' + r0.width + ' ' + r0.height);
          for (var i = 1; i < urut.length; i++) { var a = board.querySelector('[data-i="' + urut[i - 1] + '"]').getBoundingClientRect(), b = board.querySelector('[data-i="' + urut[i] + '"]').getBoundingClientRect(); h += '<line class="tali" x1="' + (a.left + a.width / 2 - r0.left) + '" y1="' + (a.top - r0.top + 8) + '" x2="' + (b.left + b.width / 2 - r0.left) + '" y2="' + (b.top - r0.top + 8) + '"/>'; }
          svg.innerHTML = h;
        }
        board.querySelectorAll('.dt-bukti').forEach(function (kartu) {
          kartu.addEventListener('click', function () {
            var i = Number(kartu.dataset.i), b = d.bukti[i];
            if (!kartu.classList.contains('buka')) { kartu.classList.add('buka'); kartu.querySelector('small').textContent = b.judul; urut.push(i); buka++; tali(); if (window.Suara) { window.Suara.kertas(); window.Suara.ding(); } }
            el.querySelectorAll('.dt-bukti').forEach(function (x) { x.classList.toggle('sorot', x === kartu); });
            var k = el.querySelector('#dtK'); k.innerHTML = '<p class="dt-saksi">KESAKSIAN: ' + esc(b.saksi) + '</p><h3>' + esc(b.judul) + '</h3><blockquote>' + esc(b.kesaksian) + '</blockquote>'; k.classList.remove('masuk'); void k.offsetWidth; k.classList.add('masuk');
            el.querySelector('#dtP').textContent = buka < n ? buka + ' dari ' + n + ' bukti sudah diperiksa.' : 'Semua bukti sudah dikumpulkan.'; if (buka === n) el.querySelector('#dtT').hidden = false;
          });
        });
        el.querySelector('#dtT').addEventListener('click', tuduh);
      }
      function tuduh() {
        var tuduhan = 0;
        var el = layar('<p class="dt-kop">DAFTAR TERSANGKA</p><h2>Siapa pelakunya?</h2><div class="dt-lineup">' + d.tersangka.map(function (t, i) { return '<button type="button" class="dt-tersangka" data-i="' + i + '"><span class="dt-bayang">' + siluet(i) + '</span><b>' + esc(t.nama) + '</b></button>'; }).join('') + '</div><div class="dt-kesaksian" id="dtA" aria-live="polite"></div><div class="dt-aksi"><button type="button" class="dt-btn" id="dtU" hidden>Aku sudah tahu pelakunya</button></div>', 'dt-tuduh-l');
        el.querySelectorAll('.dt-tersangka').forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.classList.contains('dituduh')) return; var t = d.tersangka[Number(b.dataset.i)]; b.classList.add('dituduh'); tuduhan++; if (window.Suara) window.Suara.drum && window.Suara.drum();
            var a = el.querySelector('#dtA'); a.innerHTML = '<p class="dt-saksi">KAMU MENUDUH ' + esc(t.nama.toUpperCase()) + '</p><blockquote>Hmm, alibinya kuat: ' + esc(t.alibi) + '</blockquote>'; a.classList.remove('masuk'); void a.offsetWidth; a.classList.add('masuk');
            el.querySelector('#dtU').hidden = false;
            if (tuduhan === d.tersangka.length) S.jeda(selesai, 1800);
          });
        });
        el.querySelector('#dtU').addEventListener('click', selesai);
      }
      function selesai() {
        var el = layar('<div class="dt-terang" aria-hidden="true"></div><div class="dt-laporan"><div class="dt-stempel" aria-hidden="true">KASUS<br>DITUTUP</div><p class="dt-kop">PELAKU SEBENARNYA</p><h2>' + esc(d.pelaku) + '</h2><p class="dt-tawa">Kue ' + esc(d.penerima) + ' tidak dicuri. Semuanya ternyata kejutan.</p><div class="dt-kue" aria-hidden="true"><svg viewBox="0 0 160 120"><ellipse cx="80" cy="102" rx="72" ry="10" fill="#0B0D10" opacity=".5"/><path d="M34 98V58c0-12 12-18 46-18s46 6 46 18v40z" fill="#F2C879"/><path d="M34 62c8 10 16-4 24 4s16-4 24 4 16-6 24 4 12-2 20 2V58c0-12-12-18-46-18S34 46 34 58z" fill="#fff"/><rect x="76" y="14" width="8" height="28" fill="#C8373D"/><i class="dt-api"></i></svg></div><div class="dt-catatan"><p class="dt-saksi">LAPORAN AKHIR</p><p>' + S.kata(d.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim) + '</div></div>', 'dt-selesai-l');
        if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); } S.confetti(innerWidth / 2, innerHeight * 0.28, 80, EMAS, { kuat: 9 }); S.jeda(function () { S.confetti(innerWidth * 0.2, innerHeight * 0.3, 40, EMAS, { kuat: 8 }); S.confetti(innerWidth * 0.8, innerHeight * 0.3, 40, EMAS, { kuat: 8 }); }, 800); S.akhir();
      }
      berkas();
    }
  });
})();
