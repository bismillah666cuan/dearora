/* ==========================================================
   HUJAN REDA — permintaan maaf yang lembut: kaca berembun dengan hujan; penerima mengusap kaca untuk membaca tiap kalimat,
   dan hujan mereda pelan-pelan sampai muncul pelangi, lalu penjelasan dan maaf. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  S.reg('hujan', {
    nama: 'Hujan Reda',
    adapt: function (f, c) { return { penerima: c.penerima, pengirim: c.pengirim, pesan: (f.pesan || []).map(function (x) { return x.teks; }), penutup: (f.penutup || {}).pesan || '' }; },
    mulai: function (root, d) {
      var raf = 0, level = 1, baca = {}, jumlah = 0, tuntas = false;
      function layar(h, k) { cancelAnimationFrame(raf); root.innerHTML = '<div class="sp-layar hj-layar ' + (k || '') + '">' + h + '</div>'; return root.firstChild; }
      function jendela() {
        var n = d.pesan.length;
        var el = layar('<div class="hj-pelangi" aria-hidden="true"></div><div class="hj-kolom">' + d.pesan.map(function (t, i) { return '<p class="hj-teks" data-i="' + i + '">' + esc(t) + '</p>'; }).join('') + '</div><canvas class="hj-kabut"></canvas><canvas class="hj-hujan"></canvas><p class="hj-pet" id="hjP" role="status">Usap kaca yang berembun dengan jarimu</p><button type="button" class="hj-lewat" hidden>Bersihkan semuanya</button>', 'hj-jendela');
        var kb = el.querySelector('.hj-kabut'), hj = el.querySelector('.hj-hujan'), W = innerWidth, H = innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
        [kb, hj].forEach(function (c) { c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; });
        var kx = kb.getContext('2d'), rx = hj.getContext('2d'); kx.scale(dpr, dpr); rx.scale(dpr, dpr);
        var g = kx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(176,196,214,.96)'); g.addColorStop(1, 'rgba(150,172,194,.97)'); kx.fillStyle = g; kx.fillRect(0, 0, W, H);
        var i; for (i = 0; i < 260; i++) { kx.fillStyle = 'rgba(255,255,255,' + (0.03 + Math.random() * 0.05) + ')'; kx.beginPath(); kx.arc(Math.random() * W, Math.random() * H, 6 + Math.random() * 30, 0, 6.3); kx.fill(); }
        for (i = 0; i < 26; i++) { var tx = Math.random() * W, ty = Math.random() * H * 0.8; kx.fillStyle = 'rgba(255,255,255,.35)'; kx.beginPath(); kx.ellipse(tx, ty, 3 + Math.random() * 4, 6 + Math.random() * 8, 0, 0, 6.3); kx.fill(); }   // tetes di kaca
        var drops = [], tot = 170; for (i = 0; i < tot; i++) drops.push({ x: Math.random() * W, y: Math.random() * H, l: 10 + Math.random() * 22, v: 9 + Math.random() * 10 });
        function hujan() {
          rx.clearRect(0, 0, W, H); rx.strokeStyle = 'rgba(255,255,255,.55)'; rx.lineWidth = 1.4; var pakai = Math.round(tot * level);
          for (var q = 0; q < pakai; q++) { var p = drops[q]; rx.beginPath(); rx.moveTo(p.x, p.y); rx.lineTo(p.x - 2, p.y + p.l); rx.stroke(); p.y += p.v * (0.4 + level * 0.6); if (p.y > H) { p.y = -20; p.x = Math.random() * W; } }
          raf = requestAnimationFrame(hujan);
        }
        if (S.reduce) { level = 0.6; hujan(); cancelAnimationFrame(raf); } else raf = requestAnimationFrame(hujan);
        if (window.Suara) window.Suara.hujanMulai(1);
        var teks = el.querySelectorAll('.hj-teks'), pet = el.querySelector('#hjP');
        function rect(p) { var a = p.getBoundingClientRect(), b = el.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
        function cek() {
          teks.forEach(function (p) {
            var i2 = Number(p.dataset.i); if (baca[i2]) return; var r = rect(p), sm = document.createElement('canvas'); sm.width = 24; sm.height = 8;
            sm.getContext('2d').drawImage(kb, Math.max(0, r.x) * dpr, Math.max(0, r.y) * dpr, Math.max(1, r.w * dpr), Math.max(1, r.h * dpr), 0, 0, 24, 8);
            var dt = sm.getContext('2d').getImageData(0, 0, 24, 8).data, c = 0, q; for (q = 3; q < dt.length; q += 4) if (dt[q] < 110) c++;
            if (c / (24 * 8) > 0.5) terbaca(i2, p);
          });
        }
        function terbaca(i2, p) {
          baca[i2] = true; jumlah++; p.classList.add('baca'); if (window.Suara) window.Suara.air();
          level = Math.max(0, 1 - (jumlah / n) * 0.9); if (window.Suara) window.Suara.hujanAtur(level); el.style.setProperty('--terang', (jumlah / n).toFixed(2)); pet.textContent = jumlah + ' dari ' + n + ' kalimat terbaca. Hujan mulai mereda.';
          if (jumlah === n) reda();
        }
        function reda() {
          if (tuntas) return; tuntas = true; level = 0; pet.textContent = 'Hujan sudah reda.'; if (window.Suara) { window.Suara.hujanStop(); window.Suara.pelangi(); window.Suara.burung(); } kb.classList.add('hilang'); el.classList.add('reda');
          S.jeda(function () { cancelAnimationFrame(raf); rx.clearRect(0, 0, W, H); }, 1400);
          var lw = el.querySelector('.hj-lewat'); if (lw) lw.hidden = true;
          S.jeda(function () { pet.textContent = 'Hujan sudah reda. Baca dulu kalimat-kalimatnya, lalu tekan Lanjut.'; var b = document.createElement('button'); b.type = 'button'; b.className = 'hj-lewat hj-lanjut'; b.textContent = 'Lanjut ›'; el.appendChild(b); b.addEventListener('click', function () { if (window.Suara) window.Suara.buka(); penutup(); }); }, 2200);
        }
        var turun = false, hitung = 0;
        function usap(e) { if (!turun) return; kx.globalCompositeOperation = 'destination-out'; var gr = kx.createRadialGradient(e.clientX, e.clientY, 4, e.clientX, e.clientY, 46); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.65, 'rgba(0,0,0,.92)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); kx.fillStyle = gr; kx.beginPath(); kx.arc(e.clientX, e.clientY, 46, 0, 6.3); kx.fill(); kx.globalCompositeOperation = 'source-over'; if (window.Suara) window.Suara.gesekKaca(); if (++hitung % 5 === 0) cek(); }
        el.addEventListener('pointerdown', function (e) { turun = true; usap(e); }); el.addEventListener('pointermove', usap);
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (nm) { el.addEventListener(nm, function () { turun = false; cek(); }); });
        S.jeda(function () { var b = el.querySelector('.hj-lewat'); if (b) b.hidden = false; }, 12000);
        el.querySelector('.hj-lewat').addEventListener('click', function (e) { e.stopPropagation(); kx.globalCompositeOperation = 'destination-out'; kx.fillStyle = '#000'; kx.fillRect(0, 0, W, H); kx.globalCompositeOperation = 'source-over'; teks.forEach(function (p, q) { if (!baca[q]) { baca[q] = true; jumlah++; p.classList.add('baca'); } }); reda(); });
      }
      function penutup() {
        layar('<div class="hj-pelangi tampil" aria-hidden="true"></div><div class="hj-akhir"><p class="hj-kicker">SETELAH HUJAN</p><p class="hj-pesan">' + S.kata(d.penutup, 60000, 190) + '</p>' + S.kredit(d.pengirim) + '</div>', 'hj-penutupl');
        S.confetti(innerWidth / 2, innerHeight * 0.25, 36, ['#FFE9A3', '#FFD3B8', '#BFD8C6', '#fff'], { kuat: 6 });
        var kata = d.penutup.split(/\s+/).length; S.jeda(S.akhir, Math.min(16000, kata * 190 + 1800));      // tombol lanjut baru muncul setelah teks selesai dibaca
      }
      jendela();
    }
  });
})();
