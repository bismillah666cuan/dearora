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
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Selamat datang di kisah kita" atau "Kamu artis satu-satunya di hidupku". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('judul', 'Judul film', 40, { wajib: true, bawaan: 'Cerita Kita', hint: 'Mis. "Cerita Kita" atau "Kisah Dua Orang".' }),
      T('tagline', 'Kalimat pengantar film', 120, { bawaan: 'Sebuah film pendek tentang kita, dibuat khusus untukmu.' }),
      { k: 'episode', tipe: 'daftar', label: 'Episode', hint: 'Episode 1 sampai 3. Episode Final (penutup) diisi di bawah.', min: 1, maks: 3, namaItem: 'Episode', item: [
        T('judul', 'Judul episode', 50, { wajib: true, hint: 'Mis. Awal Kita Bertemu' }), T('desk', 'Deskripsi pendek', 90),
        F('foto', 'Foto latar episode'), { k: 'adegan', tipe: 'daftarteks', label: 'Narasi tiap adegan (muncul sebagai subtitle)', min: 2, maks: 4, maksTeks: 140 }] },
      { k: 'final', tipe: 'objek', label: 'Episode Final: adegan penutup', item: [
        T('judul', 'Judul final', 50, { wajib: true, bawaan: 'Yang Terbaik Belum Datang' }), F('foto', 'Foto pilihan'), A('pesan', 'Pesan personal (paling panjang)', 700, { wajib: true })] }
    ] },
    mall: { nama: 'Dearora Mall', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Yuk, belanja dengan penuh cinta". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      { k: 'hadiah', tipe: 'daftar', label: 'Hadiah (produk di etalase)', hint: 'Pilih 3 sampai 6 hadiah. Penerima memilih sendiri mana yang diklaim.', min: 3, maks: 6, namaItem: 'Hadiah', item: [
        T('nama', 'Nama hadiah', 40, { wajib: true, hint: 'Mis. Satu Pelukan Gratis' }),
        { k: 'kat', tipe: 'pilih', label: 'Kategori', opsi: KAT_MALL.map(function (x) { return [x, x]; }), bawaan: KAT_MALL[0] },
        T('harga', 'Harga fiktif', 40, { bawaan: 'Tak ternilai' }), { k: 'ilus', tipe: 'pilih', label: 'Ilustrasi', opsi: [['hati', 'Hati'], ['bintang', 'Bintang'], ['surat', 'Amplop']], bawaan: 'hati' },
        T('desk', 'Deskripsi singkat', 100), A('isi', 'Isi hadiah (muncul saat paket dibuka)', 300, { wajib: true })] },
      T('kupon', 'Kode kupon dekoratif', 16, { bawaan: 'LOVE100' }), A('kuponBonus', 'Pesan bonus saat kupon dipakai', 200),
      { k: 'utama', tipe: 'objek', label: 'Hadiah utama (selalu terakhir)', item: [T('judul', 'Judul', 50, { bawaan: 'Hadiah Utama: Sepucuk Surat' }), F('foto', 'Foto pilihan'), A('pesan', 'Surat atau pesan utama', 700, { wajib: true })] }
    ] },
    bestie: { nama: 'Dunia Sahabat', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Petualangan persahabatan kita dimulai sekarang". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      A('pesanMisi', 'Pesan pembuka misi', 220, { wajib: true, bawaan: 'Ada banyak memori tersembunyi di dunia ini. Temukan hampir semuanya untuk membuka Pulau Harta!' }),
      { k: 'warnaBaju', tipe: 'pilih', label: 'Warna baju avatar', opsi: [['#FF6B6B', 'Merah'], ['#4B6BFF', 'Biru'], ['#35A66B', 'Hijau'], ['#FFC93C', 'Kuning'], ['#9B6BFF', 'Ungu']], bawaan: '#FF6B6B' },
      { k: 'kenangan', tipe: 'daftar', label: 'Padang Kenangan: foto dan cerita', min: 2, maks: 3, namaItem: 'Kenangan', item: [T('judul', 'Judul', 40, { wajib: true }), A('teks', 'Cerita', 200, { wajib: true }), F('foto', 'Foto')] },
      { k: 'pesanSahabat', tipe: 'daftar', label: 'Rumah Persahabatan: pesan dari sahabat', min: 2, maks: 3, namaItem: 'Pesan', item: [T('judul', 'Judul', 40, { wajib: true }), A('teks', 'Pesan', 200, { wajib: true })] },
      { k: 'peti', tipe: 'objek', label: 'Peti harta karun (pesan utama)', item: [F('foto', 'Foto pilihan'), A('pesan', 'Pesan utama', 600, { wajib: true })] }
    ] },
    feed: { nama: 'Selebstyle', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Ada cerita baru khusus untukmu". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('akun', 'Username penerima', 30, { hint: 'Nama ini dipakai sebagai username penerima di tampilan Selebstyle. Boleh nama apa saja. Kosongkan untuk memakai nama penerima.' }),
      { k: 'posts', tipe: 'daftar', label: 'Kiriman di feed', hint: 'Geser ke atas untuk melihat kiriman berikutnya. 2 sampai 5 kiriman.', min: 2, maks: 5, namaItem: 'Kiriman', item: [
        { k: 'tipe', tipe: 'pilih', label: 'Jenis kiriman', opsi: [['foto', 'Satu foto'], ['kolase', 'Kolase beberapa foto'], ['teks', 'Pesan singkat']], bawaan: 'foto' },
        F('foto', 'Foto (untuk jenis satu foto)'), { k: 'fotoKolase', tipe: 'daftarfoto', label: 'Foto kolase (untuk jenis kolase, hingga 4)', maks: 4 },
        T('teks', 'Teks (untuk jenis pesan singkat)', 120), T('caption', 'Caption', 160, { wajib: true })] },
      { k: 'komentar', tipe: 'daftar', label: 'Komentar yang muncul bertahap (opsional)', hint: 'Kosongkan untuk memakai komentar template.', min: 0, maks: 6, namaItem: 'Komentar', item: [T('nama', 'Nama akun', 20), T('teks', 'Komentar', 100)] },
      { k: 'sematan', tipe: 'objek', label: 'Kiriman "Disematkan untukmu"', item: [F('foto', 'Foto'), T('caption', 'Caption', 160, { wajib: true }), A('panjang', 'Pesan personal yang panjang', 700, { wajib: true })] },
      T('penutup', 'Kalimat penutup feed', 200, { bawaan: 'Kamu sampai di ujung feed. Tapi cerita kita belum selesai.' })
    ] },
    musik: { nama: 'Soundtrack Kita', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Putar lagu-lagu yang mengingatkanku padamu". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('judul', 'Judul playlist', 60, { wajib: true, bawaan: 'Lagu-Lagu yang Mengingatkanku Padamu' }), A('deskripsi', 'Deskripsi playlist', 200),
      { k: 'lagu', tipe: 'daftar', label: 'Lagu', hint: '3 sampai 6 lagu. Urutannya membentuk alur cerita.', min: 3, maks: 6, namaItem: 'Lagu', item: [
        T('judul', 'Judul lagu', 60, { wajib: true }), T('label', 'Label kecil', 40, { hint: 'Mis. Awal Mula, Saat Aku Rindu' }), A('cerita', 'Kenapa lagu ini dipilih', 240, { wajib: true }),
        T('audio', 'Tautan audio resmi (opsional)', 300, { hint: 'https:// ... Hanya tautan yang sah. Kosongkan jika tidak ada.' })] },
      { k: 'izinAudio', tipe: 'cek', label: 'Saya memastikan tautan audio (jika ada) sah, berlisensi, atau milik saya sendiri.' },
      { k: 'tersembunyi', tipe: 'objek', label: 'Hidden Track (lagu rahasia terakhir)', item: [T('judul', 'Judul', 30, { bawaan: 'Hidden Track' }), T('label', 'Label', 40, { bawaan: 'Untukmu saja' }), A('pesan', 'Pesan khusus', 500, { wajib: true })] },
      T('penutup', 'Kalimat penutup', 160, { bawaan: 'Ada lagu yang berakhir. Tapi ada perasaan yang tinggal.' })
    ] },
    misi: { nama: 'Lastlove: Misi Cinta', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Misi spesial untukmu telah dimulai". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('gelar', 'Gelar hero untuk penerima', 30, { wajib: true, bawaan: 'Satu-Satunya', hint: 'Mis. Satu-Satunya, Sahabat Terbaik' }),
      { k: 'misi1', tipe: 'objek', label: 'Misi 1: Pulihkan Memori (foto tersembunyi)', item: [F('foto', 'Foto yang disembunyikan'), A('pesan', 'Pesan setelah foto ditemukan', 200, { wajib: true })] },
      { k: 'kartu', tipe: 'daftarteks', label: 'Misi 2: tiga pesan tentang hal yang membuatnya istimewa', min: 3, maks: 3, maksTeks: 120 },
      { k: 'kuis', tipe: 'objek', label: 'Misi 3: pertanyaan kuis', item: [T('q', 'Pertanyaan', 120, { wajib: true }), { k: 'opsi', tipe: 'daftarteks', label: 'Pilihan jawaban', min: 2, maks: 3, maksTeks: 60 },
        { k: 'benar', tipe: 'angka', label: 'Nomor jawaban yang benar (mulai dari 1)', min: 1, maks: 3, bawaan: 1 }, T('betul', 'Respons jika benar', 120), T('salah', 'Respons jika salah (lucu)', 120)] },
      { k: 'akhir', tipe: 'objek', label: 'Hadiah final', item: [F('foto', 'Foto pilihan'), A('pesan', 'Pesan utama', 700, { wajib: true }), T('penutup', 'Kalimat kemenangan', 120, { bawaan: 'Misi selesai. Tapi kamu akan selalu jadi hadiah favoritku.' })] }
    ] },
    romantique: { nama: 'Cinematic Romantique', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Ada sesuatu yang ingin kutulis untukmu". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      A('salam', 'Ucapan yang muncul bersama nama penerima', 200, { wajib: true, hint: 'Muncul perlahan dari tumpukan bunga, tepat di bawah nama penerima.' }),
      T('tulis', 'Kata yang diminta ditulis di pasir', 24, { hint: 'Penerima menulis kata ini dengan jarinya di atas pasir. Kosongkan untuk memakai nama penerima.' }),
      { k: 'halaman', tipe: 'daftar', label: 'Halaman romantis (foto + kata-kata)', hint: '3 sampai 6 halaman. Tiap halaman berisi satu foto dan kalimat dari kamu.', min: 3, maks: 6, namaItem: 'Halaman', item: [F('foto', 'Foto'), A('kata', 'Kata-kata di halaman ini', 160, { wajib: true })] },
      { k: 'penutup', tipe: 'objek', label: 'Pesan penutup', item: [A('pesan', 'Pesan penutup', 500, { wajib: true })] }
    ] },
    wisuda: { nama: 'Graduation Day', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Perjuanganmu layak dirayakan". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('gelar', 'Gelar atau keterangan kelulusan', 80, { wajib: true, hint: 'Mis. Sarjana Teknik · Angkatan 2026' }),
      F('fotoUtama', 'Foto wisuda utama (tampil besar di sampul)'),
      { k: 'perjalanan', tipe: 'daftar', label: 'Perjalanan dari masa belajar sampai wisuda', hint: '3 sampai 6 tonggak perjuangan, urut dari awal.', min: 3, maks: 6, namaItem: 'Tonggak', item: [
        T('waktu', 'Waktu', 24, { wajib: true, hint: 'Mis. 2022 atau Semester 5' }), T('judul', 'Judul', 50, { wajib: true, hint: 'Mis. Hari pertama kuliah' }), A('cerita', 'Ceritanya', 200, { wajib: true }), F('foto', 'Foto (opsional)')] },
      { k: 'surat', tipe: 'objek', label: 'Surat penghargaan personal', item: [T('judul', 'Judul surat', 50, { bawaan: 'Surat Penghargaan' }), A('pesan', 'Isi surat', 700, { wajib: true })] }
    ] },
    lebaran: { nama: 'Idul Fitri', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Selamat datang di rumah kami". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('salam', 'Salam pembuka di gerbang', 80, { bawaan: 'Selamat Hari Raya Idulfitri' }),
      A('ucapanKue', 'Ucapan yang muncul setelah kue lebaran jadi', 300, { wajib: true }),
      { k: 'pintu', tipe: 'daftar', label: 'Tiga pintu masjid dan doa di baliknya', hint: 'Tepat 3 pintu. Tiap pintu menyimpan satu doa.', min: 3, maks: 3, namaItem: 'Pintu', item: [T('judul', 'Judul pintu', 40, { wajib: true, hint: 'Mis. Doa untuk keluarga' }), A('doa', 'Doanya', 240, { wajib: true })] },
      A('maaf', 'Permohonan maaf dan penutup', 600, { wajib: true })
    ] },
    imlek: { nama: 'Imlek', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Semoga tahun ini penuh keberuntungan". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('salam', 'Salam utama', 40, { bawaan: 'Gong Xi Fa Cai' }),
      { k: 'harapan', tipe: 'daftar', label: 'Tiga lentera berisi pesan harapan', hint: 'Tepat 3 lentera. Penerima menyalakannya satu per satu.', min: 3, maks: 3, namaItem: 'Lentera', item: [A('teks', 'Pesan harapan', 160, { wajib: true })] },
      { k: 'hongbao', tipe: 'objek', label: 'Amplop merah (angpao)', item: [T('judul', 'Judul amplop', 40, { bawaan: 'Angpao untukmu' }), A('doa', 'Doa di dalam amplop', 300, { wajib: true })] },
      { k: 'hadiah', tipe: 'objek', label: 'Kotak hadiah simbolis', item: [T('nama', 'Nama hadiah', 40, { wajib: true, hint: 'Mis. Satu tahun penuh tawa' }), A('isi', 'Isi hadiah', 300, { wajib: true })] },
      A('penutup', 'Doa penutup setelah barongsai', 400, { wajib: true })
    ] },
    mancing: { nama: 'Fish It', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Yuk, kita lihat kamu dapat apa hari ini". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      { k: 'kenangan', tipe: 'daftar', label: 'Memory Bay: hasil pancingan berupa kenangan', hint: '2 sampai 3 kenangan. Tiap pancingan membuka satu.', min: 2, maks: 3, namaItem: 'Kenangan', item: [T('judul', 'Judul', 40, { wajib: true }), A('teks', 'Ceritanya', 200, { wajib: true }), F('foto', 'Foto (opsional)')] },
      { k: 'pesanManis', tipe: 'daftar', label: 'Love Lagoon: botol berisi pesan manis', hint: '2 sampai 3 pesan manis.', min: 2, maks: 3, namaItem: 'Pesan', item: [T('judul', 'Judul', 40), A('teks', 'Pesannya', 200, { wajib: true })] },
      { k: 'peti', tipe: 'objek', label: 'Treasure Cove: peti harta karun (hadiah utama)', item: [F('foto', 'Foto pilihan'), A('pesan', 'Surat atau pesan utama', 600, { wajib: true })] }
    ] },
    awards: { nama: 'Dearora Awards', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Malam ini kamu jadi bintang utamanya". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('acara', 'Nama acara penghargaan', 40, { bawaan: 'Dearora Awards', hint: 'Mis. Malam Penghargaan Sahabat Terbaik.' }),
      { k: 'penghargaan', tipe: 'daftar', label: 'Kategori penghargaan', hint: '3 sampai 5 penghargaan. Penerima menjadi pemenang di setiap kategori.', min: 3, maks: 5, namaItem: 'Penghargaan', item: [T('judul', 'Nama penghargaan', 50, { wajib: true, hint: 'Mis. Sahabat Paling Sabar' }), A('alasan', 'Alasan menang', 200, { wajib: true })] },
      { k: 'pidato', tipe: 'objek', label: 'Pidato kemenangan', item: [A('pesan', 'Isi pidato (pesan utama)', 600, { wajib: true })] }
    ] },
    resep: { nama: 'Resep Kasih Sayang', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Hari ini aku masak sesuatu yang spesial untuk Ibu". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('judul', 'Judul kartu resep', 60, { wajib: true, bawaan: 'Resep Kasih Sayang' }),
      { k: 'bahan', tipe: 'daftar', label: 'Bahan-bahan', hint: '3 sampai 6 bahan. Tiap bahan membuka satu kenangan atau ucapan terima kasih.', min: 3, maks: 6, namaItem: 'Bahan', item: [T('nama', 'Takaran dan bahan', 40, { wajib: true, hint: 'Mis. 2 sendok kesabaran' }), A('cerita', 'Kenangan atau terima kasih', 200, { wajib: true }), F('foto', 'Foto (opsional)')] },
      { k: 'hidangan', tipe: 'objek', label: 'Hidangan jadi dan pesan utama', item: [T('nama', 'Nama hidangan', 40, { bawaan: 'Semangkuk Kasih Sayang' }), A('pesan', 'Pesan utama', 600, { wajib: true })] }
    ] },
    rumah: { nama: 'Rumah Kenangan', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Ketuk pintunya, banyak kenangan di dalam". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('judul', 'Judul rumah', 60, { bawaan: 'Rumah Kenangan' }),
      { k: 'ruang', tipe: 'daftar', label: 'Ruangan dan kenangannya', hint: '3 sampai 5 ruangan. Tiap ruangan punya satu benda yang menyimpan kenangan.', min: 3, maks: 5, namaItem: 'Ruangan', item: [T('nama', 'Nama ruangan', 30, { wajib: true, hint: 'Mis. Dapur, Kamar, Taman' }), T('benda', 'Benda yang diketuk', 30, { hint: 'Mis. Toples kue' }), T('judul', 'Judul kenangan', 50, { wajib: true }), A('cerita', 'Ceritanya', 200, { wajib: true }), F('foto', 'Foto (opsional)')] },
      { k: 'loteng', tipe: 'objek', label: 'Loteng: pesan utama', item: [F('foto', 'Foto pilihan'), A('pesan', 'Pesan utama', 600, { wajib: true })] }
    ] },
    brankas: { nama: 'Brankas Rahasia', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Hanya kamu yang bisa membuka brankas ini". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      T('judul', 'Judul brankas', 40, { bawaan: 'Brankas Rahasia' }),
      { k: 'ruangan', tipe: 'daftar', label: 'Tiga ruangan dan teka-tekinya', hint: 'Tepat 3 ruangan. Jawaban hanya disimpan di server dan tidak tampil di halaman penerima.', min: 3, maks: 3, namaItem: 'Ruangan', item: [
        T('nama', 'Nama ruangan', 30, { wajib: true, hint: 'Mis. Ruang Kenangan' }), A('teka', 'Teka-teki atau pertanyaan', 160, { wajib: true, hint: 'Mis. Tanggal berapa kita pertama bertemu?' }),
        T('jawaban', 'Jawaban yang benar', 40, { wajib: true, hint: 'Huruf besar/kecil dan spasi diabaikan.' }), T('petunjuk', 'Petunjuk (opsional)', 80), A('pesan', 'Pesan yang terbuka setelah benar', 200, { wajib: true })] },
      { k: 'akhir', tipe: 'objek', label: 'Isi brankas (hadiah utama)', item: [F('foto', 'Foto pilihan'), A('pesan', 'Pesan utama', 600, { wajib: true })] }
    ] },
    hujan: { nama: 'Hujan Reda', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Ada yang ingin kukatakan, kalau kamu mau mendengarnya". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      { k: 'pesan', tipe: 'daftar', label: 'Kalimat di balik kaca berembun', hint: '3 sampai 5 kalimat. Penerima mengusap kaca untuk membacanya, dan hujan mereda pelan-pelan.', min: 3, maks: 5, namaItem: 'Kalimat', item: [A('teks', 'Kalimat', 160, { wajib: true })] },
      { k: 'penutup', tipe: 'objek', label: 'Penjelasan dan permintaan maaf (setelah hujan reda)', item: [A('pesan', 'Isi penutup', 600, { wajib: true })] }
    ] },
    lahir: { nama: 'Pengumuman Kelahiran', bagian: [
      A('transisi', 'Kalimat pengantar sebelum desain dimulai', 160, { wajib: true, hint: 'Mis. "Ada kabar bahagia untukmu". Ini tampil di layar penyambung sebelum masuk ke desain.' }),
      A('kabar', 'Kabar bahagia (tersembunyi di balik kartu gosok)', 160, { wajib: true, hint: 'Mis. "Kami akan menjadi orang tua!"' }),
      F('foto', 'Foto di kartu (mis. foto USG atau foto berdua)'),
      T('tanggal', 'Perkiraan hari lahir (opsional)', 10, { pola: '^\\d{4}-\\d{2}-\\d{2}$', hint: 'Format tahun-bulan-tanggal, mis. 2027-03-15. Dipakai untuk hitung mundur.' }),
      { k: 'fakta', tipe: 'daftar', label: 'Balon kejutan: fakta tentang si kecil', hint: '3 sampai 5 balon. Tiap balon yang dipecahkan membuka satu fakta.', min: 3, maks: 5, namaItem: 'Balon', item: [T('judul', 'Judul fakta', 30, { wajib: true, hint: 'Mis. Nama, Jenis kelamin, Perkiraan lahir' }), T('isi', 'Isinya', 80, { wajib: true })] },
      A('penutup', 'Pesan penutup', 400, { wajib: true })
    ] }
  };

  /* Contoh isian: dipakai tombol "Isi dengan contoh" supaya pembeli tinggal mengubah (foto dipilih sendiri). */
  SKEMA.movie.contoh = { transisi: 'Selamat datang di kisah kita. Kamu adalah artis satu-satunya di hidupku.', judul: 'Cerita Kita', episode: [
    { judul: 'Awal Kita Bertemu', desk: 'Hari ketika semuanya dimulai.', foto: '', adegan: ['Semuanya berawal dari hari yang biasa saja.', 'Kamu datang tanpa rencana, dan duniaku ikut berubah.'] },
    { judul: 'Kenangan Favorit Kita', desk: 'Potongan hari yang tak mau kulupakan.', foto: '', adegan: ['Ada tawa yang pecah di tempat yang paling tidak pantas.', 'Kalau ada tombol ulang, aku memilih hari-hari itu.'] }],
    final: { judul: 'Yang Terbaik Belum Datang', foto: '', pesan: 'Terima kasih sudah menjadi tokoh utama di cerita ini. Banyak adegan yang belum kita tulis, dan aku ingin menulisnya bersamamu.' } };
  SKEMA.mall.contoh = { transisi: 'Hari ini toko buka khusus untukmu. Yuk, belanja dengan penuh cinta.', hadiah: [
    { nama: 'Satu Pelukan Gratis', kat: 'Pelukan & Penghibur', harga: 'Tukar kapan saja', ilus: 'hati', desk: 'Berlaku di mana saja, tanpa syarat.', isi: 'Kapan pun kamu butuh pelukan, tinggal bilang. Tidak ada batas penukaran.' },
    { nama: 'Seribu Ciuman', kat: 'Cinta & Romansa', harga: 'Tak ternilai', ilus: 'bintang', desk: 'Dikirim bertahap, sebanyak yang kamu mau.', isi: 'Kupon ini bisa kamu tukar satu per satu. Stoknya bertambah setiap kamu tersenyum.' },
    { nama: 'Surat Cinta Kecil', kat: 'Cinta & Romansa', harga: 'Gratis selamanya', ilus: 'surat', desk: 'Sepucuk surat pendek yang ditulis dari hati.', isi: 'Hari-hariku lebih ringan karena ada kamu. Itu saja, tapi itu banyak.' }],
    utama: { judul: 'Hadiah Utama: Sepucuk Surat', foto: '', pesan: 'Semua hadiah tadi hanya pembuka. Hadiah yang sebenarnya: aku bersyukur sekali mengenalmu.' } };
  SKEMA.bestie.contoh = { transisi: 'Petualangan persahabatan kita dimulai sekarang. Siap menemukan semua kenangan?', pesanMisi: 'Ada banyak memori tersembunyi di dunia ini. Temukan hampir semuanya untuk membuka Pulau Harta!',
    kenangan: [{ judul: 'Hari pertama kita', teks: 'Waktu kita masih canggung, siapa sangka jadi sedekat ini.', foto: '' }, { judul: 'Tertawa sampai lupa waktu', teks: 'Itu salah satu hari terbaikku.', foto: '' }],
    pesanSahabat: [{ judul: 'Untuk hari yang berat', teks: 'Kalau kamu lelah, ingat ada aku yang siap mendengarkan.' }, { judul: 'Hal yang kusyukuri', teks: 'Terima kasih sudah menjadi sahabat yang tulus.' }],
    peti: { foto: '', pesan: 'Harta karun yang sesungguhnya bukan di peti ini. Harta karun itu kamu.' } };
  SKEMA.feed.contoh = { transisi: 'Ada cerita baru khusus untukmu. Geser, dan lihat apa yang kusimpan.', posts: [
    { tipe: 'foto', foto: '', fotoKolase: [], teks: '', caption: 'Hari itu kita belum tahu bakal sedekat ini. Kenangan yang selalu kuputar ulang.' },
    { tipe: 'teks', foto: '', fotoKolase: [], teks: 'Kamu itu orang yang bikin hari-hari biasa terasa seru.', caption: 'Pesan singkat, tapi sungguh-sungguh.' }],
    komentar: [{ nama: 'sahabat.lama', teks: 'Kamu berhak bahagia.' }, { nama: 'tim.hore', teks: 'Selamat ya, kamu hebat!' }],
    sematan: { foto: '', caption: 'Dari semua orang di dunia ini, aku bersyukur mengenalmu.', panjang: 'Kalau kamu membaca sampai sini, aku ingin bilang: terima kasih sudah menjadi kamu apa adanya. Semoga semua hal baik menemukanmu.' } };
  SKEMA.musik.contoh = { transisi: 'Ada lagu-lagu yang mengingatkanku padamu. Putar satu per satu.', deskripsi: 'Setiap lagu di sini adalah satu potongan cerita kita.',
    lagu: [{ judul: 'Awal Mula', label: 'The Beginning', cerita: 'Lagu ini mengingatkanku pada hari pertama kita ngobrol.', audio: '' }, { judul: 'Kenangan Favorit Kita', label: 'Our Favorite Memory', cerita: 'Malam saat kita bicara berjam-jam sampai lupa waktu.', audio: '' }, { judul: 'Saat Aku Rindu', label: 'When I Miss You', cerita: 'Setiap jarak terasa jauh, aku memutar lagu ini.', audio: '' }],
    tersembunyi: { judul: 'Hidden Track', label: 'Untukmu saja', pesan: 'Ini lagu yang tidak pernah kuberitahukan ke siapa pun. Isinya sederhana: terima kasih sudah ada.' } };
  SKEMA.misi.contoh = { transisi: 'Misi spesial untukmu telah dimulai. Hanya kamu yang bisa menyelesaikannya.', misi1: { foto: '', pesan: 'Memori berhasil dipulihkan: hari itu kamu tertawa lepas.' },
    kartu: ['Kamu peduli tanpa pernah minta dilihat.', 'Kamu bikin orang lain merasa aman dan diterima.', 'Kamu bertahan, bahkan saat hari terasa berat.'],
    kuis: { q: 'Siapa yang paling beruntung mengenalmu?', opsi: ['Aku, tentu saja', 'Semua orang di sekitarmu', 'Dunia ini'], benar: 1, betul: 'Tepat sekali. Aku pemenangnya.', salah: 'Jawaban menarik, tapi aku tetap yang paling beruntung. Coba lagi!' },
    akhir: { foto: '', pesan: 'Semua misi tadi hanya cara untuk bilang satu hal: kamu berharga, dan aku sangat bersyukur ada kamu.', penutup: 'Misi selesai. Tapi kamu akan selalu jadi hadiah favoritku.' } };

  SKEMA.romantique.contoh = { transisi: 'Ada sesuatu yang ingin kutulis untukmu, pelan-pelan, seperti pasir yang menyimpan jejak.', salam: 'Di antara semua bunga, kamu yang paling kuingat. Selamat datang di halaman cinta kita.',
    halaman: [{ foto: '', kata: 'Aku jatuh cinta bukan karena kamu sempurna, tapi karena bersamamu semuanya terasa pulang.' }, { foto: '', kata: 'Setiap hari bersamamu adalah adegan yang tidak ingin kuakhiri.' }, { foto: '', kata: 'Kalau waktu bisa melambat, aku ingin melambat di saat ini.' }],
    penutup: { pesan: 'Terima kasih sudah menjadi rumah untuk hatiku. Aku mencintaimu, hari ini dan di semua hari setelahnya.' } };
  SKEMA.wisuda.contoh = { transisi: 'Perjuanganmu layak dirayakan, dari halaman pertama sampai hari ini.', gelar: 'Sarjana · Angkatan 2026',
    perjalanan: [{ waktu: '2022', judul: 'Hari pertama kuliah', cerita: 'Dengan tas baru dan jantung berdebar, kamu memulai perjalanan panjang ini.', foto: '' }, { waktu: 'Semester 5', judul: 'Masa-masa tersulit', cerita: 'Begadang, revisi, dan ragu. Tapi kamu tidak pernah benar-benar menyerah.', foto: '' }, { waktu: 'Hari sidang', judul: 'Berdiri dengan berani', cerita: 'Kamu menjawab satu per satu, dan kami semua bangga.', foto: '' }],
    surat: { judul: 'Surat Penghargaan', pesan: 'Selamat atas kelulusanmu. Terima kasih sudah berjuang begitu keras. Apa pun yang menantimu, ingatlah bahwa kamu sudah membuktikan dirimu mampu.' } };
  SKEMA.lebaran.contoh = { transisi: 'Selamat datang di rumah kami. Silakan masuk, ada yang menunggumu di serambi.', salam: 'Selamat Hari Raya Idulfitri', ucapanKue: 'Kue lebaran ini kubuat dengan banyak doa. Semoga hari rayamu semanis kue ini dan selalu ditemani orang-orang tersayang.',
    pintu: [{ judul: 'Doa untuk keluarga', doa: 'Semoga keluargamu selalu sehat, rukun, dan dilimpahi keberkahan.' }, { judul: 'Doa untuk rezeki', doa: 'Semoga rezekimu lapang, halal, dan membawa ketenangan.' }, { judul: 'Doa untuk hati', doa: 'Semoga hatimu selalu damai, dan segala yang kamu cita-citakan dimudahkan.' }],
    maaf: 'Di hari yang fitri ini, aku mohon maaf lahir dan batin atas segala salah, sengaja maupun tidak. Terima kasih sudah menjadi bagian dari hari-hariku. Taqabbalallahu minna wa minkum.' };
  SKEMA.imlek.contoh = { transisi: 'Semoga tahun ini penuh keberuntungan, tawa, dan kabar baik untukmu.', salam: 'Gong Xi Fa Cai',
    harapan: [{ teks: 'Semoga kesehatanmu selalu terjaga sepanjang tahun.' }, { teks: 'Semoga rezekimu mengalir deras dan usahamu lancar.' }, { teks: 'Semoga orang-orang tersayang selalu ada di sekelilingmu.' }],
    hongbao: { judul: 'Angpao untukmu', doa: 'Di dalam amplop ini ada doa: semoga setiap langkahmu dilancarkan dan setiap harapanmu terwujud.' }, hadiah: { nama: 'Satu tahun penuh tawa', isi: 'Hadiah simbolisku: waktu untuk mendengarkan, tertawa, dan merayakan bersamamu sepanjang tahun.' },
    penutup: 'Terima kasih sudah mengetuk barongsai. Semoga koin-koin emas ini menjadi doa keberuntungan untukmu sepanjang tahun. Gong Xi Fa Cai!' };
  SKEMA.mancing.contoh = { transisi: 'Yuk, kita lihat kamu dapat apa hari ini. Siapkan kailnya!',
    kenangan: [{ judul: 'Hari pertama kita', teks: 'Waktu itu kita belum tahu akan sedekat ini.', foto: '' }, { judul: 'Tertawa tanpa alasan', teks: 'Itu salah satu hari terbaik yang kuingat.', foto: '' }],
    pesanManis: [{ judul: 'Untukmu', teks: 'Kamu itu orang yang bikin hari biasa jadi seru.' }, { judul: 'Pesan di botol', teks: 'Terima kasih sudah selalu ada, bahkan di hari yang berat.' }],
    peti: { foto: '', pesan: 'Harta karun yang sesungguhnya bukan isi peti ini. Harta karunku adalah kamu, dan semua hari yang kita lalui bersama.' } };

  SKEMA.awards.contoh = { transisi: 'Malam ini kamu jadi bintang utamanya. Karpet merah sudah digelar.', acara: 'Dearora Awards',
    penghargaan: [{ judul: 'Sahabat Paling Sabar', alasan: 'Karena kamu selalu mendengarkan, bahkan saat ceritaku diulang untuk kesekian kali.' }, { judul: 'Paling Jago Bikin Ketawa', alasan: 'Hari terburukku pun jadi lebih ringan setiap kamu mulai bercanda.' }, { judul: 'Teman Terbaik Sepanjang Masa', alasan: 'Karena kamu hadir di hari-hari yang paling penting dan yang paling biasa.' }],
    pidato: { pesan: 'Terima kasih sudah menjadi kamu. Piala ini hanya simbol kecil dari rasa syukurku karena mengenalmu. Terima kasih untuk semuanya, dan selamat!' } };
  SKEMA.resep.contoh = { transisi: 'Hari ini aku memasak sesuatu yang spesial, dengan bahan yang paling kuingat darimu.', judul: 'Resep Kasih Sayang',
    bahan: [{ nama: '2 sendok kesabaran', cerita: 'Ibu tidak pernah marah lama-lama, bahkan saat aku bandel.', foto: '' }, { nama: 'Sejumput doa', cerita: 'Setiap pagi doa Ibu mengiringi langkahku sebelum aku sadar.', foto: '' }, { nama: 'Secangkir pelukan hangat', cerita: 'Pelukan Ibu selalu jadi tempat pulang paling aman.', foto: '' }],
    hidangan: { nama: 'Semangkuk Kasih Sayang', pesan: 'Resep ini tidak akan pernah persis sama dengan yang Ibu berikan, karena kasih sayang Ibu tak punya takaran. Terima kasih untuk semuanya, Bu.' } };
  SKEMA.rumah.contoh = { transisi: 'Ketuk pintunya. Banyak kenangan yang tersimpan di dalam rumah ini.', judul: 'Rumah Kenangan',
    ruang: [{ nama: 'Dapur', benda: 'Toples kue', judul: 'Kue buatan Ibu', cerita: 'Aroma kue dari dapur ini yang paling kuingat setiap pulang sekolah.', foto: '' }, { nama: 'Kamar', benda: 'Selimut tebal', judul: 'Cerita sebelum tidur', cerita: 'Dulu aku tidur diiringi cerita yang tak pernah sama setiap malamnya.', foto: '' }, { nama: 'Taman', benda: 'Ayunan tua', judul: 'Sore di ayunan', cerita: 'Tawa kita sore itu masih terdengar jelas sampai sekarang.', foto: '' }],
    loteng: { foto: '', pesan: 'Semua ruangan di rumah ini punya tempat di hatiku. Terima kasih sudah membuat rumah ini penuh cinta, dan aku selalu ingin pulang.' } };

  SKEMA.brankas.contoh = { transisi: 'Hanya kamu yang bisa membuka brankas ini. Jawab tiga teka-teki dariku.', judul: 'Brankas Rahasia',
    ruangan: [{ nama: 'Ruang Kenangan', teka: 'Di kota mana kita pertama kali bertemu?', jawaban: 'bandung', petunjuk: 'Kota kembang.', pesan: 'Benar. Kota itu masih jadi tempat favoritku karena kamu.' }, { nama: 'Ruang Rasa', teka: 'Makanan apa yang selalu kita pesan bersama?', jawaban: 'nasi goreng', petunjuk: 'Ada telurnya.', pesan: 'Tepat. Rasa sederhana yang selalu terasa istimewa kalau bersamamu.' }, { nama: 'Ruang Janji', teka: 'Angka berapa yang kita sebut sebagai angka keberuntungan?', jawaban: '7', petunjuk: 'Satu digit.', pesan: 'Benar. Dan aku percaya kita memang beruntung.' }],
    akhir: { foto: '', pesan: 'Isi brankas ini bukan emas atau permata. Isinya aku: terima kasih, janji, dan rasa sayang yang tidak pernah habis.' } };
  SKEMA.hujan.contoh = { transisi: 'Ada yang ingin kukatakan, kalau kamu mau mendengarnya.',
    pesan: [{ teks: 'Aku salah, dan aku tahu aku menyakitimu.' }, { teks: 'Aku tidak mencari pembenaran, hanya ingin kamu tahu aku menyesal.' }, { teks: 'Kamu pantas dihargai, dan aku ingin belajar melakukannya dengan lebih baik.' }],
    penutup: { pesan: 'Hujan pun akhirnya reda, dan aku berharap amarah dan kecewa itu ikut reda pelan-pelan. Aku tidak meminta kamu langsung memaafkan, tapi aku akan terus berusaha memperbaikinya. Maafkan aku.' } };
  SKEMA.lahir.contoh = { transisi: 'Ada kabar bahagia untukmu. Siapkan hati yang hangat.', kabar: 'Kami akan menjadi orang tua! Satu anggota keluarga baru sedang dalam perjalanan.', foto: '', tanggal: '2027-03-15',
    fakta: [{ judul: 'Nama panggilan', isi: 'Si Kecil (nama lengkapnya kejutan)' }, { judul: 'Perkiraan lahir', isi: 'Pertengahan Maret' }, { judul: 'Yang kami harapkan', isi: 'Sehat, bahagia, dan penuh tawa' }],
    penutup: 'Terima kasih sudah menjadi bagian dari perjalanan kami. Doakan kami, dan kamu akan jadi salah satu orang pertama yang menyambut si kecil.' };

  /* ===== Paket Invitation: tiga gaya berbagi satu skema ===== */
  function undanganBagian() {
    return [
      T('judul', 'Judul undangan', 60, { wajib: true, hint: 'Mis. Pernikahan Rani & Dimas, atau Ulang Tahun ke-7 Nara.' }),
      A('sapaan', 'Kalimat sambutan', 220, { wajib: true, hint: 'Mis. Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.' }),
      { k: 'acara', tipe: 'daftar', label: 'Acara', hint: '1 sampai 3 acara (mis. akad dan resepsi). Acara pertama dipakai untuk hitung mundur.', min: 1, maks: 3, namaItem: 'Acara', item: [
        T('nama', 'Nama acara', 40, { wajib: true, hint: 'Mis. Akad Nikah' }), T('tanggal', 'Tanggal', 10, { wajib: true, pola: '^\\d{4}-\\d{2}-\\d{2}$', hint: 'Format tahun-bulan-tanggal, mis. 2027-03-15.' }),
        T('jam', 'Jam', 24, { wajib: true, hint: 'Mis. 10.00 WIB atau 10.00–12.00 WIB' }), T('tempat', 'Nama tempat', 60, { wajib: true }), A('alamat', 'Alamat', 160, { wajib: true }),
        T('peta', 'Tautan Google Maps (opsional)', 300, { pola: '^https://[^\\s]{4,290}$', hint: 'Salin tautan dari Google Maps, diawali https://' })] },
      T('dresscode', 'Dress code (opsional)', 80, { hint: 'Mis. Nuansa pastel' }),
      { k: 'galeri', tipe: 'daftarfoto', label: 'Galeri foto (opsional, hingga 15)', maks: 15 },
      { k: 'rekening', tipe: 'daftar', label: 'Amplop digital (opsional)', hint: 'Hingga 3 rekening atau e-wallet. Hanya ditampilkan dengan tombol salin; Dearora tidak memproses pembayaran.', min: 0, maks: 3, namaItem: 'Rekening', item: [T('bank', 'Bank atau e-wallet', 30, { wajib: true }), T('nomor', 'Nomor', 40, { wajib: true }), T('atasNama', 'Atas nama', 50, { wajib: true })] },
      { k: 'rsvp', tipe: 'objek', label: 'Konfirmasi kehadiran', item: [{ k: 'maksTamu', tipe: 'angka', label: 'Maksimal jumlah tamu per jawaban', min: 1, maks: 10, bawaan: 4 }, T('catatan', 'Catatan di formulir', 160, { bawaan: 'Mohon konfirmasi kehadiran sebelum hari acara.' })] },
      A('penutup', 'Kalimat penutup', 300, { wajib: true })
    ];
  }
  /* Undangan Pernikahan: bagian khusus mempelai, kutipan, kisah; foto semuanya opsional (tanpa foto → hiasan bunga). */
  function nikahBagian() {
    var acara = undanganBagian().filter(function (b) { return b.k === 'acara'; })[0], galeri = { k: 'galeri', tipe: 'daftarfoto', label: 'Galeri foto (opsional, hingga 15)', maks: 15 };
    var rek = undanganBagian().filter(function (b) { return b.k === 'rekening'; })[0], rsvp = undanganBagian().filter(function (b) { return b.k === 'rsvp'; })[0];
    return [
      T('judul', 'Nama pasangan (tampil besar)', 40, { wajib: true, hint: 'Mis. Rani & Dimas' }),
      A('sapaan', 'Kalimat sambutan', 220, { wajib: true, hint: 'Mis. Dengan memohon rahmat dan ridho-Nya, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.' }),
      A('kutipan', 'Kutipan atau ayat (opsional)', 320, { hint: 'Mis. "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup..."' }),
      T('dresscode', 'Dress code (opsional)', 80, { hint: 'Mis. Nuansa pastel' }),
      F('fotoSampul', 'Foto utama pasangan (opsional)'),
      A('penutup', 'Kalimat penutup', 300, { wajib: true }),
      { k: 'mempelai', tipe: 'objek', label: 'Mempelai', item: [
        T('wanita', 'Nama mempelai wanita', 50, { wajib: true }), T('wanitaOrtu', 'Putri dari (opsional)', 100, { hint: 'Mis. Bapak Hendra & Ibu Sari' }), F('wanitaFoto', 'Foto mempelai wanita (opsional)'),
        T('pria', 'Nama mempelai pria', 50, { wajib: true }), T('priaOrtu', 'Putra dari (opsional)', 100, { hint: 'Mis. Bapak Budi & Ibu Ani' }), F('priaFoto', 'Foto mempelai pria (opsional)')] },
      acara,
      { k: 'kisah', tipe: 'daftar', label: 'Kisah kita (opsional)', hint: 'Hingga 4 momen perjalanan cinta, ditampilkan sebagai garis waktu.', min: 0, maks: 4, namaItem: 'Momen', item: [T('waktu', 'Kapan', 30, { wajib: true, hint: 'Mis. 2019 atau Maret 2021' }), T('judul', 'Judul momen', 40, { wajib: true }), A('cerita', 'Ceritanya', 200, { wajib: true }), F('foto', 'Foto (opsional)')] },
      galeri, rek, rsvp
    ];
  }
  SKEMA.uelegan = { nama: 'Undangan Pernikahan', bagian: nikahBagian() };
  SKEMA.uceria = { nama: 'Undangan Ceria', bagian: undanganBagian() };
  SKEMA.uhangat = { nama: 'Undangan Hangat', bagian: undanganBagian() };
  SKEMA.uelegan.contoh = { judul: 'Rani & Dimas', sapaan: 'Dengan memohon rahmat dan ridho-Nya, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu di hari bahagia kami.',
    kutipan: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu merasa tenteram kepadanya.', dresscode: 'Nuansa pastel', fotoSampul: '',
    penutup: 'Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih atas doa dan restunya.',
    mempelai: { wanita: 'Rani Putri Lestari', wanitaOrtu: 'Putri dari Bapak Hendra & Ibu Sari', wanitaFoto: '', pria: 'Dimas Aditya Pratama', priaOrtu: 'Putra dari Bapak Budi & Ibu Ani', priaFoto: '' },
    acara: [{ nama: 'Akad Nikah', tanggal: '2027-03-15', jam: '09.00 WIB', tempat: 'Masjid Al-Ikhlas', alamat: 'Jl. Melati No. 12, Bandung', peta: '' }, { nama: 'Resepsi', tanggal: '2027-03-15', jam: '11.00–14.00 WIB', tempat: 'Gedung Serbaguna Asri', alamat: 'Jl. Pemuda No. 3, Bandung', peta: '' }],
    kisah: [{ waktu: '2019', judul: 'Pertama Bertemu', cerita: 'Di sebuah acara kampus, kami saling melempar senyum untuk pertama kalinya.', foto: '' }, { waktu: '2022', judul: 'Menjadi Kita', cerita: 'Setelah bertahun-tahun berteman, kami memutuskan berjalan bersama.', foto: '' }, { waktu: '2026', judul: 'Lamaran', cerita: 'Dengan restu keluarga, kami melangkah ke jenjang yang lebih serius.', foto: '' }],
    galeri: [], rekening: [{ bank: 'BCA', nomor: '1234567890', atasNama: 'Rani Putri' }], rsvp: { maksTamu: 4, catatan: 'Mohon konfirmasi kehadiran sebelum 1 Maret 2027.' } };
  SKEMA.uceria.contoh = { judul: 'Ulang Tahun ke-7 Nara', sapaan: 'Yuk, rayakan hari spesial Nara bersama! Ada kue, permainan, dan banyak tawa menunggu.',
    acara: [{ nama: 'Pesta Ulang Tahun', tanggal: '2027-05-22', jam: '14.00–17.00 WIB', tempat: 'Rumah Nara', alamat: 'Jl. Kenanga No. 8, Bekasi', peta: '' }],
    dresscode: 'Pakai baju warna-warni', galeri: [], rekening: [], rsvp: { maksTamu: 4, catatan: 'Kabari kami ya supaya kuenya cukup!' }, penutup: 'Terima kasih sudah datang dan membuat hari Nara makin seru.' };
  SKEMA.uhangat.contoh = { judul: 'Syukuran Rumah Baru Keluarga Santoso', sapaan: 'Dengan rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk bersilaturahmi dan berdoa bersama di rumah baru kami.',
    acara: [{ nama: 'Doa dan Makan Bersama', tanggal: '2027-04-10', jam: '16.00 WIB', tempat: 'Rumah Keluarga Santoso', alamat: 'Perum Griya Asri Blok C No. 5, Bekasi', peta: '' }],
    dresscode: '', galeri: [], rekening: [], rsvp: { maksTamu: 5, catatan: 'Mohon kabari kehadiran agar kami bisa menyiapkan hidangan.' }, penutup: 'Doa dan kehadiran Bapak/Ibu/Saudara/i adalah keberkahan bagi kami. Terima kasih.' };

  /* ===== Lima tema pernikahan tambahan (skema sama dengan Undangan Pernikahan; contoh isian bernuansa tema) ===== */
  function temaNikah(kunci, nama, c) { SKEMA[kunci] = { nama: nama, bagian: nikahBagian() }; SKEMA[kunci].contoh = c; }
  var ACARA2 = function (a, b) { return [{ nama: a[0], tanggal: '2027-03-15', jam: a[1], tempat: a[2], alamat: a[3], peta: '' }, { nama: b[0], tanggal: '2027-03-15', jam: b[1], tempat: b[2], alamat: b[3], peta: '' }]; };
  var KISAH = [{ waktu: '2019', judul: 'Pertama Bertemu', cerita: 'Takdir mempertemukan kami di sebuah acara kampus, dan kami saling melempar senyum untuk pertama kalinya.', foto: '' }, { waktu: '2022', judul: 'Menjadi Kita', cerita: 'Setelah bertahun-tahun bersahabat, kami memutuskan untuk berjalan bersama.', foto: '' }, { waktu: '2026', judul: 'Lamaran', cerita: 'Dengan restu keluarga, kami melangkah ke jenjang yang lebih serius.', foto: '' }];
  var REK = [{ bank: 'BCA', nomor: '1234567890', atasNama: 'Mempelai Wanita' }], RSVP = { maksTamu: 4, catatan: 'Mohon konfirmasi kehadiran sebelum 1 Maret 2027.' };
  temaNikah('uislami', 'Undangan Islami Elegan', { judul: 'Aisyah & Faris', sapaan: 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami.',
    kutipan: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. (QS. Ar-Rum: 21)', dresscode: 'Nuansa hijau dan krem', fotoSampul: '',
    penutup: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Jazakumullahu khairan atas doa dan restunya.',
    mempelai: { wanita: 'Aisyah Putri Rahmawati', wanitaOrtu: 'Putri dari Bapak H. Hendra & Ibu Hj. Sari', wanitaFoto: '', pria: 'Muhammad Faris Aditya', priaOrtu: 'Putra dari Bapak H. Budi & Ibu Hj. Ani', priaFoto: '' },
    acara: ACARA2(['Akad Nikah', '08.00 WIB', 'Masjid Al-Ikhlas', 'Jl. Melati No. 12, Bandung'], ['Resepsi', '11.00–14.00 WIB', 'Gedung Serbaguna Asri', 'Jl. Pemuda No. 3, Bandung']), kisah: KISAH, galeri: [], rekening: REK, rsvp: RSVP });
  temaNikah('urustik', 'Undangan Rustic Boho', { judul: 'Maya & Raka', sapaan: 'Kami menikah, dan ingin merayakannya bersama orang-orang tercinta di kebun yang teduh. Datang ya, dan ceritakan kisahmu bersama kami!',
    kutipan: 'Cinta tidak mengenal lelah; ia tumbuh pelan seperti pohon, dan teduh bagi siapa saja yang berteduh di bawahnya.', dresscode: 'Earth tone: krem, sage, terakota', fotoSampul: '',
    penutup: 'Terima kasih sudah menjadi bagian dari cerita kami. Sampai jumpa di kebun!',
    mempelai: { wanita: 'Maya Anggraini', wanitaOrtu: 'Putri dari Bapak Hendra & Ibu Sari', wanitaFoto: '', pria: 'Raka Pratama', priaOrtu: 'Putra dari Bapak Budi & Ibu Ani', priaFoto: '' },
    acara: ACARA2(['Garden Party', '15.30 WIB', 'Taman Rimbun', 'Jl. Kenanga No. 8, Bandung'], ['Makan Malam Santai', '18.30 WIB', 'Taman Rimbun', 'Jl. Kenanga No. 8, Bandung']), kisah: KISAH, galeri: [], rekening: REK, rsvp: RSVP });
  temaNikah('ubintang', 'Undangan Malam Bintang', { judul: 'Nadia & Reza', sapaan: 'Di bawah langit yang sama, dua hati dipertemukan. Kami mengundang Anda untuk menjadi saksi malam bahagia kami.',
    kutipan: 'Di antara jutaan bintang, aku menemukanmu.', dresscode: 'Dress code: biru tua atau hitam', fotoSampul: '',
    penutup: 'Kehadiran dan doa Anda adalah bintang yang menerangi malam kami. Terima kasih.',
    mempelai: { wanita: 'Nadia Salsabila', wanitaOrtu: 'Putri dari Bapak Hendra & Ibu Sari', wanitaFoto: '', pria: 'Reza Mahendra', priaOrtu: 'Putra dari Bapak Budi & Ibu Ani', priaFoto: '' },
    acara: ACARA2(['Akad Nikah', '16.00 WIB', 'Rumah Mempelai Wanita', 'Jl. Melati No. 12, Bandung'], ['Resepsi Malam', '19.00 WIB', 'Rooftop Langit Biru', 'Jl. Pemuda No. 3, Bandung']), kisah: KISAH, galeri: [], rekening: REK, rsvp: RSVP });
  temaNikah('ujawa', 'Undangan Adat Jawa', { judul: 'Sekar & Bagas', sapaan: 'Atas berkat rahmat Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami dengan adat Jawa.',
    kutipan: 'Doa restu Bapak/Ibu/Saudara/i adalah bekal kami membangun rumah tangga yang tenteram dan sejahtera.', dresscode: 'Busana batik atau kebaya', fotoSampul: '',
    penutup: 'Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.',
    mempelai: { wanita: 'Sekar Ayu Wulandari', wanitaOrtu: 'Putri dari Bapak Hendra & Ibu Sari', wanitaFoto: '', pria: 'Bagas Prasetyo', priaOrtu: 'Putra dari Bapak Budi & Ibu Ani', priaFoto: '' },
    acara: ACARA2(['Akad Nikah', '08.00 WIB', 'Rumah Mempelai Wanita', 'Jl. Melati No. 12, Yogyakarta'], ['Resepsi Adat', '11.00–14.00 WIB', 'Pendapa Sumber Rejeki', 'Jl. Kenanga No. 3, Yogyakarta']), kisah: KISAH, galeri: [], rekening: REK, rsvp: RSVP });
  temaNikah('uroyal', 'Undangan Klasik Royal', { judul: 'Anindya & Raditya', sapaan: 'Dengan penuh hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri perayaan pernikahan kami.',
    kutipan: 'Dua jiwa, satu janji, selamanya.', dresscode: 'Formal / Black tie', fotoSampul: '',
    penutup: 'Kehormatan bagi kami bila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih.',
    mempelai: { wanita: 'Anindya Paramita', wanitaOrtu: 'Putri dari Bapak Hendra & Ibu Sari', wanitaFoto: '', pria: 'Raditya Wicaksana', priaOrtu: 'Putra dari Bapak Budi & Ibu Ani', priaFoto: '' },
    acara: ACARA2(['Upacara Pemberkatan', '10.00 WIB', 'Gereja Santa Maria', 'Jl. Merdeka No. 5, Jakarta'], ['Gala Dinner', '19.00 WIB', 'Ballroom Grand Mahkota', 'Jl. Sudirman No. 1, Jakarta']), kisah: KISAH, galeri: [], rekening: REK, rsvp: RSVP });

  /* ===== Tema acara keluarga (khitanan dan syukuran): satu tokoh, susunan acara, petunjuk lokasi, siaran langsung ===== */
  function acaraBagian() {
    var nk = nikahBagian(), acara = nk.filter(function (b) { return b.k === 'acara'; })[0], galeri = nk.filter(function (b) { return b.k === 'galeri'; })[0], rek = nk.filter(function (b) { return b.k === 'rekening'; })[0], rsvp = nk.filter(function (b) { return b.k === 'rsvp'; })[0];
    return [
      T('judul', 'Judul acara (tampil besar)', 60, { wajib: true, hint: 'Mis. Khitanan Fauzan, atau Syukuran Rumah Baru' }),
      A('sapaan', 'Kalimat sambutan', 220, { wajib: true, hint: 'Mis. Dengan memohon rahmat Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa terbaik.' }),
      A('kutipan', 'Doa atau harapan (opsional)', 320, { hint: 'Mis. doa untuk si kecil atau untuk rumah baru.' }),
      T('dresscode', 'Dress code (opsional)', 80, { hint: 'Mis. Busana muslim atau batik' }),
      F('fotoSampul', 'Foto utama (opsional)'),
      A('penutup', 'Kalimat penutup', 300, { wajib: true }),
      { k: 'tokoh', tipe: 'objek', label: 'Yang berbahagia', item: [T('nama', 'Nama anak atau tuan rumah', 60, { wajib: true, hint: 'Mis. Muhammad Fauzan, atau Keluarga Bapak Santoso' }), T('ortu', 'Keterangan (opsional)', 100, { hint: 'Mis. Putra dari Bapak Hendra & Ibu Sari' }), F('foto', 'Foto (opsional)')] },
      acara,
      T('denah', 'Petunjuk lokasi atau parkir (opsional)', 240, { hint: 'Mis. Parkir di lapangan sebelah rumah; masuk gang dekat warung.' }),
      T('siaran', 'Tautan siaran langsung (opsional)', 300, { pola: '^https://[^\\s]{4,290}$', hint: 'Tautan YouTube atau Zoom, diawali https://' }),
      { k: 'susunan', tipe: 'daftar', label: 'Susunan acara (opsional)', hint: 'Hingga 6 kegiatan dengan jamnya.', min: 0, maks: 6, namaItem: 'Kegiatan', item: [T('jam', 'Jam', 20, { wajib: true, hint: 'Mis. 10.00 WIB' }), T('kegiatan', 'Kegiatan', 60, { wajib: true, hint: 'Mis. Pembacaan doa' })] },
      galeri, rek, rsvp
    ];
  }
  function temaAcara(kunci, nama, c) { SKEMA[kunci] = { nama: nama, bagian: acaraBagian() }; SKEMA[kunci].contoh = c; }
  var SUSUN = function (a) { return a.map(function (x) { return { jam: x[0], kegiatan: x[1] }; }); };
  var ACR = function (nama, jam, tempat, alamat) { return [{ nama: nama, tanggal: '2027-03-20', jam: jam, tempat: tempat, alamat: alamat, peta: '' }]; };
  var REK2 = [{ bank: 'BCA', nomor: '1234567890', atasNama: 'Tuan Rumah' }], RSVP2 = { maksTamu: 5, catatan: 'Mohon konfirmasi kehadiran dan jumlah tamu agar kami dapat menyiapkan hidangan.' };
  temaAcara('usultan', 'Undangan Sultan Cilik', { judul: 'Khitanan Muhammad Fauzan', sapaan: 'Dengan memohon rahmat Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri syukuran khitanan putra kami tercinta dan memberikan doa terbaik untuknya.',
    kutipan: 'Ya Allah, jadikanlah anak kami anak yang saleh, sehat, dan bermanfaat bagi agama dan bangsa. Aamiin.', dresscode: 'Busana muslim atau batik', fotoSampul: '', penutup: 'Kehadiran dan doa Bapak/Ibu/Saudara/i sangat berarti bagi kami. Jazakumullahu khairan.',
    tokoh: { nama: 'Muhammad Fauzan Al-Fatih', ortu: 'Putra dari Bapak Hendra & Ibu Sari', foto: '' }, acara: ACR('Syukuran Khitanan', '10.00 WIB', 'Rumah Keluarga Hendra', 'Jl. Melati No. 12, Bandung'),
    denah: 'Parkir tersedia di lapangan sebelah rumah. Masuk gang dekat warung Bu Siti, rumah kedua dengan pagar hijau.', siaran: '', susunan: SUSUN([['09.30 WIB', 'Registrasi tamu'], ['10.00 WIB', 'Pembukaan dan doa'], ['10.30 WIB', 'Tausiyah singkat'], ['11.00 WIB', 'Makan bersama']]), galeri: [], rekening: REK2, rsvp: RSVP2 });
  temaAcara('ulentera', 'Undangan Islami Ceria', { judul: 'Khitanan Abdullah', sapaan: 'Assalamu’alaikum. Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara khitanan putra kami dan memberikan doa terbaik.',
    kutipan: 'Semoga Allah menjadikan anak kami anak yang saleh, sehat, dan menjadi kebanggaan keluarga. Aamiin.', dresscode: 'Nuansa hijau dan kuning', fotoSampul: '', penutup: 'Terima kasih atas kehadiran dan doa Bapak/Ibu/Saudara/i. Wassalamu’alaikum Warahmatullahi Wabarakatuh.',
    tokoh: { nama: 'Abdullah Rizky Pratama', ortu: 'Putra dari Bapak Budi & Ibu Ani', foto: '' }, acara: ACR('Walimatul Khitan', '09.00 WIB', 'Aula Masjid Al-Hidayah', 'Jl. Kenanga No. 8, Bekasi'),
    denah: 'Gunakan pintu samping aula. Parkir motor di halaman masjid, parkir mobil di lahan kosong seberang jalan.', siaran: '', susunan: SUSUN([['08.30 WIB', 'Tamu tiba'], ['09.00 WIB', 'Pembacaan Al-Qur’an dan doa'], ['09.30 WIB', 'Sambutan keluarga'], ['10.00 WIB', 'Makan bersama dan hiburan anak']]), galeri: [], rekening: REK2, rsvp: RSVP2 });
  temaAcara('utumpeng', 'Undangan Tumpeng & Doa', { judul: 'Syukuran Keluarga Santoso', sapaan: 'Sebagai wujud syukur atas nikmat kesehatan dan rezeki, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara tasyakuran dan doa bersama.',
    kutipan: 'Ya Allah, berkahilah keluarga kami, lapangkan rezeki kami, dan jadikan kami hamba yang pandai bersyukur. Aamiin.', dresscode: 'Busana batik atau muslim', fotoSampul: '', penutup: 'Terima kasih atas kehadiran, doa, dan silaturahminya.',
    tokoh: { nama: 'Keluarga Bapak Santoso', ortu: 'Dalam rangka tasyakuran dan doa bersama', foto: '' }, acara: ACR('Tasyakuran dan Doa Bersama', '16.00 WIB', 'Kediaman Bapak Santoso', 'Perum Griya Asri Blok C No. 5, Bekasi'),
    denah: 'Dari gerbang utama perumahan, belok kiri di pos satpam. Rumah bercat krem di sebelah kanan.', siaran: '', susunan: SUSUN([['15.30 WIB', 'Tamu tiba'], ['16.00 WIB', 'Pembacaan doa dan tahlil'], ['16.30 WIB', 'Tausiyah'], ['17.00 WIB', 'Makan tumpeng bersama']]), galeri: [], rekening: REK2, rsvp: RSVP2 });
  temaAcara('urumah', 'Undangan Rumah Baru', { judul: 'Syukuran Rumah Baru', sapaan: 'Dengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk bersilaturahmi dan berdoa bersama di rumah baru kami.',
    kutipan: 'Ya Allah, jadikanlah rumah ini rumah yang penuh berkah, ketenteraman, dan kasih sayang bagi penghuninya. Aamiin.', dresscode: 'Santai dan rapi', fotoSampul: '', penutup: 'Doa dan kehadiran Bapak/Ibu/Saudara/i adalah keberkahan bagi rumah kami. Terima kasih.',
    tokoh: { nama: 'Keluarga Bapak Andi & Ibu Dewi', ortu: 'Perum Griya Asri Blok C No. 5, Bekasi', foto: '' }, acara: ACR('Syukuran dan Doa Bersama', '10.00 WIB', 'Rumah Baru Keluarga Andi', 'Perum Griya Asri Blok C No. 5, Bekasi'),
    denah: 'Dari gerbang utama perumahan, belok kiri di pos satpam, rumah cat krem di sebelah kanan. Parkir di depan rumah dan sepanjang jalan.', siaran: '', susunan: SUSUN([['09.30 WIB', 'Tamu tiba'], ['10.00 WIB', 'Doa bersama'], ['10.30 WIB', 'Tur rumah'], ['11.00 WIB', 'Makan bersama']]), galeri: [], rekening: REK2, rsvp: RSVP2 });
  if (typeof window !== 'undefined') window.SKEMA = SKEMA;
  if (typeof module !== 'undefined') module.exports = SKEMA;
})();
