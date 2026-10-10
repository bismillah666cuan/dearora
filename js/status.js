/* ==========================================================
   STATUS PEMBAYARAN — rute #/status?o=ORDER&t=TOKEN
   • Memeriksa status berkala (F-23); berhenti saat berpindah halaman.
   • Menampilkan kode redeem (F-26) setelah pembayaran terkonfirmasi.
   • Token pesanan hanya dipakai untuk membaca status pesanan ini.
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, ic = U.ic, API = window.DearoraAPI;
  var timer = null, hitung = 0, MAKS = 360, run = 0;   // ±24 menit pada interval 4 dtk
  var info = null;                                     // {o, t, trx, batal, sim}
  var terakhir = null;                                 // data status terakhir
  var jam = null, mulaiMs = 0;                         // penghitung lama menunggu
  var $ = function (id) { return document.getElementById(id); };

  function ambilInfo(q) {
    var o = q.o, t = q.t;
    if (!o || !t) {                                    // cadangan: pesanan terakhir di browser ini
      try { var j = JSON.parse(sessionStorage.getItem(window.Form.KEY_ORDER) || localStorage.getItem(window.Form.KEY_ORDER)); if (j && j.o && j.t) { o = j.o; t = j.t; } } catch (e) { /* abaikan */ }
    }
    return { o: o, t: t, trx: q.trx || '', batal: q.batal === '1', sim: q.sim === '1', r: q.r === '1' };
  }

  /** Tiga tahap yang selalu terlihat: Pesanan → Pembayaran → Ucapan. Pembeli tahu sedang di mana. */
  function tracker(d) {
    var bayar = !!(d && d.dibayar), special = !!(d && /special/i.test(d.paket));
    var diverif = !bayar && ((info.r && !info.batal) || (d && d.trxDiterima));
    var s2 = bayar ? ['done', 'Pembayaran terkonfirmasi', ''] : diverif ? ['now', 'Pembayaran diterima, sedang diverifikasi', 'Biasanya kurang dari 1 menit.'] : ['now', 'Menunggu pembayaran', 'Selesaikan transfer di halaman pembayaran.'];
    var s3 = !bayar ? ['next', 'Ucapan disiapkan', ''] : (d.linkHasil ? ['done', 'Ucapan aktif', 'Link siap dibagikan.'] : (special ? ['now', 'Ucapan dikerjakan manual', 'Estimasi 1–2 hari kerja. Kami kirim email saat selesai.'] : ['now', 'Menyiapkan link ucapanmu', 'Beberapa detik lagi.']));
    var li = function (st, judul, sub, nomor) {
      return '<li class="' + st + '"><span class="st-dot" aria-hidden="true">' + (st === 'done' ? ic('check') : st === 'now' ? '<i class="st-spin"></i>' : nomor) + '</span><span><strong>' + esc(judul) + '</strong>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></li>';
    };
    return '<ol class="steps-track" aria-label="Tahapan pesanan">' + li('done', 'Pesanan dibuat', '', 1) + li(s2[0], s2[1], s2[2], 2) + li(s3[0], s3[1], s3[2], 3) + '</ol>';
  }
  function mulaiJam() {
    clearInterval(jam); jam = null;
    var el = $('stWaktu'); if (!el) return;
    function tik() {
      var det = Math.floor((Date.now() - mulaiMs) / 1000), m = Math.floor(det / 60), s = det % 60;
      var e = $('stWaktu'); if (e) e.textContent = 'Sudah menunggu ' + m + ':' + (s < 10 ? '0' : '') + s;
      var lama = $('stLama'); if (lama && det >= 120) lama.hidden = false;
    }
    tik(); jam = setInterval(tik, 1000);
  }

  function kotak(ikon, judul, isi, tone) {
    return '<div class="card status-card"><span class="icon-tile ' + (tone || '') + '">' + ic(ikon) + '</span><h1 class="h2" id="stTitle" tabindex="-1">' + esc(judul) + '</h1>' + isi + '</div>';
  }

  function tampilkan(d, galat) {
    var el = $('statusRoot'); if (!el) return;
    var html;
    if (galat === 'tidak-ada') {
      html = kotak('info', 'Pesanan Tidak Ditemukan', '<p class="lead">Link pembayaran ini tidak valid atau sudah tidak berlaku.</p><div class="hero-cta" style="justify-content:center"><a class="btn btn-primary" href="#/buat">Buat Ucapan</a></div>');
    } else if (galat) {
      html = kotak('info', 'Belum Bisa Memeriksa', '<p class="lead">Koneksi bermasalah. Pembayaranmu aman. Kami coba memeriksa lagi.</p><button type="button" class="btn btn-primary" data-s="cek">Periksa Sekarang</button>');
    } else if (d.dibayar) {
      html = sukses(d);
    } else if (d.tinjau) {
      html = kotak('info', 'Pembayaran Sedang Ditinjau', '<p class="lead">Kami menerima pembayaranmu, namun perlu memeriksanya secara manual. Simpan nomor pesananmu:</p><p class="order-id">' + esc(d.orderId) + '</p><p class="muted small">Hubungi kontak resmi Dearora dan sebutkan nomor pesanan di atas.</p>', 'lav');
    } else if (d.status === 'Dibatalkan') {
      html = kotak('info', 'Pesanan Kedaluwarsa', '<p class="lead">Batas waktu pembayaran sudah lewat sehingga pesanan dibatalkan otomatis.</p><div class="hero-cta" style="justify-content:center"><a class="btn btn-primary" href="#/buat">Buat Ucapan Baru</a></div>');
    } else {
      html = menunggu(d);
    }
    el.innerHTML = html;
    mulaiJam();
    var h = $('stTitle'); if (h) h.focus({ preventScroll: true });
  }

  function menunggu(d) {
    var payUrl = ''; try { payUrl = sessionStorage.getItem('dearora:payurl:' + info.o) || ''; } catch (e) { /* abaikan */ }
    var simulasi = d && d.mode === 'simulasi';
    var diverif = (info.r && !info.batal) || (d && d.trxDiterima);
    var judul = info.batal ? 'Pembayaran Belum Selesai' : diverif ? 'Memverifikasi Pembayaran…' : 'Menunggu Pembayaran';
    var lead = info.batal ? 'Sepertinya pembayaran dibatalkan atau belum selesai. Kamu bisa melanjutkannya selama batas waktu belum lewat.'
      : diverif ? 'Terima kasih! Kami sedang memastikan pembayaranmu masuk. Halaman ini berpindah otomatis, jadi kamu tidak perlu berbuat apa-apa.'
      : 'Selesaikan pembayaranmu. Halaman ini akan berpindah otomatis setelah pembayaran terkonfirmasi.';
    return '<div class="card status-card"><span class="spinner" aria-hidden="true"></span>' +
      '<h1 class="h2" id="stTitle" tabindex="-1">' + judul + '</h1>' +
      '<p class="lead">' + lead + '</p>' + tracker(d) +
      '<p class="small muted" id="stWaktu" aria-live="off"></p>' +
      '<p class="notice" id="stLama" hidden style="text-align:left">Verifikasi memakan waktu lebih lama dari biasanya. Pembayaranmu aman. Kami kirim email begitu terkonfirmasi, jadi kamu boleh menutup halaman ini.</p>' +
      (d ? '<p class="small muted">Pesanan <strong>' + esc(d.orderId) + '</strong> · Paket ' + esc(d.paket) + ' · Rp ' + esc(U.rupiah(d.nominal)) + '</p>' : '') +
      '<div class="hero-cta" style="justify-content:center">' +
      (payUrl && !diverif ? '<a class="btn btn-primary" href="' + esc(payUrl) + '">Buka Halaman Pembayaran</a>' : '') +
      '<button type="button" class="btn btn-secondary" data-s="cek">Periksa Status</button></div>' +
      (simulasi ? '<div class="notice warn" style="margin-top:1.5rem;text-align:left"><strong>Mode simulasi</strong><p class="small" style="margin-top:.25rem">Tidak ada pembayaran sungguhan. Tekan tombol di bawah untuk menganggap pembayaran berhasil.</p>' +
        '<button type="button" class="btn btn-lavender btn-sm" style="margin-top:.75rem" data-s="sim">Simulasikan Pembayaran Berhasil</button></div>' : '') +
      '</div>';
  }

  function sukses(d) {
    var special = /special/i.test(d.paket);
    return '<div class="card status-card ok"><span class="icon-tile sage">' + ic('check') + '</span>' +
      '<h1 class="h2" id="stTitle" tabindex="-1">Pembayaran Berhasil</h1>' +
      '<p class="lead">Terima kasih! Pesanan <strong>' + esc(d.orderId) + '</strong> (Paket ' + esc(d.paket) + ') sudah kami terima.</p>' + tracker(d) +
      (d.akunLama
        ? '<div class="notice" style="width:100%;text-align:left">Pesanan ini sudah ditambahkan ke akunmu. Masuk ke portal dengan kode redeem dan password yang sudah kamu miliki.</div>'
        : '<div class="code-box"><span class="code-label">Kode redeem kamu</span><output class="code" id="kodeRedeem">' + esc(d.kodeRedeem || 'Sedang disiapkan…') + '</output>' +
          '<button type="button" class="btn btn-primary btn-sm" data-s="salin"' + (d.kodeRedeem ? '' : ' disabled') + '>Salin Kode</button></div>' +
          '<p class="small muted">Kode juga dikirim ke <strong>' + esc(d.emailSamar || 'emailmu') + '</strong> bersama tanda terima. Simpan kode ini: dipakai untuk membuat password dan masuk ke portal pembeli.</p>') +
      (d.linkHasil
        ? '<div class="link-card" style="width:100%;text-align:left"><label class="small muted" for="lnkUcapan">Link ucapanmu sudah aktif</label><div class="link-row"><input class="input" id="lnkUcapan" readonly value="' + esc(d.linkHasil) + '"><button type="button" class="btn btn-primary btn-sm" data-s="salin-link">Salin</button><a class="btn btn-secondary btn-sm" href="' + esc(d.linkHasil) + '" target="_blank" rel="noopener">Buka</a></div>' +
          (d.kedaluwarsa ? '<p class="small muted" style="margin-top:.5rem">Aktif sampai ' + esc(new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(d.kedaluwarsa))) + '.</p>' : '') + '</div>'
        : '<div class="callout" style="text-align:left;margin-top:.5rem"><span class="icon-tile">' + ic('clock') + '</span><div><p><strong>Selanjutnya</strong></p><p>' +
          (special ? 'Ucapan Special dikerjakan manual dengan estimasi 1–2 hari kerja. Kami kirim email saat sudah jadi.' : 'Link ucapanmu sedang diaktifkan. Halaman ini akan menampilkannya sebentar lagi, dan link juga dikirim ke emailmu.') + '</p></div></div>') +
      '<div class="hero-cta" style="justify-content:center"><a class="btn btn-primary" href="#/masuk">Masuk ke Portal</a><a class="btn btn-secondary" href="#/">Kembali ke Home</a></div></div>';
  }

  async function cek(manual) {
    var my = run;
    try {
      var p = { o: info.o, t: info.t }; if (info.trx) p.trx = info.trx;
      var r = await API.get('paymentStatus', p, { coba: 1, timeout: 20000 });
      if (my !== run) return;                                       // sudah pindah halaman
      if (!r.success) { tampilkan(null, 'tidak-ada'); return; }
      var d = r.data, sama = terakhir && terakhir.status === d.status && terakhir.dibayar === d.dibayar && terakhir.kodeRedeem === d.kodeRedeem && terakhir.tinjau === d.tinjau && terakhir.linkHasil === d.linkHasil;
      if (!sama || manual) tampilkan(d);
      terakhir = Object.assign({}, d);
      if (d.dibayar) { try { window.Form.bersihkan(); } catch (e) { /* abaikan */ } if (!d.menungguLink) return; }
      if (d.tinjau || d.status === 'Dibatalkan') return;
    } catch (err) { if (my === run && !terakhir) tampilkan(null, 'jaringan'); }
    if (my !== run) return;
    hitung++;
    if (hitung < MAKS) timer = setTimeout(function () { cek(false); }, hitung < 15 ? 3000 : 6000);
  }

  function view(c) {
    return '<section class="section" style="padding-top:3rem"><div class="container"><div class="status-wrap" id="statusRoot" aria-live="polite">' +
      '<div class="card status-card"><span class="spinner" aria-hidden="true"></span><p class="lead">Memeriksa pembayaran…</p></div></div></div></section>';
  }

  function after(main, c) {
    stop(); run++; hitung = 0; terakhir = null; mulaiMs = Date.now();
    info = ambilInfo(c.query || {});
    var root = $('statusRoot'); if (!root) return;
    if (!info.o || !info.t) { tampilkan(null, 'tidak-ada'); return; }
    if (!API.siap()) { root.innerHTML = kotak('info', 'Mode Pratinjau', '<p class="lead">Status pembayaran membutuhkan backend. Isi GAS_URL di js/config.js.</p>'); return; }

    root.addEventListener('click', async function (ev) {
      var b = ev.target.closest('[data-s]'); if (!b) return;
      var a = b.dataset.s;
      if (a === 'cek') { clearTimeout(timer); cek(true); }
      else if (a === 'salin') salin($('kodeRedeem'));
      else if (a === 'salin-link') salin($('lnkUcapan'), true);
      else if (a === 'sim') {
        b.disabled = true; b.textContent = 'Memproses…';
        try { var r = await API.post('simulasiBayar', { orderId: info.o, token: info.t }, { timeout: 30000 }); if (r && r.success) { clearTimeout(timer); terakhir = null; tampilkan(r.data); try { window.Form.bersihkan(); } catch (e) { /* abaikan */ } } else { b.disabled = false; b.textContent = 'Simulasikan Pembayaran Berhasil'; } }
        catch (e) { b.disabled = false; b.textContent = 'Simulasikan Pembayaran Berhasil'; }
      }
    });
    cek(false);
  }

  function salin(el, adalahInput) {
    if (!el) return;
    var teks = adalahInput ? el.value : (el.textContent || '');
    function ok() { var t = document.getElementById('toast'); if (t) { t.textContent = adalahInput ? 'Link disalin' : 'Kode disalin'; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2000); } }
    function fallback() {
      if (adalahInput) { el.select(); } else { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      try { document.execCommand('copy'); ok(); } catch (e) { /* pengguna salin manual */ }
    }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(teks).then(ok, fallback); } else fallback();
  }

  function stop() { run++; clearTimeout(timer); timer = null; clearInterval(jam); jam = null; }

  window.Status = { view: view, after: after, stop: stop };
})();
