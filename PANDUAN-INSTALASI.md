# PANDUAN INSTALASI — Dearora (sampai Fase 4: Dashboard Admin & Rutinitas Otomatis)

| Bagian | Berkas | Dipasang di |
|---|---|---|
| Backend (API) | `Kode.gs`, `Pesanan.gs`, `Pembayaran.gs`, `Email.gs`, `Portal.gs`, `Kartu.gs`, **`Admin.gs`**, **`Rutin.gs`**, `appsscript.json` | Google Apps Script (akun Gmail **usaha**) |
| Frontend (toko, portal, kartu, **admin**) | isi `dearora-frontend-fase4.zip` | Vercel (via GitHub) |

Urutan: **A (backend) → B (password admin) → C (frontend) → D (uji) → E (iPaymu) → F (menuju rilis).**

---

## Pembaruan paket (Basic / Premium / Special) dan balasan penerima
**Ringkasan paket sekarang**
| Paket | Desain | Isian pembeli | Link |
|---|---|---|---|
| **Basic** | 9 desain template + 8 jenis kejutan | Surat, kejutan akhir, foto (hingga 3) | Otomatis, acak, aktif 10 hari |
| **Premium** | 6 desain eksklusif: Malam Film, Dearora Mall, Dunia Sahabat, Selebstyle, Soundtrack Kita, Lastlove | **Form khusus per desain** (episode, hadiah, memori, kiriman, lagu, misi), foto hingga 10 | Otomatis, acak, aktif 30 hari |
| **Special** | Tanpa contoh: pembeli menulis ide desain | Ide desain (min. 30 karakter), foto hingga 20 + 1 video, nama link opsional | Ibu mengerjakan manual lalu menekan **Tandai selesai & aktifkan** |

**Cara memasang pembaruan ini (urutan)**
1. Di Apps Script ganti isi: `Kode`, `Pesanan`, `Kartu`, `Pembayaran`, `Email`, `Portal`, `Admin`. **Tambahkan satu file baru** `Skema` (Skrip → nama `Skema`), tempel isi `Skema.gs`. Berkas ini dibuat otomatis dari `js/skema.js`; jangan diedit tangan.
2. Jalankan **`setupAppEnvironment`** (menambah kolom `DataDesainJSON`, `TglDilihat`, `UrlDiminta` dan sheet **Balasan**), lalu **`isiUlangKatalogDesain`** (enam desain masuk Premium, dua contoh Special dinonaktifkan). Deploy versi baru.
3. **Ubah baris Paket secara manual** di Admin → Pengaturan → Paket (data lama tidak otomatis berubah): Premium 30 hari + maks. foto 10 + tanda "Terfavorit"; Special maks. foto 20. Harga **diatur Ibu sendiri** (angka di seed hanyalah contoh). Teks fitur yang disarankan ada di bawah.
4. Timpa folder `dearora` dengan ZIP frontend terbaru, isi ulang `GAS_URL`, lalu `git push`.

**Teks fitur yang disarankan**
- Premium (tagline): *Pengalaman seperti aplikasi mini: pilih salah satu dari enam desain eksklusif.* Fitur: `+ Pilih satu dari 6 desain eksklusif`, `+ Isi sendiri: episode, hadiah, memori, kiriman, lagu, atau misi`, `+ Hingga 10 foto`, `+ Link acak dan privat, aktif 30 hari`, `+ Balasan dari penerima langsung ke akunmu`, `- Revisi`. Label sorotan: **Terfavorit**, centang "Jadikan paket sorotan" agar tampil di tengah.
- Special (tagline): *Desain 100% custom, dikerjakan langsung oleh kami sesuai ideamu.* Fitur: `+ Desain custom sesuai ide`, `+ Hingga 20 foto dan 1 video`, `+ Boleh meminta nama pada link; bentrok otomatis diberi angka`, `+ Pembayaran penuh di muka`, `+ 1× revisi gratis`, `+ Balasan dari penerima`.

**Paket Special: alur Ibu**
1. Pembeli memilih nama alamat (bagian depan saja, akhiran `.vercel.app` tetap). Bila nama sudah dipakai pesanan Special lain, sistem menambahkan angka (`laiba-2`). Sistem **tidak bisa memeriksa ketersediaan di Vercel**, jadi cek saat membuat proyeknya.
2. Pesanan dibayar penuh → status *Diproses*. Di detail pesanan Ibu melihat **ide desain**, **alamat yang dikunci**, foto/video, dan panel **Chat dengan pembeli**. Tulis pesan untuk memastikan warna, urutan foto, dll. Pembeli menerima email dan membalas dari portal.
3. Buat halaman di proyek Vercel terpisah, lalu tekan **Tandai selesai & aktifkan**. Kolom alamat sudah terisi alamat yang dikunci; ubah bila nama di Vercel berbeda (mis. karena bentrok).
4. **Revisi 1×**: pembeli mengajukan dari portal, Ibu mengerjakan lalu menekan tombol yang sama.
5. **Chat otomatis ditutup** setelah pesanan selesai dan jatah revisi habis (riwayatnya tetap terbaca).
6. Halaman Special buatan Ibu sendiri tidak otomatis mengirim status "dilihat" dan balasan; fitur itu hanya ada di halaman bawaan sistem (Basic dan Premium).
7. Saat kedaluwarsa, sistem hanya menghapus foto di Drive. Proyek Vercel dan repo Ibu harus dihapus sendiri.

**Pengaturan baru di Admin → Pengaturan → Umum:** `KONTAK_WA`, `KONTAK_JAM` (tampil di menu Kontak) dan `DOMAIN_SPECIAL` (bawaan `vercel.app`). Baris ini ditambahkan otomatis saat menjalankan `setupAppEnvironment`.

**Kategori desain** kini bebas: di editor desain, pilih kategori yang ada atau ketik yang baru (mis. Ulang Tahun Pernikahan). Kategori baru otomatis menjadi filter di katalog.

**Musik tanpa unggah ke GitHub.** Admin → Pengaturan → Musik: tempel tautan langsung berkas mp3 (`https://…mp3`). Tautan berbagi Google Drive/Dropbox diubah otomatis ke tautan unduh. Berkas Drive yang besar kadang tidak bisa diputar; hosting audio langsung lebih andal. Pembeli Basic dan Premium memilih musik pada langkah desain (Basic) atau di bagian terakhir isian desain (Premium). Gunakan musik yang berlisensi atau milik sendiri. Ubah teks fitur paket bila ingin mengiklankan musik latar.

**Riwayat pesanan.** Detail pesanan punya **Hapus dari riwayat** (permanen: baris pesanan, foto di Drive, chat, balasan, catatan bayar). Pesanan Dibayar/Diproses tidak bisa dihapus, yang Aktif butuh konfirmasi. Di daftar pesanan ada **Bersihkan riwayat** untuk semua yang Kedaluwarsa/Dibatalkan.

**Privasi pembeli.** Akun pembeli (kode redeem, password, sesi) dihapus otomatis setelah semua ucapannya kedaluwarsa dan masa tenggang lewat. Pada pesanan itu nama, WhatsApp, dan email juga dikosongkan; nomor pesanan, paket, nominal, dan tanggal tetap untuk pembukuan.

**Efek suara.** Dibuat langsung oleh browser (tanpa berkas audio), baru berbunyi setelah layar disentuh, dan penerima bisa mematikannya lewat tombol di kiri bawah.

**Status "sudah dilihat" dan balasan**
- Penerima dianggap *sudah melihat* saat mencapai slide terakhir. Di sana muncul kolom **Balas ucapan**; balasan masuk ke portal pembeli (Pesanan Saya → Detail) dan email.
- Balasan hanya bisa dikirim **sekali** per ucapan; setelah itu tombolnya tidak muncul lagi. Tidak ada akun untuk penerima.
- Tampilan akhir semua desain kini berbunyi **"Dibuat dengan penuh rasa oleh: {nama pengirim}"**. Promosi "Buat ucapan seperti ini" sudah dihapus dari kartu; hanya "Putar ulang" yang tersisa.

