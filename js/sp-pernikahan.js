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
  function kelopak(wadah, jumlah) {
    if (S.reduce || !B) return; var h = '', i, w;
    for (i = 0; i < jumlah; i++) { w = B.palet[Math.floor(Math.random() * B.palet.length)]; h += '<span class="nk-kp" style="--x:' + Math.round(Math.random() * 100) + '%;--s:' + Math.round(12 + Math.random() * 14) + 'px;--d:' + (9 + Math.random() * 9).toFixed(1) + 's;--w:' + (-Math.random() * 14).toFixed(1) + 's;--g:' + Math.round(20 + Math.random() * 60) + 'px;--r:' + Math.round(180 + Math.random() * 400) + 'deg">' + B.kelopakJatuh(w) + '</span>'; }
    wadah.insertAdjacentHTML('beforeend', '<div class="nk-hujan" aria-hidden="true">' + h + '</div>');
  }
  /** Ledakan kelopak dari titik tengah saat amplop dibuka. */
  function ledak(wadah, x, y) {
    if (S.reduce || !B) return; var h = '', i, a, j, w;
    for (i = 0; i < 34; i++) { a = Math.random() * Math.PI * 2; j = 90 + Math.random() * 240; w = B.palet[Math.floor(Math.random() * B.palet.length)]; h += '<span class="nk-ld" style="left:' + x + 'px;top:' + y + 'px;--dx:' + Math.round(Math.cos(a) * j) + 'px;--dy:' + Math.round(Math.sin(a) * j - 80) + 'px;--r:' + Math.round(Math.random() * 720 - 360) + 'deg;--s:' + Math.round(12 + Math.random() * 14) + 'px;animation-delay:' + (Math.random() * 0.15).toFixed(2) + 's">' + B.kelopakJatuh(w) + '</span>'; }
    var el = document.createElement('div'); el.className = 'nk-ledak'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = h; wadah.appendChild(el); setTimeout(function () { el.remove(); }, 2600);
  }
  /** Rujukan foto dianggap ada hanya bila bisa diubah menjadi alamat gambar (rujukan yang tidak cocok diabaikan, bukan gambar rusak). */
  function ada(id) { return !!id && !!S.src(id, 0); }
  function foto(id, i, alt) { return ada(id) ? '<img alt="' + esc(alt || '') + '" loading="lazy" src="' + esc(S.src(id, i)) + '">' : ''; }
  S.reg('uelegan', {
    nama: 'Undangan Pernikahan',
    adapt: function (f, c) {
      var m = f.mempelai || {}, r = f.rsvp || {}, pc = String(f.judul || '').split(/\s*[&+]\s*/);
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Undangan Pernikahan', sapaan: f.sapaan || '', kutipan: f.kutipan || '', dresscode: f.dresscode || '', penutup: f.penutup || '', fotoSampul: f.fotoSampul || '',
        wanita: { nama: m.wanita || pc[0] || '', ortu: m.wanitaOrtu || '', foto: m.wanitaFoto || '' }, pria: { nama: m.pria || pc[1] || '', ortu: m.priaOrtu || '', foto: m.priaFoto || '' },
        acara: (f.acara || []).map(function (a) { return { nama: a.nama, tanggal: a.tanggal, jam: a.jam, tempat: a.tempat, alamat: a.alamat, peta: a.peta || '' }; }),
        kisah: (f.kisah || []).slice(0, 4).map(function (k) { return { waktu: k.waktu, judul: k.judul, cerita: k.cerita, foto: k.foto || '' }; }),
        galeri: (f.galeri || []).slice(0, 15), rekening: (f.rekening || []).slice(0, 3), rsvp: { maksTamu: Math.max(1, Math.min(10, Number(r.maksTamu) || 4)), catatan: r.catatan || '' } };
    },
    mulai: function (root, d) {
      var tamu = ''; try { tamu = String(new URLSearchParams(location.search).get('u') || '').replace(/[<>]/g, '').trim().slice(0, 60); } catch (e) { /* abaikan */ }
      d.galeri = d.galeri.filter(ada);
      var timer = 0, demo = !!S.konteks.demo || !window.DearoraAPI, slug = S.konteks.slug || 'demo', ml = awal(d.wanita.nama) || awal(d.judul), mr = awal(d.pria.nama);
      var inisial = ml && mr ? ml + ' <i>&amp;</i> ' + mr : esc((ml || mr || '♥'));
      var namaP = d.wanita.nama && d.pria.nama ? esc(d.wanita.nama.split(' ')[0]) + ' <i>&amp;</i> ' + esc(d.pria.nama.split(' ')[0]) : esc(d.judul).replace(/&amp;/g, '<i>&amp;</i>');
      function layar(h, k) { clearInterval(timer); root.innerHTML = '<div class="sp-layar ud ud-elegan nk ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
      function segel() {
        var el = layar('<div class="nk-tirai" aria-hidden="true">' + (B ? B.tirai(31) : '') + '</div><div class="nk-amplop-l"><p class="nk-kicker">THE WEDDING OF</p><h1 class="nk-nama">' + namaP + '</h1>' +
          '<div class="nk-amplop"><i class="nk-tutup" aria-hidden="true"></i><i class="nk-kartu-dalam" aria-hidden="true"><b>' + inisial + '</b></i><i class="nk-badan" aria-hidden="true"></i><button type="button" class="ud-segel nk-segel" aria-label="Buka undangan"><span>' + inisial + '</span></button></div>' +
          '<p class="ud-kepada">Kepada Yth.<br><b>' + esc(tamu || 'Bapak/Ibu/Saudara/i') + '</b></p><p class="ud-pet">Ketuk segel untuk membuka undangan</p></div>', 'nk-segell'); kelopak(el, 12);
        el.querySelector('.ud-segel').addEventListener('click', function (e) {
          var b = e.currentTarget, r = b.getBoundingClientRect(); b.classList.add('pecah'); b.disabled = true; el.classList.add('membuka'); el.querySelector('.nk-amplop').classList.add('buka'); if (window.Suara) window.Suara.segel();
          ledak(el, r.left + r.width / 2, r.top + r.height / 2); S.jeda(function () { el.classList.add('nk-keluar'); }, S.reduce ? 40 : 1500); S.jeda(halaman, S.reduce ? 60 : 2200);
        });
      }
      function monogram() {
        var isi = ada(d.fotoSampul) ? '<div class="nk-lengkung">' + foto(d.fotoSampul, 0, 'Foto ' + d.judul) + '</div>' : '<div class="nk-monogram"><span>' + inisial + '</span></div>';
        return '<div class="nk-karangan"><div class="nk-karangan-svg" aria-hidden="true">' + (B ? B.karangan(21) : '') + '</div><div class="nk-isi">' + isi + '</div></div>';
      }
      function potret(o, jenis, i) {
        var isi = ada(o.foto) ? foto(o.foto, i, o.nama) : (B ? B.mawarTunggal(i + 3) : '');
        return '<article class="nk-potret nk-rev"><div class="nk-bulat' + (ada(o.foto) ? '' : ' kosong') + '">' + isi + '</div><h3 class="nk-nama-k">' + esc(o.nama) + '</h3>' + (o.ortu ? '<p class="nk-ortu">' + esc(o.ortu) + '</p>' : '') + '</article>';
      }
      function halaman() {
        var a0 = d.acara[0], t0 = a0 && U.waktu(a0);
        var acara = d.acara.map(function (a, k) {
          var peta = /^https:\/\/[^\s]{4,300}$/.test(a.peta) ? a.peta : '';
          return '<article class="ud-kartu nk-kartu"><span class="nk-sdt a" aria-hidden="true">' + (B ? '<svg viewBox="0 0 52 52" aria-hidden="true">' + B.mawar(26, 26, 22, ['#F9D9DF', '#F3B9C6', '#EA93A9', '#D66D8A'], 0) + '</svg>' : '') + '</span><h3>' + esc(a.nama) + '</h3><p class="ud-tgl">' + U.tgl(a.tanggal) + '</p><p class="ud-jam">' + esc(a.jam) + '</p><p class="ud-tmp"><b>' + esc(a.tempat) + '</b><br>' + esc(a.alamat) + '</p><div class="ud-aksi">' +
            (peta ? '<a class="ud-btn ghost" href="' + esc(peta) + '" target="_blank" rel="noopener noreferrer">Buka peta</a>' : '<a class="ud-btn ghost" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.tempat + ' ' + a.alamat) + '">Cari di peta</a>') +
            (U.waktu(a) ? '<button type="button" class="ud-btn ghost" data-ics="' + k + '">Tambah ke kalender</button>' : '') + '</div></article>';
        }).join('');
        var kisah = d.kisah.length ? '<section class="ud-sek nk-kisah"><h2>Kisah Kita</h2><ol class="nk-garis">' + d.kisah.map(function (k, n) { return '<li class="nk-rev" style="--i:' + n + '"><span class="nk-titik" aria-hidden="true"></span><time>' + esc(k.waktu) + '</time><h3>' + esc(k.judul) + '</h3>' + (ada(k.foto) ? '<div class="nk-kfoto">' + foto(k.foto, n + 5, k.judul) + '</div>' : '') + '<p>' + esc(k.cerita) + '</p></li>'; }).join('') + '</ol></section>' : '';
        var galeri = d.galeri.length ? '<section class="ud-sek ud-galeri"><h2>Galeri</h2><div class="ud-grid nk-grid">' + d.galeri.map(function (f, n) { return '<button type="button" class="nk-gf nk-rev" style="--i:' + (n % 4) + '" data-zoom="' + n + '" aria-label="Perbesar foto ' + (n + 1) + '">' + foto(f, n, 'Foto ' + (n + 1)) + '</button>'; }).join('') + '</div></section>' : '';
        var rek = d.rekening.length ? '<section class="ud-sek ud-rek"><h2>Amplop Digital</h2><p class="ud-cat">Doa restu Anda sudah sangat berarti. Jika ingin memberi tanda kasih, dapat melalui:</p>' + d.rekening.map(function (r, n) { return '<div class="ud-bank"><div><b>' + esc(r.bank) + '</b><span>a.n. ' + esc(r.atasNama) + '</span><code>' + esc(r.nomor) + '</code></div><button type="button" class="ud-btn ghost" data-salin="' + n + '">Salin</button></div>'; }).join('') + '<p class="ud-cat kecil">Informasi ini hanya ditampilkan; Dearora tidak memproses pembayaran.</p></section>' : '';
        var sudutHTML = B ? ['a', 'b', 'c', 'd'].map(function (p) { return '<span class="nk-s ' + p + '">' + B.sudut(p === 'a' ? 11 : p === 'b' ? 17 : p === 'c' ? 23 : 29) + '</span>'; }).join('') : '';
        var el = layar('<div class="nk-dekor" aria-hidden="true">' + sudutHTML + '</div>' +
          '<div class="ud-hero nk-hero"><p class="nk-kicker nk-rev">THE WEDDING OF</p>' + monogram() + '<h1 class="nk-nama nk-judul">' + namaP + '</h1>' + (a0 ? '<p class="ud-tanggal nk-rev">' + U.tgl(a0.tanggal) + '</p>' : '') + '<div class="nk-pemb nk-rev">' + (B ? B.pembatas() : '') + '</div><p class="ud-sapa nk-rev">' + esc(d.sapaan) + '</p>' + (tamu ? '<p class="ud-kepada nk-rev">Kepada Yth. <b>' + esc(tamu) + '</b></p>' : '') + '</div>' +
          (d.kutipan ? '<section class="ud-sek nk-ayat"><p class="nk-kutip">“' + esc(d.kutipan) + '”</p></section>' : '') +
          '<section class="ud-sek nk-mempelai"><h2>Mempelai</h2><div class="nk-dua">' + potret(d.wanita, 'w', 1) + '<span class="nk-dan" aria-hidden="true">&amp;</span>' + potret(d.pria, 'p', 2) + '</div></section>' +
          '<section class="ud-sek"><h2>Acara</h2>' + acara + (d.dresscode ? '<p class="ud-cat">Dress code: <b>' + esc(d.dresscode) + '</b></p>' : '') + '</section>' +
          (t0 ? '<section class="ud-sek ud-hitung"><h2>Menuju Hari Bahagia</h2><div class="ud-detik nk-detik" id="udD" aria-live="off"></div></section>' : '') + kisah + galeri + rek +
          U.rsvpHTML(d, tamu) +
          '<section class="ud-sek ud-akhir nk-akhir"><div class="nk-pemb">' + (B ? B.pembatas() : '') + '</div><p class="ud-penutup">' + esc(d.penutup) + '</p><p class="nk-salam">Dengan penuh cinta,</p><p class="nk-nama nk-tt">' + namaP + '</p></section>', 'ud-halamanl nk-halaman');
        kelopak(el, 10);
        // muncul perlahan saat digulir + parallax lembut pada hiasan sudut
        var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('tampil'); if (e.target.id === 'udR' && !demo && window.Balasan) window.Balasan.tandai(slug); io.unobserve(e.target); } }); }, { root: el, threshold: 0.12 }) : null;
        el.querySelectorAll('.ud-sek, .ud-kartu, .nk-rev, .nk-hero').forEach(function (n) { if (io) io.observe(n); else n.classList.add('tampil'); });
        var dek = el.querySelector('.nk-dekor'), tik = false;
        if (!S.reduce) el.addEventListener('scroll', function () { if (tik) return; tik = true; requestAnimationFrame(function () { tik = false; dek.style.setProperty('--py', Math.min(el.scrollTop * 0.05, 40).toFixed(1) + 'px'); }); }, { passive: true });
        el.querySelectorAll('[data-ics]').forEach(function (b) { b.addEventListener('click', function () { U.unduhIcs(d.judul, d.acara[Number(b.dataset.ics)]); }); });
        el.querySelectorAll('[data-salin]').forEach(function (b) { b.addEventListener('click', function () { U.salin(d.rekening[Number(b.dataset.salin)].nomor, b); }); });
        el.querySelectorAll('[data-zoom]').forEach(function (b) { b.addEventListener('click', function () { zoom(el, Number(b.dataset.zoom)); }); });
        if (t0) { var dd = el.querySelector('#udD'); var tk = function () { var s = Math.max(0, Math.floor((t0 - Date.now()) / 1000)); dd.innerHTML = s === 0 ? '<p class="ud-hari">Hari bahagia telah tiba</p>' : [['hari', Math.floor(s / 86400)], ['jam', Math.floor(s % 86400 / 3600)], ['menit', Math.floor(s % 3600 / 60)], ['detik', s % 60]].map(function (x) { return '<div><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join(''); }; tk(); timer = setInterval(tk, 1000); }
        U.rsvpPasang(el, d, { demo: demo, slug: slug, gaya: 'elegan' });
      }
      function zoom(el, n) {
        var o = document.createElement('div'); o.className = 'nk-zoom'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Foto diperbesar'); o.innerHTML = '<button type="button" class="nk-tutup-z" aria-label="Tutup">×</button><img alt="Foto ' + (n + 1) + '" src="' + esc(S.src(d.galeri[n], n)) + '">';
        el.appendChild(o); requestAnimationFrame(function () { o.classList.add('on'); }); var tutup = function () { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 300); }; o.addEventListener('click', tutup); document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { tutup(); document.removeEventListener('keydown', esc2); } });
      }
      segel();
    }
  });
})();
