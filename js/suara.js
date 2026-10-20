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

  /* ---------- bahan dasar bunyi tematik ---------- */
  function acak(a, b) { return a + Math.random() * (b - a); }
  /** Derau berfilter dengan naik-turun (ombak, tepuk, desis api, hujan). tipe: lowpass | highpass | bandpass. */
  function noise(mulai, dur, vol, tipe, f0, f1, q, naik) {
    var c = ac(); if (!c) return; var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime + (mulai || 0), a = Math.min(naik || 0.005, dur * 0.8);
    s.buffer = buf; fl.type = tipe || 'bandpass'; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0 || 1000, t0); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol || 0.2), t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0);
  }
  function lonceng(f, mulai, vol, dur) { [1, 2.76, 5.4].forEach(function (r, i) { nada(f * r, mulai || 0, (dur || 1.2) / (i + 1), 'sine', (vol || 0.12) / (i + 1)); }); }
  function gongBunyi(f, mulai, vol) { [1, 1.41, 2.09, 2.63, 3.3].forEach(function (r, i) { nada(f * r, mulai || 0, 2.4 / (i * 0.6 + 1), 'sine', (vol || 0.2) / (i + 1)); }); noise(mulai || 0, 0.14, 0.1, 'bandpass', f * 3, f * 2, 0.8, 0.002); }
  function ketukKayu(mulai, f, vol) { nada(f || 200, mulai || 0, 0.09, 'sine', vol || 0.25, (f || 200) * 0.5); noise(mulai || 0, 0.04, (vol || 0.25) * 0.5, 'lowpass', 1500, 600, 0.7, 0.002); }
  function bunyiKoin(mulai) { nada(3136, mulai || 0, 0.12, 'sine', 0.07); nada(4186, (mulai || 0) + 0.03, 0.22, 'sine', 0.06); }
  /* Latar berulang (hujan, ombak). Berhenti otomatis saat layar desain ditutup atau suara dimatikan. */
  var amb = {}, ambTimer = 0, tetes = 0;
  function jagaAmbien() {
    if (ambTimer) return;
    ambTimer = setInterval(function () { if (!Object.keys(amb).length) { clearInterval(ambTimer); ambTimer = 0; return; } if (!document.querySelector('.sp-layar')) S.berhenti(); }, 1500);
  }
  function ambienMulai(nama, tipe, f, q, vol, lfoHz, lfoDalam) {
    var c = ac(); if (!c) return; ambienStop(nama, 0.05);
    var n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0), i; for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = buf; s.loop = true; fl.type = tipe; fl.frequency.value = f; fl.Q.value = q || 0.7; g.gain.value = 0.0001;
    s.connect(fl); fl.connect(g); g.connect(master); s.start(); g.gain.linearRampToValueAtTime(Math.max(0.0002, vol), c.currentTime + 0.9);
    var lfo = null; if (lfoHz) { lfo = c.createOscillator(); var lg = c.createGain(); lfo.frequency.value = lfoHz; lg.gain.value = vol * (lfoDalam || 0.5); lfo.connect(lg); lg.connect(g.gain); lfo.start(); }
    amb[nama] = { s: s, g: g, lfo: lfo }; jagaAmbien();
  }
  function ambienAtur(nama, vol, dur) {
    var a = amb[nama]; if (!a || !ctx) return; var t = ctx.currentTime; a.g.gain.cancelScheduledValues(t); a.g.gain.setValueAtTime(Math.max(0.0001, a.g.gain.value), t); a.g.gain.linearRampToValueAtTime(Math.max(0.0001, vol), t + (dur || 0.8));
  }
  function ambienStop(nama, fade) {
    var a = amb[nama]; if (!a) return; delete amb[nama]; var t = ctx ? ctx.currentTime : 0, f = fade == null ? 1 : fade;
    try { a.g.gain.cancelScheduledValues(t); a.g.gain.setValueAtTime(Math.max(0.0001, a.g.gain.value), t); a.g.gain.linearRampToValueAtTime(0.0001, t + f); a.s.stop(t + f + 0.1); if (a.lfo) a.lfo.stop(t + f + 0.1); } catch (e) { /* abaikan */ }
  }
  var tema = '';
  /** Bunyi klik tombol mengikuti tema desain (ketukan kayu, bip kasir, petikan gitar, dst.). */
  var KLIK_TEMA = {
    movie: function () { nada(140, 0, 0.05, 'square', 0.05); noise(0, 0.03, 0.06, 'highpass', 3000, 2000, 0.5); },
    mall: function () { nada(2400, 0, 0.06, 'square', 0.05); },
    bestie: function () { ketukKayu(0, 260, 0.14); },
    feed: function () { nada(1046, 0, 0.07, 'sine', 0.1); nada(1568, 0.04, 0.09, 'sine', 0.07); },
    musik: function () { var n = [330, 392, 440, 523, 587][Math.floor(Math.random() * 5)]; nada(n, 0, 0.35, 'triangle', 0.1); nada(n * 2, 0, 0.18, 'sine', 0.03); },
    misi: function () { nada(1800, 0, 0.04, 'square', 0.045); nada(1200, 0.05, 0.04, 'square', 0.04); },
    romantique: function () { nada(659, 0, 0.5, 'sine', 0.08); nada(1318, 0.01, 0.3, 'sine', 0.025); },
    wisuda: function () { noise(0, 0.06, 0.1, 'bandpass', 3200, 1800, 0.6, 0.004); },
    lebaran: function () { nada(110, 0, 0.18, 'sine', 0.14, 80); },
    imlek: function () { ketukKayu(0, 340, 0.16); },
    mancing: function () { nada(700, 0, 0.09, 'sine', 0.1, 260); },
    awards: function () { noise(0, 0.05, 0.12, 'highpass', 2500, 1800, 0.5, 0.003); nada(180, 0.02, 0.05, 'square', 0.04); },
    resep: function () { nada(1760, 0, 0.1, 'triangle', 0.07); ketukKayu(0.02, 380, 0.08); },
    rumah: function () { ketukKayu(0, 190, 0.2); },
    brankas: function () { nada(1500, 0, 0.03, 'square', 0.06); nada(900, 0.04, 0.05, 'square', 0.06); },
    hujan: function () { nada(1000 + Math.random() * 300, 0, 0.07, 'sine', 0.09, 350); },
    lahir: function () { var n = [784, 988, 1175, 1319][Math.floor(Math.random() * 4)]; nada(n, 0, 0.4, 'sine', 0.07); },
    uelegan: function () { nada(523, 0, 0.6, 'sine', 0.07); nada(1047, 0.01, 0.3, 'sine', 0.02); },
    uceria: function () { nada(880, 0, 0.07, 'triangle', 0.1, 1320); },
    uhangat: function () { lonceng(330, 0, 0.06, 0.8); },
    uislami: function () { lonceng(587, 0, 0.07, 0.9); }, urustik: function () { ketukKayu(0, 300, 0.12); nada(1500, 0.02, 0.06, 'triangle', 0.04); },
    ubintang: function () { nada(2093, 0, 0.14, 'sine', 0.06); nada(2794, 0.05, 0.12, 'sine', 0.04); }, ujawa: function () { lonceng(392, 0, 0.07, 1); }, uroyal: function () { nada(523, 0, 0.35, 'triangle', 0.1); nada(1047, 0.01, 0.15, 'sine', 0.04); }
  };
  var S = {
    aktif: function () { return !senyap; },
    klik: function () { if (!batas('klik', 60)) return; if (tema && KLIK_TEMA[tema]) { KLIK_TEMA[tema](); return; } nada(760, 0, 0.05, 'triangle', 0.09, 540); },
    /** Menetapkan tema bunyi desain yang sedang tampil ('' = bawaan). Menghentikan latar desain sebelumnya. */
    tema: function (k) { if (tema !== (k || '')) S.berhenti(); tema = k || ''; },
    berhenti: function () { Object.keys(amb).forEach(function (n) { ambienStop(n, 0.4); }); if (tetes) { clearInterval(tetes); tetes = 0; } },
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

    /* ===== AIR & ALAM ===== */
    air: function () { if (!batas('air', 50)) return; var f = acak(700, 1100); nada(f, 0, 0.09, 'sine', 0.12, f * 0.35); nada(f * 1.5, 0.03, 0.06, 'sine', 0.04, f * 0.6); },
    cipratan: function () { noise(0, 0.5, 0.22, 'bandpass', 900, 2600, 0.6, 0.01); for (var i = 0; i < 4; i++) { (function (k) { var f = acak(500, 1000); nada(f, 0.05 + k * 0.07, 0.08, 'sine', 0.08, f * 0.4); })(i); } },
    ombak: function () { noise(0, 3, 0.2, 'lowpass', 380, 1300, 0.5, 1.3); },
    ombakMulai: function () { ambienMulai('ombak', 'lowpass', 420, 0.5, 0.07, 0.11, 0.8); },
    ombakStop: function () { ambienStop('ombak', 1.2); },
    hujanMulai: function (lv) {
      var v = Math.max(0, Math.min(1, lv == null ? 1 : lv)); ambienMulai('hujan', 'highpass', 1400, 0.6, 0.02 + v * 0.07, 0.3, 0.25); ambienMulai('hujan2', 'bandpass', 3800, 0.5, 0.01 + v * 0.035, 0.2, 0.3);
      if (tetes) clearInterval(tetes); tetes = setInterval(function () { if (amb.hujan && Math.random() < 0.6) S.air(); }, 650);
    },
    hujanAtur: function (lv) { var v = Math.max(0, Math.min(1, lv)); ambienAtur('hujan', 0.003 + v * 0.07, 1.2); ambienAtur('hujan2', 0.002 + v * 0.035, 1.2); },
    hujanStop: function () { ambienStop('hujan', 2.2); ambienStop('hujan2', 2.2); if (tetes) { clearInterval(tetes); tetes = 0; } },
    gesekKaca: function () { if (!batas('gesekKaca', 95)) return; noise(0, 0.16, 0.1, 'bandpass', acak(2200, 3000), 5200, 1.4, 0.02); var f = acak(1800, 2300); nada(f, 0.02, 0.1, 'sine', 0.02, f * 1.25); },
    pasir: function () { if (!batas('pasir', 110)) return; noise(0, 0.22, 0.12, 'bandpass', 1800, 3600, 0.5, 0.03); },
    angin: function () { noise(0, 1.3, 0.12, 'bandpass', 600, 1800, 0.6, 0.5); },
    kelopak: function () { if (!batas('kelopak', 120)) return; noise(0, 0.14, 0.07, 'highpass', 4800, 3500, 0.5, 0.02); nada(acak(1500, 2400), 0.03, 0.22, 'sine', 0.025); },
    burung: function () { for (var i = 0; i < 5; i++) { (function (k) { var f = acak(2300, 3500); nada(f, 0.15 + k * acak(0.12, 0.2), 0.09, 'sine', 0.045, f * 1.35); })(i); } },
    pelangi: function () { [523, 659, 784, 988, 1175].forEach(function (f, i) { lonceng(f, i * 0.12, 0.05, 1.1); }); },
    /* ===== PANCING ===== */
    lempar: function () { noise(0, 0.38, 0.13, 'bandpass', 500, 3200, 0.7, 0.04); nada(2600, 0.12, 0.28, 'sine', 0.03, 1500); },
    gigit: function () { nada(1320, 0, 0.18, 'sine', 0.12); nada(1760, 0.02, 0.22, 'sine', 0.08); for (var i = 0; i < 3; i++) nada(900, 0.08 + i * 0.07, 0.04, 'square', 0.05); },
    tarik: function () { for (var i = 0; i < 9; i++) nada(1500, i * 0.055, 0.025, 'square', 0.05); S.cipratan(); },
    ikan: function () { S.cipratan(); ketukKayu(0.18, 150, 0.2); ketukKayu(0.3, 150, 0.13); },
    peti: function () { nada(110, 0, 0.5, 'sawtooth', 0.05, 160); nada(160, 0.3, 0.3, 'sawtooth', 0.04, 110); ketukKayu(0.7, 120, 0.25); bunyiKoin(0.85); bunyiKoin(0.97); bunyiKoin(1.1); },
    /* ===== FILM & PANGGUNG ===== */
    klaket: function () { noise(0, 0.05, 0.4, 'highpass', 2000, 1500, 0.6, 0.002); nada(250, 0, 0.06, 'square', 0.1, 120); },
    proyektor: function () { for (var i = 0; i < 16; i++) nada(110 + (i % 2) * 14, i / 24, 0.025, 'square', 0.035); },
    tirai: function () { noise(0, 0.9, 0.16, 'lowpass', 280, 1300, 0.6, 0.35); },
    popcorn: function () { for (var i = 0; i < 9; i++) noise(i * acak(0.07, 0.14), 0.04, 0.14, 'bandpass', acak(1500, 3500), 900, 0.8, 0.002); },
    tepuk: function () { noise(0, 2.4, 0.22, 'bandpass', 2300, 2000, 0.4, 0.25); for (var i = 0; i < 28; i++) noise(acak(0, 2.1), 0.05, acak(0.06, 0.16), 'bandpass', acak(1500, 3800), 1200, 0.7, 0.002); },
    fanfare: function () { [392, 523, 659, 784].forEach(function (f, i) { nada(f, i * 0.13, 0.42, 'sawtooth', 0.06); nada(f * 2, i * 0.13, 0.3, 'triangle', 0.03); }); nada(1047, 0.56, 0.9, 'sawtooth', 0.07); },
    terompet: function () { nada(330, 0, 0.55, 'sawtooth', 0.09, 560); noise(0.38, 0.18, 0.12, 'bandpass', 3000, 1500, 0.8, 0.005); },
    lampu: function () { nada(90, 0, 0.12, 'square', 0.12, 60); noise(0.02, 0.2, 0.08, 'highpass', 3000, 5000, 0.5, 0.01); },
    /* ===== BELANJA & KOTA ===== */
    kasir: function () { ketukKayu(0, 120, 0.22); nada(2093, 0.1, 0.3, 'sine', 0.1); lonceng(1568, 0.14, 0.09, 1.2); },
    pindai: function () { nada(2400, 0, 0.09, 'square', 0.06); },
    kardus: function () { noise(0, 0.2, 0.15, 'bandpass', 700, 300, 0.7, 0.01); ketukKayu(0.1, 150, 0.15); },
    kumpul: function () { [784, 988, 1319].forEach(function (f, i) { nada(f, i * 0.06, 0.25, 'triangle', 0.09); }); },
    langkah: function () { for (var i = 0; i < 4; i++) { ketukKayu(i * 0.22, 110 + (i % 2) * 18, 0.14); noise(i * 0.22, 0.07, 0.05, 'lowpass', 900, 400, 0.6, 0.004); } },
    notif: function () { nada(880, 0, 0.12, 'sine', 0.12); nada(1320, 0.09, 0.22, 'sine', 0.1); },
    /* ===== MUSIK & RADIO ===== */
    petik: function () { var n = [330, 392, 440, 523, 659][Math.floor(Math.random() * 5)]; nada(n, 0, 0.7, 'triangle', 0.12); nada(n * 2, 0, 0.35, 'sine', 0.04); },
    piano: function () { [523, 659, 784, 1047].forEach(function (f, i) { nada(f, i * 0.12, 1.1, 'sine', 0.07); nada(f * 2, i * 0.12, 0.5, 'sine', 0.015); }); },
    kotakMusik: function () { [1047, 1319, 1568, 1319, 1175, 1568].forEach(function (f, i) { nada(f, i * 0.28, 0.5, 'sine', 0.06); nada(f * 2, i * 0.28, 0.2, 'sine', 0.015); }); },
    radio: function () { noise(0, 0.28, 0.1, 'bandpass', 1900, 1600, 0.8, 0.01); nada(1000, 0.3, 0.07, 'square', 0.05); nada(1400, 0.4, 0.07, 'square', 0.05); },
    kartuBalik: function () { noise(0, 0.1, 0.12, 'highpass', 3500, 2200, 0.5, 0.01); nada(900, 0.02, 0.1, 'triangle', 0.06, 1300); },
    /* ===== TRADISI & RUMAH ===== */
    bedug: function () { nada(75, 0, 0.9, 'sine', 0.5, 45); nada(150, 0, 0.3, 'triangle', 0.12, 80); noise(0, 0.06, 0.12, 'lowpass', 400, 200, 0.7, 0.003); nada(75, 0.55, 0.9, 'sine', 0.42, 42); },
    kenong: function () { lonceng(392, 0, 0.1, 1.6); lonceng(587, 0.18, 0.07, 1.4); },
    gong: function () { gongBunyi(130, 0, 0.22); },
    petasan: function () { for (var i = 0; i < 14; i++) noise(i * acak(0.04, 0.09) + 0.02, 0.05, acak(0.12, 0.3), 'bandpass', acak(1500, 4200), 800, 0.6, 0.001); },
    koin: function () { bunyiKoin(0); bunyiKoin(0.09); bunyiKoin(0.17); },
    angpao: function () { S.kertas(); bunyiKoin(0.32); },
    barongsai: function () { for (var i = 0; i < 8; i++) { nada(100, i * 0.16, 0.1, 'sine', 0.3, 60); if (i % 2) noise(i * 0.16, 0.12, 0.1, 'highpass', 4000, 3000, 0.5, 0.002); } gongBunyi(180, 1.3, 0.14); },
    toples: function () { nada(520, 0, 0.1, 'sine', 0.12, 220); noise(0, 0.05, 0.1, 'bandpass', 2400, 1200, 0.6, 0.002); },
    lonceng: function () { lonceng(784, 0, 0.1, 1.6); lonceng(1047, 0.2, 0.08, 1.4); },
    ketukPintu: function () { ketukKayu(0, 150, 0.28); ketukKayu(0.2, 150, 0.26); ketukKayu(0.4, 150, 0.3); },
    pintu: function () { nada(150, 0, 0.8, 'sawtooth', 0.05, 230); nada(230, 0.4, 0.45, 'sawtooth', 0.04, 160); noise(0, 0.5, 0.04, 'bandpass', 500, 700, 1.2, 0.2); },
    laci: function () { noise(0, 0.28, 0.1, 'bandpass', 500, 900, 1, 0.08); ketukKayu(0.28, 130, 0.12); },
    tuang: function () { noise(0, 1, 0.12, 'bandpass', 1200, 2300, 0.8, 0.1); for (var i = 0; i < 5; i++) { var f = acak(500, 900); nada(f, 0.2 + i * 0.13, 0.07, 'sine', 0.06, f * 1.6); } },
    sizzle: function () { noise(0, 1.1, 0.13, 'highpass', 3200, 4200, 0.6, 0.08); },
    aduk: function () { for (var i = 0; i < 4; i++) { nada(1700 + i * 60, i * 0.18, 0.1, 'triangle', 0.07); ketukKayu(i * 0.18 + 0.02, 330, 0.08); } },
    kerlip: function () { [2093, 2637, 3136, 2349, 3520].forEach(function (f, i) { nada(f, i * 0.09, 0.28, 'sine', 0.05); }); noise(0.3, 1.1, 0.04, 'highpass', 6000, 8000, 0.5, 0.2); },
    /* ===== BRANKAS & MENULIS ===== */
    roda: function () { for (var i = 0; i < 10; i++) { nada(1900 - i * 40, i * (0.07 + i * 0.006), 0.02, 'square', 0.06); noise(i * (0.07 + i * 0.006), 0.02, 0.05, 'highpass', 3000, 2500, 0.5, 0.001); } },
    gembok: function () { nada(1300, 0, 0.04, 'square', 0.08); nada(700, 0.07, 0.08, 'square', 0.09); ketukKayu(0.1, 220, 0.1); },
    besi: function () { nada(95, 0, 0.35, 'square', 0.1, 55); noise(0, 0.2, 0.14, 'lowpass', 900, 300, 0.7, 0.003); gongBunyi(220, 0.02, 0.08); },
    pena: function () { if (!batas('pena', 55)) return; noise(0, 0.05, 0.08, 'bandpass', acak(2600, 3600), 2000, 1.2, 0.004); },
    segel: function () { nada(210, 0, 0.07, 'square', 0.09, 110); noise(0, 0.1, 0.14, 'bandpass', 2400, 1200, 0.8, 0.002); S.kertas(); },
    toggle: function () {
      senyap = !senyap; if (senyap) S.berhenti(); try { localStorage.setItem(KEY, senyap ? '0' : '1'); } catch (e) { /* abaikan */ }
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
