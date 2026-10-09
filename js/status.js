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
  var $ = function (id) { return document.getElementById(id); };

  function ambilInfo(q) {
    var o = q.o, t = q.t;
    if (!o || !t) {                                    // cadangan: pesanan terakhir di browser ini
      try { var j = JSON.parse(sessionStorage.getItem(window.Form.KEY_ORDER) || localStorage.getItem(window.Form.KEY_ORDER)); if (j && j.o && j.t) { o = j.o; t = j.t; } } catch (e) { /* abaikan */ }
    }
    return { o: o, t: t, trx: q.trx || '', batal: q.batal === '1', sim: q.sim === '1' };
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
    var h = $('stTitle'); if (h) h.focus({ preventScroll: true });
  }

  function menunggu(d) {
    var payUrl = ''; try { payUrl = sessionStorage.getItem('dearora:payurl:' + info.o) || ''; } catch (e) { /* abaikan */ }
    var simulasi = d && d.mode === 'simulasi';
    return '<div class="card status-card"><span class="spinner" aria-hidden="true"></span>' +
      '<h1 class="h2" id="stTitle" tabindex="-1">' + (info.batal ? 'Pembayaran Belum Selesai' : 'Menunggu Pembayaran') + '</h1>' +
      '<p class="lead">' + (info.batal ? 'Sepertinya pembayaran dibatalkan atau belum selesai. Kamu bisa melanjutkannya selama batas waktu belum lewat.' : 'Selesaikan pembayaranmu. Halaman ini akan berpindah otomatis setelah pembayaran terkonfirmasi.') + '</p>' +
      (d ? '<p class="small muted">Pesanan <strong>' + esc(d.orderId) + '</strong> · Paket ' + esc(d.paket) + ' · Rp ' + esc(U.rupiah(d.nominal)) + '</p>' : '') +
      '<div class="hero-cta" style="justify-content:center">' +
      (payUrl ? '<a class="btn btn-primary" href="' + esc(payUrl) + '">Buka Halaman Pembayaran</a>' : '') +
      '<button type="button" class="btn btn-secondary" data-s="cek">Periksa Status</button></div>' +
      (simulasi ? '<div class="notice warn" style="margin-top:1.5rem;text-align:left"><strong>Mode simulasi</strong><p class="small" style="margin-top:.25rem">Tidak ada pembayaran sungguhan. Tekan tombol di bawah untuk menganggap pembayaran berhasil.</p>' +
        '<button type="button" class="btn btn-lavender btn-sm" style="margin-top:.75rem" data-s="sim">Simulasikan Pembayaran Berhasil</button></div>' : '') +
      '</div>';
  }

  function sukses(d) {
    var special = /special/i.test(d.paket);
    return '<div class="card status-card ok"><span class="icon-tile sage">' + ic('check') + '</span>' +
      '<h1 class="h2" id="stTitle" tabindex="-1">Pembayaran Berhasil</h1>' +
      '<p class="lead">Terima kasih! Pesanan <strong>' + esc(d.orderId) + '</strong> (Paket ' + esc(d.paket) + ') sudah kami terima.</p>' +
      '<div class="code-box"><span class="code-label">Kode redeem kamu</span><output class="code" id="kodeRedeem">' + esc(d.kodeRedeem || 'Sedang disiapkan…') + '</output>' +
      '<button type="button" class="btn btn-primary btn-sm" data-s="salin"' + (d.kodeRedeem ? '' : ' disabled') + '>Salin Kode</button></div>' +
      '<p class="small muted">Kode juga dikirim ke <strong>' + esc(d.emailSamar || 'emailmu') + '</strong> bersama tanda terima. Simpan kode ini: dipakai untuk membuat password dan memantau progres di portal pembeli.</p>' +
      '<div class="callout" style="text-align:left;margin-top:1.5rem"><span class="icon-tile">' + ic('clock') + '</span><div><p><strong>Selanjutnya</strong></p><p>' +
      (special ? 'Ucapan Special dikerjakan manual dengan estimasi 1–2 hari kerja. Kami kirim email saat sudah jadi.' : 'Ucapanmu sedang disiapkan. Link ucapan akan dikirim ke emailmu setelah aktif.') +
      '</p></div></div>' +
      '<div class="hero-cta" style="justify-content:center"><a class="btn btn-secondary" href="#/">Kembali ke Home</a></div></div>';
  }

  async function cek(manual) {
    var my = run;
    try {
      var p = { o: info.o, t: info.t }; if (info.trx) p.trx = info.trx;
      var r = await API.get('paymentStatus', p, { coba: 1, timeout: 20000 });
      if (my !== run) return;                                       // sudah pindah halaman
      if (!r.success) { tampilkan(null, 'tidak-ada'); return; }
      var d = r.data, sama = terakhir && terakhir.status === d.status && terakhir.dibayar === d.dibayar && terakhir.kodeRedeem === d.kodeRedeem && terakhir.tinjau === d.tinjau;
      if (!sama || manual) tampilkan(d);
      terakhir = Object.assign({}, d);
      if (d.dibayar) { try { window.Form.bersihkan(); } catch (e) { /* abaikan */ } return; }
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
    stop(); run++; hitung = 0; terakhir = null;
    info = ambilInfo(c.query || {});
    var root = $('statusRoot'); if (!root) return;
    if (!info.o || !info.t) { tampilkan(null, 'tidak-ada'); return; }
    if (!API.siap()) { root.innerHTML = kotak('info', 'Mode Pratinjau', '<p class="lead">Status pembayaran membutuhkan backend. Isi GAS_URL di js/config.js.</p>'); return; }

    root.addEventListener('click', async function (ev) {
      var b = ev.target.closest('[data-s]'); if (!b) return;
      var a = b.dataset.s;
      if (a === 'cek') { clearTimeout(timer); cek(true); }
      else if (a === 'salin') salin();
      else if (a === 'sim') {
        b.disabled = true; b.textContent = 'Memproses…';
        try { var r = await API.post('simulasiBayar', { orderId: info.o, token: info.t }, { timeout: 30000 }); if (r && r.success) { clearTimeout(timer); terakhir = null; tampilkan(r.data); try { window.Form.bersihkan(); } catch (e) { /* abaikan */ } } else { b.disabled = false; b.textContent = 'Simulasikan Pembayaran Berhasil'; } }
        catch (e) { b.disabled = false; b.textContent = 'Simulasikan Pembayaran Berhasil'; }
      }
    });
    cek(false);
  }

  function salin() {
    var kode = ($('kodeRedeem') || {}).textContent || '';
    function ok() { var t = document.getElementById('toast'); if (t) { t.textContent = 'Kode disalin'; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2000); } }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(kode).then(ok, function () { fallback(); }); } else fallback();
    function fallback() { var r = document.createRange(); r.selectNodeContents($('kodeRedeem')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); ok(); } catch (e) { /* pengguna salin manual */ } }
  }

  function stop() { run++; clearTimeout(timer); timer = null; }

  window.Status = { view: view, after: after, stop: stop };
})();
