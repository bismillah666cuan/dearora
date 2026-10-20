/* ==========================================================
   IDUL FITRI — silaturahmi digital: gerbang zamrud (bulan sabit, lentera, siluet masjid) → serambi → membuat kue lebaran
   → tiga pintu masjid berisi doa → permohonan maaf. Semua ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var BULAN = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="lbMask"><rect width="100" height="100" fill="#fff"/><circle cx="68" cy="38" r="34" fill="#000"/></mask></defs><circle cx="46" cy="52" r="42" fill="#F6D06F" mask="url(#lbMask)"/></svg>';
  var LENTERA = '<svg viewBox="0 0 60 110" aria-hidden="true"><path d="M30 0v14" stroke="#E3BE7B" stroke-width="2"/><rect x="18" y="12" width="24" height="8" rx="3" fill="#C99A2E"/><path d="M14 24c0-4 6-6 16-6s16 2 16 6l4 38c0 12-8 20-20 20S10 74 10 62z" fill="#FFB84D"/><path d="M22 28c-3 12-3 38 0 50M38 28c3 12 3 38 0 50" stroke="#C97A1E" stroke-width="2" fill="none" opacity=".6"/><ellipse cx="30" cy="54" rx="7" ry="12" fill="#FFF3B0" opacity=".9"/><rect x="21" y="82" width="18" height="7" rx="3" fill="#C99A2E"/><path d="M30 89v18" stroke="#E3BE7B" stroke-width="2"/><circle cx="30" cy="108" r="3" fill="#E3BE7B"/></svg>';
  var MASJID = '<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g fill="currentColor"><path d="M30 120V40l8-22 8 22v80zM354 120V40l8-22 8 22v80z"/><path d="M110 120V78c0-30 20-48 90-48s90 18 90 48v42z"/><path d="M200 30c-8 0-12-8-12-16 0-4 2-8 5-10-1 4 2 8 7 8s8-4 7-8c3 2 5 6 5 10 0 8-4 16-12 16z"/></g></svg>';
  var KETUPAT = '<svg viewBox="0 0 40 70" aria-hidden="true"><path d="M20 0v10" stroke="#E3BE7B" stroke-width="2"/><path d="M20 10 36 28 20 46 4 28z" fill="#7BC96F" stroke="#2F7A3A" stroke-width="2"/><path d="M12 28h16M20 18v20" stroke="#2F7A3A" stroke-width="1.5"/><path d="M20 46v10M16 56l4 10 4-10" stroke="#E3BE7B" stroke-width="2" fill="none"/></svg>';
  var NASTAR = '<svg viewBox="0 0 60 50" aria-hidden="true"><ellipse cx="30" cy="32" rx="26" ry="14" fill="#D98E3E"/><ellipse cx="30" cy="26" rx="26" ry="14" fill="#F2B45A"/><ellipse cx="30" cy="24" rx="12" ry="7" fill="#FFD27A"/><path d="M24 22c3-3 9-3 12 0" stroke="#C97A1E" stroke-width="2" fill="none"/></svg>';
  var BAHAN = ['Tepung', 'Mentega', 'Gula', 'Telur', 'Selai nanas'];
  S.reg('lebaran', {
    nama: 'Idul Fitri',
    adapt: function (f, c) { return { penerima: c.penerima, pengirim: c.pengirim, salam: f.salam || 'Selamat Hari Raya Idulfitri', ucapanKue: f.ucapanKue || '', pintu: (f.pintu || []).slice(0, 3), maaf: f.maaf || '' }; },
    mulai: function (root, d) {
      function layar(h, k) { root.innerHTML = '<div class="sp-layar lb-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function bintang() { var b = '', i; for (i = 0; i < 24; i++) b += '<i style="left:' + ((i * 41) % 96 + 2) + '%;top:' + ((i * 23) % 52 + 2) + '%;animation-delay:' + ((i % 7) * 0.4) + 's"></i>'; return '<div class="lb-bintang" aria-hidden="true">' + b + '</div>'; }
      function gerbang() {
        var el = layar(bintang() + '<div class="lb-bulan" aria-hidden="true">' + BULAN + '</div><div class="lb-lentera l1" aria-hidden="true">' + LENTERA + '</div><div class="lb-lentera l2" aria-hidden="true">' + LENTERA + '</div><div class="lb-masjid" aria-hidden="true">' + MASJID + '</div><div class="lb-isi"><p class="lb-kicker">1 SYAWAL</p><h1>' + esc(d.salam) + '</h1><p class="lb-untuk">untuk ' + esc(d.penerima) + '</p><button type="button" class="lb-btn">Masuk ke Serambi</button></div>', 'lb-gerbang');
        el.querySelector('.lb-btn').addEventListener('click', function () { if (window.Suara) window.Suara.bedug(); serambi(); });
      }
      function serambi() {
        var chip = BAHAN.map(function (b, i) { return '<button type="button" class="lb-chip" data-i="' + i + '">' + esc(b) + '</button>'; }).join('');
        var el = layar('<div class="lb-pintu-b" aria-hidden="true"><i class="kiri"></i><i class="kanan"></i></div><div class="lb-cahaya" aria-hidden="true"></div><div class="lb-ketupat k1" aria-hidden="true">' + KETUPAT + '</div><div class="lb-ketupat k2" aria-hidden="true">' + KETUPAT + '</div><div class="lb-serambi"><h2>Selamat datang di serambi</h2><p class="lb-pet">Bantu aku membuat kue lebaran ya. Ketuk bahan-bahannya satu per satu.</p><div class="lb-mangkuk" id="lbM" aria-hidden="true"><span class="adonan"></span><span class="sendok"></span></div><div class="lb-bahan" id="lbB">' + chip + '</div><p class="lb-info" id="lbI" role="status">0 / ' + BAHAN.length + ' bahan</p><button type="button" class="lb-btn" id="lbAduk" hidden>Aduk adonan</button><div class="lb-oven" id="lbOv" hidden><p>Memanggang…</p><div class="bar"><span></span></div></div><div class="lb-kue" id="lbK" hidden></div></div>', 'lb-seram');
        var pakai = 0, m = el.querySelector('#lbM'), info = el.querySelector('#lbI');
        el.querySelectorAll('.lb-chip').forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.disabled) return; b.disabled = true; b.classList.add('pakai'); pakai++; if (window.Suara) window.Suara.toples();
            m.style.setProperty('--isi', (pakai / BAHAN.length * 100) + '%'); info.textContent = pakai + ' / ' + BAHAN.length + ' bahan';
            if (pakai === BAHAN.length) { el.querySelector('#lbAduk').hidden = false; info.textContent = 'Semua bahan masuk. Saatnya diaduk!'; }
          });
        });
        el.querySelector('#lbAduk').addEventListener('click', function (e) {
          e.currentTarget.hidden = true; m.classList.add('aduk'); if (window.Suara) window.Suara.pintu();
          S.jeda(function () {
            m.classList.remove('aduk'); el.querySelector('#lbB').hidden = true; info.hidden = true; var ov = el.querySelector('#lbOv'); ov.hidden = false; ov.classList.add('jalan');
            S.jeda(function () { ov.hidden = true; var k = el.querySelector('#lbK'); k.hidden = false; k.innerHTML = '<div class="lb-nastar">' + NASTAR + NASTAR + NASTAR + '</div><p class="lb-ucapan">' + S.kata(d.ucapanKue, 3600, 60) + '</p><button type="button" class="lb-btn" id="lbPintu">Buka pintu doa ›</button>'; if (window.Suara) window.Suara.lonceng(); S.dariEl(k, 36, ['#F6D06F', '#7BC96F', '#fff'], { kuat: 7 }); k.querySelector('#lbPintu').addEventListener('click', pintu); }, 2400);
          }, 1700);
        });
      }
      function pintu() {
        var buka = {}, n = 0;
        var tiga = d.pintu.map(function (p, i) { return '<button type="button" class="lb-p" data-i="' + i + '" aria-label="Buka pintu ' + (i + 1) + ': ' + esc(p.judul) + '"><span class="lb-lengkung"><i class="daun"></i></span><span class="lb-no">' + (i + 1) + '</span></button>'; }).join('');
        var el = layar(bintang() + '<div class="lb-isi kecil"><h2>Tiga pintu doa</h2><p class="lb-pet">Ketuk setiap pintu masjid untuk membuka doanya.</p><div class="lb-tiga">' + tiga + '</div><div class="lb-doa" id="lbD" aria-live="polite"></div><button type="button" class="lb-btn" id="lbMaaf" hidden>Satu pesan lagi ›</button></div>', 'lb-pintu-l');
        el.querySelectorAll('.lb-p').forEach(function (b) {
          b.addEventListener('click', function () {
            var i = Number(b.dataset.i), p = d.pintu[i]; if (window.Suara) window.Suara.pintu(); b.classList.add('buka');
            if (!buka[i]) { buka[i] = true; n++; }
            el.querySelector('#lbD').innerHTML = '<div class="lb-kartu-d"><h3>' + esc(p.judul) + '</h3><p>' + esc(p.doa) + '</p></div>'; S.dariEl(b, 14, ['#F6D06F', '#fff'], { kuat: 5 });
            if (n === d.pintu.length) el.querySelector('#lbMaaf').hidden = false;
          });
        });
        el.querySelector('#lbMaaf').addEventListener('click', maaf);
      }
      function maaf() {
        layar(bintang() + '<div class="lb-bulan kecil" aria-hidden="true">' + BULAN + '</div><div class="lb-isi kecil"><div class="lb-surat"><p class="lb-kicker">MINAL AIDIN WAL FAIZIN</p><p class="lb-maaf">' + S.kata(d.maaf, 4800, 50) + '</p><p class="lb-ttd">Dari hati yang tulus,<br><b>' + esc(d.pengirim) + '</b></p></div>' + S.kredit(d.pengirim) + '</div>', 'lb-maaf-l');
        S.confetti(innerWidth / 2, innerHeight * 0.35, 44, ['#F6D06F', '#7BC96F', '#fff'], { kuat: 7 }); S.akhir();
      }
      gerbang();
    }
  });
})();
