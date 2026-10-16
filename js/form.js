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
    pesan: { basic: 300, premium: 600, special: 1200 }, personal: 600, ide: 1000, ideSpecial: 2500, rahasia: 1000, catatan: 500,
    fotoKB: 1400, bagian: 1572864, videoMB: 25
  };
  var ID_LANGKAH = { namaPembeli: 'pemesan', whatsapp: 'pemesan', email: 'pemesan', penerima: 'untuk', tipeDari: 'untuk', nilaiDari: 'untuk',
    pesan: 'pesan', pesanPersonal: 'pesan', desain: 'desain', musikId: 'ekstra', jenisSurprise: 'ekstra', pesanRahasia: 'ekstra',
    passwordRahasia: 'ekstra', pembuka: 'ekstra', catatan: 'catatan', setuju: 'ringkasan', paketId: 'paket', kejutanJenis: 'kejutan', kejutanUcapan: 'kejutan', kejutanDetail: 'kejutan', dataDesain: 'isi', ideSendiri: 'ide', urlDiminta: 'ide' };
  var JUDUL = { paket: 'Paket', pemesan: 'Data Pemesan', untuk: 'Untuk Siapa', pesan: 'Surat', kejutan: 'Kejutan Akhir', foto: 'Foto', desain: 'Desain', isi: 'Isi Desain', ide: 'Ide Desain', ekstra: 'Musik', catatan: 'Catatan', ringkasan: 'Ringkasan' };

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

  var JENIS_KEJUTAN = [
    { id: 'kado', nama: 'Kotak Kado', ikon: 'gift', desk: 'Kotak kado berpita. Penerima mengetuknya, lalu ucapan dan fotomu muncul.' },
    { id: 'kuis', nama: 'Kuis Kecil', ikon: 'help', desk: 'Penerima menjawab pertanyaan darimu, lalu mendapat respons lucu atau manis.' },
    { id: 'gosok', nama: 'Gosok untuk Melihat', ikon: 'eraser', desk: 'Penerima menggosok layar untuk menyingkap pesan tersembunyi.' },
    { id: 'pilihan', nama: 'Pilih Ceritamu', ikon: 'menu', desk: 'Beberapa tombol, tiap pilihan membuka bagian cerita yang berbeda.' },
    { id: 'kode', nama: 'Kode Rahasia', ikon: 'lock', desk: 'Pesan terkunci. Penerima memasukkan kode buatanmu (tanggal penting atau kata rahasia).' },
    { id: 'harapan', nama: 'Tiup Lilin', ikon: 'cake', desk: 'Kue ulang tahun digital. Penerima meniup lilin, lalu ucapan dan perayaan muncul.' },
    { id: 'taman', nama: 'Taman Bunga', ikon: 'flower', desk: 'Taman kosong. Setiap bunga yang diketuk tumbuh dan membuka pesan; semua mekar memunculkan ucapan utama.' },
    { id: 'cinta', nama: 'Seberapa Besar Cintaku', ikon: 'heart', desk: 'Hati yang diketuk berkali-kali, makin besar, sampai ucapan utama muncul.' }
  ];
  function soalBaru() { return { q: '', opsi: ['', '', ''], benar: 0, rb: '', rs: '' }; }
  function kejutanBaru() {
    return { jenis: 'kado', ucapan: '', judul: '', soal: [soalBaru()], petunjuk: '', pilihan: [{ label: '', teks: '' }, { label: '', teks: '' }, { label: '', teks: '' }],
      kode: '', petunjukKode: '', lilin: 3, bunga: ['', '', ''], target: 10, kalimat: ['', '', ''] };
  }
  function setPath(o, path, val) { var p = path.split('.'), c = o; for (var i = 0; i < p.length - 1; i++) { if (c[p[i]] == null) return; c = c[p[i]]; } c[p[p.length - 1]] = val; }
  function templatPaket() { return ST.paket === 'basic' || ST.paket === 'premium'; }

  function baru() {
    return { kejutan: kejutanBaru(), opsiDesain: {}, dataDesain: {}, _skKunci: '', urlDiminta: '', paket: '', namaPembeli: '', whatsapp: '', email: '', penerima: '', tipeDari: 'nama', nilaiDari: '', pesan: '', pesanPersonal: '',
      mode: 'pilih', desainId: '', ideSendiri: '', musikId: '', jenisSurprise: '', pesanRahasia: '', passwordRahasia: '', pembuka: 'judul',
      catatan: '', setuju: false, _langkah: 0, _id: '', _berkas: [] };
  }
  /* ---------------- Draf: bisa banyak (riwayat ucapan yang sedang disusun) ---------------- */
  var KEY_DRAFS = 'dearora:drafts:v2', KEY_GRUP = 'dearora:grup';
  function bacaDrafs() {
    try { var j = JSON.parse(localStorage.getItem(KEY_DRAFS)); if (j && Array.isArray(j.items)) return j.items; } catch (e) { /* abaikan */ }
    try {                                                    // migrasi dari draf tunggal versi lama
      var o = JSON.parse(localStorage.getItem(KEY_DRAF));
      if (o && o.v === 1 && o.s) { var it = [{ id: 'd' + Date.now().toString(36), tgl: Date.now(), s: o.s }]; localStorage.setItem(KEY_DRAFS, JSON.stringify({ items: it })); localStorage.removeItem(KEY_DRAF); return it; }
    } catch (e) { /* abaikan */ }
    return [];
  }
  function tulisDrafs(items) { try { localStorage.setItem(KEY_DRAFS, JSON.stringify({ items: items.slice(0, 12) })); } catch (e) { /* penuh/diblokir */ } }
  function pasangDraf(it) {
    ST = baru(); var j = { s: it.s || {} };
    Object.keys(ST).forEach(function (k) { if (k in j.s && ['passwordRahasia', 'setuju', 'kejutan', 'opsiDesain', 'dataDesain'].indexOf(k) < 0) ST[k] = j.s[k]; });
    if (j.s.kejutan && typeof j.s.kejutan === 'object') ST.kejutan = Object.assign(kejutanBaru(), j.s.kejutan);
    if (j.s.opsiDesain && typeof j.s.opsiDesain === 'object') ST.opsiDesain = j.s.opsiDesain;
    if (j.s.dataDesain && typeof j.s.dataDesain === 'object') ST.dataDesain = j.s.dataDesain;
    ST._id = it.id; langkah = Number(ST._langkah) || 0; ST._berkas = Array.isArray(j.s._berkas) ? j.s._berkas : [];
  }
  function muatDraf() {
    ST = baru();
    try { var it = bacaDrafs().sort(function (a, b) { return b.tgl - a.tgl; })[0]; if (it) { pasangDraf(it); muatBerkasDraf(); } } catch (e) { /* abaikan */ }
  }
  function tulisDraf() {
    if (!ST || !(ST.paket || ST.penerima || ST.namaPembeli)) return;
    try {
      if (!ST._id) ST._id = 'd' + Date.now().toString(36) + rand(3);
      var s = Object.assign({}, ST, { _langkah: langkah, _berkas: files.map(function (f) { return { id: f.id, jenis: f.jenis, nama: f.nama, ukuran: f.ukuran }; }), kejutan: Object.assign({}, ST.kejutan, { kode: '' }) }); delete s.passwordRahasia; delete s.setuju;
      var items = bacaDrafs().filter(function (x) { return x.id !== ST._id; }); items.unshift({ id: ST._id, tgl: Date.now(), s: s }); tulisDrafs(items);
    } catch (e) { /* abaikan */ }
  }
  /* ---- Foto & video draf disimpan di IndexedDB agar tidak perlu diunggah ulang ---- */
  var idb = null, idbSiap = null;
  function idbBuka() {
    if (idbSiap) return idbSiap;
    idbSiap = new Promise(function (res) {
      try { var rq = indexedDB.open('dearora-draf', 1); rq.onupgradeneeded = function () { rq.result.createObjectStore('foto'); }; rq.onsuccess = function () { idb = rq.result; res(idb); }; rq.onerror = rq.onblocked = function () { res(null); }; } catch (e) { res(null); }
    });
    return idbSiap;
  }
  function idbTx(mode, fn) {
    return idbBuka().then(function (d) {
      return new Promise(function (res) {
        if (!d) return res(null);
        try { var tx = d.transaction('foto', mode), r = fn(tx.objectStore('foto')); tx.oncomplete = function () { res(r && r.result !== undefined ? r.result : true); }; tx.onerror = tx.onabort = function () { res(null); }; } catch (e) { res(null); }
      });
    });
  }
  function pastikanId() { if (ST && !ST._id) ST._id = 'd' + Date.now().toString(36) + rand(3); }
  function idbSimpan(f) { pastikanId(); return idbTx('readwrite', function (st) { return st.put(f.blob, ST._id + ':' + f.id); }); }
  function idbHapus(fid) { return ST && ST._id ? idbTx('readwrite', function (st) { return st.delete(ST._id + ':' + fid); }) : Promise.resolve(null); }
  function idbHapusDraf(did) { return idbTx('readwrite', function (st) { var rq = st.openKeyCursor(); rq.onsuccess = function () { var c = rq.result; if (c) { if (String(c.key).indexOf(did + ':') === 0) st.delete(c.key); c.continue(); } }; return rq; }); }
  function muatBerkasDraf(tanpaPaint) {
    var did = ST && ST._id, meta = ((ST && ST._berkas) || []).slice(); if (!did || !meta.length) return Promise.resolve();
    return Promise.all(meta.map(function (m) {
      return idbTx('readonly', function (st) { return st.get(did + ':' + m.id); }).then(function (blob) { return blob && blob.size ? { id: m.id, jenis: m.jenis, blob: blob, nama: m.nama, ukuran: m.ukuran || blob.size, url: m.jenis === 'foto' ? URL.createObjectURL(blob) : '' } : null; });
    })).then(function (arr) { if (!ST || ST._id !== did) return; files = arr.filter(Boolean); if (!tanpaPaint) { if (order) order = null; if ($root) paint(); } });
  }
  function hapusDraf(id) {
    idbHapusDraf(id); tulisDrafs(bacaDrafs().filter(function (x) { return x.id !== id; })); }
  function judulDraf(it) {
    var s = it.s || {}, d = data(), ds = d && s.desainId ? (d.desain.filter(function (x) { return x.id === s.desainId; })[0] || {}).nama : '';
    var pk = d && s.paket ? (d.paket.filter(function (x) { return x.id === s.paket; })[0] || {}).nama : '';
    return (s.penerima ? 'Untuk ' + s.penerima : 'Draf tanpa nama penerima') + (pk ? ' · ' + pk : '') + (ds ? ' · ' + ds : '');
  }
  function hargaPaket(id) { var p = ((data() || {}).paket || []).filter(function (x) { return x.id === id; })[0]; return p ? Number(p.harga) || 0 : 0; }
  /** Memeriksa kelengkapan sebuah draf tanpa membukanya (foto dihitung dari catatan berkas yang tersimpan). */
  function cekDraf(it) {
    var sST = ST, sF = files, sL = langkah, sE = errors, sO = order, hasil;
    try {
      pasangDraf(it);
      files = (ST._berkas || []).map(function (m) { return { id: m.id, jenis: m.jenis, nama: m.nama, ukuran: m.ukuran || 1 }; });
      if (!ST.paket) hasil = { ok: false, alasan: 'Paket belum dipilih' };
      else {
        hasil = { ok: true, paket: ST.paket, harga: hargaPaket(ST.paket) };
        var semua = daftarLangkah().filter(function (x) { return x !== 'ringkasan'; });
        for (var i = 0; i < semua.length; i++) { if (Object.keys(validasi(semua[i])).length) { hasil = { ok: false, alasan: 'Belum lengkap: ' + judulLangkah(semua[i]) }; break; } }
      }
    } catch (x) { hasil = { ok: false, alasan: 'Draf belum bisa diperiksa' }; }
    ST = sST; files = sF; langkah = sL; errors = sE; order = sO;
    return hasil;
  }
  function panelDraf() {
    var items = bacaDrafs().sort(function (a, b) { return b.tgl - a.tgl; });
    if (!items.length || (langkah !== 0 && items.length < 2)) return '';
    ui.pilihDraf = ui.pilihDraf || {};
    var tglF = function (t) { try { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(t)); } catch (e) { return ''; } };
    var n = 0, total = 0, siap = 0;
    var baris = items.map(function (it) {
      var c = cekDraf(it), aktif = it.id === ST._id; if (c.ok) siap++;
      var pilih = c.ok && ui.pilihDraf[it.id]; if (!c.ok) delete ui.pilihDraf[it.id]; if (pilih) { n++; total += c.harga; }
      return '<li' + (aktif ? ' class="on"' : '') + '><label class="draf-cek"><input type="checkbox" id="cek-' + esc(it.id) + '" data-f="draf-pilih" data-id="' + esc(it.id) + '"' + (pilih ? ' checked' : '') + (c.ok ? '' : ' disabled') + ' aria-label="Pilih untuk dibayar: ' + esc(judulDraf(it)) + '"></label>' +
        '<div><strong>' + esc(judulDraf(it)) + '</strong><small>' + esc(tglF(it.tgl)) + (aktif ? ' · sedang dibuka' : '') + ' · ' + (c.ok ? '<span class="draf-siap">Siap dibayar · ' + esc(U.rupiah(c.harga)) + '</span>' : '<span class="draf-belum">' + esc(c.alasan) + '</span>') + '</small></div>' +
        (aktif ? '' : '<button type="button" class="btn btn-secondary btn-sm" data-f="draf-buka" data-id="' + esc(it.id) + '">Lanjutkan</button>') + '<button type="button" class="btn btn-quiet btn-sm" data-f="draf-hapus" data-id="' + esc(it.id) + '" aria-label="Hapus draf ' + esc(judulDraf(it)) + '">' + ic('x') + '</button></li>';
    }).join('');
    var kep = langkah === 0 ? ['<div class="card draf-panel">', '</div>', '<h2 class="h3">Draf Saya (' + items.length + ')</h2>'] : ['<details class="card draf-panel">', '</details>', '<summary><strong>Draf Saya (' + items.length + ')</strong></summary>'];
    return kep[0] + kep[2] + '<p class="small muted">Ucapan yang sedang kamu susun tersimpan otomatis di browser ini, <strong>termasuk foto dan videonya</strong>, jadi tidak perlu unggah ulang. Centang beberapa draf yang sudah lengkap untuk <strong>dibayar sekaligus</strong>.</p>' +
      (idb ? '' : '<p class="small err" role="alert">' + ic('info') + ' Browser ini tidak mengizinkan penyimpanan foto di perangkat. Foto draf mungkin perlu diunggah ulang.</p>') +
      '<ul class="draf-list">' + baris + '</ul>' +
      '<div class="draf-bar"><span id="drafTotal">' + (n ? n + ' dipilih · Total <strong>' + esc(U.rupiah(total)) + '</strong>' : 'Belum ada yang dipilih') + '</span><span class="draf-aksi">' +
      (siap > 1 ? '<button type="button" class="btn btn-quiet btn-sm" data-f="draf-semua">Pilih semua yang siap</button>' : '') +
      '<button type="button" class="btn btn-primary btn-sm" data-f="draf-bayar"' + (n ? '' : ' disabled') + '>' + (n > 1 ? 'Bayar ' + n + ' ucapan' : 'Bayar yang dipilih') + '</button></span></div>' +
      '<div class="draf-prog" id="drafProg" role="status" hidden></div>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-f="draf-baru" style="margin-top:.5rem">+ Mulai ucapan baru</button>' + kep[1];
  }
  function progDraf(teks, persen, galat) {
    var el = document.getElementById('drafProg'); if (!el) return; el.hidden = !teks && !galat;
    el.className = 'draf-prog' + (galat ? ' galat' : ''); el.innerHTML = galat ? '<p class="err">' + esc(galat) + '</p>' : '<p>' + esc(teks) + '</p><div class="bar"><span style="width:' + Math.max(2, Math.min(100, persen || 0)) + '%"></span></div>';
  }
  /** Membuat pesanan + mengunggah foto dari beberapa draf, lalu satu pembayaran untuk semuanya. */
  async function bayarBanyak() {
    if (ui.sibuk) return;
    var ids = Object.keys(ui.pilihDraf || {}).filter(function (k) { return ui.pilihDraf[k]; });
    var items = bacaDrafs().filter(function (x) { return ids.indexOf(x.id) >= 0; });
    if (!items.length) return;
    if (items.length === 1) { tulisDraf(); bersihBerkas(); order = null; pasangDraf(items[0]); langkah = daftarLangkah().length - 1; errors = {}; paint(); window.scrollTo(0, 0); muatBerkasDraf(); return; }
    var simpan = { ST: ST, files: files, langkah: langkah, order: order };
    tulisDraf(); ui.sibuk = true; ui.kirimDraf = ui.kirimDraf || {};
    if (langkah !== 0) { langkah = 0; paint(); }
    var disable = function (v) { $root.querySelectorAll('.draf-panel button, .draf-panel input').forEach(function (e) { e.disabled = v; }); };
    disable(true);
    try {
      var hasil = [], n = items.length;
      for (var i = 0; i < n; i++) {
        var it = items[i], awal = (i / n) * 90, lebar = 90 / n;
        progDraf('Menyiapkan ucapan ' + (i + 1) + ' dari ' + n + '…', awal);
        ST = baru(); pasangDraf(it); files = []; await muatBerkasDraf(true);
        var semua = daftarLangkah().filter(function (x) { return x !== 'ringkasan'; });
        for (var j = 0; j < semua.length; j++) { if (Object.keys(validasi(semua[j])).length) throw galatPermanen('Ucapan "' + judulDraf(it) + '" belum lengkap (' + judulLangkah(semua[j]) + ').'); }
        if (!files.some(function (f) { return f.jenis === 'foto'; })) throw galatPermanen('Foto untuk "' + judulDraf(it) + '" belum tersimpan di browser ini. Buka drafnya lalu unggah foto.');
        ST.setuju = true; var p = payload(), fp = JSON.stringify(p) + '|' + files.map(function (f) { return f.id + f.ukuran; }).join(',');
        var rec = ui.kirimDraf[it.id];
        if (!rec || rec.fp !== fp) {
          var r = await API.post('createOrder', p, { timeout: 30000 });
          if (!r.success) throw galatPermanen('"' + judulDraf(it) + '": ' + (r.message || 'Pesanan ditolak.'));
          rec = ui.kirimDraf[it.id] = { id: r.data.orderId, token: r.data.token, fp: fp, terunggah: {} };
        }
        order = rec;
        for (var k = 0; k < files.length; k++) { var f = files[k]; if (rec.terunggah[f.id]) continue; await kirimBerkas(f, k, awal + lebar * (k / files.length), lebar / files.length); rec.terunggah[f.id] = true; }
        hasil.push({ o: rec.id, t: rec.token, d: it.id });
      }
      progDraf('Menyiapkan satu pembayaran untuk ' + n + ' ucapan…', 95);
      var pay = await API.post('createPaymentBatch', { orders: hasil.map(function (h) { return { orderId: h.o, token: h.t }; }) }, { timeout: 30000 });
      if (!pay.success) throw galatPermanen(pay.message || 'Pembayaran belum dapat dibuat.');
      try { localStorage.setItem(KEY_GRUP, JSON.stringify({ g: pay.data.grupId, orders: hasil, w: Date.now() })); } catch (x) { /* abaikan */ }
      var q = 'g=' + encodeURIComponent(pay.data.grupId) + '&o=' + encodeURIComponent(hasil[0].o) + '&t=' + encodeURIComponent(hasil[0].t);
      progDraf('Mengalihkan…', 100);
      if (pay.data.simulasi) { ui.sibuk = false; location.hash = '#/status?' + q + '&sim=1'; return; }
      var url = U.amanHttps(pay.data.payUrl); if (!url) throw galatPermanen('Alamat pembayaran tidak valid.');
      location.href = url;
    } catch (err) {
      ST = simpan.ST; files = simpan.files; langkah = simpan.langkah; order = simpan.order; ui.sibuk = false;
      disable(false); progDraf('', 0, err.permanen ? err.message : 'Koneksi bermasalah. Pesananmu aman, tekan Bayar lagi. (' + (err.message || 'galat') + ')');
    }
  }
  function bersihkanGrup() {
    try {
      var g = JSON.parse(localStorage.getItem(KEY_GRUP)); localStorage.removeItem(KEY_GRUP);
      if (g && Array.isArray(g.orders)) { var cur = ST && ST._id; g.orders.forEach(function (o) { if (o.d) hapusDraf(o.d); if (o.d && o.d === cur) { ST = baru(); files = []; langkah = 0; } }); }
    } catch (e) { /* abaikan */ }
  }
  function simpanDraf() { clearTimeout(simpanT); simpanT = setTimeout(tulisDraf, 250); }
  // Pastikan draf tidak hilang bila tab ditutup/dimuat ulang sebelum jeda 250 ms selesai.
  window.addEventListener('pagehide', function () { clearTimeout(simpanT); if (ui.simpanAktif !== false) tulisDraf(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { clearTimeout(simpanT); if (ui.simpanAktif !== false) tulisDraf(); } });

  function daftarLangkah() {
    if (ST.paket === 'premium') return ['paket', 'pemesan', 'untuk', 'pesan', 'kejutan', 'foto', 'desain', 'isi', 'catatan', 'ringkasan'];
    if (ST.paket === 'special') return ['paket', 'pemesan', 'untuk', 'foto', 'ide', 'catatan', 'ringkasan'];
    if (ST.paket === 'invitation') return ['paket', 'pemesan', 'untuk', 'foto', 'desain', 'isi', 'catatan', 'ringkasan'];
    return ['paket', 'pemesan', 'untuk', 'pesan', 'kejutan', 'foto', 'desain', 'catatan', 'ringkasan'];
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
    var kartu = U.susunPaket(d.paket).map(function (p) {
      var f = p.fitur || {}, segera = U.paketSegera(p, d.desain);
      return '<label class="plan-pick' + (f.rekomendasi ? ' fav' : '') + (ST.paket === p.id ? ' on' : '') + (segera ? ' segera' : '') + '" for="pk-' + esc(p.id) + '">' +
        '<input type="radio" id="pk-' + esc(p.id) + '" name="paket" data-k="paket" value="' + esc(p.id) + '"' + (ST.paket === p.id ? ' checked' : '') + (segera ? ' disabled' : '') + '>' +
        (segera ? '<span class="plan-flag sm">Segera hadir</span>' : '') +
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
    return fld('namaPembeli', 'Nama kamu', inp('namaPembeli', 'text', 'autocomplete="name" maxlength="60"'), 'Dipakai untuk tanda terima. Tidak tampil di halaman ucapan.') +
      fld('whatsapp', 'Nomor WhatsApp', inp('whatsapp', 'tel', 'autocomplete="tel" inputmode="tel" placeholder="08xxxxxxxxxx"'), 'Hanya untuk keperluan pesananmu. Tidak tampil di halaman ucapan.') +
      fld('email', 'Email', inp('email', 'email', 'autocomplete="email" inputmode="email" maxlength="100"'), 'Kode redeem dan tanda terima dikirim ke email ini. Pastikan benar.');
  };

  VIEW.untuk = function () {
    var perluNilai = ST.tipeDari !== 'anonim', inv = ST.paket === 'invitation';
    return (inv ? '<p class="notice" style="margin-bottom:1rem">Undangan ini untuk <strong>semua tamu</strong>. Nama tiap tamu bisa ditambahkan lewat tautan personal yang dibuat di portal setelah pesanan selesai. Cukup isi siapa pengundangnya di bawah.</p>' : fld('penerima', 'Untuk siapa ucapan ini?', inp('penerima', 'text', 'maxlength="60" placeholder="mis. Rani"'), 'Nama penerima yang tampil di kartu.')) +
      '<fieldset class="field"><legend>' + (inv ? 'Pengundang (tampil di bagian penutup)' : 'Dari siapa?') + '</legend><div class="opt-list">' +
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
    return '<p class="lead small" style="margin-bottom:1rem">Ini isi <strong>surat</strong> yang dibuka penerima. Tulis dari hati; ucapan penutup ada di langkah berikutnya.</p>' + fld('pesan', 'Isi surat', ta('pesan', maks, 6), p === 'basic' ? 'Paket Basic: maksimal ' + maks + ' karakter.' : 'Maksimal ' + maks + ' karakter.') +
      ((p === 'premium' || p === 'special')
        ? fld('pesanPersonal', 'Pesan personal dari pengirim', ta('pesanPersonal', LIM.personal, 4), 'Kata-kata tambahan yang muncul di bagian penutup kartu.', true) : '');
  };

  function cth(jenis) {
    var tema = 'blossom';
    if (data() && ST.desainId) { var d = data().desain.filter(function (x) { return x.id === ST.desainId; })[0]; if (d) tema = U.temaDari(d.thumbnail); }
    return '/u/?demo=1&mulai=kejutan&j=' + encodeURIComponent(jenis) + '&tema=' + encodeURIComponent(tema);
  }
  function kolom(id, label, nilai, p, maks, hint, tipe) {
    return fld(id, label, '<input class="input" id="' + id + '" data-p="' + p + '" type="' + (tipe || 'text') + '" value="' + esc(nilai) + '" maxlength="' + maks + '"' + aria(id) + '>', hint, false);
  }
  function detailKejutan(k) {
    var h = '';
    if (k.jenis === 'kado') h = fld('kejudul', 'Judul kado (opsional)', '<input class="input" id="kejudul" data-p="kejutan.judul" type="text" value="' + esc(k.judul) + '" maxlength="40" placeholder="Hadiah untukmu"' + aria('kejudul') + '>', 'Tampil di atas kotak kado.');
    if (k.jenis === 'gosok') h = kolom('kpetunjuk', 'Kalimat di atas lapisan gosok', k.petunjuk, 'kejutan.petunjuk', 80, 'Mis. "Ada sesuatu yang selalu ingin kusampaikan…" (kosong = bawaan).');
    if (k.jenis === 'kode') h = kolom('kkode', 'Kode rahasia', k.kode, 'kejutan.kode', 30, '4–20 huruf/angka, mis. tanggal jadian 17082020 atau kata "kopisenja". Huruf besar/kecil dan spasi diabaikan. Beri tahu penerima petunjuknya, bukan kodenya.') +
      kolom('kpetkode', 'Petunjuk untuk penerima', k.petunjukKode, 'kejutan.petunjukKode', 100, 'Mis. "Tanggal pertama kali kita bertemu (ddmmyyyy)".');
    if (k.jenis === 'harapan') h = fld('klilin', 'Jumlah lilin', '<select class="input" id="klilin" data-p="kejutan.lilin" data-num="1">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (Number(k.lilin) === n ? ' selected' : '') + '>' + n + ' lilin</option>'; }).join('') + '</select>', 'Penerima mengetuk semua lilin untuk memadamkannya.');
    if (k.jenis === 'cinta') h = fld('ktarget', 'Berapa kali hati harus diketuk?', '<input class="input" id="ktarget" data-p="kejutan.target" data-num="1" type="number" min="5" max="30" value="' + esc(k.target) + '"' + aria('ktarget') + '>', '5–30 ketukan.') +
      '<p class="small muted" style="margin:.25rem 0 .5rem">Kalimat yang muncul tiap ketukan (opsional, kosong = bawaan):</p>' + k.kalimat.map(function (x, i) { return '<div class="field"><label class="sr-only" for="kkal' + i + '">Kalimat ' + (i + 1) + '</label><input class="input" id="kkal' + i + '" data-p="kejutan.kalimat.' + i + '" type="text" maxlength="60" value="' + esc(x) + '" placeholder="Kalimat ' + (i + 1) + '"></div>'; }).join('');
    if (k.jenis === 'taman') h = '<p class="small muted" style="margin-bottom:.5rem">Pesan singkat di tiap bunga (minimal 2, maksimal 5):</p>' + k.bunga.map(function (x, i) {
      return '<div class="field kej-baris"><label class="sr-only" for="kbunga' + i + '">Bunga ' + (i + 1) + '</label><input class="input" id="kbunga' + i + '" data-p="kejutan.bunga.' + i + '" type="text" maxlength="80" value="' + esc(x) + '" placeholder="Bunga ' + (i + 1) + ', mis. Kamu selalu kuat"></div>'; }).join('') +
      '<div class="actions">' + (k.bunga.length < 5 ? '<button type="button" class="btn btn-secondary btn-sm" data-f="bunga+">+ Tambah bunga</button>' : '') + (k.bunga.length > 2 ? '<button type="button" class="btn btn-secondary btn-sm" data-f="bunga-">− Kurangi</button>' : '') + '</div>';
    if (k.jenis === 'pilihan') h = '<p class="small muted" style="margin-bottom:.5rem">Isi 2–3 tombol. Tiap tombol membuka cerita yang berbeda:</p>' + k.pilihan.map(function (x, i) {
      return '<div class="kej-sub"><div class="field"><label for="kpl' + i + '">Tombol ' + (i + 1) + '</label><input class="input" id="kpl' + i + '" data-p="kejutan.pilihan.' + i + '.label" type="text" maxlength="30" value="' + esc(x.label) + '" placeholder="mis. Buka kenangan manis"></div>' +
        '<div class="field"><label for="kpt' + i + '">Cerita yang terbuka</label><textarea class="input textarea" id="kpt' + i + '" data-p="kejutan.pilihan.' + i + '.teks" rows="2" maxlength="220">' + esc(x.teks) + '</textarea></div></div>'; }).join('');
    if (k.jenis === 'kuis') h = k.soal.map(function (x, i) {
      var opsi = x.opsi.map(function (o, n) {
        return '<div class="kej-opsi"><input type="radio" name="kbenar' + i + '" data-p="kejutan.soal.' + i + '.benar" data-num="1" value="' + n + '"' + (Number(x.benar) === n ? ' checked' : '') + ' aria-label="Jawaban benar: pilihan ' + (n + 1) + '"><input class="input" type="text" data-p="kejutan.soal.' + i + '.opsi.' + n + '" maxlength="60" value="' + esc(o) + '" placeholder="Pilihan ' + (n + 1) + '" aria-label="Pilihan ' + (n + 1) + '"></div>'; }).join('');
      return '<div class="kej-sub"><p class="small" style="font-weight:800;margin-bottom:.5rem">Pertanyaan ' + (i + 1) + '</p>' +
        '<div class="field"><label for="kq' + i + '">Pertanyaan</label><input class="input" id="kq' + i + '" data-p="kejutan.soal.' + i + '.q" type="text" maxlength="120" value="' + esc(x.q) + '" placeholder="mis. Di mana kita pertama kali bertemu?"></div>' +
        '<p class="small muted" style="margin:.25rem 0 .375rem">Pilihan jawaban. Tandai bulatan di sebelah jawaban yang <strong>benar</strong>:</p>' + opsi +
        '<div class="field"><label for="krb' + i + '">Respons bila benar</label><input class="input" id="krb' + i + '" data-p="kejutan.soal.' + i + '.rb" type="text" maxlength="120" value="' + esc(x.rb) + '" placeholder="Betul! Kamu memang yang paling mengerti aku."></div>' +
        '<div class="field"><label for="krs' + i + '">Respons bila salah</label><input class="input" id="krs' + i + '" data-p="kejutan.soal.' + i + '.rs" type="text" maxlength="120" value="' + esc(x.rs) + '" placeholder="Hampir! Tapi kamu tetap favoritku."></div></div>'; }).join('') +
      '<div class="actions">' + (k.soal.length < 3 ? '<button type="button" class="btn btn-secondary btn-sm" data-f="soal+">+ Tambah pertanyaan</button>' : '') + (k.soal.length > 1 ? '<button type="button" class="btn btn-secondary btn-sm" data-f="soal-">− Hapus yang terakhir</button>' : '') + '</div>';
    return h ? '<div class="kej-detail">' + h + (errors.kejutanDetail ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.kejutanDetail) + '</p>' : '') + '</div>' : (errors.kejutanDetail ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.kejutanDetail) + '</p>' : '');
  }
  VIEW.kejutan = function () {
    var k = ST.kejutan, info = JENIS_KEJUTAN.filter(function (j) { return j.id === k.jenis; })[0] || JENIS_KEJUTAN[0];
    var kartu = JENIS_KEJUTAN.map(function (j) {
      var on = k.jenis === j.id;
      return '<div class="kej-card' + (on ? ' on' : '') + '"><label for="kj-' + j.id + '"><input type="radio" id="kj-' + j.id + '" name="kjenis" data-p="kejutan.jenis" value="' + j.id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="kc-ico">' + ic(j.ikon) + '</span><strong>' + esc(j.nama) + '</strong><small>' + esc(j.desk) + '</small></label>' +
        '<a class="kc-demo" href="' + esc(cth(j.id)) + '" target="_blank" rel="noopener">Lihat contoh ' + ic('arrow') + '</a></div>';
    }).join('');
    var hintUcapan = k.jenis === 'kode' ? 'Pesan yang terbuka setelah kode benar. Disimpan di server, tidak tampil di halaman sebelum kode dimasukkan.' : k.jenis === 'gosok' ? 'Pesan yang tersembunyi di bawah lapisan gosok.' : 'Ucapan utama yang muncul di akhir. Ini bisa berbeda dari isi surat.';
    return '<p class="lead small" style="margin-bottom:1rem">Setelah surat dibaca, penerima memainkan satu <strong>kejutan</strong>. Pilih yang paling cocok dengan momenmu. Tekan <em>Lihat contoh</em> untuk melihat cara memainkannya. Contoh itu hanya gambaran interaksi; isi ucapan, nama, dan fotonya nanti sesuai yang kamu tulis.</p>' +
      '<fieldset class="field"><legend class="sr-only">Jenis kejutan</legend><div class="kej-grid">' + kartu + '</div><p class="hint" style="margin-top:.6rem">' + ic('info') + ' "Lihat contoh" langsung membuka kejutannya saja, tanpa slide pembuka, ucapan, dan surat.</p>' + (errors.kejutanJenis ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.kejutanJenis) + '</p>' : '') + '</fieldset>' +
      '<h2 class="h3" style="margin:1.25rem 0 .75rem">' + esc(info.nama) + '</h2>' + detailKejutan(k) +
      fld('kejutanUcapan', 'Ucapan kejutan', '<textarea class="input textarea" id="kejutanUcapan" data-p="kejutan.ucapan" rows="4" maxlength="350"' + aria('kejutanUcapan') + '>' + esc(k.ucapan) + '</textarea><span class="counter' + (k.ucapan.length > 300 ? ' over' : '') + '" data-counter="kejutanUcapan" data-max="300">' + k.ucapan.length + '/300</span>', hintUcapan);
  };

  /* ======= Isian per desain (Premium): dibuat otomatis dari js/skema.js ======= */
  var RESERVED_SLUG = ['www', 'api', 'admin', 'app', 'mail', 'vercel', 'dearora', 'status', 'login', 'dashboard', 'cdn', 'static', 'assets', 'docs', 'blog', 'test', 'dev', 'staging', 'prod', 'null', 'undefined', 'home', 'u', 's'];
  function normSlug(v) { return String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, ''); }
  function slugSah(v) { return /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(v) && RESERVED_SLUG.indexOf(v) < 0; }
  function getPath(o, path) { var p = path.split('.'), c = o; for (var i = 0; i < p.length; i++) { if (c == null) return undefined; c = c[p[i]]; } return c; }
  function skSkema() { var ds = desainTerpilih(); var k = ds && window.Gaya ? Gaya.dari(ds.thumbnail) : ''; return k && window.SKEMA && window.SKEMA[k] ? { kunci: k, skema: window.SKEMA[k] } : null; }
  function skNilaiAwal(f) {
    switch (f.tipe) {
      case 'teks': case 'area': return f.bawaan || '';
      case 'foto': return '';
      case 'pilih': case 'angka': return f.bawaan;
      case 'cek': return false;
      case 'daftarfoto': return [];
      case 'daftarteks': { var a = []; for (var i = 0; i < Math.max(f.min || 0, f.min ? 1 : 0); i++) a.push(''); return a; }
      case 'objek': return skAwal(f.item);
      case 'daftar': { var l = []; for (var j = 0; j < (f.min ? Math.max(f.min, 1) : 0); j++) l.push(skAwal(f.item)); return l; }
    }
    return '';
  }
  function skAwal(bagian) { var o = {}; bagian.forEach(function (f) { o[f.k] = skNilaiAwal(f); }); return o; }
  function skSiap() { var sk = skSkema(); if (!sk) return null; if (ST._skKunci !== sk.kunci || !ST.dataDesain || !Object.keys(ST.dataDesain).length) { ST.dataDesain = skAwal(sk.skema.bagian); ST._skKunci = sk.kunci; } return sk; }
  function skCari(bagian, jalur) {       // jalur tanpa indeks angka: "episode.adegan"
    var cur = { item: bagian }, f = null;
    jalur.split('.').forEach(function (k) { if (/^\d+$/.test(k)) return; f = (cur.item || []).filter(function (x) { return x.k === k; })[0]; cur = f || {}; });
    return f;
  }
  function fotoPilihan(nilai, id, dataP) {
    var ph = files.filter(function (f) { return f.jenis === 'foto'; });
    var cur = ph.filter(function (f) { return f.id === nilai; })[0];
    return '<div class="sk-foto"><select class="input" id="' + id + '" data-p="' + dataP + '" aria-label="Pilih foto"><option value="">Tanpa foto</option>' + ph.map(function (f, i) { return '<option value="' + esc(f.id) + '"' + (f.id === nilai ? ' selected' : '') + '>Foto ' + (i + 1) + ' · ' + esc(f.nama.slice(0, 24)) + '</option>'; }).join('') + '</select>' +
      (cur && cur.url ? '<img class="sk-thumb" alt="" src="' + esc(cur.url) + '">' : '<span class="sk-thumb kosong" aria-hidden="true">' + ic('image') + '</span>') + '</div>';
  }
  function skField(f, p) {
    var P = 'dataDesain.' + p, id = 'sk-' + p.replace(/\./g, '-'), v = getPath(ST, P), er = (errors.sk || {})[p];
    var galat = er ? '<p class="err" id="' + id + '-e" role="alert">' + esc(er) + '</p>' : '', hint = f.hint ? '<p class="hint">' + esc(f.hint) + '</p>' : '';
    var lab = '<label for="' + id + '">' + esc(f.label || f.k) + (f.wajib ? '' : ' <span class="muted small">(opsional)</span>') + '</label>';
    if (f.tipe === 'teks') return '<div class="field' + (er ? ' has-error' : '') + '">' + lab + '<input class="input" id="' + id + '" data-p="' + P + '" type="text" maxlength="' + (f.maks + 20) + '" value="' + esc(v) + '"' + (er ? ' aria-invalid="true"' : '') + '>' + hint + galat + '</div>';
    if (f.tipe === 'area') return '<div class="field' + (er ? ' has-error' : '') + '">' + lab + '<textarea class="input textarea" id="' + id + '" data-p="' + P + '" rows="4" maxlength="' + (f.maks + 50) + '">' + esc(v) + '</textarea><span class="counter' + (String(v || '').length > f.maks ? ' over' : '') + '" data-counter="' + id + '" data-max="' + f.maks + '">' + String(v || '').length + '/' + f.maks + '</span>' + hint + galat + '</div>';
    if (f.tipe === 'foto') return '<div class="field">' + lab + fotoPilihan(v, id, P) + hint + '</div>';
    if (f.tipe === 'pilih') return '<div class="field">' + lab + '<select class="input" id="' + id + '" data-p="' + P + '">' + f.opsi.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' + hint + '</div>';
    if (f.tipe === 'angka') { var opt = ''; for (var n = f.min; n <= f.maks; n++) opt += '<option value="' + n + '"' + (Number(v) === n ? ' selected' : '') + '>' + n + '</option>'; return '<div class="field' + (er ? ' has-error' : '') + '">' + lab + '<select class="input" id="' + id + '" data-p="' + P + '" data-num="1">' + opt + '</select>' + galat + '</div>'; }
    if (f.tipe === 'cek') return '<div class="field' + (er ? ' has-error' : '') + '"><label class="check" for="' + id + '"><input type="checkbox" id="' + id + '" data-p="' + P + '"' + (v ? ' checked' : '') + '><span>' + esc(f.label) + '</span></label>' + galat + '</div>';
    if (f.tipe === 'daftarteks') {
      var h = '<fieldset class="field sk-grup"><legend>' + esc(f.label) + '</legend>' + (v || []).map(function (x, i) { return '<input class="input" style="margin-bottom:.4rem" type="text" id="' + id + '-' + i + '" data-p="' + P + '.' + i + '" maxlength="' + (f.maksTeks + 20) + '" value="' + esc(x) + '" aria-label="' + esc(f.label) + ' ' + (i + 1) + '" placeholder="' + (i + 1) + '">'; }).join('');
      h += '<div class="actions">' + ((v || []).length < f.maks ? '<button type="button" class="btn btn-secondary btn-sm" data-f="sk+" data-path="' + p + '">+ Tambah</button>' : '') + ((v || []).length > Math.max(f.min || 0, 1) ? '<button type="button" class="btn btn-secondary btn-sm" data-f="sk-" data-path="' + p + '">− Kurangi</button>' : '') + '</div>' + galat + '</fieldset>'; return h;
    }
    if (f.tipe === 'daftarfoto' && f.maks > 6) {
      var ph = files.filter(function (x) { return x.jenis === 'foto'; }), pil = v || [];
      return '<fieldset class="field sk-grup"><legend>' + esc(f.label) + '</legend>' + (ph.length ? '<div class="sk-galeri">' + ph.map(function (x, i) { var on = pil.indexOf(x.id) >= 0; return '<label class="sk-gal' + (on ? ' on' : '') + '"><input type="checkbox" data-f="sk-gal" data-p="' + P + '" data-id="' + esc(x.id) + '"' + (on ? ' checked' : '') + '><img alt="Foto ' + (i + 1) + '" src="' + esc(x.url || '') + '"><span>' + (i + 1) + '</span></label>'; }).join('') + '</div><p class="hint">Centang foto yang tampil di galeri undangan (' + pil.length + ' dipilih).</p>' : '<p class="hint">Belum ada foto. Unggah foto di langkah sebelumnya, lalu pilih di sini.</p>') + '</fieldset>';
    }
    if (f.tipe === 'daftarfoto') return '<fieldset class="field sk-grup"><legend>' + esc(f.label) + '</legend>' + Array.apply(null, { length: f.maks }).map(function (_, i) { return '<div style="margin-bottom:.4rem">' + fotoPilihan((v || [])[i] || '', id + '-' + i, P + '.' + i) + '</div>'; }).join('') + '</fieldset>';
    if (f.tipe === 'objek') return '<fieldset class="field sk-grup"><legend>' + esc(f.label) + '</legend>' + skHTML(f.item, p) + '</fieldset>';
    if (f.tipe === 'daftar') {
      var arr = v || [], out = '<fieldset class="field sk-grup"><legend>' + esc(f.label) + '</legend>' + hint;
      arr.forEach(function (it, i) { out += '<div class="kej-sub"><p class="small" style="font-weight:800;margin-bottom:.5rem">' + esc(f.namaItem || 'Item') + ' ' + (i + 1) + '</p>' + skHTML(f.item, p + '.' + i) + '</div>'; });
      out += '<div class="actions">' + (arr.length < f.maks ? '<button type="button" class="btn btn-secondary btn-sm" data-f="sk+" data-path="' + p + '">+ Tambah ' + esc((f.namaItem || 'item').toLowerCase()) + '</button>' : '') + (arr.length > Math.max(f.min || 0, f.min ? 1 : 0) ? '<button type="button" class="btn btn-secondary btn-sm" data-f="sk-" data-path="' + p + '">− Hapus yang terakhir</button>' : '') + '</div>' + galat + '</fieldset>'; return out;
    }
    return '';
  }
  var SKALAR = ['teks', 'area', 'foto', 'pilih', 'angka', 'cek'];
  function skHTML(bagian, jalur) {
    var utama = [], opsi = [];
    bagian.forEach(function (f) { ((f.tipe === 'teks' || f.tipe === 'area' || f.tipe === 'cek') && !f.wajib ? opsi : utama).push(f); });
    if (!utama.length) { utama = opsi; opsi = []; }                 // bila semua kolom opsional, tampilkan langsung (jangan disembunyikan)
    var h = utama.map(function (f) { return skField(f, jalur ? jalur + '.' + f.k : f.k); }).join('');
    if (opsi.length) {
      var terbuka = opsi.some(function (f) { var p = (jalur ? jalur + '.' : '') + f.k, v = getPath(ST, 'dataDesain.' + p); return (errors.sk || {})[p] || (f.tipe === 'cek' ? v : String(v || '').trim() && String(v) !== String(f.bawaan || '')); });
      h += '<details class="sk-opsional"' + (terbuka ? ' open' : '') + '><summary>Tambahan (opsional)</summary>' + opsi.map(function (f) { return skField(f, jalur ? jalur + '.' + f.k : f.k); }).join('') + '</details>';
    }
    return h;
  }
  /** Bagian-bagian isian: kolom biasa dikelompokkan; tiap daftar/objek menjadi satu bagian sendiri. */
  function skGrup(sk) {
    var grup = [], skalar = [];
    sk.skema.bagian.forEach(function (f) {
      if (SKALAR.indexOf(f.tipe) >= 0) skalar.push(f);
      else { if (skalar.length) { grup.push({ judul: grup.length ? 'Pelengkap' : 'Dasar', chip: grup.length ? 'Pelengkap' : 'Dasar', bagian: skalar }); skalar = []; } grup.push({ judul: f.label, chip: String(f.namaItem || f.label).split(':')[0].slice(0, 18), bagian: [f] }); }
    });
    if (skalar.length) grup.push({ judul: grup.length ? 'Pelengkap' : 'Dasar', chip: grup.length ? 'Pelengkap' : 'Dasar', bagian: skalar });
    return grup;
  }
  var ABAIKAN = ['tipe', 'kat', 'ilus', 'benar', 'warnaBaju'];
  function adaIsi(v) {
    if (v == null) return false;
    if (typeof v === 'string') return v.trim() !== '';
    if (typeof v === 'number' || typeof v === 'boolean') return false;
    if (Array.isArray(v)) return v.some(adaIsi);
    return Object.keys(v).some(function (k) { return ABAIKAN.indexOf(k) < 0 && adaIsi(v[k]); });
  }
  /** Mengisi bagian ini dengan contoh (hanya kolom yang masih kosong), supaya pembeli tinggal mengubah. */
  /** Gabungkan contoh ke isian: hanya bagian yang masih kosong yang diisi; yang sudah ditulis pembeli tidak diubah. */
  function gabungContoh(cur, cth) {
    if (cth == null) return cur;
    if (Array.isArray(cth)) return adaIsi(cur) ? cur : JSON.parse(JSON.stringify(cth));
    if (typeof cth === 'object') {
      var o = (cur && typeof cur === 'object' && !Array.isArray(cur)) ? cur : {};
      Object.keys(cth).forEach(function (k) { o[k] = gabungContoh(o[k], cth[k]); });
      return o;
    }
    if (typeof cth === 'string') return String(cur == null ? '' : cur).trim() ? cur : cth;
    return cur == null ? cth : cur;
  }
  function skIsiContoh(sk, gi) {
    var cth = sk.skema.contoh || {}, g = skGrup(sk)[gi];
    g.bagian.forEach(function (f) { if (cth[f.k] !== undefined) ST.dataDesain[f.k] = gabungContoh(ST.dataDesain[f.k], cth[f.k]); });
  }
  VIEW.isi = function () {
    var sk = skSiap(); if (!sk) return '<p class="state-box">Pilih desain terlebih dahulu pada langkah sebelumnya.</p>';
    var gr = skGrup(sk), gi = Math.max(0, Math.min(ui.isiBagian || 0, gr.length - 1)), g = gr[gi]; ui.isiBagian = gi;
    var nf = files.filter(function (f) { return f.jenis === 'foto'; }).length;
    var chips = gr.map(function (x, n) { return '<li class="' + (n === gi ? 'on' : n < gi ? 'lalu' : '') + '"><span class="no">' + (n < gi ? ic('check') : (n + 1)) + '</span><span class="lb">' + esc(x.chip) + '</span></li>'; }).join('');
    return '<p class="lead small" style="margin-bottom:.5rem">Desain <strong>' + esc(sk.skema.nama) + '</strong> · Bagian ' + (gi + 1) + ' dari ' + gr.length + '</p>' +
      '<ol class="sk-langkah" aria-label="Bagian isian">' + chips + '</ol>' +
      (gi === 0 ? '<p class="notice" style="margin-bottom:1rem">Nama penerima dan pengirim diambil dari langkah sebelumnya. Foto dipilih dari ' + nf + ' foto yang sudah kamu unggah (<a href="#" data-f="goto" data-ke="foto">ubah foto</a>).</p>' : '') +
      '<div class="sk-bagian"><div class="sk-judul"><h2 class="h3">' + esc(g.judul) + '</h2>' + (sk.skema.contoh ? '<button type="button" class="btn btn-quiet btn-sm" data-f="sk-contoh">' + ic('sparkles') + ' Isi dengan contoh</button>' : '') + '</div>' +
      skHTML(g.bagian, '') + '</div>' + (gi === gr.length - 1 ? musikHTML() : '') +
      (errors.dataDesain && !errors.sk ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.dataDesain) + '</p>' : '');
  };
  function musikHTML() {
    var d = data(); if (!musikAda()) return '';
    var cur = d.musik.filter(function (m) { return m.id === ST.musikId; })[0], url = cur && cur.fileUrl && /^https:\/\//.test(cur.fileUrl) ? cur.fileUrl : '';
    return '<div class="field" style="margin-top:1.25rem"><label for="musikId">Musik latar <span class="muted small">(opsional)</span></label>' +
      '<select class="input" id="musikId" data-k="musikId"><option value="">Tanpa musik</option>' + d.musik.map(function (m) { return '<option value="' + esc(m.id) + '"' + (ST.musikId === m.id ? ' selected' : '') + '>' + esc(m.judul) + '</option>'; }).join('') + '</select>' +
      (url ? '<audio class="audio" controls preload="none" src="' + esc(url) + '" aria-label="Pratinjau ' + esc(cur.judul) + '" style="margin-top:.6rem"></audio>' : '') +
      '<p class="hint">' + ic('check') + ' Semua musik di daftar ini bebas hak cipta (no copyright), jadi aman dipakai di ucapanmu. Tekan putar untuk mencoba.</p></div>';
  }
  function skValidasi(sk) {
    var e = {}, kosong = function (v) { return String(v == null ? '' : v).trim() === ''; };
    function cek(bagian, data, jalur) {
      bagian.forEach(function (f) {
        var p = (jalur ? jalur + '.' : '') + f.k, v = data ? data[f.k] : undefined;
        if (f.tipe === 'teks' || f.tipe === 'area') {
          var t = String(v || '').trim();
          if (f.wajib && !t) e[p] = (f.label || f.k) + ' wajib diisi.';
          else if (f.pola && t && !(new RegExp(f.pola)).test(t)) e[p] = (f.label || f.k) + ' formatnya tidak valid.' + (f.hint ? ' ' + f.hint : '');
          else if (t.length > f.maks) e[p] = (f.label || f.k) + ' maksimal ' + f.maks + ' karakter.';
        } else if (f.tipe === 'daftarteks') {
          var n = (v || []).filter(function (x) { return !kosong(x); }).length; if (n < (f.min || 0)) e[p] = (f.label || f.k) + ': isi minimal ' + f.min + '.';
          (v || []).forEach(function (x) { if (String(x).trim().length > f.maksTeks) e[p] = 'Setiap isian maksimal ' + f.maksTeks + ' karakter.'; });
        } else if (f.tipe === 'objek') cek(f.item, v, p);
        else if (f.tipe === 'daftar') {
          var ada = (v || []).filter(function (it) { return f.item.some(function (g) { return (g.tipe === 'teks' || g.tipe === 'area') && !kosong(it[g.k]) || g.tipe === 'daftarteks' && (it[g.k] || []).some(function (x) { return !kosong(x); }); }); });
          if (ada.length < (f.min || 0)) e[p] = (f.label || f.k) + ': isi minimal ' + f.min + ' ' + String(f.namaItem || 'baris').toLowerCase() + '.';
          (v || []).forEach(function (it, i) { if (ada.indexOf(it) >= 0) cek(f.item, it, p + '.' + i); });
        }
      });
    }
    cek(sk.skema.bagian, ST.dataDesain, '');
    var d = ST.dataDesain;
    if (sk.kunci === 'musik') {
      var adaAudio = (d.lagu || []).some(function (l) { return String(l.audio || '').trim(); });
      (d.lagu || []).forEach(function (l, i) { var a = String(l.audio || '').trim(); if (a && !/^https:\/\/[^\s]{4,290}$/.test(a)) e['lagu.' + i + '.audio'] = 'Tautan audio harus diawali https://'; });
      if (adaAudio && !d.izinAudio) e.izinAudio = 'Centang pernyataan bahwa tautan audio sah/berlisensi.';
    }
    if (sk.kunci === 'misi' && d.kuis && Number(d.kuis.benar) > (d.kuis.opsi || []).filter(function (x) { return !kosong(x); }).length) e['kuis.benar'] = 'Nomor jawaban benar melebihi jumlah pilihan.';
    return e;
  }
  function skPayload(sk) {
    var ph = files.filter(function (f) { return f.jenis === 'foto'; });
    var ref = function (id) { var i = ph.findIndex(function (f) { return f.id === id; }); return i >= 0 ? 'f' + (i + 1) : ''; };
    function konversi(bagian, data) {
      var o = {}; bagian.forEach(function (f) {
        var v = data ? data[f.k] : undefined;
        if (f.tipe === 'foto') o[f.k] = ref(v); else if (f.tipe === 'daftarfoto') o[f.k] = (v || []).map(ref).filter(Boolean);
        else if (f.tipe === 'objek') o[f.k] = konversi(f.item, v);
        else if (f.tipe === 'daftar') o[f.k] = (v || []).map(function (it) { return konversi(f.item, it); });
        else if (f.tipe === 'daftarteks') o[f.k] = (v || []).map(function (x) { return String(x).trim(); }).filter(Boolean);
        else if (f.tipe === 'teks' || f.tipe === 'area') o[f.k] = String(v || '').trim(); else o[f.k] = v;
      }); return o;
    }
    return konversi(sk.skema.bagian, ST.dataDesain);
  }

  /* ======= Paket Special: ide desain sendiri + nama link ======= */
  function domainSpecial() { var c = (data() && data().config) || {}; return c.DOMAIN_SPECIAL || 'vercel.app'; }
  VIEW.ide = function () {
    var dom = domainSpecial(), n = normSlug(ST.urlDiminta), ok = !n || slugSah(n);
    return '<p class="lead small" style="margin-bottom:1rem">Paket Special dikerjakan langsung oleh kami, <strong>100% sesuai ideamu</strong>. Tidak ada contoh desain: ceritakan saja seperti apa yang kamu bayangkan. Setelah memesan, kamu bisa berdiskusi lewat chat dengan admin agar hasilnya terarah.</p>' +
      fld('ideSendiri', 'Ide desain', ta('ideSendiri', LIM.ideSpecial, 9), 'Konsep, mood, warna, alur cerita, interaksi yang diinginkan, dan referensi (nama gaya atau tautan). Makin jelas makin baik. Minimal 30 karakter.') +
      fld('pesan', 'Naskah atau isi ucapan', ta('pesan', LIM.pesan.special, 5), 'Kata-kata yang ingin dimasukkan ke dalam ucapan (opsional).', true) +
      fld('urlDiminta', 'Nama alamat ucapan', '<div class="url-pre"><input class="input" id="urlDiminta" data-k="urlDiminta" type="text" maxlength="50" autocomplete="off" spellcheck="false" placeholder="mis. laiba" value="' + esc(ST.urlDiminta) + '"' + aria('urlDiminta') + '><span>.' + esc(dom) + '</span></div>' +
        '<p class="small ' + (ok ? 'muted' : '') + '" id="urlPreview" style="margin-top:.4rem">' + (n ? (ok ? 'Alamat yang kamu minta: <strong>' + esc(n) + '.' + esc(dom) + '</strong>' : 'Nama belum bisa dipakai: 3–40 huruf/angka dan bukan kata yang dicadangkan.') : 'Kosongkan jika tidak ingin memilih nama.') + '</p>',
        'Opsional. Isi bagian depannya saja; akhiran .' + dom + ' sudah tetap. Jika nama sudah dipakai pembeli lain, kami menambahkan angka atau pembeda (mis. laiba-2). Nama yang mudah ditebak membuat isi ucapan lebih mudah dibuka orang lain.', true) +
      '<p class="notice">Foto (maksimal ' + ((paketAktif() || {}).maksFoto || 20) + ') dan 1 video sudah kamu unggah di langkah sebelumnya. Sebutkan urutan atau peruntukan foto di kolom ide di atas. Paket Special mendapat <strong>1× revisi gratis</strong>.</p>';
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

  function desainTerpilih() { var d = data(); return d && ST.desainId ? d.desain.filter(function (x) { return x.id === ST.desainId; })[0] : null; }
  function opsiDesainHTML() {
    var ds = desainTerpilih(); if (!ds || !window.Gaya) return '';
    var key = Gaya.dari(ds.thumbnail), g = Gaya.G[key]; if (!g) return '';
    var h = '<div class="opsi-desain"><p class="small" style="font-weight:800;margin-bottom:.25rem">Tentang desain ' + esc(ds.nama) + '</p>' +
      '<p class="small muted" style="margin-bottom:.75rem">' + esc(g.cocok || '') + (g.petunjuk ? ' ' + esc(g.petunjuk) : '') + '</p>' +
      (g.brief ? '<div class="notice" style="margin-bottom:.75rem"><strong>Yang perlu kamu siapkan untuk desain ini:</strong><ul class="stack small" style="list-style:disc;padding-left:1.1rem;margin-top:.4rem">' + g.brief.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul><p class="small" style="margin-top:.4rem">Tuliskan atau tempel bahan-bahan ini di kolom catatan pada langkah berikutnya. Desain Special dikerjakan manual dalam 1–2 hari kerja.</p></div>' : '');
    Object.keys(g.opsi || {}).forEach(function (nm) {
      var o = g.opsi[nm], cur = ST.opsiDesain[nm];
      h += '<fieldset class="field" style="margin-bottom:.5rem"><legend>' + esc(o.label) + '</legend><div class="opt-list">';
      if (o.tipe === 'banyak') {
        var sel = Array.isArray(cur) ? cur : o.bawaan;
        h += o.pilihan.map(function (p) { return '<label class="opt-row"><input type="checkbox" data-opk="' + esc(nm) + '" data-maks="' + (o.maks || 4) + '" value="' + esc(p[0]) + '"' + (sel.indexOf(p[0]) >= 0 ? ' checked' : '') + '><span><strong>' + esc(p[1]) + '</strong></span></label>'; }).join('');
      } else {
        h += o.pilihan.map(function (p) { return '<label class="opt-row"><input type="radio" name="op-' + esc(nm) + '" data-op="' + esc(nm) + '" value="' + esc(p[0]) + '"' + ((cur || o.bawaan) === p[0] ? ' checked' : '') + '><span><strong>' + esc(p[1]) + '</strong></span></label>'; }).join('');
      }
      h += '</div></fieldset>';
    });
    return h + '</div>';
  }
  VIEW.desain = function () {
    var d = data(), semuaBisa = d.desain.filter(function (x) { return (x.paket || []).indexOf(ST.paket) >= 0; });
    var kats = []; semuaBisa.forEach(function (x) { if (x.kategori && kats.indexOf(x.kategori) < 0) kats.push(x.kategori); });
    if (ui.filterDesain && kats.indexOf(ui.filterDesain) < 0) ui.filterDesain = '';
    var bisa = ui.filterDesain ? semuaBisa.filter(function (x) { return x.kategori === ui.filterDesain; }) : semuaBisa;
    var filterUI = kats.length > 3 ? '<div class="chips" role="group" aria-label="Filter kategori desain" style="margin-bottom:1rem"><button type="button" class="chip" data-f="fil-desain" data-v="" aria-pressed="' + (!ui.filterDesain) + '">Semua (' + semuaBisa.length + ')</button>' + kats.map(function (k) { return '<button type="button" class="chip" data-f="fil-desain" data-v="' + esc(k) + '" aria-pressed="' + (ui.filterDesain === k) + '">' + esc(k) + '</button>'; }).join('') + '</div>' : '';
    var pilih = bisa.length ? '<div class="opt-grid">' + bisa.map(function (x) {
      var on = ST.desainId === x.id;
      return '<div class="opt-card' + (on ? ' on' : '') + '"><label for="ds-' + esc(x.id) + '">' +
        '<input type="radio" id="ds-' + esc(x.id) + '" name="desainId" data-k="desainId" value="' + esc(x.id) + '"' + (on ? ' checked' : '') + '>' +
        U.thumbHTML(x, d.paket) + '<span class="oc-name">' + esc(x.nama) + '</span></label>' +
        '<button type="button" class="btn btn-quiet btn-sm btn-block" data-action="demo" data-id="' + esc(x.id) + '">' + ic('play') + ' Lihat Demo</button></div>';
    }).join('') + '</div>' : '<p class="state-box">Belum ada desain untuk paket ini.</p>';
    return '<p class="lead small" style="margin-bottom:1rem">' + (ST.paket === 'premium' ? 'Pilih satu desain eksklusif. Di langkah berikutnya kamu mengisi bahan-bahannya sendiri, dan link langsung jadi setelah pembayaran.' : 'Pilih satu desain. Coba demonya dulu sebelum memilih.') + '</p>' +
      filterUI + pilih + opsiDesainHTML() + (ST.paket === 'basic' ? musikHTML() : '') + (errors.desain ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.desain) + '</p>' : '');
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
    var ds = ST.paket === 'special' ? 'Desain custom' : (d.desain.filter(function (x) { return x.id === ST.desainId; })[0] || {}).nama || '-';
    var dari = ST.tipeDari === 'anonim' ? 'Anonim' : (ST.tipeDari === 'inisial' ? 'Inisial ' : '') + esc(ST.nilaiDari);
    var mus = musikAda() ? (d.musik.filter(function (m) { return m.id === ST.musikId; })[0] || {}).judul || 'Tanpa musik' : '';
    var sim = d.config && d.config.MODE_BAYAR === 'simulasi';
    return (sim ? '<p class="notice warn" role="status"><strong>Mode simulasi.</strong> Tidak ada pembayaran sungguhan; ini hanya uji coba alur.</p>' : '') +
      '<dl class="summary">' +
      ringkasBaris('Paket', esc(pk.nama) + ' · aktif ' + esc(U.formatMasa(pk.masaAktifHari)), 'paket') +
      (function () { var pf = window.Auth && window.Auth.ada() ? window.Auth.profil() : null; var n = pf ? pf.nama : ST.namaPembeli, w = pf ? pf.whatsapp : ST.whatsapp, e = pf ? pf.email : ST.email;
        return ringkasBaris('Pemesan', esc(n) + (pf ? ' <span class="tag sage">Akun terhubung</span>' : '') + '<br><span class="muted small">' + esc(w) + ' · ' + esc(e) + '</span>', 'pemesan'); })() +
      ringkasBaris('Untuk / Dari', esc(ST.penerima) + ' / ' + dari, 'untuk') +
      (templatPaket() ? ringkasBaris('Surat', '<span class="clip">' + esc(ST.pesan) + '</span>', 'pesan') : '') +
      (ST.paket === 'special' ? ringkasBaris('Ide desain', '<span class="clip">' + esc(ST.ideSendiri) + '</span>' + (ST.urlDiminta ? '<br><span class="muted small">Alamat: ' + esc(normSlug(ST.urlDiminta)) + '.' + esc(domainSpecial()) + '</span>' : ''), 'ide') : '') +
      ((ST.paket === 'premium' || ST.paket === 'invitation') ? ringkasBaris('Isi desain', 'Sudah diisi (' + ((skSkema() || { skema: { nama: '' } }).skema.nama) + ')', 'isi') : '') +
      (templatPaket() ? ringkasBaris('Kejutan akhir', esc((JENIS_KEJUTAN.filter(function (j) { return j.id === ST.kejutan.jenis; })[0] || {}).nama || '') + '<br><span class="clip muted small">' + esc(ST.kejutan.ucapan) + '</span>', 'kejutan') : '') +
      ringkasBaris('Foto', files.filter(function (f) { return f.jenis === 'foto'; }).length + ' foto' + (files.some(function (f) { return f.jenis === 'video'; }) ? ' + 1 video' : ''), 'foto') +
      (ST.paket !== 'special' ? ringkasBaris('Desain', esc(ds), 'desain') : '') +
      (templatPaket() && musikAda() ? ringkasBaris('Musik latar', esc((d.musik.filter(function (m) { return m.id === ST.musikId; })[0] || {}).judul || 'Tanpa musik'), ST.paket === 'premium' ? 'isi' : 'desain') : '') +
      '</dl>' +
      '<div class="total-box"><span>Total</span><strong>Rp ' + esc(U.rupiah(pk.harga)) + '</strong></div>' +
      '<div class="field' + (errors.setuju ? ' has-error' : '') + '"><label class="check" for="setuju"><input type="checkbox" id="setuju" data-k="setuju"' + (ST.setuju ? ' checked' : '') + '>' +
      '<span>Saya sudah memeriksa data di atas dan menyetujui <a href="#/syarat" target="_blank" rel="noopener">Syarat &amp; Ketentuan</a> serta <a href="#/privasi" target="_blank" rel="noopener">Kebijakan Privasi</a>.</span></label>' +
      (errors.setuju ? '<p class="err" role="alert">' + ic('info') + ' ' + esc(errors.setuju) + '</p>' : '') + '</div>' +
      '<p class="small muted">' + (ST.paket === 'special' ? 'Paket Special dibayar penuh di muka dan mendapat 1× revisi gratis. ' : 'Paket Basic dan Premium tidak dapat direvisi setelah dibayar, jadi periksa data dengan teliti. ') + 'Kamu akan diarahkan ke halaman pembayaran yang aman.</p>' +
      '<div id="payPanel" aria-live="polite">' + payPanelHTML() + '</div>';
  };

  /* ---------------- Validasi per langkah ---------------- */
  function normKode(x) { return String(x || '').toLowerCase().replace(/[\s.\-\/_,:;]/g, ''); }
  /** Cermin validasi server (yang tetap menjadi acuan). */
  function galatKejutan(k) {
    var tr = function (v) { return String(v || '').trim(); };
    if (k.jenis === 'kuis') {
      for (var i = 0; i < k.soal.length; i++) {
        var s2 = k.soal[i], ops = s2.opsi.map(tr).filter(Boolean);
        if (tr(s2.q).length < 3) return 'Kuis: isi pertanyaan ' + (i + 1) + ' (minimal 3 karakter).';
        if (ops.length < 2) return 'Kuis: pertanyaan ' + (i + 1) + ' perlu minimal 2 pilihan jawaban.';
        if (!tr(s2.opsi[Number(s2.benar)])) return 'Kuis: tandai jawaban yang benar pada pertanyaan ' + (i + 1) + ' (pilih jawaban yang terisi).';
      }
    }
    if (k.jenis === 'pilihan') {
      var isi = k.pilihan.filter(function (x) { return tr(x.label) || tr(x.teks); });
      if (isi.length < 2 || isi.some(function (x) { return !tr(x.label) || tr(x.teks).length < 3; })) return 'Pilihan: isi minimal 2 tombol, masing-masing dengan label dan cerita (minimal 3 karakter).';
    }
    if (k.jenis === 'kode') { var kn = normKode(k.kode); if (kn.length < 4 || kn.length > 20) return 'Kode rahasia harus 4–20 huruf/angka (mis. 17082020 atau kopisenja).'; }
    if (k.jenis === 'taman' && k.bunga.filter(function (x) { return tr(x); }).length < 2) return 'Taman: isi minimal 2 pesan bunga.';
    if (k.jenis === 'cinta') { var t = Number(k.target); if (!(t >= 5 && t <= 30)) return 'Jumlah ketukan harus 5–30.'; }
    return '';
  }
  function kejutanPayload() {
    var k = ST.kejutan, tr = function (v) { return String(v || '').trim(); }, o = { jenis: k.jenis, ucapan: tr(k.ucapan) };
    if (k.jenis === 'kado') o.judul = tr(k.judul);
    if (k.jenis === 'gosok') o.petunjuk = tr(k.petunjuk);
    if (k.jenis === 'kode') { o.kode = k.kode; o.petunjuk = tr(k.petunjukKode); }
    if (k.jenis === 'harapan') o.lilin = Number(k.lilin);
    if (k.jenis === 'cinta') { o.target = Number(k.target); o.kalimat = k.kalimat.map(tr).filter(Boolean); }
    if (k.jenis === 'taman') o.bunga = k.bunga.map(tr).filter(Boolean);
    if (k.jenis === 'pilihan') o.pilihan = k.pilihan.map(function (x) { return { label: tr(x.label), teks: tr(x.teks) }; }).filter(function (x) { return x.label || x.teks; });
    if (k.jenis === 'kuis') o.soal = k.soal.map(function (s2) {
      var idx = -1, ops = []; s2.opsi.forEach(function (x, i) { var t2 = tr(x); if (t2) { if (i === Number(s2.benar)) idx = ops.length; ops.push(t2); } });
      return { q: tr(s2.q), opsi: ops, benar: idx, rb: tr(s2.rb), rs: tr(s2.rs) };
    });
    return o;
  }

  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, RE_WA = /^(\+62|62|0)8[0-9]{7,12}$/;
  function validasi(id) {
    if (ST.paket === 'invitation' && !String(ST.penerima || '').trim()) ST.penerima = 'Tamu Undangan';        // undangan untuk semua tamu: nama penerima tidak ditanyakan
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
    if (id === 'isi') { var sk = skSiap(); if (!sk) e.dataDesain = 'Pilih desain terlebih dahulu.'; else { var es = skValidasi(sk); if (Object.keys(es).length) { e.sk = es; e.dataDesain = es[Object.keys(es)[0]]; } } }
    if (id === 'ide') {
      if (t('ideSendiri').length < 30) e.ideSendiri = 'Ceritakan idemu dengan lebih lengkap (minimal 30 karakter).'; else if (t('ideSendiri').length > LIM.ideSpecial) e.ideSendiri = 'Maksimal ' + LIM.ideSpecial + ' karakter.';
      if (t('pesan').length > LIM.pesan.special) e.pesan = 'Maksimal ' + LIM.pesan.special + ' karakter.';
      var ns = normSlug(ST.urlDiminta); if (ST.urlDiminta && !slugSah(ns)) e.urlDiminta = 'Nama alamat 3–40 huruf/angka dan bukan kata yang dicadangkan.';
    }
    if (id === 'pesan') {
      var m = LIM.pesan[ST.paket] || 300;
      if (t('pesan').length < 5) e.pesan = 'Pesan minimal 5 karakter.';
      else if (t('pesan').length > m) e.pesan = 'Pesan maksimal ' + m + ' karakter untuk paket ini.';
      if (t('pesanPersonal').length > LIM.personal) e.pesanPersonal = 'Maksimal ' + LIM.personal + ' karakter.';
    }
    if (id === 'kejutan' && templatPaket()) {
      var kj = ST.kejutan, uc = String(kj.ucapan || '').trim(), dt = galatKejutan(kj);
      if (uc.length < 5) e.kejutanUcapan = 'Ucapan kejutan minimal 5 karakter.'; else if (uc.length > 300) e.kejutanUcapan = 'Ucapan kejutan maksimal 300 karakter.';
      if (dt) e.kejutanDetail = dt;
    }
    if (id === 'foto') { if (!files.some(function (f) { return f.jenis === 'foto'; })) e.foto = 'Unggah minimal 1 foto.'; }
    if (id === 'desain') { if (!ST.desainId) e.desain = 'Pilih satu desain.'; }
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
    $root.innerHTML = panelDraf() + stepper() + (ST.paket ? '<p class="simpan-info">' + ic('check') + ' Tersimpan otomatis di perangkat ini' + (idb ? ', termasuk foto' : '') + '. Boleh ditutup dan dilanjutkan kapan saja.</p>' : '') +
      '<form id="fForm" novalidate autocomplete="on"><div class="card form-card">' +
      '<h1 class="h2" id="stepTitle" tabindex="-1">' + esc(judulLangkah(id)) + '</h1>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">' +
      VIEW[id]() + '</div>' +
      '<div class="form-nav">' +
      (langkah > 0 ? '<button type="button" class="btn btn-secondary" data-f="back"' + (ui.sibuk ? ' disabled' : '') + '>Kembali</button><button type="button" class="btn btn-quiet btn-sm" data-f="draf-baru" title="Simpan ucapan ini sebagai draf, lalu mulai ucapan lain">Simpan &amp; buat ucapan lain</button>' : '<span></span>') +
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
    var id = langkahId();
    if (id === 'isi') {
      var sk = skSiap();
      if (sk) {
        var gr = skGrup(sk), es = skValidasi(sk), gi = ui.isiBagian || 0;
        var di = function (g) { return g.bagian.map(function (f) { return f.k; }); };
        var galatDi = function (n) { return Object.keys(es).filter(function (p) { return di(gr[n]).indexOf(p.split('.')[0]) >= 0; }); };
        if (gi < gr.length - 1) {
          var ge = galatDi(gi);
          if (ge.length) { errors = { sk: es, dataDesain: es[ge[0]] }; paint(); fokusError(); return; }
          ui.isiBagian = gi + 1; errors = {}; paint(); fokusJudul(); simpanDraf(); return;
        }
        if (Object.keys(es).length) {
          var pertama = Object.keys(es)[0], tgt = gr.findIndex(function (g) { return di(g).indexOf(pertama.split('.')[0]) >= 0; });
          if (tgt >= 0) ui.isiBagian = tgt; errors = { sk: es, dataDesain: es[pertama] }; paint(); fokusError(); return;
        }
      }
    }
    errors = validasi(id);
    if (Object.keys(errors).length) { paint(); fokusError(); return; }
    langkah++; errors = {}; if (langkahId() === 'isi') ui.isiBagian = 0; paint(); fokusJudul(); simpanDraf();
  }
  function kembali() { if (langkahId() === 'isi' && (ui.isiBagian || 0) > 0) { ui.isiBagian--; errors = {}; paint(); fokusJudul(); return; } if (langkah > 0) { langkah--; errors = {}; paint(); fokusJudul(); simpanDraf(); } }

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
    files = files.concat(baruFile); pastikanId(); baruFile.forEach(function (bf) { idbSimpan(bf); }); simpanDraf(); ui.kompres = false; ui.pesanFile = pesan.length ? pesan.slice(0, 2).join('; ') : ''; errors = {};
    if (order) order = null;                       // isi berubah → pesanan lama tidak dipakai lagi
    paint();
    var fi = document.getElementById('fileInput'); if (fi) fi.focus({ preventScroll: true });
  }
  function geser(id, arah) {
    var i = files.findIndex(function (f) { return f.id === id; }), j = i + arah;
    if (i < 0 || j < 0 || j >= files.length) return;
    var t = files[i]; files[i] = files[j]; files[j] = t; if (order) order = null; paint(); simpanDraf();
    var b = $root.querySelector('[data-f="' + (arah < 0 ? 'up' : 'down') + '"][data-id="' + id + '"]'); if (b && !b.disabled) b.focus();
  }
  function hapus(id) {
    var f = files.find(function (x) { return x.id === id; }); if (f && f.url) URL.revokeObjectURL(f.url);
    idbHapus(id); files = files.filter(function (x) { return x.id !== id; }); if (order) order = null; paint(); simpanDraf();
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
    if (ST.paket === 'invitation' && !String(ST.penerima || '').trim()) ST.penerima = 'Tamu Undangan';
    var p = {
      paketId: ST.paket, namaPembeli: ST.namaPembeli.trim(), whatsapp: ST.whatsapp.trim(), email: ST.email.trim(),
      penerima: ST.penerima.trim(), tipeDari: ST.tipeDari, nilaiDari: ST.tipeDari === 'anonim' ? '' : ST.nilaiDari.trim(),
      pesan: ST.pesan.trim(), desainId: ST.paket === 'special' ? '' : ST.desainId, ideSendiri: ST.paket === 'special' ? ST.ideSendiri.trim() : '',
      catatan: ST.catatan.trim(), setuju: ST.setuju === true, website: '', musikId: (ST.paket === 'special' || ST.paket === 'invitation') ? '' : (ST.musikId || '')
    };
    if (templatPaket()) p.kejutan = kejutanPayload();
    if (ST.paket === 'basic') p.opsiDesain = ST.desainId ? ST.opsiDesain : {};
    if (ST.paket === 'premium' || ST.paket === 'invitation') { var sk = skSiap(); if (sk) p.dataDesain = skPayload(sk); }
    if (ST.paket === 'special' && ST.urlDiminta) p.urlDiminta = normSlug(ST.urlDiminta);
    var pf = window.Auth && window.Auth.ada() ? window.Auth.profil() : null;
    if (pf) { p.sesi = window.Auth.token(); p.namaPembeli = pf.nama; p.whatsapp = pf.whatsapp; p.email = pf.email; }
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
    var semua = daftarLangkah().filter(function (x) { return x !== 'ringkasan'; });     // langkah mengikuti paket (Basic/Premium/Special)
    for (var i = 0; i < semua.length; i++) {
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
    var el = ev.target, k = el.dataset && el.dataset.k, p = el.dataset && el.dataset.p;
    if ((!k && !p) || el.type === 'radio' || el.type === 'checkbox') return;
    if (p) setPath(ST, p, el.dataset.num ? Number(el.value) : el.value); else ST[k] = el.value;
    var cid = el.id || k;
    var c = $root.querySelector('[data-counter="' + cid + '"]');
    if (c) { var n = el.value.length, m = Number(c.dataset.max); c.textContent = n + '/' + m; c.classList.toggle('over', n > m); }
    if (errors[cid]) { delete errors[cid]; el.removeAttribute('aria-invalid'); var er = document.getElementById(cid + '-e'); if (er) er.remove(); }
    if (el.id === 'urlDiminta') { var pv = document.getElementById('urlPreview'), nn = normSlug(el.value), host2 = location.host || 'dearora.id'; if (pv) pv.innerHTML = nn ? (slugSah(nn) ? 'Alamat yang kamu minta: <strong>' + esc(nn) + '.' + esc(domainSpecial()) + '</strong>' : 'Nama belum bisa dipakai: 3–40 huruf/angka dan bukan kata yang dicadangkan.') : 'Kosongkan jika tidak ingin memilih nama.'; }
    if (p && errors.kejutanDetail) { delete errors.kejutanDetail; var kd = $root.querySelector('.kej-detail > .err'); if (kd) kd.remove(); }
    simpanDraf();
  }
  function toast() { /* batas pilihan tercapai: centang tidak ditambah */ }
  function onChange(ev) {
    var el = ev.target;
    if (el.id === 'fileInput') { var l = Array.prototype.slice.call(el.files || []); el.value = ''; if (l.length) tambahBerkas(l); return; }
    if (el.dataset && el.dataset.op) { ST.opsiDesain[el.dataset.op] = el.value; simpanDraf(); return; }
    if (el.dataset && el.dataset.opk) {
      var nm = el.dataset.opk, maks = Number(el.dataset.maks) || 4, arr = Array.isArray(ST.opsiDesain[nm]) ? ST.opsiDesain[nm].slice() : Array.prototype.slice.call($root.querySelectorAll('[data-opk="' + nm + '"]:checked')).map(function (x) { return x.value; });
      arr = arr.filter(function (x) { return x !== el.value; });
      if (el.checked) { if (arr.length >= maks) { el.checked = false; ui.pesanFile = ''; toast && toast(); return; } arr.push(el.value); }
      ST.opsiDesain[nm] = arr; simpanDraf(); return;
    }
    var pth = el.dataset && el.dataset.p;
    if (pth) {
      if (el.type === 'radio' || el.tagName === 'SELECT') {
        setPath(ST, pth, el.dataset.num ? Number(el.value) : el.value);
        if (pth === 'kejutan.jenis' || (/^dataDesain\./.test(pth) && el.closest('.sk-foto'))) { if (pth === 'kejutan.jenis') errors = {}; paint(); var ag = document.getElementById(el.id); if (ag) ag.focus({ preventScroll: true }); }
        simpanDraf();
      } else if (el.type === 'checkbox' && el.dataset.f !== 'sk-gal') { setPath(ST, pth, el.checked); simpanDraf(); }
      return;
    }
    var k = el.dataset && el.dataset.k; if (!k) return;
    if (k === 'musikId' && el.tagName === 'SELECT') { ST.musikId = el.value; paint(); var sm = document.getElementById('musikId'); if (sm) sm.focus({ preventScroll: true }); simpanDraf(); return; }
    if (k === 'desainId' && el.checked && window.Gaya) { var dd = data().desain.filter(function (x) { return x.id === el.value; })[0]; ST.opsiDesain = dd ? Gaya.opsiBawaan(Gaya.dari(dd.thumbnail)) : {}; ST.desainId = el.value; ST.dataDesain = {}; ST._skKunci = ''; }
    if (el.type === 'checkbox') { ST[k] = el.checked; if (errors[k]) { delete errors[k]; paint(); document.getElementById(k).focus(); } return; }
    if (el.type !== 'radio') return;
    ST[k] = el.value;
    if (k === 'paket') {
      if (el.value === 'invitation' && !ST.penerima) ST.penerima = 'Tamu Undangan';
      var pk = paketAktif(); errors = {};
      if (ST.desainId) { var dd = data().desain.filter(function (x) { return x.id === ST.desainId; })[0]; if (!dd || dd.paket.indexOf(ST.paket) < 0) ST.desainId = ''; }
      var nf = files.filter(function (f) { return f.jenis === 'foto'; });
      if (pk && nf.length > pk.maksFoto) { nf.slice(pk.maksFoto).forEach(function (f) { hapusTanpaPaint(f.id); }); ui.pesanFile = 'Kelebihan foto dihapus (maks. ' + pk.maksFoto + ')'; }
      if (ST.paket !== 'special') files.filter(function (f) { return f.jenis === 'video'; }).forEach(function (f) { hapusTanpaPaint(f.id); });
      if (order) order = null;
      ST.desainId = (ST.desainId && data().desain.some(function (x) { return x.id === ST.desainId && x.paket.indexOf(ST.paket) >= 0; })) ? ST.desainId : ''; ST.dataDesain = {}; ST._skKunci = '';
    }
    paint();
    var again = document.getElementById(el.id); if (again) again.focus({ preventScroll: true });
    simpanDraf();
  }
  function hapusTanpaPaint(id) { var f = files.find(function (x) { return x.id === id; }); if (f && f.url) URL.revokeObjectURL(f.url); idbHapus(id); files = files.filter(function (x) { return x.id !== id; }); }

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
    else if (a === 'soal+') { if (ST.kejutan.soal.length < 3) { ST.kejutan.soal.push(soalBaru()); paint(); simpanDraf(); } }
    else if (a === 'soal-') { if (ST.kejutan.soal.length > 1) { ST.kejutan.soal.pop(); paint(); simpanDraf(); } }
    else if (a === 'bunga+') { if (ST.kejutan.bunga.length < 5) { ST.kejutan.bunga.push(''); paint(); simpanDraf(); } }
    else if (a === 'bunga-') { if (ST.kejutan.bunga.length > 2) { ST.kejutan.bunga.pop(); paint(); simpanDraf(); } }
    else if (a === 'sk-gal') { var pa = getPath(ST, b.dataset.p) || []; var ix = pa.indexOf(b.dataset.id); if (b.checked && ix < 0) pa.push(b.dataset.id); if (!b.checked && ix >= 0) pa.splice(ix, 1); setPath(ST, b.dataset.p, pa); simpanDraf(); paint(); }
    else if (a === 'sk-contoh') { var sk3 = skSiap(); if (sk3) { skIsiContoh(sk3, ui.isiBagian || 0); errors = {}; paint(); simpanDraf(); } }
    else if (a === 'sk+' || a === 'sk-') {
      var sk2 = skSiap(), jl = b.dataset.path, f2 = sk2 && skCari(sk2.skema.bagian, jl), arr2 = getPath(ST.dataDesain, jl);
      if (f2 && Array.isArray(arr2)) {
        if (a === 'sk+' && arr2.length < f2.maks) arr2.push(f2.tipe === 'daftar' ? skAwal(f2.item) : '');
        if (a === 'sk-' && arr2.length > Math.max(f2.min || 0, f2.min ? 1 : 0)) arr2.pop();
        paint(); simpanDraf();
      }
    }
    else if (a === 'draf-buka') { var it = bacaDrafs().filter(function (x) { return x.id === b.dataset.id; })[0]; if (it) { tulisDraf(); bersihBerkas(); order = null; pasangDraf(it); errors = {}; paint(); window.scrollTo(0, 0); muatBerkasDraf(); } }
    else if (a === 'fil-desain') { ui.filterDesain = b.dataset.v || ''; paint(); }
    else if (a === 'draf-pilih') { ui.pilihDraf = ui.pilihDraf || {}; ui.pilihDraf[b.dataset.id] = b.checked; var tot = document.getElementById('drafTotal'); paint(); var cb = document.getElementById('cek-' + b.dataset.id); if (cb) cb.focus({ preventScroll: true }); }
    else if (a === 'draf-semua') { ui.pilihDraf = ui.pilihDraf || {}; bacaDrafs().forEach(function (it) { if (cekDraf(it).ok) ui.pilihDraf[it.id] = true; }); paint(); }
    else if (a === 'draf-bayar') bayarBanyak();
    else if (a === 'draf-hapus') { hapusDraf(b.dataset.id); if (ST._id === b.dataset.id) { bersihBerkas(); order = null; ST = baru(); langkah = 0; } paint(); }
    else if (a === 'draf-baru') { tulisDraf(); bersihBerkas(); order = null; ST = baru(); langkah = 0; errors = {}; paint(); window.scrollTo(0, 0); }
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
    idbBuka().then(function () { if ($root && ST && ST.paket) paint(); });
    $root.addEventListener('input', onInput);
    $root.addEventListener('change', onChange);
    $root.addEventListener('click', onClick);
    $root.addEventListener('submit', function (e) { e.preventDefault(); });
    paint();
  }

  function bersihkan() {   // dipanggil setelah pembayaran sukses
    clearTimeout(simpanT); var idSekarang = ST && ST._id; if (idSekarang) idbHapusDraf(idSekarang);
    bersihBerkas(); order = null; ST = baru(); langkah = 0; ui = { sibuk: false, pay: null, kompres: false, queryDipakai: '', simpanAktif: false };
    try { if (idSekarang) hapusDraf(idSekarang); localStorage.removeItem(KEY_DRAF); } catch (e) { /* abaikan */ }
  }

  window.Form = { view: view, after: after, bersihkan: bersihkan, bersihkanGrup: bersihkanGrup, KEY_ORDER: KEY_ORDER };
})();
