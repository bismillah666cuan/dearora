/* ==========================================================
   VIEWS — setiap fungsi mengembalikan string HTML satu halaman.
   ctx = { data, status ('loading'|'ready'|'error'), query }
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI;
  var esc = U.esc, ic = U.ic;

  /* ---------- Teks yang bergantung data paket ---------- */
  function masaAktifRingkas(ctx) {
    var d = (ctx.data && ctx.data.paket) || [];
    function cari(id, cad) { var p = d.filter(function (x) { return x.id === id; })[0]; return p ? U.formatMasa(p.masaAktifHari) : cad; }
    return { basic: cari('basic', '10 hari'), premium: cari('premium', '30 hari'), special: cari('special', '1 tahun') };
  }
  /** "Basic 10 hari dan Special 1 tahun" — hanya paket yang sedang aktif di toko. */
  function daftarMasa(ctx) {
    var d = (ctx.data && ctx.data.paket) || [];
    var arr = d.length ? d.map(function (p) { return p.nama + ' ' + U.formatMasa(p.masaAktifHari); }) : ['Basic 10 hari', 'Special 1 tahun'];
    return arr.length > 1 ? arr.slice(0, -1).join(', ') + ' dan ' + arr[arr.length - 1] : arr[0];
  }
  function adaPaket(ctx, id) { var d = ctx.data && ctx.data.paket; return !d || !d.length || d.some(function (p) { return p.id === id; }); }
  function kontak(ctx) {
    var e = ctx.data && ctx.data.config && ctx.data.config.KONTAK_EMAIL;
    return e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? String(e) : '';
  }

  /* ---------- FAQ (dipakai di Home dan halaman FAQ) ---------- */
  function faqItems(ctx) {
    var otoPremium = adaPaket(ctx, 'premium');
    return [
      { q: 'Berapa lama masa aktif website ucapan?',
        a: '<p>Masa aktif dihitung sejak link aktif: <strong>' + esc(daftarMasa(ctx)) + '</strong>. Setelah itu link dinonaktifkan dan foto serta isi pesan dihapus.</p>' },
      { q: 'Seperti apa ucapan yang diterima penerima?',
        a: '<p>Penerima membuka link di HP-nya dan menikmati sebuah perjalanan kecil: layar pembuka, sapaan dengan nama mereka, <strong>surat</strong> yang dibuka dengan animasi, lalu satu <strong>kejutan</strong> yang dimainkan, dan terakhir album foto kenangan.</p>' },
      { q: 'Apa saja pilihan kejutannya?',
        a: '<p>Delapan jenis: <strong>kotak kado</strong>, <strong>kuis kecil</strong> (pertanyaanmu sendiri), <strong>gosok untuk melihat</strong>, <strong>pilih ceritamu</strong>, <strong>kode rahasia</strong>, <strong>tiup lilin</strong>, <strong>taman bunga</strong>, dan <strong>seberapa besar cintaku</strong>. Di form pemesanan ada tombol "Lihat contoh" untuk mencobanya dulu.</p>' },
      { q: 'Apa itu "Link Random"?',
        a: '<p>Alamat link dibuat acak dan unik sehingga tidak bisa ditebak. Hanya orang yang kamu beri link yang bisa membuka ucapanmu.</p>' },
      { q: 'Apakah foto dan pesan saya aman?',
        a: '<p>Foto hanya dipakai untuk membuat ucapan pesananmu, tidak dijual, tidak dipakai untuk iklan, dan tidak ditampilkan di galeri publik tanpa izin tertulis. Data kontakmu (nama, WhatsApp, email) tidak pernah tampil di halaman ucapan.</p>' },
      { q: 'Bagaimana cara membuat ucapannya?',
        a: '<p>Tekan <strong>Buat Ucapan</strong>, pilih paket, isi nama penerima, tulis surat, pilih jenis kejutan, unggah foto, pilih desain, lalu bayar. Kamu akan mendapat <strong>kode redeem</strong> untuk memantau pesanan, dan link ucapan setelah jadi.</p>' },
      { q: 'Metode pembayaran apa yang tersedia?',
        a: '<p>Pembayaran lewat payment gateway dengan metode populer seperti QRIS, virtual account, dan e-wallet (sesuai yang tersedia saat checkout). Konfirmasinya otomatis, tanpa perlu kirim bukti transfer.</p>' },
      { q: 'Berapa lama ucapan jadi?',
        a: '<p>Paket Basic dibuat otomatis dan link aktif beberapa menit setelah pembayaran terkonfirmasi. Paket Special dikerjakan manual dengan desain khusus, estimasi 1–2 hari kerja (bukan jaminan pasti).</p>' },
      { q: 'Apakah saya bisa merevisi ucapan?',
        a: '<p>Paket Basic tanpa revisi, jadi periksa data sebelum membayar. Paket Special mendapat <strong>1× revisi gratis</strong> untuk perubahan teks, foto, atau urutan (bukan mengganti konsep total).</p>' },
      { q: 'Bolehkah mengirim sebagai inisial atau anonim?',
        a: '<p>Boleh. Kamu bisa memilih tampil dengan nama lengkap, inisial, atau anonim. Identitas pengirim anonim tidak ditampilkan ke penerima, namun tetap tercatat internal sesuai Kebijakan Privasi.</p>' }
    ];
  }

  /* ---------- Bagian-bagian halaman ---------- */
  function hero() {
    return '<section class="hero" aria-labelledby="hero-title"><div class="container hero-grid">' +
      '<div class="hero-copy">' +
        '<span class="pill-tag">' + ic('sparkles') + ' Premium Kartu Ucapan Digital</span>' +
        '<h1 class="display" id="hero-title">Dearora — Kirimkan Rasa &amp; Cerita Lewat <span class="text-accent">Website Ucapan</span> Spesial</h1>' +
        '<p class="lead">Lebih dari sekadar kartu atau pesan singkat. Rangkai surat personal dan pilih kejutan interaktif seperti kado, kuis, atau taman bunga, lalu kirim ke orang tersayang lewat satu link.</p>' +
        '<div class="hero-cta">' +
          '<a class="btn btn-primary" href="#/buat">' + ic('heart') + ' Buat Ucapan Sekarang</a>' +
          '<a class="btn btn-secondary" href="#/contoh-desain">Lihat Contoh Desain</a>' +
        '</div>' +
        '<ul class="hero-trust" aria-label="Keunggulan singkat">' +
          '<li><span>' + ic('zap') + ' Jadi dalam hitungan menit*</span></li>' +
          '<li><span>' + ic('card') + ' Pembayaran otomatis</span></li>' +
          '<li><span>' + ic('lock') + ' Link random &amp; privat</span></li>' +
        '</ul>' +
        '<p class="small muted" style="margin-top:.5rem">*Paket Basic. Paket Special dikerjakan manual 1–2 hari kerja.</p>' +
      '</div>' +
      '<div class="hero-visual" aria-hidden="true">' +
        '<div class="hero-blob"></div>' +
        '<div class="phone"><div class="phone-screen theme theme-blossom"><span class="phone-notch"></span>' +
          U.partikel(8, 'heart') +
          '<div class="demo-layer demo-cover"><span class="ico">' + ic('heart') + '</span>' +
            '<p style="font-weight:700;letter-spacing:.06em;font-size:.75rem">UNTUK RANI</p>' +
            '<h3>Selamat Ulang Tahun!</h3><p>Ada kejutan kecil untukmu hari ini.</p>' +
            '<span class="demo-open" style="display:inline-grid;place-items:center;animation:none">Buka Kejutan</span></div>' +
        '</div></div>' +
        '<span class="float-badge fb-1"><span class="tile">' + ic('zap') + '</span>Praktis</span>' +
        '<span class="float-badge fb-2"><span class="tile lav">' + ic('heart') + '</span>100% Personal</span>' +
        '<span class="float-badge fb-3"><span class="tile">' + ic('shield') + '</span>Link Random &amp; Aman</span>' +
      '</div>' +
    '</div></section>';
  }

  function kategori(ctx, judulLengkap) {
    var d = (ctx.data && ctx.data.desain) || [];
    var cards = U.KATEGORI.map(function (k) {
      var n = d.filter(function (x) { return x.kategori === k.key; }).length;
      var info = ctx.status === 'ready' ? (n + ' desain') : 'Lihat desain';
      return '<a class="card card-hover cat-card reveal" href="#/contoh-desain?kategori=' + encodeURIComponent(k.key) + '">' +
        '<div class="cat-top"><span class="icon-tile ' + k.tone + '">' + ic(k.icon) + '</span><span class="tag ' + k.tone + '">' + esc(k.tag) + '</span></div>' +
        '<h3 class="h3">' + esc(k.judul) + '</h3><p>' + esc(k.desc) + '</p>' +
        '<span class="link-arrow">' + esc(info) + ' ' + ic('arrow') + '</span></a>';
    }).join('');
    return '<section class="section" aria-labelledby="kategori-title"><div class="container">' +
      '<div class="section-head-row"><div><span class="eyebrow">Inspirasi Momen</span>' +
      '<h2 class="h2" id="kategori-title">Kategori Ucapan Paling Dicari</h2>' +
      '<p class="lead" style="margin-top:.5rem">Pilih momen yang paling pas, lalu rangkai ucapanmu.</p></div>' +
      '<a class="link-arrow" href="#/contoh-desain">Lihat semua desain ' + ic('arrow') + '</a></div>' +
      '<div class="grid grid-cats">' + cards + '</div></div></section>';
  }

  function keunggulan() {
    var items = [
      { i: 'link', t: 'Link Privat & Terlindungi', tone: '', p: 'Alamat link dibuat acak sehingga tidak bisa ditebak. Hanya yang kamu beri link yang bisa membuka.' },
      { i: 'sparkles', t: 'Pengalaman Interaktif', tone: 'lav', p: 'Bukan teks biasa: ada sapaan, surat yang dibuka dengan animasi, lalu kejutan yang dimainkan penerima.' },
      { i: 'gift', t: '8 Jenis Kejutan', tone: '', p: 'Kado, kuis, gosok, kode rahasia, tiup lilin, taman bunga, dan lainnya. Kamu yang memilih.' },
      { i: 'zap', t: 'Tanpa Ribet & Otomatis', tone: 'sage', p: 'Pesan dari HP tanpa tatap muka. Pembayaran terkonfirmasi otomatis dan link aktif beberapa menit.' }
    ];
    return '<section class="section section-alt" aria-labelledby="unggul-title"><div class="container">' +
      '<div class="section-head"><span class="eyebrow">Keunggulan Layanan</span>' +
      '<h2 class="h2" id="unggul-title">Bukan Sekadar Pesan Chat Biasa</h2>' +
      '<p class="lead">Ucapan yang terasa dirancang khusus, bukan hasil salin-tempel.</p></div>' +
      '<div class="grid grid-feats">' + items.map(function (x) {
        return '<div class="card feat-card reveal"><span class="icon-tile ' + x.tone + '">' + ic(x.i) + '</span>' +
          '<h3 class="h3">' + esc(x.t) + '</h3><p>' + esc(x.p) + '</p></div>';
      }).join('') + '</div></div></section>';
  }

  function blokData(ctx, isi) {
    if (ctx.status === 'error') return U.errorBox('Data belum bisa dimuat. Periksa koneksi internet Anda lalu coba lagi.');
    return isi;
  }

  function previewDesain(ctx) {
    var body;
    if (ctx.status === 'loading') body = '<div class="grid grid-designs">' + U.skeletons(3, 'sk-card') + '</div>';
    else if (ctx.status === 'error') body = U.errorBox();
    else {
      var d = ctx.data.desain.slice(0, 3);
      body = d.length ? '<div class="grid grid-designs">' + d.map(function (x) { return U.designCard(x, ctx.data.paket); }).join('') + '</div>'
        : '<div class="state-box"><p>Contoh desain segera hadir.</p></div>';
    }
    return '<section class="section" aria-labelledby="prev-title"><div class="container">' +
      '<div class="section-head-row"><div><span class="eyebrow">Katalog Populer</span>' +
      '<h2 class="h2" id="prev-title">Preview Desain Website Ucapan</h2>' +
      '<p class="lead" style="margin-top:.5rem">Coba dulu demonya sebelum memilih.</p></div>' +
      '<a class="link-arrow" href="#/contoh-desain">Lihat semua ' + ic('arrow') + '</a></div>' + body + '</div></section>';
  }

  function callLinkRandom() {
    return '<div class="callout"><span class="icon-tile">' + ic('lock') + '</span><div>' +
      '<p><strong>Apa itu "Link Random" di Dearora?</strong></p>' +
      '<p>Alamat link dibuat acak dan unik sehingga tidak bisa ditebak. Hanya orang yang kamu beri link yang bisa membuka ucapanmu.</p></div></div>';
  }

  function paketBlok(ctx, tampilkanCallout) {
    var body;
    if (ctx.status === 'loading') body = '<div class="pricing">' + U.skeletons(3, 'sk-plan') + '</div>';
    else if (ctx.status === 'error') body = U.errorBox();
    else body = '<div class="pricing">' + ctx.data.paket.map(U.planCard).join('') + '</div>';
    return body + (tampilkanCallout ? callLinkRandom() : '');
  }

  function paketHome(ctx) {
    return '<section class="section section-alt" aria-labelledby="paket-title"><div class="container">' +
      '<div class="section-head"><span class="eyebrow">Harga Transparan</span>' +
      '<h2 class="h2" id="paket-title">Pilih Paket Kartu Ucapan Kamu</h2>' +
      '<p class="lead">Satu kali bayar, tanpa langganan. Pilih yang paling sesuai dengan momenmu.</p></div>' +
      paketBlok(ctx, true) + '</div></section>';
  }

  var LANGKAH = [
    { i: 'card', t: 'Pilih Paket & Desain', p: 'Tentukan paket, lalu pilih desain dari contoh atau ceritakan ide sendiri.', tag: 'Langkah 1' },
    { i: 'pencil', t: 'Tulis Surat & Pilih Kejutan', p: 'Tulis suratmu, pilih jenis kejutan, lalu unggah foto-foto terbaik.', tag: 'Langkah 2' },
    { i: 'zap', t: 'Pembayaran Otomatis', p: 'Bayar lewat QRIS, VA, atau e-wallet. Kode redeem langsung kamu terima.', tag: 'Langkah 3' },
    { i: 'link', t: 'Link Jadi & Bagikan', p: 'Pantau progres di portal, lalu bagikan link ucapan ke orang spesialmu.', tag: 'Langkah 4' }
  ];
  function langkahGrid() {
    return '<div class="grid grid-steps">' + LANGKAH.map(function (s, i) {
      return '<div class="card step-card reveal"><span class="step-no" aria-hidden="true">' + (i + 1) + '</span>' +
        '<h3>' + esc(s.t) + '</h3><p>' + esc(s.p) + '</p><span class="tag lav">' + esc(s.tag) + '</span></div>';
    }).join('') + '</div>';
  }
  function caraKerjaHome() {
    return '<section class="section" aria-labelledby="cara-title"><div class="container">' +
      '<div class="section-head"><span class="eyebrow">Praktis &amp; Cepat</span>' +
      '<h2 class="h2" id="cara-title">Cara Kerja dalam 4 Langkah Mudah</h2>' +
      '<p class="lead">Tidak perlu daftar akun dulu. Cukup pesan, bayar, dan bagikan.</p></div>' + langkahGrid() + '</div></section>';
  }

  function faqHome(ctx) {
    return '<section class="section section-alt" aria-labelledby="faq-title"><div class="container">' +
      '<div class="section-head"><span class="eyebrow">Pertanyaan Umum</span>' +
      '<h2 class="h2" id="faq-title">Sering Ditanyakan (FAQ)</h2>' +
      '<p class="lead">Semua hal yang biasa ditanyakan sebelum memesan.</p></div>' +
      U.faqList(faqItems(ctx).slice(0, 4)) +
      '<p style="text-align:center;margin-top:1.5rem"><a class="link-arrow" href="#/faq">Lihat semua pertanyaan ' + ic('arrow') + '</a></p>' +
      '</div></section>';
  }

  function ctaBand() {
    return '<section class="section" aria-labelledby="cta-title"><div class="container"><div class="cta-band reveal">' +
      '<h2 class="h1" id="cta-title">Siap Buat Orang Spesialmu Tersenyum Hari Ini?</h2>' +
      '<p>Rangkai kata, tambahkan foto, dan biarkan Dearora mengubahnya menjadi kejutan yang tak terlupakan.</p>' +
      '<div class="cta-actions"><a class="btn btn-white" href="#/buat">' + ic('heart') + ' Mulai Buat Ucapan</a>' +
      '<a class="btn btn-ghost-light" href="#/contoh-desain">Lihat Contoh Desain</a></div></div></div></section>';
  }

  function kepalaHalaman(eyebrow, judul, lead) {
    return '<header class="page-head"><div class="container">' +
      '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>' + esc(eyebrow) + '</span></nav>' +
      '<h1 class="h1">' + esc(judul) + '</h1>' + (lead ? '<p class="lead">' + esc(lead) + '</p>' : '') + '</div></header>';
  }

  /* ========================= HALAMAN ========================= */

  function home(ctx) {
    return hero() + kategori(ctx) + keunggulan() + previewDesain(ctx) + paketHome(ctx) + caraKerjaHome() + faqHome(ctx) + ctaBand();
  }

  function contohDesain(ctx) {
    var q = ctx.query || {};
    var fk = q.kategori || '';
    var fp = (q.paket || '').toLowerCase();
    var kats = '<button type="button" class="chip" data-action="filter" data-k="kategori" data-v="" aria-pressed="' + (!fk) + '">Semua</button>' +
      U.KATEGORI.map(function (k) {
        return '<button type="button" class="chip" data-action="filter" data-k="kategori" data-v="' + esc(k.key) + '" aria-pressed="' + (fk === k.key) + '">' + esc(k.judul.split(' & ')[0]) + '</button>';
      }).join('');
    var pakets = ((ctx.data && ctx.data.paket) || []);
    var pk = '<button type="button" class="chip" data-action="filter" data-k="paket" data-v="" aria-pressed="' + (!fp) + '">Semua paket</button>' +
      pakets.map(function (p) {
        return '<button type="button" class="chip" data-action="filter" data-k="paket" data-v="' + esc(p.id) + '" aria-pressed="' + (fp === p.id) + '">' + esc(p.nama) + '</button>';
      }).join('');

    var body;
    if (ctx.status === 'loading') body = '<div class="grid grid-designs">' + U.skeletons(6, 'sk-card') + '</div>';
    else if (ctx.status === 'error') body = U.errorBox();
    else {
      var list = ctx.data.desain.filter(function (d) {
        return (!fk || d.kategori === fk) && (!fp || (d.paket || []).indexOf(fp) >= 0);
      });
      body = list.length
        ? '<p class="small muted" role="status" style="margin-bottom:1rem">' + list.length + ' desain ditemukan</p><div class="grid grid-designs">' + list.map(function (d) { return U.designCard(d, ctx.data.paket); }).join('') + '</div>'
        : '<div class="state-box" role="status"><p>Belum ada desain untuk filter ini. Coba pilih kategori atau paket lain.</p><button type="button" class="btn btn-secondary btn-sm" data-action="reset-filter">Hapus Filter</button></div>';
    }
    return kepalaHalaman('Contoh Desain', 'Contoh Desain Website Ucapan', 'Jelajahi desain, coba demonya, lalu pilih yang paling cocok untuk momenmu.') +
      '<section class="section" style="padding-top:2rem"><div class="container">' +
      '<div class="filters"><div><p class="filter-label">Kategori</p><div class="chip-row">' + kats + '</div></div>' +
      '<div><p class="filter-label">Paket</p><div class="chip-row">' + pk + '</div></div></div>' + body +
      '<div class="callout"><span class="icon-tile">' + ic('pencil') + '</span><div><p><strong>Punya ide sendiri?</strong></p>' +
      '<p>Tidak menemukan yang pas? Saat memesan, pilih "Saya punya ide sendiri" dan ceritakan konsep, warna, serta mood yang kamu inginkan.</p></div></div>' +
      '</div></section>';
  }

  var PERBANDINGAN = [
    ['Tema / desain', 'Tema dasar', 'Template premium', 'Desain eksklusif & layout kustom'],
    ['Animasi', 'Sederhana', 'Animasi & efek visual', 'Sesuai desain eksklusif'],
    ['Musik latar', 0, 1, 1],
    ['Timeline kenangan & galeri foto', 0, 1, 1],
    ['Pesan personal dari pengirim', 0, 1, 1],
    ['Surprise (amplop digital, pesan rahasia)', 0, 0, 1],
    ['Password pesan rahasia (opsional)', 0, 0, 1],
    ['Atur urutan cerita & tampilan pembuka', 0, 0, 1],
    ['Revisi', 0, 0, '1× gratis']
  ];
  function tabelBanding(ctx) {
    var ids = ['basic', 'premium', 'special'];
    var p = {};
    (ctx.data.paket || []).forEach(function (x) { p[x.id] = x; });
    if (!ids.every(function (id) { return p[id]; })) return '';
    function sel(v) {
      if (v === 1) return '<td class="yes">' + ic('check') + '<span class="sr-only">Ya</span></td>';
      if (v === 0) return '<td class="no">' + ic('x') + '<span class="sr-only">Tidak</span></td>';
      return '<td>' + esc(v) + '</td>';
    }
    var head = '<tr><th scope="col">Fitur</th>' + ids.map(function (id) { return '<th scope="col">' + esc(p[id].nama) + '</th>'; }).join('') + '</tr>';
    var baris = '<tr><th scope="row">Harga</th>' + ids.map(function (id) { return '<td><strong>Rp ' + esc(U.rupiah(p[id].harga)) + '</strong></td>'; }).join('') + '</tr>' +
      '<tr><th scope="row">Masa aktif</th>' + ids.map(function (id) { return '<td>' + esc(U.formatMasa(p[id].masaAktifHari)) + '</td>'; }).join('') + '</tr>' +
      '<tr><th scope="row">Jumlah foto</th>' + ids.map(function (id) { return '<td>' + esc((p[id].fitur && p[id].fitur.foto) || (p[id].maksFoto + ' foto')) + '</td>'; }).join('') + '</tr>' +
      PERBANDINGAN.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th>' + sel(r[1]) + sel(r[2]) + sel(r[3]) + '</tr>'; }).join('') +
      '<tr><th scope="row">Pembuatan</th>' + ids.map(function (id) { return '<td>' + esc((p[id].fitur && p[id].fitur.pembuatan) || '-') + '</td>'; }).join('') + '</tr>';
    return '<h2 class="h2" style="margin-top:3rem;text-align:center">Bandingkan Paket</h2>' +
      '<div class="compare-wrap" tabindex="0" role="region" aria-label="Tabel perbandingan paket, dapat digulir ke samping">' +
      '<table class="compare"><thead>' + head + '</thead><tbody>' + baris + '</tbody></table></div>';
  }
  function paketHalaman(ctx) {
    return kepalaHalaman('Paket & Harga', 'Paket & Harga', 'Satu kali bayar, tanpa langganan. Tidak ada biaya tersembunyi.') +
      '<section class="section" style="padding-top:2.5rem"><div class="container">' + paketBlok(ctx, true) +
      (ctx.status === 'ready' ? tabelBanding(ctx) : '') + '</div></section>' + ctaBand();
  }

  function caraKerjaHalaman(ctx) {
    var m = masaAktifRingkas(ctx);
    return kepalaHalaman('Cara Kerja', 'Cara Kerja Dearora', 'Dari memilih paket sampai link ucapan siap dibagikan.') +
      '<section class="section" style="padding-top:2.5rem"><div class="container">' + langkahGrid() +
      '<div class="callout"><span class="icon-tile">' + ic('clock') + '</span><div><p><strong>Setelah link aktif</strong></p>' +
      '<p>Masa aktif dihitung sejak link aktif (' + esc(daftarMasa(ctx)) +
      '). Setelah itu link dan berkas dinonaktifkan otomatis dan tidak dapat dipulihkan.</p></div></div>' +
      '</div></section>' + ctaBand();
  }

  function faqHalaman(ctx) {
    return kepalaHalaman('FAQ', 'Sering Ditanyakan', 'Tidak menemukan jawabanmu? Hubungi kami lewat kontak resmi di bagian bawah halaman.') +
      '<section class="section" style="padding-top:2.5rem"><div class="container">' + U.faqList(faqItems(ctx)) + '</div></section>' + ctaBand();
  }

  function privasi(ctx) {
    var e = kontak(ctx);
    var kon = e ? 'melalui email <a class="text-accent" style="font-weight:700" href="mailto:' + esc(e) + '">' + esc(e) + '</a>' : 'melalui kontak resmi Dearora yang tercantum di situs ini';
    return kepalaHalaman('Kebijakan Privasi', 'Kebijakan Privasi', 'Cara Dearora mengumpulkan, memakai, dan melindungi datamu.') +
      '<section class="section" style="padding-top:2rem"><div class="container"><article class="prose">' +
      '<p class="updated">Berlaku sejak peluncuran layanan.</p>' +
      '<h2>1. Data yang dikumpulkan</h2><p>Nama, WhatsApp, dan email pembeli; isi ucapan; foto/video; catatan pesanan; serta data teknis dasar. Data pembayaran diproses oleh penyedia payment gateway. Dearora tidak menyimpan nomor kartu atau rekening pembeli.</p>' +
      '<h2>2. Tujuan penggunaan</h2><p>Membuat dan mengirim ucapan, mengonfirmasi pembayaran, mengirim email layanan, dan dukungan pelanggan.</p>' +
      '<h2>3. Pengelolaan foto</h2><p>Foto hanya dipakai untuk membuat ucapan pesanan tersebut, disimpan di penyimpanan terbatas, tidak dijual, tidak dipakai untuk iklan, dan tidak ditampilkan di galeri publik tanpa izin tertulis.</p>' +
      '<h2>4. Siapa yang dapat melihat</h2><p>Penerima (lewat link) hanya melihat isi ucapan. Admin dapat melihat data untuk keperluan pembuatan dan dukungan. Kontak pembeli tidak ditampilkan di halaman ucapan.</p>' +
      '<h2>5. Masa simpan dan penghapusan</h2><p>Berkas dihapus otomatis setelah masa aktif berakhir (ditambah masa tenggang). Pembeli dapat meminta penghapusan lebih awal.</p>' +
      '<h2>6. Keamanan</h2><p>Password disimpan dalam bentuk hash, akses admin dibatasi, dan link ucapan dibuat acak.</p>' +
      '<h2>7. Pihak ketiga</h2><p>Kami memakai payment gateway, layanan Google (Sheets, Drive, Gmail), dan Vercel untuk menjalankan layanan.</p>' +
      '<h2>8. Hak pembeli</h2><p>Kamu dapat meminta akses, koreksi, atau penghapusan data ' + kon + '.</p>' +
      '<h2>9. Pengirim anonim</h2><p>Identitas pengirim anonim tidak ditampilkan kepada penerima, tetapi tetap tercatat secara internal dan dapat diungkap kepada pihak berwenang jika ada penyalahgunaan sesuai hukum.</p>' +
      '<h2>10. Perubahan kebijakan dan kontak</h2><p>Kebijakan ini dapat diperbarui. Pertanyaan dapat disampaikan ' + kon + '.</p>' +
      '</article></div></section>';
  }

  function syarat(ctx) {
    var m = masaAktifRingkas(ctx);
    var e = kontak(ctx);
    var kon = e ? 'melalui email ' + esc(e) : 'melalui kontak resmi Dearora';
    return kepalaHalaman('Syarat & Ketentuan', 'Syarat & Ketentuan', 'Mohon dibaca sebelum melakukan pemesanan.') +
      '<section class="section" style="padding-top:2rem"><div class="container"><article class="prose">' +
      '<p class="updated">Berlaku sejak peluncuran layanan.</p>' +
      '<h2>1. Layanan</h2><p>Dearora adalah jasa pembuatan kartu ucapan digital dalam bentuk link website.</p>' +
      '<h2>2. Pembelian dan pembayaran</h2><p>Harga sesuai paket yang dipilih. Pembayaran dilakukan lewat payment gateway dan pesanan diproses setelah pembayaran terkonfirmasi. Pesanan yang tidak dibayar dalam batas waktu yang ditentukan akan dibatalkan otomatis.</p>' +
      '<h2>3. Konten</h2><p>Pembeli bertanggung jawab atas isi ucapan dan menyatakan berhak atas foto/video yang diunggah. Dilarang konten ancaman, pelecehan, pornografi, ujaran kebencian, penipuan, atau yang melanggar hukum. Dearora berhak menolak atau menghapus pesanan. Mengirim secara anonim tidak berarti kebal dari pelaporan.</p>' +
      '<h2>4. Link</h2><p>Link ucapan Basic dibuat acak dan hanya diketahui pemegangnya. Pembeli bertanggung jawab atas siapa saja yang diberi link. Pada paket Special, link dapat berupa nama pilihan; link yang mudah ditebak berarti isi ucapan lebih mudah ditemukan orang lain.</p>' +
      '<h2>5. Masa aktif link</h2><p>' + esc(daftarMasa(ctx)) + ', dihitung sejak link aktif. Setelah itu link dan berkas dihapus dan tidak dapat dipulihkan.</p>' +
      '<h2>6. Revisi</h2><p>Paket Basic tanpa revisi (periksa data sebelum membayar). Special mendapat 1× revisi gratis untuk perubahan teks, foto, dan urutan, bukan mengganti konsep total.</p>' +
      '<h2>7. Waktu pengerjaan</h2><p>Basic dibuat otomatis. Special dikerjakan manual dengan estimasi 1–2 hari kerja dan bukan jaminan pasti.</p>' +
      '<h2>8. Pembatalan dan pengembalian dana</h2><p>Tidak ada pengembalian dana setelah link aktif atau pengerjaan dimulai, kecuali terjadi kegagalan dari pihak Dearora.</p>' +
      '<h2>9. Hak kekayaan intelektual</h2><p>Desain, template, dan aset adalah milik Dearora. Desain bergaya "terinspirasi" tidak memakai logo atau merek pihak lain. Musik memakai lisensi yang sesuai.</p>' +
      '<h2>10. Batasan tanggung jawab, hukum, dan kontak</h2><p>Dearora tidak bertanggung jawab atas gangguan layanan pihak ketiga. Syarat ini tunduk pada hukum yang berlaku di Indonesia. Pertanyaan dapat disampaikan ' + kon + '.</p>' +
      '</article></div></section>';
  }

  function tidakAda() {
    return '<section class="section"><div class="container"><div class="card soon"><span class="icon-tile">' + ic('info') + '</span>' +
      '<h1 class="h1">Halaman Tidak Ditemukan</h1><p class="lead" style="margin-top:.75rem">Alamat yang kamu tuju tidak tersedia.</p>' +
      '<div class="hero-cta" style="justify-content:center"><a class="btn btn-primary" href="#/">Kembali ke Home</a></div></div></div></section>';
  }

  window.Views = {
    rute: {
      '': { judul: 'Kartu Ucapan Digital Berbentuk Website', view: home, nav: 'home' },
      'contoh-desain': { judul: 'Contoh Desain', view: contohDesain, nav: 'contoh-desain' },
      'paket': { judul: 'Paket & Harga', view: paketHalaman, nav: 'paket' },
      'cara-kerja': { judul: 'Cara Kerja', view: caraKerjaHalaman, nav: 'cara-kerja' },
      'faq': { judul: 'FAQ', view: faqHalaman, nav: 'faq' },
      'privasi': { judul: 'Kebijakan Privasi', view: privasi, nav: '' },
      'syarat': { judul: 'Syarat & Ketentuan', view: syarat, nav: '' },
      'buat': { judul: 'Buat Ucapan', view: function (c) { return window.Form.view(c); }, nav: 'buat', after: function (m, c) { window.Form.after(m, c); }, jagaState: true },
      'masuk': { judul: 'Masuk', view: function (c) { return window.Portal.viewMasuk(c); }, nav: 'portal', after: function (m, c) { window.Portal.afterMasuk(m, c); }, jagaState: true },
      'portal': { judul: 'Portal Saya', view: function (c) { return window.Portal.viewPortal(c); }, nav: 'portal', after: function (m, c) { window.Portal.afterPortal(m, c); }, jagaState: true },
      'pesanan': { judul: 'Detail Pesanan', view: function (c) { return window.Portal.viewDetail(c); }, nav: 'portal', after: function (m, c) { window.Portal.afterDetail(m, c); }, jagaState: true },
      'status': { judul: 'Status Pembayaran', view: function (c) { return window.Status.view(c); }, nav: '', after: function (m, c) { window.Status.after(m, c); }, jagaState: true }
    },
    tidakAda: tidakAda,
    kontak: kontak
  };
})();
