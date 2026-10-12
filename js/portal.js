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
        : S.langkah === 'kode' ? ['Memeriksa kode…', 'Sebentar ya.']
        : S.langkah === 'buat' ? ['Sedang membuat akunmu…', 'Password kamu sedang diamankan. Ini bisa memakan waktu beberapa detik. Mohon jangan tutup halaman ini.']
        : ['Sedang masuk…', 'Mohon tunggu beberapa detik.'];
      root.innerHTML = '<div class="proses-box" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span><h1 class="h2" id="mTitle" tabindex="-1">' + esc(m[0]) + '</h1><p class="muted">' + esc(m[1]) + '</p><div class="bar" aria-hidden="true"><span></span></div></div>';
      var h = $('mTitle'); if (h) h.focus({ preventScroll: true });
    }
    function paint() {
      if (S.sibuk || S.sukses) { paintProses(); return; }
      var judul = S.langkah === 'kode' ? 'Masuk ke Portal' : S.langkah === 'buat' ? 'Buat Password' : 'Masukkan Password';
      var isi = '';
      if (S.langkah === 'kode') {
        isi = '<p class="muted" style="margin-bottom:1.25rem">Gunakan kode redeem yang kamu terima setelah pembayaran.</p>' +
          '<div class="field' + (S.galat ? ' has-error' : '') + '"><label for="mKode">Kode redeem</label>' +
          '<input class="input" id="mKode" name="username" autocomplete="username" inputmode="text" autocapitalize="characters" spellcheck="false" placeholder="DRA-XXXX-XXXX" value="' + esc(S.kode) + '" maxlength="14">' +
          (S.galat ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(S.galat) + '</p>' : '') + '</div>';
      } else {
        isi = '<p class="muted" style="margin-bottom:1.25rem">Kode <strong>' + esc(S.kode) + '</strong>' + (S.langkah === 'buat' ? ' dipakai pertama kali. Buat password (minimal 8 karakter) untuk akunmu.' : '') + '</p>' +
          '<input type="hidden" name="username" autocomplete="username" value="' + esc(S.kode) + '">' +
          '<div class="field' + (S.galat ? ' has-error' : '') + '"><label for="mPw">' + (S.langkah === 'buat' ? 'Password baru' : 'Password') + '</label>' +
          '<input class="input" id="mPw" type="password" autocomplete="' + (S.langkah === 'buat' ? 'new-password' : 'current-password') + '" maxlength="72">' +
          (S.langkah === 'buat' ? '<p class="hint">Minimal 8 karakter. Simpan baik-baik, tidak bisa dilihat lagi.</p>' : '') + '</div>' +
          (S.langkah === 'buat' ? '<div class="field"><label for="mPw2">Ulangi password</label><input class="input" id="mPw2" type="password" autocomplete="new-password" maxlength="72"></div>' : '') +
          (S.galat ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(S.galat) + '</p>' : '');
      }
      root.innerHTML = '<h1 class="h2" id="mTitle" tabindex="-1">' + judul + '</h1><form id="mForm" novalidate>' + isi +
        '<div class="form-nav" style="margin-top:1rem">' + (S.langkah !== 'kode' ? '<button type="button" class="btn btn-secondary" data-m="ganti">Ganti kode</button>' : '<span></span>') +
        '<button type="submit" class="btn btn-primary"' + (S.sibuk ? ' disabled' : '') + '>' + (S.sibuk ? 'Memproses…' : S.langkah === 'kode' ? 'Lanjut' : S.langkah === 'buat' ? 'Simpan & Masuk' : 'Masuk') + '</button></div></form>';
      var f = $(S.langkah === 'kode' ? 'mKode' : 'mPw'); if (f) f.focus({ preventScroll: true });
    }

    root.addEventListener('submit', async function (ev) {
      ev.preventDefault(); if (S.sibuk) return;
      S.galat = '';
      if (S.langkah === 'kode') {
        S.kode = ($('mKode').value || '').toUpperCase().replace(/\s+/g, '');
        if (!/^DRA-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(S.kode)) { S.galat = 'Format kode tidak valid. Contoh: DRA-7K3M-9QXA'; paint(); return; }
        S.sibuk = true; paint();
        try { var r = await A.cek(S.kode); S.sibuk = false;
          if (!r.success) { S.galat = r.message || 'Kode tidak ditemukan.'; paint(); return; }
          S.langkah = r.data.perluPassword ? 'buat' : 'masuk'; paint();
        } catch (e) { S.sibuk = false; S.galat = 'Koneksi bermasalah. Coba lagi.'; paint(); }
        return;
      }
      var pw = $('mPw').value || '';
      if (S.langkah === 'buat') {
        if (pw.length < 8) { S.galat = 'Password minimal 8 karakter.'; paint(); return; }
        if (pw !== $('mPw2').value) { S.galat = 'Kedua password tidak sama.'; paint(); return; }
      } else if (!pw) { S.galat = 'Password wajib diisi.'; paint(); return; }
      S.sibuk = true; paint();
      try {
        var h = S.langkah === 'buat' ? await A.buatPassword(S.kode, pw) : await A.masuk(S.kode, pw);
        S.sibuk = false;
        if (!h.success) { S.galat = h.message || 'Gagal masuk.'; paint(); return; }
        S.sukses = true; paint(); location.hash = lanjut;
      } catch (e) { S.sibuk = false; S.galat = 'Koneksi bermasalah. Coba lagi.'; paint(); }
    });
    root.addEventListener('click', function (ev) { if (ev.target.closest('[data-m="ganti"]')) { S = { langkah: 'kode', kode: S.kode, galat: '', sibuk: false }; paint(); } });
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
        (p.length ? '<div class="order-list">' + p.map(kartuPesanan).join('') + '</div>' : '<div class="state-box"><p>Belum ada pesanan di akun ini.</p><a class="btn btn-primary btn-sm" href="#/buat">Buat Ucapan</a></div>');
    } catch (e) { if (my === run) root.innerHTML = U.errorBox('Pesanan belum bisa dimuat. Periksa koneksi lalu coba lagi.'); }
  }

  /* ---------------- #/pesanan?o= ---------------- */
  function viewDetail() {
    return '<header class="page-head"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/portal">Portal Saya</a><span aria-hidden="true">/</span><span>Detail Pesanan</span></nav>' +
      '<h1 class="h1" id="dTitle" tabindex="-1">Detail Pesanan</h1></div></header>' +
      '<section class="section" style="padding-top:2rem"><div class="container"><div class="portal" id="detailRoot"><div class="skeleton sk-card" aria-hidden="true"></div></div></div></section>';
  }

  function boxBalasan(o) {
    if (!(o.balasan && o.balasan.length)) return o.status === 'Aktif' ? '<div class="card order-card"><h2 class="h3">Balasan penerima</h2><p class="small muted">Belum ada balasan. Setelah penerima sampai di slide terakhir, ia bisa menulis balasan yang muncul di sini.</p></div>' : '';
    return '<div class="card order-card"><h2 class="h3">Balasan penerima (' + o.balasan.length + ')</h2><ul class="rev-list">' + o.balasan.map(function (b) {
      return '<li><span class="tag rose">' + esc(b.nama || 'Penerima') + '</span> <span class="small muted">' + esc(tglJam(b.tgl)) + '</span><p style="margin-top:.25rem;white-space:pre-wrap">' + esc(b.pesan) + '</p></li>'; }).join('') + '</ul></div>';
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
      '<a class="btn btn-secondary btn-sm" href="#/portal">Kembali</a></div></article>' + boxChat(o) + boxBalasan(o) + boxRevisi;
  }

  async function afterDetail(main, c) {
    if (!A.ada()) { location.replace('#/masuk'); return; }
    var my = ++run, root = $('detailRoot'), id = (c.query && c.query.o) || '';
    root.addEventListener('click', klikAksi);
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
