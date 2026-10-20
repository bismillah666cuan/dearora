/* ==========================================================
   BRANKAS RAHASIA — tiga ruangan berisi teka-teki dari pembeli; brankas terakhir berisi hadiah utama.
   Jawaban dan isi brankas TIDAK ada di halaman: diperiksa server (brankasCek / brankasBuka).
   Mode demo (tanpa server) memeriksa jawaban contoh secara lokal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var GEMBOK = '<svg viewBox="0 0 80 100" aria-hidden="true"><path class="busur" d="M22 46V30c0-12 8-20 18-20s18 8 18 20v16" fill="none" stroke="#C9CED8" stroke-width="9" stroke-linecap="round"/><rect x="10" y="44" width="60" height="48" rx="9" fill="#F5C242"/><circle cx="40" cy="64" r="6" fill="#7A5A00"/><path d="M40 68v12" stroke="#7A5A00" stroke-width="5" stroke-linecap="round"/></svg>';
  var PINTU = '<svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="100" fill="#2B3447" stroke="#C9CED8" stroke-width="10"/><circle cx="110" cy="110" r="78" fill="#1B2230" stroke="#F5C242" stroke-width="4"/><g class="roda" stroke="#F5C242" stroke-width="7" stroke-linecap="round"><path d="M110 50v-14M110 170v14M50 110H36M170 110h14M68 68 58 58M152 152l10 10M152 68l10-10M68 152l-10 10"/><circle cx="110" cy="110" r="26" fill="#F5C242" stroke="none"/><circle cx="110" cy="110" r="10" fill="#1B2230" stroke="none"/></g></svg>';
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
  S.reg('brankas', {
    nama: 'Brankas Rahasia',
    adapt: function (f, c) { var a = f.akhir || {}; return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Brankas Rahasia', ruangan: (f.ruangan || []).map(function (r) { return { nama: r.nama, teka: r.teka, petunjuk: r.petunjuk || '', jawaban: r.jawaban, pesan: r.pesan }; }), akhir: { foto: a.foto, pesan: a.pesan } }; },
    mulai: function (root, d) {
      var jb = [], n = d.ruangan.length;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar bk-layar ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function cek(i, jawab) {
        if (S.konteks.demo || !window.DearoraAPI) return Promise.resolve({ benar: norm(jawab) !== '' && norm(jawab) === norm(d.ruangan[i].jawaban), pesan: d.ruangan[i].pesan || '' });
        return window.DearoraAPI.post('brankasCek', { k: S.konteks.slug, i: i, jawab: jawab }, { timeout: 15000 }).then(function (r) { if (!r.success) throw new Error(r.message || 'Gagal'); return r.data; });
      }
      function bukaAkhir() {
        if (S.konteks.demo || !window.DearoraAPI) return Promise.resolve({ benar: true, pesan: d.akhir.pesan || '' });
        return window.DearoraAPI.post('brankasBuka', { k: S.konteks.slug, jawab: jb }, { timeout: 15000 }).then(function (r) { if (!r.success) throw new Error(r.message || 'Gagal'); return r.data; });
      }
      function lobi() {
        var el = layar('<div class="bk-lobi"><div class="bk-pintu" aria-hidden="true">' + PINTU + '</div><p class="bk-kicker">AKSES TERBATAS</p><h1>' + esc(d.judul) + '</h1><p class="bk-pet">Untuk ' + esc(d.penerima) + '. Ada ' + n + ' ruangan, tiap ruangan punya satu teka-teki. Jawab semuanya untuk membuka brankas.</p><button type="button" class="bk-btn">Masuk ▶</button></div>', 'bk-lobil');
        el.querySelector('.bk-btn').addEventListener('click', function () { if (window.Suara) window.Suara.besi(); ruangan(0); });
      }
      function ruangan(i) {
        var r = d.ruangan[i], salah = 0, selesai = false;
        var el = layar('<div class="bk-ruang"><p class="bk-kicker">RUANGAN ' + (i + 1) + ' DARI ' + n + ' · ' + esc(r.nama).toUpperCase() + '</p><div class="bk-gembok" id="bkG" aria-hidden="true">' + GEMBOK + '</div><h2 class="bk-teka">' + esc(r.teka) + '</h2><form class="bk-form" autocomplete="off"><label class="bk-sr" for="bkJ">Jawabanmu</label><input id="bkJ" type="text" maxlength="60" placeholder="Jawabanmu" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit" class="bk-btn" id="bkOk">Buka gembok</button></form><p class="bk-info" id="bkI" role="status"></p>' + (r.petunjuk ? '<button type="button" class="bk-btn ghost" id="bkPet">Minta petunjuk</button>' : '') + '<div class="bk-buka" id="bkP" hidden></div></div>', 'bk-ruangl');
        var f = el.querySelector('form'), inp = el.querySelector('#bkJ'), info = el.querySelector('#bkI'), g = el.querySelector('#bkG');
        var pet = el.querySelector('#bkPet'); if (pet) pet.addEventListener('click', function () { info.textContent = 'Petunjuk: ' + r.petunjuk; pet.hidden = true; });
        f.addEventListener('submit', function (e) {
          e.preventDefault(); if (selesai) return; var v = inp.value.trim(); if (!v) { info.textContent = 'Tulis jawabanmu dulu.'; inp.focus(); return; }
          var ok = el.querySelector('#bkOk'); ok.disabled = true; info.textContent = 'Memeriksa…';
          cek(i, v).then(function (h) {
            if (h.benar) {
              selesai = true; jb[i] = v; g.classList.add('terbuka'); if (window.Suara) { window.Suara.gembok(); window.Suara.sukses(); } f.hidden = true; if (pet) pet.hidden = true; info.textContent = 'Gembok terbuka!';
              var p = el.querySelector('#bkP'); p.hidden = false; p.innerHTML = '<p class="bk-pesan">' + S.kata(h.pesan, 2600, 55) + '</p><button type="button" class="bk-btn">' + (i === n - 1 ? 'Menuju brankas ›' : 'Ruangan berikutnya ›') + '</button>'; S.dariEl(g, 24, ['#F5C242', '#fff'], { kuat: 6, naik: 6 });
              p.querySelector('.bk-btn').addEventListener('click', function () { if (i === n - 1) brankas(); else ruangan(i + 1); });
            } else { salah++; ok.disabled = false; if (window.Suara) window.Suara.salah(); f.classList.remove('goyang'); void f.offsetWidth; f.classList.add('goyang'); info.textContent = salah >= 2 && r.petunjuk ? 'Belum tepat. Coba tekan "Minta petunjuk".' : 'Belum tepat, coba lagi.'; inp.select(); }
          }, function (err) { ok.disabled = false; info.textContent = 'Koneksi bermasalah. Coba lagi. (' + (err.message || '') + ')'; });
        });
      }
      function brankas() {
        var el = layar('<div class="bk-akhir"><p class="bk-kicker">BRANKAS UTAMA</p><div class="bk-pintu besar" id="bkPt" aria-hidden="true">' + PINTU + '</div><p class="bk-pet" id="bkM">Semua gembok terbuka. Ketuk roda untuk membuka brankas.</p><button type="button" class="bk-btn" id="bkRoda">Putar roda</button><div class="bk-hadiah" id="bkH" hidden></div></div>', 'bk-akhirl');
        var b = el.querySelector('#bkRoda');
        b.addEventListener('click', function () {
          b.disabled = true; var pt = el.querySelector('#bkPt'); pt.classList.add('putar'); if (window.Suara) window.Suara.roda(); el.querySelector('#bkM').textContent = 'Memeriksa semua jawaban…';
          bukaAkhir().then(function (h) {
            if (!h.benar) { pt.classList.remove('putar'); b.disabled = false; el.querySelector('#bkM').textContent = 'Brankas belum mau terbuka. Coba lagi.'; return; }
            S.jeda(function () { pt.classList.remove('putar'); pt.classList.add('terbuka'); b.hidden = true; el.querySelector('#bkM').hidden = true; if (window.Suara) { window.Suara.besi(); window.Suara.hadiah(); }
              var hd = el.querySelector('#bkH'); hd.hidden = false; hd.innerHTML = (d.akhir.foto ? '<img alt="" src="' + esc(S.src(d.akhir.foto, 2)) + '">' : '') + '<p class="bk-pesan">' + S.kata(h.pesan, 4200, 55) + '</p>' + S.kredit(d.pengirim);
              S.confetti(innerWidth / 2, innerHeight * 0.3, 56, ['#F5C242', '#fff', '#C9CED8'], { kuat: 9 }); S.akhir(); }, 1200);
          }, function (err) { pt.classList.remove('putar'); b.disabled = false; el.querySelector('#bkM').textContent = 'Koneksi bermasalah. Coba lagi. (' + (err.message || '') + ')'; });
        });
      }
      lobi();
    }
  });
})();
