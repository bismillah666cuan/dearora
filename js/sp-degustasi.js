/* ==========================================================
   MENU DEGUSTASI — makan malam bercahaya lilin: kartu reservasi, menu bertinta emas, hidangan di bawah tudung perak (tiap hidangan
   membuka satu kenangan), hidangan penutup dengan lilin, lalu tagihan "lunas dengan kasih sayang". Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, EMAS = ['#E3C27A', '#F6E2A8', '#C79A45', '#fff'];
  var ANGKA = ['I', 'II', 'III', 'IV', 'V'];
  function hidangan(t) {
    var a = '<svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="74" fill="#F7F1E6"/><circle cx="80" cy="80" r="60" fill="#fff" stroke="#E4D8C2" stroke-width="2"/>';
    var m = {
      sup: '<path d="M32 78h96c0 30-20 46-48 46S32 108 32 78z" fill="#E9C27A"/><path d="M32 78h96" stroke="#fff" stroke-width="3"/><path d="M64 70c8-10 14 6 22-4s14 4 20-4" fill="none" stroke="#7FA86B" stroke-width="3" stroke-linecap="round"/>',
      salad: '<circle cx="80" cy="80" r="40" fill="#8FC27A"/><circle cx="64" cy="70" r="12" fill="#E85D5D"/><circle cx="94" cy="86" r="10" fill="#F2C94C"/><circle cx="78" cy="98" r="8" fill="#E85D5D"/><path d="M52 90c10-18 26-22 38-16" fill="none" stroke="#5E9A4E" stroke-width="5" stroke-linecap="round"/>',
      daging: '<ellipse cx="74" cy="82" rx="38" ry="26" fill="#8A4B2E"/><path d="M48 76h52M46 88h52" stroke="#5E2F1B" stroke-width="3"/><circle cx="112" cy="104" r="12" fill="#7FA86B"/><circle cx="50" cy="108" r="8" fill="#F2C94C"/>',
      pasta: '<circle cx="80" cy="82" r="34" fill="#F3D58C"/><path d="M56 82c8-16 20-16 24 0s16 16 24 0M60 94c8-12 18-12 22 0s14 12 20 0" fill="none" stroke="#E0B55C" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="70" r="10" fill="#D9523C"/><path d="M80 60l6-8" stroke="#5E9A4E" stroke-width="4" stroke-linecap="round"/>',
      ikan: '<path d="M38 82c14-22 40-30 62-14l16-12v52l-16-12c-22 16-48 8-62-14z" fill="#E8A87C"/><circle cx="58" cy="76" r="4" fill="#4A2A18"/><path d="M70 66c6 8 6 22 0 32" fill="none" stroke="#D8895C" stroke-width="3"/><path d="M110 118c6-6 16-6 22 0" fill="none" stroke="#7FA86B" stroke-width="4" stroke-linecap="round"/>'
    };
    return a + (m[t] || m.daging) + '</svg>';
  }
  var TUDUNG = '<svg viewBox="0 0 200 130" aria-hidden="true"><defs><linearGradient id="dgP" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA1AB"/><stop offset=".35" stop-color="#F2F5F8"/><stop offset=".7" stop-color="#B8BEC8"/><stop offset="1" stop-color="#80868F"/></linearGradient></defs><path d="M12 118c0-62 40-92 88-92s88 30 88 92z" fill="url(#dgP)"/><ellipse cx="100" cy="118" rx="92" ry="9" fill="#6B717B"/><circle cx="100" cy="20" r="11" fill="url(#dgP)"/><path d="M52 60c14-18 34-26 52-24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>';
  S.reg('degustasi', {
    nama: 'Menu Degustasi',
    adapt: function (f, c) {
      var p = f.penutup || {};
      return { penerima: c.penerima, pengirim: c.pengirim, restoran: f.restoran || 'Restoran Kenangan', hidangan: (f.hidangan || []).map(function (x) { return { nama: x.nama, cerita: x.cerita, foto: x.foto, ilus: x.ilus || 'daging' }; }), kue: p.nama || 'Kue Ulang Tahun', pesan: p.pesan || '', tagihan: p.tagihan || 'Sudah dibayar lunas dengan kasih sayang' };
    },
    mulai: function (root, d) {
      var n = d.hidangan.length;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar dg-layar ' + (k || '') + '"><div class="dg-bokeh" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' + h + '<div class="sn-grain" aria-hidden="true"></div><div class="sn-vig" aria-hidden="true"></div></div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function lilin() { return '<div class="dg-lilin" aria-hidden="true"><i class="dg-api"></i><b></b></div>'; }
      function meja() {
        var el = layar('<div class="dg-meja"><div class="dg-tenda"><small>RESERVED</small><strong>Meja untuk ' + esc(d.penerima) + '</strong><span>' + esc(d.restoran) + '</span></div>' + lilin() + '</div><p class="dg-sub">Selamat malam, ' + esc(d.penerima) + '. Meja Anda sudah siap.</p><button type="button" class="dg-btn" id="dgDuduk">Duduk di meja</button>', 'dg-masuk');
        el.querySelector('#dgDuduk').addEventListener('click', function () { if (window.Suara) { window.Suara.kertas(); window.Suara.ding(); } menu(); });
      }
      function menu() {
        var el = layar('<div class="dg-menu"><p class="dg-kop">' + esc(d.restoran.toUpperCase()) + '</p><h1>Menu Degustasi</h1><p class="dg-untuk">disajikan khusus untuk ' + esc(d.penerima) + '</p><ol>' + d.hidangan.map(function (h, i) { return '<li><b>' + ANGKA[i] + '</b><span>' + esc(h.nama) + '</span></li>'; }).join('') + '<li class="penutup"><b>✦</b><span>' + esc(d.kue) + '</span></li></ol></div><button type="button" class="dg-btn" id="dgMulai">Mulai makan malam</button>', 'dg-menu-l');
        el.querySelector('#dgMulai').addEventListener('click', function () { if (window.Suara) window.Suara.kertas(); hidang(0); });
      }
      function hidang(k) {
        if (k >= n) return penutup(); var h = d.hidangan[k];
        var el = layar('<p class="dg-kop">HIDANGAN ' + ANGKA[k] + ' DARI ' + ANGKA[n - 1] + '</p><button type="button" class="dg-piring" id="dgP" aria-label="Buka tudung hidangan ' + (k + 1) + '"><span class="dg-isi">' + hidangan(h.ilus) + '</span><span class="dg-tudung">' + TUDUNG + '</span><i class="dg-uap u1"></i><i class="dg-uap u2"></i></button><p class="dg-sub" id="dgInfo">Ketuk tudung peraknya.</p><div class="dg-kartu" id="dgK" aria-live="polite"></div><div class="dg-aksi"><button type="button" class="dg-btn" id="dgN" hidden>' + (k < n - 1 ? 'Hidangan berikutnya ›' : 'Hidangan penutup ›') + '</button></div>', 'dg-hidang');
        el.querySelector('#dgP').addEventListener('click', function (e) {
          var b = e.currentTarget; if (b.classList.contains('buka')) return; b.classList.add('buka'); if (window.Suara) { window.Suara.hadiah(); window.Suara.ding(); }
          S.jeda(function () { el.querySelector('#dgInfo').textContent = h.nama; el.querySelector('#dgK').innerHTML = '<h3>' + esc(h.nama) + '</h3>' + (h.foto ? '<img alt="" src="' + esc(S.src(h.foto, k)) + '">' : '') + '<p>' + esc(h.cerita) + '</p>'; el.querySelector('#dgK').classList.add('masuk'); el.querySelector('#dgN').hidden = false; }, 700);
        });
        el.querySelector('#dgN').addEventListener('click', function () { hidang(k + 1); });
      }
      function penutup() {
        var el = layar('<p class="dg-kop">HIDANGAN PENUTUP</p><div class="dg-kue" aria-hidden="true"><svg viewBox="0 0 200 150"><ellipse cx="100" cy="128" rx="94" ry="14" fill="#fff" stroke="#E4D8C2"/><path d="M50 118V70c0-14 14-22 50-22s50 8 50 22v48z" fill="#F7E3C0"/><path d="M50 78c10 12 20-6 30 6s20-6 30 6 20-8 30 6 10-4 10-4V70c0-14-14-22-50-22S50 56 50 70z" fill="#fff"/><circle cx="100" cy="44" r="9" fill="#D9523C"/></svg>' + lilin() + '</div><p class="dg-sub" id="dgI">Pelayan membawa ' + esc(d.kue) + ' untuk ' + esc(d.penerima) + '.</p><div class="dg-aksi"><button type="button" class="dg-btn" id="dgB">Nyalakan lilin</button></div>', 'dg-tutup');
        var b = el.querySelector('#dgB'), lil = el.querySelector('.dg-lilin'), tahap = 0;
        b.addEventListener('click', function () {
          if (tahap === 0) { tahap = 1; lil.classList.add('nyala'); if (window.Suara) window.Suara.ding(); el.querySelector('#dgI').textContent = 'Pejamkan mata, buat satu permohonan, lalu tiup lilinnya.'; b.textContent = 'Tiup lilin'; }
          else if (tahap === 1) { tahap = 2; b.disabled = true; lil.classList.remove('nyala'); lil.classList.add('padam'); if (window.Suara) window.Suara.tiup(); S.jeda(tagihan, 1200); }
        });
      }
      function tagihan() {
        var el = layar('<div class="dg-nota"><p class="dg-kop">TAGIHAN</p><ul>' + d.hidangan.map(function (h) { return '<li><span>' + esc(h.nama) + '</span><i></i><b>Rp 0</b></li>'; }).join('') + '<li><span>' + esc(d.kue) + '</span><i></i><b>Rp 0</b></li></ul><div class="dg-total"><span>TOTAL</span><b>Rp 0</b></div><p class="dg-lunas">' + esc(d.tagihan) + '</p><div class="dg-catatan"><p>' + S.kata(d.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim) + '</div></div>', 'dg-nota-l');
        if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); } S.confetti(innerWidth / 2, innerHeight * 0.25, 80, EMAS, { kuat: 9 }); S.jeda(function () { S.confetti(innerWidth * 0.25, innerHeight * 0.3, 40, EMAS, { kuat: 8 }); S.confetti(innerWidth * 0.75, innerHeight * 0.3, 40, EMAS, { kuat: 8 }); }, 800); S.akhir();
      }
      meja();
    }
  });
})();
