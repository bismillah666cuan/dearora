/* ==========================================================
   IMLEK — perjalanan membuka keberuntungan: perayaan merah-emas dengan kembang api, tiga lentera berisi harapan,
   angpao + kotak hadiah, lalu barongsai yang hidup saat diketuk (tiap ketukan mengeluarkan koin emas).
   Semua ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var LAMPION = '<svg viewBox="0 0 60 100" aria-hidden="true"><path d="M30 0v12" stroke="#F5C242" stroke-width="2"/><rect x="20" y="10" width="20" height="7" rx="2" fill="#F5C242"/><ellipse cx="30" cy="48" rx="26" ry="32" fill="#D71920"/><path d="M30 16v64M18 20c-8 14-8 38 0 56M42 20c8 14 8 38 0 56" stroke="#F5C242" stroke-width="2" fill="none" opacity=".7"/><rect x="20" y="78" width="20" height="7" rx="2" fill="#F5C242"/><path d="M30 85v14M26 99h8" stroke="#F5C242" stroke-width="2"/></svg>';
  var AWAN = '<svg viewBox="0 0 120 40" aria-hidden="true"><path d="M10 30c-8 0-8-12 2-12 2-10 18-10 20-2 4-8 20-6 20 4 8-2 14 6 6 10zM70 30c-6 0-6-9 2-9 2-7 14-7 15-1 3-6 15-4 14 3 6-1 10 5 4 7z" fill="none" stroke="#F5C242" stroke-width="2" stroke-linecap="round"/></svg>';
  var ANGPAO = '<svg viewBox="0 0 80 110" aria-hidden="true"><rect x="6" y="8" width="68" height="96" rx="8" fill="#D71920"/><path class="flap" d="M6 16c0 22 68 22 68 0V8H6z" fill="#B31217"/><circle cx="40" cy="46" r="14" fill="#F5C242"/><text x="40" y="52" text-anchor="middle" font-size="16" fill="#B31217" font-weight="700">福</text><path d="M20 84h40M26 92h28" stroke="#F5C242" stroke-width="2" stroke-linecap="round"/></svg>';
  var KOTAK = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="12" y="44" width="76" height="48" rx="5" fill="#E8323A"/><g class="tutup"><rect x="6" y="30" width="88" height="20" rx="5" fill="#F5C242"/></g><rect x="45" y="30" width="10" height="62" fill="#F5C242"/><path d="M50 30c-14-18-26-4-12 2zM50 30c14-18 26-4 12 2z" fill="#F5C242"/></svg>';
  var SINGA = '<svg viewBox="0 0 160 150" aria-hidden="true"><g class="rambut" fill="#F5C242"><path d="M20 70l-14-8 10-8-8-10 14 0-4-12 16 8 4-14 12 12 12-14 8 14 14-8 2 14 14-2-4 14 14 4-12 10 10 10-16 2 2 14-16-6-6 14-12-10-12 12-8-14-14 6-2-14-14-2z" transform="translate(4 6)"/></g><circle cx="80" cy="78" r="46" fill="#D71920"/><path d="M52 42c8-16 48-16 56 0" fill="#B31217"/><circle cx="60" cy="68" r="13" fill="#fff"/><circle cx="100" cy="68" r="13" fill="#fff"/><circle cx="62" cy="70" r="6" fill="#222"/><circle cx="98" cy="70" r="6" fill="#222"/><ellipse cx="80" cy="88" rx="8" ry="6" fill="#F5C242"/><path class="mulut" d="M52 100c8 18 48 18 56 0z" fill="#7A0B10"/><path d="M60 100l6 8 6-8M88 100l6 8 6-8" fill="#fff"/><path d="M62 38c0-14 36-14 36 0" stroke="#F5C242" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
  S.reg('imlek', {
    nama: 'Imlek',
    adapt: function (f, c) { var h = f.hongbao || {}, g = f.hadiah || {}; return { penerima: c.penerima, pengirim: c.pengirim, salam: f.salam || 'Gong Xi Fa Cai', harapan: (f.harapan || []).slice(0, 3).map(function (x) { return x.teks; }), hongbao: { judul: h.judul || 'Angpao untukmu', doa: h.doa || '' }, hadiah: { nama: g.nama || '', isi: g.isi || '' }, penutup: f.penutup || '' }; },
    mulai: function (root, d) {
      var kembang = 0;
      function layar(h, k) { clearInterval(kembang); root.innerHTML = '<div class="sp-layar im-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function dekor() { return '<div class="im-awan a1" aria-hidden="true">' + AWAN + '</div><div class="im-awan a2" aria-hidden="true">' + AWAN + '</div>'; }
      function sambut() {
        var el = layar(dekor() + '<div class="im-gantung g1" aria-hidden="true">' + LAMPION + '</div><div class="im-gantung g2" aria-hidden="true">' + LAMPION + '</div><div class="im-gantung g3" aria-hidden="true">' + LAMPION + '</div><div class="im-isi"><p class="im-kicker">新年快乐</p><h1>' + esc(d.salam) + '</h1><p class="im-untuk">untuk ' + esc(d.penerima) + '</p><button type="button" class="im-btn">Nyalakan keberuntungan</button></div>', 'im-sambut');
        kembang = setInterval(function () { S.confetti(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.12 + Math.random() * 0.35), 26, ['#F5C242', '#FF4D4D', '#FFE08A', '#fff'], { kuat: 8, naik: 3 }); if (window.Suara) window.Suara.konfeti(); }, 1300);
        el.querySelector('.im-btn').addEventListener('click', function () { if (window.Suara) window.Suara.buka(); lentera(); });
      }
      function lentera() {
        var n = 0;
        var tiga = d.harapan.map(function (h, i) { return '<div class="im-slot"><button type="button" class="im-len" data-i="' + i + '" aria-label="Nyalakan lentera ' + (i + 1) + '">' + LAMPION + '</button><p class="im-harap" id="imH' + i + '"></p></div>'; }).join('');
        var el = layar(dekor() + '<div class="im-isi kecil"><h2>Nyalakan tiga lentera</h2><p class="im-pet">Ketuk lentera untuk menyalakannya dan baca harapan di dalamnya.</p><div class="im-tiga">' + tiga + '</div><button type="button" class="im-btn" id="imLanjut" hidden>Buka amplop ›</button></div>', 'im-lentera');
        el.querySelectorAll('.im-len').forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.classList.contains('nyala')) return; b.classList.add('nyala'); n++; if (window.Suara) window.Suara.tumbuh();
            el.querySelector('#imH' + b.dataset.i).textContent = d.harapan[Number(b.dataset.i)]; S.dariEl(b, 16, ['#F5C242', '#FFE08A'], { kuat: 5 });
            if (n === d.harapan.length) el.querySelector('#imLanjut').hidden = false;
          });
        });
        el.querySelector('#imLanjut').addEventListener('click', hadiah);
      }
      function hadiah() {
        var buka = 0;
        var el = layar(dekor() + '<div class="im-isi kecil"><h2>Angpao dan kotak hadiah</h2><p class="im-pet">Dua simbol pemberian dan keberuntungan. Ketuk untuk membukanya.</p><div class="im-dua"><button type="button" class="im-angpao" aria-label="Buka angpao">' + ANGPAO + '</button><button type="button" class="im-kotak" aria-label="Buka kotak hadiah">' + KOTAK + '</button></div><div class="im-isi-b" id="imB" aria-live="polite"></div><button type="button" class="im-btn" id="imBarong" hidden>Panggil barongsai ›</button></div>', 'im-hadiah');
        function selesaiSatu(kartu) { el.querySelector('#imB').insertAdjacentHTML('beforeend', kartu); buka++; if (buka === 2) el.querySelector('#imBarong').hidden = false; }
        el.querySelector('.im-angpao').addEventListener('click', function (e) { var b = e.currentTarget; if (b.classList.contains('buka')) return; b.classList.add('buka'); if (window.Suara) window.Suara.kertas(); S.dariEl(b, 40, ['#F5C242', '#FFE08A', '#D71920'], { kuat: 8, naik: 7 }); selesaiSatu('<div class="im-kartu"><h3>' + esc(d.hongbao.judul) + '</h3><p>' + esc(d.hongbao.doa) + '</p></div>'); });
        el.querySelector('.im-kotak').addEventListener('click', function (e) { var b = e.currentTarget; if (b.classList.contains('buka')) return; b.classList.add('buka'); if (window.Suara) window.Suara.hadiah(); S.dariEl(b, 30, ['#F5C242', '#fff'], { kuat: 7, naik: 6 }); selesaiSatu('<div class="im-kartu"><h3>' + esc(d.hadiah.nama) + '</h3><p>' + esc(d.hadiah.isi) + '</p></div>'); });
        el.querySelector('#imBarong').addEventListener('click', barongsai);
      }
      function barongsai() {
        var n = 0, T = 8;
        var el = layar(dekor() + '<div class="im-isi kecil"><h2>Barongsai</h2><p class="im-pet" id="imP">Ketuk barongsai, dan lihat apa yang keluar!</p><div class="im-arena"><button type="button" class="im-singa" aria-label="Ketuk barongsai">' + SINGA + '</button><div class="im-koin-area" aria-hidden="true"></div></div><p class="im-skor" id="imS" role="status">Koin emas: 0 / ' + T + '</p><div class="im-akhir" id="imA" hidden></div></div>', 'im-barong');
        var b = el.querySelector('.im-singa'), area = el.querySelector('.im-koin-area'), skor = el.querySelector('#imS');
        b.addEventListener('click', function () {
          if (n >= T) return; n++; b.classList.remove('lompat'); void b.offsetWidth; b.classList.add('lompat'); if (window.Suara) window.Suara.ding();
          for (var i = 0; i < 4; i++) { var c = document.createElement('span'); c.className = 'im-koin'; c.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 220) + 'px'); c.style.animationDelay = (i * 0.06) + 's'; area.appendChild(c); (function (x) { setTimeout(function () { x.remove(); }, 1500); })(c); }
          S.dariEl(b, 14, ['#F5C242', '#FFE08A'], { kuat: 6, naik: 7 }); skor.textContent = 'Koin emas: ' + n + ' / ' + T;
          if (n === T) { S.jeda(function () { var a = el.querySelector('#imA'); a.hidden = false; a.innerHTML = '<p class="im-doa">' + S.kata(d.penutup, 3600, 55) + '</p>' + S.kredit(d.pengirim); S.confetti(innerWidth / 2, innerHeight * 0.4, 60, ['#F5C242', '#D71920', '#FFE08A'], { kuat: 9 }); S.akhir(); }, 500); }
        });
      }
      sambut();
    }
  });
})();
