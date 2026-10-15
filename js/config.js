/* ==========================================================
   KONFIGURASI FRONTEND — hanya file ini yang perlu Ibu edit.
   ========================================================== */
window.DEARORA_CONFIG = {
  // Tempel URL Web App GAS (berakhiran /exec) di antara tanda kutip.
  // Kosong = mode pratinjau (memakai data contoh bawaan, tanpa backend).
  GAS_URL: '',

  // Lama data toko disimpan di browser sebelum dicek ulang (menit).
  CACHE_MENIT: 10,

  // Batas tunggu tiap permintaan ke API (milidetik) dan jumlah percobaan ulang.
  TIMEOUT_MS: 15000,
  COBA_ULANG: 2
};
