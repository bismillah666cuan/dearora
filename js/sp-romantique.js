/* ==========================================================
   CINEMATIC ROMANTIQUE — bunga hidup, nama muncul dari tumpukan bunga, bunga disapu menjadi pasir,
   nama ditulis di pasir, lalu halaman romantis (foto + kata-kata pembeli). Semua ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  S.reg('romantique', {
    nama: 'Cinematic Romantique',
    adapt: function (f, c) {
      return { penerima: c.penerima, pengirim: c.pengirim, salam: f.salam || '', tulis: String(f.tulis || c.penerima || 'Kita').slice(0, 24),
        halaman: (f.halaman || []).map(function (h) { return { foto: h.foto, kata: h.kata }; }), penutup: (f.penutup || {}).pesan || '' };
    },
    mulai: function (root, d) {
      var raf = 0, selesai = false;
      function layar(h, k) { cancelAnimationFrame(raf); root.innerHTML = '<div class="sp-layar rm-layar ' + (k || '') + '">' + h + '</div>'; return root.firstChild; }
      function kanvas(cv) { var W = innerWidth, H = innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; return { W: W, H: H, dpr: dpr }; }

      function bunga() {
        selesai = false;
        var el = layar('<div class="rm-pasir-bg"></div><canvas class="rm-bunga"></canvas><div class="rm-nama"><p class="rm-untuk">Untuk</p><h1>' + esc(d.penerima) + '</h1><p class="rm-salam">' + esc(d.salam) + '</p></div><p class="rm-petunjuk">Sapu bunganya dengan jarimu</p><button type="button" class="rm-lewat" hidden>Sapu semuanya</button>', 'rm-bunga-l');
        var cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), k = kanvas(cv), W = k.W, H = k.H, dpr = k.dpr;
        var mask = document.createElement('canvas'); mask.width = W * dpr; mask.height = H * dpr; var mx = mask.getContext('2d'); mx.scale(dpr, dpr); mx.fillStyle = '#000';
        var PAL = ['#8E2043', '#C94F6D', '#E8A5B3', '#F0D9A0', '#B88A2E', '#6E1830'], fl = [], i;
        for (i = 0; i < 120; i++) fl.push({ x: Math.random() * W, y: Math.random() * H * 1.02, r: 18 + Math.random() * 34, c: PAL[i % PAL.length], p: Math.random() * 6, rot: Math.random() * 6, hati: i % 7 === 0 });
        var t0 = performance.now();
        function pet(x, y, r, c, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = c; for (var q = 0; q < 6; q++) { ctx.rotate(1.0472); ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 0.32, r * 0.55, 0, 0, 6.3); ctx.fill(); } ctx.fillStyle = '#F6E3A1'; ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, 6.3); ctx.fill(); ctx.restore(); }
        function hati(x, y, r, c, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot * 0.3); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, r * 0.35); ctx.bezierCurveTo(-r, -r * 0.3, -r * 0.55, -r, 0, -r * 0.45); ctx.bezierCurveTo(r * 0.55, -r, r, -r * 0.3, 0, r * 0.35); ctx.fill(); ctx.restore(); }
        function gambar(now) {
          var t = Math.max(0, (now - t0) / 1000), g = Math.min(1, t / 1.6);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
          var gr = ctx.createRadialGradient(W / 2, H * 0.3, 10, W / 2, H * 0.4, H); gr.addColorStop(0, '#3A1226'); gr.addColorStop(0.6, '#14080F'); gr.addColorStop(1, '#070307'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);      // latar gelap ikut tersapu, memperlihatkan pasir
          fl.forEach(function (b) { var s = g * (1 + Math.sin(t * 1.3 + b.p) * 0.06), rot = b.rot + Math.sin(t * 0.8 + b.p) * 0.18, yy = b.y + Math.sin(t + b.p) * 3; if (b.hati) hati(b.x, yy, b.r * s, '#E3BE7B', rot); else pet(b.x, yy, b.r * s, b.c, rot); });
          ctx.globalCompositeOperation = 'destination-out'; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(mask, 0, 0); ctx.globalCompositeOperation = 'source-over';
          raf = requestAnimationFrame(gambar);
        }
        raf = requestAnimationFrame(gambar);
        S.jeda(function () { var n = el.querySelector('.rm-nama'); if (n) n.classList.add('muncul'); }, 1900);
        S.jeda(function () { var b = el.querySelector('.rm-lewat'); if (b) b.hidden = false; }, 9000);
        var turun = false, hitung = 0;
        function tuntas() { if (selesai) return; selesai = true; cancelAnimationFrame(raf); cv.classList.add('hilang'); if (window.Suara) window.Suara.angin(); S.jeda(pasir, 900); }
        function cek() { var sm = document.createElement('canvas'); sm.width = 24; sm.height = 36; var sx = sm.getContext('2d'); sx.drawImage(mask, 0, 0, 24, 36); var dta = sx.getImageData(0, 0, 24, 36).data, n = 0, q; for (q = 3; q < dta.length; q += 4) if (dta[q] > 128) n++; if (n / (24 * 36) > 0.34) tuntas(); }
        function sapu(e) { if (!turun) return; mx.beginPath(); mx.arc(e.clientX, e.clientY, 46, 0, 6.3); mx.fill(); if (window.Suara) window.Suara.kelopak(); if (++hitung % 6 === 0) cek(); }
        el.addEventListener('pointerdown', function (e) { turun = true; sapu(e); }); el.addEventListener('pointermove', sapu);
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { el.addEventListener(n, function () { turun = false; }); });
        el.querySelector('.rm-lewat').addEventListener('click', function (e) { e.stopPropagation(); mx.fillRect(0, 0, W, H); tuntas(); });
      }

      function pasir() {
        var kata = d.tulis;
        var el = layar('<div class="rm-pasir-full"></div><p class="rm-pandu" aria-hidden="true">' + esc(kata) + '</p><canvas class="rm-tulis"></canvas><p class="rm-petunjuk2">Tulis “' + esc(kata) + '” di atas pasir dengan jarimu</p><button type="button" class="rm-lanjut" hidden>Lanjut ›</button>', 'rm-pasir-l');
        var cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), k = kanvas(cv); ctx.setTransform(k.dpr, 0, 0, k.dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        var turun = false, last = null, panjang = 0, btn = el.querySelector('.rm-lanjut');
        function garis(a, b) { ctx.strokeStyle = 'rgba(70,45,20,.5)'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(a.x + 2, a.y + 2); ctx.lineTo(b.x + 2, b.y + 2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,238,200,.78)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(a.x - 1, a.y - 1); ctx.lineTo(b.x - 1, b.y - 1); ctx.stroke(); }
        el.addEventListener('pointerdown', function (e) { turun = true; last = { x: e.clientX, y: e.clientY }; });
        el.addEventListener('pointermove', function (e) { if (!turun) return; var p = { x: e.clientX, y: e.clientY }; garis(last, p); panjang += Math.hypot(p.x - last.x, p.y - last.y); last = p; if (window.Suara) window.Suara.pasir(); if (panjang > 260) btn.hidden = false; });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { el.addEventListener(n, function () { turun = false; }); });
        btn.addEventListener('click', function () { halaman(0); });
        S.jeda(function () { btn.hidden = false; }, 14000);
      }

      function halaman(i) {
        var h = d.halaman[i], akhir = i === d.halaman.length - 1;
        var el = layar('<div class="rm-hal"><div class="rm-foto" style="background-image:url(' + "'" + esc(S.src(h.foto, i)) + "'" + ')"></div><div class="rm-grad"></div><p class="rm-no">' + (i + 1) + ' / ' + d.halaman.length + '</p><p class="rm-kata">' + S.kata(h.kata, 2600, 85) + '</p><button type="button" class="rm-lanjut">' + (akhir ? 'Satu pesan terakhir ›' : 'Lanjut ›') + '</button></div>', 'rm-hal-l');
        if (window.Suara) window.Suara.piano();
        el.querySelector('.rm-lanjut').addEventListener('click', function () { if (akhir) penutup(); else halaman(i + 1); });
      }

      function penutup() {
        layar('<div class="rm-akhir"><p class="rm-ikon" aria-hidden="true">❦</p><p class="rm-pesan">' + S.kata(d.penutup, 3500, 60) + '</p>' + S.kredit(d.pengirim) + '</div>', 'rm-akhir-l');
        S.confetti(innerWidth / 2, innerHeight * 0.3, 40, ['#E3BE7B', '#C94F6D', '#F6E3A1'], { kuat: 7 }); S.akhir();
      }
      bunga();
    }
  });
})();
