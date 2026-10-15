/* ==========================================================
   UI — helper dan komponen yang dipakai banyak halaman.
   Semua data dari API WAJIB lewat esc() sebelum masuk innerHTML.
   ========================================================== */
(function () {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }

  /** Ikon dari sprite di index.html */
  function ic(nama, extra) {
    return '<svg class="icon ' + (extra || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + nama + '"/></svg>';
  }

  function rupiah(n) { return new Intl.NumberFormat('id-ID').format(Number(n) || 0); }

  function formatMasa(hari) {
    hari = Number(hari) || 0;
    if (hari >= 365 && hari % 365 === 0) return (hari / 365) + ' tahun';
    return hari + ' hari';
  }

  /** Hanya izinkan URL https untuk gambar/tautan dari sheet. */
  function amanHttps(u) {
    try { var x = new URL(String(u)); return x.protocol === 'https:' ? x.href : ''; }
    catch (e) { return ''; }
  }

  /* ---------- Kategori ucapan (konten tetap; kunci = nilai kolom Kategori di sheet Desain) ---------- */
  var KATEGORI = [
    { key: 'Ulang Tahun', judul: 'Ulang Tahun', icon: 'gift', tone: '', tag: 'Terpopuler',
      desc: 'Ucapan hangat dan ceria untuk hari bertambahnya usia orang tersayang.' },
    { key: 'Anniversary', judul: 'Anniversary & Kisah Cinta', icon: 'heart', tone: '', tag: 'Romantis',
      desc: 'Perjalanan kalian berdua dalam satu halaman penuh kenangan.' },
    { key: 'Maaf & Rindu', judul: 'Permintaan Maaf & Rindu', icon: 'moon', tone: 'lav', tag: 'Dari Hati',
      desc: 'Sampaikan maaf atau rasa rindu dengan tulus, tanpa canggung.' },
    { key: 'Wisuda', judul: 'Wisuda & Pencapaian', icon: 'grad', tone: 'lav', tag: 'Pencapaian',
      desc: 'Rayakan kerja keras dan pencapaian besar orang yang kamu banggakan.' },
    { key: 'Terima Kasih', judul: 'Terima Kasih & Apresiasi', icon: 'smile', tone: 'sage', tag: 'Apresiasi',
      desc: 'Ungkapkan terima kasih untuk sahabat, guru, atau siapa pun yang berarti.' },
    { key: 'Hari Spesial', judul: 'Hari Ibu & Hari Spesial', icon: 'sparkles', tone: '', tag: 'Momen Spesial',
      desc: 'Hari Ibu, Hari Ayah, dan momen khusus lain yang layak dikenang.' },
    { key: 'Kelahiran', judul: 'Kelahiran & Keluarga Baru', icon: 'smile', tone: 'sage', tag: 'Menyambut Si Kecil',
      desc: 'Sambut bayi dan anggota keluarga baru dengan doa, foto, dan bintang.' }
  ];

  /** Kategori bawaan + kategori baru yang dibuat admin pada desain (urutan: bawaan dulu). */
  function daftarKategori(desain) {
    var hasil = KATEGORI.slice(), ada = {}; hasil.forEach(function (k) { ada[k.key] = true; });
    (desain || []).forEach(function (d) { var k = String(d.kategori || '').trim(); if (k && !ada[k]) { ada[k] = true; hasil.push({ key: k, judul: k, icon: 'sparkles', tone: '', tag: 'Baru', desc: 'Desain untuk momen ' + k + '.' }); } });
    return hasil;
  }
  function infoKategori(key) {
    for (var i = 0; i < KATEGORI.length; i++) if (KATEGORI[i].key === key) return KATEGORI[i];
    return { key: key, judul: key, icon: 'heart', tone: '', tag: '', desc: '' };
  }

  /* ---------- Contoh isi demo per kategori (data fiktif) ---------- */
  var CONTOH = {
    'Ulang Tahun': { judul: 'Selamat Ulang Tahun!', pesan: 'Semoga tahun ini penuh tawa, kejutan manis, dan semua doa yang kamu simpan diam-diam jadi nyata.' },
    'Anniversary': { judul: 'Untuk Kita Berdua', pesan: 'Terima kasih sudah memilih berjalan bersamaku, hari demi hari. Aku masih jatuh cinta seperti hari pertama.' },
    'Maaf & Rindu': { judul: 'Maaf, dan Aku Rindu', pesan: 'Maaf untuk kata-kata yang melukai. Aku rindu tawamu, dan ingin memperbaikinya pelan-pelan.' },
    'Wisuda': { judul: 'Selamat Wisuda!', pesan: 'Semua lelah, begadang, dan doa akhirnya sampai di hari ini. Kami bangga padamu.' },
    'Terima Kasih': { judul: 'Terima Kasih', pesan: 'Terima kasih sudah selalu ada, bahkan di hari-hari tersulit. Kebaikanmu lebih berarti dari yang kamu kira.' },
    'Kelahiran': { judul: 'Selamat Datang, Si Kecil', pesan: 'Selamat datang di dunia. Semoga kamu tumbuh sehat, bahagia, dan dikelilingi cinta.' },
    'Hari Spesial': { judul: 'Untuk Orang Tersayang', pesan: 'Terima kasih untuk cinta yang tak pernah meminta balasan. Hari ini, semua doa terbaikku untukmu.' }
  };

  /* ---------- Tema visual desain ---------- */
  function temaDari(thumbnail) {
    var m = /^tema:([a-z]+)$/.exec(String(thumbnail || ''));
    var k = m ? m[1] : 'classic';
    return window.Gaya ? window.Gaya.kunci(k) : k;      // kunci lama (blossom, confetti, ...) dipetakan ke gaya baru
  }
  function ikonTema(tema, kategori) {
    if (tema === 'cinema' || tema === 'arcade' || tema === 'grad') return tema === 'grad' ? 'grad' : 'sparkles';
    return infoKategori(kategori).icon;
  }

  function badgePaket(id, semuaPaket) {
    var p = (semuaPaket || []).filter(function (x) { return x.id === id; })[0];
    var nama = p ? p.nama : id;
    var tone = id === 'special' ? 'lav' : id === 'premium' ? '' : 'sage';
    return '<span class="tag ' + tone + '">' + esc(nama) + '</span>';
  }

  /** Partikel melayang (hati/kilau) untuk demo & hero. */
  function partikel(n, ikon) {
    var out = '<div class="particles" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var left = Math.round((i + 0.5) * (100 / n) + (Math.random() * 8 - 4));
      var size = 12 + Math.round(Math.random() * 14);
      var delay = (Math.random() * 6).toFixed(1);
      var dur = (6 + Math.random() * 4).toFixed(1);
      out += '<span style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:-' + delay + 's;animation-duration:' + dur + 's">' + ic(ikon) + '</span>';
    }
    return out + '</div>';
  }

  /* ---------- Komponen: thumbnail desain (adegan bergerak) ---------- */
  function thumbHTML(d, semuaPaket) {
    var key = window.Gaya ? window.Gaya.dari(d.thumbnail) : 'classic';
    var img = amanHttps(d.thumbnail);
    var tags = (d.paket || []).slice(0, 1).map(function (id) { return badgePaket(id, semuaPaket); }).join('');
    var isi;
    if (img) isi = '<img class="thumb-img" loading="lazy" decoding="async" src="' + esc(img) + '" alt="Pratinjau desain ' + esc(d.nama) + '">';
    else isi = window.Gaya ? window.Gaya.adegan(key) : '';
    return '<div class="design-thumb scene-wrap theme theme-' + key + '"><span class="badge-anim">' + ic('sparkles') + ' Interaktif</span>' + isi + '<span class="tombol-main">' + ic('play') + ' Coba demo</span></div>';
  }

  /* ---------- Komponen: kartu desain ---------- */
  function designCard(d, semuaPaket) {
    var kat = infoKategori(d.kategori), g = window.Gaya ? window.Gaya.ambil(window.Gaya.dari(d.thumbnail)) : {};
    var paketTags = (d.paket || []).map(function (id) { return badgePaket(id, semuaPaket); }).join('');
    var chip = (g.fitur || []).length ? '<ul class="fitur-chip" aria-label="Keistimewaan desain">' + g.fitur.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '';
    return '<article class="card card-hover design-card reveal">' +
      thumbHTML(d, semuaPaket) +
      '<div class="design-meta">' +
        '<div class="tags"><span class="tag lav">' + esc(kat.judul.split(' & ')[0]) + '</span>' + paketTags + '</div>' +
        '<h3>' + esc(d.nama) + '</h3>' + chip + (g.cocok ? '<p class="cocok"><strong>Cocok untuk:</strong> ' + esc(g.cocok) + '</p>' : '') +
        '<div class="design-actions">' +
          '<button type="button" class="btn btn-quiet btn-sm" data-action="demo" data-id="' + esc(d.id) + '">' + ic('play') + ' Coba Demo</button>' +
          '<a class="btn btn-secondary btn-sm" href="#/buat?desain=' + encodeURIComponent(d.id) + '">Pakai Desain</a>' +
        '</div>' +
      '</div></article>';
  }

  /** Paket tanpa desain aktif (kecuali Special yang custom) belum bisa dipesan: tampil "Segera hadir". */
  function paketSegera(p, desain) { return p.id !== 'special' && !(desain || []).some(function (x) { return (x.paket || []).indexOf(p.id) >= 0; }); }
  function paketUtama(arr) { return (arr || []).filter(function (p) { return (p.fitur || {}).kelompok !== 'undangan'; }); }
  function paketUndangan(arr) { return (arr || []).filter(function (p) { return (p.fitur || {}).kelompok === 'undangan'; })[0] || null; }
  function kartuUndangan(p, desain) {
    var f = p.fitur || {}, segera = paketSegera(p, desain);
    var fit = (f.fitur || []).map(function (x) { return '<li class="' + (x.ok ? 'ok' : 'no') + '">' + ic(x.ok ? 'check' : 'x') + '<span>' + esc(x.t) + '</span></li>'; }).join('');
    return '<article class="inv-card card" aria-labelledby="invNama"><div class="inv-kiri"><p class="inv-label">' + ic('mail') + ' Khusus undangan</p>' +
      '<h3 class="inv-nama" id="invNama">' + esc(p.nama) + ' <small>Undangan Digital</small></h3><p class="inv-tag">' + esc(f.tagline || '') + '</p>' +
      '<p class="inv-harga">Rp ' + esc(rupiah(p.harga)) + '</p><p class="inv-meta">Aktif ' + esc(formatMasa(p.masaAktifHari)) + ' · ' + esc(f.foto || (p.maksFoto + ' foto')) + '</p>' +
      (segera ? '<button type="button" class="btn btn-secondary" disabled>Segera hadir</button><p class="small muted">Desain undangannya sedang disiapkan.</p>' : '<a class="btn btn-primary" href="#/buat?paket=' + esc(p.id) + '">Pesan Undangan</a>') +
      '</div><ul class="inv-fitur">' + fit + '</ul></article>';
  }

  /** Paket yang ditandai rekomendasi ("Terfavorit"/"Terlaris") ditaruh di TENGAH agar jadi sorotan. */
  function susunPaket(arr) {
    var a = (arr || []).slice(), i = a.findIndex(function (p) { var f = p.fitur || {}; return !!f.rekomendasi; });
    if (i < 0 || a.length < 3) return a;
    var fav = a.splice(i, 1)[0]; a.splice(Math.floor(a.length / 2), 0, fav); return a;
  }

  /* ---------- Komponen: kartu paket ---------- */
  function planCard(p) {
    var f = p.fitur || {};
    var id = p.id;
    var fav = !!f.rekomendasi;
    var klas = 'plan card' + (fav ? ' plan-premium plan-fav' : '') + (id === 'special' ? ' plan-special' : '');
    var btn = fav ? 'btn-primary' : id === 'special' ? 'btn-lavender' : 'btn-quiet';
    var flag = f.badge ? '<span class="plan-flag">' + ic('sparkles') + ' ' + esc(f.badge) + '</span>' : '';
    var list = (f.fitur || []).map(function (x) {
      return '<li class="' + (x.ok ? 'yes' : 'no') + '">' + ic(x.ok ? 'check' : 'x') +
        '<span>' + (x.ok ? '' : '<span class="sr-only">Tidak termasuk: </span>') + esc(x.t) + '</span></li>';
    }).join('');
    var sub = '<span class="tag">' + esc(f.foto || (p.maksFoto + ' foto')) + '</span>' +
      '<span class="tag">Aktif ' + esc(formatMasa(p.masaAktifHari)) + '</span>';
    return '<article class="' + klas + ' reveal">' + flag +
      '<div class="plan-head"><h3 class="plan-name">' + esc(p.nama) + '</h3></div>' +
      '<p class="plan-tagline">' + esc(f.tagline || '') + '</p>' +
      '<div class="price" aria-label="Harga ' + esc(rupiah(p.harga)) + ' rupiah"><span class="cur">Rp</span><span class="amt">' + esc(rupiah(p.harga)) + '</span></div>' +
      '<div class="plan-sub">' + sub + '</div>' +
      '<ul class="plan-list">' + list + '</ul>' +
      '<a class="btn ' + btn + ' btn-block" href="#/buat?paket=' + encodeURIComponent(id) + '">Pilih Paket ' + esc(p.nama) + '</a>' +
      '</article>';
  }

  /* ---------- Komponen: skeleton & status ---------- */
  function skeletons(n, kls) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<div class="skeleton ' + kls + '" aria-hidden="true"></div>';
    return s;
  }
  function errorBox(pesan) {
    return '<div class="state-box" role="alert"><span class="icon-tile" style="margin:0 auto">' + ic('info') + '</span>' +
      '<p>' + esc(pesan || 'Data belum bisa dimuat. Periksa koneksi internet Anda.') + '</p>' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="retry">Coba Lagi</button></div>';
  }

  /* ---------- Komponen: FAQ ---------- */
  function faqList(items) {
    return '<div class="faq">' + items.map(function (it) {
      return '<details class="reveal"><summary><span>' + esc(it.q) + '</span>' + ic('chevron') + '</summary>' +
        '<div class="answer">' + it.a + '</div></details>';
    }).join('') + '</div>';
  }

  window.UI = {
    esc: esc, ic: ic, rupiah: rupiah, formatMasa: formatMasa, amanHttps: amanHttps,
    KATEGORI: KATEGORI, daftarKategori: daftarKategori, infoKategori: infoKategori, CONTOH: CONTOH,
    temaDari: temaDari, ikonTema: ikonTema, partikel: partikel,
    badgePaket: badgePaket, thumbHTML: thumbHTML, designCard: designCard, planCard: planCard, susunPaket: susunPaket, paketSegera: paketSegera, paketUtama: paketUtama, paketUndangan: paketUndangan, kartuUndangan: kartuUndangan,
    skeletons: skeletons, errorBox: errorBox, faqList: faqList
  };
})();
