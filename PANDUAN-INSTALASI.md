# PANDUAN INSTALASI — Dearora (sampai Fase 3: Portal Pembeli & Halaman Ucapan)

| Bagian | Berkas | Dipasang di |
|---|---|---|
| Backend (API) | `Kode.gs`, `Pesanan.gs`, `Pembayaran.gs`, `Email.gs`, `Portal.gs`, `Kartu.gs`, `appsscript.json` | Google Apps Script (akun Gmail **usaha**) |
| Frontend (toko + portal + kartu) | isi `dearora-frontend-fase3.zip` | Vercel (via GitHub) |

Urutan: **A (backend) → B (frontend) → C (uji alur) → D (Special manual) → E (iPaymu) → F (menuju rilis).**

---

## A. Backend — Google Apps Script

### A1. Perbarui kode
1. Ganti isi **`Kode`**, **`Pesanan`**, **`Pembayaran`**, **`Email`** dengan berkas yang baru.
2. Tambah **dua file baru**: tombol **＋ → Skrip** → nama `Portal` dan `Kartu` (tanpa `.gs`) → tempel isinya.
3. `appsscript.json` tidak berubah dari Fase 2.

### A2. Jalankan setup lagi (aman diulang)
Pilih **`setupAppEnvironment`** → ▶ Jalankan. Ini menambah kolom baru (`AkunTertaut`) tanpa menimpa data Ibu.

### A3. Properti skrip
Pastikan `SITE_URL`, `PAYMENT_MODE`, `IPAYMU_VA`, `IPAYMU_API_KEY` masih terisi (tidak ada yang baru di Fase 3).

### A4. Deploy ulang
**Terapkan → Kelola deployment → ✏ → Versi baru → Terapkan.** URL `/exec` tetap sama.

### A5. Aktifkan pesanan lama
Pesanan Basic/Premium yang dibayar **sebelum** Fase 3 masih berstatus *Dibayar*. Jalankan fungsi **`aktifkanPesananDibayar`** sekali: pesanan itu mendapat link ucapan, dan email "Ucapanmu sudah jadi" terkirim ke pembelinya (jika pesanan itu uji coba, abaikan emailnya).

---

## B. Frontend — Vercel
1. Ekstrak `dearora-frontend-fase3.zip`. **Salin SEMUA isinya** ke folder proyek `dearora` (jangan hapus folder `.git`). Pilih "Ganti file di tujuan".
2. Buka `js/config.js` dan **isi lagi `GAS_URL`** (ZIP mengosongkannya).
3. Dari folder yang berisi `index.html`:
   ```bash
   git add .
   git commit -m "Dearora fase 3"
   git push
   ```
4. Berkas baru yang penting: **`u/index.html`** (halaman ucapan) dan **`vercel.json`** (aturan alamat `/u/{kode}`). Tanpa `vercel.json` yang baru, alamat `/u/...` akan menampilkan 404.

---

## C. Uji alur penuh
1. **Pesan Basic** (mode simulasi/sandbox) sampai bayar. Di halaman status muncul **kode redeem** dan **link ucapan aktif**.
2. Buka link ucapan di HP: layar pembuka, tombol **Buka Ucapan**, lalu isi kartu.
3. Buka **Masuk** di menu → tempel kode redeem → **buat password** (minimal 8 karakter) → masuk ke **Portal Saya**: pesanan, timeline, link, dan **Unduh PDF Bukti**.
4. Di portal tekan **Buat Ucapan Baru**: form menampilkan "Masuk sebagai ..." (pesanan ditautkan ke akun yang sama, tanpa kode baru).
5. Uji **Keluar**, lalu masuk lagi dengan kode + password.

---

## D. Paket Special (sementara, sebelum dashboard Fase 4)
Special dikerjakan manual. Setelah Ibu selesai mengerjakannya:
1. (Opsional) Jika Ibu membuat halaman kustom, taruh di folder `special/NAMA-ACAK/` pada proyek Vercel, lalu tulis alamat lengkapnya di kolom **`LinkHasil`** sheet `Pesanan` (baris pesanan itu). Jika tidak, kartu memakai halaman standar `u/` (sudah mendukung amplop dan pesan rahasia).
2. Di Apps Script buka fungsi **`aktifkanSpecialManual`**, isi `ORDER_ID` dengan nomor pesanan (mis. `DRA-261009-ABCDE`), simpan, lalu ▶ Jalankan.
3. Hasilnya ada di Log eksekusi: link ucapan dan tanggal berakhir. Email "Ucapanmu sudah jadi" otomatis terkirim ke pembeli, dan masa aktif 1 tahun mulai dihitung.
4. **Revisi**: pembeli mengajukan lewat portal (status berubah ke Diproses, catatan masuk di sheet `Revisi`). Setelah Ibu mengerjakan revisinya, jalankan `aktifkanSpecialManual` lagi dengan `ORDER_ID` yang sama. Link dan masa aktif tidak berubah.

