/* ==========================================================
   RUMAH KENANGAN — rumah tampak potong dengan beberapa ruangan; tiap benda di ruangan menyimpan satu kenangan;
   loteng berisi pesan utama. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var IKON = [
    '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="30" width="52" height="40" rx="8" fill="#F2B45A"/><rect x="10" y="22" width="60" height="12" rx="5" fill="#C98A4B"/><path d="M26 44h28M26 54h20" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="6" y="38" width="68" height="26" rx="6" fill="#8FB3E8"/><rect x="6" y="28" width="22" height="20" rx="8" fill="#fff"/><rect x="6" y="64" width="6" height="8" fill="#6B8FC6"/><rect x="68" y="64" width="6" height="8" fill="#6B8FC6"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 12c-14 10-14 26 0 36 14-10 14-26 0-36z" fill="#5FB36B"/><path d="M40 48v14" stroke="#3E8A4A" stroke-width="4"/><path d="M22 62h36l-4 14H26z" fill="#C8573D"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="16" width="26" height="52" rx="3" fill="#E8745A"/><rect x="38" y="12" width="26" height="56" rx="3" fill="#7FA86B"/><path d="M16 26h14M44 22h14" stroke="#fff" stroke-width="3" opacity=".7"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M20 20h40v30H20z" fill="#C7A6E8"/><path d="M14 50h52v12H14z" fill="#8E6BC6"/><path d="M22 62v12M58 62v12" stroke="#6B4A9E" stroke-width="5"/></svg>'];
  var RUMAH = '<svg viewBox="0 0 220 190" aria-hidden="true"><path d="M10 90 110 12l100 78z" fill="#C8573D"/><path d="M10 90 110 12l100 78" fill="none" stroke="#8E3623" stroke-width="6" stroke-linejoin="round"/><rect x="26" y="88" width="168" height="94" fill="#FFE9C7"/><rect x="40" y="104" width="38" height="36" rx="4" fill="#9AD1F0" stroke="#fff" stroke-width="4"/><rect x="142" y="104" width="38" height="36" rx="4" fill="#9AD1F0" stroke="#fff" stroke-width="4"/><g class="pintu"><rect x="92" y="120" width="36" height="62" rx="4" fill="#8E5A2E"/><circle cx="121" cy="152" r="3" fill="#F5C242"/></g><rect x="150" y="30" width="16" height="36" fill="#8E3623"/></svg>';
  S.reg('rumah', {
    nama: 'Rumah Kenangan',
    adapt: function (f, c) { var l = f.loteng || {}; return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Rumah Kenangan', ruang: (f.ruang || []).map(function (r) { return { nama: r.nama, benda: r.benda || '', judul: r.judul, cerita: r.cerita, foto: r.foto }; }), loteng: { foto: l.foto, pesan: l.pesan || '' } }; },
    mulai: function (root, d) {
      var buka = {};
      function layar(h, k) { root.innerHTML = '<div class="sp-layar rh-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function depan() {
        var el = layar('<div class="rh-awan" aria-hidden="true"></div><div class="rh-depan"><p class="rh-kicker">SELAMAT DATANG</p><h1>' + esc(d.judul) + '</h1><p class="rh-untuk">Untuk ' + esc(d.penerima) + '</p><div class="rh-rumah" aria-hidden="true">' + RUMAH + '</div><button type="button" class="rh-btn">Ketuk pintu</button></div>', 'rh-depanl');
        el.querySelector('.rh-btn').addEventListener('click', function (e) { e.currentTarget.disabled = true; el.querySelector('.rh-rumah').classList.add('terbuka'); if (window.Suara) window.Suara.ketukPintu(); S.jeda(function () { if (window.Suara) window.Suara.pintu(); }, 520); S.jeda(dalam, S.reduce ? 60 : 1500); });
      }
      function dalam() {
        var n = d.ruang.length, sudah = Object.keys(buka).length;
        var tile = d.ruang.map(function (r, i) { return '<button type="button" class="rh-ruang' + (buka[i] ? ' sudah' : '') + '" data-i="' + i + '"><span class="rh-ik" aria-hidden="true">' + IKON[i % IKON.length] + '</span><b>' + esc(r.nama) + '</b><em>' + (buka[i] ? 'Sudah dibuka ✓' : 'Ketuk untuk masuk') + '</em></button>'; }).join('');
        var el = layar('<div class="rh-potong"><h2>' + esc(d.judul) + '</h2><p class="rh-pet" role="status">' + sudah + ' dari ' + n + ' ruangan dikunjungi</p><div class="rh-atap" aria-hidden="true"></div><div class="rh-lantai">' + tile + '</div>' + (sudah === n ? '<button type="button" class="rh-loteng">Naik ke loteng ›</button>' : '<p class="rh-pet kecil">Kunjungi semua ruangan untuk membuka loteng.</p>') + '</div>', 'rh-dalaml');
        el.querySelectorAll('.rh-ruang').forEach(function (b) { b.addEventListener('click', function () { if (window.Suara) window.Suara.langkah(); ruang(Number(b.dataset.i)); }); });
        var l = el.querySelector('.rh-loteng'); if (l) l.addEventListener('click', function () { if (window.Suara) window.Suara.pintu(); loteng(); });
      }
      function ruang(i) {
        var r = d.ruang[i];
        var el = layar('<div class="rh-kamar"><p class="rh-kicker">' + esc(r.nama).toUpperCase() + '</p><button type="button" class="rh-benda" aria-label="Buka kenangan: ' + esc(r.benda || r.judul) + '"><span class="rh-ik besar" aria-hidden="true">' + IKON[i % IKON.length] + '</span><i class="rh-kilau" aria-hidden="true"></i></button><p class="rh-pet" id="rhP">Ketuk ' + esc(r.benda || 'benda ini') + ' untuk membuka kenangannya.</p><div class="rh-kenang" id="rhK" hidden></div></div>', 'rh-kamarl');
        el.querySelector('.rh-benda').addEventListener('click', function (e) {
          var b = e.currentTarget; if (b.classList.contains('buka')) return; b.classList.add('buka'); buka[i] = true; if (window.Suara) window.Suara.laci(); el.querySelector('#rhP').hidden = true;
          var k = el.querySelector('#rhK'); k.hidden = false; k.innerHTML = '<h3>' + esc(r.judul) + '</h3>' + (r.foto ? '<img alt="" src="' + esc(S.src(r.foto, i)) + '">' : '') + '<p>' + esc(r.cerita) + '</p><button type="button" class="rh-btn">Kembali ke rumah ›</button>';
          S.dariEl(b, 22, ['#F5C242', '#F28B82', '#9AD18B', '#fff'], { kuat: 6, naik: 6 }); k.querySelector('.rh-btn').addEventListener('click', dalam);
        });
      }
      function loteng() {
        layar('<div class="rh-loteng-l"><p class="rh-kicker">LOTENG</p><h2>Satu pesan terakhir</h2>' + (d.loteng.foto ? '<img class="rh-foto" alt="" src="' + esc(S.src(d.loteng.foto, 3)) + '">' : '') + '<p class="rh-pesan">' + S.kata(d.loteng.pesan, 4500, 52) + '</p>' + S.kredit(d.pengirim) + '</div>', 'rh-lotengl');
        if (window.Suara) window.Suara.sukses(); S.confetti(innerWidth / 2, innerHeight * 0.3, 44, ['#F5C242', '#F28B82', '#9AD18B', '#fff'], { kuat: 8 }); S.akhir();
      }
      depan();
    }
  });
})();
