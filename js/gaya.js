/* ==========================================================
   GAYA — registri "kepribadian" tiap template Basic.
   Satu desain = satu pengalaman: ilustrasi, gerak latar, transisi, bingkai foto, dan nada teks.
   Dipakai oleh katalog (adegan pratinjau + chip fitur), form (opsi desain), dan halaman kartu.
   Nama kunci lama (blossom, confetti, cinema, ...) tetap dikenali lewat ALIAS.
   ========================================================== */
(function () {
  'use strict';
  var A = window.Art;
  function e(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var ALIAS = { blossom: 'classic', confetti: 'joyful', cinema: 'cinematic', dusk: 'starry', grad: 'graduation', sage: 'garden', rose: 'mama', arcade: 'kids' };
  var URUT = ['cinematic', 'joyful', 'graduation', 'mama', 'garden', 'kids', 'baby', 'starry', 'classic', 'movie', 'mall', 'bestie', 'feed', 'musik', 'misi'];
  var G = {};

  /* ------------ Cinematic Romance ------------ */
  G.cinematic = {
    nama: 'Cinematic Romance', kat: 'Anniversary', warna: ['#0A0810', '#E3BE7B'], gelap: true,
    cocok: 'Anniversary, pasangan, kenangan bersama, dan pesan romantis yang dalam.',
    fitur: ['Pembuka fade-in ala film', 'Foto zoom sangat halus', 'Transisi gelap ke terang'],
    kpd: 'Bab I', sapa: ['Untukmu, tokoh utama ceritaku', 'Mari kita putar kenangannya perlahan.'],
    kpdSurat: 'Bab II · Sepucuk surat', kpdKejutan: 'Bab III · Kejutan', kpdPenutup: 'Epilog',
    judulPenutup: function () { return 'Dan kisah ini berlanjut'; }, akhir: 'Terima kasih sudah menjadi bagian dari ceritaku.',
    petunjuk: 'Pilih foto yang paling bercerita. Foto akan tampil satu per satu dengan zoom halus.',
    demo: { penerima: 'Sayang', dari: 'Dimas', kat: 'Anniversary', pesan: 'Kita mungkin tak selalu punya kata yang tepat, tetapi setiap hari bersamamu adalah adegan favoritku.' },
    buka: function (d) {
      return '<p class="kredit">DEAROA PRESENTS</p><span class="garis-emas"></span><h1 class="judul-buka" tabindex="-1">Untuk ' + e(d.penerima) + '</h1>' +
        '<p class="sub">Sebuah kisah kecil, ditulis dari hati.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Mulai Kisah</button>';
    }
  };

  /* ------------ Joyful Party ------------ */
  G.joyful = {
    nama: 'Joyful Party', kat: 'Ulang Tahun', warna: ['#FFF3B0', '#FF6B6B'],
    cocok: 'Ulang tahun, sahabat, ucapan selamat, dan kejutan lucu.',
    fitur: ['Balon atau love melayang', 'Tombol bereaksi saat disentuh', 'Confetti & bintang bermunculan'],
    kpd: 'Yeay!', sapa: ['Selamat datang di pestamu!', 'Siap-siap, ada kejutan seru menantimu.'],
    kpdSurat: 'Ada surat seru nih', kpdKejutan: 'Waktunya kejutan!', kpdPenutup: 'Foto-foto seru',
    judulPenutup: function (d) { return 'Momen seru ' + d.penerima; }, akhir: 'Sampai ketemu di pesta berikutnya!',
    opsi: { dekor: { label: 'Hiasan yang melayang ke atas', pilihan: [['balon', 'Balon warna-warni'], ['love', 'Hati (love)']], bawaan: 'balon' } },
    petunjuk: 'Pilih apakah balon atau hati yang melayang ke atas layar.',
    demo: { penerima: 'Rani', dari: 'Dimas', kat: 'Ulang Tahun', pesan: 'Selamat ulang tahun! Semoga harimu penuh tawa, kue enak, dan kejutan manis dari semesta.' },
    buka: function (d) {
      return '<div class="gugus-balon">' + A.balon('#FF6B6B', 'b1') + A.balon('#FFC93C', 'b2') + A.balon('#FF5FA2', 'b3') + '</div>' +
        '<h1 class="judul-buka" tabindex="-1">Surprise!<br><span>Ada kejutan buat ' + e(d.penerima) + '</span></h1><p class="sub">Ketuk tombolnya, jangan malu-malu.</p>' +
        '<button type="button" class="cbtn" data-go="1" id="btnBuka">Ayo Buka!</button>';
    }
  };

  /* ------------ Graduation ------------ */
  G.graduation = {
    nama: 'Graduation Day', kat: 'Wisuda', warna: ['#0F1F3D', '#D4AF55'], gelap: true,
    cocok: 'Wisuda, kelulusan, pencapaian akademik, dan ucapan selamat atas keberhasilan.',
    fitur: ['Kilau emas bergerak perlahan', 'Foto bingkai penghargaan', 'Garis waktu perjalanan terisi bertahap'],
    kpd: 'Selamat', sapa: ['Atas pencapaian yang luar biasa', 'Setiap malam panjangmu akhirnya terbayar.'],
    kpdSurat: 'Surat penghargaan', kpdKejutan: 'Hadiah kelulusan', kpdPenutup: 'Perjalananmu',
    judulPenutup: function () { return 'Perjalanan menuju hari ini'; }, akhir: 'Selamat melangkah ke bab kehidupan berikutnya.',
    milestone: ['Langkah pertama', 'Perjuangan & begadang', 'Doa orang tersayang', 'Ujian terakhir', 'Hari wisuda!'],
    petunjuk: 'Foto wisuda tampil dalam bingkai penghargaan emas.',
    demo: { penerima: 'Aulia', dari: 'Mama & Papa', kat: 'Wisuda', pesan: 'Kami bangga padamu. Setiap malam panjang dan doa akhirnya sampai di hari ini. Selamat, Nak.' },
    buka: function (d) {
      return '<div class="topi-wrap">' + A.topi('#D4AF55', 'topi') + '</div><p class="kpd">Selamat</p><h1 class="judul-buka emas" tabindex="-1">' + e(d.penerima) + '</h1><span class="garis-emas"></span>' +
        '<p class="sub">Sebuah penghargaan kecil atas kerja kerasmu.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Ucapan</button>';
    }
  };

  /* ------------ Mama Tersayang ------------ */
  G.mama = {
    nama: 'Mama Tersayang', kat: 'Hari Spesial', warna: ['#FFF3E4', '#C98C88'],
    cocok: 'Hari Ibu, ulang tahun ibu, ucapan terima kasih, dan ungkapan sayang kepada mama.',
    fitur: ['Kelopak bunga jatuh perlahan', 'Surat terbuka pelan, tulisan tangan', 'Album kenangan + ikon keibuan'],
    kpd: 'Untuk Mama', sapa: ['Terima kasih untuk segalanya', 'Ada sepucuk surat kecil dari hati.'],
    kpdSurat: 'Sepucuk surat', kpdKejutan: 'Ada yang istimewa', kpdPenutup: 'Album kenangan',
    judulPenutup: function () { return 'Album kenangan kita'; }, akhir: 'Aku sayang Mama, selalu.', lambat: 1.7,
    opsi: { ikon: { label: 'Ikon keibuan yang ditampilkan (pilih sampai 4)', tipe: 'banyak', maks: 4, pilihan: [['cangkir', 'Teh hangat'], ['bunga', 'Bunga'], ['rumah', 'Rumah nyaman'], ['hati', 'Pelukan'], ['resep', 'Resep keluarga'], ['sendok', 'Masakan']], bawaan: ['cangkir', 'bunga', 'hati'] } },
    ikonNama: { cangkir: 'Teh hangat', bunga: 'Kelembutan', rumah: 'Rumah yang nyaman', hati: 'Pelukan', resep: 'Resep keluarga', sendok: 'Masakan' },
    petunjuk: 'Pilih ikon yang paling menggambarkan sosok Mama.',
    demo: { penerima: 'Mama', dari: 'Dimas', kat: 'Hari Spesial', pesan: 'Terima kasih untuk setiap doa yang Mama bisikkan diam-diam. Aku sayang Mama, selalu.' },
    buka: function (d) {
      return '<div class="bunga-buka">' + A.bunga('#E8A7A2', '#FFD58A', 'bg1') + A.bunga('#B9C8A9', '#F6E3B4', 'bg2') + '</div><p class="kpd">Untuk Mama tersayang</p><h1 class="judul-buka tulis" tabindex="-1">' + e(d.penerima) + '</h1>' +
        '<p class="sub">Ada sepucuk surat kecil dari hati.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Surat</button>';
    }
  };

  /* ------------ Secret Garden ------------ */
  G.garden = {
    nama: 'Secret Garden', kat: 'Terima Kasih', warna: ['#E6F6D3', '#3F9A55'],
    cocok: 'Terima kasih, sahabat, persahabatan, dan pesan yang tumbuh perlahan.',
    fitur: ['Gerbang taman membuka', 'Kupu-kupu & cahaya matahari lembut', 'Foto tergantung di sulur daun'],
    kpd: 'Selamat datang', sapa: ['Di taman rahasia', 'Sebuah tempat tenang yang hanya kamu yang tahu.'],
    kpdSurat: 'Surat di balik daun', kpdKejutan: 'Rahasia taman', kpdPenutup: 'Kenangan yang mekar',
    judulPenutup: function () { return 'Kenangan yang bermekaran'; }, akhir: 'Semoga hari-harimu terus bermekaran.', jedaBuka: 1100,
    petunjuk: 'Foto tergantung seperti hiasan di taman.',
    demo: { penerima: 'Sahabatku', dari: 'Dimas', kat: 'Terima Kasih', pesan: 'Terima kasih sudah jadi tempat tumbuh paling nyaman. Kamu membuat hari-hariku bermekaran.' },
    buka: function (d) {
      return '<div class="gerbang"><i class="pintu kiri"></i><i class="pintu kanan"></i></div><p class="kpd">Taman rahasia</p><h1 class="judul-buka" tabindex="-1">Hanya ' + e(d.penerima) + '<br>yang boleh masuk</h1>' +
        '<button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Gerbang</button>';
    }
  };

  /* ------------ For Kids ------------ */
  G.kids = {
    nama: 'For Kids', kat: 'Ulang Tahun', warna: ['#BFE6FF', '#FFB020'],
    cocok: 'Ulang tahun anak, ucapan untuk adik atau keponakan, dan kejutan ceria.',
    fitur: ['Karakter beruang lucu', 'Awan & matahari tersenyum', 'Tombol besar yang asyik ditekan'],
    kpd: 'Halo!', sapa: ['Ayo kita bermain!', 'Ada kejutan seru yang menunggumu.'],
    kpdSurat: 'Ada surat buatmu', kpdKejutan: 'Ayo main!', kpdPenutup: 'Foto-foto lucu',
    judulPenutup: function () { return 'Foto kita!'; }, akhir: 'Terima kasih sudah bermain bersamaku!',
    petunjuk: 'Warna cerah, karakter lucu, dan tombol besar yang mudah ditekan anak.',
    demo: { penerima: 'Nara', dari: 'Kak Dimas', kat: 'Ulang Tahun', pesan: 'Selamat ulang tahun, jagoan kecil! Semoga kamu selalu ceria dan punya banyak teman.' },
    buka: function (d) {
      return '<div class="panggung-kids">' + A.awan(true, '#fff', 'ak1') + A.beruang('#C89B6D', 'beruang') + A.matahari('mt') + '</div><h1 class="judul-buka" tabindex="-1">Halo, ' + e(d.penerima) + '!</h1>' +
        '<p class="sub">Ada kejutan seru buatmu.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Ayo Main!</button>';
    }
  };

  /* ------------ Hello, Little One ------------ */
  G.baby = {
    nama: 'Hello, Little One', kat: 'Kelahiran', warna: ['#DCEBFF', '#8DB4E8'],
    cocok: 'Kelahiran bayi dan menyambut anggota keluarga baru: nama bayi, doa, dan foto.',
    fitur: ['Mobil bintang & awan berayun', 'Bintang atau awan berkelip (pilihan)', 'Foto berbingkai awan lembut'],
    kpd: 'Hello,', sapa: ['Selamat datang di dunia', 'Dunia menunggumu dengan doa dan cinta.'],
    kpdSurat: 'Doa untukmu', kpdKejutan: 'Kejutan manis', kpdPenutup: 'Hari pertamamu',
    judulPenutup: function () { return 'Hari-hari pertamamu'; }, akhir: 'Selamat datang, malaikat kecil.',
    opsi: { dekor: { label: 'Animasi latar', pilihan: [['bintang', 'Bintang berkelip'], ['awan', 'Awan berarak']], bawaan: 'bintang' } },
    petunjuk: 'Isi nama bayi pada kolom "Untuk siapa" dan doa pada isi surat.',
    demo: { penerima: 'Aira', dari: 'Keluarga Besar', kat: 'Kelahiran', pesan: 'Selamat datang di dunia, Aira. Semoga kamu tumbuh sehat, bahagia, dan selalu dikelilingi cinta.' },
    buka: function (d) {
      return '<div class="mobil"><i class="tali t1"><b>' + A.bintang('#FFD76A', 'mb') + '</b></i><i class="tali t2"><b>' + A.awan(false, '#fff', 'mb') + '</b></i><i class="tali t3"><b>' + A.bintang('#FFB3C7', 'mb') + '</b></i></div>' +
        '<div class="bulan-baby">' + A.bulan('bl') + '</div><p class="kpd">Hello,</p><h1 class="judul-buka" tabindex="-1">Little One</h1><p class="sub">Selamat datang, ' + e(d.penerima) + '.</p>' +
        '<button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Ucapan</button>';
    }
  };

  /* ------------ Starry Night ------------ */
  G.starry = {
    nama: 'Starry Night', kat: 'Maaf & Rindu', warna: ['#0C1033', '#B8A9FF'], gelap: true,
    cocok: 'Rindu, permintaan maaf, hubungan jarak jauh, dan pesan jujur dari hati.',
    fitur: ['Langit malam berbintang', 'Bintang jatuh sesekali', 'Rasi bintang yang tergambar'],
    kpd: 'Di bawah langit yang sama', sapa: ['Ada yang ingin kusampaikan', 'Dengan hati yang paling jujur.'],
    kpdSurat: 'Surat di bawah bintang', kpdKejutan: 'Satu bintang untukmu', kpdPenutup: 'Rasi kenangan',
    judulPenutup: function () { return 'Bintang-bintang kenangan'; }, akhir: 'Sampai kita bertemu lagi di bawah langit yang sama.',
    petunjuk: 'Langit malam dengan bintang jatuh dan rasi bintang yang digambar perlahan.',
    demo: { penerima: 'Kamu', dari: 'Dimas', kat: 'Maaf & Rindu', pesan: 'Maaf untuk kata-kata yang melukai. Di bawah langit yang sama, aku merindukanmu setiap malam.' },
    buka: function (d) {
      return '<div class="bulan-starry">' + A.bulan('bl') + '</div><p class="kpd">Di bawah langit yang sama</p><h1 class="judul-buka" tabindex="-1">Untuk ' + e(d.penerima) + '</h1>' +
        '<p class="sub">Ada yang ingin kusampaikan malam ini.</p><button type="button" class="cbtn" data-go="1" id="btnBuka">Buka Ucapan</button>';
    }
  };


  /* ------------ Desain khusus paket Special (aplikasi mini; halaman /s/) ------------ */
  function sp(nama, kat, warna, cocok, fitur, brief, kunci) { return { special: true, dasar: DASAR_PREMIUM[kunci] || 'classic', demoUrl: '/s/?d=' + kunci, nama: nama, kat: kat, warna: warna, cocok: cocok, fitur: fitur, brief: brief, gelap: true }; }
  var DASAR_PREMIUM = { movie: 'cinematic', mall: 'joyful', bestie: 'garden', feed: 'starry', musik: 'starry', misi: 'graduation' };      // tema 5 slide (pembuka→sapaan→surat→kejutan→kenangan) untuk tiap desain Premium
  G.movie = sp('Malam Film', 'Anniversary', ['#0B0B10', '#E8336D'], 'Pasangan, anniversary, dan kenangan bersama: penerima menjadi pemeran utama film pendek.',
    ['Beranda episode ala layanan streaming', 'Subtitle & narasi muncul bertahap', 'Bebas memilih episode + adegan penutup'],
    ['Judul film dan nama pemeran', 'Poster (foto)', '3–4 episode: foto atau video, narasi tiap adegan, judul dan deskripsi pendek', 'Pesan penutup (paling panjang)'], 'movie');
  G.mall = sp('Dearora Mall', 'Hari Spesial', ['#FF7A1A', '#FFB020'], 'Ulang tahun dan ucapan manis: penerima mendapat paket kejutan dari toko online fiktif.',
    ['Etalase hadiah, keranjang, dan kupon', 'Status pengiriman fiktif bergerak', 'Buka paket: hadiah satu per satu'],
    ['Nama penerima', 'Pilihan hadiah/ucapan (misal: pelukan, surat cinta, apresiasi)', 'Isi tiap hadiah: teks, foto, atau kupon', 'Kode kupon (opsional) dan pesan final'], 'mall');
  G.bestie = sp('Dunia Sahabat', 'Terima Kasih', ['#8FD6FF', '#A7E58C'], 'Sahabat dan persahabatan: dunia petualangan orisinal bergaya blok.',
    ['Karakter blok & peta dengan 3 lokasi', 'Kumpulkan memori dan lencana', 'Peti harta karun berisi pesan utama'],
    ['Nama dan warna avatar/dunia', 'Daftar lokasi', 'Foto kenangan dan pesan di tiap item', 'Lencana dan hadiah final'], 'bestie');
  G.feed = sp('Selebstyle', 'Hari Spesial', ['#E8336D', '#FF8A5B'], 'Ulang tahun dan pujian manis: feed vertikal seperti membuka aplikasi sosial.',
    ['Langsung masuk feed, geser ke atas', 'Komentar manis muncul bertahap', 'Kiriman "Disematkan untukmu"'],
    ['Nama akun (misal @for.rani)', 'Foto atau video tiap kiriman beserta caption', 'Komentar pilihan (atau pakai template)', 'Kiriman yang disematkan dan pesan panjangnya'], 'feed');
  G.musik = sp('Soundtrack Kita', 'Maaf & Rindu', ['#7B2FF7', '#F107A3'], 'Rindu dan romantis: playlist berisi lagu-lagu yang mewakili kenangan.',
    ['Playlist cerita dengan visualizer lembut', 'Tiap lagu punya kisah personal', 'Hidden Track sebagai kejutan'],
    ['Judul playlist, cover, dan deskripsi', '4–6 lagu: judul, cover, alasan memilihnya', 'Tautan audio yang SAH (opsional, tidak boleh mengunggah musik berhak cipta)', 'Pesan Hidden Track'], 'musik');
  G.misi = sp('Lastlove: Misi Cinta', 'Ulang Tahun', ['#0A141C', '#FFB020'], 'Pecinta game strategi: briefing markas, tiga misi, dan kartu hero.',
    ['Briefing markas orisinal', 'Tiga misi + hadiah di tiap misi', 'Kartu hero berisi atribut lucu'],
    ['Nama komandan dan gelar', 'Foto tersembunyi dan pesannya', 'Tiga pesan penguat dan satu pertanyaan kuis', 'Hadiah final (pesan atau foto)'], 'misi');

  /* ------------ Classic (bawaan lama) ------------ */
  G.classic = {
    nama: 'Classic Blossom', kat: 'Anniversary', warna: ['#FFE0E8', '#D84A6E'],
    cocok: 'Semua momen: desain lembut yang manis dan sederhana.',
    fitur: ['Tema warna lembut', 'Confetti & hati', 'Cepat dan ringkas'],
    demo: { penerima: 'Rani', dari: 'Dimas', kat: 'Anniversary', pesan: 'Terima kasih sudah memilih berjalan bersamaku, hari demi hari.' }
  };

  /* ------------ Adegan pratinjau katalog (animasi kecil berulang) ------------ */
  var P = function (kls, inner, style) { return '<span class="sc ' + kls + '"' + (style ? ' style="' + style + '"' : '') + '>' + inner + '</span>'; };
  var ADEGAN = {
    cinematic: function () { return P('sc-foto', '') + P('sc-judul', '<i>Untukmu</i>') + P('sc-bokeh b1', '') + P('sc-bokeh b2', '') + P('sc-bokeh b3', '') + P('sc-bar atas', '') + P('sc-bar bawah', ''); },
    joyful: function () { return P('sc-balon x1', A.balon('#FF6B6B')) + P('sc-balon x2', A.balon('#FFC93C')) + P('sc-balon x3', A.balon('#FF5FA2')) + P('sc-doodle d1', A.bintang('#FF6B6B')) + P('sc-doodle d2', A.coretan('#FF5FA2')) + P('sc-doodle d3', A.kilau('#FFB81C')) + P('sc-judul-j', 'Yeay!'); },
    graduation: function () { return P('sc-topi', A.topi('#D4AF55')) + P('sc-laurel', A.laurel('#D4AF55')) + P('sc-emas', 'Selamat') + P('sc-kilau k1', A.kilau('#F6E3A1')) + P('sc-kilau k2', A.kilau('#F6E3A1')) + P('sc-garis-edu', '<i></i><i></i><i></i><i></i><i></i>'); },
    mama: function () { return P('sc-bunga a', A.bunga('#E8A7A2', '#FFD58A')) + P('sc-bunga b', A.bunga('#B9C8A9', '#F6E3B4')) + P('sc-tulis', 'Untuk Mama') + P('sc-kelopak p1', A.kelopak('#E8A7A2')) + P('sc-kelopak p2', A.kelopak('#D9A5A0')) + P('sc-kelopak p3', A.kelopak('#C9B38C')) + P('sc-cangkir', A.cangkir()); },
    garden: function () { return P('sc-sinar', '') + P('sc-daun l1', A.daun('#6BB36F')) + P('sc-daun l2', A.daun('#4E9E5C')) + P('sc-kupu', A.kupu()) + P('sc-bunga-g g1', A.bunga('#FF8FA3', '#FFC93C')) + P('sc-bunga-g g2', A.bunga('#B79CFF', '#FFC93C')) + P('sc-bunga-g g3', A.bunga('#FFB36B', '#fff')); },
    kids: function () { return P('sc-mt', A.matahari()) + P('sc-awan a1', A.awan(true, '#fff')) + P('sc-awan a2', A.awan(true, '#fff')) + P('sc-beruang', A.beruang('#C89B6D')); },
    baby: function () { return P('sc-bulan-b', A.bulan()) + P('sc-mobil', '<i class="t1"><b>' + A.bintang('#FFD76A') + '</b></i><i class="t2"><b>' + A.awan(false, '#fff') + '</b></i><i class="t3"><b>' + A.bintang('#FFB3C7') + '</b></i>') + P('sc-hello', 'Hello, Little One'); },
    starry: function () { var b = '', i; for (i = 0; i < 14; i++) b += P('sc-bint', '', 'left:' + ((i * 37) % 92 + 3) + '%;top:' + ((i * 53) % 70 + 6) + '%;animation-delay:-' + (i * 0.37).toFixed(2) + 's'); return b + P('sc-jatuh', '') + P('sc-bulan-s', A.bulan()) + P('sc-rasi', '<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M8 46L30 22 52 34 72 12 92 28" fill="none" stroke="#B8A9FF" stroke-width="1.2" stroke-dasharray="3 3"/></svg>'); },
    classic: function () { return P('sc-hati', A.hati('#D84A6E')) + P('sc-doodle d1', A.kilau('#F78DA7')); },
    movie: function () { return P('sc-mv-poster', '<i>Cerita<br>Kita</i>') + P('sc-mv-judul', 'CERITAKITA') + P('sc-mv-eps e1', '1') + P('sc-mv-eps e2', '2') + P('sc-mv-eps e3', '3') + P('sc-mv-play', '▶ Tonton'); },
    mall: function () { return P('sc-ml-bar', 'Dearora Mall') + P('sc-ml-banner', 'Paket Spesial!') + P('sc-ml-p p1', A.hati('#E8336D')) + P('sc-ml-p p2', A.bintang('#FFB020')) + P('sc-ml-p p3', A.hati('#FF7A1A')) + P('sc-ml-p p4', A.bintang('#E8336D')) + P('sc-ml-troli', '3'); },
    bestie: function () { return P('sc-bs-bukit', '') + P('sc-bs-item i1', A.hati('#FF5D8F')) + P('sc-bs-item i2', A.bintang('#FFC93C')) + P('sc-bs-av', '<i></i><b></b>') + P('sc-bs-hud', '<u></u>'); },
    feed: function () { return P('sc-fd-layar', '<em>Kamu itu<br>bikin hari seru</em>') + P('sc-fd-aksi', '<i></i><i></i><i></i>') + P('sc-fd-akun', '@for.rani') + P('sc-fd-kom k1', 'Kamu berhak bahagia') + P('sc-fd-kom k2', 'Selamat ulang tahun!'); },
    musik: function () { return P('sc-mk-cover', A.hati('#fff')) + P('sc-mk-viz', '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>') + P('sc-mk-judul', 'Playlist untukmu') + P('sc-mk-play', '▶'); },
    misi: function () { return P('sc-ms-radar', '') + P('sc-ms-hero', '<i></i><b></b>') + P('sc-ms-misi', '<i class="a"></i><i class="b"></i><i class="c"></i>') + P('sc-ms-judul', 'MISI SPESIAL'); }
  };

  var Gaya = {
    G: G, URUT: URUT, ALIAS: ALIAS,
    kunci: function (k) { k = String(k || ''); return G[k] ? k : (ALIAS[k] && G[ALIAS[k]] ? ALIAS[k] : 'classic'); },
    dari: function (thumbnail) { var m = /^tema:([a-z]+)$/.exec(String(thumbnail || '')); return m ? Gaya.kunci(m[1]) : 'classic'; },
    ambil: function (k) { return G[Gaya.kunci(k)]; },
    adegan: function (k) { k = Gaya.kunci(k); return '<div class="scene scene-' + k + '" aria-hidden="true">' + (ADEGAN[k] || ADEGAN.classic)() + '</div>'; },
    opsiBawaan: function (k) {
      var o = {}, def = (G[Gaya.kunci(k)] || {}).opsi || {};
      Object.keys(def).forEach(function (n) { o[n] = def[n].bawaan; });
      return o;
    }
  };
  window.Gaya = Gaya;
})();
