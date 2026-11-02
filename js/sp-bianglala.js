/* ==========================================================
   BIANGLALA PASAR MALAM — gerbang neon, tiket, lalu bianglala raksasa: tiap putaran membawa satu gondola ke puncak dan membuka satu kenangan;
   gondola emas terakhir membuka pesan utama di bawah kembang api. Ilustrasi dan kembang api orisinal (kanvas).
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, reduce = S.reduce;
  var NEON = ['#FF2E93', '#2FE6FF', '#FF9A3D', '#B26BFF', '#7CFF8A'], EMAS = ['#FFE27A', '#FFB02E', '#FF2E93', '#2FE6FF', '#fff'];
  function api(cv) {                                                                   // kembang api sederhana di kanvas (berhenti sendiri)
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr;
    var c = cv.getContext('2d'); c.scale(dpr, dpr); var P = [], R = [], t0 = Date.now(), luncur = 0, raf = 0;
    function ledak(x, y, warna) { for (var i = 0; i < 46; i++) { var a = Math.random() * 6.283, v = 1.2 + Math.random() * 3.4; P.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, u: 0, m: 60 + Math.random() * 30, c: warna }); } if (window.Suara) window.Suara.pop && window.Suara.pop(); }
    if (reduce) { c.globalCompositeOperation = 'lighter'; [[0.25, 0.22], [0.5, 0.15], [0.75, 0.25]].forEach(function (p, i) { var g = c.createRadialGradient(w * p[0], h * p[1], 2, w * p[0], h * p[1], 60); g.addColorStop(0, NEON[i]); g.addColorStop(1, 'transparent'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); return; }
    function putar() {
      if (!document.body.contains(cv)) return; var t = Date.now() - t0;
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      if (t < 7500 && t - luncur > 520) { luncur = t; R.push({ x: w * (0.12 + Math.random() * 0.76), y: h, ty: h * (0.12 + Math.random() * 0.3), c: EMAS[Math.floor(Math.random() * 5)] }); }
      for (var i = R.length - 1; i >= 0; i--) { var r = R[i]; r.y -= 7; c.fillStyle = r.c; c.fillRect(r.x, r.y, 2, 8); if (r.y <= r.ty) { ledak(r.x, r.y, r.c); R.splice(i, 1); } }
      for (var j = P.length - 1; j >= 0; j--) { var p = P[j]; p.u++; p.vy += 0.045; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; if (p.u > p.m) { P.splice(j, 1); continue; } c.globalAlpha = 1 - p.u / p.m; c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, 1.8, 0, 6.3); c.fill(); }
      c.globalAlpha = 1; if (t < 9500 || P.length || R.length) raf = requestAnimationFrame(putar); else c.clearRect(0, 0, w, h);
    }
    raf = requestAnimationFrame(putar);
  }
  S.reg('bianglala', {
    nama: 'Bianglala Pasar Malam',
    adapt: function (f, c) {
      var p = f.puncak || {};
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Pasar Malam Ulang Tahun', gondola: (f.gondola || []).map(function (x) { return { judul: x.judul, cerita: x.cerita, foto: x.foto }; }), banner: p.judul || 'Selamat Ulang Tahun!', pesan: p.pesan || '' };
    },
    mulai: function (root, d) {
      var n = d.gondola.length, m = n + 1, langkah = 360 / m, idx = -1;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar bl-layar ' + (k || '') + '"><div class="bl-bintang" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' + h + '<div class="sn-grain" aria-hidden="true"></div><div class="sn-vig" aria-hidden="true"></div></div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function bohlam() { var s = ''; for (var i = 0; i < 14; i++) s += '<i style="--d:' + (i * 140) + 'ms;--c:' + NEON[i % 5] + '"></i>'; return '<div class="bl-bohlam" aria-hidden="true">' + s + '</div>'; }
      function gerbang() {
        var el = layar(bohlam() + '<div class="bl-papan" aria-label="' + esc(d.judul) + '"><span>' + esc(d.judul) + '</span></div><div class="bl-loket" aria-hidden="true"><i class="bl-tiket"></i></div><p class="bl-sub">Selamat datang di pasar malam, ' + esc(d.penerima) + '!</p><button type="button" class="bl-btn" id="blT">Ambil tiket</button>', 'bl-gerbang');
        el.querySelector('#blT').addEventListener('click', function (e) { e.currentTarget.disabled = true; el.classList.add('tiket'); if (window.Suara) { window.Suara.kertas(); window.Suara.ding(); } S.jeda(roda, 1100); });
      }
      function roda() {
        var rangka = '<svg class="bl-rangka" viewBox="-100 -100 200 200" aria-hidden="true"><circle r="86" fill="none" stroke="#2FE6FF" stroke-width="2.2"/><circle r="62" fill="none" stroke="#FF2E93" stroke-width="1.6" opacity=".8"/>';
        for (var i = 0; i < m; i++) { var a = i * langkah * Math.PI / 180; rangka += '<line x1="0" y1="0" x2="' + (86 * Math.sin(a)).toFixed(1) + '" y2="' + (-86 * Math.cos(a)).toFixed(1) + '" stroke="#B26BFF" stroke-width="1.6" opacity=".9"/>'; }
        for (var j = 0; j < 36; j++) { var b = j * 10 * Math.PI / 180; rangka += '<circle cx="' + (86 * Math.sin(b)).toFixed(1) + '" cy="' + (-86 * Math.cos(b)).toFixed(1) + '" r="2.4" fill="#FFE27A" class="bl-lp" style="animation-delay:' + (j * 60) + 'ms"/>'; }
        rangka += '<circle r="7" fill="#FF9A3D"/></svg>';
        var gon = ''; for (var k = 0; k < m; k++) { var t = k * langkah * Math.PI / 180, emas = k === n; gon += '<div class="bl-gon" style="left:' + (50 + 43 * Math.sin(t)).toFixed(2) + '%;top:' + (50 - 43 * Math.cos(t)).toFixed(2) + '%"><span class="bl-gantung ' + (emas ? 'emas' : '') + '" style="--c:' + (emas ? '#FFB02E' : NEON[k % 5]) + '"><i></i></span></div>'; }
        var el = layar('<p class="bl-kop">' + esc(d.judul.toUpperCase()) + '</p><div class="bl-kartu" id="blK" aria-live="polite"><p class="bl-hint">Putar bianglalanya, satu gondola satu kenangan.</p></div><div class="bl-roda-w"><div class="bl-roda" id="blR" style="--rot:0deg">' + rangka + gon + '</div><i class="bl-tiang" aria-hidden="true"></i></div><div class="bl-aksi"><button type="button" class="bl-btn" id="blP">Putar bianglala</button></div><canvas class="bl-fw" id="blF" aria-hidden="true"></canvas>', 'bl-roda-l');
        var wheel = el.querySelector('#blR'), btn = el.querySelector('#blP'), kartu = el.querySelector('#blK');
        btn.addEventListener('click', function () {
          if (btn.disabled) return; btn.disabled = true; idx++; wheel.style.setProperty('--rot', (-idx * langkah) + 'deg'); if (window.Suara) { window.Suara.whoosh(); }
          S.jeda(function () {
            if (window.Suara) window.Suara.ding();
            if (idx < n) { var g = d.gondola[idx]; kartu.innerHTML = '<small>GONDOLA ' + (idx + 1) + ' DARI ' + n + '</small><h3>' + esc(g.judul) + '</h3>' + (g.foto ? '<img alt="" src="' + esc(S.src(g.foto, idx)) + '">' : '') + '<p>' + esc(g.cerita) + '</p>'; kartu.classList.remove('masuk'); void kartu.offsetWidth; kartu.classList.add('masuk'); btn.textContent = idx < n - 1 ? 'Putar lagi' : 'Naik ke gondola emas'; btn.disabled = false; }
            else puncak(el, kartu, btn);
          }, 1700);
        });
      }
      function puncak(el, kartu, btn) {
        btn.remove(); el.classList.add('puncak'); if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); }
        kartu.innerHTML = '<h3 class="bl-banner">' + esc(d.banner) + '</h3><p>' + S.kata(d.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim); kartu.classList.remove('masuk'); void kartu.offsetWidth; kartu.classList.add('masuk');
        api(el.querySelector('#blF')); S.confetti(innerWidth / 2, innerHeight * 0.3, 60, EMAS, { kuat: 9 }); el.scrollTo(0, 0); S.akhir();
      }
      gerbang();
    }
  });
})();
