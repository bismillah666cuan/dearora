/* ==========================================================
   DASHBOARD ADMIN DEARORA (admin tunggal)
   • Semua pemeriksaan hak akses terjadi di SERVER. Halaman ini hanya menyimpan token sesi (sessionStorage).
   • Semua data dari server di-escape sebelum masuk ke HTML.
   ========================================================== */
(function () {
  'use strict';
  var API = window.DearoraAPI, U = window.UI, esc = U.esc, rupiah = U.rupiah;
  var KEY = 'dearora:admin:v1';
  var app = document.getElementById('app'), dlg = document.getElementById('dlg'), toastEl = document.getElementById('toast');
  var token = '', run = 0, shellAda = false, pengaturan = null;
  var STATUS = ['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Selesai', 'Aktif', 'Kedaluwarsa', 'Dibatalkan', 'Perlu Ditinjau'];

  /* ---------------- Util ---------------- */
  function ic(n) { return '<svg class="icon" aria-hidden="true" focusable="false"><use href="#a-' + n + '"/></svg>'; }
  function tgl(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(t)) : '-'; }
  function tglJam(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(t)) : '-'; }
  function rp(n) { return 'Rp ' + rupiah(n); }
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2600); }
  function badge(s) {
    var k = { 'Aktif': 'ok', 'Selesai': 'ok', 'Dibayar': 'info', 'Diproses': 'info', 'Menunggu Pembayaran': 'warn', 'Perlu Ditinjau': 'bad', 'Berhasil': 'ok', 'Menunggu': 'warn', 'Gagal': 'bad', 'Kedaluwarsa': '', 'Dibatalkan': '' }[s] || '';
    return '<span class="badge ' + k + '">' + esc(s) + '</span>';
  }
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, ''), i = h.indexOf('?'), q = {};
    new URLSearchParams(i >= 0 ? h.slice(i + 1) : '').forEach(function (v, k) { q[k] = v; });
    return { rute: (i >= 0 ? h.slice(0, i) : h).replace(/\/+$/, ''), q: q };
  }
  function qs(o) { var p = new URLSearchParams(); Object.keys(o).forEach(function (k) { if (o[k]) p.set(k, o[k]); }); var s = p.toString(); return s ? '?' + s : ''; }
  function unduh(nama, teks, mime) {
    var b = new Blob(['\ufeff' + teks], { type: mime || 'text/csv;charset=utf-8' }), u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = nama; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }

  /* ---------------- Sesi & API ---------------- */
  function bacaToken() { try { return sessionStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function simpanToken(t) { token = t; try { if (t) sessionStorage.setItem(KEY, t); else sessionStorage.removeItem(KEY); } catch (e) { /* diblokir */ } }
  async function call(aksi, data) {
    var r = await API.post(aksi, data || {}, { token: token, timeout: 40000 });
    if (!r.success && /Sesi admin berakhir/i.test(r.message || '')) { simpanToken(''); shellAda = false; tampilLogin('Sesi berakhir. Silakan masuk kembali.'); throw new Error('sesi'); }
    return r;
  }
  function setTema(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('dearora:admin:tema', t); } catch (e) { /* abaikan */ } var b = document.querySelectorAll('[data-a="tema"]'); b.forEach(function (x) { x.innerHTML = ic(t === 'dark' ? 'sun' : 'moon') + '<span class="sr">Ganti tema</span>'; }); }

  /* ---------------- Dialog ---------------- */
  /** Dialog isian sederhana. Mengembalikan objek nilai, atau null bila dibatalkan. */
  function tanya(o) {
    return new Promise(function (resolve) {
      var f = (o.fields || []).map(function (x) {
        var inp = x.type === 'select' ? '<select id="dq-' + x.name + '">' + x.opsi.map(function (p) { return '<option value="' + esc(p[0]) + '">' + esc(p[1]) + '</option>'; }).join('') + '</select>'
          : x.type === 'textarea' ? '<textarea id="dq-' + x.name + '" rows="3" maxlength="300"></textarea>'
          : '<input id="dq-' + x.name + '" type="' + (x.type || 'text') + '"' + (x.min != null ? ' min="' + x.min + '" max="' + x.max + '"' : '') + ' value="' + esc(x.value || '') + '">';
        return '<div class="field"><label for="dq-' + x.name + '">' + esc(x.label) + '</label>' + inp + (x.hint ? '<p class="hint">' + esc(x.hint) + '</p>' : '') + '</div>';
      }).join('');
      dlg.innerHTML = '<form class="dlg-in" method="dialog" novalidate><h2>' + esc(o.judul) + '</h2>' + (o.teks ? '<p class="muted">' + esc(o.teks) + '</p>' : '') + f +
        '<p class="err" id="dq-err" role="alert" hidden></p><div class="dlg-act"><button type="button" class="btn" data-d="batal">Batal</button><button type="submit" class="btn ' + (o.bahaya ? 'danger' : 'primary') + '">' + esc(o.ya || 'Lanjut') + '</button></div></form>';
      var form = dlg.querySelector('form'), selesai = false;
      function tutup(v) { if (selesai) return; selesai = true; dlg.close(); resolve(v); }
      form.addEventListener('submit', function (ev) {
        ev.preventDefault(); var v = {}, galat = '';
        (o.fields || []).forEach(function (x) { var el = document.getElementById('dq-' + x.name); v[x.name] = el.value.trim(); if (x.wajib && !v[x.name]) galat = x.label + ' wajib diisi.'; });
        if (galat) { var e = document.getElementById('dq-err'); e.hidden = false; e.textContent = galat; return; }
        tutup(v);
      });
      form.querySelector('[data-d="batal"]').addEventListener('click', function () { tutup(null); });
      dlg.addEventListener('close', function () { tutup(null); }, { once: true });
      dlg.showModal(); var p = form.querySelector('input,select,textarea'); if (p) p.focus();
    });
  }

  /* ---------------- Login ---------------- */
  function tampilLogin(pesan) {
    run++;
    app.innerHTML = '<div class="login"><div class="card"><div class="brand"><span class="mark">' + ic('heart') + '</span><span>Dearora <small>Admin</small></span></div>' +
      '<h1>Masuk Admin</h1><p class="muted small">Khusus pemilik. Semua aktivitas dicatat.</p>' +
      (pesan ? '<p class="banner" role="status" style="margin-top:1rem">' + ic('alert') + '<span>' + esc(pesan) + '</span></p>' : '') +
      '<form id="fLogin" novalidate style="margin-top:1rem"><div class="field"><label for="lEmail">Email</label><input id="lEmail" type="email" autocomplete="username" required></div>' +
      '<div class="field"><label for="lPw">Password</label><input id="lPw" type="password" autocomplete="current-password" required></div>' +
      '<p class="err" id="lErr" role="alert" hidden></p><button class="btn primary" style="width:100%" type="submit">Masuk</button></form></div></div>';
    var f = document.getElementById('fLogin'); document.getElementById('lEmail').focus();
    f.addEventListener('submit', async function (ev) {
      ev.preventDefault(); var b = f.querySelector('button'), er = document.getElementById('lErr'); er.hidden = true;
      b.disabled = true; b.textContent = 'Memproses…';
      try {
        var r = await API.post('adminLogin', { email: document.getElementById('lEmail').value, password: document.getElementById('lPw').value }, { timeout: 25000 });
        if (!r.success) { er.hidden = false; er.textContent = r.message || 'Gagal masuk.'; b.disabled = false; b.textContent = 'Masuk'; document.getElementById('lPw').value = ''; return; }
        simpanToken(r.data.token); location.hash = '#/'; mulai();
      } catch (e) { er.hidden = false; er.textContent = 'Koneksi bermasalah. Coba lagi.'; b.disabled = false; b.textContent = 'Masuk'; }
    });
  }

  /* ---------------- Kerangka ---------------- */
  var NAV = [['', 'Ringkasan', 'home'], ['pesanan', 'Pesanan', 'list'], ['laporan', 'Laporan', 'chart'], ['pengaturan', 'Pengaturan', 'gear']];
  function navHtml(kelas) { return NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-nav="' + n[0] + '">' + ic(n[2]) + '<span>' + n[1] + '</span></a>'; }).join(''); }
  function bangunShell() {
    var tema = document.documentElement.getAttribute('data-theme');
    app.innerHTML = '<div class="shell"><aside class="side"><a class="brand" href="#/"><span class="mark">' + ic('heart') + '</span><span>Dearora <small>Admin</small></span></a>' +
      '<nav aria-label="Menu admin">' + navHtml() + '</nav><div class="foot"><button class="btn sm" data-a="tema">' + ic(tema === 'dark' ? 'sun' : 'moon') + '<span class="sr">Ganti tema</span> Tema</button>' +
      '<button class="btn sm" data-a="keluar">' + ic('out') + ' Keluar</button></div></aside>' +
      '<div><header class="top"><a class="brand" href="#/"><span class="mark">' + ic('heart') + '</span><span>Dearora <small>Admin</small></span></a>' +
      '<div style="display:flex;gap:.5rem"><button class="icon-btn" data-a="tema">' + ic(tema === 'dark' ? 'sun' : 'moon') + '<span class="sr">Ganti tema</span></button><button class="icon-btn" data-a="keluar" aria-label="Keluar">' + ic('out') + '</button></div></header>' +
      '<main id="main" tabindex="-1"></main></div>' +
      '<nav class="bottom" aria-label="Menu admin (seluler)">' + navHtml() + '</nav></div>';
    shellAda = true;
  }
  function tandaiNav(r) {
    var aktif = r === 'detail' ? 'pesanan' : r;
    document.querySelectorAll('[data-nav]').forEach(function (a) { if (a.dataset.nav === aktif) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  function skel() { return '<div class="grid"><div class="skel"></div><div class="skel"></div></div>'; }
  function galatBox(m) { return '<div class="card"><p class="err" role="alert">' + esc(m || 'Gagal memuat data.') + '</p><button class="btn sm" data-a="muat-ulang" style="margin-top:.75rem">Coba Lagi</button></div>'; }

  /* ---------------- Grafik ---------------- */
  function labelTgl(k) { var p = k.split('-'); return p.length === 3 ? p[2] + '/' + p[1] : k; }
  function barChart(data, key, labelFn, judul) {
    var W = 640, H = 190, pl = 6, pb = 24, pt = 14, max = Math.max.apply(null, data.map(function (d) { return d[key]; }).concat([1])), n = data.length, bw = (W - pl * 2) / n;
    var bars = data.map(function (d, i) {
      var h = Math.round((d[key] / max) * (H - pb - pt)), x = pl + i * bw + bw * 0.14;
      return '<rect class="bar" x="' + x.toFixed(1) + '" y="' + (H - pb - h) + '" width="' + (bw * 0.72).toFixed(1) + '" height="' + Math.max(h, d[key] > 0 ? 2 : 0) + '" rx="3"><title>' + esc(labelFn(d)) + ': ' + (key === 'pendapatan' ? rp(d[key]) : d[key]) + '</title></rect>';
    }).join('');
    var idx = n > 2 ? [0, Math.floor(n / 2), n - 1] : [0, n - 1];
    var lab = idx.map(function (i) { return '<text x="' + (pl + i * bw + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '">' + esc(labelFn(data[i], true)) + '</text>'; }).join('');
    var total = data.reduce(function (s, d) { return s + d[key]; }, 0);
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(judul) + '. Total ' + (key === 'pendapatan' ? rp(total) : total) + '.">' +
      '<line class="grid" x1="0" x2="' + W + '" y1="' + (H - pb) + '" y2="' + (H - pb) + '"/><text x="' + pl + '" y="10">' + (key === 'pendapatan' ? rp(max) : max) + '</text>' + bars + lab + '</svg>';
  }

  /* ---------------- Ringkasan ---------------- */
  async function viewDashboard(my) {
    var main = document.getElementById('main'); main.innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Ringkasan</h1></div>' + skel();
    var r = await call('adminDashboard'); if (my !== run) return;
    if (!r.success) { main.innerHTML = galatBox(r.message); return; }
    var d = r.data, t = d.tindakan;
    function daftar(judul, arr, fn) { return arr.length ? '<h3>' + esc(judul) + ' (' + arr.length + ')</h3>' + arr.map(fn).join('') : ''; }
    var link = function (o) { return '<a href="#/detail?o=' + encodeURIComponent(o.orderId) + '"><span><strong>' + esc(o.orderId) + '</strong> · ' + esc(o.penerima) + '</span>' + badge(o.status) + '</a>'; };
    var isiTodo =
      daftar('Special sedang dikerjakan', t.special, link) +
      daftar('Revisi diminta', t.revisi, function (x) { return '<a href="#/detail?o=' + encodeURIComponent(x.orderId) + '"><span><strong>' + esc(x.orderId) + '</strong> · ' + esc(x.catatan.slice(0, 60)) + '</span><span class="badge warn">Revisi</span></a>'; }) +
      daftar('Pembayaran perlu ditinjau', t.tinjau, link) +
      daftar('Segera berakhir (≤ 3 hari)', t.segeraBerakhir, function (o) { return '<a href="#/detail?o=' + encodeURIComponent(o.orderId) + '"><span><strong>' + esc(o.orderId) + '</strong> · ' + esc(o.penerima) + '</span><span class="small muted">' + esc(tgl(o.tglKedaluwarsa)) + '</span></a>'; }) +
      (t.emailGagal ? '<h3>Perhatian</h3><div class="row"><span>' + t.emailGagal + ' email gagal terkirim (7 hari terakhir). Cek sheet EmailLog.</span><span class="badge bad">Email</span></div>' : '');
    main.innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Ringkasan</h1><a class="btn sm" href="#/pesanan">Semua pesanan</a></div>' +
      (d.mode === 'simulasi' ? '<p class="banner bad" role="alert">' + ic('alert') + '<span><strong>Mode bayar: SIMULASI.</strong> Siapa pun bisa "membayar" gratis. Ganti ke production sebelum rilis.</span></p>' : '') +
      '<div class="grid stats"><div class="card stat"><div class="k">Pendapatan bulan ini</div><div class="v">' + rp(d.pendapatanBulan) + '</div></div>' +
      '<div class="card stat"><div class="k">Pendapatan total</div><div class="v">' + rp(d.pendapatanTotal) + '</div></div>' +
      '<div class="card stat"><div class="k">Pembayaran berhasil</div><div class="v">' + d.jumlahBayar + '</div></div>' +
      '<div class="card stat"><div class="k">Menunggu bayar</div><div class="v">' + t.menungguBayar + '</div></div></div>' +
      '<div class="grid two-wide" style="margin-top:1rem"><div class="card"><h2>Pendapatan 30 hari terakhir</h2>' + barChart(d.seri, 'pendapatan', function (x, s) { return s ? labelTgl(x.tgl) : tgl(x.tgl); }, 'Pendapatan harian 30 hari terakhir') + '</div>' +
      '<div class="card"><h2>Perlu tindakan</h2><div class="todo">' + (isiTodo || '<p class="empty">' + ic('check') + '<br>Tidak ada yang perlu ditangani.</p>') + '</div></div></div>' +
      '<div class="card" style="margin-top:1rem"><h2>Pesanan per status</h2><div class="actions">' + Object.keys(d.perStatus).map(function (k) { return '<a class="btn sm" href="#/pesanan?status=' + encodeURIComponent(k) + '">' + esc(k) + ': <strong>' + d.perStatus[k] + '</strong></a>'; }).join('') + '</div></div>';
  }

  /* ---------------- Daftar pesanan ---------------- */
  var cari = { q: '', status: '', paket: '', hal: 1 }, tm = null;
  function barisDaftar(o) {
    return '<tr><td><a class="id" href="#/detail?o=' + encodeURIComponent(o.orderId) + '">' + esc(o.orderId) + '</a><div class="small muted">' + esc(tglJam(o.tglOrder)) + '</div></td>' +
      '<td>' + esc(o.pembeli) + '<div class="small muted">' + esc(o.email) + '</div></td><td>' + esc(o.penerima) + '</td><td>' + esc(o.paket) + '</td><td>' + rp(o.nominal) + '</td><td>' + badge(o.status) + '</td></tr>';
  }
  function kartuDaftar(o) {
    return '<a class="o-card" href="#/detail?o=' + encodeURIComponent(o.orderId) + '"><div class="t"><strong>' + esc(o.orderId) + '</strong>' + badge(o.status) + '</div>' +
      '<div class="small" style="margin-top:.25rem">' + esc(o.pembeli) + ' → ' + esc(o.penerima) + '</div><div class="small muted">' + esc(o.paket) + ' · ' + rp(o.nominal) + ' · ' + esc(tgl(o.tglOrder)) + '</div></a>';
  }
  async function muatDaftar(my) {
    var box = document.getElementById('daftar'); if (!box) return;
    box.setAttribute('aria-busy', 'true');
    var r = await call('adminOrders', { q: cari.q, status: cari.status, paket: cari.paket, halaman: cari.hal }); if (my !== run) return;
    box.removeAttribute('aria-busy');
    if (!r.success) { box.innerHTML = '<p class="err" role="alert">' + esc(r.message) + '</p>'; return; }
    var d = r.data, maks = Math.max(1, Math.ceil(d.total / d.perHalaman));
    box.innerHTML = '<p class="small muted" role="status">' + d.total + ' pesanan</p>' + (d.daftar.length
      ? '<div class="only-desk tbl-wrap"><table><thead><tr><th>Pesanan</th><th>Pembeli</th><th>Untuk</th><th>Paket</th><th>Nominal</th><th>Status</th></tr></thead><tbody>' + d.daftar.map(barisDaftar).join('') + '</tbody></table></div>' +
        '<div class="only-mob">' + d.daftar.map(kartuDaftar).join('') + '</div>'
      : '<div class="card empty">Tidak ada pesanan yang cocok.</div>') +
      '<div class="pager"><button class="btn sm" data-a="hal-" ' + (d.halaman <= 1 ? 'disabled' : '') + '>← Sebelumnya</button><span class="small muted">Hal. ' + d.halaman + ' dari ' + maks + '</span><button class="btn sm" data-a="hal+" ' + (d.halaman >= maks ? 'disabled' : '') + '>Berikutnya →</button></div>';
  }
  function simpanCariKeUrl() { history.replaceState(null, '', '#/pesanan' + qs({ q: cari.q, status: cari.status, paket: cari.paket, hal: cari.hal > 1 ? String(cari.hal) : '' })); }
  function viewPesanan(my, q) {
    cari = { q: q.q || '', status: q.status || '', paket: q.paket || '', hal: Math.max(1, Number(q.hal) || 1) };
    document.getElementById('main').innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Pesanan</h1><button class="btn sm" data-a="csv">' + ic('dl') + ' Ekspor CSV</button></div>' +
      '<div class="filters"><div class="wide"><label class="sr" for="fq">Cari</label><input id="fq" type="search" placeholder="Cari ID, nama, email, WhatsApp…" value="' + esc(cari.q) + '"></div>' +
      '<div><label class="sr" for="fs">Status</label><select id="fs"><option value="">Semua status</option>' + STATUS.map(function (s) { return '<option' + (s === cari.status ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') + '</select></div>' +
      '<div><label class="sr" for="fp">Paket</label><select id="fp"><option value="">Semua paket</option>' + ['basic', 'premium', 'special'].map(function (p) { return '<option value="' + p + '"' + (p === cari.paket ? ' selected' : '') + '>' + p.charAt(0).toUpperCase() + p.slice(1) + '</option>'; }).join('') + '</select></div></div>' +
      '<div id="daftar" aria-live="polite">' + skel() + '</div>';
    muatDaftar(my);
  }

  /* ---------------- Detail pesanan ---------------- */
  function kv(label, nilai) { return '<div><dt>' + esc(label) + '</dt><dd>' + (nilai === '' || nilai == null ? '<span class="muted">-</span>' : nilai) + '</dd></div>'; }
  function waLink(wa) { var n = String(wa).replace(/^0/, '62').replace(/\D/g, ''); return n.length > 6 ? '<a href="https://wa.me/' + esc(n) + '" target="_blank" rel="noopener noreferrer">' + esc(wa) + '</a>' : esc(wa); }

  function aksiDetail(d) {
    var o = d.pesanan, s = o.Status, b = [], hidup = ['Aktif', 'Selesai', 'Diproses'].indexOf(s) >= 0, dihapus = !!o.TglDihapus;
    if (o.PaketID === 'special' && s === 'Diproses') b.push('<button class="btn primary" data-a="special">' + ic('check') + ' Tandai selesai &amp; aktifkan</button>');
    if (s === 'Perlu Ditinjau') b.push('<button class="btn primary" data-a="setujui">Setujui pembayaran</button><button class="btn danger" data-a="tolak">Tolak</button>');
    if (hidup || (s === 'Kedaluwarsa' && !dihapus && o.SlugLink)) b.push('<button class="btn" data-a="perpanjang">' + (s === 'Kedaluwarsa' ? 'Aktifkan lagi' : 'Perpanjang') + '</button>');
    if (hidup) b.push('<button class="btn danger" data-a="nonaktif">Nonaktifkan link</button>');
    if (['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Perlu Ditinjau'].indexOf(s) >= 0) b.push('<button class="btn danger" data-a="batalkan">Batalkan pesanan</button>');
    if (d.akun || o.NamaPembeli) b.push('<button class="btn" data-a="kirim">Kirim ulang email</button>');
    return '<div class="actions">' + b.join('') + '</div>';
  }

  function isiDetail(d) {
    var o = d.pesanan, id = encodeURIComponent(o.OrderID), dihapus = !!o.TglDihapus;
    var media = d.media.filter(function (m) { return m.status === 'ada'; }).map(function (m) {
      var thumb = m.jenis === 'foto' ? '<img loading="lazy" referrerpolicy="no-referrer" alt="Foto ' + (m.urutan + 1) + '" src="https://drive.google.com/thumbnail?id=' + encodeURIComponent(m.driveId) + '&sz=w300">' : ic('play');
      return '<figure class="m-item"><div class="m-th">' + thumb + '</div><figcaption class="m-meta"><span class="strong">' + (m.jenis === 'foto' ? 'Foto ' : 'Video ') + (m.urutan + 1) + '</span><span class="muted">' + (m.ukuran / 1048576).toFixed(2) + ' MB</span>' +
        '<span><a href="https://drive.google.com/file/d/' + encodeURIComponent(m.driveId) + '/view" target="_blank" rel="noopener noreferrer">Buka</a> · <a href="https://drive.google.com/uc?export=download&amp;id=' + encodeURIComponent(m.driveId) + '" target="_blank" rel="noopener noreferrer">Unduh</a></span></figcaption></figure>';
    }).join('');
    var rev = d.revisi.map(function (r) { return '<li class="card" style="box-shadow:none"><div>' + badge(r.status) + ' <span class="small muted">' + esc(tglJam(r.tglMinta)) + '</span></div><p style="margin-top:.35rem;white-space:pre-wrap;overflow-wrap:anywhere">' + esc(r.catatan) + '</p></li>'; }).join('');
    return '<div class="page-h"><div><h1 tabindex="-1" id="h1">' + esc(o.OrderID) + '</h1><p class="muted small">Paket ' + esc(d.paket) + ' · dipesan ' + esc(tglJam(o.TglOrder)) + '</p></div>' + badge(o.Status) + '</div>' +
      (o.Status === 'Perlu Ditinjau' ? '<p class="banner bad" role="alert">' + ic('alert') + '<span>Pembayaran perlu ditinjau (nominal tidak cocok atau dibayar setelah dibatalkan). Cek catatan pembayaran di bawah.</span></p>' : '') +
      '<div class="card"><h2>Tindakan</h2>' + aksiDetail(d) + '</div>' +
      '<div class="grid two" style="margin-top:1rem"><div class="card"><h2>Pembeli</h2><dl class="kv">' + kv('Nama', esc(o.NamaPembeli)) + kv('WhatsApp', waLink(o.WhatsApp)) + kv('Email', '<a href="mailto:' + esc(o.Email) + '">' + esc(o.Email) + '</a>') +
      kv('Kode redeem', d.akun ? '<span class="mono">' + esc(d.akun.kodeRedeem) + '</span> ' + (d.akun.punyaPassword ? '<span class="badge ok">Password dibuat</span>' : '<span class="badge warn">Belum dipakai</span>') + ' <span class="badge">' + esc(d.akun.status) + '</span>' : '') + kv('Akun lama', o.AkunTertaut === 'ya' ? 'Ya (ditautkan)' : 'Tidak') + '</dl></div>' +
      '<div class="card"><h2>Ucapan</h2><dl class="kv">' + kv('Tautan', o.LinkHasil ? '<a href="' + esc(o.LinkHasil) + '" target="_blank" rel="noopener noreferrer">' + esc(o.LinkHasil) + '</a>' : '') + kv('Aktif', o.TglAktif ? esc(tglJam(o.TglAktif)) : '') + kv('Berakhir', o.TglKedaluwarsa ? esc(tglJam(o.TglKedaluwarsa)) : '') + kv('Berkas dihapus', dihapus ? esc(tglJam(o.TglDihapus)) : '') + '</dl></div></div>' +
      '<div class="card" style="margin-top:1rem"><h2>Isi ucapan</h2>' + (dihapus ? '<p class="muted">Isi pesan sudah dihapus otomatis setelah masa tenggang.</p>' : '<dl class="kv">' +
      kv('Untuk', esc(o.NamaPenerima)) + kv('Dari', o.TipeDari === 'anonim' ? 'Anonim' : esc(o.TipeDari + ': ' + o.NilaiDari)) + kv('Pesan', esc(o.Pesan)) + kv('Pesan personal', esc(o.PesanPersonal)) +
      kv('Desain', d.desainNama ? esc(d.desainNama) : (o.IdeSendiri ? 'Ide sendiri: ' + esc(o.IdeSendiri) : '')) + kv('Musik', esc(o.MusikID)) + kv('Surprise', esc(o.JenisSurprise)) + kv('Pesan rahasia', esc(o.PesanRahasia) + (o.punyaPasswordRahasia ? ' <span class="badge">berpassword</span>' : '')) +
      kv('Catatan pembeli', esc(o.CatatanKhusus)) + '</dl>') + '</div>' +
      '<div class="card" style="margin-top:1rem"><h2>Foto &amp; video</h2>' + (media ? '<div class="media-grid">' + media + '</div>' : '<p class="muted">Tidak ada berkas' + (dihapus ? ' (sudah dihapus).' : '.') + '</p>') +
      (d.folderId ? '<p style="margin-top:.75rem"><a class="btn sm" href="https://drive.google.com/drive/folders/' + encodeURIComponent(d.folderId) + '" target="_blank" rel="noopener noreferrer">' + ic('ext') + ' Buka folder di Drive</a></p>' : '') + '</div>' +
      '<div class="grid two" style="margin-top:1rem"><div class="card"><h2>Pembayaran</h2>' + (d.pembayaran.length ? '<div class="tbl-wrap"><table><thead><tr><th>Status</th><th>Nominal</th><th>Metode</th><th>Catatan</th></tr></thead><tbody>' + d.pembayaran.map(function (p) {
        return '<tr><td>' + badge(p.status) + '<div class="small muted">' + esc(p.mode) + '</div></td><td>' + rp(p.nominal) + '</td><td>' + esc(p.metode || '-') + '</td><td class="small">' + esc(p.catatan || '-') + (p.trxId ? '<div class="muted">trx ' + esc(p.trxId) + '</div>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">Belum ada.</p>') + '</div>' +
      '<div class="card"><h2>Revisi</h2>' + (rev ? '<ul class="stack">' + rev + '</ul>' : '<p class="muted">Tidak ada.</p>') + '</div></div>' +
      '<div class="card" style="margin-top:1rem"><h2>Catatan internal</h2><div class="field"><label class="sr" for="cat">Catatan internal</label><textarea id="cat" maxlength="1050" rows="3">' + esc(o.CatatanAdmin) + '</textarea></div><button class="btn sm" data-a="catatan">Simpan catatan</button></div>' +
      '<div class="grid two" style="margin-top:1rem"><div class="card"><h2>Email terkirim</h2>' + (d.email.length ? '<ul class="tl-log">' + d.email.map(function (e) { return '<li><span class="muted">' + esc(tglJam(e.waktu)) + '</span><span>' + esc(e.jenis) + ' · ' + esc(e.status) + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">Belum ada.</p>') + '</div>' +
      '<div class="card"><h2>Riwayat aktivitas</h2>' + (d.audit.length ? '<ul class="tl-log">' + d.audit.map(function (a) { return '<li><span class="muted">' + esc(tglJam(a.waktu)) + '</span><span>' + esc(a.aktor) + ': ' + esc(a.aksi) + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">Belum ada.</p>') + '</div></div>';
  }

  var detailSaatIni = null;
  async function viewDetail(my, q) {
    var main = document.getElementById('main'); main.innerHTML = skel();
    var r = await call('adminOrderDetail', { orderId: q.o || '' }); if (my !== run) return;
    if (!r.success) { main.innerHTML = '<div class="card"><p class="err" role="alert">' + esc(r.message) + '</p><a class="btn sm" href="#/pesanan" style="margin-top:.75rem">Kembali</a></div>'; return; }
    detailSaatIni = r.data; main.innerHTML = '<p class="small" style="margin-bottom:.75rem"><a href="#/pesanan">← Daftar pesanan</a></p><div id="detailIsi">' + isiDetail(r.data) + '</div>';
  }
  async function aksiPesanan(a) {
    var d = detailSaatIni, id = d.pesanan.OrderID, hasil = null, v;
    function ok(m) { toast(m); }
    if (a === 'special') {
      v = await tanya({ judul: 'Aktifkan ucapan Special', teks: 'Link ucapan dibuat, foto dibuka untuk yang punya link, masa aktif mulai dihitung, dan email "Ucapanmu sudah jadi" dikirim ke pembeli.',
        fields: [{ name: 'linkKustom', label: 'Alamat halaman kustom (opsional)', type: 'url', hint: 'Isi bila Ibu membuat halaman sendiri, mis. https://dearora.vercel.app/special/xyz. Kosong = halaman kartu standar.' }], ya: 'Aktifkan' });
      if (!v) return; hasil = await call('adminSpecialAktif', { orderId: id, linkKustom: v.linkKustom });
    } else if (a === 'setujui' || a === 'tolak') {
      v = await tanya({ judul: a === 'setujui' ? 'Setujui pembayaran?' : 'Tolak & batalkan pesanan?', teks: a === 'setujui' ? 'Pembayaran dianggap lunas. Akun, kode redeem, dan aktivasi berjalan seperti biasa.' : 'Pesanan dibatalkan. Pengembalian dana (jika perlu) dilakukan manual di dashboard iPaymu.', ya: a === 'setujui' ? 'Setujui' : 'Tolak', bahaya: a === 'tolak' });
      if (!v) return; hasil = await call('adminTinjau', { orderId: id, keputusan: a });
    } else if (a === 'batalkan' || a === 'nonaktif') {
      v = await tanya({ judul: a === 'batalkan' ? 'Batalkan pesanan' : 'Nonaktifkan link ucapan', teks: a === 'nonaktif' ? 'Link langsung tidak bisa dibuka dan akses foto dicabut.' : '', fields: [{ name: 'alasan', label: 'Alasan (dicatat)', type: 'textarea', wajib: true }], ya: a === 'batalkan' ? 'Batalkan' : 'Nonaktifkan', bahaya: true });
      if (!v) return; hasil = await call(a === 'batalkan' ? 'adminBatalkan' : 'adminNonaktifkan', { orderId: id, alasan: v.alasan });
    } else if (a === 'perpanjang') {
      v = await tanya({ judul: d.pesanan.Status === 'Kedaluwarsa' ? 'Aktifkan lagi' : 'Perpanjang masa aktif', fields: [{ name: 'hari', label: 'Tambah berapa hari?', type: 'number', min: 1, max: 365, value: '30', wajib: true }], ya: 'Simpan' });
      if (!v) return; hasil = await call('adminPerpanjang', { orderId: id, hari: Number(v.hari) });
    } else if (a === 'kirim') {
      v = await tanya({ judul: 'Kirim ulang email', fields: [{ name: 'jenis', label: 'Jenis email', type: 'select', opsi: [['tanda-terima', 'Tanda terima (+ kode redeem)'], ['ucapan-jadi', 'Ucapan sudah jadi (link)']] }], ya: 'Kirim' });
      if (!v) return; hasil = await call('adminKirimUlang', { orderId: id, jenis: v.jenis });
    } else if (a === 'catatan') {
      hasil = await call('adminCatatan', { orderId: id, catatan: document.getElementById('cat').value });
      toast(hasil.success ? 'Catatan disimpan' : hasil.message); return;
    }
    if (!hasil) return;
    if (!hasil.success) { toast(hasil.message || 'Gagal'); return; }
    detailSaatIni = hasil.data; document.getElementById('detailIsi').innerHTML = isiDetail(hasil.data); ok('Berhasil'); var h = document.getElementById('h1'); if (h) h.focus();
  }

  /* ---------------- Laporan ---------------- */
  async function viewLaporan(my) {
    var main = document.getElementById('main'); main.innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Laporan</h1></div>' + skel();
    var r = await call('adminLaporan'); if (my !== run) return;
    if (!r.success) { main.innerHTML = galatBox(r.message); return; }
    var d = r.data, maksD = Math.max.apply(null, d.desainTerlaris.map(function (x) { return x.jumlah; }).concat([1])), maksM = Math.max.apply(null, d.metode.map(function (x) { return x.jumlah; }).concat([1]));
    var hb = function (arr, mx) { return arr.length ? '<ul class="hbar">' + arr.map(function (x) { return '<li><span>' + esc(x.nama) + '</span><span class="tr"><span style="width:' + Math.round(x.jumlah / mx * 100) + '%"></span></span><strong>' + x.jumlah + '</strong></li>'; }).join('') + '</ul>' : '<p class="muted">Belum ada data.</p>'; };
    main.innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Laporan</h1></div>' +
      '<div class="card"><h2>Pendapatan per bulan</h2>' + (d.perBulan.length ? barChart(d.perBulan, 'pendapatan', function (x, s) { return x.bulan; }, 'Pendapatan per bulan') : '<p class="muted">Belum ada pembayaran.</p>') + '</div>' +
      '<div class="grid two" style="margin-top:1rem"><div class="card"><h2>Per paket</h2>' + (d.perPaket.length ? '<div class="tbl-wrap"><table><thead><tr><th>Paket</th><th>Jumlah</th><th>Pendapatan</th></tr></thead><tbody>' + d.perPaket.map(function (p) { return '<tr><td>' + esc(p.paket) + '</td><td>' + p.jumlah + '</td><td>' + rp(p.pendapatan) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">Belum ada data.</p>') + '</div>' +
      '<div class="card"><h2>Metode pembayaran</h2>' + hb(d.metode, maksM) + '</div></div>' +
      '<div class="card" style="margin-top:1rem"><h2>Desain terlaris</h2>' + hb(d.desainTerlaris, maksD) + '</div>';
  }

  /* ---------------- Pengaturan ---------------- */
  function errF(errors, k) { return errors && errors[k] ? '<p class="err" role="alert">' + esc(errors[k]) + '</p>' : ''; }
  function parseFitur(js) { try { var f = JSON.parse(js); return f && typeof f === 'object' ? f : { fitur: [] }; } catch (e) { return { fitur: [] }; } }

  function formPaket(p, errors) {
    var F = parseFitur(p.fiturJson), baris = (F.fitur || []).map(function (x) { return (x.ok ? '+ ' : '- ') + x.t; }).join('\n');
    return '<form class="cfg-item" data-form="paket" data-id="' + esc(p.id) + '" novalidate><h2>' + esc(p.nama) + ' <span class="muted small">(' + esc(p.id) + ')</span></h2>' +
      '<div class="row-2"><div class="field"><label>Nama paket</label><input name="nama" type="text" value="' + esc(p.nama) + '" maxlength="30">' + errF(errors, 'nama') + '</div>' +
      '<div class="field"><label>Harga (Rp)</label><input name="harga" type="number" inputmode="numeric" min="1000" max="10000000" value="' + esc(p.harga) + '">' + errF(errors, 'harga') + '<p class="hint">Berlaku untuk pesanan BARU. Pesanan lama tidak berubah.</p></div>' +
      '<div class="field"><label>Masa aktif (hari)</label><input name="masaAktifHari" type="number" inputmode="numeric" min="1" max="3650" value="' + esc(p.masaAktifHari) + '">' + errF(errors, 'masaAktifHari') + '</div>' +
      '<div class="field"><label>Maks. foto</label><input name="maksFoto" type="number" inputmode="numeric" min="1" max="60" value="' + esc(p.maksFoto) + '">' + errF(errors, 'maksFoto') + '</div></div>' +
      '<div class="field"><label>Tagline</label><input name="tagline" type="text" value="' + esc(F.tagline || '') + '" maxlength="140"></div>' +
      '<div class="row-2"><div class="field"><label>Teks jumlah foto</label><input name="foto" type="text" value="' + esc(F.foto || '') + '" maxlength="60"></div><div class="field"><label>Teks pembuatan</label><input name="pembuatan" type="text" value="' + esc(F.pembuatan || '') + '" maxlength="80"></div></div>' +
      '<div class="row-2"><div class="field"><label>Label sorotan (opsional)</label><input name="badge" type="text" value="' + esc(F.badge || '') + '" maxlength="30"></div><div class="field"><label class="chk"><input name="rekomendasi" type="checkbox"' + (F.rekomendasi ? ' checked' : '') + '> Tampilkan sebagai paket sorotan</label></div></div>' +
      '<div class="field"><label>Daftar fitur</label><textarea name="fiturBaris" rows="7" spellcheck="false">' + esc(baris) + '</textarea><p class="hint">Satu fitur per baris. Awali dengan <strong>+</strong> (termasuk) atau <strong>-</strong> (tidak termasuk). Contoh: <span class="mono">+ Musik latar</span></p>' + errF(errors, 'fiturJson') + '</div>' +
      '<label class="chk"><input name="aktif" type="checkbox"' + (p.aktif ? ' checked' : '') + '> Paket aktif (tampil di toko)</label><div class="actions" style="margin-top:.5rem"><button class="btn primary sm" type="submit">Simpan ' + esc(p.nama) + '</button></div></form>';
  }
  function formDesain(x, data, errors) {
    var baru = !x.id, sel = String(x.paket || '').split(',').map(function (s) { return s.trim(); }), th = String(x.thumbnail || 'tema:blossom'), pakaiTema = /^tema:/.test(th);
    return '<form class="cfg-item" data-form="desain" data-id="' + esc(x.id || '') + '" novalidate><h2>' + (baru ? 'Tambah desain baru' : esc(x.nama) + ' <span class="muted small">(' + esc(x.id) + ')</span>') + '</h2>' +
      '<div class="row-2"><div class="field"><label>Nama</label><input name="nama" type="text" value="' + esc(x.nama || '') + '" maxlength="60">' + errF(errors, 'nama') + '</div>' +
      '<div class="field"><label>Kategori</label><select name="kategori">' + data.kategori.map(function (k) { return '<option' + (k === x.kategori ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select>' + errF(errors, 'kategori') + '</div></div>' +
      '<fieldset class="field" style="border:0;padding:0;margin:0 0 .875rem"><legend>Tersedia di paket</legend><div class="actions">' + data.paket.map(function (p) { return '<label class="chk"><input type="checkbox" name="paket" value="' + esc(p.id) + '"' + (sel.indexOf(p.id) >= 0 ? ' checked' : '') + '> ' + esc(p.nama) + '</label>'; }).join('') + '</div>' + errF(errors, 'paket') + '</fieldset>' +
      '<div class="row-2"><div class="field"><label>Tema bawaan</label><select name="tema">' + data.tema.map(function (t) { return '<option' + (pakaiTema && th === 'tema:' + t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>atau URL gambar (https)</label><input name="thumbUrl" type="url" value="' + (pakaiTema ? '' : esc(th)) + '" placeholder="https://…">' + errF(errors, 'thumbnail') + '<p class="hint">Jika URL diisi, URL yang dipakai.</p></div></div>' +
      '<div class="field"><label>URL demo lengkap (opsional)</label><input name="urlDemo" type="url" value="' + esc(x.urlDemo || '') + '" placeholder="https://…">' + errF(errors, 'urlDemo') + '</div>' +
      '<label class="chk"><input name="aktif" type="checkbox"' + (x.aktif !== false ? ' checked' : '') + '> Tampil di toko</label><div class="actions" style="margin-top:.5rem"><button class="btn primary sm" type="submit">' + (baru ? 'Tambah' : 'Simpan') + '</button></div></form>';
  }
  function formMusik(m, errors) {
    var baru = !m.id;
    return '<form class="cfg-item" data-form="musik" data-id="' + esc(m.id || '') + '" novalidate><h2>' + (baru ? 'Tambah musik' : esc(m.judul) + ' <span class="muted small">(' + esc(m.id) + ')</span>') + '</h2>' +
      '<div class="row-2"><div class="field"><label>Judul</label><input name="judul" type="text" value="' + esc(m.judul || '') + '" maxlength="80">' + errF(errors, 'judul') + '</div>' +
      '<div class="field"><label>Berkas</label><input name="fileUrl" type="text" value="' + esc(m.fileUrl || '') + '" placeholder="assets/musik/nama.mp3">' + errF(errors, 'fileUrl') + '<p class="hint">Unggah mp3 berlisensi ke folder <span class="mono">assets/musik/</span> di proyek, lalu tulis jalurnya di sini.</p></div></div>' +
      '<label class="chk"><input name="aktif" type="checkbox"' + (m.aktif ? ' checked' : '') + '> Tampil sebagai pilihan musik</label><div class="actions" style="margin-top:.5rem"><button class="btn primary sm" type="submit">' + (baru ? 'Tambah' : 'Simpan') + '</button></div></form>';
  }
  function formConfig(c, errors) {
    return '<form class="cfg-item" data-form="config" data-id="' + esc(c.key) + '" novalidate><div class="field"><label for="c-' + esc(c.key) + '">' + esc(c.label) + '</label><input id="c-' + esc(c.key) + '" name="value" type="text" value="' + esc(c.value) + '">' + errF(errors, c.key) + '</div><button class="btn primary sm" type="submit">Simpan</button></form>';
  }
  function tabPengaturan(tab, data, errors, idGalat) {
    var e = function (id) { return id === idGalat ? errors : null; };
    if (tab === 'desain') return formDesain({}, data, e('baru-desain')) + data.desain.map(function (x) { return formDesain(x, data, e(x.id)); }).join('');
    if (tab === 'musik') return formMusik({}, e('baru-musik')) + (data.musik.length ? '' : '<p class="muted">Belum ada musik. Daftar pilihan musik di form pesanan baru muncul setelah ada yang aktif.</p>') + data.musik.map(function (m) { return formMusik(m, e(m.id)); }).join('');
    if (tab === 'umum') return data.config.map(function (c) { return formConfig(c, e(c.key)); }).join('');
    if (tab === 'keamanan') return '<div class="card"><h2>Mengganti password admin</h2><ol class="stack small" style="list-style:decimal;padding-left:1.25rem"><li>Buka Apps Script → ⚙ Setelan Proyek → Properti skrip.</li><li>Tambahkan <span class="mono">ADMIN_PASSWORD_BARU</span> berisi password baru (minimal 12 karakter).</li><li>Jalankan fungsi <span class="mono">aturPasswordAdmin</span>. Properti tadi dihapus otomatis dan semua sesi admin dicabut.</li></ol></div>' +
      '<div class="card"><h2>Hal yang sebaiknya dijaga</h2><ul class="stack small" style="list-style:disc;padding-left:1.25rem"><li>Jangan bagikan layar yang memuat <span class="mono">WEBHOOK_TOKEN</span> atau API Key iPaymu.</li><li>Ubah <span class="mono">PAYMENT_MODE</span> ke production hanya saat siap rilis (jalankan <span class="mono">cekKesiapanRilis</span>).</li><li>Spreadsheet Dearora_DB berisi data pribadi pembeli. Jangan dibagikan.</li></ul></div>';
    return data.paket.map(function (p) { return formPaket(p, e(p.id)); }).join('');
  }
  async function viewPengaturan(my, q) {
    var main = document.getElementById('main'), tab = ['paket', 'desain', 'musik', 'umum', 'keamanan'].indexOf(q.tab) >= 0 ? q.tab : 'paket';
    main.innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Pengaturan</h1></div>' + skel();
    var r = await call('adminPengaturan'); if (my !== run) return;
    if (!r.success) { main.innerHTML = galatBox(r.message); return; }
    pengaturan = r.data;
    var tabs = [['paket', 'Paket & harga'], ['desain', 'Desain'], ['musik', 'Musik'], ['umum', 'Umum'], ['keamanan', 'Keamanan']];
    main.innerHTML = '<div class="page-h"><h1 tabindex="-1" id="h1">Pengaturan</h1></div><nav class="tabs" aria-label="Bagian pengaturan">' + tabs.map(function (t) { return '<a href="#/pengaturan?tab=' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join('') + '</nav>' +
      '<p class="small muted" style="margin-bottom:1rem">Perubahan langsung tampil di toko (cache dibersihkan otomatis).</p><div id="tabIsi" data-tab="' + tab + '">' + tabPengaturan(tab, pengaturan) + '</div>';
  }
  function ambilNilaiForm(form) {
    var v = {}; form.querySelectorAll('input,select,textarea').forEach(function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') { if (el.name === 'paket') { v.paket = (v.paket ? v.paket + ',' : '') + (el.checked ? el.value : ''); } else v[el.name] = el.checked; }
      else v[el.name] = el.value;
    });
    if (v.paket) v.paket = v.paket.split(',').filter(Boolean).join(',');
    return v;
  }
  async function kirimForm(form) {
    var jenis = form.dataset.form, id = form.dataset.id, v = ambilNilaiForm(form), aksi, data = {}, idGalat = id;
    var tombol = form.querySelector('[type=submit]'); tombol.disabled = true;
    try {
      if (jenis === 'paket') {
        var F = parseFitur((pengaturan.paket.filter(function (p) { return p.id === id; })[0] || {}).fiturJson), baris = String(v.fiturBaris || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean), fitur = [], salah = false;
        baris.forEach(function (b) { var c = b.charAt(0); if (c !== '+' && c !== '-') { salah = true; return; } fitur.push({ t: b.slice(1).trim(), ok: c === '+' }); });
        if (salah) { toast('Setiap baris fitur harus diawali + atau -'); tombol.disabled = false; return; }
        F.fitur = fitur; F.tagline = v.tagline; F.foto = v.foto; F.pembuatan = v.pembuatan; F.rekomendasi = !!v.rekomendasi;
        if (v.badge) F.badge = v.badge; else delete F.badge; if (!F.rekomendasi) delete F.rekomendasi;
        aksi = 'adminSimpanPaket'; data = { id: id, nama: v.nama, harga: v.harga, masaAktifHari: v.masaAktifHari, maksFoto: v.maksFoto, fiturJson: JSON.stringify(F), aktif: !!v.aktif };
      } else if (jenis === 'desain') {
        aksi = 'adminSimpanDesain'; idGalat = id || 'baru-desain';
        data = { id: id, nama: v.nama, kategori: v.kategori, paket: v.paket || '', thumbnail: v.thumbUrl ? v.thumbUrl : 'tema:' + v.tema, urlDemo: v.urlDemo, aktif: !!v.aktif };
      } else if (jenis === 'musik') { aksi = 'adminSimpanMusik'; idGalat = id || 'baru-musik'; data = { id: id, judul: v.judul, fileUrl: v.fileUrl, aktif: !!v.aktif }; }
      else { aksi = 'adminSimpanConfig'; data = { key: id, value: v.value }; }
      var r = await call(aksi, data);
      var tab = document.getElementById('tabIsi').dataset.tab;
      if (!r.success) {
        var galat = r.errors || (jenis === 'config' ? { [id]: r.message } : null);
        if (galat) { var y = window.scrollY; document.getElementById('tabIsi').innerHTML = tabPengaturan(tab, pengaturan, galat, idGalat); window.scrollTo(0, y); }
        toast(r.message || 'Periksa isian'); return;
      }
      pengaturan = r.data; var y2 = window.scrollY; document.getElementById('tabIsi').innerHTML = tabPengaturan(tab, pengaturan); window.scrollTo(0, y2); toast('Tersimpan');
    } catch (e) { if (e.message !== 'sesi') toast('Koneksi bermasalah'); }
    finally { var t2 = document.querySelector('[type=submit][disabled]'); if (t2) t2.disabled = false; }
  }

  /* ---------------- Router & event ---------------- */
  async function render() {
    if (!token) { tampilLogin(); return; }
    if (!shellAda) bangunShell();
    var my = ++run, h = parseHash();
    tandaiNav(h.rute);
    var main = document.getElementById('main');
    try {
      if (h.rute === '') await viewDashboard(my);
      else if (h.rute === 'pesanan') viewPesanan(my, h.q);
      else if (h.rute === 'detail') await viewDetail(my, h.q);
      else if (h.rute === 'laporan') await viewLaporan(my);
      else if (h.rute === 'pengaturan') await viewPengaturan(my, h.q);
      else main.innerHTML = '<div class="card empty">Halaman tidak ditemukan. <a href="#/">Kembali</a></div>';
    } catch (e) { if (e.message !== 'sesi') main.innerHTML = galatBox('Koneksi bermasalah. Coba lagi.'); }
    if (my === run) { var h1 = document.getElementById('h1'); if (h1 && h.rute !== 'pesanan') h1.focus({ preventScroll: true }); if (h.rute !== 'pesanan') window.scrollTo(0, 0); }
  }

  document.addEventListener('click', async function (ev) {
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var a = b.dataset.a;
    if (a === 'tema') { setTema(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); return; }
    if (a === 'keluar') { try { await API.post('adminLogout', {}, { token: token, timeout: 8000 }); } catch (e) { /* tetap keluar */ } simpanToken(''); shellAda = false; location.hash = '#/'; tampilLogin(); return; }
    if (a === 'muat-ulang') { render(); return; }
    if (a === 'hal-' || a === 'hal+') { cari.hal = Math.max(1, cari.hal + (a === 'hal+' ? 1 : -1)); simpanCariKeUrl(); muatDaftar(run); window.scrollTo(0, 0); return; }
    if (a === 'csv') {
      b.disabled = true;
      try { var r = await call('adminExportCsv', { status: cari.status, paket: cari.paket }); if (r.success) { unduh(r.data.nama, r.data.csv); toast(r.data.jumlah + ' baris diekspor'); } else toast(r.message); }
      catch (e) { /* sesi berakhir ditangani call */ }
      b.disabled = false; return;
    }
    if (detailSaatIni && document.getElementById('detailIsi') && ['special', 'setujui', 'tolak', 'batalkan', 'nonaktif', 'perpanjang', 'kirim', 'catatan'].indexOf(a) >= 0) {
      b.disabled = true; try { await aksiPesanan(a); } catch (e) { if (e.message !== 'sesi') toast('Koneksi bermasalah'); } b.disabled = false;
    }
  });
  document.addEventListener('input', function (ev) {
    if (!['fq'].includes(ev.target.id)) return;
    clearTimeout(tm); tm = setTimeout(function () { cari.q = ev.target.value.trim(); cari.hal = 1; simpanCariKeUrl(); muatDaftar(run); }, 350);
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.id === 'fs') { cari.status = ev.target.value; cari.hal = 1; simpanCariKeUrl(); muatDaftar(run); }
    if (ev.target.id === 'fp') { cari.paket = ev.target.value; cari.hal = 1; simpanCariKeUrl(); muatDaftar(run); }
  });
  document.addEventListener('submit', function (ev) { var f = ev.target.closest('form[data-form]'); if (f) { ev.preventDefault(); kirimForm(f); } });
  window.addEventListener('hashchange', function () { if (token) render(); });

  function mulai() {
    token = bacaToken();
    if (!API.siap()) { app.innerHTML = '<div class="login"><div class="card"><h1>Belum terhubung</h1><p class="muted">Isi <span class="mono">GAS_URL</span> di <span class="mono">js/config.js</span> terlebih dahulu.</p></div></div>'; return; }
    render();
  }
  mulai();
})();
