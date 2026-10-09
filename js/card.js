/* ==========================================================
   HALAMAN UCAPAN — /u/{kode}
   • Hanya memuat data ucapan (tanpa kontak pembeli) lewat getCard.
   • Pesan rahasia TIDAK ada di halaman: baru diminta ke server setelah tombol/password (F-53).
   • Musik baru berbunyi setelah penerima mengetuk "Buka" (aturan browser).
   • Special kustom: salin berkas ini ke /special/{kode}/index.html dan isi <body data-slug="...">.
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, ic = U.ic, API = window.DearoraAPI;
  var $root = document.getElementById('kartu');
  var audio = null, data = null, slug = '';

  function ambilSlug() {
    var s = document.body.dataset.slug;
    if (s) return s;
    var q = new URLSearchParams(location.search).get('k');
    if (q) return q;
    var m = /\/u\/([A-Za-z0-9]+)\/?$/.exec(location.pathname);
    return m ? m[1] : '';
  }
  function tgl(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(t)) : ''; }
  function fotoUrl(id) { return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w1600'; }
  function fotoCadangan(id) { return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w1600'; }
  function aman(u) { return /^https:\/\//.test(u) || /^assets\/[\w\-./]+$/.test(u) ? (/^assets\//.test(u) ? '/' + u : u) : ''; }

  function pesanAkhir(ikon, judul, teks, tema) {
    $root.className = 'card-root theme theme-' + (tema || 'blossom');
    $root.innerHTML = '<div class="card-pesan"><span class="ico">' + ic(ikon) + '</span><h1>' + esc(judul) + '</h1><p>' + esc(teks) + '</p>' +
      '<a class="cbtn" href="/">Kenal Dearora</a></div>';
  }

  function dariTeks(d) {
    if (d.dari.tipe === 'anonim') return '— Seseorang yang menyayangimu';
    return '— ' + d.dari.nilai;
  }

  function opening(d) {
    var kat = U.CONTOH[d.kategori] || { judul: 'Ada Pesan Untukmu' };
    var ikon = U.ikonTema(d.tema, d.kategori);
    var tombol = '<button type="button" class="cbtn" id="btnBuka">Buka Ucapan</button>';
    if (d.pembuka === 'amplop' || d.amplop) {
      return '<div class="opening" id="opening"><p class="kpd">Untuk ' + esc(d.penerima) + '</p>' +
        '<div class="envelope" id="amplop" aria-hidden="true"><div class="env-back"></div><div class="env-letter"></div><div class="env-front"></div><div class="env-flap"></div><div class="env-seal">' + ic('heart') + '</div></div>' +
        '<h1>' + esc(kat.judul) + '</h1><p class="sub">Ada surat yang menunggu untuk dibuka.</p>' + tombol + '</div>';
    }
    if (d.pembuka === 'foto' && d.foto.length) {
      return '<div class="opening foto" id="opening" style="background-image:url(\'' + esc(fotoUrl(d.foto[0])) + '\')"><span class="ico">' + ic(ikon) + '</span>' +
        '<p class="kpd">Untuk ' + esc(d.penerima) + '</p><h1>' + esc(kat.judul) + '</h1>' + tombol + '</div>';
    }
    return '<div class="opening" id="opening">' + U.partikel(8, d.tema === 'cinema' || d.tema === 'arcade' ? 'sparkles' : 'heart') +
      '<span class="ico">' + ic(ikon) + '</span><p class="kpd">Untuk ' + esc(d.penerima) + '</p><h1>' + esc(kat.judul) + '</h1><p class="sub">Ada pesan spesial yang menunggumu.</p>' + tombol + '</div>';
  }

  function galeri(d) {
    if (!d.foto.length) return '';
    var item = function (id, i) {
      return '<figure class="foto-item" data-foto="' + esc(id) + '"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Foto kenangan ' + (i + 1) + '" src="' + esc(fotoUrl(id)) + '" data-alt="' + esc(fotoCadangan(id)) + '"></figure>';
    };
    if (d.paket === 'basic' || d.foto.length === 1) return '<section class="galeri grid3" aria-label="Foto">' + d.foto.map(item).join('') + '</section>';
    return '<section aria-label="Timeline kenangan"><div class="timeline">' + d.foto.map(function (id, i) {
      return '<div class="tl-item"><p class="tl-cap">Kenangan ' + (i + 1) + '</p>' + item(id, i) + '</div>';
    }).join('') + '</div></section>';
  }

  function isi(d) {
    return '<div class="content" id="content">' +
      '<section class="salam"><p class="kpd">Untuk</p><h1>' + esc(d.penerima) + '</h1></section>' +
      '<section class="paper"><p class="isi">' + esc(d.pesan) + '</p><p class="dari">' + esc(dariTeks(d)) + '</p></section>' +
      (d.pesanPersonal ? '<section><p class="personal">' + esc(d.pesanPersonal) + '</p></section>' : '') +
      galeri(d) +
      (d.video ? '<section class="video-wrap"><iframe loading="lazy" title="Video kenangan" src="https://drive.google.com/file/d/' + encodeURIComponent(d.video) + '/preview" allow="autoplay; fullscreen" referrerpolicy="no-referrer"></iframe></section>' : '') +
      (d.rahasia ? '<section class="rahasia" id="rahasia"><span class="ico">' + ic('lock') + '</span><p><strong>Ada pesan rahasia untukmu</strong></p>' +
        '<div id="rahasiaIsi"><button type="button" class="cbtn" id="btnRahasia">Buka Pesan Rahasia</button></div></section>' : '') +
      '<section class="penutup"><p>' + (d.kedaluwarsa ? 'Ucapan ini aktif sampai ' + esc(tgl(d.kedaluwarsa)) + '.' : '') + '</p><p>Dibuat dengan rasa di <a href="/" target="_blank" rel="noopener">Dearora</a></p></section>' +
      '</div>';
  }

  function mainkanMusik() {
    if (!data.musik) return;
    var u = aman(data.musik.url); if (!u) return;
    audio = new Audio(u); audio.loop = true; audio.preload = 'auto';
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'musik-btn'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Putar musik: ' + data.musik.judul);
    b.innerHTML = ic('music'); document.body.appendChild(b);
    function set(main) { b.setAttribute('aria-pressed', String(main)); b.innerHTML = ic(main ? 'pause' : 'music'); b.setAttribute('aria-label', (main ? 'Jeda musik: ' : 'Putar musik: ') + data.musik.judul); }
    b.addEventListener('click', function () { if (audio.paused) audio.play().then(function () { set(true); }, function () { set(false); }); else { audio.pause(); set(false); } });
    audio.play().then(function () { set(true); }, function () { set(false); });     // dipicu ketukan "Buka": diizinkan browser
  }

  function bukaRahasia() {
    var kotak = document.getElementById('rahasiaIsi');
    function tampil(teks) { kotak.innerHTML = '<p class="terbuka">' + esc(teks) + '</p>'; }
    async function minta(pw, galat, tombol) {
      if (tombol) { tombol.disabled = true; tombol.textContent = 'Memeriksa…'; }
      try {
        var r = await API.post('unlockSecret', { k: slug, password: pw }, { timeout: 20000 });
        if (r.success) { tampil(r.data.pesan); return; }
        if (galat) { galat.hidden = false; galat.textContent = r.message || 'Gagal membuka.'; }
      } catch (e) { if (galat) { galat.hidden = false; galat.textContent = 'Koneksi bermasalah. Coba lagi.'; } }
      if (tombol) { tombol.disabled = false; tombol.textContent = 'Buka'; }
    }
    if (!data.perluPassword) { minta('', null, document.getElementById('btnRahasia')); return; }
    kotak.innerHTML = '<form id="fRahasia" novalidate><label for="pwRahasia" class="small" style="font-weight:700">Masukkan password dari pengirim</label>' +
      '<input id="pwRahasia" type="password" autocomplete="off" maxlength="30"><p class="galat small" role="alert" hidden></p><button type="submit" class="cbtn">Buka</button></form>';
    var f = document.getElementById('fRahasia'), pw = document.getElementById('pwRahasia'); pw.focus();
    f.addEventListener('submit', function (ev) { ev.preventDefault(); minta(pw.value, f.querySelector('.galat'), f.querySelector('button')); });
  }

  function lightbox(id) {
    var dlg = document.createElement('dialog'); dlg.className = 'lightbox'; dlg.setAttribute('aria-label', 'Foto diperbesar');
    dlg.innerHTML = '<button type="button" aria-label="Tutup foto">' + ic('x') + '</button><img alt="Foto diperbesar" referrerpolicy="no-referrer" src="' + esc(fotoUrl(id)) + '">';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function () { dlg.close(); }); dlg.addEventListener('close', function () { dlg.remove(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  function render(d) {
    data = d;
    $root.className = 'card-root theme theme-' + U.temaDari('tema:' + d.tema);
    $root.innerHTML = isi(d) + opening(d);
    document.title = 'Ucapan untukmu — Dearora';
    var op = document.getElementById('opening'), ct = document.getElementById('content');
    document.body.style.overflow = 'hidden';
    var btn = document.getElementById('btnBuka'); btn.focus({ preventScroll: true });
    btn.addEventListener('click', function () {
      var amp = document.getElementById('amplop');
      var buka = function () {
        op.classList.add('gone'); document.body.style.overflow = ''; ct.classList.add('show'); mainkanMusik();
        window.scrollTo(0, 0); var h = ct.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      };
      if (amp) { amp.classList.add('open'); btn.disabled = true; setTimeout(buka, 1300); } else buka();
    });
    $root.addEventListener('click', function (ev) {
      var f = ev.target.closest('[data-foto]'); if (f) { lightbox(f.dataset.foto); return; }
      if (ev.target.closest('#btnRahasia')) bukaRahasia();
    });
    $root.addEventListener('error', function (ev) {      // cadangan bila thumbnail Drive gagal
      var im = ev.target; if (im.tagName === 'IMG' && im.dataset.alt && im.src !== im.dataset.alt) { im.src = im.dataset.alt; im.removeAttribute('data-alt'); }
    }, true);
  }

  async function muat() {
    slug = ambilSlug();
    if (!slug) { pesanAkhir('info', 'Link Tidak Lengkap', 'Alamat ucapan ini tidak valid. Periksa kembali link yang kamu terima.'); return; }
    if (!API.siap()) { pesanAkhir('info', 'Mode Pratinjau', 'Isi GAS_URL di js/config.js agar ucapan dapat dimuat.'); return; }
    try {
      var r = await API.get('getCard', { k: slug }, { coba: 2, timeout: 20000 });
      if (r.success) { render(r.data); return; }
      if (r.kode === 'kedaluwarsa') pesanAkhir('moon', 'Ucapan Ini Sudah Berakhir', 'Masa aktif ucapan ini sudah habis, sehingga isinya telah dihapus. Terima kasih sudah mampir.');
      else pesanAkhir('info', 'Ucapan Tidak Ditemukan', 'Link ini tidak valid atau sudah tidak tersedia. Periksa kembali link yang kamu terima.');
    } catch (e) {
      $root.className = 'card-root theme theme-blossom';
      $root.innerHTML = '<div class="card-pesan"><span class="ico">' + ic('info') + '</span><h1>Belum Bisa Dibuka</h1><p>Koneksi bermasalah. Periksa internetmu lalu coba lagi.</p><button type="button" class="cbtn" id="ulang">Coba Lagi</button></div>';
      document.getElementById('ulang').addEventListener('click', function () { $root.innerHTML = '<div class="card-loading"><span class="spinner"></span><p>Membuka ucapanmu…</p></div>'; muat(); });
    }
  }

  muat();
})();