**Draf Saya.** Pembeli bisa menyimpan beberapa draf ucapan (tombol *Simpan & buat ucapan lain*) dan melanjutkannya dari panel "Draf Saya". Draf, **termasuk foto dan video**, tersimpan otomatis di browser itu saja (tidak pindah antarperangkat). Riwayat ucapan yang sudah dibayar ada di portal.

**Demo desain Premium** tetap bisa dicoba di katalog (tombol *Coba Demo*) dan langsung di `/s/?d=movie`, `mall`, `bestie`, `feed`, `musik`, `misi`. Catatan khusus: Soundtrack Kita hanya memutar audio bila tautannya https dan pembeli menyatakan tautan itu sah/berlisensi; tanpa audio berjalan sebagai "mode cerita". Karakter, markas, dan ikon semuanya orisinal; jangan menambahkan logo atau aset pihak lain.

## Pembaruan desain template (gaya baru)
1. Ganti lima file GAS: **`Kode`, `Pesanan`, `Kartu`, `Admin`, `Rutin`**, lalu **deploy versi baru**.
2. Jalankan **`isiUlangKatalogDesain`** sekali dari editor Apps Script. Fungsi ini memperbarui enam belas desain (ID `DSN-001` sampai `DSN-016`, termasuk kategori baru *Kelahiran* dan enam desain Premium) dan tidak menyentuh desain buatan Ibu sendiri. Pesanan lama tetap aman.
3. Timpa folder `dearora` dengan ZIP frontend terbaru (berkas baru: `js/art.js`, `js/gaya.js`, `css/gaya.css`, `css/scene.css`), isi ulang `GAS_URL`, lalu `git push`.
4. Kunci tema lama (`blossom`, `confetti`, `cinema`, ...) otomatis dipetakan ke gaya baru, jadi desain lama di sheet tetap tampil.
5. Opsi per desain (balon/love, bintang/awan, ikon keibuan) dipilih pembeli di langkah **Desain** dan disimpan di kolom `UrutanCerita`.

## A. Backend — Google Apps Script
**Pembaruan terbaru (pengalaman ucapan interaktif):** ganti isi **`Kode`**, **`Pesanan`**, **`Kartu`**, **`Rutin`**, dan **`Admin`**. Berkas lain tidak berubah. Lalu jalankan **`setupAppEnvironment`** (menambah kolom `KejutanJSON`) dan **deploy versi baru**.

Jika memasang dari awal:
1. Ganti isi **`Kode`**, **`Pesanan`**, **`Pembayaran`**, **`Email`**, **`Portal`**, **`Kartu`** dengan berkas yang baru.
2. Tambah **dua file baru**: **＋ → Skrip** → `Admin` dan `Rutin` (tanpa `.gs`) → tempel isinya.
3. Jalankan **`setupAppEnvironment`** (aman diulang): menambah kolom baru (`CatatanAdmin`, `PengingatKirim`, `TglDihapus`, `KejutanJSON`) tanpa menyentuh data Ibu.
4. **Deploy ulang**: Terapkan → Kelola deployment → ✏ → Versi baru → Terapkan. Setujui izin baru bila diminta (akses Drive dan email sudah ada).

## B. Membuat password admin (sekali, aman)
Password admin **tidak pernah ditulis di kode atau sheet**. Hanya hash-nya disimpan.
1. Apps Script → ⚙ **Setelan Proyek → Properti skrip → Tambah**:
   - `ADMIN_EMAIL` = email yang akan Ibu ketik saat login (boleh email apa saja, hanya sebagai nama pengenal),
   - `ADMIN_PASSWORD_BARU` = password baru, **minimal 12 karakter** (frasa panjang lebih baik).
2. Pilih fungsi **`aturPasswordAdmin`** → ▶ Jalankan.
3. Buka Log: `✅ Password admin tersimpan…`. Properti `ADMIN_PASSWORD_BARU` otomatis **dihapus**.
4. Lupa password atau ingin menggantinya? Ulangi langkah 1–3. Semua sesi admin lama otomatis dicabut dan kunci login (bila terkunci) dibuka.

> Login dikunci 15 menit setelah 5 kali salah (berlaku untuk siapa pun, termasuk bila password benar). Ini melindungi dari tebak-tebakan, tetapi artinya orang lain bisa "mengunci" Ibu sementara. Jalankan `aturPasswordAdmin` bila perlu masuk segera.

## C. Frontend — Vercel
Berkas baru yang penting pada pembaruan ini: **`u/index.html`**, `css/card.css`, `js/card.js` (halaman ucapan interaktif), serta perubahan pada `js/form.js` (langkah Kejutan Akhir) dan `js/app.js` (demo di katalog).
1. Ekstrak `dearora-frontend-fase4.zip`, **salin semua isinya** ke folder proyek `dearora` (jangan hapus folder `.git`), pilih "Ganti file".
2. Buka `js/config.js` dan **isi lagi `GAS_URL`**.
3. Dari folder yang berisi `index.html`:
   ```bash
   git add .
   git commit -m "Dearora fase 4"
   git push
   ```
4. Dashboard admin ada di **`https://ALAMAT-ANDA/admin/`** (tidak ditautkan dari toko, tidak diindeks mesin pencari). Simpan sebagai bookmark.

---

## C2. Paket Basic & Special saja, dan teks paket Basic
Premium tidak perlu dihapus. Cukup disembunyikan:
1. **Admin → Pengaturan → Paket & harga**, matikan sakelar **Premium**. Premium langsung hilang dari toko dan form.
2. Klik **Edit paket** pada **Basic**, lalu ganti kolom **Daftar fitur** dengan teks di bawah (data lama di sheet tidak otomatis berubah):
   ```
   + Sapaan manis + animasi confetti
   + Surat yang dibuka, berisi pesan pribadi dari pengirim
   + Kejutan akhir pilihanmu: kado, kuis, gosok, taman bunga, kue ulang tahun, dan lainnya
   + Tema warna sesuai momen
   + Link random, hanya yang diberi link bisa membuka
   - Musik latar
   - Revisi
   ```
   Tagline yang disarankan: *Ucapan interaktif yang dimainkan: ada surat, sapaan, dan kejutan pilihanmu.*

**Apa yang bisa diubah dari Pengaturan admin, dan apa yang perlu kode**
| Lewat Pengaturan admin | Perlu perubahan kode |
|---|---|
| Harga, masa aktif, jumlah foto maksimal, daftar fitur, aktif/nonaktif paket | Batas karakter surat per paket (Basic 300) |
| Nama, kategori, tema warna, dan paket tiap desain; tampil/sembunyi | Daftar delapan jenis kejutan dan cara kerjanya |
| Daftar musik, email kontak, batas waktu bayar | Kalimat sapaan tiap kategori, animasi, dan tata letak kartu |
| | Teks FAQ, Syarat & Ketentuan |

**Paket Special** dikerjakan manual: Ibu membuat halaman kustom, menempel alamatnya saat menekan **Tandai selesai & aktifkan** di detail pesanan, dan sistem menghitung masa aktif sejak itu.

## D. Uji dashboard admin
1. Buka `/admin/`, masuk dengan `ADMIN_EMAIL` dan password.
2. **Ringkasan**: pendapatan, grafik 30 hari, dan daftar "Perlu tindakan" (Special yang sedang dikerjakan, revisi, pembayaran perlu ditinjau, ucapan segera berakhir).
3. **Pesanan**: cari (ID, nama, email, WhatsApp), filter status/paket, ekspor CSV. Buka satu pesanan untuk melihat kontak pembeli, isi ucapan, foto (buka/unduh dari Drive), pembayaran, email, dan riwayat aktivitas.
4. **Paket Special**: di detail pesanan tekan **Tandai selesai & aktifkan** (opsional: isi alamat halaman kustom `https://…`). Email "Ucapanmu sudah jadi" otomatis dikirim ke pembeli.
5. **Revisi**: muncul di Ringkasan dan di detail. Selesai dikerjakan → tekan tombol yang sama; link dan masa aktif tidak berubah.
6. **Pengaturan**: ubah harga, masa aktif, jumlah foto, daftar fitur paket; tambah/ubah desain dan musik; ubah email kontak dan batas waktu bayar. Perubahan langsung tampil di toko. Harga baru hanya untuk pesanan baru.
7. Tombol **Tema** mengganti mode terang/gelap.

