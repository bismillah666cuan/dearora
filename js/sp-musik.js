/* ==========================================================
   SOUNDTRACK KITA — playlist cerita: tiap lagu mewakili satu kenangan.
   Audio hanya diputar bila pembeli menyediakan tautan SAH (berkas/embed yang boleh dipakai).
   Tanpa audio, pengalaman tetap berjalan sebagai "mode cerita": tidak berpura-pura memutar musik.
   Jangan mengunggah rekaman berhak cipta tanpa izin.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, ic = S.ic;
  var DEMO = {
    judul: 'Lagu-Lagu yang Mengingatkanku Padamu', penerima: 'Rani', pengirim: 'Dimas', cover: ['#7B2FF7', '#F107A3'],
    deskripsi: 'Setiap lagu di sini adalah satu potongan cerita kita. Putar pelan-pelan, dan baca alasannya.',
    lagu: [
      { no: 'Track 01', judul: 'Awal Mula', label: 'The Beginning', cerita: 'Lagu ini selalu mengingatkanku pada hari pertama kita ngobrol. Waktu itu aku belum tahu kamu akan jadi sepenting ini.', warna: ['#FF9A9E', '#FAD0C4'], audio: '' },
      { no: 'Track 02', judul: 'Kenangan Favorit Kita', label: 'Our Favorite Memory', cerita: 'Lagu ini selalu mengingatkanku pada malam saat kita bicara berjam-jam tentang apa saja, sampai lupa waktu.', warna: ['#A18CD1', '#FBC2EB'], audio: '' },
      { no: 'Track 03', judul: 'Saat Aku Rindu', label: 'When I Miss You', cerita: 'Setiap kali jarak terasa jauh, aku memutar lagu ini dan merasa kamu tidak terlalu jauh.', warna: ['#84FAB0', '#8FD3F4'], audio: '' },
      { no: 'Track 04', judul: 'Selamanya dan Setiap Hari', label: 'Always and Forever', cerita: 'Lagu untuk semua hari ke depan: yang biasa, yang berat, dan yang bahagia. Aku ingin melewatinya bersamamu.', warna: ['#F6D365', '#FDA085'], audio: '' }
    ],
    tersembunyi: { judul: 'Hidden Track', label: 'Untukmu saja', pesan: 'Rani, ini lagu yang tidak pernah kuberitahukan ke siapa pun. Isinya sederhana: terima kasih sudah ada, dan aku sayang kamu.' },
    penutup: 'Ada lagu yang berakhir. Tapi ada perasaan yang tinggal.'
  };
  function cover(w, besar) { return '<div class="sk-cover' + (besar ? ' besar' : '') + '" style="background:linear-gradient(135deg,' + w[0] + ',' + w[1] + ')" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21S2 14 2 7.5A5 5 0 0 1 12 5a5 5 0 0 1 10 2.5C22 14 12 21 12 21z" fill="#fff" opacity=".85"/></svg></div>'; }
  function bar(n) { var h = ''; for (var i = 0; i < n; i++) h += '<i style="--d:' + (0.5 + (i * 37 % 10) / 10).toFixed(2) + 's;--k:' + (i * 0.11).toFixed(2) + 's"></i>'; return '<div class="sk-viz" aria-hidden="true">' + h + '</div>'; }

  S.reg('musik', {
    nama: 'Soundtrack Kita', demo: DEMO,
    adapt: function (f, c) {
      var W = [['#FF9A9E', '#FAD0C4'], ['#A18CD1', '#FBC2EB'], ['#84FAB0', '#8FD3F4'], ['#F6D365', '#FDA085'], ['#FF9966', '#FF5E62'], ['#43C6AC', '#F8FFAE']], th = f.tersembunyi || {};
      return { judul: f.judul, penerima: c.penerima, pengirim: c.pengirim, cover: ['#7B2FF7', '#F107A3'], deskripsi: f.deskripsi || '',
        lagu: (f.lagu || []).map(function (l, i) { return { no: 'Track 0' + (i + 1), judul: l.judul, label: l.label || '', cerita: l.cerita, warna: W[i % 6], audio: l.audio || '' }; }),
        tersembunyi: { judul: th.judul || 'Hidden Track', label: th.label || 'Untukmu saja', pesan: th.pesan }, penutup: f.penutup || 'Ada lagu yang berakhir. Tapi ada perasaan yang tinggal.' };
    },
    mulai: function (root, d) {
      var dengar = {}, audio = null, main = false;
      var adaAudio = d.lagu.some(function (l) { return /^https:\/\//.test(l.audio || ''); });
      function layar(h, k) { root.innerHTML = '<div class="sp-layar ' + (k || '') + '">' + h + '</div>'; return root.firstChild; }
      function berhenti() { if (audio) { audio.pause(); audio = null; } main = false; }

      function awal() {
        berhenti();
        var semua = d.lagu.every(function (_, i) { return dengar[i]; });
        var el = layar('<div class="sk-awal">' + cover(d.cover, true) + '<p class="sk-kpd">PLAYLIST UNTUK ' + esc(d.penerima).toUpperCase() + '</p><h1>' + esc(d.judul) + '</h1><p class="sk-desk">' + esc(d.deskripsi) + '</p><p class="sk-dari">Dibuat oleh ' + esc(d.pengirim) + ' · ' + (d.lagu.length + 1) + ' lagu</p>' + bar(24) +
          '<button type="button" class="sk-play" data-i="0">' + ic('play') + ' Putar Soundtrack Kita</button>' + (adaAudio ? '' : '<span class="sk-mode">Mode cerita · tanpa audio</span>') + '</div>' +
          '<ol class="sk-daftar">' + d.lagu.map(function (l, i) { return '<li><button type="button" data-i="' + i + '" class="sk-baris' + (dengar[i] ? ' sudah' : '') + '"><span class="sk-no">' + (i + 1) + '</span>' + cover(l.warna) + '<span class="sk-ket"><b>' + esc(l.judul) + '</b><small>' + esc(l.no) + ' — ' + esc(l.label) + '</small></span>' + (dengar[i] ? ic('check') : ic('play')) + '</button></li>'; }).join('') +
          '<li><button type="button" data-i="h" class="sk-baris tersembunyi' + (semua ? '' : ' terkunci') + '"><span class="sk-no">★</span><div class="sk-cover" style="background:#222" aria-hidden="true">' + ic('lock') + '</div><span class="sk-ket"><b>' + (semua ? esc(d.tersembunyi.judul) : '??? Hidden Track') + '</b><small>' + (semua ? esc(d.tersembunyi.label) : 'Dengarkan semua lagu untuk membukanya') + '</small></span></button></li></ol>');
        el.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (!b) return; var v = b.dataset.i; if (v === 'h') { if (b.classList.contains('terkunci')) { S.toast('Dengarkan keempat lagu dulu untuk membuka Hidden Track.'); return; } rahasia(); } else sedangMain(Number(v)); });
      }

      function sedangMain(i) {
        berhenti(); var l = d.lagu[i]; dengar[i] = true;
        var punya = /^https:\/\//.test(l.audio || '');
        var el = layar('<div class="sk-main"><button type="button" class="sk-kembali" data-a="awal" aria-label="Kembali ke playlist">‹</button><p class="sk-kpd">SEDANG DIPUTAR</p>' + cover(l.warna, true) + '<h2>' + esc(l.judul) + '</h2><p class="sk-label">' + esc(l.no) + ' — ' + esc(l.label) + '</p>' +
          '<div class="sk-kontrol"><button type="button" data-a="prev" aria-label="Lagu sebelumnya"' + (i === 0 ? ' disabled' : '') + '>' + ic('skip') + '</button><button type="button" class="sk-tombol-main" data-a="main" aria-pressed="false" aria-label="' + (punya ? 'Putar audio' : 'Mode cerita, tanpa audio') + '">' + ic('play') + '</button><button type="button" data-a="next" aria-label="Lagu berikutnya">' + ic('skip') + '</button></div>' +
          (punya ? '' : '<span class="sk-mode">Mode cerita · tidak ada audio pada lagu ini</span>') + '<div class="sk-cerita"><b>Kenapa lagu ini?</b><p>' + S.kata(l.cerita, 4000, 55) + '</p></div>' + bar(18) + '</div>', 'sk-gelap');
        var viz = el.querySelector('.sk-viz'); viz.classList.add('diam');
        el.addEventListener('click', function (e) {
          var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a;
          if (a === 'awal') awal();
          else if (a === 'next') { if (i < d.lagu.length - 1) sedangMain(i + 1); else awal(); }
          else if (a === 'prev') { if (i > 0) sedangMain(i - 1); }
          else if (a === 'main') {
            if (!punya) { S.toast('Lagu ini berjalan sebagai cerita. Tidak ada audio yang diputar.'); return; }
            if (!audio) { audio = new Audio(l.audio); audio.addEventListener('ended', function () { main = false; b.setAttribute('aria-pressed', 'false'); viz.classList.add('diam'); }); }
            if (audio.paused) { audio.play().then(function () { main = true; b.setAttribute('aria-pressed', 'true'); viz.classList.remove('diam'); }, function () { S.toast('Audio tidak bisa diputar.'); }); } else { audio.pause(); b.setAttribute('aria-pressed', 'false'); viz.classList.add('diam'); }
          }
        });
      }

      function rahasia() {
        berhenti();
        var el = layar('<div class="sk-rahasia"><button type="button" class="sk-kembali" data-a="awal" aria-label="Kembali">‹</button><p class="sk-kpd">★ ' + esc(d.tersembunyi.judul).toUpperCase() + '</p><h2>' + esc(d.tersembunyi.label) + '</h2><button type="button" class="sk-amplop" aria-label="Buka pesan rahasia">' + ic('lock') + '<span>Ketuk untuk membuka</span></button><div class="sk-pesan" hidden><p>' + esc(d.tersembunyi.pesan) + '</p></div><p class="sk-penutup" hidden>' + esc(d.penutup) + '</p>' + S.kredit(d.pengirim) + '<button type="button" class="sk-play" data-a="awal" hidden>↻ Putar dari Awal</button></div>', 'sk-gelap');
        el.querySelector('.sk-kembali').addEventListener('click', awal);
        el.querySelector('.sk-amplop').addEventListener('click', function (e) { e.currentTarget.hidden = true; if (window.Suara) window.Suara.kertas(); el.querySelector('.sk-pesan').hidden = false; el.querySelector('.sk-pesan').classList.add('muncul'); S.dariEl(el.querySelector('.sk-pesan'), 50, ['#F107A3', '#7B2FF7', '#fff'], { kuat: 8 }); S.jeda(function () { var pn = el.querySelector('.sk-penutup'); pn.hidden = false; pn.classList.add('muncul'); var u = el.querySelector('.sk-play'); u.hidden = false; S.akhir(); }, 1800); });
        el.querySelector('.sk-play').addEventListener('click', function () { dengar = {}; awal(); });
      }
      awal();
    }
  });
})();
