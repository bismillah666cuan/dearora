# PANDUAN INSTALASI — Dearora (Fase 1: Toko Publik)

Ada **dua bagian** yang dipasang di dua tempat berbeda:

| Bagian | Berkas | Dipasang di |
|---|---|---|
| Backend (API) | `Kode.gs` | Google Apps Script (akun Gmail **usaha** Dearora) |
| Frontend (toko) | isi ZIP ini (`index.html`, `css/`, `js/`, ...) | Vercel |

Kerjakan **berurutan**: A (backend) dulu, baru B (frontend).

---

## A. BACKEND — Google Apps Script

> Gunakan **akun Gmail khusus usaha** (mis. `dearora.id@gmail.com`), bukan akun pribadi. Dengan begitu email dan berkas Dearora tidak bercampur dengan akun pribadi Ibu.

1. Masuk ke https://script.google.com dengan akun usaha → **Proyek baru**.
2. Ganti nama proyek menjadi **Dearora API**.
3. Hapus isi `Code.gs`, lalu **tempel seluruh isi `Kode.gs`**. Ganti nama file menjadi `Kode`.
4. Di dropdown fungsi (atas), pilih **`setupAppEnvironment`** lalu klik **▶ Jalankan** — **cukup sekali**.
   - Klik **Tinjau izin** → pilih akun usaha → **Lanjutan** → **Buka Dearora API (tidak aman)** → **Izinkan**. (Peringatan ini normal untuk skrip buatan sendiri.)
5. Buka **Log eksekusi** dan pastikan ada tulisan `✅ SETUP SELESAI` beserta tautan Spreadsheet dan Folder.
6. Cek hasilnya:
   - Google Drive → folder **Dearora** berisi `pesanan` dan `bukti-pdf`, serta file **Dearora_DB**.
   - Buka **Dearora_DB**: ada 12 sheet. Sheet `Paket`, `Desain`, `Config` sudah berisi data contoh.
7. Di sheet **Config**, isi baris `KONTAK_EMAIL` dengan email usaha (akan tampil di footer dan kebijakan).
8. **Deploy**: **Terapkan → Deployment baru → ikon roda gigi → Aplikasi web**
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
   - Klik **Deploy** → **salin URL** yang berakhiran `/exec`.
9. **Tes**: tempel URL itu di browser lalu tambahkan `?action=ping` di belakangnya. Harus muncul teks JSON berisi `"success":true`. Lalu coba `?action=getPublicData` — harus muncul data paket dan desain.

⚠️ Setiap kali Ibu mengubah **kode** `Kode.gs`, buat **Deployment baru** (atau Kelola deployment → Edit → Versi baru). Mengubah **isi Sheet** tidak perlu deploy ulang.

### Mengubah harga, paket, dan desain (Fase 1)
Edit langsung di sheet `Paket` / `Desain` / `Config`. Perubahan tampil di toko dalam ±10 menit. Agar langsung tampil, jalankan fungsi **`hapusCachePublik`** dari editor Apps Script.
- Harga di data awal (19.000 / 39.000 / 79.000) hanyalah **contoh**. Silakan ubah di kolom `Harga`.
- Kolom `Aktif` berupa kotak centang. Hilangkan centang untuk menyembunyikan paket/desain.
- `Thumbnail` berisi `tema:blossom` (tampilan bawaan) atau URL gambar `https://...`.
- Dashboard admin untuk mengedit lewat tampilan khusus hadir di Fase 4.

---

## B. FRONTEND — Vercel

### B1. Isi alamat API
1. Ekstrak ZIP. Folder hasil ekstraksi **itulah folder proyek** (di dalamnya langsung terlihat `index.html`, `css`, `js`).
2. Buka `js/config.js` dengan Notepad, lalu tempel URL `/exec` dari langkah A8:
   ```js
   GAS_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```
3. **Tes lokal (opsional):** klik ganda `index.html`. Jika `GAS_URL` masih kosong, muncul label "Mode pratinjau" dan data contoh bawaan.

### B2. Naikkan ke Vercel (lewat GitHub)
> Buka terminal **di folder yang berisi `index.html`** (bukan folder di atasnya). Di Windows: buka folder itu di File Explorer, klik address bar, ketik `powershell`, Enter.

1. Pastikan `dir` (Windows) atau `ls` (Mac/Linux) menampilkan `index.html` di daftar teratas.
2. Buat repository kosong di https://github.com (jangan centang README).
3. Jalankan:
   ```bash
   git init
   git add .
   git commit -m "Dearora fase 1"
   git branch -M main
   git remote add origin https://github.com/NAMA-ANDA/dearora.git
   git push -u origin main
   ```
   Saat diminta password, pakai **Personal Access Token** GitHub (bukan password akun).
4. Buka https://vercel.com → **Add New → Project** → impor repository `dearora`.
5. **Framework Preset: Other**. Kosongkan Build Command dan Output Directory. Klik **Deploy**.
6. Untuk nama alamat, buka **Settings → Domains** dan pilih nama `.vercel.app` yang diinginkan (mis. `dearora.vercel.app`, jika masih tersedia).

> Jika Ibu belum pernah memakai Git/GitHub, beri tahu saya. Saya pandu **satu langkah per langkah** sambil memeriksa tangkapan layar terminal Ibu.

### B3. Uji akhir
- Buka alamat Vercel → harga di halaman **Paket & Harga** harus sama dengan sheet `Paket`.
- Coba menu **Contoh Desain** → **Lihat Demo**.
- Buka dari HP, lalu coba tombol menu dan **Buat Ucapan**.
- Jika data tidak muncul: tekan F12 → tab **Network**, cari permintaan ke `script.google.com`. Pastikan deploy berstatus **Siapa saja** dan `GAS_URL` benar.

---

## Yang BELUM ada di Fase 1
Form **Buat Ucapan** (tombol sementara menampilkan halaman "Pemesanan Segera Dibuka"), pembayaran iPaymu, portal pembeli, halaman ucapan `/u/{kode}`, email/PDF, dan dashboard admin. Semuanya hadir di Fase 2–4.