> Foto di halaman admin dimuat dari Google Drive. Jika gambar kecil tidak tampil, pastikan di browser yang sama Ibu sedang masuk ke akun Google yang menjadi pemilik Drive. Tautan **Buka/Unduh** di bawah foto tetap berfungsi.

---

## E. Menyambungkan iPaymu (sandbox)
Dokumentasi: https://docs.ipaymu.com/en/docs/getting-started
1. Daftar akun **sandbox** di https://sandbox.ipaymu.com. Dari menu **Integrasi** salin **VA** dan **API Key** sandbox.
2. Isi `IPAYMU_VA`, `IPAYMU_API_KEY`, ubah `PAYMENT_MODE` menjadi `sandbox`. Jalankan **`ujiKoneksiIpaymu`** sampai `✅ BERHASIL`.
3. Tidak perlu menempel URL webhook di dashboard iPaymu (alamat notifikasi dikirim bersama tiap pembayaran). Format callback: `application/x-www-form-urlencoded`.
4. Untuk "membayar" di sandbox, klik **"Klik Disini"** pada banner atas halaman pembayaran iPaymu, lalu tekan **←** untuk kembali ke Dearora.
5. Jika status tidak berpindah, lihat kolom `RawCallbackRingkas` di sheet `Pembayaran` dan menu **Eksekusi** di Apps Script.

**Belum terbukti, tanyakan ke iPaymu sebelum rilis:** IP statis & domain terdaftar di produksi (Apps Script memakai IP Google yang berubah); aturan pencairan dana *Escrow*; biaya per metode (VA bank bisa besar untuk harga Basic); perilaku webhook terhadap pengalihan 302.

---

## F. Menuju rilis
1. Jalankan **`cekKesiapanRilis`** dan perbaiki semua yang ❌ (termasuk `PAYMENT_MODE` jangan `simulasi`).
2. Isi `KONTAK_EMAIL` (di sheet Config atau Pengaturan → Umum).
3. Jalankan **`pasangTriggerHarian`** sekali. Tiap hari sekitar pukul 02.00 sistem akan:
   - membatalkan pesanan tak terbayar > batas waktu bayar,
   - mengaktifkan ulang pesanan Basic/Premium yang tertunda,
   - mengirim **pengingat email H-3** sebelum ucapan berakhir,
   - menandai ucapan yang lewat masa aktif sebagai **Kedaluwarsa** dan mencabut akses fotonya,
   - setelah **masa tenggang** (bawaan 7 hari): membuang folder foto di Drive dan mengosongkan isi pesan (catatan transaksi tetap ada untuk pembukuan),
   - menonaktifkan akun yang semua pesanannya sudah berakhir,
   - setiap hari **Minggu**: membuat salinan cadangan spreadsheet di Drive → `Dearora/backup` (8 salinan terakhir disimpan).
   Untuk mencoba tanpa menunggu: jalankan `rutinHarian_` atau `backupSekarang` dari editor.
4. Ubah `PAYMENT_MODE` ke `production` hanya setelah poin iPaymu di atas beres, lalu coba satu transaksi nyata kecil.
5. Ganti `WEBHOOK_TOKEN` dengan teks acak baru bila pernah terlihat orang lain.

## Jika link ucapan Basic belum aktif / tidak bisa dibuka
Desain yang dipilih **bukan** penyebabnya: desain hanya menentukan tampilan. Periksa berurutan:
1. **Buka sheet `Pesanan`, lihat kolom `Status` pesanan itu.**
   - `Menunggu Pembayaran` → pembayaran belum terkonfirmasi (lihat sheet `Pembayaran`, kolom `RawCallbackRingkas`).
   - `Dibayar` → link belum terbentuk. Buka **Admin → pesanan itu → Aktifkan sekarang**. Jika gagal, alasannya tampil. Penyebab yang umum: `SITE_URL` belum benar (harus `https://alamat-anda` tanpa `/` di akhir) atau Google menolak berbagi foto "siapa saja yang punya link" (terjadi pada akun Google Workspace/kampus, gunakan akun Gmail biasa untuk Dearora).
   - `Aktif` tetapi link menampilkan **404 dari Vercel** → aturan alamat `/u/...` di **`vercel.json`** belum aktif. Berkas **`404.html`** (jaring pengaman) otomatis mengalihkan `/u/{kode}` ke `/u/?k={kode}` walaupun `vercel.json` bermasalah, jadi pastikan `404.html` ada di GitHub di folder yang sama dengan `index.html`. Bila tetap bermasalah, buka dashboard Vercel → **Deployments** dan lihat apakah deployment terbaru berstatus **Error** (mis. karena `vercel.json` tidak valid); deployment gagal membuat situs tetap memakai versi lama.
   - `Aktif` dan halaman menampilkan "Ucapan tidak ditemukan" → `GAS_URL` di `js/config.js` mengarah ke deployment lama; buat versi baru deployment atau perbarui alamatnya.
2. Dashboard admin memuat daftar **"Dibayar tetapi link belum aktif"** agar hal ini tidak terlewat.

## Catatan penting
- Pengembalian dana (refund) dilakukan manual di dashboard iPaymu; dashboard Dearora hanya membatalkan/menonaktifkan pesanan.
- File musik tetap diunggah ke folder `assets/musik/` pada proyek Vercel (lewat GitHub); dashboard hanya mendaftarkan jalurnya.
- Sheet `Pesanan` dan `Akun` berisi data pribadi. Jangan bagikan akses Spreadsheet, termasuk folder `backup`.
- Kuota email Gmail biasa ±100/hari. Pantau sheet `EmailLog` dan kartu "Perhatian" di Ringkasan admin.
- Teks Syarat & Ketentuan dan Kebijakan Privasi disusun dari draf PRD; mohon ditinjau sebelum rilis.


## Pembaruan kecil (setelah fase 9)
- **Selebstyle:** kolom *Username penerima* bebas diisi apa saja (spasi dan simbol boleh) dan hanya jadi tampilan; kosong = memakai nama penerima. Jalankan ulang tempel `Skema.gs` terbaru ke Apps Script (file `Skema`, ganti isinya) lalu deploy versi baru.
- **Pilihan musik** kini berupa menu dropdown (menampilkan satu lagu terpilih + pemutar pratinjau), aman untuk puluhan sampai ratusan lagu. Ada catatan bahwa musik bebas hak cipta. **Pastikan hanya memasukkan musik yang memang bebas hak cipta atau berlisensi** agar catatan itu benar.
- **Demo desain** punya tombol *Tampilan HP* dan *Tampilan Desktop* (tombol tampil di layar lebar).
- **Efek suara** disesuaikan interaksi: balon melayang di desain Joyful bisa diketuk dan meletus; membuka amplop/surat berbunyi kertas; konfeti berbunyi letupan konfeti; kado, lilin, benih, kuis, dan lainnya punya bunyi masing-masing.


