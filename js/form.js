/* ==========================================================
   FORM "BUAT UCAPAN" — wizard bertahap (PRD §7.3)
   Paket → Data pemesan → Untuk siapa → Pesan → Foto → Desain
        → [Musik & Surprise] → Catatan → Ringkasan → Bayar
   • Draf teks tersimpan di browser (F-20). Foto TIDAK tersimpan (berkas tidak bisa disimpan aman di browser).
   • Foto dikompres di browser (F-13). Pesanan baru tercatat di server saat menekan Bayar.
   • Validasi di sini hanya kemudahan; validasi otoritatif ada di server.
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, ic = U.ic, API = window.DearoraAPI;

  var KEY_DRAF = 'dearora:draft:v1';
  var KEY_ORDER = 'dearora:order:v1';
  var LIM = {
    pesan: { basic: 300, premium: 600, special: 1200 }, personal: 600, ide: 1000, rahasia: 1000, catatan: 500,
    fotoKB: 1400, bagian: 1572864, videoMB: 25
  };
  var ID_LANGKAH = { namaPembeli: 'pemesan', whatsapp: 'pemesan', email: 'pemesan', penerima: 'untuk', tipeDari: 'untuk', nilaiDari: 'untuk',
    pesan: 'pesan', pesanPersonal: 'pesan', desain: 'desain', musikId: 'ekstra', jenisSurprise: 'ekstra', pesanRahasia: 'ekstra',
    passwordRahasia: 'ekstra', pembuka: 'ekstra', catatan: 'catatan', setuju: 'ringkasan', paketId: 'paket' };
  var JUDUL = { paket: 'Paket', pemesan: 'Data Pemesan', untuk: 'Untuk Siapa', pesan: 'Pesan', foto: 'Foto', desain: 'Desain', ekstra: 'Musik', catatan: 'Catatan', ringkasan: 'Ringkasan' };

  var ST = null;            // isian
  var langkah = 0;          // indeks langkah aktif
  var files = [];           // {id, jenis, blob, nama, ukuran, url}
  var order = null;         // {id, token, fp, terunggah:{fileId:true}}
  var ctx = null, errors = {}, ui = { sibuk: false, pay: null, kompres: false, queryDipakai: '' };
  var $root = null, simpanT = null;

  /* ---------------- Util ---------------- */
  function rand(n) { var a = 'abcdefghijkmnpqrstuvwxyz23456789', o = ''; for (var i = 0; i < n; i++) o += a.charAt(Math.floor(Math.random() * a.length)); return o; }
  function jeda(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function data() { return ctx && ctx.data; }
  function paketAktif() { var d = data(); return d && ST.paket ? d.paket.filter(function (p) { return p.id === ST.paket; })[0] : null; }
  function musikAda() { var d = data(); return !!(d && d.musik && d.musik.length); }

  function baru() {
    return { paket: '', namaPembeli: '', whatsapp: '', email: '', penerima: '', tipeDari: 'nama', nilaiDari: '', pesan: '', pesanPersonal: '',
      mode: 'pilih', desainId: '', ideSendiri: '', musikId: '', jenisSurprise: '', pesanRahasia: '', passwordRahasia: '', pembuka: 'judul',
      catatan: '', setuju: false, _langkah: 0 };
  }
  function muatDraf() {
    ST = baru();
    try {
      var j = JSON.parse(localStorage.getItem(KEY_DRAF));
      if (j && j.v === 1 && j.s) { Object.keys(ST).forEach(function (k) { if (k in j.s && k !== 'passwordRahasia' && k !== 'setuju') ST[k] = j.s[k]; }); langkah = ST._langkah || 0; }
    } catch (e) { /* abaikan */ }
  }
  function tulisDraf() {
    if (!ST) return;
    try { var s = Object.assign({}, ST, { _langkah: langkah }); delete s.passwordRahasia; delete s.setuju; localStorage.setItem(KEY_DRAF, JSON.stringify({ v: 1, s: s })); } catch (e) { /* penuh/diblokir */ }
  }
  function simpanDraf() { clearTimeout(simpanT); simpanT = setTimeout(tulisDraf, 250); }
  // Pastikan draf tidak hilang bila tab ditutup/dimuat ulang sebelum jeda 250 ms selesai.
  window.addEventListener('pagehide', function () { clearTimeout(simpanT); if (ui.simpanAktif !== false) tulisDraf(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { clearTimeout(simpanT); if (ui.simpanAktif !== false) tulisDraf(); } });

  function daftarLangkah() {
    var l = ['paket', 'pemesan', 'untuk', 'pesan', 'foto', 'desain'];
    if (ST.paket === 'premium' || ST.paket === 'special') l.push('ekstra');
    l.push('catatan', 'ringkasan');
    return l;
  }
  function judulLangkah(id) { return id === 'ekstra' ? (ST.paket === 'special' ? 'Musik & Surprise' : 'Musik') : JUDUL[id]; }
  function langkahId() { var l = daftarLangkah(); if (langkah >= l.length) langkah = l.length - 1; return l[langkah]; }

  /* ---------------- Komponen field ---------------- */
  function fld(id, label, control, hint, opsional) {
    var e = errors[id];
    return '<div class="field' + (e ? ' has-error' : '') + '"><label for="' + id + '">' + esc(label) + (opsional ? ' <span class="opt">(opsional)</span>' : '') + '</label>' + control +
      (hint ? '<p class="hint" id="' + id + '-h">' + esc(hint) + '</p>' : '') +
      (e ? '<p class="err" id="' + id + '-e" role="alert">' + ic('info') + ' ' + esc(e) + '</p>' : '') + '</div>';
  }
  function aria(id) { return (errors[id] ? ' aria-invalid="true"' : '') + ' aria-describedby="' + (errors[id] ? id + '-e ' : '') + id + '-h"'; }
  function inp(id, tipe, extra) {
    return '<input class="input" id="' + id + '" data-k="' + id + '" type="' + tipe + '" value="' + esc(ST[id]) + '"' + aria(id) + ' ' + (extra || '') + '>';
  }
  function ta(id, maks, baris) {
    var n = String(ST[id] || '').length;
    return '<textarea class="input textarea" id="' + id + '" data-k="' + id + '" rows="' + (baris || 5) + '" maxlength="' + (maks + 50) + '"' + aria(id) + '>' + esc(ST[id]) + '</textarea>' +
      '<span class="counter' + (n > maks ? ' over' : '') + '" data-counter="' + id + '" data-max="' + maks + '">' + n + '/' + maks + '</span>';
  }
  function radio(name, val, label, desc, checked) {
    var id = name + '-' + val.replace(/[^a-z0-9]/gi, '_');
    return '<label class="opt-row" for="' + id + '"><input type="radio" id="' + id + '" name="' + name + '" data-k="' + name + '" value="' + esc(val) + '"' + (checked ? ' checked' : '') + '>' +
      '<span><strong>' + esc(label) + '</strong>' + (desc ? '<small>' + esc(desc) + '</small>' : '') + '</span></label>';
  }

  /* ---------------- Langkah ---------------- */
  var VIEW = {};

  VIEW.paket = function () {
    var d = data();
    var kartu = d.paket.map(function (p) {
      var f = p.fitur || {};
      return '<label class="plan-pick' + (ST.paket === p.id ? ' on' : '') + '" for="pk-' + esc(p.id) + '">' +
        '<input type="radio" id="pk-' + esc(p.id) + '" name="paket" data-k="paket" value="' + esc(p.id) + '"' + (ST.paket === p.id ? ' checked' : '') + '>' +
        (f.badge ? '<span class="plan-flag sm">' + esc(f.badge) + '</span>' : '') +
        '<span class="pp-name">' + esc(p.nama) + '</span>' +
        '<span class="pp-price">Rp ' + esc(U.rupiah(p.harga)) + '</span>' +
        '<span class="pp-desc">' + esc(f.tagline || '') + '</span>' +
        '<span class="pp-tags"><span class="tag">' + esc(f.foto || (p.maksFoto + ' foto')) + '</span><span class="tag">Aktif ' + esc(U.formatMasa(p.masaAktifHari)) + '</span></span></label>';
    }).join('');
    return '<fieldset class="field"><legend class="sr-only">Pilih paket</legend><div class="plan-picks">' + kartu + '</div>' +
      (errors.paketId ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.paketId) + '</p>' : '') + '</fieldset>' +
      '<p class="small muted"><a class="text-accent" style="font-weight:700" href="#/paket" target="_blank" rel="noopener">Bandingkan detail paket</a> (dibuka di tab baru, isianmu aman).</p>';
  };

  VIEW.pemesan = function () {
    var Au = window.Auth, prof = Au && Au.ada() ? Au.profil() : null;
    if (prof) {
      return '<div class="notice" role="status"><strong>Masuk sebagai ' + esc(prof.nama) + '</strong><br>Pesanan ini akan ditambahkan ke akunmu, memakai data akunmu (' + esc(prof.email) + '). Kamu tidak akan menerima kode redeem baru.</div>' +
        '<button type="button" class="link-btn" data-f="akun-lepas">Pesan sebagai pembeli baru</button>';
    }
    var akunBox = '<details class="akun-box"' + (ui.akunBuka ? ' open' : '') + '><summary>Sudah punya akun? Masuk dulu</summary><div class="akun-isi">' +
      '<p class="small muted">Gunakan kode redeem dan password dari pesanan sebelumnya. Data pemesan akan terisi otomatis.</p>' +
      '<div class="field"><label for="akunKode">Kode redeem</label><input class="input" id="akunKode" autocomplete="username" autocapitalize="characters" spellcheck="false" placeholder="DRA-XXXX-XXXX" maxlength="14"></div>' +
      '<div class="field"><label for="akunPw">Password</label><input class="input" id="akunPw" type="password" autocomplete="current-password" maxlength="72"></div>' +
      '<p class="err" id="akunErr" role="alert" hidden></p>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-f="akun-masuk">Masuk &amp; isi otomatis</button>' +
      '<p class="small muted" style="margin-top:.5rem">Belum membuat password? <a class="text-accent" style="font-weight:700" href="#/masuk" target="_blank" rel="noopener">Buat di halaman Masuk</a>.</p></div></details>';
    return akunBox + fld('namaPembeli', 'Nama kamu', inp('namaPembeli', 'text', 'autocomplete="name" maxlength="60"'), 'Dipakai untuk tanda terima. Tidak tampil di halaman ucapan.') +
      fld('whatsapp', 'Nomor WhatsApp', inp('whatsapp', 'tel', 'autocomplete="tel" inputmode="tel" placeholder="08xxxxxxxxxx"'), 'Hanya untuk keperluan pesananmu. Tidak tampil di halaman ucapan.') +
      fld('email', 'Email', inp('email', 'email', 'autocomplete="email" inputmode="email" maxlength="100"'), 'Kode redeem dan tanda terima dikirim ke email ini. Pastikan benar.');
  };

  VIEW.untuk = function () {
    var perluNilai = ST.tipeDari !== 'anonim';
    return fld('penerima', 'Untuk siapa ucapan ini?', inp('penerima', 'text', 'maxlength="60" placeholder="mis. Rani"'), 'Nama penerima yang tampil di kartu.') +
      '<fieldset class="field"><legend>Dari siapa?</legend><div class="opt-list">' +
      radio('tipeDari', 'nama', 'Nama lengkap', 'Penerima melihat namamu.', ST.tipeDari === 'nama') +
      radio('tipeDari', 'inisial', 'Inisial', 'Mis. "R.A." agar tetap misterius.', ST.tipeDari === 'inisial') +
      radio('tipeDari', 'anonim', 'Anonim', 'Nama pengirim disembunyikan dari penerima.', ST.tipeDari === 'anonim') +
      '</div>' + (errors.tipeDari ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.tipeDari) + '</p>' : '') + '</fieldset>' +
      (perluNilai ? fld('nilaiDari', ST.tipeDari === 'inisial' ? 'Inisial yang ditampilkan' : 'Nama pengirim yang ditampilkan',
        inp('nilaiDari', 'text', 'maxlength="' + (ST.tipeDari === 'inisial' ? 6 : 60) + '"'), ST.tipeDari === 'anonim' ? '' : '') : '') +
      (ST.tipeDari === 'anonim' ? '<p class="notice">Identitas anonim tidak ditampilkan ke penerima, namun tetap tercatat internal sesuai Kebijakan Privasi.</p>' : '');
  };

  VIEW.pesan = function () {
    var p = ST.paket, maks = LIM.pesan[p] || 300;
    return fld('pesan', 'Pesan untuk penerima', ta('pesan', maks, 6), p === 'basic' ? 'Paket Basic: pesan singkat, maksimal ' + maks + ' karakter.' : 'Maksimal ' + maks + ' karakter.') +
      ((p === 'premium' || p === 'special')
        ? fld('pesanPersonal', 'Pesan personal dari pengirim', ta('pesanPersonal', LIM.personal, 4), 'Kata-kata tambahan yang muncul di bagian penutup kartu.', true) : '');
  };

  VIEW.foto = function () {
    var pk = paketAktif() || { maksFoto: 0 };
    var nf = files.filter(function (f) { return f.jenis === 'foto'; }).length;
    var video = ST.paket === 'special';
    var daftar = files.map(function (f, i) {
      var th = f.jenis === 'foto' ? '<img src="' + esc(f.url) + '" alt="Pratinjau foto ' + (i + 1) + '">' : '<span class="vid">' + ic('play') + '<small>Video</small></span>';
      return '<li class="file-item"><div class="file-th">' + th + '<span class="file-no">' + (i + 1) + '</span></div>' +
        '<div class="file-meta"><span class="file-name">' + esc(f.nama) + '</span><span class="small muted">' + (f.ukuran / 1024 / 1024).toFixed(2) + ' MB</span></div>' +
        '<div class="file-act">' +
        '<button type="button" class="icon-btn sm" data-f="up" data-id="' + f.id + '" aria-label="Naikkan urutan ' + esc(f.nama) + '"' + (i === 0 ? ' disabled' : '') + '>' + '<svg class="icon" style="transform:rotate(180deg)" aria-hidden="true"><use href="#i-chevron"/></svg></button>' +
        '<button type="button" class="icon-btn sm" data-f="down" data-id="' + f.id + '" aria-label="Turunkan urutan ' + esc(f.nama) + '"' + (i === files.length - 1 ? ' disabled' : '') + '>' + ic('chevron') + '</button>' +
        '<button type="button" class="icon-btn sm" data-f="rm" data-id="' + f.id + '" aria-label="Hapus ' + esc(f.nama) + '">' + ic('x') + '</button></div></li>';
    }).join('');
    return '<div class="dropzone"><p class="dz-title">' + ic('image') + ' Unggah foto terbaikmu</p>' +
      '<p class="small muted">JPG, PNG, atau WebP. Foto otomatis diperkecil agar cepat terunggah. Wajib minimal 1 foto, maksimal ' + pk.maksFoto + '.' +
      (video ? ' Paket Special boleh menambah 1 video MP4 (maks. ' + LIM.videoMB + ' MB).' : '') + '</p>' +
      '<input class="sr-only" type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp' + (video ? ',video/mp4' : '') + '">' +
      '<label for="fileInput" class="btn btn-secondary btn-sm' + (ui.kompres ? ' disabled' : '') + '">' + (ui.kompres ? 'Memproses…' : 'Pilih Berkas') + '</label>' +
      '<p class="small" style="margin-top:.75rem" role="status">' + nf + ' dari ' + pk.maksFoto + ' foto' + (ui.pesanFile ? ' · ' + esc(ui.pesanFile) : '') + '</p></div>' +
      (errors.foto ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.foto) + '</p>' : '') +
      (files.length ? '<p class="small muted" style="margin:1rem 0 .5rem">Urutan di bawah adalah urutan foto di kartumu. Gunakan tombol panah untuk mengatur.</p><ul class="file-list">' + daftar + '</ul>' : '');
  };

  VIEW.desain = function () {
    var d = data(), bisa = d.desain.filter(function (x) { return (x.paket || []).indexOf(ST.paket) >= 0; });
    var pilih = bisa.length ? '<div class="opt-grid">' + bisa.map(function (x) {
      var on = ST.desainId === x.id;
      return '<div class="opt-card' + (on ? ' on' : '') + '"><label for="ds-' + esc(x.id) + '">' +
        '<input type="radio" id="ds-' + esc(x.id) + '" name="desainId" data-k="desainId" value="' + esc(x.id) + '"' + (on ? ' checked' : '') + '>' +
        U.thumbHTML(x, d.paket) + '<span class="oc-name">' + esc(x.nama) + '</span></label>' +
        '<button type="button" class="btn btn-quiet btn-sm btn-block" data-action="demo" data-id="' + esc(x.id) + '">' + ic('play') + ' Lihat Demo</button></div>';
    }).join('') + '</div>' : '<p class="state-box">Belum ada contoh desain untuk paket ini. Silakan tulis ide sendiri.</p>';
    return '<fieldset class="field"><legend class="sr-only">Cara memilih desain</legend><div class="opt-list">' +
      radio('mode', 'pilih', 'Pilih dari contoh desain', 'Coba demonya dulu sebelum memilih.', ST.mode === 'pilih') +
      radio('mode', 'ide', 'Saya punya ide sendiri', ST.paket === 'special' ? 'Termasuk layout kustom, mis. bergaya aplikasi populer (tanpa logo/merek aslinya).' : 'Kami sesuaikan dalam batas template yang tersedia.', ST.mode === 'ide') +
      '</div></fieldset>' +
      (ST.mode === 'pilih' ? pilih : fld('ideSendiri', 'Ceritakan idemu', ta('ideSendiri', LIM.ide, 5), 'Konsep, warna, mood, atau referensi yang kamu inginkan (minimal 10 karakter).')) +
      (errors.desain ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.desain) + '</p>' : '');
  };

  VIEW.ekstra = function () {
    var d = data(), html = '';
    if (musikAda()) {
      html += '<fieldset class="field"><legend>Musik latar</legend><div class="opt-list">' +
        radio('musikId', '', 'Tanpa musik', '', !ST.musikId) +
        d.musik.map(function (m) {
          var u = m.fileUrl && (/^https:\/\//.test(m.fileUrl) || /^assets\/[\w\-./]+$/.test(m.fileUrl)) ? m.fileUrl : '';
          return radio('musikId', m.id, m.judul, '', ST.musikId === m.id) + (u ? '<audio class="audio" controls preload="none" src="' + esc(u) + '" aria-label="Putar contoh ' + esc(m.judul) + '"></audio>' : '');
        }).join('') + '</div></fieldset>';
    } else {
      html += '<p class="notice">Pilihan musik latar akan segera tersedia. Untuk saat ini kartumu dibuat tanpa musik, dan kamu bisa menyebutkan lagu yang diinginkan di langkah Catatan.</p>';
    }
    if (ST.paket === 'special') {
      var j = ST.jenisSurprise;
      html += '<fieldset class="field"><legend>Surprise interaktif</legend><div class="opt-list">' +
        radio('jenisSurprise', '', 'Tanpa surprise', '', !j) +
        radio('jenisSurprise', 'amplop', 'Amplop digital', 'Penerima membuka amplop untuk melihat kartu.', j === 'amplop') +
        radio('jenisSurprise', 'pesan-rahasia', 'Pesan rahasia', 'Muncul setelah penerima menekan tombol.', j === 'pesan-rahasia') +
        radio('jenisSurprise', 'amplop+pesan-rahasia', 'Amplop + pesan rahasia', '', j === 'amplop+pesan-rahasia') + '</div></fieldset>';
      if (j.indexOf('pesan-rahasia') >= 0) {
        html += fld('pesanRahasia', 'Pesan rahasia', ta('pesanRahasia', LIM.rahasia, 4), 'Hanya terlihat setelah penerima membuka kejutannya.') +
          fld('passwordRahasia', 'Password pesan rahasia', inp('passwordRahasia', 'text', 'maxlength="30" autocomplete="off"'), 'Opsional. Penerima harus memasukkan password ini untuk membuka pesan rahasia. Beri tahu penerima sendiri.', true);
      }
      html += '<fieldset class="field"><legend>Tampilan pembuka</legend><div class="opt-list">' +
        radio('pembuka', 'judul', 'Judul ucapan', 'Mulai dengan judul dan nama penerima.', ST.pembuka === 'judul') +
        radio('pembuka', 'foto', 'Foto pertama', 'Mulai dengan foto utama layar penuh.', ST.pembuka === 'foto') +
        radio('pembuka', 'amplop', 'Amplop tertutup', 'Mulai dengan amplop yang harus dibuka.', ST.pembuka === 'amplop') + '</div></fieldset>' +
        '<p class="small muted">Urutan cerita mengikuti urutan foto yang kamu atur di langkah Foto.</p>';
    }
    return html;
  };

  VIEW.catatan = function () {
    return fld('catatan', 'Catatan khusus', ta('catatan', LIM.catatan, 5), 'Mis. lagu yang diinginkan, hal yang perlu dihindari, atau permintaan lain.', true);
  };

  function ringkasBaris(label, nilai, ke) {
    return '<div class="sum-row"><dt>' + esc(label) + '</dt><dd>' + nilai + '</dd><button type="button" class="link-btn" data-f="goto" data-ke="' + ke + '">Ubah</button></div>';
  }
  VIEW.ringkasan = function () {
    var pk = paketAktif(), d = data();
    var ds = ST.mode === 'pilih' ? (d.desain.filter(function (x) { return x.id === ST.desainId; })[0] || {}).nama || '-' : 'Ide sendiri';
    var dari = ST.tipeDari === 'anonim' ? 'Anonim' : (ST.tipeDari === 'inisial' ? 'Inisial ' : '') + esc(ST.nilaiDari);
    var mus = musikAda() ? (d.musik.filter(function (m) { return m.id === ST.musikId; })[0] || {}).judul || 'Tanpa musik' : '';
    var sim = d.config && d.config.MODE_BAYAR === 'simulasi';
    return (sim ? '<p class="notice warn" role="status"><strong>Mode simulasi.</strong> Tidak ada pembayaran sungguhan; ini hanya uji coba alur.</p>' : '') +
      '<dl class="summary">' +
      ringkasBaris('Paket', esc(pk.nama) + ' · aktif ' + esc(U.formatMasa(pk.masaAktifHari)), 'paket') +
      (function () { var pf = window.Auth && window.Auth.ada() ? window.Auth.profil() : null; var n = pf ? pf.nama : ST.namaPembeli, w = pf ? pf.whatsapp : ST.whatsapp, e = pf ? pf.email : ST.email;
        return ringkasBaris('Pemesan', esc(n) + (pf ? ' <span class="tag sage">Akun terhubung</span>' : '') + '<br><span class="muted small">' + esc(w) + ' · ' + esc(e) + '</span>', 'pemesan'); })() +
      ringkasBaris('Untuk / Dari', esc(ST.penerima) + ' / ' + dari, 'untuk') +
      ringkasBaris('Pesan', '<span class="clip">' + esc(ST.pesan) + '</span>', 'pesan') +
      ringkasBaris('Foto', files.filter(function (f) { return f.jenis === 'foto'; }).length + ' foto' + (files.some(function (f) { return f.jenis === 'video'; }) ? ' + 1 video' : ''), 'foto') +
      ringkasBaris('Desain', esc(ds), 'desain') +
      (ST.paket !== 'basic' && musikAda() ? ringkasBaris('Musik', esc(mus), 'ekstra') : '') +
      '</dl>' +
      '<div class="total-box"><span>Total</span><strong>Rp ' + esc(U.rupiah(pk.harga)) + '</strong></div>' +
      '<div class="field' + (errors.setuju ? ' has-error' : '') + '"><label class="check" for="setuju"><input type="checkbox" id="setuju" data-k="setuju"' + (ST.setuju ? ' checked' : '') + '>' +
      '<span>Saya sudah memeriksa data di atas dan menyetujui <a href="#/syarat" target="_blank" rel="noopener">Syarat &amp; Ketentuan</a> serta <a href="#/privasi" target="_blank" rel="noopener">Kebijakan Privasi</a>.</span></label>' +
      (errors.setuju ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.setuju) + '</p>' : '') + '</div>' +
      '<p class="small muted">Paket Basic dan Premium tidak dapat direvisi setelah dibayar. Kamu akan diarahkan ke halaman pembayaran yang aman.</p>' +
      '<div id="payPanel" aria-live="polite">' + payPanelHTML() + '</div>';
  };

  /* ---------------- Validasi per langkah ---------------- */
  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, RE_WA = /^(\+62|62|0)8[0-9]{7,12}$/;
  function validasi(id) {
    var e = {}, t = function (k) { return String(ST[k] || '').trim(); };
    if (id === 'paket') { if (!paketAktif()) e.paketId = 'Pilih salah satu paket.'; }
    if (id === 'pemesan' && !(window.Auth && window.Auth.ada() && window.Auth.profil())) {
      if (t('namaPembeli').length < 2) e.namaPembeli = 'Nama minimal 2 karakter.';
      if (!RE_WA.test(t('whatsapp').replace(/[\s\-().]/g, ''))) e.whatsapp = 'Nomor WhatsApp tidak valid (contoh 081234567890).';
      if (!RE_EMAIL.test(t('email'))) e.email = 'Format email tidak valid.';
    }
    if (id === 'untuk') {
      if (!t('penerima')) e.penerima = 'Nama penerima wajib diisi.';
      if (ST.tipeDari !== 'anonim' && !t('nilaiDari')) e.nilaiDari = ST.tipeDari === 'inisial' ? 'Isi inisial (1–6 karakter).' : 'Isi nama pengirim.';
      if (ST.tipeDari === 'inisial' && t('nilaiDari').length > 6) e.nilaiDari = 'Inisial maksimal 6 karakter.';
    }
    if (id === 'pesan') {
      var m = LIM.pesan[ST.paket] || 300;
      if (t('pesan').length < 5) e.pesan = 'Pesan minimal 5 karakter.';
      else if (t('pesan').length > m) e.pesan = 'Pesan maksimal ' + m + ' karakter untuk paket ini.';
      if (t('pesanPersonal').length > LIM.personal) e.pesanPersonal = 'Maksimal ' + LIM.personal + ' karakter.';
    }
    if (id === 'foto') { if (!files.some(function (f) { return f.jenis === 'foto'; })) e.foto = 'Unggah minimal 1 foto.'; }
    if (id === 'desain') {
      if (ST.mode === 'pilih' && !ST.desainId) e.desain = 'Pilih satu desain, atau pilih "Saya punya ide sendiri".';
      if (ST.mode === 'ide' && t('ideSendiri').length < 10) e.desain = 'Ceritakan ide minimal 10 karakter.';
    }
    if (id === 'ekstra' && ST.paket === 'special' && ST.jenisSurprise.indexOf('pesan-rahasia') >= 0) {
      if (t('pesanRahasia').length < 3) e.pesanRahasia = 'Isi pesan rahasia (minimal 3 karakter).';
      var pw = String(ST.passwordRahasia || ''); if (pw && (pw.length < 4 || pw.length > 30)) e.passwordRahasia = 'Password 4–30 karakter.';
    }
    if (id === 'catatan' && t('catatan').length > LIM.catatan) e.catatan = 'Maksimal ' + LIM.catatan + ' karakter.';
    if (id === 'ringkasan' && !ST.setuju) e.setuju = 'Centang persetujuan untuk melanjutkan.';
    return e;
  }

  /* ---------------- Render ---------------- */
  function stepper() {
    var l = daftarLangkah();
    return '<div class="stepper"><p class="small muted" id="stepInfo">Langkah ' + (langkah + 1) + ' dari ' + l.length + '</p>' +
      '<div class="bar" role="progressbar" aria-valuemin="1" aria-valuemax="' + l.length + '" aria-valuenow="' + (langkah + 1) + '" aria-label="Kemajuan pengisian"><span style="width:' + Math.round(((langkah + 1) / l.length) * 100) + '%"></span></div>' +
      '<ol class="dots" aria-hidden="true">' + l.map(function (id, i) { return '<li class="' + (i < langkah ? 'done' : i === langkah ? 'now' : '') + '">' + esc(judulLangkah(id)) + '</li>'; }).join('') + '</ol></div>';
  }
  function paint() {
    var id = langkahId(), l = daftarLangkah(), akhir = langkah === l.length - 1;
    $root.innerHTML = stepper() +
      '<form id="fForm" novalidate autocomplete="on"><div class="card form-card">' +
      '<h1 class="h2" id="stepTitle" tabindex="-1">' + esc(judulLangkah(id)) + '</h1>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">' +
      VIEW[id]() + '</div>' +
      '<div class="form-nav">' +
      (langkah > 0 ? '<button type="button" class="btn btn-secondary" data-f="back"' + (ui.sibuk ? ' disabled' : '') + '>Kembali</button>' : '<span></span>') +
      (akhir ? '<button type="button" class="btn btn-primary" data-f="pay"' + (ui.sibuk ? ' disabled' : '') + '>' + ic('lock') + ' Bayar Sekarang</button>'
        : '<button type="button" class="btn btn-primary" data-f="next">Lanjut ' + ic('arrow') + '</button>') +
      '</div></form>';
  }
  function fokusJudul() { var h = document.getElementById('stepTitle'); if (h) h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  function fokusError() {
    var k = Object.keys(errors)[0], el = k && document.getElementById(k);
    if (el) { el.focus({ preventScroll: false }); }
    else { var e = $root.querySelector('.err'); if (e) e.scrollIntoView({ block: 'center' }); }
  }

  function kePaket(id) { var l = daftarLangkah(), i = l.indexOf(id); if (i >= 0) { langkah = i; errors = {}; paint(); fokusJudul(); simpanDraf(); } }
  function lanjut() {
    var id = langkahId(); errors = validasi(id);
    if (Object.keys(errors).length) { paint(); fokusError(); return; }
    langkah++; errors = {}; paint(); fokusJudul(); simpanDraf();
  }
  function kembali() { if (langkah > 0) { langkah--; errors = {}; paint(); fokusJudul(); simpanDraf(); } }

  /* ---------------- Berkas ---------------- */
  function kompres(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        try {
          var w = img.naturalWidth, h = img.naturalHeight, maks = 1600, sk = Math.min(1, maks / Math.max(w, h)), q = 0.86;
          (function coba() {
            var cw = Math.max(1, Math.round(w * sk)), ch = Math.max(1, Math.round(h * sk));
            var c = document.createElement('canvas'); c.width = cw; c.height = ch;
            var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch); g.drawImage(img, 0, 0, cw, ch);
            c.toBlob(function (b) {
              if (!b) return reject(new Error('Gagal memproses foto'));
              if (b.size > LIM.fotoKB * 1024) { if (q > 0.55) q -= 0.1; else sk *= 0.8; if (sk < 0.15) return reject(new Error('Foto terlalu besar')); return coba(); }
              resolve(b);
            }, 'image/jpeg', q);
          })();
        } catch (e) { reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Foto tidak dapat dibaca')); };
      img.src = url;
    });
  }

  async function tambahBerkas(daftar) {
    var pk = paketAktif(); if (!pk) return;
    var pesan = [], baruFile = [];
    ui.kompres = true; ui.pesanFile = ''; paint();
    for (var i = 0; i < daftar.length; i++) {
      var f = daftar[i], nama = (f.name || 'berkas').slice(-60);
      var nFoto = files.filter(function (x) { return x.jenis === 'foto'; }).length + baruFile.filter(function (x) { return x.jenis === 'foto'; }).length;
      var nVid = files.filter(function (x) { return x.jenis === 'video'; }).length + baruFile.filter(function (x) { return x.jenis === 'video'; }).length;
      if (f.type === 'video/mp4') {
        if (ST.paket !== 'special') { pesan.push('Video hanya untuk paket Special'); continue; }
        if (nVid >= 1) { pesan.push('Maksimal 1 video'); continue; }
        if (f.size > LIM.videoMB * 1024 * 1024) { pesan.push(nama + ' melebihi ' + LIM.videoMB + ' MB'); continue; }
        baruFile.push({ id: rand(10), jenis: 'video', blob: f, nama: nama, ukuran: f.size, url: '' });
      } else if (/^image\/(jpeg|png|webp)$/.test(f.type)) {
        if (nFoto >= pk.maksFoto) { pesan.push('Maksimal ' + pk.maksFoto + ' foto'); continue; }
        try { var b = await kompres(f); baruFile.push({ id: rand(10), jenis: 'foto', blob: b, nama: nama.replace(/\.[^.]+$/, '') + '.jpg', ukuran: b.size, url: URL.createObjectURL(b) }); }
        catch (e) { pesan.push(nama + ': ' + e.message); }
      } else if (/heic|heif/i.test(f.type + f.name)) { pesan.push('Format HEIC belum didukung. Pilih foto dalam JPG/PNG'); }
      else { pesan.push(nama + ': format tidak didukung'); }
    }
    files = files.concat(baruFile); ui.kompres = false; ui.pesanFile = pesan.length ? pesan.slice(0, 2).join('; ') : ''; errors = {};
    if (order) order = null;                       // isi berubah → pesanan lama tidak dipakai lagi
    paint();
    var fi = document.getElementById('fileInput'); if (fi) fi.focus({ preventScroll: true });
  }
  function geser(id, arah) {
    var i = files.findIndex(function (f) { return f.id === id; }), j = i + arah;
    if (i < 0 || j < 0 || j >= files.length) return;
    var t = files[i]; files[i] = files[j]; files[j] = t; if (order) order = null; paint();
    var b = $root.querySelector('[data-f="' + (arah < 0 ? 'up' : 'down') + '"][data-id="' + id + '"]'); if (b && !b.disabled) b.focus();
  }
  function hapus(id) {
    var f = files.find(function (x) { return x.id === id; }); if (f && f.url) URL.revokeObjectURL(f.url);
    files = files.filter(function (x) { return x.id !== id; }); if (order) order = null; paint();
  }
  function bersihBerkas() { files.forEach(function (f) { if (f.url) URL.revokeObjectURL(f.url); }); files = []; }

  /* ---------------- Bayar ---------------- */
  function payPanelHTML() {
    var p = ui.pay; if (!p) return '';
    if (p.galat) return '<div class="notice warn" role="alert"><strong>' + esc(p.galat) + '</strong><div style="margin-top:.75rem"><button type="button" class="btn btn-primary btn-sm" data-f="pay">Coba Lagi</button></div></div>';
    return '<div class="pay-progress"><p class="small"><strong>' + esc(p.teks) + '</strong></p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.persen + '"><span style="width:' + p.persen + '%"></span></div><p class="small muted">Jangan tutup halaman ini.</p></div>';
  }
  function setPay(teks, persen, galat) {
    ui.pay = { teks: teks, persen: persen, galat: galat || '' };
    var el = document.getElementById('payPanel'); if (el) el.innerHTML = payPanelHTML();
  }
  function bacaBase64(blob) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1] || ''); }; r.onerror = function () { rej(new Error('Gagal membaca berkas')); }; r.readAsDataURL(blob); });
  }
  function galatPermanen(msg) { var e = new Error(msg); e.permanen = true; return e; }

  function payload() {
    var p = {
      paketId: ST.paket, namaPembeli: ST.namaPembeli.trim(), whatsapp: ST.whatsapp.trim(), email: ST.email.trim(),
      penerima: ST.penerima.trim(), tipeDari: ST.tipeDari, nilaiDari: ST.tipeDari === 'anonim' ? '' : ST.nilaiDari.trim(),
      pesan: ST.pesan.trim(), pesanPersonal: ST.pesanPersonal.trim(),
      desainId: ST.mode === 'pilih' ? ST.desainId : '', ideSendiri: ST.mode === 'ide' ? ST.ideSendiri.trim() : '',
      musikId: ST.musikId, catatan: ST.catatan.trim(), setuju: ST.setuju === true, website: ''
    };
    var pf = window.Auth && window.Auth.ada() ? window.Auth.profil() : null;
    if (pf) { p.sesi = window.Auth.token(); p.namaPembeli = pf.nama; p.whatsapp = pf.whatsapp; p.email = pf.email; }
    if (ST.paket === 'special') { p.jenisSurprise = ST.jenisSurprise; p.pesanRahasia = ST.pesanRahasia.trim(); p.passwordRahasia = ST.passwordRahasia; p.pembuka = ST.pembuka; }
    return p;
  }

  async function kirimBerkas(f, urutan, awalPersen, lebarPersen) {
    var total = f.blob.size, n = Math.max(1, Math.ceil(total / LIM.bagian));
    for (var i = 0; i < n; i++) {
      var b64 = await bacaBase64(f.blob.slice(i * LIM.bagian, Math.min(total, (i + 1) * LIM.bagian)));
      for (var coba = 0; ; coba++) {
        try {
          var r = await API.post('uploadMedia', {
            orderId: order.id, token: order.token, fileKey: f.id, jenis: f.jenis, mime: f.jenis === 'foto' ? 'image/jpeg' : 'video/mp4',
            nama: f.nama, urutan: urutan, bagian: i, jumlahBagian: n, ukuranTotal: total, data: b64
          }, { timeout: 90000 });
          if (!r || !r.success) throw galatPermanen((r && r.message) || 'Unggahan ditolak server.');
          break;
        } catch (e) { if (e.permanen || coba >= 2) throw e; await jeda(900 * (coba + 1)); }
      }
      setPay('Mengunggah ' + (f.jenis === 'foto' ? 'foto' : 'video') + ' ke-' + (urutan + 1) + ' dari ' + files.length + '…', Math.round(awalPersen + lebarPersen * ((i + 1) / n)));
    }
  }

  async function bayar() {
    if (ui.sibuk) return;
    errors = validasi('ringkasan');
    var semua = ['paket', 'pemesan', 'untuk', 'pesan', 'foto', 'desain', 'ekstra', 'catatan'];
    for (var i = 0; i < semua.length; i++) {
      if (semua[i] === 'ekstra' && ST.paket !== 'premium' && ST.paket !== 'special') continue;
      var e = validasi(semua[i]); if (Object.keys(e).length) { errors = e; kePaketDenganError(semua[i]); return; }
    }
    if (Object.keys(errors).length) { paint(); fokusError(); return; }

    ui.sibuk = true; var btn = $root.querySelector('[data-f="pay"]'); if (btn) btn.disabled = true;
    try {
      var p = payload(), fp = JSON.stringify(p) + '|' + files.map(function (f) { return f.id + f.ukuran; }).join(',');
      if (!order || order.fp !== fp) {
        setPay('Menyimpan pesananmu…', 5);
        var r = await API.post('createOrder', p, { timeout: 30000 });
        if (!r.success) {
          if (/Sesi berakhir/i.test(r.message || '')) {
            window.Auth.keluarLokal(); ui.sibuk = false; ui.pay = null;
            errors = { namaPembeli: 'Sesi akunmu berakhir. Isi data pemesan atau masuk kembali.' }; kePaketDenganError('pemesan'); return;
          }
          if (r.errors) { errors = r.errors; var pertama = Object.keys(r.errors)[0]; ui.sibuk = false; ui.pay = null; kePaketDenganError(ID_LANGKAH[pertama] || 'ringkasan'); return; }
          throw galatPermanen(r.message || 'Pesanan ditolak.');
        }
        order = { id: r.data.orderId, token: r.data.token, fp: fp, terunggah: {} };
        try { sessionStorage.setItem(KEY_ORDER, JSON.stringify({ o: order.id, t: order.token })); localStorage.setItem(KEY_ORDER, JSON.stringify({ o: order.id, t: order.token, w: Date.now() })); } catch (x) { /* abaikan */ }
      }
      var n = files.length, bagian = 80 / Math.max(1, n);
      for (var k = 0; k < n; k++) {
        var f = files[k];
        if (order.terunggah[f.id]) continue;
        await kirimBerkas(f, k, 10 + bagian * k, bagian);
        order.terunggah[f.id] = true;
      }
      setPay('Menyiapkan pembayaran…', 95);
      var pay = await API.post('createPayment', { orderId: order.id, token: order.token }, { timeout: 30000 });
      if (!pay.success) throw galatPermanen(pay.message || 'Pembayaran belum dapat dibuat.');
      setPay('Mengalihkan…', 100);
      var q = 'o=' + encodeURIComponent(order.id) + '&t=' + encodeURIComponent(order.token);
      if (pay.data.simulasi) { ui.sibuk = false; location.hash = '#/status?' + q + '&sim=1'; return; }
      var url = U.amanHttps(pay.data.payUrl);
      if (!url) throw galatPermanen('Alamat pembayaran tidak valid.');
      try { sessionStorage.setItem('dearora:payurl:' + order.id, url); } catch (x) { /* abaikan */ }
      location.href = url;
    } catch (err) {
      ui.sibuk = false;
      setPay('', 0, err.permanen ? err.message : 'Koneksi bermasalah saat mengirim. Pesananmu aman, coba lagi. (' + (err.message || 'galat') + ')');
      var b2 = $root.querySelector('.form-nav [data-f="pay"]'); if (b2) b2.disabled = false;
    }
  }
  function kePaketDenganError(id) { var l = daftarLangkah(), i = l.indexOf(id); if (i >= 0) langkah = i; paint(); fokusError(); }

  /* ---------------- Event ---------------- */
  function onInput(ev) {
    var el = ev.target, k = el.dataset && el.dataset.k;
    if (!k || el.type === 'radio' || el.type === 'checkbox') return;
    ST[k] = el.value;
    var c = $root.querySelector('[data-counter="' + k + '"]');
    if (c) { var n = el.value.length, m = Number(c.dataset.max); c.textContent = n + '/' + m; c.classList.toggle('over', n > m); }
    if (errors[k]) { delete errors[k]; el.removeAttribute('aria-invalid'); var er = document.getElementById(k + '-e'); if (er) er.remove(); }
    simpanDraf();
  }
  function onChange(ev) {
    var el = ev.target;
    if (el.id === 'fileInput') { var l = Array.prototype.slice.call(el.files || []); el.value = ''; if (l.length) tambahBerkas(l); return; }
    var k = el.dataset && el.dataset.k; if (!k) return;
    if (el.type === 'checkbox') { ST[k] = el.checked; if (errors[k]) { delete errors[k]; paint(); document.getElementById(k).focus(); } return; }
    if (el.type !== 'radio') return;
    ST[k] = el.value;
    if (k === 'paket') {
      var pk = paketAktif(); errors = {};
      if (ST.desainId) { var dd = data().desain.filter(function (x) { return x.id === ST.desainId; })[0]; if (!dd || dd.paket.indexOf(ST.paket) < 0) ST.desainId = ''; }
      var nf = files.filter(function (f) { return f.jenis === 'foto'; });
      if (pk && nf.length > pk.maksFoto) { nf.slice(pk.maksFoto).forEach(function (f) { hapusTanpaPaint(f.id); }); ui.pesanFile = 'Kelebihan foto dihapus (maks. ' + pk.maksFoto + ')'; }
      if (ST.paket !== 'special') files.filter(function (f) { return f.jenis === 'video'; }).forEach(function (f) { hapusTanpaPaint(f.id); });
      if (order) order = null;
    }
    paint();
    var again = document.getElementById(el.id); if (again) again.focus({ preventScroll: true });
    simpanDraf();
  }
  function hapusTanpaPaint(id) { var f = files.find(function (x) { return x.id === id; }); if (f && f.url) URL.revokeObjectURL(f.url); files = files.filter(function (x) { return x.id !== id; }); }

  function onClick(ev) {
    var b = ev.target.closest('[data-f]'); if (!b) return;
    var a = b.dataset.f;
    if (a === 'next') lanjut();
    else if (a === 'back') kembali();
    else if (a === 'goto') kePaket(b.dataset.ke);
    else if (a === 'up') geser(b.dataset.id, -1);
    else if (a === 'down') geser(b.dataset.id, 1);
    else if (a === 'rm') hapus(b.dataset.id);
    else if (a === 'pay') bayar();
    else if (a === 'akun-masuk') masukAkun(b);
    else if (a === 'akun-lepas') { window.Auth.keluar(); if (order) order = null; paint(); }
  }

  async function masukAkun(btn) {
    var kode = (document.getElementById('akunKode').value || '').toUpperCase().replace(/\s+/g, ''), pw = document.getElementById('akunPw').value || '';
    var er = document.getElementById('akunErr'); er.hidden = true;
    if (!/^DRA-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(kode) || !pw) { er.hidden = false; er.textContent = 'Isi kode redeem (mis. DRA-7K3M-9QXA) dan password.'; return; }
    btn.disabled = true; btn.textContent = 'Memproses…';
    try {
      var r = await window.Auth.masuk(kode, pw);
      if (!r.success) { er.hidden = false; er.textContent = r.message || 'Gagal masuk.'; btn.disabled = false; btn.innerHTML = 'Masuk &amp; isi otomatis'; ui.akunBuka = true; return; }
      var p = r.data.profil; ST.namaPembeli = p.nama; ST.whatsapp = p.whatsapp; ST.email = p.email; errors = {}; if (order) order = null; paint(); simpanDraf();
    } catch (e) { er.hidden = false; er.textContent = 'Koneksi bermasalah. Coba lagi.'; btn.disabled = false; btn.innerHTML = 'Masuk &amp; isi otomatis'; }
  }

  /* ---------------- API modul ---------------- */
  function dariQuery(q) {
    var kunci = (q.paket || '') + '|' + (q.desain || '');
    if (kunci === '|' || ui.queryDipakai === kunci || !data()) return;
    ui.queryDipakai = kunci;
    var d = data(), p = q.paket && d.paket.filter(function (x) { return x.id === q.paket; })[0];
    var ds = q.desain && d.desain.filter(function (x) { return x.id === q.desain; })[0];
    if (p) { ST.paket = p.id; }
    if (ds) {
      if (!ST.paket && ds.paket.length) ST.paket = ds.paket[0];
      if (ds.paket.indexOf(ST.paket) >= 0) { ST.mode = 'pilih'; ST.desainId = ds.id; }
    }
    if ((p || ds) && ST.paket && langkah === 0) langkah = 1;     // paket sudah ditentukan → lompat ke Data Pemesan
  }

  function view(c) {
    ctx = c;
    if (!ST) muatDraf();
    if (c.status === 'loading') return '<section class="section" style="padding-top:2rem"><div class="container"><div class="skeleton sk-plan" aria-hidden="true"></div></div></section>';
    if (c.status === 'error') return '<section class="section"><div class="container">' + U.errorBox() + '</div></section>';
    return '<header class="page-head"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>Buat Ucapan</span></nav>' +
      '<p class="eyebrow">Buat Ucapan</p></div></header>' +
      '<section class="section" style="padding-top:1.5rem"><div class="container"><div class="form-wrap" id="fRoot"></div></div></section>';
  }

  function after(main, c) {
    ctx = c; $root = document.getElementById('fRoot'); if (!$root) return;
    if (!ST) muatDraf();
    ui.simpanAktif = true;
    dariQuery(c.query || {});
    if (ST.paket && !paketAktif()) { ST.paket = ''; langkah = 0; }
    if (langkah > 0 && !ST.paket) langkah = 0;
    $root.addEventListener('input', onInput);
    $root.addEventListener('change', onChange);
    $root.addEventListener('click', onClick);
    $root.addEventListener('submit', function (e) { e.preventDefault(); });
    paint();
  }

  function bersihkan() {   // dipanggil setelah pembayaran sukses
    clearTimeout(simpanT);
    bersihBerkas(); order = null; ST = baru(); langkah = 0; ui = { sibuk: false, pay: null, kompres: false, queryDipakai: '', simpanAktif: false };
    try { localStorage.removeItem(KEY_DRAF); } catch (e) { /* abaikan */ }
  }

  window.Form = { view: view, after: after, bersihkan: bersihkan, KEY_ORDER: KEY_ORDER };
})();
