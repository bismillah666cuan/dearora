/* ==========================================================
   SELEBSTYLE — penerima langsung masuk ke feed vertikal seperti membuka aplikasi sosial.
   Geser ke atas untuk melihat kiriman. Komentar sudah ditulis pengirim dan muncul bertahap.
   Kiriman terakhir "Disematkan untukmu" berkembang menjadi pesan personal yang panjang.
   Tombol/ikon dibuat generik (bukan aset platform mana pun).
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, ic = S.ic;
  var DEMO = {
    akun: 'for.rani', penerima: 'Rani', pengirim: 'Dimas',
    posts: [
      { tipe: 'foto', foto: '', efek: 'zoom', suka: 128, caption: 'Hari itu kita belum tahu bakal sedekat ini. Sebuah kenangan yang selalu kuputar ulang.' },
      { tipe: 'kolase', foto: ['', '', '', ''], efek: 'geser', suka: 245, caption: 'Kompilasi ekspresi lucumu. Dipublikasikan tanpa izin, maaf ya.' },
      { tipe: 'teks', teks: 'Kamu itu orang yang bikin hari-hari biasa terasa seru.', warna: ['#FF8A5B', '#E8336D'], efek: 'pudar', suka: 312, caption: 'Pesan singkat, tapi sungguh-sungguh.' },
      { tipe: 'foto', foto: '', efek: 'miring', suka: 190, caption: 'Kamu yang tertawa paling keras. Aku suka banget itu.' }
    ],
    komentar: [
      { nama: 'sahabat.lama', teks: 'Kamu berhak bahagia.' }, { nama: 'tim.hore', teks: 'Selamat ulang tahun, ya!' }, { nama: 'si.pendiam', teks: 'Kamu pantas dicintai.' },
      { nama: 'teman.kantin', teks: 'Terima kasih sudah selalu ada buat kami.' }, { nama: 'dimas', teks: 'Orang baik dikelilingi orang baik. Itu kamu.' }
    ],
    sematan: { foto: '', caption: 'Dari semua orang di dunia ini, aku bersyukur sempat mengenalmu.', panjang: 'Rani, kalau kamu membaca sampai sini, aku ingin bilang: aku bersyukur sekali sempat mengenalmu. Kamu mungkin tidak sadar, tapi kehadiranmu membuat banyak hari terasa lebih ringan. Terima kasih sudah menjadi kamu, apa adanya. Selamat ulang tahun, dan semoga semua hal baik menemukanmu.' },
    penutup: 'Kamu sampai di ujung feed. Tapi cerita kita belum selesai. Terima kasih sudah ada, Rani.'
  };
  S.reg('feed', {
    nama: 'Selebstyle', demo: DEMO,
    adapt: function (f, c) {
      var efek = ['zoom', 'geser', 'pudar', 'miring'], PAL = [['#FF8A5B', '#E8336D'], ['#7B2FF7', '#F107A3'], ['#2D9CDB', '#6FCF97']];
      var posts = (f.posts || []).map(function (p, i) {
        if (p.tipe === 'kolase') { var fs = (p.fotoKolase || []).slice(0, 4); while (fs.length < 4) fs.push(fs.length ? fs[fs.length - 1] : ''); return { tipe: 'kolase', foto: fs, efek: 'geser', suka: 120 + i * 37, caption: p.caption }; }
        if (p.tipe === 'teks') return { tipe: 'teks', teks: p.teks || p.caption, warna: PAL[i % 3], efek: 'pudar', suka: 140 + i * 41, caption: p.caption };
        return { tipe: 'foto', foto: p.foto, efek: efek[i % 4], suka: 100 + i * 29, caption: p.caption };
      });
      var kom = (f.komentar || []).filter(function (k) { return k.teks; }).map(function (k) { return { nama: k.nama || 'sahabat', teks: k.teks }; });
      if (!kom.length) kom = [{ nama: 'sahabat.lama', teks: 'Kamu berhak bahagia.' }, { nama: 'tim.hore', teks: 'Selamat ya, kamu hebat!' }, { nama: 'si.pendiam', teks: 'Kamu pantas dicintai.' }, { nama: 'teman.dekat', teks: 'Terima kasih sudah selalu ada.' }];
      var sm = f.sematan || {};
      return { akun: f.akun, penerima: c.penerima, pengirim: c.pengirim, posts: posts, komentar: kom, sematan: { foto: sm.foto, caption: sm.caption, panjang: sm.panjang }, penutup: f.penutup || 'Kamu sampai di ujung feed. Tapi cerita kita belum selesai.' };
    },
    mulai: function (root, d) {
      var suka = {}, kom = null;
      function ikon(k, n, label, aktif) { return '<button type="button" class="fd-aksi" data-a="' + k + '" aria-label="' + label + '" aria-pressed="' + !!aktif + '"><span>' + ic(k === 'suka' ? 'heart' : k === 'komen' ? 'chat' : 'send') + '</span><small>' + n + '</small></button>'; }
      function media(p, i) {
        if (p.tipe === 'kolase') return '<div class="fd-kolase">' + p.foto.map(function (f, k) { return '<img alt="Foto kolase ' + (k + 1) + '" style="--k:' + k + '" src="' + esc(S.src(f, i + k)) + '">'; }).join('') + '</div>';
        if (p.tipe === 'teks') return '<div class="fd-teks" style="background:linear-gradient(160deg,' + p.warna[0] + ',' + p.warna[1] + ')"><p>' + esc(p.teks) + '</p></div>';
        return '<img class="fd-foto" alt="Foto kenangan" src="' + esc(S.src(p.foto, i)) + '">';
      }
      function post(p, i, sematan) {
        var n = (p.suka || 100), tag = sematan ? '<span class="fd-pin">' + ic('pin') + ' Disematkan untukmu</span>' : '';
        return '<section class="fd-post" data-i="' + i + '" aria-label="Kiriman ' + (i + 1) + '"><div class="fd-media efek-' + (p.efek || 'zoom') + '">' + media(p, i) + '</div><div class="fd-grad"></div>' +
          '<div class="fd-akun"><span class="fd-ava">' + esc(d.penerima.charAt(0)) + '</span><b>@' + esc(d.akun) + '</b>' + tag + '</div>' +
          '<div class="fd-aksis">' + ikon('suka', n, 'Suka', false) + ikon('komen', d.komentar.length, 'Komentar', false) + ikon('bagi', 'Bagikan', 'Bagikan', false) + '</div>' +
          '<div class="fd-caption' + (sematan ? ' sematan' : '') + '"><p>' + esc(p.caption) + '</p>' + (sematan ? '<button type="button" class="fd-lagi" data-a="lagi">lihat selengkapnya</button>' : '') + '</div></section>';
      }
      var daftar = d.posts.map(function (p, i) { return post(p, i, false); });
      daftar.push(post({ tipe: 'foto', foto: d.sematan.foto, efek: 'zoom', suka: 999, caption: d.sematan.caption }, d.posts.length, true));
      daftar.push('<section class="fd-post fd-akhir" data-i="' + (d.posts.length + 1) + '"><div class="fd-hatiw" aria-hidden="true"></div><div class="fd-akhir-isi"><h1>Selesai ♥</h1><p>' + esc(d.penutup) + '</p>' + S.kredit(d.pengirim) + '<button type="button" class="fd-ulang" data-a="ulang">↻ Putar Ulang Hariku</button></div></section>');
      root.innerHTML = '<div class="fd-feed" id="fdFeed" tabindex="0">' + daftar.join('') + '</div><p class="fd-petunjuk" id="fdPet">Geser ke atas ▴</p>';
      var feed = root.querySelector('#fdFeed');
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio > .6) { e.target.classList.add('aktif'); if (e.target.classList.contains('fd-akhir')) S.akhir(); if (e.target.dataset.i !== '0') { var pt = root.querySelector('#fdPet'); if (pt) pt.remove(); } } else e.target.classList.remove('aktif'); }); }, { root: feed, threshold: [.6] });
      feed.querySelectorAll('.fd-post').forEach(function (x) { io.observe(x); });
      feed.querySelector('.fd-post').classList.add('aktif');

      function komentar(btn) {
        var s = document.createElement('div'); s.className = 'fd-sheet'; s.innerHTML = '<div class="fd-sheet-isi" role="dialog" aria-modal="true" aria-label="Komentar"><div class="fd-sh-kep"><b>' + d.komentar.length + ' komentar</b><button type="button" data-tutup aria-label="Tutup">' + ic('x') + '</button></div><ul class="fd-kom"></ul><div class="fd-tulis" aria-hidden="true">Tambahkan komentar…</div></div>';
        root.appendChild(s); var ul = s.querySelector('.fd-kom');
        d.komentar.forEach(function (k, i) { S.jeda(function () { if (!s.isConnected) return; var li = document.createElement('li'); li.innerHTML = '<span class="fd-kava">' + esc(k.nama.charAt(0).toUpperCase()) + '</span><div><b>' + esc(k.nama) + '</b><p>' + esc(k.teks) + '</p></div>'; ul.appendChild(li); }, 350 + i * 700); });
        s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-tutup]')) s.remove(); });
      }
      function panjang() {
        var s = document.createElement('div'); s.className = 'fd-sheet fd-penuh'; s.innerHTML = '<article class="fd-surat" role="dialog" aria-modal="true"><span class="fd-pin">' + ic('pin') + ' Disematkan untukmu</span><h2>Untuk ' + esc(d.penerima) + '</h2><p>' + S.kata(d.sematan.panjang, 6000, 60) + '</p><small>— ' + esc(d.pengirim) + '</small><button type="button" data-tutup class="fd-ulang">Tutup</button></article>';
        root.appendChild(s); s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-tutup]')) s.remove(); }); S.dariEl(s.querySelector('h2'), 40, ['#FF8A5B', '#E8336D', '#fff'], { kuat: 8 });
      }
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a;
        if (a === 'suka') { var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); var sm = b.querySelector('small'); sm.textContent = String(Number(sm.textContent) + (on ? 1 : -1)); if (on) S.dariEl(b, 14, ['#FF3B6E', '#FF8FB1', '#fff'], { kuat: 5, naik: 3 }); }
        else if (a === 'komen') komentar(b); else if (a === 'bagi') S.toast('Link ucapan disalin. Bagikan ke siapa saja!'); else if (a === 'lagi') panjang();
        else if (a === 'ulang') feed.scrollTo({ top: 0, behavior: S.reduce ? 'auto' : 'smooth' });
      });
      root.addEventListener('dblclick', function (e) { var m = e.target.closest('.fd-media'); if (!m) return; var bt = m.parentNode.querySelector('[data-a="suka"]'); if (bt.getAttribute('aria-pressed') !== 'true') bt.click(); S.confetti(e.clientX, e.clientY, 16, ['#FF3B6E', '#FF8FB1', '#fff'], { kuat: 5, naik: 3 }); });
    }
  });
})();