## Pembaruan: Premium = Basic + halaman konsep, dan bayar beberapa draf sekaligus
**Paket Premium kini memuat seluruh alur Basic** (pembuka → ucapan selamat → surat → kejutan pilihan → kenangan foto) **ditambah halaman konsep** sesuai desain yang dipilih (Malam Film, Dearora Mall, Dunia Sahabat, Selebstyle, Soundtrack Kita, Lastlove). Urutan bagi penerima: pembuka → ucapan → surat → **halaman konsep** → kejutan → kenangan. Status "dilihat" dan kolom balasan muncul di slide kenangan (paling akhir), seperti Basic. Tampilan lima slide mengikuti satu tema Basic yang dipasangkan dengan desainnya (Malam Film→Cinematic, Dearora Mall→Joyful, Dunia Sahabat→Secret Garden, Selebstyle dan Soundtrack Kita→Starry Night, Lastlove→Graduation); ubah di `DASAR_PREMIUM` pada `js/gaya.js` bila ingin pasangan lain.
Form pemesanan Premium sekarang punya langkah tambahan **Surat** dan **Kejutan Akhir**. Ucapan Premium yang dibuat sebelum pembaruan ini tetap bisa dibuka.
**Ubah teks fitur paket Premium** di Admin → Pengaturan → Paket bila perlu (data lama tidak otomatis berubah). Saran: *Semua alur Basic: pembuka, ucapan, surat, kejutan pilihan, dan kenangan foto* dan *Ditambah halaman konsep eksklusif …*.

**Bayar beberapa draf sekaligus.** Di panel **Draf Saya**, tiap draf yang sudah lengkap berstatus "Siap dibayar" beserta harganya dan bisa dicentang (maksimal 10). Tombol **Bayar N ucapan** membuat pesanan dan mengunggah foto dari penyimpanan browser, lalu membuat **satu pembayaran** untuk semuanya. Draf yang belum lengkap tidak bisa dicentang dan ditandai alasannya. Setelah dibayar, halaman status menampilkan daftar semua ucapan beserta link masing-masing, dan seluruhnya masuk ke **satu akun** (satu kode redeem). Draf yang sudah dibayar otomatis dihapus.
Pembeli yang membayar satu per satu lewat alur biasa tidak terpengaruh.
- Wajib: tambahkan kolom **GrupID** di sheet **Pembayaran** dengan menjalankan `setupAppEnvironment`, lalu deploy versi baru.
- Pembayaran gabungan ke iPaymu memakai satu transaksi dengan beberapa baris produk. Itu **belum diuji dengan iPaymu sandbox**; uji satu keranjang berisi 2 draf sebelum dipakai pembeli sungguhan.

**Foto draf.** Foto dan video draf tersimpan di browser (IndexedDB), jadi tidak perlu diunggah ulang untuk semua paket. Syaratnya browser dan perangkat yang sama, dan bukan mode penyamaran. Bila browser tidak mengizinkan, panel Draf Saya menampilkan peringatan.


## Pembaruan: skin Premium dan layar penyambung
- **Lima slide Premium tidak lagi memakai tampilan Basic.** Pembuka, ucapan, surat, kejutan, dan kenangan memakai warna, font, dan bingkai desain Premium yang dipilih: Malam Film (bioskop gelap, subtitle emas), Dearora Mall (banner oranye, kartu putih, tombol belanja), Dunia Sahabat (bingkai tebal bergaya game), Selebstyle (aplikasi sosial gelap), Soundtrack Kita (ungu pemutar musik), Lastlove (HUD misi). Struktur slide tetap sama, tampilannya berbeda.
- **Layar penyambung.** Sebelum masuk ke desain konsep, penerima melihat satu layar bertema dengan **kalimat buatan pembeli** (mis. "Selamat datang di kisah kita" untuk Malam Film, atau ajakan belanja untuk Dearora Mall), lalu tombol mulai (Mulai Film, Mulai Belanja, Mulai Petualangan, Buka Feed, Putar Sekarang, Terima Misi). Kolomnya bernama *Kalimat pengantar sebelum desain dimulai* di bagian pertama Isi Desain, **wajib diisi**, dan ada tombol "Isi dengan contoh". Pesanan Premium lama yang tidak punya kalimat ini langsung masuk ke desain.
- Wajib: ganti isi file `Skema` di Apps Script dengan `Skema.gs` terbaru (ada kolom baru `transisi`), lalu deploy versi baru.
- Skin ada di akhir `css/gaya.css` (kelas `.g-pmovie`, `.g-pmall`, dan seterusnya) dan layar penyambung di akhir `css/special.css` (`.jb-…`); warna dan font bisa disesuaikan di sana.
- Demo di katalog untuk desain Premium sudah memakai alur lengkap ini.


## Lima desain Premium baru (dari dokumen contoh_desain)
Premium kini punya **11 desain**. Lima yang baru:
| Desain | Alur halaman konsep | Isian pembeli |
|---|---|---|
| **Cinematic Romantique** | Bunga hidup bergerak → nama penerima muncul dari tumpukan bunga → bunga disapu menjadi pasir → nama ditulis di pasir → halaman romantis (foto + kata-kata) | Ucapan di bawah nama, kata di pasir, 3–6 halaman (foto + kalimat), pesan penutup |
| **Graduation Day** | Sampul majalah dengan foto wisuda besar → perjalanan perjuangan bertahap → surat penghargaan → lempar toga | Gelar, foto utama, 3–6 tonggak (waktu, judul, cerita, foto), surat |
| **Idul Fitri** | Gerbang zamrud (bulan sabit, lentera, masjid) → serambi → membuat kue lebaran → 3 pintu masjid berisi doa → permohonan maaf | Salam, ucapan setelah kue jadi, 3 doa, pesan maaf |
| **Imlek** | Perayaan merah-emas dengan kembang api → 3 lentera berisi harapan → angpao + kotak hadiah → barongsai (ketuk = koin emas) | Salam, 3 harapan, doa angpao, hadiah simbolis, doa penutup |
| **Fish It** | Laut, pulau, perahu → peta 3 spot (Memory Bay, Love Lagoon, Treasure Cove) → lempar kail, "ada sesuatu nih!", tarik kail → ikan, botol pesan, peti harta karun | 2–3 kenangan, 2–3 pesan manis, isi peti |

Seperti desain Premium lainnya: lima slide Basic (pembuka, ucapan, surat, kejutan, kenangan) tampil dengan **warna, font, dan bingkai tema desain itu**; sebelum halaman konsep ada **layar penyambung** berisi kalimat buatan pembeli.
**Cara memasang:** ganti file `Kode`, `Admin`, dan `Skema` di Apps Script (jangan membuat file baru), deploy versi baru, lalu jalankan **`isiUlangKatalogDesain`** agar kelima desain masuk katalog dan jalankan `setupAppEnvironment` bila belum. Timpa frontend, isi `GAS_URL`, `git push`. Teks fitur paket Premium bisa Ibu sesuaikan di Admin.
**Menambah desain Premium lagi nanti** perlu: isian di `js/skema.js`, mesin `js/sp-<kunci>.js`, skin di `css/gaya.css`, layar penyambung di `css/special.css`, entri di `js/gaya.js`, dan baris di Kode.gs (lalu `isiUlangKatalogDesain`).
Kategori **Idul Fitri** dan **Imlek** otomatis menjadi filter baru di katalog.


## "Lihat contoh" di langkah Kejutan Akhir
Tombol **Lihat contoh** pada tiap jenis kejutan kini **langsung membuka kejutannya saja** (tanpa slide pembuka, ucapan, dan surat) dengan catatan di atas: *"Contoh interaksi. Ini hanya gambaran cara kejutannya dimainkan. Isi ucapan, nama, dan fotonya nanti sesuai yang kamu tulis."* Ada tombol **Mainkan ulang**. Demo di katalog (Coba Demo) tetap memutar perjalanan lengkap. Ini hanya perubahan frontend.


