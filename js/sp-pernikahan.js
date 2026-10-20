/* ==========================================================
   UNDANGAN PERNIKAHAN — hiasan bunga SVG, kelopak berguguran, amplop bunga yang terbuka, mempelai (foto opsional),
   kutipan, acara, hitung mundur, kisah kita, galeri, amplop digital, dan konfirmasi hadir (dipakai bersama sp-undangan.js).
   Animasi mengikuti prefers-reduced-motion.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, B = window.Bunga, U = S.ud, esc = S.esc;
  function awal(n) { var m = String(n || '').trim().match(/[A-Za-zÀ-ÿ]/); return m ? m[0].toUpperCase() : ''; }
  /** Kelopak berguguran: elemen ringan dengan animasi CSS (tidak ada JS per frame). */
  function kelopak(wadah, jumlah, T) {
    if (S.reduce || !T.partikel) return; var h = '', i, w, PK = T.partikel;
    for (i = 0; i < jumlah; i++) { w = PK.palet[Math.floor(Math.random() * PK.palet.length)]; h += '<span class="nk-kp" style="--x:' + Math.round(Math.random() * 100) + '%;--s:' + Math.round(12 + Math.random() * 14) + 'px;--d:' + (9 + Math.random() * 9).toFixed(1) + 's;--w:' + (-Math.random() * 14).toFixed(1) + 's;--g:' + Math.round(20 + Math.random() * 60) + 'px;--r:' + Math.round(180 + Math.random() * 400) + 'deg">' + PK.svg(w) + '</span>'; }
    wadah.insertAdjacentHTML('beforeend', '<div class="nk-hujan" aria-hidden="true">' + h + '</div>');
  }
  /** Ledakan kelopak dari titik tengah saat amplop dibuka. */
  function ledak(wadah, x, y, T) {
    if (S.reduce || !T.partikel) return; var h = '', i, a, j, w, PK = T.partikel;
    for (i = 0; i < 34; i++) { a = Math.random() * Math.PI * 2; j = 90 + Math.random() * 240; w = PK.palet[Math.floor(Math.random() * PK.palet.length)]; h += '<span class="nk-ld" style="left:' + x + 'px;top:' + y + 'px;--dx:' + Math.round(Math.cos(a) * j) + 'px;--dy:' + Math.round(Math.sin(a) * j - 80) + 'px;--r:' + Math.round(Math.random() * 720 - 360) + 'deg;--s:' + Math.round(12 + Math.random() * 14) + 'px;animation-delay:' + (Math.random() * 0.15).toFixed(2) + 's">' + PK.svg(w) + '</span>'; }
    var el = document.createElement('div'); el.className = 'nk-ledak'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = h; wadah.appendChild(el); setTimeout(function () { el.remove(); }, 2600);
  }
  /** Rujukan foto dianggap ada hanya bila bisa diubah menjadi alamat gambar (rujukan yang tidak cocok diabaikan, bukan gambar rusak). */
  function ada(id) { return !!id && !!S.src(id, 0); }
  function foto(id, i, alt) { return ada(id) ? '<img alt="' + esc(alt || '') + '" loading="lazy" src="' + esc(S.src(id, i)) + '">' : ''; }
  function daftar(kunci, T) {
  S.reg(kunci, {
    nama: T.nama,
    adapt: function (f, c) {
      if (T.mode === 'acara') {
        var tk = f.tokoh || {}, rr = f.rsvp || {};
        return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || T.nama, sapaan: f.sapaan || '', kutipan: f.kutipan || '', dresscode: f.dresscode || '', penutup: f.penutup || '', fotoSampul: f.fotoSampul || '',
          tokoh: { nama: tk.nama || '', ortu: tk.ortu || '', foto: tk.foto || '' }, wanita: { nama: '', ortu: '', foto: '' }, pria: { nama: '', ortu: '', foto: '' },
          acara: (f.acara || []).map(function (a) { return { nama: a.nama, tanggal: a.tanggal, jam: a.jam, tempat: a.tempat, alamat: a.alamat, peta: a.peta || '' }; }),
          susunan: (f.susunan || []).slice(0, 6).map(function (s) { return { jam: s.jam, kegiatan: s.kegiatan }; }), denah: f.denah || '', siaran: f.siaran || '', kisah: [],
          galeri: (f.galeri || []).slice(0, 15), rekening: (f.rekening || []).slice(0, 3), rsvp: { maksTamu: Math.max(1, Math.min(10, Number(rr.maksTamu) || 4)), catatan: rr.catatan || '' } };
      }
      var m = f.mempelai || {}, r = f.rsvp || {}, pc = String(f.judul || '').split(/\s*[&+]\s*/);
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Undangan Pernikahan', sapaan: f.sapaan || '', kutipan: f.kutipan || '', dresscode: f.dresscode || '', penutup: f.penutup || '', fotoSampul: f.fotoSampul || '',
        wanita: { nama: m.wanita || pc[0] || '', ortu: m.wanitaOrtu || '', foto: m.wanitaFoto || '' }, pria: { nama: m.pria || pc[1] || '', ortu: m.priaOrtu || '', foto: m.priaFoto || '' },
        acara: (f.acara || []).map(function (a) { return { nama: a.nama, tanggal: a.tanggal, jam: a.jam, tempat: a.tempat, alamat: a.alamat, peta: a.peta || '' }; }),
        kisah: (f.kisah || []).slice(0, 4).map(function (k) { return { waktu: k.waktu, judul: k.judul, cerita: k.cerita, foto: k.foto || '' }; }),
        galeri: (f.galeri || []).slice(0, 15), rekening: (f.rekening || []).slice(0, 3), rsvp: { maksTamu: Math.max(1, Math.min(10, Number(r.maksTamu) || 4)), catatan: r.catatan || '' } };
    },
    mulai: function (root, d) {
      var tm = U.tamu(), tamu = tm.nama, sapa = tm.sapa;
      d.galeri = d.galeri.filter(ada);
      var timer = 0, demo = !!S.konteks.demo || !window.DearoraAPI, slug = S.konteks.slug || 'demo', pj = String(d.judul || '').split(/\s*[&+]\s*/), ml = awal(pj[0]) || awal(d.wanita.nama), mr = awal(pj[1]) || awal(d.pria.nama);
      var acr = T.mode === 'acara';
      var inisial = acr ? esc(awal(d.tokoh.nama) || awal(d.judul) || '♥') : (ml && mr ? ml + ' <i>&amp;</i> ' + mr : esc((ml || mr || '♥')));
      var namaP = esc(d.judul).replace(/&amp;/g, '<i>&amp;</i>');                       // nama panggilan pasangan = judul ("Rani & Dimas")
      function layar(h, k) { clearInterval(timer); root.innerHTML = '<div class="sp-layar ud ' + (T.root || 'ud-elegan') + ' nk nk-' + T.id + (String(d.judul || '').length > 18 ? ' nk-panjang' : '') + ' ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      /** Kerangka tiap jenis pembuka: amplop, mihrab (pintu lengkung), bintang (langit malam), kelir (layar wayang), tirai (beludru). */
      var BUKA = {
        amplop: function () {
          return { bg: '<div class="nk-tirai" aria-hidden="true">' + (T.tirai ? T.tirai() : '') + '</div>', inti: '<div class="nk-amplop nk-stage"><i class="nk-tutup" aria-hidden="true"></i><i class="nk-kartu-dalam" aria-hidden="true"><b>' + inisial + '</b></i><i class="nk-badan" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
        },
        mihrab: function () {
          return { bg: '<div class="nk-bg-mh" aria-hidden="true"></div>', inti: '<div class="nk-mh nk-stage"><div class="nk-mh-cahaya" aria-hidden="true"></div><div class="nk-mh-kartu" aria-hidden="true"><b>' + inisial + '</b></div><div class="nk-mh-daun" aria-hidden="true"><i class="kiri"></i><i class="kanan"></i></div><div class="nk-mh-bingkai" aria-hidden="true">' + (T.bingkai ? T.bingkai() : '') + '</div><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
        },
        bintang: function () {
          return { bg: '<div class="nk-bg-bt" aria-hidden="true">' + (T.langit ? T.langit() : '') + '<i class="nk-meteor"></i></div>', inti: '<div class="nk-bt nk-stage"><div class="nk-bt-rasi" aria-hidden="true">' + (T.bingkai ? T.bingkai() : '') + '</div><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
        },
        kelir: function () {
          return { bg: '<div class="nk-bg-kl" aria-hidden="true"></div>', inti: '<div class="nk-kl nk-stage"><div class="nk-kl-isi" aria-hidden="true">' + (T.bingkai ? T.bingkai() : '') + '<b>' + inisial + '</b></div><i class="nk-kl-panel kiri" aria-hidden="true"></i><i class="nk-kl-panel kanan" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
        },
        tirai: function () {
          return { bg: '<div class="nk-bg-tr" aria-hidden="true"></div>', inti: '<div class="nk-tr nk-stage"><div class="nk-tr-kartu" aria-hidden="true">' + (T.bingkai ? T.bingkai() : '') + '<b>' + inisial + '</b></div><i class="nk-tr-tirai kiri" aria-hidden="true"></i><i class="nk-tr-tirai kanan" aria-hidden="true"></i><i class="nk-tr-rumbai" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
        }
      };
      /** Pembuka tambahan untuk acara keluarga: mahkota, lentera, tumpeng, rumah. */
      BUKA.mahkota = function () {
        return { bg: '<div class="nk-bg-mk" aria-hidden="true"></div>', inti: '<div class="nk-mk nk-stage"><div class="nk-mk-bantal" aria-hidden="true"></div><div class="nk-mk-kartu" aria-hidden="true"><b>' + inisial + '</b></div><div class="nk-mk-mahkota" aria-hidden="true">' + (T.mahkota ? T.mahkota() : '') + '</div><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
      };
      BUKA.lentera = function () {
        var l = [0, 1, 2].map(function (i) { return '<div class="nk-ln-l l' + i + '" aria-hidden="true">' + (T.lentera ? T.lentera(i) : '') + '</div>'; }).join('');
        return { bg: '<div class="nk-bg-ln" aria-hidden="true"></div>', inti: '<div class="nk-ln nk-stage"><i class="nk-ln-tali" aria-hidden="true"></i><div class="nk-ln-cahaya" aria-hidden="true"></div>' + l + '<div class="nk-ln-kartu" aria-hidden="true"><b>' + inisial + '</b></div><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
      };
      BUKA.tumpeng = function () {
        return { bg: '<div class="nk-bg-tp" aria-hidden="true"></div>', inti: '<div class="nk-tp nk-stage"><div class="nk-tp-kartu" aria-hidden="true"><b>' + inisial + '</b></div><div class="nk-tp-gambar" aria-hidden="true">' + (T.tumpeng ? T.tumpeng() : '') + '</div><div class="nk-tp-uap" aria-hidden="true"><i></i><i></i><i></i></div><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
      };
      BUKA.rumah = function () {
        return { bg: '<div class="nk-bg-rm" aria-hidden="true"></div>', inti: '<div class="nk-rm nk-stage"><div class="nk-rm-rumah" aria-hidden="true">' + (T.rumah ? T.rumah() : '') + '</div><div class="nk-rm-terang" aria-hidden="true"></div><div class="nk-rm-kartu" aria-hidden="true"><b>' + inisial + '</b></div><div class="nk-rm-pintu" aria-hidden="true"></div><i class="nk-rm-jendela a" aria-hidden="true"></i><i class="nk-rm-jendela b" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' };
      };
      function segel() {
        var jenis = T.buka || 'amplop', B0 = (BUKA[jenis] || BUKA.amplop)(), wkt = T.waktuBuka || [1500, 2200];
        var el = layar(B0.bg + '<div class="nk-amplop-l nk-bk-' + jenis + '"><p class="nk-kicker">' + esc(T.kicker || 'THE WEDDING OF') + '</p><h1 class="nk-nama">' + namaP + '</h1>' + B0.inti +
          '<p class="ud-kepada">Kepada Yth.<br><b>' + esc(sapa || 'Bapak/Ibu/Saudara/i') + '</b></p><p class="ud-pet">Ketuk segel untuk membuka undangan</p></div>', 'nk-segell'); kelopak(el, 12, T);
        el.querySelector('.ud-segel').addEventListener('click', function (e) {
          var b = e.currentTarget, r = b.getBoundingClientRect(); b.classList.add('pecah'); b.disabled = true; el.classList.add('membuka'); el.querySelector('.nk-stage').classList.add('buka'); if (window.Suara) window.Suara[T.suaraBuka || 'segel']();
          ledak(el, r.left + r.width / 2, r.top + r.height / 2, T); S.jeda(function () { el.classList.add('nk-keluar'); }, S.reduce ? 40 : wkt[0]); S.jeda(halaman, S.reduce ? 60 : wkt[1]);
        });
      }
      function monogram() {
        var isi = ada(d.fotoSampul) ? '<div class="nk-lengkung">' + foto(d.fotoSampul, 0, 'Foto ' + d.judul) + '</div>' : '<div class="nk-monogram"><span>' + inisial + '</span></div>';
        return '<div class="nk-karangan"><div class="nk-karangan-svg" aria-hidden="true">' + (T.karangan ? T.karangan() : '') + '</div><div class="nk-isi">' + isi + '</div></div>';
      }
      function potret(o, jenis, i) {
        var isi = ada(o.foto) ? foto(o.foto, i, o.nama) : (T.pengganti ? T.pengganti(i) : '');
        return '<article class="nk-potret nk-rev"><div class="nk-bulat' + (ada(o.foto) ? '' : ' kosong') + '">' + isi + '</div><h3 class="nk-nama-k">' + esc(o.nama) + '</h3>' + (o.ortu ? '<p class="nk-ortu">' + esc(o.ortu) + '</p>' : '') + '</article>';
      }
      function halaman() {
        var a0 = d.acara[0], t0 = a0 && U.waktu(a0);
        var acara = d.acara.map(function (a, k) {
          var peta = /^https:\/\/[^\s]{4,300}$/.test(a.peta) ? a.peta : '';
          return '<article class="ud-kartu nk-kartu"><span class="nk-sdt a" aria-hidden="true">' + (T.sdt ? T.sdt() : '') + '</span><h3>' + esc(a.nama) + '</h3><p class="ud-tgl">' + U.tgl(a.tanggal) + '</p><p class="ud-jam">' + esc(a.jam) + '</p><p class="ud-tmp"><b>' + esc(a.tempat) + '</b><br>' + esc(a.alamat) + '</p><div class="ud-aksi">' +
            (peta ? '<a class="ud-btn ghost" href="' + esc(peta) + '" target="_blank" rel="noopener noreferrer">Buka peta</a>' : '<a class="ud-btn ghost" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.tempat + ' ' + a.alamat) + '">Cari di peta</a>') +
            (U.waktu(a) ? '<button type="button" class="ud-btn ghost" data-ics="' + k + '">Tambah ke kalender</button>' : '') + '</div></article>';
        }).join('');
        var kisah = d.kisah.length ? '<section class="ud-sek nk-kisah"><h2>Kisah Kita</h2><ol class="nk-garis">' + d.kisah.map(function (k, n) { return '<li class="nk-rev" style="--i:' + n + '"><span class="nk-titik" aria-hidden="true"></span><time>' + esc(k.waktu) + '</time><h3>' + esc(k.judul) + '</h3>' + (ada(k.foto) ? '<div class="nk-kfoto">' + foto(k.foto, n + 5, k.judul) + '</div>' : '') + '<p>' + esc(k.cerita) + '</p></li>'; }).join('') + '</ol></section>' : '';
        var susunan = d.susunan && d.susunan.length ? '<section class="ud-sek nk-kisah nk-susunan"><h2>Susunan Acara</h2><ol class="nk-garis">' + d.susunan.map(function (s, n) { return '<li class="nk-rev" style="--i:' + n + '"><span class="nk-titik" aria-hidden="true"></span><time>' + esc(s.jam) + '</time><h3>' + esc(s.kegiatan) + '</h3></li>'; }).join('') + '</ol></section>' : '';
        var sir = /^https:\/\/[^\s]{4,300}$/.test(d.siaran || '') ? '<a class="ud-btn nk-siaran" href="' + esc(d.siaran) + '" target="_blank" rel="noopener noreferrer">Tonton siaran langsung</a>' : '';
        var extra = (d.denah || sir) ? '<section class="ud-sek nk-denah"><h2>Petunjuk Lokasi</h2>' + (d.denah ? '<p class="ud-cat">' + esc(d.denah) + '</p>' : '') + (sir ? '<p class="ud-cat">Tidak bisa hadir langsung? Ikuti dari jauh:</p>' + sir : '') + '</section>' : '';
        var galeri = d.galeri.length ? '<section class="ud-sek ud-galeri"><h2>Galeri</h2><div class="ud-grid nk-grid">' + d.galeri.map(function (f, n) { return '<button type="button" class="nk-gf nk-rev" style="--i:' + (n % 4) + '" data-zoom="' + n + '" aria-label="Perbesar foto ' + (n + 1) + '">' + foto(f, n, 'Foto ' + (n + 1)) + '</button>'; }).join('') + '</div></section>' : '';
        var rek = d.rekening.length ? '<section class="ud-sek ud-rek"><h2>Amplop Digital</h2><p class="ud-cat">Doa restu Anda sudah sangat berarti. Jika ingin memberi tanda kasih, dapat melalui:</p>' + d.rekening.map(function (r, n) { return '<div class="ud-bank"><div><b>' + esc(r.bank) + '</b><span>a.n. ' + esc(r.atasNama) + '</span><code>' + esc(r.nomor) + '</code></div><button type="button" class="ud-btn ghost" data-salin="' + n + '">Salin</button></div>'; }).join('') + '<p class="ud-cat kecil">Informasi ini hanya ditampilkan; Dearora tidak memproses pembayaran.</p></section>' : '';
        var sudutHTML = T.sudut ? ['a', 'b', 'c', 'd'].map(function (p) { return '<span class="nk-s ' + p + '">' + T.sudut(p) + '</span>'; }).join('') : '';
        var el = layar('<div class="nk-dekor" aria-hidden="true">' + sudutHTML + '</div>' +
          '<div class="ud-hero nk-hero">' + (T.atas ? T.atas(d) : '') + '<p class="nk-kicker nk-rev">' + esc(T.kicker || 'THE WEDDING OF') + '</p>' + monogram() + '<h1 class="nk-nama nk-judul">' + namaP + '</h1>' + (a0 ? '<p class="ud-tanggal nk-rev">' + U.tgl(a0.tanggal) + '</p>' : '') + '<div class="nk-pemb nk-rev">' + (T.pembatas ? T.pembatas() : '') + '</div><p class="ud-sapa nk-rev">' + esc(d.sapaan) + '</p>' + (sapa ? '<p class="ud-kepada nk-rev">Kepada Yth. <b>' + esc(sapa) + '</b></p>' : '') + '</div>' +
          (d.kutipan ? '<section class="ud-sek nk-ayat"><p class="nk-kutip">“' + esc(d.kutipan) + '”</p></section>' : '') +
          (acr ? '<section class="ud-sek nk-mempelai nk-tokoh"><h2>' + esc(T.judulTokoh || 'Yang Berbahagia') + '</h2><div class="nk-dua">' + potret(d.tokoh, 't', 1) + '</div></section>' : '<section class="ud-sek nk-mempelai"><h2>Mempelai</h2><div class="nk-dua">' + potret(d.wanita, 'w', 1) + '<span class="nk-dan" aria-hidden="true">&amp;</span>' + potret(d.pria, 'p', 2) + '</div></section>') +
          '<section class="ud-sek"><h2>Acara</h2>' + acara + (d.dresscode ? '<p class="ud-cat">Dress code: <b>' + esc(d.dresscode) + '</b></p>' : '') + '</section>' +
          (acr ? susunan : '') + (t0 ? '<section class="ud-sek ud-hitung"><h2>' + (acr ? 'Menuju Hari H' : 'Menuju Hari Bahagia') + '</h2><div class="ud-detik nk-detik" id="udD" aria-live="off"></div></section>' : '') + (acr ? extra : kisah) + galeri + rek +
          U.rsvpHTML(d, tamu) +
          '<section class="ud-sek ud-akhir nk-akhir"><div class="nk-pemb">' + (T.pembatas ? T.pembatas() : '') + '</div><p class="ud-penutup">' + esc(d.penutup) + '</p><p class="nk-salam">Dengan penuh cinta,</p><p class="nk-nama nk-tt">' + namaP + '</p></section>', 'ud-halamanl nk-halaman');
        kelopak(el, T.partikel ? T.partikel.n || 10 : 0, T);
        // muncul perlahan saat digulir + parallax lembut pada hiasan sudut
        var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('tampil'); if (e.target.id === 'udR' && !demo && window.Balasan) window.Balasan.tandai(slug); io.unobserve(e.target); } }); }, { root: el, threshold: 0.12 }) : null;
        el.querySelectorAll('.ud-sek, .ud-kartu, .nk-rev, .nk-hero').forEach(function (n) { if (io) io.observe(n); else n.classList.add('tampil'); });
        var dek = el.querySelector('.nk-dekor'), tik = false;
        if (!S.reduce) el.addEventListener('scroll', function () { if (tik) return; tik = true; requestAnimationFrame(function () { tik = false; dek.style.setProperty('--py', Math.min(el.scrollTop * 0.05, 40).toFixed(1) + 'px'); }); }, { passive: true });
        el.querySelectorAll('[data-ics]').forEach(function (b) { b.addEventListener('click', function () { U.unduhIcs(d.judul, d.acara[Number(b.dataset.ics)]); }); });
        el.querySelectorAll('[data-salin]').forEach(function (b) { b.addEventListener('click', function () { U.salin(d.rekening[Number(b.dataset.salin)].nomor, b); }); });
        el.querySelectorAll('[data-zoom]').forEach(function (b) { b.addEventListener('click', function () { zoom(el, Number(b.dataset.zoom)); }); });
        if (t0) { var dd = el.querySelector('#udD'); var tk = function () { var s = Math.max(0, Math.floor((t0 - Date.now()) / 1000)); dd.innerHTML = s === 0 ? '<p class="ud-hari">Hari bahagia telah tiba</p>' : [['hari', Math.floor(s / 86400)], ['jam', Math.floor(s % 86400 / 3600)], ['menit', Math.floor(s % 3600 / 60)], ['detik', s % 60]].map(function (x) { return '<div><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join(''); }; tk(); timer = setInterval(tk, 1000); }
        U.rsvpPasang(el, d, { demo: demo, slug: slug, gaya: T.gayaOk || 'elegan' });
      }
      function zoom(el, n) {
        var o = document.createElement('div'); o.className = 'nk-zoom'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Foto diperbesar'); o.innerHTML = '<button type="button" class="nk-tutup-z" aria-label="Tutup">×</button><img alt="Foto ' + (n + 1) + '" src="' + esc(S.src(d.galeri[n], n)) + '">';
        el.appendChild(o); requestAnimationFrame(function () { o.classList.add('on'); }); var tutup = function () { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 300); }; o.addEventListener('click', tutup); document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { tutup(); document.removeEventListener('keydown', esc2); } });
      }
      segel();
    }
  });
  }
  window.Nikah = { reg: daftar, ada: ada };
  /* ---- tema 1: bunga (Undangan Pernikahan) ---- */
  daftar('uelegan', {
    id: 'bunga', nama: 'Undangan Pernikahan', root: 'ud-elegan', kicker: 'THE WEDDING OF', buka: 'amplop', gayaOk: 'elegan',
    tirai: function () { return B ? B.tirai(31) : ''; }, karangan: function () { return B ? B.karangan(21) : ''; }, pembatas: function () { return B ? B.pembatas() : ''; },
    pengganti: function (i) { return B ? B.mawarTunggal(i + 3) : ''; }, sdt: function () { return B ? '<svg viewBox="0 0 52 52" aria-hidden="true">' + B.mawar(26, 26, 22, ['#F9D9DF', '#F3B9C6', '#EA93A9', '#D66D8A'], 0) + '</svg>' : ''; },
    sudut: function (p) { return B ? B.sudut(p === 'a' ? 11 : p === 'b' ? 17 : p === 'c' ? 23 : 29) : ''; },
    partikel: { palet: B ? B.palet : ['#F9D9DF'], svg: function (w) { return B ? B.kelopakJatuh(w) : ''; }, n: 10 }
  });
})();
