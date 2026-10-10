/* ==========================================================
   HALAMAN UCAPAN — /u/{kode}  (pengalaman interaktif)
   Perjalanan: Pembuka → Sapaan (+confetti) → Surat → Kejutan akhir → Kenangan.
   Kejutan akhir dipilih pembeli: kado, kuis, gosok, pilihan cerita, kode rahasia,
   tiup lilin (make a wish), taman bunga, atau "seberapa besar cintaku".
   • Hanya data ucapan (tanpa kontak pembeli) yang dimuat lewat getCard.
   • Pesan di balik KODE RAHASIA tidak ada di halaman; diminta ke server (unlockSecret).
   • Semua teks pengguna di-escape. Musik baru berbunyi setelah penerima mengetuk.
   • Mode demo (?demo=1&j=kado&tema=blossom) memakai data contoh tanpa backend.
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, ic = U.ic, API = window.DearoraAPI;
  var $root = document.getElementById('kartu'), cv = document.getElementById('confetti');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var data = null, slug = '', demo = false, audio = null, aktif = 0, stages = [], timers = [];
  var NAMA_TAHAP = ['buka', 'sapa', 'surat', 'kejutan', 'penutup'];

  /* ---------------- Util ---------------- */
  function q(s) { return $root.querySelector(s); }
  function jeda(fn, ms) { var t = setTimeout(fn, reduce ? Math.min(ms, 60) : ms); timers.push(t); return t; }
  function bersih() { timers.forEach(clearTimeout); timers = []; }
  function tgl(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(t)) : ''; }
  function fotoUrl(id) { return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w1600'; }
  function fotoCadangan(id) { return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w1600'; }
  function aman(u) { return /^https:\/\//.test(u) || /^assets\/[\w\-./]+$/.test(u) ? (/^assets\//.test(u) ? '/' + u : u) : ''; }
  function dariTeks(d) { return d.dari.tipe === 'anonim' ? 'Seseorang yang menyayangimu' : d.dari.nilai; }
  function warna() {
    var a = getComputedStyle($root).getPropertyValue('--tacc').trim() || '#E85D75';
    return [a, '#FFD166', '#FF8FA3', '#B79CFF', '#7BDFF2', '#FFFFFF'];
  }
  function ambilSlug() {
    var s = document.body.dataset.slug; if (s) return s;
    var k = new URLSearchParams(location.search).get('k'); if (k) return k;
    var m = /\/u\/([A-Za-z0-9]+)\/?$/.exec(location.pathname); return m ? m[1] : '';
  }

  /* ---------------- Confetti (kanvas ringan) ---------------- */
  var parts = [], raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function ukur() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; }
  window.addEventListener('resize', ukur); ukur();
  function confetti(x, y, n, opsi) {
    if (reduce) return; opsi = opsi || {};
    var w = warna(); n = Math.min(n, 160);
    for (var i = 0; i < n && parts.length < 420; i++) {
      var a = Math.random() * Math.PI * 2, v = (opsi.kuat || 9) * (0.4 + Math.random() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v * (opsi.lebar || 1), vy: Math.sin(a) * v - (opsi.naik || 5), g: 0.24, r: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: w[i % w.length], bulat: Math.random() < 0.35, umur: 0, maks: 90 + Math.random() * 70 });
    }
    if (!raf) raf = requestAnimationFrame(putar);
  }
  function hujan(ms) {
    if (reduce) return; var sampai = Date.now() + ms;
    (function tik() { confetti(Math.random() * innerWidth, -10, 4, { kuat: 3, naik: -2, lebar: 0.6 }); if (Date.now() < sampai) timers.push(setTimeout(tik, 90)); })();
  }
  function putar() {
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.umur++; p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.umur > p.maks || p.y > innerHeight + 20) { parts.splice(i, 1); continue; }
      c.save(); c.globalAlpha = Math.max(0, 1 - p.umur / p.maks); c.fillStyle = p.c; c.translate(p.x, p.y); c.rotate(p.rot);
      if (p.bulat) { c.beginPath(); c.arc(0, 0, p.r / 2, 0, 6.3); c.fill(); } else c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      c.restore();
    }
    raf = parts.length ? requestAnimationFrame(putar) : 0;
    if (!raf) c.clearRect(0, 0, innerWidth, innerHeight);
  }
  function dariElemen(el, n, opsi) { if (!el) return; var r = el.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, n, opsi); }

  /* ---------------- Teks bawaan ---------------- */
  var SAPAAN = {
    'Ulang Tahun': ['Selamat ulang tahun!', 'Hari ini semesta ikut merayakanmu.'],
    'Anniversary': ['Untuk kita berdua', 'Terima kasih sudah jadi bagian terindah dari ceritaku.'],
    'Maaf & Rindu': ['Ada yang ingin kusampaikan', 'Dari hati yang paling jujur.'],
    'Wisuda': ['Selamat, kamu berhasil!', 'Kerja kerasmu akhirnya berbuah manis.'],
    'Terima Kasih': ['Terima kasih, ya', 'Ada rasa syukur yang ingin kusampaikan.'],
    'Hari Spesial': ['Hari ini istimewa', 'Dan kamu juga istimewa.']
  };
  var JUDUL_KEJUTAN = {
    kado: ['Ada hadiah untukmu', 'Ketuk kotak kadonya untuk membukanya.'],
    kuis: ['Kuis kecil untukmu', 'Jawab dulu ya, ada kejutan di ujungnya.'],
    gosok: ['Gosok untuk melihat', ''],
    pilihan: ['Pilih ceritamu', 'Buka semuanya, satu per satu.'],
    kode: ['Ada pesan terkunci', ''],
    harapan: ['Buat permohonan', 'Pejamkan mata, buat harapan, lalu ketuk lilinnya untuk meniupnya.'],
    taman: ['Taman kecilmu', 'Ketuk tiap benih untuk menumbuhkannya.'],
    cinta: ['Seberapa besar cintaku?', 'Ketuk hatinya berkali-kali.']
  };

  /* ---------------- Data demo ---------------- */
  var UCAPAN_DEMO = 'Kamu adalah hadiah terbaik yang pernah kumiliki. Terima kasih sudah ada, dan selamat menikmati harimu!';
  var KEJ_DEMO = {
    kado: { jenis: 'kado', judul: 'Hadiah untukmu', ucapan: UCAPAN_DEMO },
    kuis: { jenis: 'kuis', ucapan: UCAPAN_DEMO, soal: [
      { q: 'Di mana kita pertama kali bertemu?', opsi: ['Di kampus', 'Di kafe kecil', 'Di taman kota'], benar: 1, rb: 'Betul! Kafe kecil itu tak pernah kulupakan.', rs: 'Hampir! Tapi kamu tetap yang terbaik.' },
      { q: 'Apa kenangan favoritku bersamamu?', opsi: ['Hujan-hujanan', 'Nonton bareng'], benar: 0, rb: 'Tepat sekali, kamu memang paling mengerti aku!', rs: 'Bukan itu, tapi aku suka jawabanmu.' }] },
    gosok: { jenis: 'gosok', petunjuk: 'Ada sesuatu yang selalu ingin kusampaikan…', ucapan: UCAPAN_DEMO },
    pilihan: { jenis: 'pilihan', ucapan: UCAPAN_DEMO, pilihan: [{ label: 'Buka kenangan manis', teks: 'Ingat saat kita tertawa sampai lupa waktu? Itu hari favoritku.' }, { label: 'Baca rahasiaku', teks: 'Diam-diam, aku selalu bangga padamu.' }, { label: 'Lihat kejutanmu', teks: 'Kejutannya ada di ujung cerita ini. Sedikit lagi!' }] },
    kode: { jenis: 'kode', petunjuk: 'Untuk mencoba, ketik: cinta' },
    harapan: { jenis: 'harapan', lilin: 3, ucapan: UCAPAN_DEMO },
    taman: { jenis: 'taman', bunga: ['Kamu kuat', 'Kamu hebat', 'Kamu dicintai'], ucapan: UCAPAN_DEMO },
    cinta: { jenis: 'cinta', target: 10, kalimat: ['Terus ketuk…', 'Cintaku makin besar!', 'Sedikit lagi…'], ucapan: UCAPAN_DEMO }
  };
  function dataDemo(qs) {
    var tema = U.temaDari('tema:' + (qs.get('tema') || 'blossom')), kat = SAPAAN[qs.get('kat')] ? qs.get('kat') : 'Ulang Tahun', j = KEJ_DEMO[qs.get('j')] ? qs.get('j') : 'kado';
    return { paket: 'basic', tema: tema, kategori: kat, penerima: 'Rani', dari: { tipe: 'nama', nilai: 'Dimas' }, pesan: (U.CONTOH[kat] || U.CONTOH['Ulang Tahun']).pesan,
      pesanPersonal: '', foto: [], video: '', musik: null, amplop: false, rahasia: j === 'kode', perluPassword: j === 'kode', pembuka: 'judul', kedaluwarsa: '', kejutan: KEJ_DEMO[j], _demo: true };
  }

  /* ---------------- Ilustrasi ---------------- */
  function ilustrasi() {
    return '<svg class="ilus" viewBox="0 0 200 160" role="img" aria-label="Ilustrasi hati dan bintang"><g fill="currentColor"><path d="M100 138S34 98 34 58c0-18 13-30 30-30 14 0 27 9 36 24 9-15 22-24 36-24 17 0 30 12 30 30 0 40-66 80-66 80z" opacity=".95"/>' +
      '<path d="m168 22 4 11 11 4-11 4-4 11-4-11-11-4 11-4zM28 24l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM172 108l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" opacity=".7"/></g></svg>';
  }
  function polaroid(d, idx, kls) {
    var id = d.foto[idx]; if (id == null) return '<div class="polaroid ilus-wrap ' + (kls || '') + '">' + ilustrasi() + '</div>';
    return '<figure class="polaroid ' + (kls || '') + '" data-foto="' + esc(id) + '"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Foto kenangan ' + (idx + 1) + '" src="' + esc(fotoUrl(id)) + '" data-alt="' + esc(fotoCadangan(id)) + '"></figure>';
  }

  /* ---------------- Tahap 1: pembuka ---------------- */
  function tBuka(d) {
    var kat = U.CONTOH[d.kategori] || { judul: 'Ada Pesan Untukmu' }, ikon = U.ikonTema(d.tema, d.kategori);
    var foto = d.pembuka === 'foto' && d.foto.length ? ' foto" style="background-image:url(\'' + esc(fotoUrl(d.foto[0])) + '\')' : '';
    return '<section class="stage buka' + foto + '" data-s="buka" aria-label="Pembuka"><div class="inner">' + (foto ? '' : U.partikel(8, d.tema === 'cinema' || d.tema === 'arcade' ? 'sparkles' : 'heart')) +
      '<span class="ico">' + ic(ikon) + '</span><p class="kpd">Untuk ' + esc(d.penerima) + '</p><h1 class="judul-buka" tabindex="-1">' + esc(kat.judul) + '</h1>' +
      '<p class="sub">Ada pesan spesial yang menunggumu.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Ucapan</button></div></section>';
  }

  /* ---------------- Tahap 2: sapaan ---------------- */
  function tSapa(d) {
    var s = SAPAAN[d.kategori] || SAPAAN['Hari Spesial'];
    return '<section class="stage sapa" data-s="sapa" aria-label="Sapaan"><div class="inner"><p class="kpd">Hai,</p><h1 class="nama-besar" tabindex="-1">' + esc(d.penerima) + '<span class="sparkle" aria-hidden="true">✦</span></h1>' +
      '<p class="sapa-1">' + esc(s[0]) + '</p><p class="sapa-2">' + esc(s[1]) + '</p><button type="button" class="cbtn" data-go="2">Lanjut ' + ic('arrow') + '</button></div></section>';
  }

  /* ---------------- Tahap 3: surat ---------------- */
  function tSurat(d) {
    return '<section class="stage surat" data-s="surat" aria-label="Surat"><div class="inner">' +
      '<p class="kpd" id="suratPetunjuk">Ada surat untukmu</p>' +
      '<button type="button" class="env" id="env" aria-label="Ketuk untuk membuka surat"><span class="env-back"></span><span class="env-letter"><i></i><i></i><i></i></span><span class="env-front"></span><span class="env-flap"></span><span class="env-seal">' + ic('heart') + '</span><span class="env-ring" aria-hidden="true"></span></button>' +
      '<p class="hint" id="suratHint">Ketuk suratnya</p>' +
      '<article class="letter" id="letter" hidden><p class="l-untuk">Untuk ' + esc(d.penerima) + ',</p><p class="l-isi" id="lIsi"></p>' +
      '<p class="l-tutup">Dengan sayang,</p><p class="l-ttd">' + esc(dariTeks(d)) + '</p></article>' +
      '<button type="button" class="cbtn lanjut" data-go="3" id="suratLanjut" hidden>Lanjut ' + ic('arrow') + '</button></div></section>';
  }
  function bukaSurat(d) {
    var env = q('#env'); if (!env || env.classList.contains('open')) return;
    env.classList.add('open'); q('#suratHint').hidden = true; q('#suratPetunjuk').hidden = true; dariElemen(env, 26, { kuat: 7 });
    jeda(function () { env.classList.add('rise'); }, 450);
    jeda(function () { env.classList.add('fall'); }, 1150);
    jeda(function () {
      var l = q('#letter'); l.hidden = false;
      var kata = String(d.pesan).split(/(\s+)/), isi = q('#lIsi'), html = '', i = 0;
      kata.forEach(function (k) { if (/^\s+$/.test(k)) html += k; else { html += '<span class="w" style="animation-delay:' + (reduce ? 0 : Math.min(i * 45, 2400)) + 'ms">' + esc(k) + '</span>'; i++; } });
      isi.innerHTML = html; requestAnimationFrame(function () { l.classList.add('show'); });
      var lama = reduce ? 100 : Math.min(i * 45, 2400) + 900;
      jeda(function () { var b = q('#suratLanjut'); b.hidden = false; b.classList.add('muncul'); }, lama);
    }, 1500);
    jeda(function () { env.hidden = true; }, 2300);
  }

  /* ---------------- Tahap 4: kejutan ---------------- */
  var KEJ = {};
  function KEJ_ADA(j) { return Object.prototype.hasOwnProperty.call(KEJ, j); }
  /** Pesanan lama tanpa data kejutan: kado dengan ucapan umum (atau kode bila ada pesan rahasia). */
  function kejutanAktif(d) {
    if (d.kejutan && KEJ_ADA(d.kejutan.jenis)) return d.kejutan;
    if (d.rahasia) return { jenis: 'kode', petunjuk: 'Masukkan kode dari pengirim.' };
    return { jenis: 'kado', ucapan: 'Terima kasih sudah membuka kejutan ini. Semoga harimu penuh bahagia!' };
  }
  function tKejutan(d) {
    var k = kejutanAktif(d), j = JUDUL_KEJUTAN[k.jenis] || JUDUL_KEJUTAN.kado;
    var sub = k.jenis === 'gosok' ? k.petunjuk : k.jenis === 'kode' ? (k.petunjuk || 'Masukkan kode dari pengirim.') : j[1];
    return '<section class="stage kejutan" data-s="kejutan" aria-label="Kejutan"><div class="inner wide"><p class="kpd">Kejutan</p><h1 class="judul-kej" tabindex="-1">' + esc(k.jenis === 'kado' && k.judul ? k.judul : j[0]) + '</h1>' +
      '<p class="sub-kej" id="subKej">' + esc(sub) + '</p><div class="arena" id="arena"></div>' +
      '<div class="finale" id="finale" hidden aria-live="polite"></div></div></section>';
  }
  function selesaiKejutan(teks, opsi) {
    var f = q('#finale'), ar = q('#arena'); if (!f || !f.hidden) return; opsi = opsi || {};
    if (!opsi.tetapArena) ar.classList.add('selesai');
    f.innerHTML = (opsi.tetapArena ? '' : '<p class="kpd">Untukmu</p><p class="ucapan-akhir">' + esc(teks) + '</p>') + polaroid(data, 0, 'kecil') +
      '<button type="button" class="cbtn" data-go="4">Lihat kenangan kita ' + ic('arrow') + '</button>';
    f.hidden = false; requestAnimationFrame(function () { f.classList.add('show'); });
    var s = q('#subKej'); if (s) s.hidden = true;
    var h = f.querySelector('.ucapan-akhir'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    dariElemen(f, 70, { kuat: 11 }); hujan(1800);
  }

  /* --- Kado --- */
  KEJ.kado = { siap: function (ar, k) {
    ar.innerHTML = '<button type="button" class="gift" id="gift" aria-label="Ketuk untuk membuka kado"><span class="g-glow"></span><span class="g-box"><i class="g-pita-v"></i><i class="g-pita-h"></i></span><span class="g-lid"><i class="g-pita-v"></i></span><span class="g-bow"><i></i><i></i></span></button>';
    var g = q('#gift'); g.addEventListener('click', function () {
      if (g.classList.contains('buka')) return; g.classList.add('buka'); dariElemen(g, 60, { kuat: 10, naik: 8 });
      jeda(function () { selesaiKejutan(k.ucapan); }, 1000);
    });
  } };

  /* --- Kuis --- */
  KEJ.kuis = { siap: function (ar, k) {
    var i = 0;
    function tampil() {
      var s = k.soal[i];
      ar.innerHTML = '<div class="kuis"><p class="k-no">Pertanyaan ' + (i + 1) + ' dari ' + k.soal.length + '</p><h2 class="k-q">' + esc(s.q) + '</h2><div class="k-opsi" role="group" aria-label="Pilihan jawaban">' +
        s.opsi.map(function (o, n) { return '<button type="button" class="opsi" data-n="' + n + '">' + esc(o) + '</button>'; }).join('') + '</div><p class="k-resp" id="kResp" role="status" aria-live="polite"></p><div class="k-nav" id="kNav"></div></div>';
      ar.querySelectorAll('.opsi').forEach(function (b) { b.addEventListener('click', function () { jawab(Number(b.dataset.n)); }); });
    }
    function jawab(n) {
      var s = k.soal[i], betul = n === s.benar;
      ar.querySelectorAll('.opsi').forEach(function (b, x) { b.disabled = true; if (x === s.benar) b.classList.add('benar'); else if (x === n) b.classList.add('salah'); });
      var r = q('#kResp'); r.textContent = betul ? s.rb : s.rs; r.className = 'k-resp ' + (betul ? 'ok' : 'no') + ' tampil';
      if (betul) dariElemen(q('.opsi.benar'), 26, { kuat: 7 });
      var nav = q('#kNav'), akhir = i === k.soal.length - 1;
      nav.innerHTML = '<button type="button" class="cbtn">' + (akhir ? 'Buka kejutannya' : 'Pertanyaan berikutnya') + ' ' + ic('arrow') + '</button>';
      nav.querySelector('button').addEventListener('click', function () { if (akhir) selesaiKejutan(k.ucapan); else { i++; tampil(); } });
      nav.querySelector('button').focus({ preventScroll: true });
    }
    tampil();
  } };

  /* --- Gosok --- */
  KEJ.gosok = { siap: function (ar, k) {
    ar.innerHTML = '<div class="gosok" id="gosok"><div class="g-isi"><span class="g-ico">' + ic('sparkles') + '</span><p class="g-teks">' + esc(k.ucapan) + '</p></div><canvas id="gCv" aria-hidden="true"></canvas></div><button type="button" class="link-kecil" id="gTampil">Tampilkan saja</button>';
    var box = q('#gosok'), c = q('#gCv'), done = false;
    function selesai() { if (done) return; done = true; c.classList.add('hilang'); q('#gTampil').hidden = true; dariElemen(box, 40, { kuat: 9 }); jeda(function () { selesaiKejutan(k.ucapan, { tetapArena: true }); }, 700); }
    q('#gTampil').addEventListener('click', selesai);
    function siapKanvas() {
      var r = box.getBoundingClientRect(), d2 = Math.min(window.devicePixelRatio || 1, 2); c.width = r.width * d2; c.height = r.height * d2;
      var x = c.getContext('2d'); x.scale(d2, d2);
      var gr = x.createLinearGradient(0, 0, r.width, r.height); gr.addColorStop(0, '#CFC8DA'); gr.addColorStop(0.5, '#F1EDF6'); gr.addColorStop(1, '#B9B1C8'); x.fillStyle = gr; x.fillRect(0, 0, r.width, r.height);
      x.fillStyle = 'rgba(80,70,100,.35)'; x.font = '700 15px system-ui, sans-serif'; x.textAlign = 'center'; x.fillText('Gosok di sini', r.width / 2, r.height / 2 + 5);
      x.fillStyle = '#000'; x.globalCompositeOperation = 'destination-out';      // warna harus OPAK agar benar-benar menghapus
      var gambar = false, hitung = 0;
      function titik(ev) { var b = c.getBoundingClientRect(); x.beginPath(); x.arc(ev.clientX - b.left, ev.clientY - b.top, 24, 0, 6.3); x.fill(); if (++hitung % 6 === 0) cek(); }
      function cek() {
        var im = x.getImageData(0, 0, c.width, c.height).data, bening = 0, total = 0;
        for (var p = 3; p < im.length; p += 4 * 37) { total++; if (im[p] < 40) bening++; }
        if (bening / total > 0.5) selesai();
      }
      c.addEventListener('pointerdown', function (e) { gambar = true; c.setPointerCapture(e.pointerId); titik(e); });
      c.addEventListener('pointermove', function (e) { if (gambar) titik(e); });
      c.addEventListener('pointerup', function () { gambar = false; cek(); });
      c.addEventListener('pointercancel', function () { gambar = false; });
    }
    requestAnimationFrame(siapKanvas);
  } };

  /* --- Pilihan cerita --- */
  KEJ.pilihan = { siap: function (ar, k) {
    var lihat = {};
    ar.innerHTML = '<div class="pilihan"><div class="p-tombol">' + k.pilihan.map(function (p, n) { return '<button type="button" class="opsi p-btn" data-n="' + n + '">' + esc(p.label) + '</button>'; }).join('') + '</div><div class="p-cerita" id="pCerita" role="region" aria-live="polite"><p class="muted-kej">Pilih salah satu tombol di atas.</p></div><div id="pNav"></div></div>';
    ar.querySelectorAll('.p-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = Number(b.dataset.n); lihat[n] = true; b.classList.add('dibuka');
        var c = q('#pCerita'); c.classList.remove('baru'); void c.offsetWidth; c.innerHTML = '<p class="cerita-teks">' + esc(k.pilihan[n].teks) + '</p>'; c.classList.add('baru');
        dariElemen(b, 14, { kuat: 5 });
        if (Object.keys(lihat).length === k.pilihan.length && !q('#pNav button')) {
          q('#pNav').innerHTML = '<button type="button" class="cbtn">Buka kejutan penutup ' + ic('arrow') + '</button>';
          q('#pNav button').addEventListener('click', function () { selesaiKejutan(k.ucapan); });
        }
      });
    });
  } };

  /* --- Kode rahasia --- */
  KEJ.kode = { siap: function (ar, k) {
    var tanpaKode = data.perluPassword === false;
    ar.innerHTML = '<div class="kode"><span class="k-kunci">' + ic('lock') + '</span><form id="fKode" novalidate>' + (tanpaKode ? '' : '<label for="inKode" class="sr-only">Kode rahasia</label><input id="inKode" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="30" placeholder="Ketik kode…">') +
      '<p class="k-galat" id="kGalat" role="alert" hidden></p><button type="submit" class="cbtn">' + (tanpaKode ? 'Buka pesan' : 'Buka kunci') + '</button></form></div>';
    var f = q('#fKode'), inp = q('#inKode'); if (inp) inp.focus({ preventScroll: true });
    function buka(teks) { q('.kode').classList.add('terbuka'); dariElemen(q('.kode'), 30, { kuat: 8 }); jeda(function () { selesaiKejutan(teks); }, 700); }
    f.addEventListener('submit', async function (ev) {
      ev.preventDefault(); var b = f.querySelector('button'), g = q('#kGalat'), pw = inp ? inp.value : ''; g.hidden = true; b.disabled = true; var asli = b.textContent; b.textContent = 'Memeriksa…';
      try {
        if (demo) { if (String(pw).toLowerCase().replace(/[\s.\-\/_,:;]/g, '') === 'cinta') { buka(UCAPAN_DEMO); return; } throw { pesan: 'Kode belum tepat. Coba lagi ya.' }; }
        var r = await API.post('unlockSecret', { k: slug, password: pw }, { timeout: 20000 });
        if (r.success) { buka(r.data.pesan); return; }
        throw { pesan: r.message || 'Kode belum tepat.' };
      } catch (e) { g.hidden = false; g.textContent = e && e.pesan ? e.pesan : 'Koneksi bermasalah. Coba lagi.'; f.classList.remove('goyang'); void f.offsetWidth; f.classList.add('goyang'); b.disabled = false; b.textContent = asli; }
    });
  } };

  /* --- Tiup lilin --- */
  KEJ.harapan = { siap: function (ar, k) {
    var n = k.lilin || 3, padam = 0, c = '';
    for (var i = 0; i < n; i++) c += '<button type="button" class="candle" aria-label="Tiup lilin ke-' + (i + 1) + '"><i class="flame"></i><i class="stick"></i></button>';
    ar.innerHTML = '<div class="cake"><div class="candles">' + c + '</div><div class="tier t2"><i class="drip"></i></div><div class="tier t1"><i class="drip"></i></div><div class="plate"></div></div>';
    ar.querySelectorAll('.candle').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('padam')) return; b.classList.add('padam'); padam++; dariElemen(b, 10, { kuat: 4 });
        if (padam === n) jeda(function () { selesaiKejutan(k.ucapan); }, 700);
      });
    });
  } };

  /* --- Taman --- */
  var BUNGA = ['#FF8FA3', '#FFD166', '#B79CFF', '#7BDFF2', '#FF9F6B'];
  KEJ.taman = { siap: function (ar, k) {
    var mekar = 0, n = k.bunga.length, tot = '';
    for (var i = 0; i < n; i++) {
      var petal = ''; for (var p = 0; p < 7; p++) petal += '<i class="petal" style="--r:' + (p * 51.4).toFixed(1) + 'deg;--c:' + BUNGA[i % BUNGA.length] + '"></i>';
      tot += '<button type="button" class="slot" data-n="' + i + '" aria-label="Benih ke-' + (i + 1) + ', ketuk untuk menumbuhkan"><span class="tanam"><i class="batang"></i><span class="kepala">' + petal + '<i class="pusat"></i></span></span><i class="gundukan"></i></button>';
    }
    ar.innerHTML = '<div class="taman" id="taman"><div class="t-pesan" id="tPesan" role="status" aria-live="polite">Ketuk benihnya…</div><div class="t-slot">' + tot + '</div><div class="t-ucapan" id="tUcapan" hidden></div></div>';
    ar.querySelectorAll('.slot').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('mekar')) return; b.classList.add('mekar'); mekar++; dariElemen(b, 18, { kuat: 6, naik: 6 });
        var m = q('#tPesan'); m.classList.remove('baru'); void m.offsetWidth; m.textContent = k.bunga[Number(b.dataset.n)]; m.classList.add('baru');
        if (mekar === n) {
          jeda(function () {
            q('#taman').classList.add('penuh'); m.hidden = true; var u = q('#tUcapan'); u.hidden = false;
            u.innerHTML = '<p class="kpd">Untukmu</p><p class="ucapan-akhir">' + esc(k.ucapan) + '</p><button type="button" class="cbtn" data-go="4">Lihat kenangan kita ' + ic('arrow') + '</button>';
            requestAnimationFrame(function () { u.classList.add('show'); }); hujan(2200); dariElemen(u, 60, { kuat: 11 }); q('#subKej').hidden = true;
            var h = u.querySelector('.ucapan-akhir'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
          }, 700);
        }
      });
    });
  } };

  /* --- Seberapa besar cintaku --- */
  KEJ.cinta = { siap: function (ar, k) {
    var t = 0, T = k.target || 10;
    ar.innerHTML = '<div class="cinta"><button type="button" class="heart-btn" id="hati" aria-label="Ketuk hatinya"><svg viewBox="0 0 100 90" aria-hidden="true"><path d="M50 84S6 56 6 28C6 14 16 6 28 6c9 0 17 5 22 14C55 11 63 6 72 6c12 0 22 8 22 22 0 28-44 56-44 56z" fill="currentColor"/></svg></button>' +
      '<p class="c-kal" id="cKal" role="status" aria-live="polite">Ketuk hatinya!</p><div class="c-bar" aria-hidden="true"><span id="cBar"></span></div><p class="c-hit" id="cHit">0 / ' + T + '</p></div>';
    var h = q('#hati'), bar = q('#cBar'), kal = q('#cKal'), hit = q('#cHit'), selesai = false;
    h.addEventListener('click', function (ev) {
      if (selesai) return; t++; var s = 1 + (t / T) * 0.9; h.style.setProperty('--s', s.toFixed(3)); bar.style.width = Math.round(t / T * 100) + '%'; hit.textContent = t + ' / ' + T;
      kal.textContent = t >= T ? 'Penuh sekali!' : k.kalimat[(t - 1) % k.kalimat.length]; h.classList.remove('denyut'); void h.offsetWidth; h.classList.add('denyut');
      var r = h.getBoundingClientRect(); confetti(ev.clientX || r.left + r.width / 2, ev.clientY || r.top + r.height / 2, 8, { kuat: 5, naik: 3 });
      if (t >= T) { selesai = true; h.disabled = true; jeda(function () { selesaiKejutan(k.ucapan); }, 600); }
    });
  } };

  function mulaiKejutan() {
    var ar = q('#arena'); if (!ar || ar.dataset.siap) return; ar.dataset.siap = '1';
    var k = kejutanAktif(data); KEJ[k.jenis].siap(ar, k);
  }

  /* ---------------- Tahap 5: kenangan ---------------- */
  function tPenutup(d) {
    var foto = d.foto.length ? '<div class="album">' + d.foto.map(function (id, i) { return polaroid(d, i, i % 2 ? 'miring-b' : 'miring-a'); }).join('') + '</div>' : '<div class="album">' + polaroid(d, 99, '') + '</div>';
    var video = d.video ? '<div class="video-wrap"><iframe loading="lazy" title="Video kenangan" src="https://drive.google.com/file/d/' + encodeURIComponent(d.video) + '/preview" allow="autoplay; fullscreen" referrerpolicy="no-referrer"></iframe></div>' : '';
    var lanjutan = d.pesanPersonal ? '<p class="personal">' + esc(d.pesanPersonal) + '</p>' : '';
    return '<section class="stage penutup" data-s="penutup" aria-label="Kenangan"><div class="inner wide"><p class="kpd">Kenangan</p><h1 class="judul-kej" tabindex="-1">Untuk dikenang, ' + esc(d.penerima) + '</h1>' + lanjutan + foto + video +
      '<p class="akhir">Semoga semua yang baik selalu menyertaimu.</p><div class="aksi-akhir"><button type="button" class="cbtn ghost" id="ulang">' + ic('replay') + ' Putar ulang</button>' +
      '<a class="cbtn ghost" href="/" target="_blank" rel="noopener">Buat ucapan seperti ini</a></div>' +
      '<p class="kecil">' + (d.kedaluwarsa ? 'Ucapan ini aktif sampai ' + esc(tgl(d.kedaluwarsa)) + '. ' : '') + 'Dibuat dengan rasa di <a href="/" target="_blank" rel="noopener">Dearora</a></p></div></section>';
  }

  /* ---------------- Mesin tahap ---------------- */
  function pasangTitik() { return '<ol class="titik" aria-hidden="true">' + NAMA_TAHAP.map(function () { return '<li></li>'; }).join('') + '</ol>'; }
  function ke(i) {
    if (i === aktif || !stages[i]) return;
    var lama = stages[aktif], baru = stages[i];
    lama.classList.remove('on'); lama.setAttribute('inert', ''); lama.setAttribute('aria-hidden', 'true');
    baru.classList.add('on'); baru.removeAttribute('inert'); baru.removeAttribute('aria-hidden'); baru.scrollTop = 0;
    aktif = i; q('.titik').querySelectorAll('li').forEach(function (li, n) { li.className = n < i ? 'lalu' : n === i ? 'kini' : ''; });
    var h = baru.querySelector('h1'); if (h && i !== 2) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (i === 1) jeda(function () { dariElemen(q('.nama-besar'), 70, { kuat: 11 }); hujan(1600); }, 350);
    if (i === 2) { var env = q('#env'); if (env) env.focus({ preventScroll: true }); }
    if (i === 3) mulaiKejutan();
    if (i === 4) hujan(1200);
    if (i === 1) mainkanMusik();
  }

  function mainkanMusik() {
    if (audio || !data.musik) return;
    var u = aman(data.musik.url); if (!u) return;
    audio = new Audio(u); audio.loop = true;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'musik-btn'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = ic('music');
    function set(on) { b.setAttribute('aria-pressed', String(on)); b.innerHTML = ic(on ? 'pause' : 'music'); b.setAttribute('aria-label', (on ? 'Jeda musik: ' : 'Putar musik: ') + data.musik.judul); }
    set(false); document.body.appendChild(b);
    b.addEventListener('click', function () { if (audio.paused) audio.play().then(function () { set(true); }, function () { set(false); }); else { audio.pause(); set(false); } });
    audio.play().then(function () { set(true); }, function () { set(false); });
  }

  function lightbox(id) {
    var dlg = document.createElement('dialog'); dlg.className = 'lightbox'; dlg.setAttribute('aria-label', 'Foto diperbesar');
    dlg.innerHTML = '<button type="button" aria-label="Tutup foto">' + ic('x') + '</button><img alt="Foto diperbesar" referrerpolicy="no-referrer" src="' + esc(fotoUrl(id)) + '">';
    document.body.appendChild(dlg); dlg.addEventListener('click', function () { dlg.close(); }); dlg.addEventListener('close', function () { dlg.remove(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  var terpasang = false;
  function render(d) {
    data = d; bersih(); aktif = 0;
    $root.className = 'card-root theme theme-' + U.temaDari('tema:' + d.tema);
    $root.innerHTML = pasangTitik() + tBuka(d) + tSapa(d) + tSurat(d) + tKejutan(d) + tPenutup(d);
    stages = Array.prototype.slice.call($root.querySelectorAll('.stage'));
    stages.forEach(function (s, i) { if (i) { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); } });
    stages[0].classList.add('on'); q('.titik li').className = 'kini';
    document.title = 'Ucapan untukmu — Dearora';
    var b = q('#btnBuka'); if (b && !d._demo) b.focus({ preventScroll: true });
    if (!terpasang) {
      terpasang = true;
      $root.addEventListener('click', function (ev) {
        var go = ev.target.closest('[data-go]'); if (go) { ke(Number(go.dataset.go)); return; }
        if (ev.target.closest('#env')) { bukaSurat(data); return; }
        var f = ev.target.closest('[data-foto]'); if (f) { lightbox(f.dataset.foto); return; }
        if (ev.target.closest('#ulang')) { parts = []; render(data); }
      });
      $root.addEventListener('error', function (ev) {
        var im = ev.target; if (im.tagName === 'IMG' && im.dataset.alt && im.src !== im.dataset.alt) { im.src = im.dataset.alt; im.removeAttribute('data-alt'); }
      }, true);
    }
    var env = q('#env');
    if (env && !reduce) {
      env.addEventListener('pointermove', function (e) { var r = env.getBoundingClientRect(); env.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -10).toFixed(1) + 'deg'); env.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(1) + 'deg'); });
      env.addEventListener('pointerleave', function () { env.style.setProperty('--rx', '0deg'); env.style.setProperty('--ry', '0deg'); });
    }
  }

  function pesanAkhir(ikon, judul, teks, tema) {
    $root.className = 'card-root theme theme-' + (tema || 'blossom');
    $root.innerHTML = '<div class="card-pesan"><span class="ico">' + ic(ikon) + '</span><h1>' + esc(judul) + '</h1><p>' + esc(teks) + '</p><a class="cbtn" href="/">Kenal Dearora</a></div>';
  }

  async function muat() {
    var qs = new URLSearchParams(location.search);
    if (qs.get('demo') === '1') { demo = true; render(dataDemo(qs)); return; }
    slug = ambilSlug();
    if (!slug) { pesanAkhir('info', 'Link Tidak Lengkap', 'Alamat ucapan ini tidak valid. Periksa kembali link yang kamu terima.'); return; }
    if (!API.siap()) { pesanAkhir('info', 'Mode Pratinjau', 'Isi GAS_URL di js/config.js agar ucapan dapat dimuat.'); return; }
    try {
      var r = await API.get('getCard', { k: slug }, { coba: 2, timeout: 20000 });
      if (r.success) { render(r.data); return; }
      if (r.kode === 'kedaluwarsa') pesanAkhir('moon', 'Ucapan Ini Sudah Berakhir', 'Masa aktif ucapan ini sudah habis, sehingga isinya telah dihapus. Terima kasih sudah mampir.');
      else pesanAkhir('info', 'Ucapan Tidak Ditemukan', 'Link ini tidak valid atau sudah tidak tersedia. Periksa kembali link yang kamu terima.');
    } catch (e) {
      $root.className = 'card-root theme theme-blossom';
      $root.innerHTML = '<div class="card-pesan"><span class="ico">' + ic('info') + '</span><h1>Belum Bisa Dibuka</h1><p>Koneksi bermasalah. Periksa internetmu lalu coba lagi.</p><button type="button" class="cbtn" id="coba">Coba Lagi</button></div>';
      document.getElementById('coba').addEventListener('click', function () { $root.innerHTML = '<div class="card-loading"><span class="spinner"></span><p>Membuka ucapanmu…</p></div>'; muat(); });
    }
  }
  muat();
})();