## Putaran A: tiga desain Premium baru (total 14) dan filter kategori
| Desain | Alur halaman konsep | Isian pembeli |
|---|---|---|
| **Dearora Awards** | Karpet merah dan sorot lampu → buka amplop (drum) → "And the winner is…" → piala + alasan menang (ulang 3–5 kali) → pidato kemenangan | Nama acara, 3–5 penghargaan (nama + alasan), pidato |
| **Resep Kasih Sayang** | Kartu resep tulisan tangan → ketuk bahan masuk panci, tiap bahan membuka kenangan → aduk dan sajikan | Judul resep, 3–6 bahan (takaran, cerita, foto), nama hidangan + pesan utama |
| **Rumah Kenangan** | Rumah tampak depan → ketuk pintu → rumah tampak potong dengan 3–5 ruangan → ketuk benda di tiap ruangan → loteng berisi pesan utama | Judul, 3–5 ruangan (nama, benda, kenangan, foto), pesan loteng |
Pemasangan: ganti isi file `Kode`, `Admin`, dan `Skema` di Apps Script (bukan file baru), deploy versi baru, jalankan **`isiUlangKatalogDesain`**, lalu timpa frontend dan isi `GAS_URL`.
Langkah **Desain** pada form Premium kini punya **filter kategori** (Semua, Anniversary, Hari Ibu, Imlek, dst.) agar pembeli tidak menggulir 14 desain sekaligus. Kategori baru buatan admin otomatis ikut muncul.


## Putaran B: tiga desain Premium baru (total 17)
| Desain | Alur halaman konsep | Isian pembeli |
|---|---|---|
| **Brankas Rahasia** | Lobi brankas → 3 ruangan, tiap ruangan satu teka-teki (jawab → gembok terbuka + pesan) → putar roda → brankas terbuka berisi hadiah utama | Judul, 3 ruangan (nama, teka-teki, **jawaban**, petunjuk, pesan), isi brankas |
| **Hujan Reda** | Kaca berembun + hujan → usap kaca untuk membaca tiap kalimat, hujan mereda bertahap → pelangi → penjelasan dan maaf | 3–5 kalimat, penjelasan dan permintaan maaf |
| **Pengumuman Kelahiran** | Kartu gosok berisi kabar bahagia → pecahkan balon untuk membuka fakta → hitung mundur → pesan penutup (palet netral) | Kabar, foto, perkiraan hari lahir (opsional, format 2027-03-15), 3–5 fakta, pesan penutup |

**Brankas Rahasia: jawaban hanya di server.** Jawaban teka-teki dan isi brankas **tidak dikirim ke halaman penerima** (tidak ada di HTML maupun respons data kartu). Halaman hanya menerima nama ruangan, teka-teki, dan petunjuk; jawaban diperiksa lewat server (`brankasCek` per ruangan dan `brankasBuka` untuk brankas terakhir, yang memeriksa ulang SEMUA jawaban). Percobaan dibatasi 40 kali per 10 menit per ucapan. Huruf besar/kecil dan spasi diabaikan. Admin tetap dapat membaca jawaban di detail pesanan untuk keperluan bantuan.
**Memasang:** ganti isi file `Kode`, `Admin`, `Pesanan`, `Kartu`, dan `Skema` di Apps Script (bukan file baru), deploy **versi baru**, jalankan **`isiUlangKatalogDesain`**, lalu timpa frontend dan isi `GAS_URL`. Tanpa mengganti `Kartu` dan `Kode`, Brankas Rahasia tidak bisa memeriksa jawaban.


## Perbaikan Brankas Rahasia dan Hujan Reda
- **Brankas Rahasia di demo katalog** sempat menampilkan "Koneksi bermasalah (Ucapan tidak ditemukan)" karena demo mengira dirinya ucapan asli dan mencoba memeriksa jawaban ke server. Sekarang demo memeriksa jawaban contoh secara lokal (jawaban contoh ruangan pertama: *bandung*, kedua: *nasi goreng*, ketiga: *7*). Pada ucapan asli, jawaban tetap hanya diperiksa server.
- **Hujan Reda tidak lagi berpindah otomatis.** Setelah semua kalimat terbaca, hujan reda dan pelangi muncul, tetapi perpindahan ke penjelasan baru terjadi setelah penerima menekan **Lanjut**. Teks penjelasan muncul lebih pelan, dan tombol lanjut ke kejutan baru muncul setelah teks selesai dibaca. Warna kalimat disesuaikan agar tetap terbaca di latar pelangi.
- Perubahan ini hanya di frontend (tidak perlu mengganti file GAS).


## Paket baru: Invitation (Undangan Digital)
Paket keempat, **khusus undangan digital dengan konfirmasi hadir (RSVP)**. Pada tahap ini paketnya **sudah tampil, tetapi belum bisa dipesan**: desain undangannya menyusul.
- **Tampilan:** di halaman Paket & Harga, Invitation berupa kartu lebar terpisah di bawah tiga paket utama ("Untuk acara besar? Pakai undangan digital"). Tata letak tiga kolom (Premium di tengah) tidak berubah. Di langkah Paket pada form, Invitation muncul sebagai pilihan keempat dengan tanda **Segera hadir** dan belum bisa dipilih.
- **"Segera hadir" otomatis hilang** begitu ada minimal satu desain aktif untuk paket ini. Server juga menolak pesanan Invitation selama belum ada desain, jadi tidak ada pesanan yang tersangkut.
- **Data awal:** harga contoh Rp 99.000 (di atas Premium dan di bawah Special), aktif 90 hari, hingga 15 foto galeri. **Harga hanya contoh: atur sendiri di Admin → Pengaturan → Paket.**
- **Memasang:** ganti isi file `Kode` dan `Pesanan` di Apps Script (bukan file baru), jalankan **`setupAppEnvironment`** (menambah baris Invitation pada sheet Paket tanpa menyentuh harga paket lain), lalu deploy **versi baru**. Timpa frontend dan isi `GAS_URL`.
- **Catatan batas teks:** tiap baris fitur paket di admin maksimal **120 karakter**. Teks bawaan Premium sebelumnya terlalu panjang sehingga paket tidak bisa disimpan lewat admin; sudah diperbaiki di data bawaan.
- Desain undangan, form RSVP, dan daftar jawaban tamu dikerjakan pada tahap berikutnya.


## Paket Invitation: tiga desain undangan dan konfirmasi hadir (RSVP)
Paket **Invitation** kini bisa dipesan, dengan tiga desain: **Undangan Elegan** (pernikahan dan lamaran), **Undangan Ceria** (ulang tahun dan reuni), dan **Undangan Hangat** (syukuran, aqiqah, acara keluarga).

**Alur untuk tamu (tanpa slide Basic):** amplop bersegel yang dipecahkan → sambutan (menyapa tamu bila link personal) → detail 1–3 acara dengan tombol **peta** dan **Tambah ke kalender** → hitung mundur → galeri foto (hingga 15) → amplop digital (rekening/e-wallet dengan tombol salin; hanya informasi, Dearora tidak memproses pembayaran) → **konfirmasi hadir** (nama, hadir/belum pasti/tidak hadir, jumlah tamu, ucapan) → penutup.
**Jawaban tamu:** tersimpan di sheet **RSVP**. Tamu bisa **mengubah jawabannya** dari perangkat yang sama (kunci acak disimpan di perangkat tamu, tidak perlu akun). Batas bawaan **100 jawaban per undangan** (ubah di Admin → Pengaturan → Umum → `RSVP_MAKS`). Anti-spam: batas kecepatan per undangan dan kolom jebakan bot. Formulir memuat catatan "Jawabanmu hanya dilihat oleh pengundang". Data yang disimpan hanya nama, status, jumlah, dan ucapan (tanpa nomor HP/email tamu).
**Untuk pembeli (portal → Pesanan Saya → Detail):** ringkasan (hadir + jumlah orang, belum pasti, tidak hadir, jumlah jawaban), daftar jawaban lengkap, **Unduh daftar (CSV)**, hapus jawaban, dan **pembuat tautan personal**: tempel nama tamu (satu per baris), lalu dapatkan link dengan `?u=Nama` untuk dibagikan lewat WhatsApp. Daftar nama itu tidak disimpan di server.
**Aktif 90 hari**, link acak dan privat. Semua jawaban **otomatis terhapus** saat link kedaluwarsa atau pesanan dihapus. Disarankan memesan paling lambat sekitar 2 bulan sebelum acara; sebelum kedaluwarsa, pembeli sebaiknya mengunduh CSV (fitur Perpanjang di admin tetap bisa dipakai).
**Pemasangan:** ganti isi file `Kode`, `Pesanan`, `Kartu`, `Portal`, `Admin`, `Rutin`, dan `Skema` di Apps Script (bukan file baru), jalankan **`setupAppEnvironment`** (membuat sheet RSVP dan config `RSVP_MAKS`) lalu **`isiUlangKatalogDesain`** (menambah tiga desain undangan), dan deploy **versi baru**. Timpa frontend, isi `GAS_URL`, `git push`.
Harga Invitation tetap Ibu atur di Admin → Pengaturan → Paket.


