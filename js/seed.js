/* Data contoh untuk MODE PRATINJAU (saat GAS_URL kosong).
   Bentuknya sama dengan jawaban API getPublicData. Tidak dipakai saat GAS_URL terisi. */
window.DEARORA_SEED = {
  paket: [
    { id: 'basic', nama: 'Basic', harga: 19000, masaAktifHari: 10, maksFoto: 3,
      fitur: { tagline: 'Ucapan interaktif yang dimainkan: ada surat, sapaan, dan kejutan pilihanmu.', foto: '1–3 foto', pembuatan: 'Otomatis',
        fitur: [
          { t: 'Sapaan manis + animasi confetti', ok: true },
          { t: 'Surat yang dibuka, berisi pesan pribadi dari pengirim', ok: true },
          { t: 'Kejutan akhir pilihanmu: kado, kuis, gosok, taman bunga, kue ulang tahun, dan lainnya', ok: true },
          { t: 'Tema warna sesuai momen', ok: true },
          { t: 'Link random, hanya yang diberi link bisa membuka', ok: true },
          { t: 'Musik latar', ok: false },
          { t: 'Revisi', ok: false } ] } },
    { id: 'premium', nama: 'Premium', harga: 39000, masaAktifHari: 30, maksFoto: 10,
      fitur: { tagline: 'Lebih personal: musik, galeri, dan timeline kenangan.', foto: 'Hingga 10 foto', pembuatan: 'Otomatis',
        badge: 'Paling Favorit', rekomendasi: true,
        fitur: [
          { t: 'Semua fitur Basic', ok: true },
          { t: 'Template premium dengan animasi dan efek visual', ok: true },
          { t: 'Musik latar dari daftar pilihan', ok: true },
          { t: 'Timeline kenangan dan galeri foto', ok: true },
          { t: 'Pesan personal dari pengirim', ok: true },
          { t: 'Revisi', ok: false } ] } },
    { id: 'special', nama: 'Special', harga: 79000, masaAktifHari: 365, maksFoto: 30,
      fitur: { tagline: 'Desain eksklusif dibuat khusus oleh kami, penuh kejutan.', foto: 'Foto lebih banyak + video', pembuatan: 'Manual, estimasi 1–2 hari kerja',
        fitur: [
          { t: 'Semua fitur Premium', ok: true },
          { t: 'Desain eksklusif dan layout kustom', ok: true },
          { t: 'Foto lebih banyak dan video pendek', ok: true },
          { t: 'Surprise interaktif: amplop digital dan pesan rahasia', ok: true },
          { t: 'Password opsional untuk pesan rahasia', ok: true },
          { t: 'Atur urutan cerita dan tampilan pembuka', ok: true },
          { t: '1× revisi gratis', ok: true } ] } }
  ],
  desain: [
    { id: 'DSN-001', nama: 'Cinematic Romance', kategori: 'Anniversary', paket: ['basic'], thumbnail: 'tema:cinematic', urlDemo: '' },
    { id: 'DSN-002', nama: 'Joyful Party', kategori: 'Ulang Tahun', paket: ['basic'], thumbnail: 'tema:joyful', urlDemo: '' },
    { id: 'DSN-003', nama: 'Cinematic Romantique', kategori: 'Anniversary', paket: ['special'], thumbnail: 'tema:cinematic', urlDemo: '' },
    { id: 'DSN-004', nama: 'Starry Night', kategori: 'Maaf & Rindu', paket: ['basic'], thumbnail: 'tema:starry', urlDemo: '' },
    { id: 'DSN-005', nama: 'Graduation Day', kategori: 'Wisuda', paket: ['basic'], thumbnail: 'tema:graduation', urlDemo: '' },
    { id: 'DSN-006', nama: 'Secret Garden', kategori: 'Terima Kasih', paket: ['basic'], thumbnail: 'tema:garden', urlDemo: '' },
    { id: 'DSN-007', nama: 'Mama Tersayang', kategori: 'Hari Spesial', paket: ['basic'], thumbnail: 'tema:mama', urlDemo: '' },
    { id: 'DSN-008', nama: 'Level Up Birthday', kategori: 'Ulang Tahun', paket: ['special'], thumbnail: 'tema:kids', urlDemo: '' },
    { id: 'DSN-009', nama: 'For Kids', kategori: 'Ulang Tahun', paket: ['basic'], thumbnail: 'tema:kids', urlDemo: '' },
    { id: 'DSN-010', nama: 'Hello, Little One', kategori: 'Kelahiran', paket: ['basic'], thumbnail: 'tema:baby', urlDemo: '' }
  ],
  musik: [],
  config: { BRAND_NAME: 'Dearora', TAGLINE: 'Kirimkan rasa & cerita lewat website ucapan spesial', KONTAK_EMAIL: '', BATAS_BAYAR_JAM: 24, MASA_TENGGANG_HARI: 7, MODE_BAYAR: 'simulasi', MAKS_VIDEO_MB: 25 }
};
