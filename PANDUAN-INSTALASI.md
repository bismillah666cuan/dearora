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