## Pembayaran dengan Midtrans (pilihan di samping iPaymu)
Backend kini mendukung **dua gateway**; yang aktif ditentukan satu Script Property. Kode iPaymu tetap ada, dan bawaannya masih iPaymu.
**Mengapa Midtrans cocok untuk Apps Script:** untuk integrasi standar (Snap) Midtrans tidak mewajibkan IP statis; permintaan cukup diotorisasi dengan Server Key. Midtrans menerima akun **perorangan** (KTP + NPWP).

**Langkah:**
1. Daftar di dashboard Midtrans (sandbox langsung bisa dipakai), lalu ajukan dokumen untuk production (KTP, NPWP, website atau media sosial).
2. Di dashboard Midtrans, pilih lingkungan **Sandbox** → Settings → **Access Keys**, salin **Server Key** (berawalan `SB-`).
3. Apps Script → Project Settings → **Script Properties**, tambahkan:
   - `PAYMENT_GATEWAY` = `midtrans`
   - `MIDTRANS_SERVER_KEY` = Server Key sandbox tadi
   - `PAYMENT_MODE` = `sandbox`
4. Jalankan **`ujiKoneksiMidtrans`** di editor, baca Log eksekusi: harus muncul "BERHASIL" beserta URL pembayaran uji.
5. Di dashboard Midtrans → Settings → **Configuration**:
   - **Payment Notification URL**: `https://dearora.app/api/midtrans-notify` (lihat perantara di bawah). Alternatif langsung: jalankan `tampilkanUrlWebhook` dan pakai URL "Midtrans — URL webhook langsung".
   - **Finish/Unfinish/Error Redirect URL**: boleh diisi `https://dearora.app/status.html`. Pesanan memakai alamat finish sendiri lewat API, jadi pengaturan ini hanya cadangan.
6. Uji pembayaran di sandbox memakai simulator Midtrans (QRIS/VA), termasuk keranjang (beberapa ucapan sekaligus).
7. **Production:** setelah akun disetujui, ambil Server Key **Production** (tanpa `SB-`), isi ulang `MIDTRANS_SERVER_KEY`, ubah `PAYMENT_MODE` ke `production`, jalankan `cekKesiapanRilis`, lalu uji satu transaksi nyata kecil (Midtrans meminta minimal Rp10.000).
Untuk kembali ke iPaymu: ubah `PAYMENT_GATEWAY` ke `ipaymu`. Pesanan yang sudah dibayar tidak terpengaruh, dan sesi pembayaran yang belum selesai otomatis dibuatkan ulang di gateway yang aktif.

**Perantara webhook (`api/midtrans-notify.js`):** uji "Payment Notification URL" Midtrans mengharapkan balasan HTTP 200 langsung, sedangkan Web App Apps Script membalas POST dengan pengalihan (302). Fungsi serverless di folder `api/` menerima notifikasi di `https://dearora.app/api/midtrans-notify`, meneruskannya ke Apps Script, lalu membalas 200. Pasang dengan: Vercel → Settings → **Environment Variables**, tambahkan `GAS_URL` (URL Web App `/exec`) dan `WEBHOOK_TOKEN` (sama dengan Script Property `WEBHOOK_TOKEN`), lalu **Redeploy**. Notifikasi tidak dipercaya begitu saja: backend memeriksa tanda tangan Midtrans dan memverifikasi ulang ke API status Midtrans.
**Keamanan:** nominal selalu dari sheet Paket; status lunas baru dicatat setelah server memverifikasi ke API Midtrans (order_id dan nominal cocok); pemrosesan idempoten. Halaman status juga memverifikasi sendiri bila notifikasi terlambat.
**Pemasangan GAS:** ganti isi file `Pembayaran` dan `Kode` (bukan file baru), lalu deploy versi baru.


## Urutan langkah form pemesanan (desain lebih dulu, data pemesan di akhir)
Pembeli memilih **desain** tepat setelah memilih paket, supaya langsung terbayang, dan mengisi **data pemesan** di akhir.
- **Basic:** Paket → Desain → Untuk Siapa → Surat → Kejutan Akhir → Foto → Catatan → Data Pemesan → Ringkasan
- **Premium:** Paket → Desain → Untuk Siapa → Surat → Kejutan Akhir → Foto → Isi Desain → Catatan → Data Pemesan → Ringkasan
- **Invitation:** Paket → Desain → Untuk Siapa → Foto → Isi Desain → Catatan → Data Pemesan → Ringkasan
- **Special:** Paket → Untuk Siapa → Foto → Ide Desain → Catatan → Data Pemesan → Ringkasan (tanpa langkah desain)

Isi Desain tetap setelah Foto karena pilihan foto di situ memakai foto yang sudah diunggah.
- **Dari katalog:** tombol "Pakai Desain" langsung membuka **Untuk Siapa** (desain sudah dipilih); tombol Kembali membuka Desain dengan pilihan tadi tetap terpilih.
- **Draf lama** (tersimpan dengan urutan lama) otomatis dipulihkan ke langkah yang sama.
- **Pembeli yang sudah login:** pemberitahuan "Masuk sebagai ..." muncul di langkah Data Pemesan di akhir.
- **Data pemesan diingat di perangkat** (nama, WhatsApp, email) setelah langkahnya dilewati, agar pesanan berikutnya, terutama di keranjang, tidak mengetik ulang. Disimpan hanya di browser pembeli, dapat diubah, dan tidak membuat draf kosong. (Kunci penyimpanan: `dearora:pemesan`.)
- Perubahan ini **hanya di frontend**; tidak ada file GAS yang perlu diganti.


## Pembaruan: akun, hapus massal, musik Premium, dan suara per desain
**Pemasangan GAS (urutan penting):** ganti isi file `Kode`, `Pesanan`, `Kartu`, `Admin`, `Portal`, dan `Email` di Apps Script (bukan file baru) → jalankan **`setupAppEnvironment`** (menambah 4 kolom di sheet **Akun**: `ResetHash`, `ResetSalt`, `ResetSampai`, `ResetCoba`) → deploy **versi baru**. Lalu timpa frontend, isi ulang `GAS_URL`, `git push`.

**1. Masuk dan lupa password.** Pembeli masuk dengan **email atau kode redeem** + password. Kode redeem tetap dipakai pertama kali untuk membuat password. Tersedia **"Lupa password atau kehilangan kode?"**: kode 6 angka dikirim ke email pemesan (berlaku 30 menit, maksimal 3 permintaan per jam per email, terkunci setelah 5 tebakan salah). Berlaku juga bagi pembeli yang belum pernah membuat password atau kehilangan kodenya. Setelah password diganti, sesi lama di perangkat lain berakhir. Jika satu email dipakai pada beberapa akun lama, atur ulang berlaku untuk semuanya. Sistem tidak membocorkan apakah sebuah email terdaftar.
**Email:** tanda terima (saat pembayaran terverifikasi) dan "Ucapanmu sudah jadi" (saat link aktif; untuk Special saat admin menyelesaikan) sudah ada sebelumnya; teksnya kini menjelaskan cara masuk. Bila email tidak diterima, periksa sheet **EmailLog** (kolom Status), izin pengiriman email di Apps Script, dan jalankan `cekKesiapanRilis`.

