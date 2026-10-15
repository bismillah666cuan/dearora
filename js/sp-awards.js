/* ==========================================================
   DEARORA AWARDS — malam penghargaan: karpet merah dan sorot lampu → buka amplop (drum) → "And the winner is..." →
   piala dan alasan menang → pidato kemenangan. Semua ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var PIALA = '<svg viewBox="0 0 100 130" aria-hidden="true"><defs><linearGradient id="awG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".5" stop-color="#F5C242"/><stop offset="1" stop-color="#B8820E"/></linearGradient></defs><path d="M24 8h52v30c0 20-12 34-26 34S24 58 24 38z" fill="url(#awG)"/><path d="M24 16H8c0 22 8 32 22 34M76 16h16c0 22-8 32-22 34" fill="none" stroke="#D89C1E" stroke-width="6" stroke-linecap="round"/><path d="M44 70h12v22H44z" fill="url(#awG)"/><path d="M28 92h44l6 16H22z" fill="url(#awG)"/><rect x="20" y="108" width="60" height="14" rx="3" fill="#7A4E08"/><path d="M50 18l5 10 11 1-8 8 2 11-10-6-10 6 2-11-8-8 11-1z" fill="#FFF8D2"/></svg>';
  var AMPLOP = '<svg viewBox="0 0 120 84" aria-hidden="true"><rect x="4" y="8" width="112" height="72" rx="6" fill="#7A0F2E"/><path class="flap" d="M4 14l56 36 56-36V8H4z" fill="#A3173F"/><circle cx="60" cy="52" r="11" fill="#F5C242"/><path d="M60 45l2.4 5 5.4.6-4 3.7 1.1 5.4-4.9-2.7-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="#7A0F2E"/></svg>';
  var MIK = '<svg viewBox="0 0 40 90" aria-hidden="true"><rect x="14" y="2" width="12" height="38" rx="6" fill="#C9CED8"/><path d="M8 24v6c0 8 5 13 12 13s12-5 12-13v-6" fill="none" stroke="#F5C242" stroke-width="3"/><path d="M20 43v34M10 86h20" stroke="#F5C242" stroke-width="4" stroke-linecap="round"/></svg>';
  S.reg('awards', {
    nama: 'Dearora Awards',
    adapt: function (f, c) { return { penerima: c.penerima, pengirim: c.pengirim, acara: f.acara || 'Dearora Awards', hadiah: (f.penghargaan || []).map(function (x) { return { judul: x.judul, alasan: x.alasan }; }), pidato: (f.pidato || {}).pesan || '' }; },
    mulai: function (root, d) {
      function layar(h, k) { root.innerHTML = '<div class="sp-layar aw-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function lampu() { var b = '', i; for (i = 0; i < 14; i++) b += '<i style="animation-delay:' + ((i % 5) * 0.2) + 's"></i>'; return '<div class="aw-lampu" aria-hidden="true">' + b + '</div>'; }
      function panggung() { return '<div class="aw-sorot s1" aria-hidden="true"></div><div class="aw-sorot s2" aria-hidden="true"></div><div class="aw-tirai" aria-hidden="true"></div>'; }
      function karpet() {
        var el = layar(panggung() + '<div class="aw-marquee">' + lampu() + '<p class="aw-kicker">MALAM PENGHARGAAN</p><h1>' + esc(d.acara) + '</h1><p class="aw-untuk">Untuk ' + esc(d.penerima) + '</p></div><div class="aw-karpet" aria-hidden="true"></div><button type="button" class="aw-btn">Mulai Acara ▶</button>', 'aw-karpetl');
        el.querySelector('.aw-btn').addEventListener('click', function () { if (window.Suara) window.Suara.buka(); beri(0); });
      }
      function beri(i) {
        var h = d.hadiah[i], akhir = i === d.hadiah.length - 1;
        var el = layar(panggung() + '<div class="aw-isi"><p class="aw-no">PENGHARGAAN ' + (i + 1) + ' DARI ' + d.hadiah.length + '</p><h2 class="aw-judul">' + esc(h.judul) + '</h2><button type="button" class="aw-amplop" aria-label="Buka amplop pemenang">' + AMPLOP + '</button><p class="aw-pet" id="awP">Ketuk amplop untuk membukanya</p><div class="aw-menang" id="awM" aria-live="polite" hidden></div></div>', 'aw-beril');
        var b = el.querySelector('.aw-amplop'), buka = false;
        b.addEventListener('click', function () {
          if (buka) return; buka = true; b.classList.add('buka'); if (window.Suara) window.Suara.drum();
          var p = el.querySelector('#awP'); p.textContent = 'And the winner is…'; p.classList.add('tegang');
          S.jeda(function () {
            p.hidden = true; b.hidden = true; var m = el.querySelector('#awM'); m.hidden = false;
            m.innerHTML = '<div class="aw-piala" aria-hidden="true">' + PIALA + '</div><p class="aw-pemenang">' + esc(d.penerima) + '</p><p class="aw-alasan">' + esc(h.alasan) + '</p><button type="button" class="aw-btn">' + (akhir ? 'Pidato kemenangan ›' : 'Penghargaan berikutnya ›') + '</button>';
            if (window.Suara) window.Suara.sukses(); S.dariEl(m, 56, ['#F5C242', '#FFF3B0', '#fff', '#E8336D'], { kuat: 10, naik: 8 });
            m.querySelector('.aw-btn').addEventListener('click', function () { if (akhir) pidato(); else beri(i + 1); });
          }, S.reduce ? 80 : 1900);
        });
      }
      function pidato() {
        layar(panggung() + '<div class="aw-isi"><p class="aw-no">PIDATO KEMENANGAN</p><div class="aw-podium"><span class="aw-mik" aria-hidden="true">' + MIK + '</span><span class="aw-piala kecil" aria-hidden="true">' + PIALA + '</span></div><p class="aw-pidato">' + S.kata(d.pidato, 4600, 52) + '</p>' + S.kredit(d.pengirim) + '</div>', 'aw-pidatol');
        S.confetti(innerWidth / 2, innerHeight * 0.3, 60, ['#F5C242', '#FFF3B0', '#fff'], { kuat: 9 }); if (window.Suara) window.Suara.konfeti(); S.akhir();
      }
      karpet();
    }
  });
})();
