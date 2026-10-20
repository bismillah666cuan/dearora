/* ==========================================================
   UNDANGAN INTERAKTIF (paket Invitation) — tiga gaya satu mesin: Elegan, Ceria, Hangat.
   Alur: amplop bersegel → sambutan → detail acara (peta, kalender) → hitung mundur → galeri → amplop digital → konfirmasi hadir (RSVP).
   Tanpa slide Basic. Jawaban tamu dikirim ke server (rsvpKirim); mode demo hanya mensimulasikan.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function tgl(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!m) return esc(s); var d = new Date(+m[1], +m[2] - 1, +m[3]); if (isNaN(d) || d.getMonth() !== +m[2] - 1) return esc(s); return HARI[d.getDay()] + ', ' + (+m[3]) + ' ' + BULAN[+m[2] - 1] + ' ' + m[1]; }
  function waktu(a) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a.tanggal || '')); if (!m) return null; var j = /(\d{1,2})[.:](\d{2})/.exec(String(a.jam || '')); var d = new Date(+m[1], +m[2] - 1, +m[3], j ? +j[1] : 9, j ? +j[2] : 0); return isNaN(d) ? null : d; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtIcs(d) { return d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + 'T' + p2(d.getHours()) + p2(d.getMinutes()) + '00'; }
  function escIcs(s) { return String(s || '').replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); }
  function unduhIcs(judul, a) {
    var d = waktu(a); if (!d) return; var e = new Date(d.getTime() + 2 * 3600 * 1000);
    var isi = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dearora//Undangan//ID', 'BEGIN:VEVENT', 'UID:' + fmtIcs(d) + '@dearora', 'DTSTAMP:' + fmtIcs(new Date()), 'DTSTART:' + fmtIcs(d), 'DTEND:' + fmtIcs(e),
      'SUMMARY:' + escIcs(judul + ' - ' + a.nama), 'LOCATION:' + escIcs(a.tempat + ', ' + a.alamat), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var b = new Blob([isi], { type: 'text/calendar;charset=utf-8' }), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = 'undangan.ics'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }
  function salin(teks, tombol) {
    function ok() { var t = tombol.textContent; tombol.textContent = 'Tersalin ✓'; setTimeout(function () { tombol.textContent = t; }, 1600); if (window.Suara) window.Suara.klik(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(teks).then(ok, function () { ok(); }); else { var a = document.createElement('textarea'); a.value = teks; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) { /* abaikan */ } a.remove(); ok(); }
  }
  function rsvpHTML(d, tamu) {
    var jml = ''; for (var q = 1; q <= d.rsvp.maksTamu; q++) jml += '<option value="' + q + '">' + q + ' orang</option>';
    return '' +
            '<section class="ud-sek ud-rsvp" id="udR"><h2>Konfirmasi Kehadiran</h2><p class="ud-cat">' + esc(d.rsvp.catatan || 'Mohon konfirmasi kehadiran sebelum hari acara.') + '</p>' +
            '<form class="ud-form" novalidate><label for="udN">Nama</label><input id="udN" type="text" maxlength="60" autocomplete="name" value="' + esc(tamu) + '" placeholder="Namamu">' +
            '<fieldset class="ud-status"><legend>Apakah kamu hadir?</legend><label><input type="radio" name="st" value="hadir" checked><span>Hadir</span></label><label><input type="radio" name="st" value="ragu"><span>Belum pasti</span></label><label><input type="radio" name="st" value="tidak"><span>Tidak hadir</span></label></fieldset>' +
            '<div id="udJ"><label for="udJml">Jumlah tamu</label><select id="udJml">' + jml + '</select></div><label for="udU">Ucapan atau doa (opsional)</label><textarea id="udU" rows="3" maxlength="300" placeholder="Tulis ucapan untuk pengundang"></textarea>' +
            '<input type="text" class="ud-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><p class="ud-galat" role="alert" hidden></p><button type="submit" class="ud-btn">Kirim Konfirmasi</button><p class="ud-priv">Jawabanmu hanya dilihat oleh pengundang.</p></form>' +
            '<div class="ud-terima" id="udT" role="status" hidden></div></section>';
  }
  /** Menyambungkan formulir konfirmasi hadir (kirim ke server, ingat jawaban di perangkat, ubah jawaban). */
  function rsvpPasang(el, d, o) {
    var demo = o.demo, slug = o.slug, gaya = o.gaya;
    var f = el.querySelector('.ud-form'), galat = el.querySelector('.ud-galat'), terima = el.querySelector('#udT'), simpan = null; try { simpan = JSON.parse(localStorage.getItem(KUNCI(slug))); } catch (e) { simpan = null; }
          function ringkas(h) { var st = { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Belum pasti' }[h.status]; return '<p class="ud-ok">Terima kasih, ' + esc(h.nama) + '!</p><p>Jawabanmu: <b>' + st + '</b>' + (h.status === 'hadir' ? ' · ' + h.jumlah + ' orang' : '') + '</p>' + (h.ucapan ? '<p class="ud-cat">“' + esc(h.ucapan) + '”</p>' : '') + '<button type="button" class="ud-btn ghost" id="udUbah">Ubah jawaban</button>'; }
          function tampilkan(h) { f.hidden = true; terima.hidden = false; terima.innerHTML = ringkas(h); terima.querySelector('#udUbah').addEventListener('click', function () { f.hidden = false; terima.hidden = true; el.querySelector('#udN').value = h.nama; el.querySelector('#udU').value = h.ucapan || ''; el.querySelector('#udJml').value = h.jumlah || 1; var rd = el.querySelector('input[name=st][value=' + h.status + ']'); if (rd) rd.checked = true; ubahStatus(); }); }
          function ubahStatus() { var st = el.querySelector('input[name=st]:checked').value; el.querySelector('#udJ').hidden = st === 'tidak'; }
          el.querySelectorAll('input[name=st]').forEach(function (r) { r.addEventListener('change', ubahStatus); });
          if (simpan && simpan.id) tampilkan(simpan);
          f.addEventListener('submit', function (e) {
            e.preventDefault(); galat.hidden = true; var h = { nama: el.querySelector('#udN').value.trim(), status: el.querySelector('input[name=st]:checked').value, jumlah: Number(el.querySelector('#udJml').value) || 1, ucapan: el.querySelector('#udU').value.trim() };
            if (h.nama.length < 2) { galat.textContent = 'Tulis namamu terlebih dahulu.'; galat.hidden = false; el.querySelector('#udN').focus(); return; }
            var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Mengirim…';
            function selesai(r) { h.id = r.id; h.kunci = r.kunci; h.jumlah = r.jumlah != null ? r.jumlah : h.jumlah; try { localStorage.setItem(KUNCI(slug), JSON.stringify(h)); } catch (x) { /* abaikan */ } if (window.Suara) { window.Suara.sukses(); window.Suara[{ elegan: 'piano', ceria: 'terompet', hangat: 'kenong', islami: 'lonceng', rustik: 'petik', bintang: 'kotakMusik', jawa: 'kenong', royal: 'fanfare' }[gaya]](); } S.confetti(innerWidth / 2, innerHeight * 0.5, 40, ['#F5C242', '#FF8FB1', '#7BC96F', '#fff'], { kuat: 7 }); btn.disabled = false; btn.textContent = 'Kirim Konfirmasi'; tampilkan(h); }
            if (demo) { S.jeda(function () { selesai({ id: 'demo', kunci: 'demo', jumlah: h.status === 'tidak' ? 0 : h.jumlah }); }, 500); return; }
            var kirim = { k: slug, nama: h.nama, status: h.status, jumlah: h.jumlah, ucapan: h.ucapan, website: f.querySelector('.ud-hp').value }; if (simpan && simpan.id && simpan.kunci) { kirim.id = simpan.id; kirim.kunci = simpan.kunci; }
            window.DearoraAPI.post('rsvpKirim', kirim, { timeout: 20000 }).then(function (r) { if (!r.success) { galat.textContent = r.message || 'Jawaban belum terkirim.'; galat.hidden = false; btn.disabled = false; btn.textContent = 'Kirim Konfirmasi'; return; } simpan = { id: r.data.id, kunci: r.data.kunci }; selesai(r.data); }, function () { galat.textContent = 'Koneksi bermasalah. Coba lagi.'; galat.hidden = false; btn.disabled = false; btn.textContent = 'Kirim Konfirmasi'; });
          });
          ubahStatus();
  }
  var KUNCI = function (slug) { return 'dearora:rsvp:' + slug; };
  function buat(kunci, gaya, kata) {
    S.reg(kunci, {
      nama: 'Undangan ' + kata,
      adapt: function (f, c) {
        var r = f.rsvp || {};
        return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Undangan', sapaan: f.sapaan || '', acara: (f.acara || []).map(function (a) { return { nama: a.nama, tanggal: a.tanggal, jam: a.jam, tempat: a.tempat, alamat: a.alamat, peta: a.peta || '' }; }),
          dresscode: f.dresscode || '', galeri: (f.galeri || []).slice(0, 15), rekening: (f.rekening || []).slice(0, 3), rsvp: { maksTamu: Math.max(1, Math.min(10, Number(r.maksTamu) || 4)), catatan: r.catatan || '' }, penutup: f.penutup || '' };
      },
      mulai: function (root, d) {
        var tamu = ''; try { tamu = String(new URLSearchParams(location.search).get('u') || '').replace(/[<>]/g, '').trim().slice(0, 60); } catch (e) { /* abaikan */ }
        var timer = 0, demo = !!S.konteks.demo || !window.DearoraAPI, slug = S.konteks.slug || 'demo';
        function layar(h, k) { clearInterval(timer); root.innerHTML = '<div class="sp-layar ud ud-' + gaya + ' ' + (k || '') + '">' + h + '</div>'; root.firstChild.scrollTop = 0; return root.firstChild; }
        function segel() {
          var el = layar('<div class="ud-amplop-l"><p class="ud-kicker">UNDANGAN</p><h1>' + esc(d.judul) + '</h1><div class="ud-amplop"><i class="ud-tutup" aria-hidden="true"></i><i class="ud-badan" aria-hidden="true"></i><button type="button" class="ud-segel" aria-label="Buka undangan"><span>♥</span></button></div><p class="ud-kepada">Kepada Yth.<br><b>' + esc(tamu || 'Bapak/Ibu/Saudara/i') + '</b></p><p class="ud-pet">Ketuk segel untuk membuka undangan</p></div>', 'ud-segell');
          el.querySelector('.ud-segel').addEventListener('click', function (e) { var b = e.currentTarget; b.classList.add('pecah'); el.querySelector('.ud-amplop').classList.add('buka'); b.disabled = true; if (window.Suara) window.Suara.segel(); S.dariEl(b, 26, ['#fff', '#F5C242', '#FF8FB1'], { kuat: 6 }); S.jeda(halaman, S.reduce ? 60 : 1000); });
        }
        function halaman() {
          var a0 = d.acara[0], t0 = a0 && waktu(a0);
          var acara = d.acara.map(function (a, i) {
            var peta = /^https:\/\/[^\s]{4,300}$/.test(a.peta) ? a.peta : '';
            return '<article class="ud-kartu"><h3>' + esc(a.nama) + '</h3><p class="ud-tgl">' + tgl(a.tanggal) + '</p><p class="ud-jam">' + esc(a.jam) + '</p><p class="ud-tmp"><b>' + esc(a.tempat) + '</b><br>' + esc(a.alamat) + '</p><div class="ud-aksi">' +
              (peta ? '<a class="ud-btn ghost" href="' + esc(peta) + '" target="_blank" rel="noopener noreferrer">Buka peta</a>' : '<a class="ud-btn ghost" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.tempat + ' ' + a.alamat) + '">Cari di peta</a>') +
              (waktu(a) ? '<button type="button" class="ud-btn ghost" data-ics="' + i + '">Tambah ke kalender</button>' : '') + '</div></article>';
          }).join('');
          var galeri = d.galeri.length ? '<section class="ud-sek ud-galeri"><h2>Galeri</h2><div class="ud-grid">' + d.galeri.map(function (f, i) { return '<img alt="Foto ' + (i + 1) + '" loading="lazy" src="' + esc(S.src(f, i)) + '">'; }).join('') + '</div></section>' : '';
          var rek = d.rekening.length ? '<section class="ud-sek ud-rek"><h2>Amplop Digital</h2><p class="ud-cat">Doa restu Anda sudah sangat berarti. Jika ingin memberi tanda kasih, dapat melalui:</p>' + d.rekening.map(function (r, i) { return '<div class="ud-bank"><div><b>' + esc(r.bank) + '</b><span>a.n. ' + esc(r.atasNama) + '</span><code>' + esc(r.nomor) + '</code></div><button type="button" class="ud-btn ghost" data-salin="' + i + '">Salin</button></div>'; }).join('') + '<p class="ud-cat kecil">Informasi ini hanya ditampilkan; Dearora tidak memproses pembayaran.</p></section>' : '';
          var el = layar('<div class="ud-hero"><p class="ud-kicker">KAMI MENGUNDANG</p><h1>' + esc(d.judul) + '</h1>' + (a0 ? '<p class="ud-tanggal">' + tgl(a0.tanggal) + '</p>' : '') + '<p class="ud-sapa">' + esc(d.sapaan) + '</p>' + (tamu ? '<p class="ud-kepada">Kepada Yth. <b>' + esc(tamu) + '</b></p>' : '') + '</div>' +
            '<section class="ud-sek"><h2>Acara</h2>' + acara + (d.dresscode ? '<p class="ud-cat">Dress code: <b>' + esc(d.dresscode) + '</b></p>' : '') + '</section>' +
            (t0 ? '<section class="ud-sek ud-hitung"><h2>Menuju Hari Bahagia</h2><div class="ud-detik" id="udD" aria-live="off"></div></section>' : '') + galeri + rek +
            rsvpHTML(d, tamu) +
            '<section class="ud-sek ud-akhir"><p class="ud-penutup">' + esc(d.penutup) + '</p><p class="ud-dari">Hormat kami,<br><b>' + esc(d.pengirim) + '</b></p></section>', 'ud-halamanl');
          // munculkan bagian saat digulir
          var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('tampil'); if (e.target.id === 'udR' && !demo) { if (window.Balasan) window.Balasan.tandai(slug); } } }); }, { root: el, threshold: 0.15 }) : null;
          el.querySelectorAll('.ud-sek, .ud-kartu').forEach(function (s) { if (io) io.observe(s); else s.classList.add('tampil'); });
          // kalender, salin, hitung mundur
          el.querySelectorAll('[data-ics]').forEach(function (b) { b.addEventListener('click', function () { unduhIcs(d.judul, d.acara[Number(b.dataset.ics)]); }); });
          el.querySelectorAll('[data-salin]').forEach(function (b) { b.addEventListener('click', function () { salin(d.rekening[Number(b.dataset.salin)].nomor, b); }); });
          if (t0) { var dd = el.querySelector('#udD'); var tik = function () { var s = Math.max(0, Math.floor((t0 - Date.now()) / 1000)); dd.innerHTML = s === 0 ? '<p class="ud-hari">Hari bahagia telah tiba</p>' : [['hari', Math.floor(s / 86400)], ['jam', Math.floor(s % 86400 / 3600)], ['menit', Math.floor(s % 3600 / 60)], ['detik', s % 60]].map(function (x) { return '<div><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join(''); }; tik(); timer = setInterval(tik, 1000); }
          rsvpPasang(el, d, { demo: demo, slug: slug, gaya: gaya });
        }
        segel();
      }
    });
  }
  S.ud = { tgl: tgl, waktu: waktu, unduhIcs: unduhIcs, salin: salin, rsvpHTML: rsvpHTML, rsvpPasang: rsvpPasang, KUNCI: KUNCI };
  buat('uceria', 'ceria', 'Ceria'); buat('uhangat', 'hangat', 'Hangat');
})();
