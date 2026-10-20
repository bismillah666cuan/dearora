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
  var data = null, slug = '', demo = false, audio = null, aktif = 0, stages = [], timers = [], ambT = [];
  var gk = 'classic', gy = {}, opsiD = {};
  var NAMA_TAHAP = ['buka', 'sapa', 'surat', 'kejutan', 'penutup'];
  var konsep = '', konsepSelesai = false, skin = '';

  /* ---------------- Util ---------------- */
  function q(s) { return $root.querySelector(s); }
  function jeda(fn, ms) { var t = setTimeout(fn, reduce ? Math.min(ms, 60) : ms); timers.push(t); return t; }
  function bersih() { timers.forEach(clearTimeout); timers = []; stopAmbien(); }
  function tgl(iso) { var t = Date.parse(iso); return t ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(t)) : ''; }
  function fotoDemoUri(n) {
    var w = [['#FFD6E0', '#FF8FA3'], ['#CFE3FF', '#7FA8E6'], ['#FFF0B8', '#FFB36B']][n % 3], a = getComputedStyle($root).getPropertyValue('--tacc').trim() || '#E85D75';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + w[0] + '"/><stop offset="1" stop-color="' + w[1] + '"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="290" cy="130" r="48" fill="#fff" opacity=".55"/><path d="M0 420c70-50 130-40 200 0s150 20 200-20v100H0z" fill="#fff" opacity=".4"/><path d="M200 330S130 285 130 235a36 36 0 0 1 70-14 36 36 0 0 1 70 14c0 50-70 95-70 95z" fill="' + a + '" opacity=".85"/></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function fotoUrl(id) { var m = /^demo:(\d+)$/.exec(String(id)); if (m) return fotoDemoUri(Number(m[1])); return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w1600'; }
  function fotoCadangan(id) { return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w1600'; }
  function aman(u) { return /^https:\/\//.test(u) || /^assets\/[\w\-./]+$/.test(u) ? (/^assets\//.test(u) ? '/' + u : u) : ''; }
  function dariTeks(d) { return d.dari.tipe === 'anonim' ? 'Seseorang yang menyayangimu' : d.dari.nilai; }
  var PALET = {
    cinematic: ['#E3BE7B', '#F4E8D3', '#C9A24B', '#FFFFFF'], graduation: ['#D4AF55', '#F6E3A1', '#FBF6E9', '#FFFFFF'],
    mama: ['#E8A7A2', '#D9A5A0', '#F1C9C4', '#C9B38C', '#A9BD9B'], garden: ['#FF8FB1', '#FFE27A', '#B79CFF', '#6BB36F', '#FFFFFF'],
    baby: ['#FFD76A', '#FFB3C7', '#A3BCE8', '#FFFFFF'], starry: ['#B8A9FF', '#FFE8A3', '#FFFFFF', '#7BDFF2']
  };
  function warna() {
    if (PALET[gk]) return PALET[gk];
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
  function snd(n, a) { if (window.Suara && window.Suara[n]) window.Suara[n](a); }
  function dariElemen(el, n, opsi) { if (!el) return; if (n >= 20) snd('konfeti'); var r = el.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, n, opsi); }

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
    var gkd = Gaya.kunci(qs.get('tema') || 'classic'), g0 = Gaya.G[gkd], dm = g0.demo || Gaya.G.classic.demo, j = KEJ_DEMO[qs.get('j')] ? qs.get('j') : 'kado';
    var op = Gaya.opsiBawaan(gkd);
    if (qs.get('dekor')) op.dekor = qs.get('dekor');
    if (qs.get('ikon')) op.ikon = qs.get('ikon').split(',').slice(0, 4);
    var hasil = { paket: 'basic', tema: gkd, kategori: '', penerima: dm.penerima, dari: { tipe: 'nama', nilai: dm.dari }, pesan: dm.pesan,
      pesanPersonal: '', foto: ['demo:0', 'demo:1', 'demo:2'], video: '', musik: null, amplop: false, rahasia: j === 'kode', perluPassword: j === 'kode', pembuka: 'judul', kedaluwarsa: '', kejutan: KEJ_DEMO[j], opsi: op, _demo: true };
    if (g0.special && window.SKEMA && window.SKEMA[gkd] && window.SKEMA[gkd].contoh) { hasil.paket = g0.undangan ? 'invitation' : 'premium'; hasil.dataDesain = JSON.parse(JSON.stringify(window.SKEMA[gkd].contoh)); }   // demo Premium = 5 slide + halaman konsep
    return hasil;
  }

  /* ---------------- Ilustrasi ---------------- */
  function ilustrasi() {
    return '<svg class="ilus" viewBox="0 0 200 160" role="img" aria-label="Ilustrasi hati dan bintang"><g fill="currentColor"><path d="M100 138S34 98 34 58c0-18 13-30 30-30 14 0 27 9 36 24 9-15 22-24 36-24 17 0 30 12 30 30 0 40-66 80-66 80z" opacity=".95"/>' +
      '<path d="m168 22 4 11 11 4-11 4-4 11-4-11-11-4 11-4zM28 24l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM172 108l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" opacity=".7"/></g></svg>';
  }
  function polaroid(d, idx, kls) {
    var id = d.foto[idx]; if (id == null) return '<div class="polaroid ilus-wrap ' + (kls || '') + '">' + ilustrasi() + '</div>';
    var cap = gk === 'graduation' ? '<figcaption class="plakat">Penghargaan untuk ' + esc(d.penerima) + '</figcaption>' : '';
    return '<figure class="polaroid ' + (kls || '') + '" data-foto="' + esc(id) + '"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Foto kenangan ' + (idx + 1) + '" src="' + esc(fotoUrl(id)) + '" data-alt="' + esc(fotoCadangan(id)) + '">' + cap + '</figure>';
  }

  /* ---------------- Tahap 1: pembuka ---------------- */
  function tBuka(d) {
    if (gy.buka) return '<section class="stage buka" data-s="buka" aria-label="Pembuka"><div class="inner">' + gy.buka(d) + '</div></section>';
    var kat = { judul: 'Ada Pesan Untukmu' }, ikon = U.ikonTema(d.tema, '');
    var foto = d.pembuka === 'foto' && d.foto.length ? ' foto" style="background-image:url(\'' + esc(fotoUrl(d.foto[0])) + '\')' : '';
    return '<section class="stage buka' + foto + '" data-s="buka" aria-label="Pembuka"><div class="inner">' + (foto ? '' : U.partikel(8, 'heart')) +
      '<span class="ico">' + ic(ikon) + '</span><p class="kpd">Untuk ' + esc(d.penerima) + '</p><h1 class="judul-buka" tabindex="-1">' + esc(kat.judul) + '</h1>' +
      '<p class="sub">Ada pesan spesial yang menunggumu.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Ucapan</button></div></section>';
  }

  /* ---------------- Tahap 2: sapaan ---------------- */
  function namaHuruf(n) {
    return Array.from(String(n)).map(function (c, i) { return c === ' ' ? ' ' : '<span class="huruf" style="animation-delay:' + (i * 70 + 150) + 'ms">' + esc(c) + '</span>'; }).join('');
  }
  function tSapa(d) {
    var s = gy.sapa || SAPAAN['Hari Spesial'], kpd = gy.kpd || 'Hai,';
    var nama = (gk === 'joyful' || gk === 'kids') ? namaHuruf(d.penerima) : esc(d.penerima);
    return '<section class="stage sapa" data-s="sapa" aria-label="Sapaan"><div class="inner"><p class="kpd">' + esc(kpd) + '</p><h1 class="nama-besar" style="--nl:' + Array.from(String(d.penerima)).length + '" tabindex="-1" aria-label="' + esc(d.penerima) + '">' + nama + '<span class="sparkle" aria-hidden="true">✦</span></h1>' +
      '<p class="sapa-1">' + esc(s[0]) + '</p><p class="sapa-2">' + esc(s[1]) + '</p><button type="button" class="cbtn" data-go="2">Lanjut ' + ic('arrow') + '</button></div></section>';
  }

  /* ---------------- Tahap 3: surat ---------------- */
  function tSurat(d) {
    return '<section class="stage surat" data-s="surat" aria-label="Surat"><div class="inner">' +
      '<p class="kpd" id="suratPetunjuk">' + esc(gy.kpdSurat || 'Ada surat untukmu') + '</p>' +
      '<button type="button" class="env" id="env" aria-label="Ketuk untuk membuka surat"><span class="env-back"></span><span class="env-letter"><i></i><i></i><i></i></span><span class="env-front"></span><span class="env-flap"></span><span class="env-seal">' + ic('heart') + '</span><span class="env-ring" aria-hidden="true"></span></button>' +
      '<p class="hint" id="suratHint">Ketuk suratnya</p>' +
      '<article class="letter" id="letter" hidden><p class="l-untuk">Untuk ' + esc(d.penerima) + ',</p><p class="l-isi" id="lIsi"></p>' +
      '<p class="l-tutup">Dengan sayang,</p><p class="l-ttd">' + esc(dariTeks(d)) + '</p></article>' +
      '<button type="button" class="cbtn lanjut" data-go="3" id="suratLanjut" hidden>Lanjut ' + ic('arrow') + '</button></div></section>';
  }
  function bukaSurat(d) {
    var env = q('#env'); if (!env || env.classList.contains('open')) return;
    var K = gy.lambat || 1;
    snd('kertas'); env.classList.add('open'); q('#suratHint').hidden = true; q('#suratPetunjuk').hidden = true; dariElemen(env, 26, { kuat: 7 });
    jeda(function () { env.classList.add('rise'); }, 450 * K);
    jeda(function () { env.classList.add('fall'); }, 1150 * K);
    jeda(function () {
      var l = q('#letter'); l.hidden = false;
      var kata = String(d.pesan).split(/(\s+)/), isi = q('#lIsi'), html = '', i = 0, g = (gk === 'cinematic' ? 70 : 45) * K;
      kata.forEach(function (k) { if (/^\s+$/.test(k)) html += k; else { html += '<span class="w" style="animation-delay:' + (reduce ? 0 : Math.min(i * g, 3200)) + 'ms">' + esc(k) + '</span>'; i++; } });
      isi.innerHTML = html; requestAnimationFrame(function () { l.classList.add('show'); });
      var lama = reduce ? 100 : Math.min(i * g, 3200) + 900;
      jeda(function () { var b = q('#suratLanjut'); b.hidden = false; b.classList.add('muncul'); }, lama);
    }, 1500 * K);
    jeda(function () { env.hidden = true; }, 2300 * K);
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
    return '<section class="stage kejutan" data-s="kejutan" aria-label="Kejutan"><div class="inner wide"><p class="kpd">' + esc(gy.kpdKejutan || 'Kejutan') + '</p><h1 class="judul-kej" tabindex="-1">' + esc(k.jenis === 'kado' && k.judul ? k.judul : j[0]) + '</h1>' +
      '<p class="sub-kej" id="subKej">' + esc(sub) + '</p><div class="arena" id="arena"></div>' +
      '<div class="finale" id="finale" hidden aria-live="polite"></div></div></section>';
  }
  function selesaiKejutan(teks, opsi) {
    var f = q('#finale'), ar = q('#arena'); if (!f || !f.hidden) return; opsi = opsi || {};
    if (!opsi.tetapArena) ar.classList.add('selesai');
    f.innerHTML = (opsi.tetapArena ? '' : '<p class="kpd">Untukmu</p><p class="ucapan-akhir">' + esc(teks) + '</p>') + polaroid(data, 0, 'kecil') +
      '<button type="button" class="cbtn" data-go="4">Lihat kenangan kita ' + ic('arrow') + '</button>';
    snd('sukses'); f.hidden = false; requestAnimationFrame(function () { f.classList.add('show'); });
    var s = q('#subKej'); if (s) s.hidden = true;
    var h = f.querySelector('.ucapan-akhir'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    dariElemen(f, 70, { kuat: 11 }); hujan(1800);
  }

  /* --- Kado --- */
  KEJ.kado = { siap: function (ar, k) {
    ar.innerHTML = '<button type="button" class="gift" id="gift" aria-label="Ketuk untuk membuka kado"><span class="g-glow"></span><span class="g-box"><i class="g-pita-v"></i><i class="g-pita-h"></i></span><span class="g-lid"><i class="g-pita-v"></i></span><span class="g-bow"><i></i><i></i></span></button>';
    var g = q('#gift'); g.addEventListener('click', function () {
      if (g.classList.contains('buka')) return; snd('hadiah'); g.classList.add('buka'); dariElemen(g, 60, { kuat: 10, naik: 8 });
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
      var s = k.soal[i], betul = n === s.benar; snd(betul ? 'sukses' : 'salah'); snd(betul ? 'sukses' : 'salah');
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
      function titik(ev) { snd('gosok'); var b = c.getBoundingClientRect(); x.beginPath(); x.arc(ev.clientX - b.left, ev.clientY - b.top, 24, 0, 6.3); x.fill(); if (++hitung % 6 === 0) cek(); }
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
    function buka(teks) { snd('kunci'); q('.kode').classList.add('terbuka'); dariElemen(q('.kode'), 30, { kuat: 8 }); jeda(function () { selesaiKejutan(teks); }, 700); }
    f.addEventListener('submit', async function (ev) {
      ev.preventDefault(); var b = f.querySelector('button'), g = q('#kGalat'), pw = inp ? inp.value : ''; g.hidden = true; b.disabled = true; var asli = b.textContent; b.textContent = 'Memeriksa…';
      try {
        if (demo) { if (String(pw).toLowerCase().replace(/[\s.\-\/_,:;]/g, '') === 'cinta') { buka(UCAPAN_DEMO); return; } throw { pesan: 'Kode belum tepat. Coba lagi ya.' }; }
        var r = await API.post('unlockSecret', { k: slug, password: pw }, { timeout: 20000 });
        if (r.success) { buka(r.data.pesan); return; }
        throw { pesan: r.message || 'Kode belum tepat.' };
      } catch (e) { snd('salah'); g.hidden = false; g.textContent = e && e.pesan ? e.pesan : 'Koneksi bermasalah. Coba lagi.'; f.classList.remove('goyang'); void f.offsetWidth; f.classList.add('goyang'); b.disabled = false; b.textContent = asli; }
    });
  } };

  /* --- Tiup lilin --- */
  KEJ.harapan = { siap: function (ar, k) {
    var n = k.lilin || 3, padam = 0, c = '';
    for (var i = 0; i < n; i++) c += '<button type="button" class="candle" aria-label="Tiup lilin ke-' + (i + 1) + '"><i class="flame"></i><i class="stick"></i></button>';
    ar.innerHTML = '<div class="cake"><div class="candles">' + c + '</div><div class="tier t2"><i class="drip"></i></div><div class="tier t1"><i class="drip"></i></div><div class="plate"></div></div>';
    ar.querySelectorAll('.candle').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('padam')) return; snd('tiup'); b.classList.add('padam'); padam++; dariElemen(b, 10, { kuat: 4 });
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
        if (b.classList.contains('mekar')) return; snd('tumbuh'); b.classList.add('mekar'); mekar++; dariElemen(b, 18, { kuat: 6, naik: 6 });
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
      if (selesai) return; t++; snd('hati', t / T); var s = 1 + (t / T) * 0.9; h.style.setProperty('--s', s.toFixed(3)); bar.style.width = Math.round(t / T * 100) + '%'; hit.textContent = t + ' / ' + T;
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
  var LABEL_IKON = { cangkir: 'Teh hangat', bunga: 'Kelembutan', rumah: 'Rumah yang nyaman', hati: 'Pelukan', resep: 'Resep keluarga', sendok: 'Masakan' };
  function albumFoto(d) {
    if (gk === 'cinematic') {
      if (!d.foto.length) return '<div class="album">' + polaroid(d, 99, '') + '</div>';
      return '<div class="slides" id="slides" aria-label="Foto kenangan">' + d.foto.map(function (id, i) { return '<figure class="slide' + (i === 0 ? ' on' : '') + '" data-foto="' + esc(id) + '"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Foto kenangan ' + (i + 1) + '" src="' + esc(fotoUrl(id)) + '" data-alt="' + esc(fotoCadangan(id)) + '"></figure>'; }).join('') + '</div>';
    }
    if (gk === 'mama') {
      if (!d.foto.length) return '<div class="album">' + polaroid(d, 99, '') + '</div>';
      return '<div class="album">' + d.foto.map(function (id, i) { return '<figure class="halaman" data-foto="' + esc(id) + '"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Foto kenangan ' + (i + 1) + '" src="' + esc(fotoUrl(id)) + '" data-alt="' + esc(fotoCadangan(id)) + '"><span class="cap">Kenangan ' + (i + 1) + '</span></figure>'; }).join('') + '</div>';
    }
    return d.foto.length ? '<div class="album">' + d.foto.map(function (id, i) { return polaroid(d, i, i % 2 ? 'miring-b' : 'miring-a'); }).join('') + '</div>' : '<div class="album">' + polaroid(d, 99, '') + '</div>';
  }
  function tambahanPenutup(d) {
    if (gk === 'graduation') return '<ol class="edu" id="edu" aria-label="Garis waktu perjalanan">' + gy.milestone.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol>';
    if (gk === 'mama') {
      var ik = (Array.isArray(opsiD.ikon) && opsiD.ikon.length ? opsiD.ikon : Gaya.opsiBawaan('mama').ikon).slice(0, 4);
      return '<ul class="ikon-mama" aria-label="Hal-hal khas Mama">' + ik.map(function (n, i) { return '<li style="animation-delay:' + (i * 160) + 'ms"><span class="lingkar">' + Art.ikon(n) + '</span>' + esc(LABEL_IKON[n] || n) + '</li>'; }).join('') + '</ul>';
    }
    return '';
  }
  function tPenutup(d) {
    var judul = gy.judulPenutup ? gy.judulPenutup(d) : 'Untuk dikenang, ' + d.penerima;
    var video = d.video ? '<div class="video-wrap"><iframe loading="lazy" title="Video kenangan" src="https://drive.google.com/file/d/' + encodeURIComponent(d.video) + '/preview" allow="autoplay; fullscreen" referrerpolicy="no-referrer"></iframe></div>' : '';
    var lanjutan = d.pesanPersonal ? '<p class="personal">' + esc(d.pesanPersonal) + '</p>' : '';
    return '<section class="stage penutup" data-s="penutup" aria-label="Kenangan"><div class="inner wide"><p class="kpd">' + esc(gy.kpdPenutup || 'Kenangan') + '</p><h1 class="judul-kej" tabindex="-1">' + esc(judul) + '</h1>' + lanjutan + tambahanPenutup(d) + albumFoto(d) + video + '<div class="balas" id="balas"></div>' +
      '<p class="akhir">' + esc(gy.akhir || 'Semoga semua yang baik selalu menyertaimu.') + '</p><div class="aksi-akhir"><button type="button" class="cbtn ghost" id="ulang">' + ic('replay') + ' Putar ulang</button>' +
      '</div>' +
      '<p class="kecil">Dibuat dengan penuh rasa oleh: ' + esc(dariTeks(d)) + '</p></div></section>';
  }

  /* ---------------- Dekor & ambien per gaya ---------------- */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pilih(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function hiasan(svg, kls, style) { return svg.replace('class="art ', 'class="art ' + kls + ' ').replace('<svg ', '<svg style="' + style + '" '); }
  function bintangLangit(n, putih) {
    var h = '', i; for (i = 0; i < n; i++) h += '<i class="bt" style="--x:' + rnd(2, 96).toFixed(1) + '%;--y:' + rnd(2, 90).toFixed(1) + '%;--s:' + (putih ? rnd(2, 4.2) : rnd(12, 24)).toFixed(1) + 'px;--d:' + rnd(2.2, 5).toFixed(1) + 's;--dl:-' + rnd(0, 5).toFixed(1) + 's">' + (putih ? '' : Art.bintang('#FFD76A')) + '</i>';
    return h;
  }
  function awanLatar(n) {
    var h = '', i; for (i = 0; i < n; i++) h += '<i class="aw" style="--w:' + rnd(90, 150).toFixed(0) + 'px;--y:' + rnd(4, 70).toFixed(0) + '%;--d:' + rnd(42, 70).toFixed(0) + 's;animation-delay:-' + rnd(0, 40).toFixed(0) + 's">' + Art.awan(gk === 'kids', '#fff') + '</i>';
    return h;
  }
  function dekorHTML() {
    var h = '';
    if (gk === 'joyful') h = hiasan(Art.bintang('#FF6B6B'), 'dod', 'right:6%;top:9%;width:34px;animation-delay:0s') + hiasan(Art.coretan('#FF5FA2'), 'dod', 'left:5%;top:20%;width:70px;animation-delay:1.2s') + hiasan(Art.kilau('#FFB81C'), 'dod', 'right:10%;top:34%;width:26px;animation-delay:2.4s') +
      hiasan(Art.lingkaran('#5B2A3C'), 'dod', 'left:8%;bottom:26%;width:46px;animation-delay:3.6s') + hiasan(Art.bintang('#FFC93C'), 'dod', 'left:15%;bottom:10%;width:30px;animation-delay:4.8s') + hiasan(Art.coretan('#FFB81C'), 'dod', 'right:6%;bottom:14%;width:68px;animation-delay:6s');
    else if (gk === 'graduation') h = Art.pojok('#D4AF55', 'pj a') + Art.pojok('#D4AF55', 'pj b') + Art.pojok('#D4AF55', 'pj c') + Art.pojok('#D4AF55', 'pj d');
    else if (gk === 'mama') h = Art.bunga('#E8A7A2', '#FFD58A', 'bg a') + Art.bunga('#B9C8A9', '#F6E3B4', 'bg b') + Art.bunga('#D9A5A0', '#F6E3B4', 'bg c') + Art.bunga('#E8A7A2', '#FFD58A', 'bg d') + hiasan(Art.daun('#A9BD9B'), 'dn', 'left:30%;top:-8px') + hiasan(Art.daun('#A9BD9B'), 'dn', 'right:26%;top:-10px;animation-delay:-2s');
    else if (gk === 'garden') h = '<i class="sinar"></i>' + hiasan(Art.daun('#5BA865'), 'dn', 'left:-10px;top:6%') + hiasan(Art.daun('#4E9E5C'), 'dn', 'right:-8px;top:14%;transform:scaleX(-1)') + hiasan(Art.daun('#6BB36F'), 'dn', 'left:2%;top:46%;width:60px') + '<i class="rumput"></i>';
    else if (gk === 'kids') h = Art.matahari('mt') + awanLatar(4);
    else if (gk === 'baby') h = (opsiD.dekor === 'awan') ? awanLatar(5) : bintangLangit(18, false);
    else if (gk === 'starry') h = bintangLangit(46, true) + '<svg class="rasi" viewBox="0 0 100 60" aria-hidden="true"><path d="M6 46L26 24 46 36 64 12 90 30" fill="none" stroke="#B8A9FF" stroke-width=".5"/><g fill="#FFE8A3"><circle cx="6" cy="46" r="1.1" style="animation-delay:1.2s"/><circle cx="26" cy="24" r="1.1" style="animation-delay:2.8s"/><circle cx="46" cy="36" r="1.1" style="animation-delay:4.4s"/><circle cx="64" cy="12" r="1.1" style="animation-delay:6s"/><circle cx="90" cy="30" r="1.1" style="animation-delay:7.6s"/></g></svg>';
    return h;
  }
  function mel(kind, svg, o) {
    var amb = q('.ambien'); if (!amb || amb.children.length > 16) return;
    var el = document.createElement('span'); el.className = 'mel ' + kind;
    el.style.cssText = '--x:' + o.x.toFixed(1) + '%;--s:' + o.s.toFixed(0) + 'px;--d:' + o.d.toFixed(1) + 's;--dx:' + (o.dx || 0).toFixed(0) + 'px;--rot:' + (o.rot || 0).toFixed(0) + 'deg';
    el.innerHTML = svg; amb.appendChild(el); el.addEventListener('animationend', function () { el.remove(); });
    if (o.tap) {                                              // balon / hati yang bisa dipecahkan atau disentuh
      el.classList.add('tap');
      el.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation(); if (el.classList.contains('pecah')) return;
        if (o.tap === 'love') snd('hati', Math.random()); else snd('balon');
        el.style.animationPlayState = 'paused'; el.classList.add('pecah'); setTimeout(function () { el.remove(); }, 200);
      });
    }
  }
  function ulang(fn, ms) { ambT.push(setInterval(fn, ms)); }
  function stopAmbien() { ambT.forEach(clearInterval); ambT = []; }
  function mulaiAmbien() {
    stopAmbien(); if (reduce) return;
    var PAL = ['#FF6B6B', '#FFC93C', '#FF5FA2', '#7BDFF2', '#B79CFF', '#6BD6A0'];
    if (gk === 'joyful') {
      ulang(function () { var love = opsiD.dekor === 'love'; mel('naik', love ? Art.hati(pilih(PAL)) : Art.balon(pilih(PAL)), { x: rnd(2, 92), s: love ? rnd(22, 40) : rnd(36, 58), d: rnd(9, 14), dx: rnd(-60, 60), rot: rnd(-20, 20), tap: love ? 'love' : 'balon' }); }, 950);
      ulang(function () { confetti(rnd(40, innerWidth - 40), rnd(80, innerHeight * 0.5), 14, { kuat: 7 }); }, 7000);
    } else if (gk === 'mama') {
      ulang(function () { mel('turun', Art.kelopak(pilih(['#E8A7A2', '#D9A5A0', '#F1C9C4', '#C9B38C'])), { x: rnd(2, 94), s: rnd(14, 24), d: rnd(11, 17), dx: rnd(-90, 90), rot: rnd(200, 520) }); }, 2100);
    } else if (gk === 'graduation') {
      ulang(function () { mel('naik', Art.kilau('#F6E3A1'), { x: rnd(4, 94), s: rnd(8, 16), d: rnd(11, 18), dx: rnd(-30, 30), rot: rnd(-40, 40) }); }, 800);
    } else if (gk === 'cinematic') {
      ulang(function () { mel('naik', '<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="#E3BE7B" opacity=".5"/></svg>', { x: rnd(2, 96), s: rnd(4, 9), d: rnd(14, 22), dx: rnd(-20, 20), rot: 0 }); }, 900);
      ulang(function () { mel('naik', '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#E3BE7B" opacity=".12"/></svg>', { x: rnd(5, 90), s: rnd(40, 90), d: rnd(18, 26), dx: rnd(-40, 40), rot: 0 }); }, 3600);
    } else if (gk === 'kids') {
      ulang(function () { mel('naik', Art.bintang(pilih(['#FFC93C', '#FF8FB1', '#7BDFF2'])), { x: rnd(4, 92), s: rnd(18, 32), d: rnd(9, 13), dx: rnd(-40, 40), rot: rnd(-60, 60) }); }, 1500);
    } else if (gk === 'baby') {
      ulang(function () { mel('naik', Art.bintang(pilih(['#FFD76A', '#FFB3C7', '#A3BCE8'])), { x: rnd(4, 92), s: rnd(14, 24), d: rnd(11, 16), dx: rnd(-30, 30), rot: rnd(-30, 30) }); }, 2600);
    } else if (gk === 'garden') {
      if (!document.querySelector('.kupu-t')) [[16, 30], [46, 38], [72, 26]].forEach(function (k, i) { var b = document.createElement('div'); b.className = 'kupu-t'; b.style.cssText = '--y:' + k[0] + '%;--d:' + k[1] + 's;animation-delay:-' + (i * 11) + 's'; b.innerHTML = Art.kupu(pilih(['#FF8FB1', '#B79CFF', '#FFB36B']), '#FFE27A'); document.body.appendChild(b); });
    } else if (gk === 'starry') {
      ulang(function () { var j = document.createElement('i'); j.className = 'jatuh'; j.style.left = rnd(40, 95) + '%'; j.style.top = rnd(2, 35) + '%'; var a = q('.ambien'); if (a) { a.appendChild(j); setTimeout(function () { j.remove(); }, 1500); } }, 9000);
    }
  }
  function mulaiGaya() {
    var ar = q('.ambien'); if (!ar) return;
    if (gk === 'cinematic') { var t = q('.tirai'); if (t) t.classList.add('awal'); }
    mulaiAmbien();
  }

  function pasangTitik() { return '<ol class="titik" aria-hidden="true">' + NAMA_TAHAP.map(function () { return '<li></li>'; }).join('') + '</ol>'; }
  var slideT = 0;
  function pindah(i) {
    var lama = stages[aktif], baru = stages[i];
    lama.classList.remove('on'); lama.setAttribute('inert', ''); lama.setAttribute('aria-hidden', 'true');
    baru.classList.add('on'); baru.removeAttribute('inert'); baru.removeAttribute('aria-hidden'); baru.scrollTop = 0;
    aktif = i; q('.titik').querySelectorAll('li').forEach(function (li, n) { li.className = n < i ? 'lalu' : n === i ? 'kini' : ''; });
    var h = baru.querySelector('h1'); if (h && i !== 2) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (i === 1) jeda(function () { dariElemen(q('.nama-besar'), 70, { kuat: 11 }); hujan(1600); }, 350);
    if (i === 2) { var env = q('#env'); if (env) env.focus({ preventScroll: true }); }
    if (i === 3) mulaiKejutan();
    if (i === 4) { hujan(1200); mulaiPenutup(); mulaiBalas(); }
    if (i === 1) mainkanMusik();
  }
  /** Slide terakhir tercapai: tandai "sudah dilihat" dan tampilkan kolom balasan untuk penerima. */
  function mulaiBalas() {
    var el = q('#balas'); if (!el || el.dataset.siap || !window.Balasan) return; el.dataset.siap = '1';
    if (!demo && slug) window.Balasan.tandai(slug);
    window.Balasan.pasang(el, { slug: slug, pengirim: dariTeks(data), demo: demo, tema: gk });
  }
  /** Efek khusus tahap kenangan: slideshow sinematik, garis waktu wisuda yang terisi bertahap. */
  function mulaiPenutup() {
    clearInterval(slideT);
    var sl = $root.querySelectorAll('#slides .slide');
    if (sl.length > 1 && !reduce) { var n = 0; slideT = setInterval(function () { sl[n].classList.remove('on'); n = (n + 1) % sl.length; sl[n].classList.add('on'); }, 5600); ambT.push(slideT); }
    var edu = q('#edu');
    if (edu) { var li = edu.querySelectorAll('li'); jeda(function () { edu.classList.add('isi'); }, 400); li.forEach(function (x, k) { jeda(function () { x.classList.add('on'); dariElemen(x, 6, { kuat: 3 }); }, 600 + k * (reduce ? 10 : 820)); }); }
  }
  function ke(i) {
    if (i === aktif || !stages[i]) return;
    if (gk === 'cinematic' && !reduce) {                 // transisi gelap ke terang
      var t = q('.tirai'); if (t) { t.classList.remove('awal', 'aktif'); void t.offsetWidth; t.classList.add('aktif'); jeda(function () { pindah(i); }, 520); return; }
    }
    pindah(i);
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
  function setGaya(d) {
    gk = Gaya.kunci(d.tema); gy = Gaya.G[gk] || {};
    konsep = ''; konsepSelesai = false; skin = '';
    if (gy.special) { skin = gy.skin || ''; konsep = gk; gk = gy.dasar || 'classic'; gy = Gaya.G[gk] || Gaya.G.classic; }      // desain Premium: 5 slide Basic + halaman konsep tambahan
    opsiD = Object.assign(Gaya.opsiBawaan(gk), d.opsi || {});
  }
  /** Halaman konsep Premium (film, toko online, dll.) dibuka di antara surat dan kejutan, lalu kembali ke alur utama. */
  function mulaiKonsep() {
    var host = document.createElement('div'); host.id = 'konsep'; document.body.appendChild(host);
    Special.mountInto(host, konsep, { penerima: data.penerima, pengirim: dariTeks(data), foto: data.foto || [], slug: slug, musik: null, demo: demo }, data.dataDesain, function () { host.remove(); konsepSelesai = true; if (window.Suara && window.Suara.tema) window.Suara.tema(''); ke(3); });
  }
  /** Paket Invitation: tanpa slide Basic; desain undangan tampil langsung (RSVP ada di dalamnya). */
  function renderUndangan(kk, d) {
    data = d; bersih(); document.querySelectorAll('.kupu-t').forEach(function (x) { x.remove(); });
    Special.mountData(kk, { penerima: d.penerima, pengirim: dariTeks(d), foto: d.foto || [], slug: slug, demo: demo }, d.dataDesain);
  }
  function render(d) {
    var kk0 = Gaya.kunci(d.tema);
    if (d.paket === 'invitation' && d.dataDesain && window.Special && Special.ada(kk0)) { renderUndangan(kk0, d); return; }
    data = d; bersih(); aktif = 0; clearInterval(slideT);
    document.querySelectorAll('.kupu-t').forEach(function (x) { x.remove(); });
    setGaya(d);
    $root.className = 'card-root theme theme-' + (skin || gk) + ' g-' + gk + (skin ? ' g-' + skin + ' skin-premium' : '') + (gy.gelap || skin ? ' g-gelap' : '');
    $root.innerHTML = '<div class="dekor" aria-hidden="true">' + dekorHTML() + '</div><div class="ambien" aria-hidden="true"></div><div class="tirai" aria-hidden="true"></div>' + pasangTitik() + tBuka(d) + tSapa(d) + tSurat(d) + tKejutan(d) + tPenutup(d);
    stages = Array.prototype.slice.call($root.querySelectorAll('.stage'));
    stages.forEach(function (s, i) { if (i) { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); } });
    stages[0].classList.add('on'); q('.titik li').className = 'kini';
    document.title = 'Ucapan untukmu — Dearora';
    var b = q('#btnBuka'); if (b && !d._demo) b.focus({ preventScroll: true });
    mulaiGaya();
    if (window.Suara) window.Suara.pasangTombol();
    if (!terpasang) {
      terpasang = true; if (window.Suara) window.Suara.otomatis($root);
      $root.addEventListener('click', function (ev) {
        var go = ev.target.closest('[data-go]');
        if (go) {
          var n = Number(go.dataset.go), g = q('.gerbang');
          if (n === 3 && konsep && !konsepSelesai && data.dataDesain && window.Special && Special.ada(konsep)) { mulaiKonsep(); return; }
          if (n === 1 && gy.jedaBuka && g && !g.classList.contains('terbuka')) { g.classList.add('terbuka'); dariElemen(g, 30, { kuat: 8 }); jeda(function () { ke(1); }, gy.jedaBuka); return; }
          ke(n); return;
        }
        if (ev.target.closest('#env')) { bukaSurat(data); return; }
        var f = ev.target.closest('[data-foto]'); if (f) { lightbox(f.dataset.foto); return; }
        if (ev.target.closest('#ulang')) { parts = []; render(data); }
      });
      $root.addEventListener('pointerdown', function (ev) {        // tombol "bereaksi" saat disentuh (Joyful & Kids)
        if (gk !== 'joyful' && gk !== 'kids') return;
        var el = ev.target.closest('.cbtn,.opsi,.heart-btn,.candle,.slot,.gift'); if (!el) return;
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); confetti(ev.clientX, ev.clientY, 10, { kuat: 5, naik: 3 });
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

  /** Mode "Lihat contoh" di form: langsung ke kejutan (tanpa pembuka, ucapan, surat) + catatan bahwa ini hanya contoh interaksi. */
  function langsungKejutan() {
    document.body.classList.add('demo-kejutan'); var t = q('.titik'); if (t) t.hidden = true;
    var n = document.createElement('div'); n.className = 'demo-catatan'; n.setAttribute('role', 'note');
    n.innerHTML = '<p><strong>Contoh interaksi.</strong> Ini hanya gambaran cara kejutannya dimainkan. Isi ucapan, nama, dan fotonya nanti sesuai yang kamu tulis.</p><button type="button" class="demo-ulang">Mainkan ulang</button>';
    document.body.appendChild(n); n.querySelector('.demo-ulang').addEventListener('click', function () { location.reload(); });
    var s = stages[3]; if (!s) return;
    stages.forEach(function (x, k) { if (k !== 3) { x.classList.remove('on'); x.setAttribute('inert', ''); x.setAttribute('aria-hidden', 'true'); } });
    aktif = 3; s.classList.add('on'); s.removeAttribute('inert'); s.removeAttribute('aria-hidden'); mulaiKejutan();
  }

  async function muat() {
    var qs = new URLSearchParams(location.search);
    if (qs.get('demo') === '1') { demo = true; render(dataDemo(qs)); if (qs.get('mulai') === 'kejutan') langsungKejutan(); return; }
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
