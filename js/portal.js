/* ==========================================================
   PORTAL PEMBELI — #/masuk, #/portal, #/pesanan?o=ORDERID
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, ic = U.ic, API = window.DearoraAPI, A = window.Auth;
  var $ = function (id) { return document.getElementById(id); };
  var run = 0;

  function toast(msg) { var t = $('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2400); }
  function tgl(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(t)) : '-'; }
  function tglJam(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(t)) + ' WIB' : '-'; }
  function salin(teks) {
    function ok() { toast('Disalin'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(teks).then(ok, function () { toast('Salin manual dari kolom'); });
    else { var ta = document.createElement('textarea'); ta.value = teks; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('Salin manual dari kolom'); } ta.remove(); }
  }
  function amanLink(u) { return /^https:\/\/[^\s]+$/.test(String(u || '')) ? u : (/^http:\/\/localhost[:/]/.test(String(u || '')) ? u : ''); }

  /* ---------------- Timeline status ---------------- */
  function langkahTimeline(paketId) {
    return paketId === 'special'
      ? ['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Selesai', 'Aktif', 'Kedaluwarsa']
      : ['Menunggu Pembayaran', 'Dibayar', 'Aktif', 'Kedaluwarsa'];
  }
  function timeline(paketId, status) {
    var l = langkahTimeline(paketId), pos = l.indexOf(status);
    if (status === 'Perlu Ditinjau') return '<p class="notice warn" role="status">Pembayaran sedang kami tinjau secara manual.</p>';
    if (status === 'Dibatalkan') return '<p class="notice" role="status">Pesanan dibatalkan.</p>';
    if (pos < 0) pos = 0;
    return '<ol class="tl" aria-label="Progres pesanan">' + l.map(function (n, i) {
      var k = i < pos ? 'done' : i === pos ? 'now' : '';
      return '<li class="' + k + '"' + (i === pos ? ' aria-current="step"' : '') + '><span class="dot">' + (i < pos ? ic('check') : '') + '</span><span class="lbl">' + esc(n) + '</span></li>';
    }).join('') + '</ol>';
  }

  function badge(status) {
    var tone = { 'Aktif': 'sage', 'Selesai': 'sage', 'Diproses': 'lav', 'Dibayar': 'lav', 'Menunggu Pembayaran': '', 'Kedaluwarsa': '', 'Perlu Ditinjau': '' }[status] || '';
    return '<span class="tag ' + tone + '">' + esc(status) + '</span>';
  }

  function masaAktifTeks(o) {
    if (o.status === 'Kedaluwarsa') return 'Masa aktif berakhir';
    if (!o.tglKedaluwarsa) return '';
    var s = o.sisaHari;
    return 'Aktif sampai ' + tgl(o.tglKedaluwarsa) + (s != null ? (s > 0 ? ' · ' + s + ' hari lagi' : ' · berakhir hari ini') : '');
  }

  function linkKartu(o) {
    var u = amanLink(o.linkHasil); if (!u) return '';
    return '<div class="link-card"><label class="small muted" for="lnk-' + esc(o.orderId) + '">Link ucapan</label>' +
      '<div class="link-row"><input class="input" id="lnk-' + esc(o.orderId) + '" readonly value="' + esc(u) + '">' +
      '<button type="button" class="btn btn-primary btn-sm" data-p="salin" data-v="' + esc(u) + '">Salin</button>' +
      '<a class="btn btn-secondary btn-sm" href="' + esc(u) + '" target="_blank" rel="noopener">Buka</a></div></div>';
  }

  /* ---------------- #/masuk ---------------- */
  function viewMasuk(c) {
    return '<section class="section" style="padding-top:3rem"><div class="container"><div class="status-wrap">' +
      '<div class="card form-card" id="masukRoot"></div>' +
      '<p class="small muted" style="text-align:center;margin-top:1rem">Belum punya kode redeem? <a class="text-accent" style="font-weight:700" href="#/buat">Buat ucapan</a> dulu. Kode dikirim ke email setelah pembayaran.</p>' +
      '</div></div></section>';
  }

  function afterMasuk(main, c) {
    if (A.ada()) { location.replace('#/portal'); return; }
    var root = $('masukRoot'), S = { langkah: 'kode', kode: '', galat: '', sibuk: false };
    var lanjut = (c.query && c.query.lanjut === 'buat') ? '#/buat' : '#/portal';

    function paintProses() {
      var m = S.sukses ? ['Berhasil! Membuka portalmu…', 'Sebentar lagi kamu diarahkan ke Pesanan Saya.']
        : S.langkah === 'kode' ? ['Memeriksa…', 'Sebentar ya.']
        : S.langkah === 'buat' ? ['Sedang membuat akunmu…', 'Password kamu sedang diamankan. Ini bisa memakan waktu beberapa detik. Mohon jangan tutup halaman ini.']
        : S.langkah === 'lupa1' ? ['Mengirim kode…', 'Kode 6 angka sedang dikirim ke emailmu.']
        : S.langkah === 'lupa2' ? ['Menyimpan password baru…', 'Password kamu sedang diamankan. Mohon jangan tutup halaman ini.']
        : ['Sedang masuk…', 'Mohon tunggu beberapa detik.'];
      root.innerHTML = '<div class="proses-box" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span><h1 class="h2" id="mTitle" tabindex="-1">' + esc(m[0]) + '</h1><p class="muted">' + esc(m[1]) + '</p><div class="bar" aria-hidden="true"><span></span></div></div>';
      var h = $('mTitle'); if (h) h.focus({ preventScroll: true });
    }
    function galatHTML() { return S.galat ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(S.galat) + '</p>' : ''; }
    function paint() {
      if (S.sibuk || S.sukses) { paintProses(); return; }
      var judul = { kode: 'Masuk ke Portal', buat: 'Buat Password', masuk: 'Masukkan Password', lupa1: 'Lupa Password', lupa2: 'Atur Password Baru' }[S.langkah];
      var isi = '', tombolKiri = '<span></span>', tombolUtama = 'Lanjut';
      if (S.langkah === 'kode') {
        isi = '<p class="muted" style="margin-bottom:1.25rem">Masuk dengan <strong>email</strong> yang kamu pakai saat memesan, atau <strong>kode redeem</strong> dari email tanda terima. Pertama kali masuk? Pakai kode redeem untuk membuat password.</p>' +
          '<div class="field' + (S.galat ? ' has-error' : '') + '"><label for="mKode">Email atau kode redeem</label>' +
          '<input class="input" id="mKode" name="username" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" placeholder="email@contoh.com atau DRA-XXXX-XXXX" value="' + esc(S.kode) + '" maxlength="100">' + galatHTML() + '</div>' +
          '<p class="small" style="margin-top:.75rem"><button type="button" class="link-btn" data-m="lupa">Lupa password atau kehilangan kode?</button></p>';
      } else if (S.langkah === 'lupa1') {
        isi = '<p class="muted" style="margin-bottom:1.25rem">Kami kirim <strong>kode 6 angka</strong> ke email yang kamu pakai saat memesan. Ini juga jalan keluar kalau kode redeem hilang.</p>' +
          '<div class="field' + (S.galat ? ' has-error' : '') + '"><label for="mEmail">Email</label><input class="input" id="mEmail" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="100" value="' + esc(S.email || '') + '">' + galatHTML() + '</div>';
        tombolKiri = '<button type="button" class="btn btn-secondary" data-m="ganti">Kembali</button>'; tombolUtama = 'Kirim kode';
      } else if (S.langkah === 'lupa2') {
        isi = '<p class="muted" style="margin-bottom:1rem">' + esc(S.info || 'Kode dikirim ke emailmu.') + '</p><p class="small muted" style="margin-bottom:1rem">Dikirim ke <strong>' + esc(S.email) + '</strong>. Kode berlaku 30 menit.</p>' +
          '<div class="field' + (S.galat ? ' has-error' : '') + '"><label for="mOtp">Kode 6 angka</label><input class="input" id="mOtp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456" value="' + esc(S.otp || '') + '">' + galatHTML() + '</div>' +
          '<div class="field"><label for="mPw">Password baru</label><input class="input" id="mPw" type="password" autocomplete="new-password" maxlength="72"><p class="hint">Minimal 8 karakter. Simpan baik-baik, tidak bisa dilihat lagi.</p></div>' +
          '<div class="field"><label for="mPw2">Ulangi password</label><input class="input" id="mPw2" type="password" autocomplete="new-password" maxlength="72"></div>' +
          '<p class="small"><button type="button" class="link-btn" data-m="kirim-ulang">Kirim ulang kode</button></p>';
        tombolKiri = '<button type="button" class="btn btn-secondary" data-m="ganti">Batal</button>'; tombolUtama = 'Simpan & Masuk';
      } else {
        isi = '<p class="muted" style="margin-bottom:1.25rem"><strong>' + esc(S.kode) + '</strong>' + (S.langkah === 'buat' ? ' dipakai pertama kali. Buat password (minimal 8 karakter) untuk akunmu.' : '') + '</p>' +
          '<input type="hidden" name="username" autocomplete="username" value="' + esc(S.kode) + '">' +
          '<div class="field' + (S.galat ? ' has-error' : '') + '"><label for="mPw">' + (S.langkah === 'buat' ? 'Password baru' : 'Password') + '</label>' +
          '<input class="input" id="mPw" type="password" autocomplete="' + (S.langkah === 'buat' ? 'new-password' : 'current-password') + '" maxlength="72">' +
          (S.langkah === 'buat' ? '<p class="hint">Minimal 8 karakter. Simpan baik-baik, tidak bisa dilihat lagi.</p>' : '') + '</div>' +
          (S.langkah === 'buat' ? '<div class="field"><label for="mPw2">Ulangi password</label><input class="input" id="mPw2" type="password" autocomplete="new-password" maxlength="72"></div>' : '') + galatHTML() +
          (S.langkah === 'masuk' ? '<p class="small" style="margin-top:.5rem"><button type="button" class="link-btn" data-m="lupa">Lupa password?</button></p>' : '');
        tombolKiri = '<button type="button" class="btn btn-secondary" data-m="ganti">Ganti akun</button>'; tombolUtama = S.langkah === 'buat' ? 'Simpan & Masuk' : 'Masuk';
      }
      root.innerHTML = '<h1 class="h2" id="mTitle" tabindex="-1">' + judul + '</h1><form id="mForm" novalidate>' + isi +
        '<div class="form-nav" style="margin-top:1rem">' + tombolKiri + '<button type="submit" class="btn btn-primary">' + tombolUtama + '</button></div></form>';
      var f = $({ kode: 'mKode', lupa1: 'mEmail', lupa2: 'mOtp' }[S.langkah] || 'mPw'); if (f) f.focus({ preventScroll: true });
    }
    function kePortal() { S.sibuk = false; S.sukses = true; paint(); location.hash = lanjut; }

    root.addEventListener('submit', async function (ev) {
      ev.preventDefault(); if (S.sibuk) return;
      S.galat = '';
      try {
        if (S.langkah === 'kode') {
          var v = ($('mKode').value || '').trim();
          if (v.indexOf('@') >= 0) {                                   // email: langsung ke password (server tidak membocorkan apakah email terdaftar)
            S.kode = v.toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.kode)) { S.galat = 'Format email tidak valid.'; paint(); return; }
            S.langkah = 'masuk'; paint(); return;
          }
          S.kode = v.toUpperCase().replace(/\s+/g, '');
          if (/^DRA-\d{6}-[A-Z0-9]{5}$/.test(S.kode)) { S.galat = 'Itu nomor pesanan, bukan kode redeem. Masuk dengan email pemesan dan password-mu, atau pakai kode redeem (bentuknya DRA-7K3M-9QXA) dari email tanda terima.'; paint(); return; }
          if (!/^DRA-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(S.kode)) { S.galat = 'Tulis email atau kode dengan format DRA-7K3M-9QXA.'; paint(); return; }
          S.sibuk = true; paint();
          var r = await A.cek(S.kode); S.sibuk = false;
          if (!r.success) { S.galat = r.message || 'Kode tidak ditemukan.'; paint(); return; }
          S.langkah = r.data.perluPassword ? 'buat' : 'masuk'; paint(); return;
        }
        if (S.langkah === 'lupa1') {
          S.email = ($('mEmail').value || '').trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.email)) { S.galat = 'Format email tidak valid.'; paint(); return; }
          S.sibuk = true; paint(); var rm = await A.lupaMinta(S.email); S.sibuk = false;
          if (!rm.success) { S.galat = rm.message || 'Gagal mengirim kode.'; paint(); return; }
          S.info = rm.data.pesan; S.otp = ''; S.langkah = 'lupa2'; paint(); return;
        }
        if (S.langkah === 'lupa2') {
          S.otp = ($('mOtp').value || '').replace(/\s+/g, ''); var pw1 = $('mPw').value || '';
          if (!/^[0-9]{6}$/.test(S.otp)) { S.galat = 'Kode terdiri dari 6 angka.'; paint(); return; }
          if (pw1.length < 8) { S.galat = 'Password minimal 8 karakter.'; paint(); return; }
          if (pw1 !== $('mPw2').value) { S.galat = 'Kedua password tidak sama.'; paint(); return; }
          S.sibuk = true; paint(); var rt = await A.lupaTetapkan(S.email, S.otp, pw1); S.sibuk = false;
          if (!rt.success) { S.galat = rt.message || 'Gagal menyimpan.'; paint(); return; }
          kePortal(); return;
        }
        var pw = $('mPw').value || '';
        if (S.langkah === 'buat') {
          if (pw.length < 8) { S.galat = 'Password minimal 8 karakter.'; paint(); return; }
          if (pw !== $('mPw2').value) { S.galat = 'Kedua password tidak sama.'; paint(); return; }
        } else if (!pw) { S.galat = 'Password wajib diisi.'; paint(); return; }
        S.sibuk = true; paint();
        var h = S.langkah === 'buat' ? await A.buatPassword(S.kode, pw) : await A.masuk(S.kode, pw);
        S.sibuk = false;
        if (!h.success) { S.galat = h.message || 'Gagal masuk.'; paint(); return; }
        kePortal();
      } catch (e) { S.sibuk = false; S.galat = 'Koneksi bermasalah. Coba lagi.'; paint(); }
    });
    root.addEventListener('click', async function (ev) {
      var b = ev.target.closest('[data-m]'); if (!b) return; var m = b.dataset.m;
      if (m === 'ganti') { S = { langkah: 'kode', kode: S.kode, galat: '', sibuk: false }; paint(); return; }
      if (m === 'lupa') { S = { langkah: 'lupa1', kode: S.kode, email: S.kode.indexOf('@') >= 0 ? S.kode : '', galat: '', sibuk: false }; paint(); return; }
      if (m === 'kirim-ulang') {
        S.sibuk = true; S.langkah = 'lupa1'; paint();
        try { var rm2 = await A.lupaMinta(S.email); S.sibuk = false; S.langkah = 'lupa2'; if (rm2.success) S.info = 'Kode baru sudah dikirim.'; else S.galat = rm2.message || 'Gagal mengirim ulang.'; } catch (e) { S.sibuk = false; S.langkah = 'lupa2'; S.galat = 'Koneksi bermasalah. Coba lagi.'; }
        paint();
      }
    });
    paint();
  }

  /* ---------------- #/portal ---------------- */
  function viewPortal() {
    return '<header class="page-head"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>Portal Saya</span></nav>' +
      '<h1 class="h1" id="pTitle" tabindex="-1">Pesanan Saya</h1><p class="lead" id="pSapa"></p></div></header>' +
      '<section class="section" style="padding-top:2rem"><div class="container"><div class="portal" id="portalRoot"><div class="skeleton sk-card" aria-hidden="true"></div></div></div></section>';
  }

  function statusDilihat(o) {
    if (o.status !== 'Aktif' && o.status !== 'Selesai' && o.status !== 'Diproses' && o.status !== 'Kedaluwarsa') return '';
    var lihat = o.dilihat ? '<span class="tag sage">' + ic('check') + ' Sudah dilihat penerima · ' + esc(tglJam(o.dilihat)) + '</span>' : '<span class="tag">Belum dilihat penerima</span>';
    var bls = o.jumlahBalasan ? ' <span class="tag rose">' + ic('heart') + ' ' + o.jumlahBalasan + ' balasan</span>' : '';
    if (o.bisaTesti && !o.statusTesti) bls += ' <a class="tag lav" href="#/pesanan?o=' + encodeURIComponent(o.orderId) + '">★ Beri testimoni</a>';
    if (o.paketId === 'invitation' && o.jumlahRsvp) bls += ' <span class="tag sage">' + ic('heart') + ' ' + o.jumlahRsvp + ' tamu merespons</span>';
    return '<p class="small" style="margin:.5rem 0">' + lihat + bls + '</p>';
  }
  function kartuPesanan(o) {
    var pdf = (o.status !== 'Menunggu Pembayaran' && o.status !== 'Dibatalkan' && o.status !== 'Perlu Ditinjau');
    return '<article class="card order-card">' +
      '<div class="order-top"><div><p class="order-id">' + esc(o.orderId) + '</p><p class="small muted">Paket ' + esc(o.paket) + (o.desain ? ' · ' + esc(o.desain) : '') + ' · untuk ' + esc(o.penerima) + ' · ' + esc(tgl(o.tglOrder)) + '</p></div>' + badge(o.status) + '</div>' +
      timeline(o.paketId, o.status) + statusDilihat(o) +
      (masaAktifTeks(o) ? '<p class="small" style="font-weight:600">' + esc(masaAktifTeks(o)) + '</p>' : '') +
      (o.paketId === 'special' && o.status === 'Diproses' ? '<p class="small muted">Ucapan Special sedang dikerjakan manual. Estimasi 1–2 hari kerja.' + (o.alamatKustom ? ' Alamat yang dikunci: <strong>/u/' + esc(o.alamatKustom) + '</strong>' : '') + '</p>' : '') +
      linkKartu(o) +
      '<div class="order-act"><a class="btn btn-quiet btn-sm" href="#/pesanan?o=' + encodeURIComponent(o.orderId) + '">Detail' + (o.paketId === 'special' ? ' &amp; Revisi' : '') + '</a>' +
      (pdf ? '<button type="button" class="btn btn-quiet btn-sm" data-p="pdf" data-o="' + esc(o.orderId) + '">Unduh PDF Bukti</button>' : '') + '</div></article>';
  }

  async function afterPortal(main, c) {
    if (!A.ada()) { location.replace('#/masuk'); return; }
    var my = ++run, root = $('portalRoot');
    root.addEventListener('click', klikAksi);
    try {
      var r = await A.panggil('myOrders', {});
      if (my !== run) return;
      if (!r.success) { A.keluarLokal(); location.replace('#/masuk'); return; }
      var nama = (r.data.profil && r.data.profil.nama) || '';
      $('pSapa').textContent = nama ? 'Halo, ' + nama + '. Pantau progres dan bagikan link ucapanmu di sini.' : '';
      var p = r.data.pesanan;
      root.innerHTML = '<div class="portal-bar"><a class="btn btn-primary btn-sm" href="#/buat">' + ic('heart') + ' Buat Ucapan Baru</a><button type="button" class="btn btn-secondary btn-sm" data-p="keluar">Keluar</button></div>' +
        (p.length ? ajakTesti(p) + '<div class="order-list">' + p.map(kartuPesanan).join('') + '</div>' : '<div class="state-box"><p>Belum ada pesanan di akun ini.</p><a class="btn btn-primary btn-sm" href="#/buat">Buat Ucapan</a></div>');
    } catch (e) { if (my === run) root.innerHTML = U.errorBox('Pesanan belum bisa dimuat. Periksa koneksi lalu coba lagi.'); }
  }

  /* ---------------- #/pesanan?o= ---------------- */
  function viewDetail() {
    return '<header class="page-head"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/portal">Portal Saya</a><span aria-hidden="true">/</span><span>Detail Pesanan</span></nav>' +
      '<h1 class="h1" id="dTitle" tabindex="-1">Detail Pesanan</h1></div></header>' +
      '<section class="section" style="padding-top:2rem"><div class="container"><div class="portal" id="detailRoot"><div class="skeleton sk-card" aria-hidden="true"></div></div></div></section>';
  }

  /* ---------------- Testimoni ---------------- */
  var testiEdit = false;
  function ajakTesti(p) {
    var c = p.filter(function (o) { return o.bisaTesti && !o.statusTesti; })[0]; if (!c) return '';
    return '<div class="notice testi-ajak" style="margin-bottom:1rem"><span><strong>Bagaimana pengalamanmu dengan Dearora?</strong> Ceritakan singkat; testimonimu membantu pembeli lain.</span> <a class="btn btn-secondary btn-sm" href="#/pesanan?o=' + encodeURIComponent(c.orderId) + '">★ Tulis testimoni</a></div>';
  }
  function bintangTeks(n) { var s = '', i; for (i = 1; i <= 5; i++) s += '<span class="bt' + (i <= n ? ' on' : '') + '" aria-hidden="true">★</span>'; return '<span class="bintang" role="img" aria-label="' + n + ' dari 5 bintang">' + s + '</span>'; }
  function boxTesti(o) {
    var t = o.testi; if (!t || !t.bisa) return '';
    var st = { menunggu: ['Menunggu ditinjau', 'sage'], tampil: ['Ditampilkan di website Dearora', 'sage'], sembunyi: ['Belum ditampilkan di website', ''] };
    if (t.ada && !testiEdit) {
      var s = st[t.status] || ['', ''];
      return '<div class="card order-card" id="boxTesti"><h2 class="h3">Testimonimu</h2><p style="margin:.4rem 0">' + bintangTeks(t.rating) + ' <span class="tag ' + s[1] + '">' + esc(s[0]) + '</span></p><blockquote class="testi-isi">' + esc(t.isi) + '</blockquote>' +
        '<p class="small muted">Ditulis sebagai <strong>' + esc(t.nama) + '</strong>' + (t.keterangan ? ' · ' + esc(t.keterangan) : '') + '. Terima kasih sudah berbagi!' + (t.status === 'tampil' ? ' Bila kamu mengubahnya, testimoni ditinjau lagi sebelum tampil.' : '') + '</p>' +
        '<div class="order-act"><button type="button" class="btn btn-secondary btn-sm" data-p="testi-ubah">Ubah</button><button type="button" class="btn btn-quiet btn-sm" data-p="testi-hapus">Hapus</button></div></div>';
    }
    var v = t.ada ? t : { rating: 0, isi: '', nama: t.saranNama || '', keterangan: '' }, rd = '', i;
    for (i = 5; i >= 1; i--) rd += '<input type="radio" name="tRating" id="tR' + i + '" value="' + i + '"' + (v.rating === i ? ' checked' : '') + '><label for="tR' + i + '" title="' + i + ' bintang"><span aria-hidden="true">★</span><span class="sr">' + i + ' bintang</span></label>';
    return '<div class="card order-card" id="boxTesti"><h2 class="h3">' + (t.ada ? 'Ubah testimoni' : 'Beri testimoni') + '</h2>' +
      '<p class="small muted">Ceritakan pengalamanmu. Testimoni ditinjau dulu; bila disetujui, tampil di website Dearora dengan nama yang kamu tulis. Email dan WhatsApp-mu tidak pernah ditampilkan.</p>' +
      '<fieldset class="field" style="border:0;padding:0;margin:.75rem 0"><legend>Penilaian</legend><div class="rating-input" role="radiogroup" aria-label="Penilaian">' + rd + '</div><p class="err" id="eRating" role="alert" hidden></p></fieldset>' +
      '<div class="field"><label for="tIsi">Ceritamu</label><textarea id="tIsi" class="input textarea" rows="4" maxlength="400" placeholder="Mis. Ucapannya cantik, penerimanya sampai terharu...">' + esc(v.isi) + '</textarea><p class="hint"><span id="tHit">' + String(v.isi).length + '</span>/400 karakter (minimal 20)</p><p class="err" id="eIsi" role="alert" hidden></p></div>' +
      '<div class="row-2"><div class="field"><label for="tNama">Nama yang ditampilkan</label><input id="tNama" class="input" maxlength="40" value="' + esc(v.nama) + '" autocomplete="off"><p class="err" id="eNama" role="alert" hidden></p></div><div class="field"><label for="tKet">Keterangan (opsional)</label><input id="tKet" class="input" maxlength="40" value="' + esc(v.keterangan) + '" placeholder="Mis. Bandung" autocomplete="off"></div></div>' +
      '<label class="chk"><input type="checkbox" id="tIzin"> Saya mengizinkan testimoni ini ditinjau dan, bila disetujui, ditampilkan di website Dearora dengan nama di atas.</label><p class="err" id="eIzin" role="alert" hidden></p>' +
      '<div class="order-act" style="margin-top:.75rem"><button type="button" class="btn btn-primary btn-sm" data-p="testi-kirim">Kirim testimoni</button>' + (t.ada ? '<button type="button" class="btn btn-quiet btn-sm" data-p="testi-batal">Batal</button>' : '') + '</div></div>';
  }
  function segarkanTesti() { var e = $('boxTesti'); if (e && ordAktif) e.outerHTML = boxTesti(ordAktif); }
  function boxBalasan(o) {
    if (!(o.balasan && o.balasan.length)) return o.status === 'Aktif' ? '<div class="card order-card"><h2 class="h3">Balasan penerima</h2><p class="small muted">Belum ada balasan. Setelah penerima sampai di slide terakhir, ia bisa menulis balasan yang muncul di sini.</p></div>' : '';
    return '<div class="card order-card"><h2 class="h3">Balasan penerima (' + o.balasan.length + ')</h2><ul class="rev-list">' + o.balasan.map(function (b) {
      return '<li><span class="tag rose">' + esc(b.nama || 'Penerima') + '</span> <span class="small muted">' + esc(tglJam(b.tgl)) + '</span><p style="margin-top:.25rem;white-space:pre-wrap">' + esc(b.pesan) + '</p></li>'; }).join('') + '</ul></div>';
  }
  var tautanTamu = [];
  var SEB_KUNCI = { bapak: 'bapak', bpk: 'bapak', pak: 'bapak', ibu: 'ibu', bu: 'ibu', saudara: 'saudara', sdr: 'saudara', saudari: 'saudari', sdri: 'saudari', kakak: 'kak', kak: 'kak' };
  var SEB_TEKS = { bapak: 'Bapak', ibu: 'Ibu', saudara: 'Saudara', saudari: 'Saudari', kak: 'Kak', bapakibu: 'Bapak/Ibu', saudarai: 'Saudara/i' }, SUF_TEKS = { keluarga: 'beserta Keluarga', pasangan: '& Pasangan' };
  /** "Saudari Laiba" → {nama:'Laiba', s:'saudari'}; "Ibu Ani dan keluarga" → {nama:'Ani', s:'ibu', x:'keluarga'}; tanpa sebutan memakai sebutan bawaan. */
  function uraiTamu(baris, bawaan) {
    var t = String(baris || '').trim(), x = '', s = '', mx = /\s*(?:&|dan|\+)?\s*\(?\b(keluarga|pasangan)\)?\s*$/i.exec(t);
    if (mx && t.length > mx[0].length) { x = mx[1].toLowerCase(); t = t.slice(0, mx.index).trim(); }
    var ms = /^(bapak|bpk|pak|ibu|bu|saudara|sdr|saudari|sdri|kakak|kak)\.?\s+(.+)$/i.exec(t);
    if (ms) { s = SEB_KUNCI[ms[1].toLowerCase()]; t = ms[2].trim(); } else s = bawaan || '';
    return { nama: t.replace(/\s+/g, ' ').slice(0, 60), s: s, x: x };
  }
  function sapaTamu(u) { return [SEB_TEKS[u.s] || '', u.nama, SUF_TEKS[u.x] || ''].filter(Boolean).join(' '); }
  function salinTeks(teks, tombol) {
    var ok = function () { var t0 = tombol.textContent; tombol.textContent = 'Tersalin ✓'; setTimeout(function () { tombol.textContent = t0; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(teks).then(ok, ok); else { var a = document.createElement('textarea'); a.value = teks; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) { /* abaikan */ } a.remove(); ok(); }
  }
  function boxRsvp(o) {
    if (o.paketId !== 'invitation') return '';
    return '<div class="card order-card" id="boxRsvp"><h2 class="h3">Jawaban tamu (RSVP)</h2><div id="rsvpIsi"><p class="small muted">Memuat jawaban…</p></div></div>';
  }
  function tampilRsvp(r, o) {
    var rg = r.ringkas, st = { hadir: ['Hadir', 'sage'], tidak: ['Tidak hadir', ''], ragu: ['Belum pasti', 'rose'] };
    var link = o.linkHasil || '';
    var ring = '<div class="rsvp-ring"><div><b>' + rg.hadir + '</b><span>Hadir (' + rg.orang + ' orang)</span></div><div><b>' + rg.ragu + '</b><span>Belum pasti</span></div><div><b>' + rg.tidak + '</b><span>Tidak hadir</span></div><div><b>' + rg.total + '/' + r.maks + '</b><span>Jawaban masuk</span></div></div>';
    var daftar = r.daftar.length ? '<ul class="rsvp-list">' + r.daftar.map(function (x) { return '<li><div><strong>' + esc(x.nama) + '</strong> <span class="tag ' + st[x.status][1] + '">' + st[x.status][0] + '</span>' + (x.status === 'hadir' ? ' <span class="small muted">' + x.jumlah + ' orang</span>' : '') + (x.ucapan ? '<p class="small">“' + esc(x.ucapan) + '”</p>' : '') + '<span class="small muted">' + esc(tglJam(x.tgl)) + (x.diubah ? ' · diubah' : '') + '</span></div><button type="button" class="btn btn-quiet btn-sm" data-p="rsvp-hapus" data-id="' + esc(x.id) + '" aria-label="Hapus jawaban ' + esc(x.nama) + '">' + ic('x') + '</button></li>'; }).join('') + '</ul>' : '<p class="small muted">Belum ada jawaban. Bagikan link undangan ke para tamu.</p>';
    var alat = '<div class="rsvp-alat"><button type="button" class="btn btn-secondary btn-sm" data-p="rsvp-csv"' + (r.daftar.length ? '' : ' disabled') + '>Unduh daftar (CSV)</button></div>' +
      '<details class="rsvp-tautan" id="rsvpTautan"><summary>Buat tautan personal untuk tiap tamu</summary><p class="small muted">Tempel nama tamu, <strong>satu per baris</strong>. Tulis sebutannya di depan nama bila perlu, misalnya <em>Saudari Laiba</em>, <em>Bapak Budi</em>, <em>Ibu Ani</em>, <em>Kak Dewi</em>. Tambahkan <em>keluarga</em> atau <em>pasangan</em> di belakang untuk "beserta Keluarga" atau "& Pasangan". Tamu akan disapa <strong>"Kepada Yth. Saudari Laiba"</strong> di undangannya, dan namanya otomatis terisi di formulir. Daftar ini <strong>tidak disimpan</strong> di server.</p>' +
        '<div class="field"><label for="rsvpSeb">Sebutan untuk nama tanpa sebutan</label><select class="input" id="rsvpSeb"><option value="">Tanpa sebutan (nama saja)</option><option value="saudarai">Saudara/i</option><option value="bapakibu">Bapak/Ibu</option><option value="bapak">Bapak</option><option value="ibu">Ibu</option><option value="saudara">Saudara</option><option value="saudari">Saudari</option><option value="kak">Kak</option></select></div>' +
        '<textarea id="rsvpNama" class="input textarea" rows="5" placeholder="Saudari Laiba&#10;Bapak Budi Santoso&#10;Ibu Ani dan keluarga&#10;Kak Dewi"></textarea>' +
        '<div class="field"><label for="rsvpPesan">Pesan pengantar (untuk WhatsApp)</label><textarea id="rsvpPesan" class="input textarea" rows="5">Kepada Yth. {sapa},\n\nDengan hormat, kami mengundang Anda untuk hadir pada acara kami. Silakan buka undangan digital berikut:\n{link}\n\nMohon konfirmasi kehadiran melalui undangan tersebut. Terima kasih.</textarea><p class="hint">{sapa} dan {link} akan diganti otomatis untuk tiap tamu.</p></div>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-p="rsvp-link" data-url="' + esc(link) + '">Buat tautan</button><div id="rsvpHasilList" aria-live="polite"></div></details>';    return ring + alat + '<h3 class="h3" style="margin-top:1rem">Daftar jawaban</h3>' + daftar;
  }
  var rsvpData = null, ordAktif = null;
  async function muatRsvp(o) {
    var el = $('rsvpIsi'); if (!el) return;
    try { var r = await A.panggil('rsvpDaftar', { orderId: o.orderId }); if (!r.success) { el.innerHTML = '<p class="err">' + esc(r.message || 'Gagal memuat.') + '</p>'; return; } rsvpData = r.data; el.innerHTML = tampilRsvp(r.data, o); }
    catch (e) { el.innerHTML = '<p class="err">Koneksi bermasalah. Muat ulang halaman.</p>'; }
  }
  function csvRsvp(o) {
    var q = function (s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""').replace(/^[=+\-@]/, "'$&") + '"'; };
    var baris = [['Nama', 'Status', 'Jumlah', 'Ucapan', 'Waktu'].join(',')].concat((rsvpData ? rsvpData.daftar : []).map(function (x) { return [q(x.nama), q({ hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Belum pasti' }[x.status]), x.jumlah, q(x.ucapan), q(x.tgl)].join(','); }));
    var b = new Blob(['\ufeff' + baris.join('\r\n')], { type: 'text/csv;charset=utf-8' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'jawaban-tamu-' + o.orderId + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 3000);
  }
  function boxChat(o) {
    if (o.paketId !== 'special') return '';
    var l = (o.chat || []).map(function (c) { return '<li class="chat-' + (c.peran === 'admin' ? 'adm' : 'pem') + '"><b>' + (c.peran === 'admin' ? 'Tim admin' : 'Kamu') + '</b> <span class="small muted">' + esc(tglJam(c.tgl)) + '</span><p>' + esc(c.pesan) + '</p></li>'; }).join('');
    return '<div class="card order-card" id="boxChat"><h2 class="h3">Chat dengan admin</h2>' +
      '<p class="small muted">Gunakan chat ini untuk mengarahkan desain Special: warna, urutan foto, atau hal yang masih kurang jelas.</p>' + (l ? '<ul class="chat-list">' + l + '</ul>' : '<p class="small muted">Belum ada pesan.</p>') +
      (o.chatAktif ? '<div class="field" style="margin-top:1rem"><label for="chatIsi">Tulis pesan</label><textarea class="input textarea" id="chatIsi" rows="3" maxlength="1000"></textarea></div><p class="err" id="chatErr" role="alert" hidden></p><button type="button" class="btn btn-primary btn-sm" data-p="chat-kirim" data-o="' + esc(o.orderId) + '">Kirim</button>' :
        '<p class="small" style="margin-top:.75rem">Chat sudah ditutup karena pesanan selesai dan jatah revisi habis.</p>') + '</div>';
  }
  function isiDetail(o) {
    ordAktif = o; testiEdit = false; if (o.paketId === 'invitation') setTimeout(function () { muatRsvp(o); }, 0);
    var rev = (o.revisi || []).map(function (x) {
      return '<li><span class="tag lav">' + esc(x.status) + '</span> <span class="small muted">' + esc(tglJam(x.tglMinta)) + '</span><p style="margin-top:.25rem">' + esc(x.catatan) + '</p></li>';
    }).join('');
    var boxRevisi = '';
    if (o.paketId === 'special') {
      boxRevisi = '<div class="card order-card"><h2 class="h3">Revisi</h2>' +
        '<p class="small muted">Paket Special mendapat 1× revisi gratis untuk perubahan teks, foto, atau urutan (bukan mengganti konsep total). Sisa kuota: <strong>' + o.kuotaRevisi + '×</strong>.</p>' +
        (o.dapatRevisi ? '<div class="field" style="margin-top:1rem"><label for="revCatatan">Apa yang ingin diubah?</label><textarea class="input textarea" id="revCatatan" rows="4" maxlength="1050"></textarea><span class="counter" data-counter="revCatatan">0/1000</span><p class="err" id="revErr" role="alert" hidden></p></div>' +
          '<button type="button" class="btn btn-primary btn-sm" data-p="revisi" data-o="' + esc(o.orderId) + '">Ajukan Revisi</button>' : '<p class="small" style="margin-top:.75rem">' + (o.kuotaRevisi === 0 && o.revisi.length ? 'Kuota revisi sudah terpakai.' : 'Revisi dapat diajukan setelah ucapan selesai dibuat.') + '</p>') +
        (rev ? '<ul class="rev-list">' + rev + '</ul>' : '') + '</div>';
    }
    return '<article class="card order-card">' +
      '<div class="order-top"><div><p class="order-id">' + esc(o.orderId) + '</p><p class="small muted">Paket ' + esc(o.paket) + (o.desain ? ' · ' + esc(o.desain) : '') + '</p></div>' + badge(o.status) + '</div>' +
      timeline(o.paketId, o.status) + statusDilihat(o) +
      (masaAktifTeks(o) ? '<p class="small" style="font-weight:600">' + esc(masaAktifTeks(o)) + '</p>' : '') +
      (o.paketId === 'special' && o.status === 'Diproses' ? '<p class="small muted">Ucapan Special sedang dikerjakan. Estimasi 1–2 hari kerja. Kami kirim email saat selesai.</p>' : '') +
      linkKartu(o) +
      '<dl class="summary">' +
      '<div class="sum-row"><dt>Untuk</dt><dd>' + esc(o.penerima) + '</dd></div>' +
      '<div class="sum-row"><dt>Dari</dt><dd>' + esc(o.dari) + '</dd></div>' +
      '<div class="sum-row"><dt>Foto</dt><dd>' + o.jumlahFoto + ' foto</dd></div>' +
      '<div class="sum-row"><dt>Pembayaran</dt><dd>Rp ' + esc(U.rupiah(o.nominal)) + ' · ' + esc(o.statusBayar) + (o.tglBayar ? ' · ' + esc(tglJam(o.tglBayar)) : '') + '</dd></div>' +
      '<div class="sum-row"><dt>Dipesan</dt><dd>' + esc(tglJam(o.tglOrder)) + '</dd></div></dl>' +
      '<div class="order-act">' + ((o.status !== 'Menunggu Pembayaran' && o.status !== 'Dibatalkan' && o.status !== 'Perlu Ditinjau') ? '<button type="button" class="btn btn-quiet btn-sm" data-p="pdf" data-o="' + esc(o.orderId) + '">Unduh PDF Bukti</button>' : '') +
      '<a class="btn btn-secondary btn-sm" href="#/portal">Kembali</a></div></article>' + boxRsvp(o) + boxChat(o) + boxBalasan(o) + boxTesti(o) + boxRevisi;
  }

  async function afterDetail(main, c) {
    if (!A.ada()) { location.replace('#/masuk'); return; }
    var my = ++run, root = $('detailRoot'), id = (c.query && c.query.o) || '';
    root.addEventListener('click', klikAksi);
    root.addEventListener('input', function (ev) { if (ev.target.id === 'tIsi') { var th = $('tHit'); if (th) th.textContent = String(ev.target.value.length); } });
    root.addEventListener('input', function (ev) { if (ev.target.id === 'revCatatan') { var n = ev.target.value.length, k = root.querySelector('[data-counter]'); k.textContent = n + '/1000'; k.classList.toggle('over', n > 1000); } });
    try {
      var r = await A.panggil('orderDetail', { orderId: id });
      if (my !== run) return;
      if (!r.success) { if (/Sesi berakhir/i.test(r.message || '')) { location.replace('#/masuk'); return; } root.innerHTML = '<div class="state-box" role="alert"><p>' + esc(r.message || 'Pesanan tidak ditemukan.') + '</p><a class="btn btn-primary btn-sm" href="#/portal">Kembali ke Portal</a></div>'; return; }
      root.innerHTML = isiDetail(r.data);
    } catch (e) { if (my === run) root.innerHTML = U.errorBox('Detail pesanan belum bisa dimuat.'); }
  }

  /* ---------------- Aksi bersama ---------------- */
  async function klikAksi(ev) {
    var b = ev.target.closest('[data-p]'); if (!b) return;
    var a = b.dataset.p;
    if (a === 'salin') { salin(b.dataset.v); return; }
    if (a === 'keluar') { await A.keluar(); location.hash = '#/'; return; }
    if (a === 'pdf') {
      var asli = b.textContent; b.disabled = true; b.textContent = 'Menyiapkan…';
      try {
        var r = await A.panggil('downloadReceipt', { orderId: b.dataset.o });
        if (!r.success) { toast(r.message || 'Gagal mengunduh'); }
        else {
          var bin = atob(r.data.base64), arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          var url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' })), l = document.createElement('a');
          l.href = url; l.download = r.data.nama || 'bukti.pdf'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        }
      } catch (e) { toast('Koneksi bermasalah, coba lagi'); }
      b.disabled = false; b.textContent = asli; return;
    }
    if (a === 'rsvp-hapus') {
      b.disabled = true; try { var rh = await A.panggil('rsvpHapus', { orderId: ordAktif && ordAktif.orderId, id: b.dataset.id }); if (rh.success) { rsvpData = rh.data; $('rsvpIsi').innerHTML = tampilRsvp(rh.data, ordAktif); } else b.disabled = false; } catch (e) { b.disabled = false; } return;
    }
    if (a === 'testi-ubah') { testiEdit = true; segarkanTesti(); var ti = $('tIsi'); if (ti) ti.focus(); return; }
    if (a === 'testi-batal') { testiEdit = false; segarkanTesti(); return; }
    if (a === 'testi-hapus') {
      if (!window.confirm('Hapus testimonimu? Bila sudah tampil di website, ia ikut dihapus.')) return;
      b.disabled = true; try { var rh2 = await A.panggil('testimoniHapus', { orderId: ordAktif.orderId }); if (rh2.success) { ordAktif.testi = rh2.data; testiEdit = false; segarkanTesti(); toast('Testimoni dihapus'); } else toast(rh2.message || 'Gagal menghapus'); } catch (e) { toast('Koneksi bermasalah, coba lagi'); }
      b.disabled = false; return;
    }
    if (a === 'testi-kirim') {
      ['eRating', 'eIsi', 'eNama', 'eIzin'].forEach(function (id) { var e = $(id); if (e) { e.hidden = true; e.textContent = ''; } });
      var rr = document.querySelector('input[name="tRating"]:checked');
      b.disabled = true; var asli2 = b.textContent; b.textContent = 'Mengirim…';
      try {
        var rt = await A.panggil('testimoniKirim', { orderId: ordAktif.orderId, rating: rr ? Number(rr.value) : 0, isi: $('tIsi').value, nama: $('tNama').value, keterangan: $('tKet').value, izin: $('tIzin').checked });
        if (rt.success) { ordAktif.testi = rt.data; testiEdit = false; segarkanTesti(); toast('Terima kasih! Testimonimu menunggu ditinjau.'); return; }
        var er = rt.errors || {}; ['rating', 'isi', 'nama', 'izin'].forEach(function (k) { var e = $('e' + k.charAt(0).toUpperCase() + k.slice(1)); if (e && er[k]) { e.textContent = er[k]; e.hidden = false; } });
        if (!Object.keys(er).length) toast(rt.message || 'Gagal mengirim');
      } catch (e) { toast('Koneksi bermasalah, coba lagi'); }
      b.disabled = false; b.textContent = asli2; return;
    }
    if (a === 'rsvp-csv') { csvRsvp(ordAktif); return; }
    if (a === 'rsvp-link') {
      var url = b.dataset.url; if (!url) { toast('Link undangan belum tersedia.'); return; }
      var baris = ($('rsvpNama').value || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 300);
      if (!baris.length) { toast('Tulis minimal satu nama tamu.'); return; }
      var bawaan = $('rsvpSeb').value, pesan = $('rsvpPesan').value || 'Kepada Yth. {sapa}, silakan buka undangan: {link}';
      tautanTamu = baris.map(function (t) { var u = uraiTamu(t, bawaan), link = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'u=' + encodeURIComponent(u.nama) + (u.s ? '&s=' + u.s : '') + (u.x ? '&x=' + u.x : ''), sapa = sapaTamu(u); return { sapa: sapa, link: link, wa: 'https://wa.me/?text=' + encodeURIComponent(pesan.replace(/\{sapa\}/g, sapa).replace(/\{link\}/g, link)) }; });
      $('rsvpHasilList').innerHTML = '<p class="small muted" style="margin-top:.75rem">' + tautanTamu.length + ' tautan siap. Pastikan sapaannya sudah benar sebelum dikirim.</p><ul class="rsvp-tamu">' + tautanTamu.map(function (x, n) { return '<li><div><strong>Kepada Yth. ' + esc(x.sapa) + '</strong><span class="small muted mono">' + esc(x.link) + '</span></div><div class="rsvp-tamu-aksi"><button type="button" class="btn btn-secondary btn-sm" data-p="rsvp-salin-satu" data-n="' + n + '">Salin</button><a class="btn btn-primary btn-sm" href="' + esc(x.wa) + '" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></li>'; }).join('') + '</ul><button type="button" class="btn btn-quiet btn-sm" data-p="rsvp-salin-semua">Salin semua (sapaan dan tautan)</button>';
      return;
    }
    if (a === 'rsvp-salin-satu') { salinTeks(tautanTamu[Number(b.dataset.n)].link, b); return; }
    if (a === 'rsvp-salin-semua') { salinTeks(tautanTamu.map(function (x) { return x.sapa + '\t' + x.link; }).join('\n'), b); return; }
    if (a === 'chat-kirim') {
      var ci = $('chatIsi'), ce = $('chatErr'), pesan = (ci.value || '').trim();
      if (!pesan) { ce.hidden = false; ce.textContent = 'Tulis pesan terlebih dahulu.'; ci.focus(); return; }
      b.disabled = true; b.textContent = 'Mengirim…'; ce.hidden = true;
      try {
        var rc = await A.panggil('chatKirim', { orderId: b.dataset.o, pesan: pesan });
        if (!rc.success) { ce.hidden = false; ce.textContent = rc.message || 'Pesan belum terkirim.'; b.disabled = false; b.textContent = 'Kirim'; return; }
        $('detailRoot').innerHTML = isiDetail(rc.data); var bx = $('boxChat'); if (bx) bx.scrollIntoView({ block: 'nearest' });
      } catch (e) { ce.hidden = false; ce.textContent = 'Koneksi bermasalah. Coba lagi.'; b.disabled = false; b.textContent = 'Kirim'; }
      return;
    }
    if (a === 'revisi') {
      var ta = $('revCatatan'), err = $('revErr'), cat = (ta.value || '').trim();
      if (cat.length < 10 || cat.length > 1000) { err.hidden = false; err.textContent = 'Jelaskan perubahan 10–1000 karakter.'; ta.focus(); return; }
      if (!window.confirm('Kuota revisi gratis hanya 1×. Ajukan sekarang?')) return;
      b.disabled = true; b.textContent = 'Mengirim…'; err.hidden = true;
      try {
        var rv = await A.panggil('requestRevision', { orderId: b.dataset.o, catatan: cat });
        if (!rv.success) { err.hidden = false; err.textContent = rv.message || 'Gagal mengajukan revisi.'; b.disabled = false; b.textContent = 'Ajukan Revisi'; return; }
        $('detailRoot').innerHTML = isiDetail(rv.data); toast('Revisi diajukan');
      } catch (e) { err.hidden = false; err.textContent = 'Koneksi bermasalah. Coba lagi.'; b.disabled = false; b.textContent = 'Ajukan Revisi'; }
    }
  }

  window.Portal = { viewMasuk: viewMasuk, afterMasuk: afterMasuk, viewPortal: viewPortal, afterPortal: afterPortal, viewDetail: viewDetail, afterDetail: afterDetail, timeline: timeline };
})();
