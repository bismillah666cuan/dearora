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
1. Pesanan dibayar penuh → status *Diproses*. Di detail pesanan Ibu melihat **ide desain**, **nama link yang dikunci** (mis. `/u/siska-2`), dan foto/video.
2. Buat halaman kustomnya. Jika memakai folder, buat `u/siska-2/index.html` di repo (berkas ini diutamakan Vercel daripada template), lalu `git push`.
3. Tekan **Tandai selesai & aktifkan**. Kolom alamat boleh dikosongkan (memakai `/u/nama-yang-dikunci`) atau diisi alamat lain. Masa aktif dihitung sejak saat itu dan email "Ucapanmu sudah jadi" terkirim.
4. **Revisi 1×**: pembeli mengajukan dari portal (status kembali *Diproses*), Ibu mengerjakan lalu menekan tombol yang sama; kuota habis setelah sekali.
5. Saat kedaluwarsa, sistem hanya menghapus foto di Drive. **Halaman kustom di repo harus Ibu hapus sendiri.**

**Status "sudah dilihat" dan balasan**
- Penerima dianggap *sudah melihat* saat mencapai slide terakhir. Di sana muncul kolom **Balas ucapan**; balasan masuk ke portal pembeli (Pesanan Saya → Detail) dan email.
- Anti-spam: maksimal 5 balasan per ucapan per hari. Tidak ada akun untuk penerima.
- Tampilan akhir semua desain kini berbunyi **"Dibuat dengan penuh rasa oleh: {nama pengirim}"**. Tautan "Buat ucapan seperti ini" pada kartu Basic masih ada; hapus di `js/card.js` bila tidak diinginkan.

**Draf Saya.** Pembeli bisa menyimpan beberapa draf ucapan (tombol *Simpan & buat ucapan lain*) dan melanjutkannya dari panel "Draf Saya". Draf tersimpan di browser itu saja dan **foto tidak ikut tersimpan**. Riwayat ucapan yang sudah dibayar ada di portal.

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
