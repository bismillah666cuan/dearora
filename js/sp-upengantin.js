/* ==========================================================
   UNDANGAN RUMAH PENGANTIN (paket Invitation) — undangan yang dijelajahi seperti rumah.
   Teras (bunyikan bel) → denah rumah → lima ruangan: Ruang Tamu (acara: saklar, kalender, jam), Kamar (mempelai, album kisah, foto dinding),
   Taman (gerbang, petunjuk lokasi, dress code), Meja Tulis (RSVP dengan stempel), Brankas (amplop digital).
   Tombol "Langsung lihat detail acara" selalu ada. Isi data sama dengan Undangan Pernikahan; RSVP, kalender, dan salin rekening memakai S.ud.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special; if (!S || !S.ud) return;
  var U = S.ud, esc = S.esc, reduce = S.reduce;
  var KUNCI = function (slug) { return 'dearora:rp:' + slug; };
  var BULAN = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  var WARNA = ['#FF8FA3', '#FFD166', '#B79CFF', '#7BDFF2'];
  var ATAP = '<svg class="rp-atap" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true"><path d="M2 120 L160 4 L318 120 Z" fill="#C97B5A"/><path d="M2 120 L160 4 L318 120" fill="none" stroke="#9C5A3F" stroke-width="5" stroke-linejoin="round"/><path d="M46 96h228M76 72h168M106 48h108" stroke="#B2674A" stroke-width="3" opacity=".7"/><rect x="147" y="46" width="26" height="30" rx="13" fill="#FBF3E6" stroke="#9C5A3F" stroke-width="4"/></svg>';
  var LONCENG = '<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M20 3a3 3 0 0 1 3 3v1c6 2 10 8 10 15v8l4 5H3l4-5v-8c0-7 4-13 10-15V6a3 3 0 0 1 3-3z" fill="#D4A95A"/><circle cx="20" cy="42" r="4" fill="#A97C2F"/><path d="M12 22c0-4 3-8 6-9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6" fill="none"/></svg>';
  var KUPU = '<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M20 16C14 4 2 2 3 12c1 7 9 8 17 4zM20 16c6-12 18-14 17-4-1 7-9 8-17 4zM20 17c-6 2-12 8-8 13 4 3 8-4 8-13zM20 17c6 2 12 8 8 13-4 3-8-4-8-13z" fill="currentColor"/><path d="M20 10v14" stroke="#4A2F22" stroke-width="2" stroke-linecap="round"/></svg>';
  function sn(n) { var s = window.Suara; if (s && s[n]) { try { s[n](); } catch (e) { /* abaikan */ } } }
  function ada(id) { return !!id && !!S.src(id, 0); }
  function awal(n) { var m = String(n || '').trim().match(/[A-Za-zÀ-ÿ]/); return m ? m[0].toUpperCase() : ''; }
  function foto(id, i, alt) { return ada(id) ? '<img alt="' + esc(alt || '') + '" loading="lazy" src="' + esc(S.src(id, i)) + '">' : ''; }
  function p2(n) { return n < 10 ? '0' + n : String(n); }

  S.reg('upengantin', {
    nama: 'Undangan Rumah Pengantin',
    adapt: function (f, c) {
      var m = f.mempelai || {}, r = f.rsvp || {}, pc = String(f.judul || '').split(/\s*[&+]\s*/);
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Rumah Pengantin', sapaan: f.sapaan || '', kutipan: f.kutipan || '', dresscode: f.dresscode || '', penutup: f.penutup || '', fotoSampul: f.fotoSampul || '',
        wanita: { nama: m.wanita || pc[0] || '', ortu: m.wanitaOrtu || '', foto: m.wanitaFoto || '' }, pria: { nama: m.pria || pc[1] || '', ortu: m.priaOrtu || '', foto: m.priaFoto || '' },
        acara: (f.acara || []).map(function (a) { return { nama: a.nama, tanggal: a.tanggal, jam: a.jam, tempat: a.tempat, alamat: a.alamat, peta: a.peta || '' }; }),
        kisah: (f.kisah || []).slice(0, 4).map(function (k) { return { waktu: k.waktu, judul: k.judul, cerita: k.cerita, foto: k.foto || '' }; }),
        galeri: (f.galeri || []).slice(0, 15), rekening: (f.rekening || []).slice(0, 3), rsvp: { maksTamu: Math.max(1, Math.min(10, Number(r.maksTamu) || 4)), catatan: r.catatan || '' } };
    },
    mulai: function (root, d) {
      var tm = U.tamu(), tamu = tm.nama, sapa = tm.sapa, timer = 0, demo = !!S.konteks.demo || !window.DearoraAPI, slug = S.konteks.slug || 'demo';
      d.galeri = d.galeri.filter(ada);
      var pj = String(d.judul || '').split(/\s*[&+]\s*/), ml = awal(pj[0]) || awal(d.wanita.nama), mr = awal(pj[1]) || awal(d.pria.nama), inisial = (ml && mr) ? ml + '&' + mr : (ml || mr || '♥');
      var ruangan = ['tamu', 'kamar', 'taman', 'meja'].concat(d.rekening.length ? ['brankas'] : []), dikunjungi = {};
      try { dikunjungi = JSON.parse(localStorage.getItem(KUNCI(slug))) || {}; } catch (e) { dikunjungi = {}; }
      function simpan() { try { localStorage.setItem(KUNCI(slug), JSON.stringify(dikunjungi)); } catch (e) { /* abaikan */ } }
      function tandai(k) { if (!dikunjungi[k]) { dikunjungi[k] = 1; simpan(); } }
      function jumlah() { return ruangan.filter(function (k) { return dikunjungi[k]; }).length; }
      function layar(h, k) { clearInterval(timer); root.innerHTML = '<div class="sp-layar rp-layar ' + (k || '') + '"' + ((k || '').indexOf('rp-ruang') >= 0 ? ' data-tengah="tidak"' : '') + '><div class="rp-cahaya" aria-hidden="true"></div>' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function kembali(label, fn) { return '<button type="button" class="rp-kembali" id="rpK">‹ ' + esc(label) + '</button>'; }
      function acaraKartu(a, i, ringkas) {
        var peta = /^https:\/\/[^\s]{4,300}$/.test(a.peta) ? a.peta : '';
        return '<article class="rp-acara"><h3>' + esc(a.nama) + '</h3><p class="rp-tgl">' + U.tgl(a.tanggal) + (a.jam ? ' · ' + esc(a.jam) : '') + '</p><p><b>' + esc(a.tempat) + '</b><br>' + esc(a.alamat) + '</p><div class="rp-aksi-baris">' +
          (peta ? '<a class="rp-btn rp-kecil" href="' + esc(peta) + '" target="_blank" rel="noopener noreferrer">Buka peta</a>' : '<a class="rp-btn rp-kecil" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.tempat + ' ' + a.alamat) + '">Cari di peta</a>') +
          (!ringkas && U.waktu(a) ? '<button type="button" class="rp-btn rp-kecil rp-ghost" data-ics="' + i + '">Tambah ke kalender</button>' : (U.waktu(a) ? '<button type="button" class="rp-btn rp-kecil rp-ghost" data-ics="' + i + '">Tambah ke kalender</button>' : '')) + '</div></article>';
      }
      function pasangAcara(el) { el.querySelectorAll('[data-ics]').forEach(function (b) { if (b._ok) return; b._ok = 1; b.addEventListener('click', function () { U.unduhIcs(d.judul, d.acara[Number(b.dataset.ics)]); }); }); }
      function rekeningHTML() { return d.rekening.map(function (r, n) { return '<div class="rp-bank"><div><b>' + esc(r.bank) + '</b><span>a.n. ' + esc(r.nama) + '</span><em>' + esc(r.nomor) + '</em></div><button type="button" class="rp-btn rp-kecil" data-salin="' + n + '">Salin</button></div>'; }).join(''); }
      function pasangSalin(el) { el.querySelectorAll('[data-salin]').forEach(function (b) { b.addEventListener('click', function () { U.salin(d.rekening[Number(b.dataset.salin)].nomor, b); }); }); }
      function waktuPertama() { for (var i = 0; i < d.acara.length; i++) { var w = U.waktu(d.acara[i]); if (w) return w.getTime(); } return 0; }

      /* ---------- TERAS ---------- */
      function teras() {
        var balik = Object.keys(dikunjungi).length > 0;
        var el = layar('<div class="rp-langit" aria-hidden="true"><i class="rp-matahari"></i><i class="rp-awan rp-aw1"></i><i class="rp-awan rp-aw2"></i></div><p class="rp-kop">THE WEDDING OF</p><h1 class="rp-judul">' + esc(d.judul) + '</h1>' +
          '<div class="rp-rumah' + (balik ? ' rp-buka' : '') + '" id="rpR">' + ATAP + '<div class="rp-dinding"><div class="rp-jendela"><i></i></div><div class="rp-pintu"><span class="rp-dalam"></span><span class="rp-daun"><b class="rp-karangan">' + esc(inisial) + '</b><u class="rp-gagang"></u></span></div><div class="rp-jendela"><i></i></div></div>' +
          '<button type="button" class="rp-bel" id="rpBel" aria-label="Bunyikan bel pintu"><span class="rp-tali"></span>' + LONCENG + '</button><div class="rp-tangga" aria-hidden="true"><i></i><i></i></div><span class="rp-pot rp-ki" aria-hidden="true"></span><span class="rp-pot rp-ka" aria-hidden="true"></span></div>' +
          '<p class="rp-sapa">' + (tamu ? 'Kepada Yth. <b>' + esc(sapa || tamu) + '</b>' : 'Selamat datang di rumah kami') + '</p><p class="rp-petunjuk" id="rpP">' + (balik ? 'Selamat datang kembali. Pintunya sudah terbuka.' : 'Bunyikan bel di samping pintu.') + '</p>' +
          '<div class="rp-aksi"><button type="button" class="rp-btn" id="rpMasuk" ' + (balik ? '' : 'hidden') + '>Masuk ke dalam rumah</button></div><button type="button" class="rp-link" id="rpLangsung">Langsung lihat detail acara</button>', 'rp-teras');
        function buka() { var r = el.querySelector('#rpR'); if (r.classList.contains('rp-buka')) return; r.classList.add('rp-buka'); sn('ding'); S.jeda(function () { sn('ding'); }, 380); S.jeda(function () { sn('buka'); }, 900);
          el.querySelector('#rpP').textContent = d.sapaan ? d.sapaan : 'Silakan masuk, kami sudah menunggu.'; S.jeda(function () { el.querySelector('#rpMasuk').hidden = false; }, 1500); }
        el.querySelector('#rpBel').addEventListener('click', buka);
        el.querySelector('#rpMasuk').addEventListener('click', function () { sn('buka'); denah(); });
        el.querySelector('#rpLangsung').addEventListener('click', ringkasan);
      }

      /* ---------- DENAH ---------- */
      var ISI = { tamu: ['Ruang Tamu', 'Acara dan hitung mundur', 'rp-i-sofa'], kamar: ['Kamar', 'Mempelai, kisah, dan foto', 'rp-i-ranjang'], taman: ['Taman', 'Lokasi dan dress code', 'rp-i-pohon'], meja: ['Meja Tulis', 'Konfirmasi kehadiran', 'rp-i-meja'], brankas: ['Brankas', 'Amplop digital', 'rp-i-brankas'] };
      function denah() {
        var n = jumlah(), semua = n === ruangan.length;
        var el = layar('<h2 class="rp-judul rp-kecil">' + esc(d.judul) + '</h2><p class="rp-sub">Jelajahi tiap ruangan di rumah kami. <b id="rpProg">' + n + ' dari ' + ruangan.length + '</b> sudah dikunjungi.</p>' +
          '<div class="rp-potong"><div class="rp-atap-w">' + ATAP + '</div><div class="rp-ruangan">' + ruangan.map(function (k) { var x = ISI[k]; return '<button type="button" class="rp-tile rp-t-' + k + (dikunjungi[k] ? ' rp-sudah' : '') + '" data-r="' + k + '" aria-label="' + x[0] + (dikunjungi[k] ? ', sudah dikunjungi' : '') + '"><span class="rp-ico ' + x[2] + '" aria-hidden="true"></span><strong>' + x[0] + '</strong><small>' + x[1] + '</small><i class="rp-cek" aria-hidden="true">✓</i></button>'; }).join('') + '</div></div>' +
          '<div class="rp-aksi">' + (semua ? '<button type="button" class="rp-btn" id="rpSelesai">Keluar lewat pintu belakang</button>' : '') + '</div><button type="button" class="rp-link" id="rpLangsung">Langsung lihat detail acara</button>', 'rp-denah');
        el.querySelectorAll('.rp-tile').forEach(function (b) { b.addEventListener('click', function () { sn('klik'); var f = { tamu: ruangTamu, kamar: kamar, taman: taman, meja: meja, brankas: brankas }[b.dataset.r]; f(); }); });
        el.querySelector('#rpLangsung').addEventListener('click', ringkasan); var sl = el.querySelector('#rpSelesai'); if (sl) sl.addEventListener('click', penutup);
      }
      function ruang(k, judul, adegan, petunjuk, kelas) {
        var el = layar(kembali('Denah') + '<h2 class="rp-judul rp-kecil">' + judul + '</h2>' + adegan + '<p class="rp-petunjuk" id="rpP">' + petunjuk + '</p><div class="rp-panel" id="rpPanel" hidden></div>', 'rp-ruang rp-r-' + kelas);
        el.querySelector('#rpK').addEventListener('click', denah); return el;
      }
      function panel(el, html, pasang) { var p = el.querySelector('#rpPanel'); p.hidden = false; p.innerHTML = html; p.classList.remove('rp-masuk'); void p.offsetWidth; p.classList.add('rp-masuk'); if (pasang) pasang(p); if (p.scrollIntoView) p.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }

      /* ---------- RUANG TAMU: acara ---------- */
      function ruangTamu() {
        var a0 = d.acara[0], tg = a0 && /^(\d{4})-(\d{2})-(\d{2})/.exec(a0.tanggal || '');
        var el = ruang('tamu', 'Ruang Tamu', '<div class="rp-adegan rp-tamu rp-gelap" id="rpS"><div class="rp-dinding-r"></div><button type="button" class="rp-saklar" id="rpSaklar" aria-label="Nyalakan lampu"><i></i></button><div class="rp-lampu" aria-hidden="true"><i></i></div>' +
          '<button type="button" class="rp-jam" id="rpJam" aria-label="Lihat hitung mundur"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#FFF8EA" stroke="#8A5A3C" stroke-width="4"/><g stroke="#4A2F22" stroke-linecap="round"><line class="jm" x1="32" y1="32" x2="32" y2="17" stroke-width="3.4"/><line class="mn" x1="32" y1="32" x2="32" y2="10" stroke-width="2.4"/></g><circle cx="32" cy="32" r="3" fill="#C97B5A"/></svg></button>' +
          '<button type="button" class="rp-kalender" id="rpKal" aria-label="Lihat jadwal acara"><b>' + (tg ? BULAN[Number(tg[2]) - 1] : 'HARI') + '</b><span>' + (tg ? Number(tg[3]) : '♥') + '</span></button><div class="rp-sofa" aria-hidden="true"><i></i><i></i></div></div>', 'Ruangannya gelap. Ketuk saklar di dekat pintu.', 'tamu');
        var s = el.querySelector('#rpS'), nyala = false, lihatKal = false;
        el.querySelector('#rpSaklar').addEventListener('click', function () { if (nyala) return; nyala = true; sn('klik'); s.classList.remove('rp-gelap'); S.jeda(function () { sn('ding'); }, 120); el.querySelector('#rpP').textContent = 'Terang. Ketuk kalender di dinding untuk jadwal acara, dan jam untuk hitung mundur.'; });
        function perlu() { if (nyala) return true; el.querySelector('#rpP').textContent = 'Nyalakan lampu dulu supaya terlihat.'; sn('klik'); return false; }
        el.querySelector('#rpKal').addEventListener('click', function () { if (!perlu()) return; sn('kertas'); lihatKal = true; tandai('tamu');
          panel(el, '<h3 class="rp-pj">Jadwal Acara</h3>' + d.acara.map(function (a, i) { return acaraKartu(a, i); }).join(''), pasangAcara); });
        el.querySelector('#rpJam').addEventListener('click', function () { if (!perlu()) return; sn('ding'); tandai('tamu'); var t0 = waktuPertama();
          panel(el, '<h3 class="rp-pj">Menuju Hari Bahagia</h3><div class="rp-detik" id="rpD" role="timer" aria-live="off"></div>', function (p) { var dd = p.querySelector('#rpD'); if (!t0) { dd.innerHTML = '<p>Tanggal acara belum diatur.</p>'; return; }
            var tk = function () { var sisa = Math.max(0, Math.floor((t0 - Date.now()) / 1000)); dd.innerHTML = sisa === 0 ? '<p class="rp-hari">Hari bahagia telah tiba</p>' : [['hari', Math.floor(sisa / 86400)], ['jam', Math.floor(sisa % 86400 / 3600)], ['menit', Math.floor(sisa % 3600 / 60)], ['detik', sisa % 60]].map(function (x) { return '<div><b>' + (x[0] === 'hari' ? x[1] : p2(x[1])) + '</b><small>' + x[0] + '</small></div>'; }).join(''); }; tk(); clearInterval(timer); timer = setInterval(tk, 1000); }); });
      }

      /* ---------- KAMAR: mempelai, kisah, foto ---------- */
      function kamar() {
        var el = ruang('kamar', 'Kamar', '<div class="rp-adegan rp-kamar"><div class="rp-dinding-r"></div>' + (d.galeri.length ? '<button type="button" class="rp-dfoto" id="rpDF" aria-label="Lihat foto di dinding"><i></i><i></i><i></i></button>' : '') +
          '<div class="rp-meja-k"><button type="button" class="rp-bingkai" data-m="wanita" aria-label="Kenalan dengan ' + esc(d.wanita.nama) + '"><span>' + (foto(d.wanita.foto, 0, d.wanita.nama) || awal(d.wanita.nama) || '♥') + '</span></button><button type="button" class="rp-bingkai" data-m="pria" aria-label="Kenalan dengan ' + esc(d.pria.nama) + '"><span>' + (foto(d.pria.foto, 1, d.pria.nama) || awal(d.pria.nama) || '♥') + '</span></button></div>' +
          '<button type="button" class="rp-album" id="rpAlbum" aria-label="Buka album kisah kami"><i></i><b>Kisah Kami</b></button><div class="rp-ranjang" aria-hidden="true"><i></i><i></i></div></div>', 'Ketuk bingkai untuk berkenalan, dan album untuk kisah kami.', 'kamar');
        el.querySelectorAll('.rp-bingkai').forEach(function (b) { b.addEventListener('click', function () { sn('pop'); tandai('kamar'); var m = d[b.dataset.m], putri = b.dataset.m === 'wanita';
          panel(el, '<div class="rp-profil">' + (m.foto && ada(m.foto) ? foto(m.foto, putri ? 0 : 1, m.nama) : '<span class="rp-inisial">' + esc(awal(m.nama) || '♥') + '</span>') + '<h3>' + esc(m.nama) + '</h3>' + (m.ortu ? '<p>' + (putri ? 'Putri dari ' : 'Putra dari ') + esc(m.ortu) + '</p>' : '') + '</div>'); }); });
        el.querySelector('#rpAlbum').addEventListener('click', function () {
          sn('kertas'); tandai('kamar'); var hal = []; if (d.kutipan) hal.push({ judul: 'Sebuah doa', cerita: d.kutipan, kutip: true });
          d.kisah.forEach(function (k) { hal.push(k); }); if (!hal.length) hal.push({ judul: d.judul, cerita: d.sapaan || 'Terima kasih sudah berkunjung ke rumah kami.', kutip: true }); var i = 0;
          panel(el, '<div class="rp-buku"><div class="rp-hal" id="rpHal"></div><div class="rp-nav"><button type="button" class="rp-btn rp-kecil rp-ghost" id="rpPrev" aria-label="Halaman sebelumnya">‹</button><span id="rpNo"></span><button type="button" class="rp-btn rp-kecil rp-ghost" id="rpNext" aria-label="Halaman berikutnya">›</button></div></div>', function (p) {
            var h = p.querySelector('#rpHal'), no = p.querySelector('#rpNo');
            function tampil() { var x = hal[i]; h.classList.remove('rp-balik'); void h.offsetWidth; h.classList.add('rp-balik'); h.innerHTML = (x.waktu ? '<small>' + esc(x.waktu) + '</small>' : '') + '<h3>' + esc(x.judul) + '</h3>' + (x.foto && ada(x.foto) ? foto(x.foto, i, x.judul) : '') + '<p' + (x.kutip ? ' class="rp-kutip"' : '') + '>' + esc(x.cerita) + '</p>'; no.textContent = (i + 1) + ' / ' + hal.length; }
            p.querySelector('#rpPrev').addEventListener('click', function () { i = (i + hal.length - 1) % hal.length; sn('kertas'); tampil(); }); p.querySelector('#rpNext').addEventListener('click', function () { i = (i + 1) % hal.length; sn('kertas'); tampil(); }); tampil(); }); });
        var df = el.querySelector('#rpDF'); if (df) df.addEventListener('click', function () { sn('pop'); tandai('kamar');
          panel(el, '<h3 class="rp-pj">Foto di Dinding</h3><div class="rp-grid">' + d.galeri.map(function (f, i) { return '<button type="button" class="rp-gambar" data-z="' + i + '" aria-label="Perbesar foto ' + (i + 1) + '"><img alt="Foto ' + (i + 1) + '" loading="lazy" src="' + esc(S.src(f, i)) + '"></button>'; }).join('') + '</div>', function (p) {
            p.querySelectorAll('.rp-gambar').forEach(function (g) { g.addEventListener('click', function () { var z = document.createElement('div'); z.className = 'rp-zoom'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', 'Foto diperbesar'); z.innerHTML = '<img alt="" src="' + esc(S.src(d.galeri[Number(g.dataset.z)], Number(g.dataset.z))) + '"><button type="button" aria-label="Tutup">✕</button>'; z.addEventListener('click', function () { z.remove(); }); el.appendChild(z); sn('pop'); }); }); }); });
      }

      /* ---------- TAMAN: lokasi dan dress code ---------- */
      function taman() {
        var el = ruang('taman', 'Taman', '<div class="rp-adegan rp-taman" id="rpT"><i class="rp-pohon"></i><i class="rp-bunga rp-bg1"></i><i class="rp-bunga rp-bg2"></i><i class="rp-bunga rp-bg3"></i><div class="rp-pagar"></div><button type="button" class="rp-gerbang" id="rpGate" aria-label="Buka gerbang taman"><span class="rp-ki"></span><span class="rp-ka"></span></button>' +
          '<button type="button" class="rp-papan" id="rpPapan" aria-label="Lihat petunjuk lokasi" hidden><b>LOKASI</b><i></i></button>' + (d.dresscode ? '<button type="button" class="rp-papan rp-pdress" id="rpDress" aria-label="Lihat dress code" hidden><b>DRESS CODE</b><i></i></button>' : '') +
          [0, 1, 2].map(function (n) { return '<button type="button" class="rp-kupu" data-k="' + n + '" style="color:' + WARNA[n] + ';--d:' + (n * 1.3) + 's;left:' + (18 + n * 26) + '%;top:' + (14 + n * 9) + '%" aria-label="Kupu-kupu" hidden>' + KUPU + '</button>'; }).join('') + '</div>', 'Ketuk gerbang untuk membukanya.', 'taman');
        var t = el.querySelector('#rpT'), buka = false;
        el.querySelector('#rpGate').addEventListener('click', function () { if (buka) return; buka = true; t.classList.add('rp-buka'); sn('buka'); tandai('taman'); el.querySelector('#rpP').textContent = 'Gerbang terbuka. Ketuk papan petunjuk' + (d.dresscode ? ', papan dress code,' : '') + ' dan kupu-kupu.';
          S.jeda(function () { t.querySelectorAll('[hidden]').forEach(function (x) { x.hidden = false; x.classList.add('rp-muncul'); }); sn('pop'); }, 700); });
        t.querySelectorAll('.rp-kupu').forEach(function (k) { k.addEventListener('click', function () { sn('pop'); k.style.left = (8 + Math.random() * 78) + '%'; k.style.top = (6 + Math.random() * 38) + '%'; k.classList.add('rp-lompat'); S.jeda(function () { k.classList.remove('rp-lompat'); }, 700); }); });
        el.querySelector('#rpPapan').addEventListener('click', function () { sn('kertas'); panel(el, '<h3 class="rp-pj">Petunjuk Lokasi</h3>' + d.acara.map(function (a, i) { return acaraKartu(a, i); }).join(''), pasangAcara); });
        var dr = el.querySelector('#rpDress'); if (dr) dr.addEventListener('click', function () { sn('kertas'); panel(el, '<h3 class="rp-pj">Dress Code</h3><p class="rp-dress">' + esc(d.dresscode) + '</p>'); });
      }

      /* ---------- MEJA TULIS: RSVP ---------- */
      function meja() {
        var el = ruang('meja', 'Meja Tulis', '<div class="rp-adegan rp-mejatulis" id="rpM"><div class="rp-lampu-m" aria-hidden="true"></div><button type="button" class="rp-pena" id="rpPena" aria-label="Ambil pena untuk menulis konfirmasi"><i></i></button><div class="rp-kertas-k" aria-hidden="true"></div><div class="rp-cap" id="rpCap" aria-hidden="true">TERKONFIRMASI</div><div class="rp-papan-kayu" aria-hidden="true"></div></div>', 'Ketuk pena untuk menulis jawabanmu.', 'meja');
        var terbuka = false;
        el.querySelector('#rpPena').addEventListener('click', function () {
          if (terbuka) return; terbuka = true; sn('kertas'); el.querySelector('#rpM').classList.add('rp-tulis'); el.querySelector('#rpP').textContent = 'Isi konfirmasi kehadiranmu di kertas ini.';
          if (!demo && window.Balasan && window.Balasan.tandai) window.Balasan.tandai(slug);
          panel(el, U.rsvpHTML(d, tamu), function (p) {
            U.rsvpPasang(p, d, { demo: demo, slug: slug, gaya: 'elegan' }); var terima = p.querySelector('#udT');
            function cek() { if (terima && !terima.hidden && !el.classList.contains('rp-stempel')) { el.classList.add('rp-stempel'); tandai('meja'); S.jeda(function () { sn('drum'); sn('sukses'); }, 250); S.confetti(innerWidth / 2, innerHeight * 0.3, 40, ['#D4A95A', '#D98E7A', '#8FA98A', '#fff'], { kuat: 7 }); } }
            if (terima && window.MutationObserver) new MutationObserver(cek).observe(terima, { attributes: true, attributeFilter: ['hidden'] }); cek(); }); });
      }

      /* ---------- BRANKAS: amplop digital ---------- */
      function brankas() {
        var el = ruang('brankas', 'Brankas', '<div class="rp-adegan rp-bk" id="rpB"><div class="rp-bk-dalam" aria-hidden="true"></div><div class="rp-bk-pintu" id="rpBP"><button type="button" class="rp-dial" id="rpDial" aria-label="Putar kenop brankas"><i></i></button><span class="rp-engsel" aria-hidden="true"></span><span class="rp-ulir" id="rpU" aria-live="polite">0 / 3</span></div></div>', 'Putar kenopnya tiga kali untuk membuka brankas.', 'brankas');
        var putar = 0, b = el.querySelector('#rpB'), dial = el.querySelector('#rpDial');
        dial.addEventListener('click', function () { if (putar >= 3) return; putar++; sn('klik'); dial.style.transform = 'rotate(' + (putar * 120) + 'deg)'; el.querySelector('#rpU').textContent = putar + ' / 3';
          if (putar === 3) { S.jeda(function () { b.classList.add('rp-buka'); sn('hadiah'); tandai('brankas'); el.querySelector('#rpP').textContent = 'Brankas terbuka. Doa restu Anda sudah sangat berarti.'; panel(el, '<h3 class="rp-pj">Amplop Digital</h3><p class="rp-cat">Jika ingin memberi tanda kasih, dapat melalui:</p>' + rekeningHTML(), pasangSalin); }, 450); } });
      }

      /* ---------- PENUTUP ---------- */
      function penutup() {
        var el = layar('<div class="rp-langit rp-malam" aria-hidden="true"><i class="rp-bulan"></i></div><div class="rp-rumah rp-tutup rp-buka" aria-hidden="true">' + ATAP + '<div class="rp-dinding"><div class="rp-jendela"><i></i></div><div class="rp-pintu"><span class="rp-dalam"></span><span class="rp-daun"><b class="rp-karangan">' + esc(inisial) + '</b></span></div><div class="rp-jendela"><i></i></div></div></div>' +
          '<div class="rp-kartu-p"><h2 class="rp-judul rp-kecil">Terima kasih sudah berkunjung</h2><p class="rp-tutup-teks">' + esc(d.penutup || 'Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami.') + '</p><p class="rp-tanda">' + esc(d.judul) + '</p></div><div class="rp-aksi"><button type="button" class="rp-btn rp-ghost" id="rpDenah">Kembali ke denah</button><button type="button" class="rp-btn" id="rpRingkas">Lihat ringkasan acara</button></div>', 'rp-penutup');
        sn('sukses'); sn('konfeti'); S.confetti(innerWidth / 2, innerHeight * 0.3, 60, ['#D4A95A', '#D98E7A', '#8FA98A', '#fff'], { kuat: 8 });
        el.querySelector('#rpDenah').addEventListener('click', denah); el.querySelector('#rpRingkas').addEventListener('click', ringkasan);
      }

      /* ---------- RINGKASAN: mode sederhana tanpa permainan ---------- */
      function ringkasan() {
        var sek = function (j, h) { return h ? '<section class="rp-sek"><h2>' + j + '</h2>' + h + '</section>' : ''; };
        var el = layar('<div class="rp-ringkas"><button type="button" class="rp-kembali" id="rpK">‹ Kembali ke rumah</button><p class="rp-kop">THE WEDDING OF</p><h1 class="rp-judul">' + esc(d.judul) + '</h1>' + (tamu ? '<p class="rp-sapa">Kepada Yth. <b>' + esc(sapa || tamu) + '</b></p>' : '') +
          (d.sapaan ? '<p class="rp-teks">' + esc(d.sapaan) + '</p>' : '') + (d.kutipan ? '<p class="rp-kutip">' + esc(d.kutipan) + '</p>' : '') +
          sek('Mempelai', '<div class="rp-dua"><div class="rp-profil">' + (d.wanita.foto && ada(d.wanita.foto) ? foto(d.wanita.foto, 0, d.wanita.nama) : '') + '<h3>' + esc(d.wanita.nama) + '</h3>' + (d.wanita.ortu ? '<p>Putri dari ' + esc(d.wanita.ortu) + '</p>' : '') + '</div><div class="rp-profil">' + (d.pria.foto && ada(d.pria.foto) ? foto(d.pria.foto, 1, d.pria.nama) : '') + '<h3>' + esc(d.pria.nama) + '</h3>' + (d.pria.ortu ? '<p>Putra dari ' + esc(d.pria.ortu) + '</p>' : '') + '</div></div>') +
          sek('Acara', d.acara.map(function (a, i) { return acaraKartu(a, i, true); }).join('') + (d.dresscode ? '<p class="rp-dress">Dress code: ' + esc(d.dresscode) + '</p>' : '')) +
          sek('Kisah Kami', d.kisah.map(function (k) { return '<article class="rp-acara"><small>' + esc(k.waktu) + '</small><h3>' + esc(k.judul) + '</h3>' + (k.foto && ada(k.foto) ? foto(k.foto, 0, k.judul) : '') + '<p>' + esc(k.cerita) + '</p></article>'; }).join('')) +
          sek('Galeri', d.galeri.length ? '<div class="rp-grid">' + d.galeri.map(function (f, i) { return '<img alt="Foto ' + (i + 1) + '" loading="lazy" src="' + esc(S.src(f, i)) + '">'; }).join('') + '</div>' : '') +
          sek('Amplop Digital', d.rekening.length ? '<p class="rp-cat">Doa restu Anda sudah sangat berarti. Jika ingin memberi tanda kasih, dapat melalui:</p>' + rekeningHTML() : '') +
          '<div class="rp-rsvp-w">' + U.rsvpHTML(d, tamu) + '</div>' + (d.penutup ? '<p class="rp-teks">' + esc(d.penutup) + '</p>' : '') + S.kredit(d.pengirim) + '</div>', 'rp-ringkasan');
        el.querySelector('#rpK').addEventListener('click', denah); pasangAcara(el); pasangSalin(el); U.rsvpPasang(el, d, { demo: demo, slug: slug, gaya: 'elegan' });
        if (!demo && window.Balasan && window.Balasan.tandai) window.Balasan.tandai(slug);
      }
      teras();
    }
  });
})();
