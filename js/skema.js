/* ==========================================================
   SKEMA — isian khusus per desain Premium (satu sumber kebenaran).
   Dipakai: (1) form pemesanan membuat kolom otomatis, (2) server (Skema.gs dibuat dari berkas ini)
   memvalidasi dan membersihkan data, (3) tiap desain mengubahnya menjadi tampilan.
   Tipe: teks, area, foto (rujukan "f1".."f20" ke foto yang diunggah), pilih, angka, cek,
         daftar (larik objek), daftarteks (larik teks), daftarfoto, objek.
   ========================================================== */
(function () {
  'use strict';
  var KAT_MALL = ['Cinta & Romansa', 'Doa Ulang Tahun', 'Gemas & Lucu', 'Terima Kasih', 'Pelukan & Penghibur'];
  var T = function (k, label, maks, o) { return Object.assign({ k: k, tipe: 'teks', label: label, maks: maks }, o || {}); };
  var A = function (k, label, maks, o) { return Object.assign({ k: k, tipe: 'area', label: label, maks: maks }, o || {}); };
  var F = function (k, label, o) { return Object.assign({ k: k, tipe: 'foto', label: label }, o || {}); };

  var SKEMA = {
    movie: { nama: 'Malam Film', bagian: [
      T('judul', 'Judul film', 40, { wajib: true, bawaan: 'Cerita Kita', hint: 'Mis. "Cerita Kita" atau "Kisah Dua Orang".' }),
      T('tagline', 'Kalimat pengantar film', 120, { bawaan: 'Sebuah film pendek tentang kita, dibuat khusus untukmu.' }),
      { k: 'episode', tipe: 'daftar', label: 'Episode', hint: 'Episode 1 sampai 3. Episode Final (penutup) diisi di bawah.', min: 1, maks: 3, namaItem: 'Episode', item: [
        T('judul', 'Judul episode', 50, { wajib: true, hint: 'Mis. Awal Kita Bertemu' }), T('desk', 'Deskripsi pendek', 90),
        F('foto', 'Foto latar episode'), { k: 'adegan', tipe: 'daftarteks', label: 'Narasi tiap adegan (muncul sebagai subtitle)', min: 2, maks: 4, maksTeks: 140 }] },
      { k: 'final', tipe: 'objek', label: 'Episode Final: adegan penutup', item: [
        T('judul', 'Judul final', 50, { wajib: true, bawaan: 'Yang Terbaik Belum Datang' }), F('foto', 'Foto pilihan'), A('pesan', 'Pesan personal (paling panjang)', 700, { wajib: true })] }
    ] },
    mall: { nama: 'Dearora Mall', bagian: [
      { k: 'hadiah', tipe: 'daftar', label: 'Hadiah (produk di etalase)', hint: 'Pilih 3 sampai 6 hadiah. Penerima memilih sendiri mana yang diklaim.', min: 3, maks: 6, namaItem: 'Hadiah', item: [
        T('nama', 'Nama hadiah', 40, { wajib: true, hint: 'Mis. Satu Pelukan Gratis' }),
        { k: 'kat', tipe: 'pilih', label: 'Kategori', opsi: KAT_MALL.map(function (x) { return [x, x]; }), bawaan: KAT_MALL[0] },
        T('harga', 'Harga fiktif', 40, { bawaan: 'Tak ternilai' }), { k: 'ilus', tipe: 'pilih', label: 'Ilustrasi', opsi: [['hati', 'Hati'], ['bintang', 'Bintang'], ['surat', 'Amplop']], bawaan: 'hati' },
        T('desk', 'Deskripsi singkat', 100), A('isi', 'Isi hadiah (muncul saat paket dibuka)', 300, { wajib: true })] },
      T('kupon', 'Kode kupon dekoratif', 16, { bawaan: 'LOVE100' }), A('kuponBonus', 'Pesan bonus saat kupon dipakai', 200),
      { k: 'utama', tipe: 'objek', label: 'Hadiah utama (selalu terakhir)', item: [T('judul', 'Judul', 50, { bawaan: 'Hadiah Utama: Sepucuk Surat' }), F('foto', 'Foto pilihan'), A('pesan', 'Surat atau pesan utama', 700, { wajib: true })] }
    ] },
    bestie: { nama: 'Dunia Sahabat', bagian: [
      A('pesanMisi', 'Pesan pembuka misi', 220, { wajib: true, bawaan: 'Ada banyak memori tersembunyi di dunia ini. Temukan hampir semuanya untuk membuka Pulau Harta!' }),
      { k: 'warnaBaju', tipe: 'pilih', label: 'Warna baju avatar', opsi: [['#FF6B6B', 'Merah'], ['#4B6BFF', 'Biru'], ['#35A66B', 'Hijau'], ['#FFC93C', 'Kuning'], ['#9B6BFF', 'Ungu']], bawaan: '#FF6B6B' },
      { k: 'kenangan', tipe: 'daftar', label: 'Padang Kenangan: foto dan cerita', min: 2, maks: 3, namaItem: 'Kenangan', item: [T('judul', 'Judul', 40, { wajib: true }), A('teks', 'Cerita', 200, { wajib: true }), F('foto', 'Foto')] },
      { k: 'pesanSahabat', tipe: 'daftar', label: 'Rumah Persahabatan: pesan dari sahabat', min: 2, maks: 3, namaItem: 'Pesan', item: [T('judul', 'Judul', 40, { wajib: true }), A('teks', 'Pesan', 200, { wajib: true })] },
      { k: 'peti', tipe: 'objek', label: 'Peti harta karun (pesan utama)', item: [F('foto', 'Foto pilihan'), A('pesan', 'Pesan utama', 600, { wajib: true })] }
    ] },
    feed: { nama: 'Selebstyle', bagian: [
      T('akun', 'Nama akun penerima', 24, { wajib: true, pola: '^[a-z0-9._]+$', hint: 'Huruf kecil, angka, titik, atau garis bawah. Mis. for.rani' }),
      { k: 'posts', tipe: 'daftar', label: 'Kiriman di feed', hint: 'Geser ke atas untuk melihat kiriman berikutnya. 2 sampai 5 kiriman.', min: 2, maks: 5, namaItem: 'Kiriman', item: [
        { k: 'tipe', tipe: 'pilih', label: 'Jenis kiriman', opsi: [['foto', 'Satu foto'], ['kolase', 'Kolase beberapa foto'], ['teks', 'Pesan singkat']], bawaan: 'foto' },
        F('foto', 'Foto (untuk jenis satu foto)'), { k: 'fotoKolase', tipe: 'daftarfoto', label: 'Foto kolase (untuk jenis kolase, hingga 4)', maks: 4 },
        T('teks', 'Teks (untuk jenis pesan singkat)', 120), T('caption', 'Caption', 160, { wajib: true })] },
      { k: 'komentar', tipe: 'daftar', label: 'Komentar yang muncul bertahap (opsional)', hint: 'Kosongkan untuk memakai komentar template.', min: 0, maks: 6, namaItem: 'Komentar', item: [T('nama', 'Nama akun', 20), T('teks', 'Komentar', 100)] },
      { k: 'sematan', tipe: 'objek', label: 'Kiriman "Disematkan untukmu"', item: [F('foto', 'Foto'), T('caption', 'Caption', 160, { wajib: true }), A('panjang', 'Pesan personal yang panjang', 700, { wajib: true })] },
      T('penutup', 'Kalimat penutup feed', 200, { bawaan: 'Kamu sampai di ujung feed. Tapi cerita kita belum selesai.' })
    ] },
    musik: { nama: 'Soundtrack Kita', bagian: [
      T('judul', 'Judul playlist', 60, { wajib: true, bawaan: 'Lagu-Lagu yang Mengingatkanku Padamu' }), A('deskripsi', 'Deskripsi playlist', 200),
      { k: 'lagu', tipe: 'daftar', label: 'Lagu', hint: '3 sampai 6 lagu. Urutannya membentuk alur cerita.', min: 3, maks: 6, namaItem: 'Lagu', item: [
        T('judul', 'Judul lagu', 60, { wajib: true }), T('label', 'Label kecil', 40, { hint: 'Mis. Awal Mula, Saat Aku Rindu' }), A('cerita', 'Kenapa lagu ini dipilih', 240, { wajib: true }),
        T('audio', 'Tautan audio resmi (opsional)', 300, { hint: 'https:// ... Hanya tautan yang sah. Kosongkan jika tidak ada.' })] },
      { k: 'izinAudio', tipe: 'cek', label: 'Saya memastikan tautan audio (jika ada) sah, berlisensi, atau milik saya sendiri.' },
      { k: 'tersembunyi', tipe: 'objek', label: 'Hidden Track (lagu rahasia terakhir)', item: [T('judul', 'Judul', 30, { bawaan: 'Hidden Track' }), T('label', 'Label', 40, { bawaan: 'Untukmu saja' }), A('pesan', 'Pesan khusus', 500, { wajib: true })] },
      T('penutup', 'Kalimat penutup', 160, { bawaan: 'Ada lagu yang berakhir. Tapi ada perasaan yang tinggal.' })
    ] },
    misi: { nama: 'Lastlove: Misi Cinta', bagian: [
      T('gelar', 'Gelar hero untuk penerima', 30, { wajib: true, bawaan: 'Satu-Satunya', hint: 'Mis. Satu-Satunya, Sahabat Terbaik' }),
      { k: 'misi1', tipe: 'objek', label: 'Misi 1: Pulihkan Memori (foto tersembunyi)', item: [F('foto', 'Foto yang disembunyikan'), A('pesan', 'Pesan setelah foto ditemukan', 200, { wajib: true })] },
      { k: 'kartu', tipe: 'daftarteks', label: 'Misi 2: tiga pesan tentang hal yang membuatnya istimewa', min: 3, maks: 3, maksTeks: 120 },
      { k: 'kuis', tipe: 'objek', label: 'Misi 3: pertanyaan kuis', item: [T('q', 'Pertanyaan', 120, { wajib: true }), { k: 'opsi', tipe: 'daftarteks', label: 'Pilihan jawaban', min: 2, maks: 3, maksTeks: 60 },
        { k: 'benar', tipe: 'angka', label: 'Nomor jawaban yang benar (mulai dari 1)', min: 1, maks: 3, bawaan: 1 }, T('betul', 'Respons jika benar', 120), T('salah', 'Respons jika salah (lucu)', 120)] },
      { k: 'akhir', tipe: 'objek', label: 'Hadiah final', item: [F('foto', 'Foto pilihan'), A('pesan', 'Pesan utama', 700, { wajib: true }), T('penutup', 'Kalimat kemenangan', 120, { bawaan: 'Misi selesai. Tapi kamu akan selalu jadi hadiah favoritku.' })] }
    ] }
  };
  if (typeof window !== 'undefined') window.SKEMA = SKEMA;
  if (typeof module !== 'undefined') module.exports = SKEMA;
})();