**2. Hapus beberapa pesanan sekaligus (admin).** Admin → Pesanan → **Pilih untuk dihapus**: centang pesanan, atau "Pilih semua yang bisa dihapus", lalu **Hapus terpilih**. Pesanan Dibayar/Diproses dilewati otomatis; pesanan Aktif hanya terhapus setelah konfirmasi. Maksimal 100 pesanan per permintaan. Berkas, chat, balasan, dan jawaban tamu ikut terhapus.

**3. Musik latar hanya untuk Premium.** Pilihan musik muncul di bagian terakhir *Isi Desain* (Premium). Basic, Special, dan Invitation tidak menawarkan musik; langkah Catatan pada Basic dan Invitation tidak lagi menyebut permintaan lagu. Server mengabaikan musik untuk paket selain Premium.

**4. Suara per desain.** Setiap desain punya bunyi klik tombolnya sendiri dan bunyi khas pada interaksinya (air, gesekan kaca, kertas, bedug, gong, kasir, klaket, tepuk tangan, dan lainnya); latar hujan/ombak berhenti otomatis saat layar desain ditutup. Semua bunyi disintesis di browser (tanpa berkas, tanpa hak cipta). Untuk menyetel: buka **`https://dearora.app/suara-uji.html`** (halaman bantu, tidak diindeks), dengarkan satu per satu, lalu sebutkan nama bunyi yang kurang pas. Bunyi baru hanya terdengar setelah penerima menyentuh layar dan mengikuti tombol suara.


## Pembaruan: satu email = satu akun, dan desain tanpa kategori ucapan
**Pemasangan GAS:** ganti isi file `Kode`, `Pesanan`, `Kartu`, `Admin`, `Portal`, `Email`, dan `Pembayaran` di Apps Script (bukan file baru), jalankan `setupAppEnvironment`, lalu deploy **versi baru**. Timpa frontend, isi ulang `GAS_URL`, `git push`.

**1. Satu email = satu akun.** Sebelumnya, pembeli yang memesan lagi memakai email yang sama tanpa login mendapat akun baru dengan kode baru, sehingga pesanannya terpecah ke beberapa akun. Sekarang saat pembayaran terverifikasi, pesanan baru otomatis **digabung ke akun aktif dengan email itu** (huruf besar/kecil tidak berpengaruh; berlaku juga untuk keranjang). Bila akun lama belum punya password, kode redeem yang sama dikirim ulang; bila sudah punya password, pesanan "ditambahkan ke akunmu" tanpa kode baru. Email berbeda tetap akun terpisah. **Balasan penerima** sudah tampil di detail pesanan pada akun pemilik pesanan; yang sebelumnya terasa "tidak muncul" terjadi bila pembeli masuk ke akun yang berbeda dari akun pesanannya.
**Data lama:** akun ganda yang sudah terbentuk tidak digabung otomatis. Jalankan sekali dari editor Apps Script: **`gabungAkunSamaEmail`** (pilih fungsi → ▶, baca Log eksekusi). Pesanan dipindah ke akun utama (yang sudah punya password dulu, lalu yang tertua), akun lainnya ditandai "digabung". Aman dijalankan ulang. Setelah itu pembeli masuk dengan **email** untuk melihat semua pesanan.

**2. Desain tanpa kategori ucapan.** Desain hanya dikelompokkan per **paket** (Basic, Premium, Invitation). Dihapus: bagian "Kategori Ucapan" di beranda, filter kategori di Contoh Desain dan di langkah Desain, label kategori pada kartu desain dan modal demo, serta kolom Kategori di editor desain admin. Judul pembuka kartu Basic kini netral ("Ada Pesan Untukmu") sehingga cocok untuk ucapan apa pun. Kolom `Kategori` di sheet Desain boleh dibiarkan (tidak dipakai); jalankan `isiUlangKatalogDesain` bila ingin membersihkannya dari data bawaan.


## Perbaikan: kilasan slide surat sebelum desain Premium tampil
**Gejala:** pada desain Premium (mis. Imlek), setelah layar penyambung, slide *surat* sempat muncul sekitar 1 detik lalu hilang sendiri. **Penyebab:** halaman desain Premium dipasang *di atas* slide kartu, tetapi tiap layar desain muncul dengan fade-in dari transparan (dan layar penyambung juga memudar masuk/keluar), sehingga slide kartu di bawahnya tembus sesaat. **Perbaikan (hanya frontend):** slide kartu disembunyikan selama halaman konsep tampil dan dipulihkan saat kembali ke Kejutan, setiap desain memakai warna dasar sendiri di belakang layarnya, dan fade layar penyambung kini hanya memudarkan isinya (bukan seluruh lapisan). Pengujian per-frame (±140 frame per desain) untuk Imlek, Romantique, Resep, Malam Film, Fish It, dan Idul Fitri tidak lagi menemukan slide kartu yang tembus; uji yang sama gagal di versi sebelumnya.


## Undangan Pernikahan (versi baru yang lebih estetik) dan foto opsional
Desain **Undangan Pernikahan** (sebelumnya "Undangan Elegan", DSN-028) dirancang ulang dengan tema pernikahan:
- **Amplop bunga:** tirai bunga menggantung, amplop dengan segel monogram, kelopak berguguran. Saat segel diketuk: tutup amplop terbuka, kartu naik, kelopak berhamburan, lalu layar berganti dengan transisi halus.
- **Hiasan bunga SVG orisinal** (mawar, daun, ranting, karangan, pembatas emas) di empat sudut dengan gerak goyang pelan dan parallax lembut saat digulir. Kelopak berguguran terus selama dibaca.
- **Isi:** karangan bunga melingkar berisi monogram atau foto pasangan, nama pasangan, **mempelai** (nama + "putra/putri dari"), kutipan atau ayat, 1–3 acara (peta, tambah ke kalender), hitung mundur, **Kisah Kita** (garis waktu hingga 4 momen), galeri foto dengan perbesar (zoom), amplop digital, konfirmasi hadir dengan ucapan, dan penutup.
- **Foto semuanya opsional:** foto utama, foto mempelai, foto kisah, dan galeri. Tanpa foto, undangan memakai monogram dan mawar sebagai pengganti. Di form, langkah Foto untuk paket Invitation **boleh dilewati tanpa mengunggah foto** (di server, hanya Invitation yang boleh tanpa foto; Basic dan Premium tetap wajib).
- **Gerak halus:** semua animasi dihentikan bagi pengguna yang mengaktifkan "kurangi gerak" di perangkatnya.
- **Akun pembeli:** ucapan dan kehadiran tamu tampil di Portal → detail pesanan (nama, hadir/belum pasti/tidak hadir, jumlah, ucapan, waktu) dan daftar pesanan menandai "n tamu merespons". Unduh CSV dan tautan personal tetap tersedia.
- **Font:** nama pasangan memakai font tulisan tangan *Great Vibes* dari Google Fonts (dimuat otomatis; bila gagal dimuat, tampil huruf serif biasa).

**Pemasangan:** ganti isi file `Kode`, `Pesanan`, `Kartu`, `Admin`, `Portal`, `Email`, `Pembayaran`, dan `Skema` di Apps Script (bukan file baru), deploy **versi baru**, lalu jalankan **`isiUlangKatalogDesain`** agar nama desain berubah menjadi "Undangan Pernikahan" (atau ubah namanya manual di Admin → Desain). Timpa frontend, isi ulang `GAS_URL`, `git push`.
**Catatan pesanan lama:** pesanan Undangan Elegan yang sudah dibuat dengan skema lama tetap tampil (nama pasangan diambil dari judul, tanpa bagian mempelai), tetapi tidak memiliki mempelai, kutipan, dan kisah. Undangan Ceria dan Hangat tidak berubah.


