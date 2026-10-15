/* ==========================================================
   FISH IT — laut yang tenang dengan tiga spot memancing: Memory Bay (kenangan), Love Lagoon (pesan manis) dan
   Treasure Cove (hadiah utama). Lempar kail, tunggu "ada sesuatu nih!", lalu tarik kail pada waktunya.
   Ikan, botol, dan peti harta karun digambar sendiri (orisinal).
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var PERAHU = '<svg viewBox="0 0 140 90" aria-hidden="true"><path d="M70 6v52" stroke="#6B4A2B" stroke-width="3"/><path d="M72 10c22 8 34 22 38 42H72z" fill="#fff"/><path d="M68 16c-16 6-26 18-30 36h30z" fill="#FFE08A"/><path d="M6 58h128l-14 22c-3 5-8 8-14 8H34c-6 0-11-3-14-8z" fill="#B07A47"/><path d="M12 64h116" stroke="#8A5A2E" stroke-width="3"/><circle cx="46" cy="74" r="4" fill="#FFE9B8"/><circle cx="70" cy="74" r="4" fill="#FFE9B8"/><circle cx="94" cy="74" r="4" fill="#FFE9B8"/></svg>';
  var PULAU = '<svg viewBox="0 0 160 90" aria-hidden="true"><path d="M0 90c10-30 40-40 80-40s70 10 80 40z" fill="#F3D69B"/><path d="M82 52c0-20 2-36-2-48" stroke="#8A5A2E" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M80 6C62 2 52 12 48 22c14-8 22-8 32-16zM80 6c16-6 30 2 36 14-14-6-22-6-36-14zM80 8c-8 8-6 18-2 26 4-10 6-18 2-26z" fill="#3FA860"/></svg>';
  var IKAN = ['#FF8F6B', '#7FD1E8', '#FFD76A', '#B79CFF'].map(function (c) { return '<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M96 35c10-12 20-16 22-16-4 10-4 22 0 32-2 0-12-4-22-16z" fill="' + c + '"/><ellipse cx="52" cy="35" rx="46" ry="26" fill="' + c + '"/><path d="M40 12c10-8 28-6 34 2" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/><circle cx="26" cy="30" r="6" fill="#fff"/><circle cx="25" cy="30" r="3" fill="#222"/><path d="M12 42c4 3 8 3 12 0" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M58 20c8 8 8 22 0 30M72 22c6 6 6 20 0 26" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5"/></svg>'; });
  var BOTOL = '<svg viewBox="0 0 60 110" aria-hidden="true"><rect x="22" y="2" width="16" height="12" rx="3" fill="#C99A5B"/><path d="M22 14h16v12c10 6 14 14 14 26v44c0 8-6 12-14 12H22c-8 0-14-4-14-12V52c0-12 4-20 14-26z" fill="#BFE9F3" stroke="#7FB6C6" stroke-width="2" opacity=".95"/><rect x="18" y="52" width="24" height="30" rx="3" fill="#FFF3D6" stroke="#D9B26B" stroke-width="2" transform="rotate(-8 30 67)"/><path d="M22 60h16M22 67h14M22 74h10" stroke="#C99A5B" stroke-width="2" transform="rotate(-8 30 67)"/></svg>';
  var PETI = '<svg viewBox="0 0 140 110" aria-hidden="true"><rect x="10" y="48" width="120" height="56" rx="8" fill="#8A5A2E"/><g class="tutup"><path d="M10 48c0-26 120-26 120 0z" fill="#A66F3A"/><path d="M10 48h120" stroke="#F5C242" stroke-width="4"/></g><rect x="62" y="44" width="16" height="22" rx="3" fill="#F5C242"/><path d="M10 70h120" stroke="#F5C242" stroke-width="4"/><circle cx="30" cy="92" r="5" fill="#FFE9B8"/><circle cx="108" cy="90" r="6" fill="#FFB3C7"/><path d="M100 28l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1z" fill="#FFD76A" class="bint"/></svg>';
  S.reg('mancing', {
    nama: 'Fish It',
    adapt: function (f, c) { var p = f.peti || {}; return { penerima: c.penerima, pengirim: c.pengirim, kenangan: (f.kenangan || []).map(function (k) { return { judul: k.judul, teks: k.teks, foto: k.foto }; }), manis: (f.pesanManis || []).map(function (k) { return { judul: k.judul || 'Pesan di botol', teks: k.teks }; }), peti: { foto: p.foto, pesan: p.pesan || '' } }; },
    mulai: function (root, d) {
      var tangkap = { mem: 0, love: 0 }, tmr = 0;
      function layar(h, k) { clearTimeout(tmr); root.innerHTML = '<div class="sp-layar mc-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function laut() { return '<div class="mc-awan a1" aria-hidden="true"></div><div class="mc-awan a2" aria-hidden="true"></div><div class="mc-ombak o1" aria-hidden="true"></div><div class="mc-ombak o2" aria-hidden="true"></div><div class="mc-ombak o3" aria-hidden="true"></div>'; }
      function awal() {
        var el = layar(laut() + '<div class="mc-pulau" aria-hidden="true">' + PULAU + '</div><div class="mc-perahu b" aria-hidden="true">' + PERAHU + '</div><div class="mc-isi"><p class="mc-kicker">HARI INI KITA MEMANCING</p><h1>Fish It</h1><p class="mc-untuk">Untuk ' + esc(d.penerima) + '</p><button type="button" class="mc-btn">Mulai Mancing</button></div>', 'mc-awal');
        el.querySelector('.mc-btn').addEventListener('click', function () { if (window.Suara) window.Suara.buka(); peta(); });
      }
      var SPOT = { mem: { nama: 'Memory Bay', desk: 'Tempat menemukan kenangan', n: function () { return d.kenangan.length; } }, love: { nama: 'Love Lagoon', desk: 'Tempat menemukan pesan manis', n: function () { return d.manis.length; } }, harta: { nama: 'Treasure Cove', desk: 'Tempat mencari hadiah utama', n: function () { return 1; } } };
      function terbuka(k) { return k !== 'harta' || (tangkap.mem >= d.kenangan.length && tangkap.love >= d.manis.length); }
      function peta() {
        var titik = ['mem', 'love', 'harta'].map(function (k) {
          var s = SPOT[k], sel = k === 'harta' ? '' : ' <small>' + tangkap[k] + '/' + s.n() + '</small>', kunci = !terbuka(k), selesai = k !== 'harta' && tangkap[k] >= s.n();
          return '<button type="button" class="mc-spot ' + k + (kunci ? ' kunci' : '') + (selesai ? ' selesai' : '') + '" data-k="' + k + '"' + (kunci || selesai ? ' disabled' : '') + '><i aria-hidden="true"></i><span><b>' + s.nama + '</b>' + sel + '<em>' + (kunci ? 'Selesaikan dua spot lain dulu' : selesai ? 'Selesai ✓' : s.desk) + '</em></span></button>';
        }).join('');
        var el = layar(laut() + '<div class="mc-peta"><h2>Peta laut</h2><p class="mc-pet">Pilih satu spot memancing.</p><div class="mc-spots">' + titik + '</div><div class="mc-perahu peta" id="mcP" aria-hidden="true">' + PERAHU + '</div><p class="mc-lihat" id="mcL" role="status"></p></div>', 'mc-petal');
        el.querySelectorAll('.mc-spot:not(:disabled)').forEach(function (b) {
          b.addEventListener('click', function () {
            var k = b.dataset.k; el.querySelectorAll('.mc-spot').forEach(function (x) { x.disabled = true; }); b.classList.add('pilih');
            el.querySelector('#mcP').className = 'mc-perahu peta ke-' + k; if (window.Suara) window.Suara.whoosh();
            el.querySelector('#mcL').textContent = 'Kita lihat ya, kamu dapet apa!'; tmr = setTimeout(function () { pancing(k); }, S.reduce ? 60 : 1900);
          });
        });
      }
      function pancing(k) {
        var s = SPOT[k], bun = k === 'harta' ? 'Peti harta karun bersembunyi di sini…' : s.nama + ' · ' + s.desk;
        var el = layar(laut() + '<div class="mc-pancing"><p class="mc-lok">' + esc(bun) + '</p><div class="mc-adegan"><div class="mc-perahu atas" aria-hidden="true">' + PERAHU + '</div><div class="mc-tali" aria-hidden="true"></div><div class="mc-pel" id="mcPel" aria-hidden="true"><i></i></div><div class="mc-riak" aria-hidden="true"></div></div><p class="mc-info" id="mcI" role="status">Siap? Ketuk tombol untuk melempar kail.</p><button type="button" class="mc-btn besar" id="mcA">Lempar Kail</button></div>', 'mc-pancingl');
        var info = el.querySelector('#mcI'), a = el.querySelector('#mcA'), pel = el.querySelector('#mcPel'), fase = 'siap', gigitT = 0;
        function reset(msg) { fase = 'siap'; el.classList.remove('lempar', 'gigit'); a.textContent = 'Lempar Kail'; a.classList.remove('tarik'); info.textContent = msg; }
        a.addEventListener('click', function () {
          if (fase === 'siap') {
            fase = 'tunggu'; el.classList.add('lempar'); a.textContent = 'Tunggu…'; info.textContent = 'Pelampung jatuh ke air. Sabar ya…'; if (window.Suara) window.Suara.percik();
            tmr = setTimeout(function () { fase = 'gigit'; el.classList.add('gigit'); a.textContent = 'Tarik Kail!'; a.classList.add('tarik'); info.textContent = 'Ada sesuatu nih!'; if (window.Suara) window.Suara.ding(); gigitT = setTimeout(function () { reset('Yah, lepas! Coba lempar lagi.'); }, 2600); }, S.reduce ? 300 : 1800 + Math.random() * 2000);
          } else if (fase === 'tunggu') { clearTimeout(tmr); reset('Terlalu cepat! Tunggu sampai ada sesuatu, ya.'); }
          else if (fase === 'gigit') { clearTimeout(gigitT); fase = 'dapat'; if (window.Suara) window.Suara.percik(); dapat(k); }
        });
      }
      function dapat(k) {
        if (k === 'harta') return peti();
        var i = tangkap[k], isi = k === 'mem' ? d.kenangan[i] : d.manis[i], ikon = k === 'mem' ? '<div class="mc-ikan">' + IKAN[i % IKAN.length] + '</div>' : '<div class="mc-botol">' + BOTOL + '</div>';
        tangkap[k]++; var sisa = SPOT[k].n() - tangkap[k];
        var el = layar(laut() + '<div class="mc-dapat">' + ikon + '<div class="mc-kartu"><p class="mc-kicker">' + (k === 'mem' ? 'KARTU KENANGAN' : 'PESAN DI BOTOL') + '</p><h2>' + esc(isi.judul) + '</h2>' + (isi.foto ? '<img class="mc-foto" alt="" src="' + esc(S.src(isi.foto, i)) + '">' : '') + '<p>' + esc(isi.teks) + '</p></div><button type="button" class="mc-btn">' + (sisa > 0 ? 'Memancing lagi ›' : 'Kembali ke peta ›') + '</button></div>', 'mc-dapatl');
        if (window.Suara) window.Suara.sukses(); S.dariEl(el.querySelector('.mc-kartu'), 24, ['#7FD1E8', '#FFD76A', '#fff'], { kuat: 6, naik: 6 });
        el.querySelector('.mc-btn').addEventListener('click', function () { if (sisa > 0) pancing(k); else peta(); });
      }
      function peti() {
        var el = layar(laut() + '<div class="mc-peti-l"><p class="mc-kicker">TREASURE COVE</p><h2>Wah, peti harta karun!</h2><button type="button" class="mc-peti" aria-label="Buka peti harta karun">' + PETI + '</button><p class="mc-pet" id="mcT">Ketuk petinya untuk membukanya.</p><div class="mc-isi-peti" id="mcIP" hidden></div></div>', 'mc-petil');
        var b = el.querySelector('.mc-peti'), buka = false;
        b.addEventListener('click', function () {
          if (buka) return; buka = true; b.classList.add('buka'); if (window.Suara) window.Suara.hadiah(); S.dariEl(b, 50, ['#FFD76A', '#FFB3C7', '#7FD1E8', '#fff'], { kuat: 9, naik: 8 }); el.querySelector('#mcT').hidden = true;
          S.jeda(function () { var ip = el.querySelector('#mcIP'); ip.hidden = false; ip.innerHTML = (d.peti.foto ? '<img class="mc-foto" alt="" src="' + esc(S.src(d.peti.foto, 3)) + '">' : '') + '<p class="mc-pesan">' + S.kata(d.peti.pesan, 4000, 55) + '</p>' + S.kredit(d.pengirim); S.akhir(); }, 700);
        });
      }
      awal();
    }
  });
})();
