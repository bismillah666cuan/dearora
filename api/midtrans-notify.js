/* ==========================================================
   Penerus notifikasi pembayaran Midtrans → Google Apps Script (GAS).
   Alasan: Midtrans meminta balasan HTTP 200 langsung, sedangkan alamat /exec milik GAS membalas dengan pengalihan (302),
   sehingga Midtrans menganggap notifikasi gagal. Fungsi ini menerima notifikasi, meneruskannya ke GAS (yang kemudian
   MEMVERIFIKASI ULANG ke API Midtrans, jadi isi notifikasi tidak pernah dipercaya begitu saja), lalu membalas 200.
   Bila GAS tidak menjawab, fungsi ini membalas galat (5xx) agar Midtrans mengirim ulang.
   Alamat GAS diambil dari variabel lingkungan GAS_URL (bila ada) atau dari js/config.js situs ini.
   Alamat untuk dashboard Midtrans: https://dearora.app/api/midtrans-notify?k=(WEBHOOK_TOKEN)  (jalankan urlNotifikasiMidtrans di Apps Script untuk melihatnya)
   ========================================================== */
'use strict';

const BATAS_MS = 8000;                                  // fungsi Vercel Hobby dibatasi 10 detik
const POLA_GAS = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const POLA_HOST = /^(www\.)?dearora\.app$|^[a-z0-9-]+\.vercel\.app$/i;
let gasCache = '';

async function cariGasUrl(req) {
  const env = String(process.env.GAS_URL || '').trim();
  if (POLA_GAS.test(env)) return env;
  if (gasCache) return gasCache;
  const host = String((req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || '').split(',')[0].trim();
  if (!POLA_HOST.test(host)) return '';
  const r = await fetch('https://' + host + '/js/config.js', { signal: AbortSignal.timeout(4000) });
  const teks = await r.text();
  const m = teks.match(/GAS_URL\s*:\s*['"](https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec)['"]/);
  if (m && POLA_GAS.test(m[1])) gasCache = m[1];
  return gasCache;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ ok: false, pesan: 'Gunakan POST. Alamat ini dipanggil oleh Midtrans.' }); return; }
  let badan = req.body;
  if (typeof badan === 'string') { try { badan = JSON.parse(badan); } catch (e) { badan = null; } }
  if (!badan || typeof badan !== 'object' || typeof badan.order_id !== 'string' || !badan.order_id || badan.order_id.length > 120) {
    res.status(400).json({ ok: false, pesan: 'Notifikasi tidak valid.' }); return;
  }
  const k = String((req.query && req.query.k) || '').trim();                       // token rahasia dari alamat notifikasi (WEBHOOK_TOKEN); diteruskan apa adanya ke Apps Script
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(k)) { res.status(401).json({ ok: false, pesan: 'Token notifikasi tidak ada atau salah format. Tambahkan ?k=(WEBHOOK_TOKEN) pada alamat di dashboard Midtrans.' }); return; }
  let gas = '';
  try { gas = await cariGasUrl(req); } catch (e) { gas = ''; }
  if (!gas) { res.status(500).json({ ok: false, pesan: 'Alamat Apps Script tidak ditemukan. Isi variabel GAS_URL di Vercel atau pastikan js/config.js memuat GAS_URL.' }); return; }
  try {
    const r = await fetch(gas + '?action=midtransNotify&k=' + encodeURIComponent(k), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(badan), redirect: 'follow', signal: AbortSignal.timeout(BATAS_MS)
    });
    if (!(r.status >= 200 && r.status < 300)) { res.status(502).json({ ok: false, pesan: 'Apps Script membalas ' + r.status }); return; }
    let j = null; try { j = JSON.parse(await r.text()); } catch (e) { j = null; }
    if (!j || j.success !== true) { res.status(502).json({ ok: false, pesan: 'Apps Script menolak notifikasi' + (j && j.message ? ': ' + String(j.message).slice(0, 80) : '.') + ' Periksa WEBHOOK_TOKEN pada alamat notifikasi.' }); return; }   // galat terlihat di riwayat notifikasi Midtrans, tidak diam-diam
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(504).json({ ok: false, pesan: 'Apps Script tidak menjawab.' });
  }
};
