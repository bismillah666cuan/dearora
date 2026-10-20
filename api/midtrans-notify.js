/**
 * Perantara webhook Midtrans → backend Google Apps Script (fungsi serverless Vercel).
 *
 * Mengapa ada: uji "Payment Notification URL" di dashboard Midtrans mengharapkan balasan HTTP 200 langsung.
 * Web App Google Apps Script membalas permintaan POST dengan pengalihan (302), sehingga uji itu bisa dianggap gagal.
 * Fungsi ini menerima notifikasi di alamat sendiri (https://DOMAIN-ANDA/api/midtrans-notify), meneruskannya ke Apps Script,
 * lalu membalas 200.
 *
 * Keamanan: notifikasi di sini TIDAK dipercaya begitu saja. Backend memeriksa tanda tangan Midtrans (signature_key)
 * dan memverifikasi ulang ke API status Midtrans sebelum menandai pembayaran lunas.
 *
 * Variabel lingkungan (Vercel → Settings → Environment Variables):
 *   GAS_URL        URL Web App berakhiran /exec
 *   WEBHOOK_TOKEN  sama dengan WEBHOOK_TOKEN di Script Properties Apps Script
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, message: 'Gunakan POST.' }); }
  const gas = process.env.GAS_URL, token = process.env.WEBHOOK_TOKEN;
  if (!gas || !token) return res.status(500).json({ ok: false, message: 'Belum dikonfigurasi.' });
  try {
    const url = gas + (gas.indexOf('?') >= 0 ? '&' : '?') + 'action=midtransNotify&k=' + encodeURIComponent(token);
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 8000);
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, redirect: 'follow', signal: ctl.signal });
    clearTimeout(timer);
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (err) {
    return res.status(502).json({ ok: false, message: 'Gagal meneruskan.' });
  }
};
