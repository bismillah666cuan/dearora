# PANDUAN INSTALASI — Dearora (sampai Fase 2: Pemesanan & Pembayaran)

| Bagian | Berkas | Dipasang di |
|---|---|---|
| Backend (API) | `Kode.gs`, `Pesanan.gs`, `Pembayaran.gs`, `Email.gs`, `appsscript.json` | Google Apps Script (akun Gmail **usaha**) |
| Frontend (toko) | isi ZIP `dearora-frontend-fase2.zip` | Vercel (via GitHub) |

Urutan: **A (backend) → B (frontend) → C (uji mode simulasi) → D (iPaymu sandbox) → E (menuju rilis).**

---

## A. Backend — Google Apps Script

### A1. Pasang atau perbarui kode
Jika proyek **Dearora API** dari Fase 1 sudah ada, perbarui. Jika belum, buat dulu (script.google.com → Proyek baru).

1. Buka `Kode.gs` di editor, hapus isinya, tempel isi `Kode.gs` yang baru.
2. Tambah tiga file: tombol **＋ → Skrip** → beri nama `Pesanan`, `Pembayaran`, `Email` (tanpa `.gs`), lalu tempel isi masing-masing berkas.
3. **⚙ Setelan Proyek** → centang **Tampilkan file manifes "appsscript.json" di editor** → buka `appsscript.json` → ganti isinya dengan berkas `appsscript.json` (mengatur zona waktu Asia/Jakarta).

### A2. Jalankan setup lagi (aman diulang)
Pilih fungsi **`setupAppEnvironment`** → ▶ Jalankan. Izinkan izin baru (kirim email, akses layanan eksternal).
Fungsi ini **tidak menimpa** data Ibu; ia menambah kolom baru di sheet dan membuat `WEBHOOK_TOKEN` secara otomatis. Cek Log: ada `MODE BAYAR : simulasi`.

### A3. Isi pengaturan rahasia
**⚙ Setelan Proyek → Properti skrip → Tambah properti:**

| Nama | Isi | Keterangan |
|---|---|---|
| `SITE_URL` | `https://dearora.vercel.app` | Alamat toko Ibu, **tanpa** garis miring di akhir |
| `PAYMENT_MODE` | `simulasi` | Biarkan `simulasi` dulu (lihat peringatan di bawah) |
| `IPAYMU_VA`, `IPAYMU_API_KEY` | dari dashboard iPaymu | Diisi di bagian D |

> ⚠️ **Mode `simulasi` TANPA uang sungguhan: siapa pun bisa "membayar" gratis.** Pakai hanya untuk uji coba. Sebelum rilis wajib `production` (bagian E).

### A4. Deploy ulang
**Terapkan → Kelola deployment → ✏ (edit) → Versi: Versi baru → Terapkan.** URL `/exec` tetap sama.
Jika baru pertama kali: Deployment baru → Aplikasi web → Jalankan sebagai **Saya**, Akses **Siapa saja**.

Tes cepat di browser: `URL_EXEC?action=getPublicData` harus menampilkan data. Di bagian `config` terlihat `"MODE_BAYAR":"simulasi"`.

---

## B. Frontend — Vercel
1. Ekstrak ZIP. Folder hasil ekstraksi **itulah folder proyek** (isinya langsung `index.html`, `status.html`, `css`, `js`).
2. Buka `js/config.js`, isi `GAS_URL` dengan URL `/exec` dari A4.
3. Dorong ke GitHub **dari folder yang berisi `index.html`** (akun GitHub Dearora):
   ```bash
   git add .
   git commit -m "Dearora fase 2"
   git push
   ```
   Vercel otomatis men-deploy ulang setiap ada push. Pastikan pengaturan Vercel: Framework Preset **Other**.
4. Buka alamat Vercel. Halaman **Paket & Harga** harus menampilkan harga dari sheet.

---