## Lima tema undangan pernikahan baru (paket Invitation: kini 8 desain)
Selain **Undangan Pernikahan** (bunga), tersedia: **Undangan Islami Elegan**, **Undangan Rustic Boho**, **Undangan Malam Bintang**, **Undangan Adat Jawa**, dan **Undangan Klasik Royal**. Semuanya memakai satu mesin (struktur isi, konfirmasi hadir, akun pembeli, foto opsional sama persis), dengan hiasan SVG orisinal buatan kode, pembuka, warna, dan bunyi sendiri.
| Tema | Pembuka | Ciri khas | Bunyi |
|---|---|---|---|
| Islami Elegan | Pintu lengkung (mihrab) terbuka, cahaya keemasan | Bismillah (Arab) dan salam, ornamen bintang delapan, hijau zamrud dan emas, kicker "Walimatul Ursy" | lonceng lembut |
| Rustic Boho | Amplop kraft | Ranting eukaliptus dan bunga kering, foto berbingkai polaroid bertape, daun berguguran | kertas, petikan |
| Malam Bintang | Langit berbintang, rasi bintang menyala, bintang jatuh | Tema gelap (teks terang, formulir disesuaikan), kerlip bintang | kerlip bintang, kotak musik |
| Adat Jawa | Layar wayang (kelir) terbuka, gunungan menyala | Pola batik kawung, bunga melati berguguran, kicker "Sugeng Rawuh" | kenong gamelan |
| Klasik Royal | Tirai beludru bordeaux terbuka | Bingkai emas berukir, fleur-de-lis, karangan laurel, debu emas | gerak tirai, fanfare |
**Isian sama untuk semua tema pernikahan:** nama pasangan, sambutan, kutipan/ayat (maks. 320 karakter), dress code, foto utama, penutup, mempelai (nama, "putra/putri dari", foto), 1–3 acara, kisah (maks. 4), galeri, amplop digital, pengaturan konfirmasi hadir. Semua foto opsional (tanpa foto: monogram dan ornamen tema). Contoh isian tiap tema sudah bernuansa temanya.
**Catatan konten (mohon diperiksa sendiri):** teks Arab hanya bismillah standar; contoh ayat (QS. Ar-Rum: 21) berupa terjemahan Indonesia; contoh "Sugeng rawuh" dan istilah adat/upacara bersifat contoh. Pembeli dapat mengubah semua teks. Periksa kesesuaian budaya dan agama sebelum dijual.
**Font:** *Amiri* (Arab) dan *Great Vibes* dimuat dari Google Fonts; bila gagal dimuat, tampil huruf biasa.
**Pemasangan:** ganti isi `Kode`, `Pesanan`, `Kartu`, `Admin`, `Portal`, `Email`, `Pembayaran`, dan `Skema` di Apps Script (bukan file baru), deploy **versi baru**, jalankan **`isiUlangKatalogDesain`** (menambah 5 desain baru), lalu timpa frontend, isi ulang `GAS_URL`, `git push`.


## Undangan khitanan dan syukuran (4 desain baru) + modal demo undangan
Paket Invitation kini punya **12 desain**. Empat desain baru untuk **acara keluarga**:
| Desain | Acara | Pembuka | Ciri khas |
|---|---|---|---|
| **Sultan Cilik** | Khitanan | Mahkota emas turun ke bantal beludru | Bendera segitiga warna-warni, bintang berhamburan, bismillah |
| **Islami Ceria** | Khitanan | Tiga lentera menyala satu per satu | Bulan sabit dan bintang, bismillah dan salam, hijau dan kuning |
| **Tumpeng & Doa** | Syukuran/tasyakuran | Tumpeng beruap di atas daun pisang terbuka | Daun pisang dan marigold berguguran |
| **Rumah Baru** | Syukuran rumah | Pintu rumah terbuka, jendela menyala | Lampu hias dan tanaman rambat, bunyi ketuk lalu pintu berderit |
**Isian (berbeda dari pernikahan):** judul acara, sambutan, doa atau harapan, dress code, foto utama (opsional), penutup; **satu tokoh** (nama anak atau tuan rumah, keterangan, foto opsional); 1–3 acara; **petunjuk lokasi atau parkir**; **tautan siaran langsung** (opsional, wajib https, tampil sebagai tombol "Tonton siaran langsung"); **susunan acara** (hingga 6 kegiatan berjam); galeri; amplop digital; konfirmasi hadir (jumlah tamu membantu perkiraan porsi dan terlihat di akun pembeli). Semua foto opsional; tanpa foto tampil ornamen (mahkota, bulan sabit, tumpeng, rumah).
**Modal demo di katalog:** untuk desain **undangan**, pilihan "Coba kejutan" (Kado, Kuis, Gosok, dst.) dan keterangan "Paket Premium" sudah dihapus karena konsepnya berbeda; diganti keterangan "Demo undangan interaktif: amplop pembuka → halaman undangan → konfirmasi hadir (simulasi)". Desain Basic dan Premium tidak berubah.
**Catatan konten:** doa dan istilah (walimatul khitan, tasyakuran) adalah contoh yang mudah diubah pembeli; mohon periksa kesesuaiannya.
**Pemasangan:** ganti isi `Kode`, `Pesanan`, `Kartu`, `Admin`, `Portal`, `Email`, `Pembayaran`, dan `Skema` di Apps Script (bukan file baru), deploy **versi baru**, jalankan **`isiUlangKatalogDesain`** (menambah 4 desain), lalu timpa frontend, isi ulang `GAS_URL`, `git push`.


## Undangan dengan sapaan sesuai nama tamu ("Kepada Yth. Saudari Siska")
Setiap tamu kini dapat disapa **sesuai nama dan sebutannya** di semua desain undangan (12 desain): pada amplop pembuka dan bagian awal halaman tampil mis. **"Kepada Yth. Saudari Siska"**, **"Kepada Yth. Bapak Budi Santoso"**, **"Kepada Yth. Ibu Ani beserta Keluarga"**, **"Kepada Yth. Kak Dewi & Pasangan"**. Tanpa tautan personal tampil "Bapak/Ibu/Saudara/i".
**Cara kerja:** tautan membawa tiga parameter: `u` (nama), `s` (sebutan: bapak, ibu, saudara, saudari, kak, bapakibu, saudarai), `x` (sufiks: keluarga atau pasangan). Hanya nilai dari daftar itu yang dipakai; nama dibersihkan dari tanda HTML (aman). Kolom nama di formulir konfirmasi hadir terisi **nama saja** ("Siska"), sehingga jawaban tersimpan tanpa sebutan.
**Pembuat tautan di Portal** (Pesanan Saya → detail pesanan undangan → "Buat tautan personal untuk tiap tamu"):
1. Tempel nama tamu, **satu per baris**. Tulis sebutan di depan nama bila perlu: *Saudari Siska*, *Bapak Budi*, *Bpk. Budi*, *Ibu Ani*, *Kak Dewi*, *Sdr. Raka*. Tambahkan *keluarga* atau *pasangan* di belakang (mis. *Ibu Ani dan keluarga*).
2. Untuk nama tanpa sebutan, pakai pilihan **"Sebutan untuk nama tanpa sebutan"** (mis. semua jadi "Saudara/i" atau "Kak").
3. Ubah **pesan pengantar** bila perlu. `{sapa}` dan `{link}` diganti otomatis untuk tiap tamu.
4. Klik **Buat tautan**: tiap tamu menampilkan sapaannya (untuk diperiksa), tombol **Salin**, dan tombol **WhatsApp** yang membuka WhatsApp dengan pesan jadi (pembeli memilih penerimanya). Tersedia juga **Salin semua**.
**Privasi:** daftar nama, sebutan, dan pesan hanya diproses di browser pembeli dan **tidak disimpan di server**. Nomor WhatsApp tamu tidak diminta.
**Batasan yang perlu diketahui:** nama ada di alamat tautan, jadi tamu dapat mengubahnya sendiri (hanya memengaruhi sapaan di layarnya). Pelacakan "siapa yang sudah membuka atau belum menjawab" belum ada (rencana tingkat berikutnya, dengan daftar tamu di server). **Hanya frontend yang berubah; tidak ada file GAS yang perlu diganti.**
