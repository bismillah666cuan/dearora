/* ==========================================================
   GRADUATION DAY — halaman editorial majalah: sampul foto wisuda, perjalanan perjuangan (tonggak), surat penghargaan,
   lalu lempar toga. Ilustrasi toga dan gedung dibuat sendiri (orisinal).
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var TOGA = '<svg viewBox="0 0 64 44" aria-hidden="true"><path d="M32 4 2 18l30 14 30-14z" fill="currentColor"/><path d="M14 26v10c0 4 8 7 18 7s18-3 18-7V26L32 36z" fill="currentColor" opacity=".8"/><path d="M60 19v14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
  var GEDUNG = '<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="currentColor"><path d="M20 120V70h60v50zM100 120V40l50-30 50 30v80zM220 120V60h50v60zM290 120V80h90v40z"/><path d="M140 120V80h20v40z" fill="#fff" opacity=".35"/></g></svg>';
  S.reg('wisuda', {
    nama: 'Graduation Day',
    adapt: function (f, c) {
      return { penerima: c.penerima, pengirim: c.pengirim, gelar: f.gelar || '', fotoUtama: f.fotoUtama,
        tonggak: (f.perjalanan || []).map(function (p) { return { waktu: p.waktu, judul: p.judul, cerita: p.cerita, foto: p.foto }; }),
        surat: { judul: (f.surat || {}).judul || 'Surat Penghargaan', pesan: (f.surat || {}).pesan || '' } };
    },
    mulai: function (root, d) {
      function layar(h, k) { root.innerHTML = '<div class="sp-layar ws-layar ' + (k || '') + '">' + h + '</div>'; return root.firstChild; }
      function sampul() {
        var el = layar('<div class="ws-latar" aria-hidden="true">' + GEDUNG + '</div><div class="ws-majalah"><p class="ws-kop">GRADUATION DAY</p><p class="ws-edisi">Edisi Kelulusan · ' + esc(d.gelar) + '</p><div class="ws-bingkai"><img class="ws-foto" alt="Foto wisuda" src="' + esc(S.src(d.fotoUtama, 2)) + '"><span class="ws-pita" aria-hidden="true"></span><span class="ws-toga-k" aria-hidden="true">' + TOGA + '</span></div><h1 class="ws-nama">' + esc(d.penerima) + '</h1><p class="ws-sub">Selamat. Ini ceritamu.</p><button type="button" class="ws-btn">Buka halaman perjalanan ›</button></div>', 'ws-sampul');
        el.querySelector('.ws-btn').addEventListener('click', function () { jalan(0); });
      }
      function jalan(i) {
        var t = d.tonggak[i], n = d.tonggak.length, akhir = i === n - 1;
        var garis = d.tonggak.map(function (x, k) { return '<li class="' + (k < i ? 'lalu' : k === i ? 'on' : '') + '"><span class="ws-dot"></span><span class="ws-wkt">' + esc(x.waktu) + '</span></li>'; }).join('');
        var el = layar('<div class="ws-jln"><p class="ws-bab">BAB ' + (i + 1) + ' DARI ' + n + '</p><ol class="ws-garis" aria-label="Perjalanan">' + garis + '</ol><article class="ws-kartu"><p class="ws-waktu">' + esc(t.waktu) + '</p><h2>' + esc(t.judul) + '</h2>' + (t.foto ? '<img class="ws-polaroid" alt="" src="' + esc(S.src(t.foto, i)) + '">' : '') + '<p class="ws-cerita">' + esc(t.cerita) + '</p></article><div class="ws-nav">' + (i ? '<button type="button" class="ws-btn ghost" data-a="p">‹ Sebelumnya</button>' : '<span></span>') + '<button type="button" class="ws-btn" data-a="n">' + (akhir ? 'Menuju hari wisuda ›' : 'Lanjut ›') + '</button></div></div>', 'ws-jalan');
        if (window.Suara) window.Suara.kertas();
        el.querySelector('[data-a="n"]').addEventListener('click', function () { if (akhir) hari(); else jalan(i + 1); });
        var p = el.querySelector('[data-a="p"]'); if (p) p.addEventListener('click', function () { jalan(i - 1); });
      }
      function hari() {
        var el = layar('<div class="ws-surat"><p class="ws-kop sm">HARI WISUDA</p><h2>' + esc(d.surat.judul) + '</h2><p class="ws-isi">' + S.kata(d.surat.pesan, 4200, 55) + '</p><p class="ws-ttd">Dengan bangga,<br><b>' + esc(d.pengirim) + '</b></p><button type="button" class="ws-lempar"><span class="ws-ik">' + TOGA + '</span> Lempar toga</button><div class="ws-terbang" aria-hidden="true"></div></div>', 'ws-hari');
        var b = el.querySelector('.ws-lempar'), area = el.querySelector('.ws-terbang'), n = 0;
        b.addEventListener('click', function () {
          for (var i = 0; i < 12; i++) { var s = document.createElement('span'); s.className = 'ws-tp'; s.innerHTML = TOGA; s.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 280) + 'px'); s.style.setProperty('--dr', Math.round((Math.random() - 0.5) * 540) + 'deg'); s.style.left = (30 + Math.random() * 40) + '%'; s.style.animationDelay = (i * 0.05) + 's'; area.appendChild(s); (function (x) { setTimeout(function () { x.remove(); }, 2600); })(s); }
          S.dariEl(b, 50, ['#C9A24B', '#F6E3A1', '#0F1F3D', '#fff'], { kuat: 9, naik: 8 });
          if (++n === 1) { el.querySelector('.ws-surat').insertAdjacentHTML('beforeend', S.kredit(d.pengirim)); S.akhir(); }
        });
      }
      sampul();
    }
  });
})();