## C. Uji alur penuh (mode simulasi)
1. Buka toko → **Buat Ucapan** → isi semua langkah sampai **Bayar Sekarang**.
2. Di halaman status, tekan **Simulasikan Pembayaran Berhasil**. Kode redeem `DRA-XXXX-XXXX` muncul, dan email tanda terima masuk ke email yang Ibu isi.
3. Buka **Dearora_DB**: cek sheet `Pesanan`, `Pembayaran`, `Media`, `Akun`, `EmailLog`, dan folder Drive `Dearora/pesanan/{OrderID}` berisi foto.
4. Uji juga: paket Premium, paket Special (surprise + 1 video kecil), pesan dengan foto dari HP, dan pesanan yang tidak dibayar.

> Status pesanan setelah dibayar: Basic/Premium = **Dibayar**, Special = **Diproses**. Pengaktifan link otomatis dan halaman ucapan `/u/{kode}` hadir di **Fase 3**; pesanan yang sudah Dibayar akan diaktifkan saat itu.

---

## D. Menyambungkan iPaymu (sandbox)
Dokumentasi: https://docs.ipaymu.com/en/docs/getting-started

1. Daftar akun **sandbox** di https://sandbox.ipaymu.com. Dari menu **Integration**, salin **VA** dan **API Key** (kunci sandbox berbeda dari produksi).
2. Isi `IPAYMU_VA`, `IPAYMU_API_KEY`, lalu ubah `PAYMENT_MODE` menjadi `sandbox`.
3. Jalankan fungsi **`tampilkanUrlWebhook`**, salin baris `URL webhook (notifyUrl)`. **Rahasiakan**, karena berisi token.
4. Tempel URL itu di pengaturan callback sandbox: https://sandbox.ipaymu.com/integration/setting (pilih format `application/x-www-form-urlencoded`).
5. Lakukan satu pesanan uji sampai halaman pembayaran iPaymu muncul. Selesaikan pembayaran uji di sana.
6. Periksa: status berpindah ke "Pembayaran Berhasil", kode redeem tampil, dan sheet `Pembayaran` berstatus `Berhasil`.

### Hal yang BELUM terbukti (mohon uji di sandbox dan tanyakan ke iPaymu)
- **IP statis & domain di mode produksi.** Dokumentasi iPaymu menyebut di produksi alamat IP server dan domain pada URL (returnUrl/notifyUrl) harus terdaftar. Apps Script memakai IP Google yang berubah-ubah dan notifyUrl berada di `script.google.com`. Sandbox bisa jalan, tetapi **produksi belum tentu**. Tanyakan ke iPaymu sebelum rilis (draf pesan disertakan di chat).
- **Respons webhook.** Apps Script menjawab pesan POST dengan pengalihan (HTTP 302), sedangkan iPaymu meminta jawaban 200. Pesanan tetap diproses (idempoten), dan halaman status mengecek ulang sebagai cadangan.
- **`trx_id` di returnUrl.** Cadangan polling memakai `trx_id` bila iPaymu menambahkannya pada returnUrl. Cek di sandbox apakah dikirim.

---

## E. Menuju rilis
1. Jalankan **`cekKesiapanRilis`** dan perbaiki semua yang ditandai ❌.
2. Isi `KONTAK_EMAIL` di sheet **Config**.
3. Jalankan **`pasangTriggerHarian`** (sekali): pesanan tak terbayar > 24 jam dibatalkan otomatis dan foto uploadnya dihapus.
4. Ubah `PAYMENT_MODE` ke `production` hanya setelah poin IP/domain di atas beres, lalu jalankan transaksi nyata percobaan.
5. Setelah mengubah mode, jalankan `hapusCachePublik` agar banner mode di toko ikut berubah.

## Catatan keamanan
- Rahasia (API Key, token webhook) hanya di **Properti skrip**, tidak pernah di frontend atau sheet.
- Sheet `Pesanan` dan `Akun` berisi data pribadi pembeli. Jangan bagikan akses Spreadsheet.
- Kuota email Gmail biasa ±100/hari. Pantau sheet `EmailLog`.
