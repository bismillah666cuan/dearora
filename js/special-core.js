/* ==========================================================
   SPECIAL — mesin kecil untuk desain khusus paket Special.
   Tiap desain adalah "aplikasi mini" sendiri (Malam Film, Dearora Mall, Dunia Sahabat,
   Selebstyle, Soundtrack Kita, Misi Cinta). Semua teks memakai Bahasa Indonesia dan tampil
   dengan data contoh; untuk pembeli, isi DATA di berkas halaman (lihat PANDUAN) atau
   atur window.SPECIAL_DATA sebelum skrip dimuat.
   Aset (karakter, markas, ikon) dibuat orisinal; tidak ada merek atau aset pihak lain.
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, ic = U.ic;
  var reg = {}, cv = document.getElementById('confetti'), $root = document.getElementById('kartu');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var parts = [], raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), timers = [];
  function ukur() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; }
  window.addEventListener('resize', ukur); ukur();
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pilih(a) { return a[Math.floor(Math.random() * a.length)]; }
  function confetti(x, y, n, pal, o) {
    if (reduce) return; o = o || {}; pal = pal || ['#FF6B6B', '#FFD166', '#FF8FA3', '#B79CFF', '#7BDFF2', '#fff'];
    for (var i = 0; i < Math.min(n, 140) && parts.length < 400; i++) {
      var a = Math.random() * 6.283, v = (o.kuat || 9) * (0.4 + Math.random() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.naik || 5), r: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: pal[i % pal.length], b: Math.random() < 0.35, u: 0, m: 90 + Math.random() * 70 });
    }
    if (!raf) raf = requestAnimationFrame(putar);
  }
  function putar() {
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.u++; p.vy += 0.24; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.u > p.m || p.y > innerHeight + 20) { parts.splice(i, 1); continue; }
      c.save(); c.globalAlpha = Math.max(0, 1 - p.u / p.m); c.fillStyle = p.c; c.translate(p.x, p.y); c.rotate(p.rot);
      if (p.b) { c.beginPath(); c.arc(0, 0, p.r / 2, 0, 6.3); c.fill(); } else c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      c.restore();
    }
    raf = parts.length ? requestAnimationFrame(putar) : 0; if (!raf) c.clearRect(0, 0, innerWidth, innerHeight);
  }
  function dariEl(el, n, pal, o) { if (!el) return; if (window.Suara && n >= 20) window.Suara.pop(); var r = el.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, n, pal, o); }
  function jeda(fn, ms) { var t = setTimeout(fn, reduce ? Math.min(ms, 40) : ms); timers.push(t); return t; }
  function bersih() { timers.forEach(clearTimeout); timers = []; }

  /** Foto contoh (ilustrasi). Pembeli memakai URL https (Drive/hosting sendiri). */
  function foto(n, c1, c2) {
    var w = [['#FFD6E0', '#FF8FA3'], ['#CFE3FF', '#7FA8E6'], ['#FFF0B8', '#FFB36B'], ['#D8F0D0', '#6BB36F'], ['#E4D8FF', '#9B86D4']][(n || 0) % 5];
    c1 = c1 || w[0]; c2 = c2 || w[1];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="290" cy="130" r="48" fill="#fff" opacity=".55"/><path d="M0 420c70-50 130-40 200 0s150 20 200-20v100H0z" fill="#fff" opacity=".4"/><path d="M200 330S130 285 130 235a36 36 0 0 1 70-14 36 36 0 0 1 70 14c0 50-70 95-70 95z" fill="#fff" opacity=".8"/></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  var fotoIds = [];
  function src(u, n) {
    u = String(u || ''); var m = /^f(\d+)$/.exec(u);
    if (m) { var id = fotoIds[Number(m[1]) - 1]; return id ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w1600' : foto(n || 0); }
    if (/^demo/.test(u) || !u) return foto(n || 0); return /^https:\/\//.test(u) ? u : '';
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'sp-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.classList.add('hilang'); setTimeout(function () { t.remove(); }, 400); }, 2200);
  }
  function kata(teks, ms, g) {   // bungkus tiap kata untuk muncul bertahap (subtitle)
    var i = 0; return String(teks).split(/(\s+)/).map(function (k) { if (/^\s+$/.test(k)) return k; var d = reduce ? 0 : Math.min(i++ * (g || 70), ms || 3000); return '<span class="kt" style="animation-delay:' + d + 'ms">' + esc(k) + '</span>'; }).join('');
  }

  var Special = {
    reg: function (k, def) { reg[k] = def; }, ada: function (k) { return !!reg[k]; }, daftar: function () { return Object.keys(reg); },
    esc: esc, ic: ic, reduce: reduce, rnd: rnd, pilih: pilih, confetti: confetti, dariEl: dariEl, jeda: jeda, foto: foto, src: src, toast: toast, kata: kata,
    root: function () { return $root; },
    konteks: { slug: '', pengirim: '', demo: true }, onAkhir: null, _akhir: false,
    kredit: function (nama) { return '<p class="sp-kredit">Dibuat dengan penuh rasa oleh: ' + esc(nama || '') + '</p>'; },
    /** Dipanggil tiap desain saat penerima mencapai layar terakhir: tandai "dilihat" + tombol balasan. */
    akhir: function () {
      if (Special._akhir) return; Special._akhir = true;
      if (Special.onAkhir) { try { Special.onAkhir(); } catch (e) { /* abaikan */ } }
      if (window.Balasan) window.Balasan.lembar(document.body, Special.konteks);
    },
    mount: function (k) {
      var def = reg[k]; bersih(); parts = []; Special._akhir = false;
      var data = Object.assign({}, def.demo, window.SPECIAL_DATA || {});
      Special.konteks = { slug: '', pengirim: data.pengirim || '', demo: true, tema: k };
      if (window.Suara) { window.Suara.pasangTombol(); if (!Special._sa) { Special._sa = true; window.Suara.otomatis(document); } }
      $root.className = 'sp-root sp-' + k; $root.innerHTML = '';
      document.title = (def.nama || 'Ucapan') + ' — Dearora';
      def.mulai($root, data, Special);
    },
    /** Mode nyata: data dari server. c = {penerima, pengirim, foto:[idDrive], slug}; f = isian pembeli (skema). */
    mountData: function (k, c, f) {
      var def = reg[k]; bersih(); parts = []; Special._akhir = false; fotoIds = c.foto || [];
      Special.konteks = { slug: c.slug || '', pengirim: c.pengirim || '', demo: false, tema: k };
      if (window.Suara) { window.Suara.pasangTombol(); if (!Special._sa) { Special._sa = true; window.Suara.otomatis(document); } }
      $root.className = 'sp-root sp-' + k; $root.innerHTML = '';
      document.title = 'Ucapan untukmu';
      def.mulai($root, def.adapt(f || {}, c), Special);
      if (c.musik && k !== 'musik') Special.pasangMusik(c.musik);
    },
    /** Musik latar pilihan pembeli: mulai setelah sentuhan pertama, ada tombol putar/jeda. */
    pasangMusik: function (m) {
      var u = String((m && m.url) || ''); if (!/^https:\/\//.test(u) || document.querySelector('.musik-btn')) return;
      var a = new Audio(u); a.loop = true; a.volume = 0.5; var b = document.createElement('button'); b.type = 'button'; b.className = 'musik-btn';
      function set(on) { b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', (on ? 'Jeda musik: ' : 'Putar musik: ') + (m.judul || '')); b.textContent = on ? '❚❚' : '♪'; }
      set(false); document.body.appendChild(b);
      var mulai = function () { document.removeEventListener('pointerdown', mulai, true); a.play().then(function () { set(true); }, function () { set(false); }); };
      document.addEventListener('pointerdown', mulai, true);
      b.addEventListener('click', function (e) { e.stopPropagation(); document.removeEventListener('pointerdown', mulai, true); if (a.paused) a.play().then(function () { set(true); }, function () { set(false); }); else { a.pause(); set(false); } });
    }
  };
  window.Special = Special;
})();
