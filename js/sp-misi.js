/* ==========================================================
   LASTLOVE — MISI CINTA: briefing markas ala game strategi (semua orisinal Dearora).
   Penerima menjadi "Komandan": masuk markas, menyelesaikan tiga misi, membuka kartu hero
   ("Satu-Satunya"), lalu mengklaim hadiah final. Resource (hati, bintang, energi) hanya
   hiasan yang bertambah saat misi selesai; bukan mata uang atau sistem game sungguhan.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc, ic = S.ic;
  var DEMO = {
    penerima: 'Rani', pengirim: 'Dimas', gelar: 'Satu-Satunya',
    misi: [
      { judul: 'Pulihkan Memori', desk: 'Temukan foto yang disembunyikan di area pindai.', tipe: 'cari', foto: '', pesan: 'Memori berhasil dipulihkan: hari itu kamu tertawa lepas, dan aku ingin hari seperti itu lebih sering.' },
      { judul: 'Perkuat Pasukan', desk: 'Buka tiga pesan tentang hal-hal yang membuatmu istimewa.', tipe: 'kartu', kartu: ['Kamu peduli tanpa pernah minta dilihat.', 'Kamu bikin orang lain merasa aman dan diterima.', 'Kamu bertahan, bahkan saat hari-hari terasa berat.'] },
      { judul: 'Jaga Ikatan', desk: 'Jawab satu pertanyaan kecil untuk memperkuat ikatan.', tipe: 'kuis', soal: { q: 'Siapa yang paling beruntung mengenalmu?', opsi: ['Aku, tentu saja', 'Semua orang di sekitarmu', 'Dunia ini'], benar: 0, salah: 'Jawaban menarik, tapi aku tetap yang paling beruntung. Coba lagi!', betul: 'Tepat sekali. Aku pemenangnya.' } }
    ],
    atribut: [{ nama: 'Kebaikan', nilai: 100 }, { nama: 'Kesetiaan', nilai: 100 }, { nama: 'Keistimewaan', nilai: 'Tak Terbatas' }],
    akhir: { foto: '', pesan: 'Rani, semua misi tadi hanya cara untuk bilang satu hal: kamu berharga, dan aku sangat bersyukur ada kamu. Terima kasih sudah menjadi komandan di hari-hariku. Selamat ulang tahun.', penutup: 'Misi selesai. Tapi kamu akan selalu jadi hadiah favoritku.' }
  };
  var HERO = '<svg class="ms-hero-svg" viewBox="0 0 120 160" aria-hidden="true"><ellipse cx="60" cy="152" rx="34" ry="6" fill="#000" opacity=".3"/><rect x="38" y="104" width="16" height="44" rx="5" fill="#2E4A5E"/><rect x="66" y="104" width="16" height="44" rx="5" fill="#2E4A5E"/><rect x="34" y="144" width="22" height="9" rx="4" fill="#1B2D3B"/><rect x="64" y="144" width="22" height="9" rx="4" fill="#1B2D3B"/>' +
    '<rect x="30" y="58" width="60" height="52" rx="12" fill="#3F7D8C"/><path d="M60 100S42 89 42 79a8 8 0 0 1 18-4 8 8 0 0 1 18 4c0 10-18 21-18 21z" fill="#FFB020"/><rect x="14" y="62" width="22" height="42" rx="9" fill="#356B78"/><rect x="84" y="62" width="22" height="42" rx="9" fill="#356B78"/><circle cx="25" cy="110" r="8" fill="#F2C28B"/><circle cx="95" cy="110" r="8" fill="#F2C28B"/><rect x="24" y="54" width="22" height="14" rx="6" fill="#FFB020"/><rect x="74" y="54" width="22" height="14" rx="6" fill="#FFB020"/>' +
    '<circle cx="60" cy="38" r="26" fill="#2E4A5E"/><path d="M34 38a26 26 0 0 1 52 0z" fill="#3F7D8C"/><rect x="40" y="34" width="40" height="16" rx="8" fill="#8CF3FF"/><rect x="44" y="37" width="14" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="56" y="8" width="8" height="12" rx="3" fill="#FFB020"/></svg>';
  var MARKAS = '<svg class="ms-markas-svg" viewBox="0 0 320 200" aria-hidden="true"><defs><linearGradient id="mk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#35566B"/><stop offset="1" stop-color="#1E3345"/></linearGradient></defs><rect x="0" y="160" width="320" height="40" fill="#14232F"/><rect x="30" y="80" width="46" height="84" fill="url(#mk)"/><rect x="244" y="70" width="46" height="94" fill="url(#mk)"/><rect x="82" y="100" width="156" height="64" rx="4" fill="url(#mk)"/><path d="M96 100L160 56l64 44z" fill="#2E4A5E"/><rect x="138" y="124" width="44" height="40" rx="6" fill="#0E1822"/><path d="M160 156S146 147 146 139a6 6 0 0 1 14-3 6 6 0 0 1 14 3c0 8-14 17-14 17z" fill="#FF5D8F"><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite"/></path><g stroke="#8CF3FF" stroke-width="2" fill="none"><path d="M53 80V56M267 70V44"/><circle cx="53" cy="52" r="5" fill="#8CF3FF"/><path d="M251 44q16-14 32 0" /></g><circle cx="267" cy="42" r="3" fill="#FFB020"/><g fill="#FFB020" opacity=".85"><rect x="42" y="96" width="8" height="8"/><rect x="56" y="96" width="8" height="8"/><rect x="42" y="114" width="8" height="8"/><rect x="256" y="90" width="8" height="8"/><rect x="270" y="90" width="8" height="8"/></g></svg>';

  S.reg('misi', {
    nama: 'Lastlove: Misi Cinta', demo: DEMO,
    adapt: function (f, c) {
      var ku = f.kuis || {}, ak = f.akhir || {}, m1 = f.misi1 || {};
      return { penerima: c.penerima, pengirim: c.pengirim, gelar: f.gelar || 'Satu-Satunya',
        misi: [{ judul: 'Pulihkan Memori', desk: 'Temukan foto yang disembunyikan di area pindai.', tipe: 'cari', foto: m1.foto, pesan: m1.pesan },
          { judul: 'Perkuat Pasukan', desk: 'Buka tiga pesan tentang hal-hal yang membuatmu istimewa.', tipe: 'kartu', kartu: f.kartu },
          { judul: 'Jaga Ikatan', desk: 'Jawab satu pertanyaan kecil untuk memperkuat ikatan.', tipe: 'kuis', soal: { q: ku.q, opsi: ku.opsi, benar: Math.max(0, (Number(ku.benar) || 1) - 1), salah: ku.salah || 'Hampir! Coba lagi ya.', betul: ku.betul || 'Tepat sekali!' } }],
        atribut: [{ nama: 'Kebaikan', nilai: 100 }, { nama: 'Kesetiaan', nilai: 100 }, { nama: 'Keistimewaan', nilai: 'Tak Terbatas' }],
        akhir: { foto: ak.foto, pesan: ak.pesan, penutup: ak.penutup || 'Misi selesai. Tapi kamu akan selalu jadi hadiah favoritku.' } };
    },
    mulai: function (root, d) {
      var selesai = {}, poin = { hati: 0, bintang: 0, energi: 0 }, kartuBuka = false;
      function layar(h, k) { root.innerHTML = '<div class="sp-layar ' + (k || '') + '">' + h + '</div>'; return root.firstChild; }
      function jml() { return Object.keys(selesai).length; }
      function sumber() { return '<div class="ms-sumber" role="status" aria-label="Sumber daya"><span class="h">' + ic('heart') + '<b id="msH">' + poin.hati + '</b></span><span class="b">' + ic('sparkles') + '<b id="msB">' + poin.bintang + '</b></span><span class="e">' + ic('bolt') + '<b id="msE">' + poin.energi + '</b></span></div>'; }
      function tambah(m) { poin.hati += 100; poin.bintang += 1; poin.energi += 50; selesai[m] = true; }

      function briefing() {
        if (window.Suara) window.Suara.radio();
        var el = layar('<div class="ms-brief"><div class="ms-radar" aria-hidden="true"></div><p class="ms-kpd">BRIEFING RAHASIA · TINGKAT KASIH</p><div class="ms-adegan" id="msAdegan">' + MARKAS + HERO + '</div><h1>Komandan ' + esc(d.penerima) + ',<br>misi spesial menantimu.</h1><p class="ms-sub">Pengirim: ' + esc(d.pengirim) + '</p><button type="button" class="ms-tombol" id="msMasuk">Masuk Misi ›</button></div>', 'ms-gelap');
        el.querySelector('#msMasuk').addEventListener('click', function () { var a = el.querySelector('#msAdegan'); a.classList.add('zoom'); el.querySelector('#msMasuk').disabled = true; S.jeda(markas, 1500); });
      }

      function markas() {
        var kartu = d.misi.map(function (m, i) {
          var ok = selesai[i], buka = i === 0 || selesai[i - 1] || true;
          return '<button type="button" class="ms-misi' + (ok ? ' selesai' : '') + '" data-m="' + i + '"><span class="ms-no">' + (ok ? ic('check') : '0' + (i + 1)) + '</span><div><b>Misi 0' + (i + 1) + ' — ' + esc(m.judul) + '</b><small>' + esc(m.desk) + '</small></div><em>' + (ok ? 'SELESAI' : '+100 Poin Cinta') + '</em></button>';
        }).join('');
        var semua = jml() === d.misi.length;
        var el = layar('<header class="ms-atas">' + sumber() + '<button type="button" class="ms-peta" data-a="peta">' + ic('map') + ' Peta</button></header>' +
          '<section class="ms-panel ms-herop"><div class="ms-hero-w">' + HERO + '</div><div><span class="ms-lencana">KOMANDAN</span><h2>' + esc(d.penerima) + '</h2><p>Gelar: <b>' + (semua ? esc(d.gelar) : '??? (selesaikan semua misi)') + '</b></p><div class="ms-xp"><i style="width:' + Math.round(jml() / d.misi.length * 100) + '%"></i></div><small>' + jml() + '/' + d.misi.length + ' misi selesai</small></div></section>' +
          '<h3 class="ms-judul">Papan Misi</h3><div class="ms-daftar">' + kartu + '</div>' +
          (semua ? '<section class="ms-panel"><button type="button" class="ms-tombol besar" data-a="kartu">Buka Kartu Hero</button></section>' : '<p class="ms-info">Selesaikan ketiga misi untuk membuka Operasi Terakhir.</p>'));
        el.addEventListener('click', function (e) {
          var m = e.target.closest('[data-m]'); if (m) { misi(Number(m.dataset.m)); return; }
          var a = e.target.closest('[data-a]'); if (!a) return;
          if (a.dataset.a === 'peta') peta(); else if (a.dataset.a === 'kartu') hero();
        });
      }

      function peta() {
        var s = document.createElement('div'); s.className = 'ms-modal';
        s.innerHTML = '<div class="ms-kotak" role="dialog" aria-modal="true" aria-label="Peta misi"><h3>Peta Operasi</h3><div class="ms-pt"><svg viewBox="0 0 300 180" aria-hidden="true"><path d="M40 140L110 70 190 110 260 40" stroke="#8CF3FF" stroke-width="2" stroke-dasharray="6 6" fill="none"/></svg>' +
          d.misi.map(function (m, i) { var p = [[40, 140], [150, 90], [260, 40]][i]; return '<button type="button" class="ms-nod' + (selesai[i] ? ' ok' : '') + '" style="left:' + (p[0] / 3) + '%;top:' + (p[1] / 1.8) + '%" data-m="' + i + '" aria-label="Misi ' + (i + 1) + ': ' + esc(m.judul) + '">' + (selesai[i] ? ic('check') : (i + 1)) + '</button>'; }).join('') + '<span class="ms-base">MARKAS</span></div><button type="button" class="ms-tombol" data-tutup>Tutup Peta</button></div>';
        root.appendChild(s); s.addEventListener('click', function (e) { var m = e.target.closest('[data-m]'); if (m) { s.remove(); misi(Number(m.dataset.m)); return; } if (e.target === s || e.target.closest('[data-tutup]')) s.remove(); });
      }

      function hadiah(i, teks, el) {
        if (!selesai[i]) tambah(i);
        S.dariEl(el, 40, ['#FFB020', '#8CF3FF', '#FF5D8F', '#fff'], { kuat: 9 });
        var s = document.createElement('div'); s.className = 'ms-modal'; s.innerHTML = '<div class="ms-kotak"><span class="ms-lencana">MISI SELESAI</span><h3>+100 Poin Cinta</h3><p>' + esc(teks) + '</p><div class="ms-reward"><span>♥ +100</span><span>★ +1</span><span>⚡ +50</span></div><button type="button" class="ms-tombol">Kembali ke Markas</button></div>';
        root.appendChild(s); s.querySelector('button').addEventListener('click', function () { s.remove(); markas(); });
      }

      function misi(i) {
        var m = d.misi[i];
        var el = layar('<header class="ms-atas"><button type="button" class="ms-peta" data-a="markas">‹ Markas</button>' + sumber() + '</header><section class="ms-panel"><span class="ms-lencana">MISI 0' + (i + 1) + '</span><h2>' + esc(m.judul) + '</h2><p>' + esc(m.desk) + '</p><div class="ms-area" id="msArea"></div></section>');
        el.querySelector('[data-a="markas"]').addEventListener('click', markas);
        var ar = el.querySelector('#msArea');
        if (m.tipe === 'cari') {
          var sasaran = 4, pes = ''; for (var k = 0; k < 9; k++) pes += '<button type="button" class="ms-pindai" data-k="' + k + '" aria-label="Area ' + (k + 1) + '"><span>?</span></button>';
          ar.innerHTML = '<div class="ms-grid">' + pes + '</div><p class="ms-petunjuk" id="msP" role="status">Ketuk area untuk memindai. Bacalah petunjuk suhunya.</p>';
          ar.addEventListener('click', function (e) {
            var b = e.target.closest('.ms-pindai'); if (!b || b.disabled) return; var k = Number(b.dataset.k), jr = Math.abs(k % 3 - sasaran % 3) + Math.abs(Math.floor(k / 3) - Math.floor(sasaran / 3)); b.disabled = true;
            if (k === sasaran) { b.classList.add('temu'); if (window.Suara) window.Suara.radio(); if (window.Suara) window.Suara.sukses(); b.innerHTML = '<img alt="Foto memori" src="' + esc(S.src(m.foto, 2)) + '">'; ar.querySelector('#msP').textContent = 'Memori ditemukan!'; S.jeda(function () { hadiah(i, m.pesan, b); }, 900); }
            else { b.classList.add(jr === 1 ? 'hangat' : 'dingin'); b.querySelector('span').textContent = jr === 1 ? 'HANGAT' : 'DINGIN'; ar.querySelector('#msP').textContent = jr === 1 ? 'Hangat! Memorinya sudah dekat.' : 'Dingin… coba area lain.'; }
          });
        } else if (m.tipe === 'kartu') {
          var buka = 0;
          ar.innerHTML = '<div class="ms-kartu3">' + m.kartu.map(function (t, k) { return '<button type="button" class="ms-flip" data-k="' + k + '" aria-label="Kartu ' + (k + 1) + '"><span class="dep">KARTU ' + (k + 1) + '<br>ketuk untuk membuka</span><span class="bel">' + esc(t) + '</span></button>'; }).join('') + '</div>';
          ar.addEventListener('click', function (e) { var b = e.target.closest('.ms-flip'); if (!b || b.classList.contains('buka')) return; b.classList.add('buka'); buka++; if (window.Suara) window.Suara.kartuBalik(); if (buka === m.kartu.length) S.jeda(function () { hadiah(i, 'Pasukan menguat. Itulah alasan semua orang beruntung punya kamu.', b); }, 1300); });
        } else {
          ar.innerHTML = '<p class="ms-tanya">' + esc(m.soal.q) + '</p><div class="ms-opsi">' + m.soal.opsi.map(function (o, k) { return '<button type="button" class="ms-op" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div><p class="ms-petunjuk" id="msP" role="status"></p>';
          ar.addEventListener('click', function (e) { var b = e.target.closest('.ms-op'); if (!b) return; var ok = Number(b.dataset.k) === m.soal.benar; ar.querySelector('#msP').textContent = ok ? m.soal.betul : m.soal.salah; if (window.Suara) window.Suara[ok ? 'sukses' : 'salah'](); b.classList.add(ok ? 'benar' : 'salah'); if (ok) { ar.querySelectorAll('.ms-op').forEach(function (x) { x.disabled = true; }); S.jeda(function () { hadiah(i, m.soal.betul, b); }, 900); } });
        }
      }

      function hero() {
        var el = layar('<header class="ms-atas"><button type="button" class="ms-peta" data-a="markas">‹ Markas</button>' + sumber() + '</header><section class="ms-panel ms-tengah"><h2>Kartu Hero</h2><button type="button" class="ms-kartu-hero" id="msKH" aria-label="Balik kartu hero"><span class="dep">' + HERO + '<b>' + esc(d.penerima) + '</b><i>ketuk untuk membalik</i></span><span class="bel"><strong>' + esc(d.gelar) + '</strong>' + d.atribut.map(function (a) { return '<div class="ms-at"><small>' + esc(a.nama) + '</small><div class="ms-bar"><i style="--w:' + (typeof a.nilai === 'number' ? a.nilai : 100) + '%"></i></div><b>' + esc(a.nilai) + '</b></div>'; }).join('') + '</span></button><button type="button" class="ms-tombol besar" id="msFinal" hidden>Operasi Terakhir: Klaim Hadiah Final</button></section>');
        el.querySelector('[data-a="markas"]').addEventListener('click', markas);
        var kh = el.querySelector('#msKH'); kh.addEventListener('click', function () { kh.classList.add('balik'); S.dariEl(kh, 40, ['#FFB020', '#8CF3FF', '#fff'], { kuat: 8 }); S.jeda(function () { kh.classList.add('isi'); el.querySelector('#msFinal').hidden = false; }, 700); });
        el.querySelector('#msFinal').addEventListener('click', final);
      }

      function final() {
        var el = layar('<div class="ms-akhir"><p class="ms-kpd">OPERASI TERAKHIR</p><div class="ms-peti" id="msPeti" aria-hidden="true"><i class="tutup"></i><i class="badan"></i></div><button type="button" class="ms-tombol besar" id="msKlaim">Klaim Hadiah Final</button><div class="ms-menang" hidden></div></div>', 'ms-gelap');
        el.querySelector('#msKlaim').addEventListener('click', function (e) {
          e.currentTarget.hidden = true; el.querySelector('#msPeti').classList.add('buka'); S.dariEl(el.querySelector('#msPeti'), 90, ['#FFB020', '#8CF3FF', '#FF5D8F', '#fff'], { kuat: 11, naik: 9 });
          S.jeda(function () { el.querySelector('#msPeti').hidden = true; var w = el.querySelector('.ms-menang'); w.hidden = false; w.innerHTML = '<span class="ms-lencana">MISI SELESAI</span><figure><img alt="Foto pilihan" src="' + esc(S.src(d.akhir.foto, 4)) + '"></figure><p class="ms-pesan">' + esc(d.akhir.pesan) + '</p><p class="ms-menangt">' + esc(d.akhir.penutup) + '</p>' + S.kredit(d.pengirim) + '<button type="button" class="ms-tombol" id="msUlang">↻ Mainkan Misi Lagi</button>'; w.classList.add('muncul'); S.akhir(); w.querySelector('#msUlang').addEventListener('click', function () { selesai = {}; poin = { hati: 0, bintang: 0, energi: 0 }; briefing(); }); }, 1400);
        });
      }
      briefing();
    }
  });
})();
