/* ==========================================================
   MALAM FILM — penerima menjadi pemeran utama sebuah film pendek.
   Tampilan awal bergaya layanan streaming (desain orisinal, tanpa merek).
   Alur: pembuka film → beranda episode (bebas memilih) → pemutar adegan + subtitle
   bertahap → adegan penutup. Tidak dipaksa menonton berurutan.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, ic = S.ic;
  var DEMO = {
    judul: 'Cerita Kita', pemeran: 'Rani', pengirim: 'Dimas',
    tagline: 'Sebuah film pendek tentang kita, dibuat khusus untukmu.',
    episode: [
      { judul: 'Awal Kita Bertemu', desk: 'Hari ketika semuanya dimulai.', warna: ['#3A1C71', '#D76D77'], foto: '', adegan: ['Semuanya berawal dari hari yang biasa saja.', 'Kamu datang tanpa rencana, dan duniaku ikut berubah.', 'Aku belum tahu, hari itu aku sedang bertemu orang yang paling kusyukuri.'] },
      { judul: 'Kenangan Favorit Kita', desk: 'Potongan hari yang tak mau kulupakan.', warna: ['#134E5E', '#71B280'], foto: '', adegan: ['Ada tawa yang pecah di tempat yang paling tidak pantas.', 'Ada hujan, ada payung yang cuma satu, dan kita tidak mengeluh.', 'Kalau ada tombol ulang, aku akan memilih hari-hari itu.'] },
      { judul: 'Hal-Hal yang Kukagumi Darimu', desk: 'Daftar kecil yang terus bertambah.', warna: ['#7B2FF7', '#F107A3'], foto: '', adegan: ['Caramu peduli tanpa pernah minta dilihat.', 'Caramu tertawa, dan membuat orang lain ikut lega.', 'Dan caramu bertahan, bahkan di hari-hari yang berat.'] }
    ],
    final: { judul: 'Yang Terbaik Belum Datang', foto: '', pesan: 'Rani, terima kasih sudah menjadi tokoh utama di cerita ini. Banyak adegan yang belum kita tulis: perjalanan, tawa, dan hari-hari biasa yang tetap terasa istimewa jika bersamamu. Apa pun yang terjadi nanti, aku ingin kamu tahu: kamu adalah bagian terbaik dari semua bab hidupku. Dan yang terbaik, percayalah, belum datang.' }
  };

  S.reg('movie', {
    nama: 'Malam Film', demo: DEMO,
    adapt: function (f, c) {
      var W = [['#3A1C71', '#D76D77'], ['#134E5E', '#71B280'], ['#7B2FF7', '#F107A3']], fin = f.final || {};
      return { judul: f.judul, pemeran: c.penerima, pengirim: c.pengirim, tagline: f.tagline || 'Sebuah film pendek tentang kita, dibuat khusus untukmu.',
        episode: (f.episode || []).map(function (e, i) { return { judul: e.judul, desk: e.desk || '', warna: W[i % 3], foto: e.foto, adegan: e.adegan }; }), final: { judul: fin.judul, foto: fin.foto, pesan: fin.pesan } };
    },
    mulai: function (root, d) {
      var tonton = {}, finalDilihat = false, suara = null;
      function layar(html, k) { root.innerHTML = '<div class="sp-layar ' + (k || '') + '">' + html + '</div>'; return root.firstChild; }
      var judulBesar = esc(d.judul).toUpperCase();

      function toggleSuara(btn) {                        // musik latar opsional, dibuat langsung oleh browser (tanpa berkas audio)
        if (suara) { suara.stop(); suara = null; btn.setAttribute('aria-pressed', 'false'); return; }
        try {
          var AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(), g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
          [220, 277.18, 329.63, 440].forEach(function (f, i) { var o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; og.gain.value = 0.035 / (i + 1); o.connect(og); og.connect(g); o.start(); });
          g.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2);
          suara = { stop: function () { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); setTimeout(function () { ctx.close(); }, 800); } };
          btn.setAttribute('aria-pressed', 'true');
        } catch (e) { S.toast('Suara latar tidak tersedia di perangkat ini.'); }
      }

      function pembuka() {
        var el = layar('<div class="mv-splash"><p class="mv-studio">STUDIO DEARORA MENYAJIKAN</p><h1 class="mv-judul">' + judulBesar + '</h1><p class="mv-untuk">Sebuah film untuk ' + esc(d.pemeran) + '</p><button type="button" class="mv-lewati">Lewati</button></div>', 'mv-gelap');
        var lanjut = function () { beranda(); }; el.querySelector('.mv-lewati').addEventListener('click', lanjut); S.jeda(function () { if (root.querySelector('.mv-splash')) lanjut(); }, 4200);
      }

      function kartuEp(e, i, final) {
        var seen = final ? finalDilihat : tonton[i];
        return '<button type="button" class="mv-kartu" data-ep="' + (final ? 'f' : i) + '"><span class="mv-thumb" style="background:linear-gradient(135deg,' + e.warna[0] + ',' + e.warna[1] + ')"><b>' + (final ? 'FINAL' : (i + 1)) + '</b><i aria-hidden="true">▶</i></span>' +
          '<strong>' + (final ? 'Final: ' : 'Episode ' + (i + 1) + ': ') + esc(e.judul) + '</strong><small>' + esc(e.desk) + '</small><span class="mv-prog" aria-hidden="true"><i style="width:' + (seen ? 100 : 0) + '%"></i></span></button>';
      }

      function beranda() {
        var semua = d.episode.every(function (_, i) { return tonton[i]; });
        var eps = d.episode.map(function (e, i) { return kartuEp(e, i, false); }).join('') + kartuEp({ judul: d.final.judul, desk: 'Adegan penutup yang ditulis khusus untukmu.', warna: ['#B8860B', '#F4C95D'] }, 3, true);
        var el = layar('<header class="mv-top"><span class="mv-logo">' + judulBesar.split(' ')[0] + 'KITA</span><button type="button" class="mv-suara" aria-pressed="false" aria-label="Suara latar">' + ic('music') + '</button><span class="mv-avatar" aria-hidden="true">' + esc(d.pemeran.charAt(0)) + '</span></header>' +
          '<section class="mv-hero"><div class="mv-poster" aria-hidden="true"><span>' + esc(d.judul) + '</span></div><div class="mv-hero-isi"><span class="mv-badge">FILM ORISINAL</span><h1>' + judulBesar + '</h1><p>' + esc(d.tagline) + '</p><p class="mv-meta">Dibintangi ' + esc(d.pemeran) + ' · Disutradarai ' + esc(d.pengirim) + '</p>' +
          '<div class="mv-btns"><button type="button" class="mv-play" data-ep="' + (semua ? 'f' : 0) + '">▶ ' + (semua ? 'Tonton Final' : 'Tonton dari Awal') + '</button><button type="button" class="mv-info">' + ic('info') + ' Info</button></div></div></section>' +
          '<h2 class="mv-baris">Episode untukmu</h2><div class="mv-rel" role="list">' + eps + '</div>' +
          '<p class="mv-saran">Kamu bebas memilih episode mana saja. Urutan 1 → Final hanyalah saran.</p>');
        el.addEventListener('click', function (ev) {
          var b = ev.target.closest('[data-ep]'); if (b) { var v = b.dataset.ep; v === 'f' ? penutup() : putar(Number(v)); return; }
          if (ev.target.closest('.mv-info')) S.toast('Pilih episode mana pun. Tidak harus berurutan.');
          var s = ev.target.closest('.mv-suara'); if (s) toggleSuara(s);
        });
        if (suara) el.querySelector('.mv-suara').setAttribute('aria-pressed', 'true');
        if (semua && !finalDilihat) el.querySelector('.mv-play').classList.add('berdenyut');
      }

      function putar(i) {
        var e = d.episode[i], n = 0;
        function adegan() {
          var el = layar('<div class="mv-pemutar"><img class="mv-bg" alt="" src="' + esc(S.src(e.foto, i)) + '"><div class="mv-vinyet"></div>' +
            '<div class="mv-bar"><button type="button" class="mv-kembali" aria-label="Kembali ke daftar episode">‹ Kembali</button><span>Ep. ' + (i + 1) + ' · ' + esc(e.judul) + '</span></div>' +
            '<div class="mv-subtitle" role="status" aria-live="polite">' + S.kata(e.adegan[n], 2600, 110) + '</div>' +
            '<div class="mv-kontrol"><span class="mv-titik" aria-label="Adegan ' + (n + 1) + ' dari ' + e.adegan.length + '">' + e.adegan.map(function (_, k) { return '<i class="' + (k <= n ? 'on' : '') + '"></i>'; }).join('') + '</span><button type="button" class="mv-next">' + (n === e.adegan.length - 1 ? 'Selesai Episode' : 'Adegan Berikutnya ▸') + '</button></div></div>', 'mv-gelap');
          el.querySelector('.mv-kembali').addEventListener('click', beranda);
          el.querySelector('.mv-next').addEventListener('click', function () {
            if (n < e.adegan.length - 1) { n++; el.classList.add('keluar'); S.jeda(adegan, 380); }
            else { tonton[i] = true; var semua = d.episode.every(function (_, k) { return tonton[k]; }); if (semua && !finalDilihat) penutup(); else { beranda(); S.toast('Episode ' + (i + 1) + ' selesai'); } }
          });
          el.querySelector('.mv-next').focus({ preventScroll: true });
        }
        adegan();
      }

      function penutup() {
        finalDilihat = true;
        var el = layar('<div class="mv-final"><div class="mv-cahaya" aria-hidden="true"></div><button type="button" class="mv-kembali" aria-label="Kembali">‹ Kembali</button><p class="mv-studio">FINAL</p><h1>' + esc(d.final.judul) + '</h1>' +
          '<figure class="mv-foto"><img alt="Foto pilihan" src="' + esc(S.src(d.final.foto, 2)) + '"></figure><p class="mv-pesan">' + S.kata(d.final.pesan, 7000, 90) + '</p>' +
          '<div class="mv-btns"><button type="button" class="mv-lagi" data-a="end">↻ Putar Ending Lagi</button><button type="button" class="mv-lagi" data-a="all">Tonton Kisah Kita Lagi</button></div><p class="mv-kredit">Dibuat dengan penuh rasa oleh: ' + esc(d.pengirim) + '</p></div>', 'mv-gelap'); S.akhir();
        S.dariEl(el.querySelector('h1'), 60, ['#F4C95D', '#FFE9A8', '#fff'], { kuat: 8 });
        el.addEventListener('click', function (ev) {
          if (ev.target.closest('.mv-kembali')) beranda();
          var b = ev.target.closest('[data-a]'); if (!b) return;
          if (b.dataset.a === 'end') penutup(); else { tonton = {}; finalDilihat = false; beranda(); }
        });
      }
      pembuka();
    }
  });
})();
