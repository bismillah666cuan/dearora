/* ==========================================================
   SUARA — efek bunyi interaktif (klik, buka hadiah, gosok, benih tumbuh, tiup lilin, dll.).
   Semuanya disintesis oleh browser (WebAudio): tanpa berkas audio, tanpa hak cipta, sangat ringan.
   Baru berbunyi setelah penerima menyentuh layar. Ada tombol senyap yang diingat browser.
   ========================================================== */
(function () {
  'use strict';
  var KEY = 'dearora:suara', ctx = null, master = null, senyap = false, terakhir = {};
  try { senyap = localStorage.getItem(KEY) === '0'; } catch (e) { /* abaikan */ }
  function ac() {
    if (senyap) return null;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function batas(nama, ms) { var t = Date.now(); if (terakhir[nama] && t - terakhir[nama] < ms) return false; terakhir[nama] = t; return true; }
  function nada(f, mulai, dur, tipe, vol, f2) {
    var c = ac(); if (!c) return; var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (mulai || 0);
    o.type = tipe || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function desis(mulai, dur, vol, f0, f1, q) {
    var c = ac(); if (!c) return; var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime + (mulai || 0);
    s.buffer = buf; fl.type = 'bandpass'; fl.Q.value = q || 1.2; fl.frequency.setValueAtTime(f0 || 1500, t0); fl.frequency.exponentialRampToValueAtTime(f1 || f0 || 1500, t0 + dur);
    g.gain.setValueAtTime(vol || 0.2, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0);
  }
  var S = {
    aktif: function () { return !senyap; },
    klik: function () { if (!batas('klik', 60)) return; nada(760, 0, 0.05, 'triangle', 0.09, 540); },
    buka: function () { desis(0, 0.45, 0.14, 500, 3200, 0.9); nada(659, 0.18, 0.4, 'sine', 0.13); nada(988, 0.3, 0.5, 'sine', 0.1); },
    hadiah: function () { desis(0, 0.18, 0.2, 900, 400, 1.5); [523, 659, 784, 1047].forEach(function (f, i) { nada(f, 0.1 + i * 0.09, 0.35, 'triangle', 0.14); }); },
    sukses: function () { [523, 659, 784].forEach(function (f, i) { nada(f, i * 0.07, 0.5, 'sine', 0.13); }); nada(1047, 0.22, 0.6, 'triangle', 0.1); },
    salah: function () { nada(280, 0, 0.18, 'sawtooth', 0.07, 200); nada(210, 0.12, 0.25, 'sawtooth', 0.06, 150); },
    pop: function () { if (!batas('pop', 120)) return; desis(0, 0.12, 0.2, 2800, 800, 0.8); nada(420, 0, 0.1, 'sine', 0.12, 130); },
    /** Kertas dibuka / amplop: gemerisik beberapa kali. */
    kertas: function () { desis(0, 0.1, 0.17, 3600, 1700, 0.6); desis(0.08, 0.14, 0.15, 2500, 5200, 0.8); desis(0.22, 0.09, 0.11, 4300, 2400, 0.7); nada(880, 0.34, 0.35, 'sine', 0.06); },
    /** Balon meletus: letupan tajam + dentum rendah. */
    balon: function () { if (!batas('balon', 70)) return; desis(0, 0.07, 0.4, 3400, 800, 0.5); nada(190, 0, 0.13, 'sine', 0.28, 55); },
    /** Konfeti / party popper: letupan lalu kerlip. */
    konfeti: function () { if (!batas('konfeti', 150)) return; desis(0, 0.1, 0.28, 2600, 700, 0.7); nada(520, 0, 0.08, 'triangle', 0.12, 200); [1568, 2093, 1760].forEach(function (f, i) { nada(f, 0.07 + i * 0.05, 0.25, 'sine', 0.05); }); },
    percik: function () { desis(0, 0.18, 0.2, 1400, 500, 0.7); nada(300, 0.02, 0.12, 'sine', 0.1, 120); },
    drum: function () { for (var i = 0; i < 14; i++) { desis(i * 0.09, 0.07, 0.12 + i * 0.012, 260, 160, 0.6); nada(120 + i * 6, i * 0.09, 0.08, 'triangle', 0.08 + i * 0.006); } },
    whoosh: function () { desis(0, 0.3, 0.14, 400, 2600, 0.8); },
    ding: function () { nada(1320, 0, 0.4, 'sine', 0.14); nada(1976, 0.02, 0.5, 'sine', 0.08); },
    gosok: function () { if (!batas('gosok', 85)) return; desis(0, 0.1, 0.1, 2400 + Math.random() * 900, 1400, 0.7); },
    tumbuh: function () { nada(330, 0, 0.22, 'sine', 0.14, 660); nada(660, 0.08, 0.25, 'sine', 0.1, 990); nada(1320, 0.22, 0.2, 'triangle', 0.06); },
    tiup: function () { desis(0, 0.5, 0.2, 1200, 300, 0.6); },
    hati: function (r) { var k = Math.max(0, Math.min(1, r || 0)); nada(392 * Math.pow(2, k * 0.9), 0, 0.2, 'sine', 0.15); nada(784 * Math.pow(2, k * 0.9), 0.07, 0.18, 'triangle', 0.08); },
    kunci: function () { nada(1200, 0, 0.05, 'square', 0.08); nada(800, 0.06, 0.08, 'square', 0.08); },
    toggle: function () {
      senyap = !senyap; try { localStorage.setItem(KEY, senyap ? '0' : '1'); } catch (e) { /* abaikan */ }
      if (!senyap) S.sukses();
      return !senyap;
    },
    /** Tombol senyap kecil di pojok kanan atas. */
    pasangTombol: function () {
      if (document.querySelector('.suara-btn')) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'suara-btn';
      function ikon() { b.setAttribute('aria-pressed', String(!senyap)); b.setAttribute('aria-label', senyap ? 'Nyalakan efek suara' : 'Matikan efek suara'); b.innerHTML = senyap ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
      ikon(); b.addEventListener('click', function () { S.toggle(); ikon(); }); document.body.appendChild(b);
    },
    /** Bunyi klik halus untuk semua tombol di dalam elemen (tanpa mengubah kode tiap desain). */
    otomatis: function (root) {
      (root || document).addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('button, a.cbtn, .opsi, [data-go]') && !e.target.closest('.suara-btn')) S.klik(); }, true);
    }
  };
  window.Suara = S;
})();
