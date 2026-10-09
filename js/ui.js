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
      desc: 'Hari Ibu, Hari Ayah, dan momen khusus lain yang layak dikenang.' }
  ];

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
    'Hari Spesial': { judul: 'Untuk Orang Tersayang', pesan: 'Terima kasih untuk cinta yang tak pernah meminta balasan. Hari ini, semua doa terbaikku untukmu.' }
  };

  /* ---------- Tema visual desain ---------- */
  var TEMA_VALID = ['blossom', 'confetti', 'cinema', 'dusk', 'grad', 'sage', 'rose', 'arcade'];
  function temaDari(thumbnail) {
    var m = /^tema:([a-z]+)$/.exec(String(thumbnail || ''));
    return m && TEMA_VALID.indexOf(m[1]) >= 0 ? m[1] : 'blossom';
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

  /* ---------- Komponen: thumbnail desain ---------- */
  function thumbHTML(d, semuaPaket) {
    var tema = temaDari(d.thumbnail);
    var img = amanHttps(d.thumbnail);
    var tags = (d.paket || []).slice(0, 1).map(function (id) { return badgePaket(id, semuaPaket); }).join('');
    var inner;
    if (img) {
      inner = '<img class="thumb-img" loading="lazy" decoding="async" src="' + esc(img) + '" alt="Pratinjau desain ' + esc(d.nama) + '">';
    } else {
      inner = '<div class="thumb-card"><span class="ico">' + ic(ikonTema(tema, d.kategori)) + '</span>' +
        '<span class="t">' + esc(d.nama) + '</span><span class="bar"></span><span class="bar s"></span></div>';
    }
    return '<div class="design-thumb theme theme-' + tema + '">' + inner + '</div>';
  }

  /* ---------- Komponen: kartu desain ---------- */
  function designCard(d, semuaPaket) {
    var kat = infoKategori(d.kategori);
    var paketTags = (d.paket || []).map(function (id) { return badgePaket(id, semuaPaket); }).join('');
    return '<article class="card card-hover design-card reveal">' +
      thumbHTML(d, semuaPaket) +
      '<div class="design-meta">' +
        '<div class="tags"><span class="tag lav">' + esc(kat.judul.split(' & ')[0]) + '</span>' + paketTags + '</div>' +
        '<h3>' + esc(d.nama) + '</h3>' +
        '<div class="design-actions">' +
          '<button type="button" class="btn btn-quiet btn-sm" data-action="demo" data-id="' + esc(d.id) + '">' + ic('play') + ' Lihat Demo</button>' +
          '<a class="btn btn-secondary btn-sm" href="#/buat?desain=' + encodeURIComponent(d.id) + '">Pakai Desain</a>' +
        '</div>' +
      '</div></article>';
  }

  /* ---------- Komponen: kartu paket ---------- */
  function planCard(p) {
    var f = p.fitur || {};
    var id = p.id;
    var klas = 'plan card' + (id === 'premium' || f.rekomendasi ? ' plan-premium' : '') + (id === 'special' ? ' plan-special' : '');
    var btn = (id === 'premium' || f.rekomendasi) ? 'btn-primary' : id === 'special' ? 'btn-lavender' : 'btn-quiet';
    var flag = f.badge ? '<span class="plan-flag">' + esc(f.badge) + '</span>' : '';
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
    KATEGORI: KATEGORI, infoKategori: infoKategori, CONTOH: CONTOH,
    temaDari: temaDari, ikonTema: ikonTema, partikel: partikel,
    badgePaket: badgePaket, thumbHTML: thumbHTML, designCard: designCard, planCard: planCard,
    skeletons: skeletons, errorBox: errorBox, faqList: faqList
  };
})();
