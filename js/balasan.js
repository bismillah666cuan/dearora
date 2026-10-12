/* ==========================================================
   BALASAN — penerima menandai ucapan "sudah dilihat" (mencapai slide terakhir) dan dapat
   mengirim balasan singkat yang sampai ke akun pembeli (portal + email).
   Tanpa akun untuk penerima. Anti-spam: honeypot + batas per ucapan di server.
   ========================================================== */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc;
  var B = {
    /** Menandai ucapan sudah dilihat. Senyap bila gagal. */
    tandai: function (slug) {
      if (!slug || !window.DearoraAPI || !window.DearoraAPI.siap || !window.DearoraAPI.siap()) return;
      try { window.DearoraAPI.post('markViewed', { k: slug }, { timeout: 15000 }).then(function () {}, function () {}); } catch (e) { /* abaikan */ }
    },
    /** Tampilkan formulir balasan di dalam elemen `el`. o = {slug, pengirim, demo}. */
    sudah: function (slug) { try { return !!slug && localStorage.getItem('dearora:bls:' + slug) === '1'; } catch (e) { return false; } },
    tandaiSudah: function (slug) { try { if (slug) localStorage.setItem('dearora:bls:' + slug, '1'); } catch (e) { /* abaikan */ } },
    pasang: function (el, o) {
      if (!el) return; o = o || {};
      var tm = ' t-' + String(o.tema || 'umum').replace(/[^a-z0-9]/gi, '');
      if (!o.demo && B.sudah(o.slug)) { el.innerHTML = '<div class="bl-kotak' + tm + '"><p class="bl-ok" role="status">Terima kasih! Balasanmu sudah terkirim.</p></div>'; return; }
      el.innerHTML = '<div class="bl-kotak' + tm + '"><form class="bl-form" novalidate><h3>Balas ucapan ini</h3><p class="bl-sub">Balasanmu akan sampai ke <strong>' + esc(o.pengirim || 'pengirim') + '</strong>.</p>' +
        '<label class="bl-sr" for="blNama">Namamu (opsional)</label><input id="blNama" type="text" maxlength="40" autocomplete="off" placeholder="Namamu (opsional)">' +
        '<label class="bl-sr" for="blPesan">Balasan</label><textarea id="blPesan" rows="3" maxlength="500" placeholder="Tulis balasan, ucapan terima kasih, atau kesanmu…"></textarea>' +
        '<input type="text" class="bl-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="bl-galat" role="alert" hidden></p><button type="submit" class="bl-kirim">Kirim Balasan</button>' + (o.demo ? '<p class="bl-demo">Mode demo: balasan tidak dikirim.</p>' : '') + '</form>' +
        '<p class="bl-ok" role="status" hidden>Terima kasih! Balasanmu sudah dikirim.</p></div>';
      var f = el.querySelector('.bl-form'), ok = el.querySelector('.bl-ok'), g = el.querySelector('.bl-galat');
      f.addEventListener('submit', async function (ev) {
        ev.preventDefault(); var nama = f.querySelector('#blNama').value.trim(), pesan = f.querySelector('#blPesan').value.trim(), btn = f.querySelector('.bl-kirim');
        g.hidden = true; if (pesan.length < 2) { g.textContent = 'Tulis balasan terlebih dahulu.'; g.hidden = false; return; }
        btn.disabled = true; btn.textContent = 'Mengirim…';
        try {
          if (!o.demo) {
            var r = await window.DearoraAPI.post('sendReply', { k: o.slug, nama: nama, pesan: pesan, website: f.querySelector('.bl-hp').value }, { timeout: 20000 });
            if (!r.success && /sudah pernah/i.test(r.message || '')) { B.tandaiSudah(o.slug); f.hidden = true; ok.hidden = false; return; }
            if (!r.success) { g.textContent = r.message || 'Balasan belum bisa dikirim.'; g.hidden = false; btn.disabled = false; btn.textContent = 'Kirim Balasan'; return; }
          }
          if (!o.demo) B.tandaiSudah(o.slug); if (window.Suara) window.Suara.sukses(); f.hidden = true; ok.hidden = false; ok.focus && ok.setAttribute('tabindex', '-1');
        } catch (e) { g.textContent = 'Koneksi bermasalah. Coba lagi.'; g.hidden = false; btn.disabled = false; btn.textContent = 'Kirim Balasan'; }
      });
    },
    /** Tombol melayang + lembar balasan (untuk desain aplikasi mini). */
    lembar: function (host, o) {
      if (host.querySelector('.bl-fab')) return;
      if (!o.demo && B.sudah(o.slug)) return;                // sudah membalas: tombol tidak muncul lagi
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bl-fab t-' + String(o.tema || 'umum').replace(/[^a-z0-9]/gi, ''); b.textContent = 'Balas ucapan'; b.setAttribute('aria-haspopup', 'dialog'); host.appendChild(b);
      b.addEventListener('click', function () {
        var s = document.createElement('div'); s.className = 'bl-lembar'; s.innerHTML = '<div class="bl-sheet" role="dialog" aria-modal="true" aria-label="Balas ucapan"><button type="button" class="bl-tutup" aria-label="Tutup">✕</button><div class="bl-isi"></div></div>';
        host.appendChild(s); B.pasang(s.querySelector('.bl-isi'), o); var f = s.querySelector('#blPesan'); if (f) f.focus();
        s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('.bl-tutup')) s.remove(); });
      });
    }
  };
  window.Balasan = B;
})();
