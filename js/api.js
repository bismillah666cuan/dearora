/* ==========================================================
   LAPISAN API — semua komunikasi ke GAS lewat sini.
   • GET  : ?action=...                     (tanpa header khusus)
   • POST : Content-Type: text/plain        (WAJIB, agar tidak kena preflight CORS)
   • Ada batas waktu + coba ulang untuk gangguan jaringan.
   ========================================================== */
(function () {
  'use strict';
  var cfg = window.DEARORA_CONFIG || {};

  function jeda(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function kirim(url, opsi, percobaan, timeoutMs) {
    var terakhir;
    for (var i = 0; i <= percobaan; i++) {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || cfg.TIMEOUT_MS || 15000);
      try {
        var res = await fetch(url, Object.assign({}, opsi, { signal: ctrl.signal }));
        clearTimeout(timer);
        var teks = await res.text();
        var json;
        try { json = JSON.parse(teks); }
        catch (e) { throw new Error('Respons server bukan JSON. Periksa pengaturan deploy GAS (Access: Anyone).'); }
        return json;
      } catch (err) {
        clearTimeout(timer);
        terakhir = err;
        if (i < percobaan) await jeda(700 * (i + 1));
      }
    }
    throw terakhir;
  }

  window.DearoraAPI = {
    siap: function () { return !!(cfg.GAS_URL && /^https:\/\//.test(cfg.GAS_URL)); },

    async get(action, params, opsi) {
      var q = new URLSearchParams(Object.assign({ action: action }, params || {}));
      return kirim(cfg.GAS_URL + '?' + q.toString(), { method: 'GET' }, (opsi && opsi.coba != null) ? opsi.coba : (cfg.COBA_ULANG || 0), opsi && opsi.timeout);
    },

    // POST tidak diulang otomatis di sini (hindari pesanan/pembayaran ganda).
    // Pengulangan aman dilakukan pemanggil untuk aksi yang idempoten (mis. unggah bagian berkas).
    async post(action, data, opsi) {
      var body = JSON.stringify({ action: action, data: data || {} });
      return kirim(cfg.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: body
      }, 0, opsi && opsi.timeout);
    }
  };
})();