> Halaman kustom Special yang menampilkan pesan rahasia harus memakai API yang sama (`unlockSecret`). Untuk halaman kustom, salin `u/index.html` ke `special/NAMA/index.html` dan tambahkan `data-slug="SLUG-ASLI"` pada tag `<body>`.

---

## E. Menyambungkan iPaymu (sandbox)
Dokumentasi: https://docs.ipaymu.com/en/docs/getting-started

1. Daftar akun **sandbox** di https://sandbox.ipaymu.com. Dari menu **Integrasi**, salin **VA** dan **API Key** sandbox.
2. Isi `IPAYMU_VA`, `IPAYMU_API_KEY`, ubah `PAYMENT_MODE` menjadi `sandbox`.
3. Jalankan **`ujiKoneksiIpaymu`** dan pastikan Log menampilkan `✅ BERHASIL`.
4. **Tidak perlu menempel URL webhook di dashboard iPaymu.** Alamat notifikasi dikirim bersama setiap pembayaran. Pastikan **Integrasi → Callback notifikasi** berformat `application/x-www-form-urlencoded`.
5. Buat pesanan uji sampai halaman pembayaran iPaymu. Untuk "membayar" di sandbox, klik **"Klik Disini"** pada banner atas halaman itu, atau pakai menu **Tes Notify** dengan *Merchant Ref ID* = nomor pesanan Dearora.
6. Setelah pembayaran, tekan tombol **←** di halaman iPaymu untuk kembali ke Dearora. Halaman status menampilkan kode redeem.
7. Jika status tidak berpindah, lihat kolom **`RawCallbackRingkas`** di sheet `Pembayaran` (alasan penolakan tercatat di sana) dan menu **Eksekusi** di Apps Script.

### Hal yang BELUM terbukti (tanyakan ke iPaymu sebelum rilis)
- **IP statis & domain di produksi.** Dokumentasi menyebut IP server dan domain URL (returnUrl/notifyUrl) harus terdaftar. Apps Script memakai IP Google yang berubah dan notifyUrl di `script.google.com`.
- **Escrow.** Transaksi sandbox berstatus *Escrow* (dana ditahan). Dearora menerimanya sebagai "sudah dibayar", tetapi aturan pencairan ke saldo Ibu perlu dipastikan.
- **Biaya transaksi.** Biaya per metode bisa besar untuk harga Basic yang rendah (VA bank). Cek tabel biaya sebelum menetapkan harga.
- **Respons webhook.** Apps Script membalas dengan pengalihan (302). Pesanan tetap diproses (idempoten) dan halaman status mengecek ulang.

---

## F. Menuju rilis
1. Jalankan **`cekKesiapanRilis`** dan perbaiki semua yang ditandai ❌.
2. Isi `KONTAK_EMAIL` di sheet **Config**.
3. Jalankan **`pasangTriggerHarian`** (sekali): membatalkan pesanan tak terbayar > 24 jam, mengaktifkan ulang pesanan yang tertunda, dan membersihkan sesi login kedaluwarsa.
4. Ubah `PAYMENT_MODE` ke `production` hanya setelah poin iPaymu di atas beres. Setelah itu jalankan transaksi nyata percobaan.
5. Ganti `WEBHOOK_TOKEN` dengan teks acak baru bila token pernah terlihat orang lain.

## Catatan penting
- **Foto di halaman ucapan** dimuat dari Google Drive lewat link thumbnail. Foto hanya dibuka untuk "yang punya link" saat pesanan **diaktifkan**, bukan saat diunggah. Bila ucapan sangat ramai dibuka, Google dapat membatasi lalu lintas foto (batas ini dicatat di PRD §6.3).
- **Pembersihan saat kedaluwarsa** (menonaktifkan link, menghapus foto dari Drive, menonaktifkan akun) belum otomatis. Itu dikerjakan di **Fase 4**. Sampai saat itu, kartu yang lewat masa aktif sudah **tidak bisa dibuka** (halaman "sudah berakhir"), tetapi fotonya masih ada di Drive.
- Sheet `Pesanan` dan `Akun` berisi data pribadi. Jangan bagikan akses Spreadsheet.
- Kuota email Gmail biasa ±100/hari. Pantau sheet `EmailLog`.
