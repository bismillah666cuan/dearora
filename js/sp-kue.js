/* ==========================================================
   KUE BERTINGKAT — penerima menyusun kue lapis demi lapis; tiap lapis membuka satu kenangan atau doa.
   Lalu lilin dipasang, permohonan dipanjatkan, dan lilin ditiup. Ilustrasi orisinal.
   ========================================================== */
(function () {
  'use strict';
  var S = window.Special, esc = S.esc;
  var KUE = ['#FFD3E0', '#D8F2E4', '#FFF0B8', '#E6DAFA', '#FFE0CC'], KRIM = ['#FF9DBB', '#8FD6B8', '#FFCB5C', '#A98BE8', '#FFAE85'], LEBAR = [94, 80, 66, 54, 44];
  S.reg('kue', {
    nama: 'Kue Bertingkat',
    adapt: function (f, c) {
      var h = f.harapan || {};
      return { penerima: c.penerima, pengirim: c.pengirim, judul: f.judul || 'Kue Untukmu', lapis: (f.lapis || []).map(function (x) { return { nama: x.nama, cerita: x.cerita, foto: x.foto }; }), harapan: h.harapan || 'Semoga semua doamu terkabul.', pesan: h.pesan || '' };
    },
    mulai: function (root, d) {
      var n = d.lapis.length, sudah = 0;
      root.innerHTML = '<div class="sp-layar ku-layar"><p class="ku-kop">TOKO KUE KASIH</p><h1>' + esc(d.judul) + '</h1><p class="ku-pet" id="kuP">Susun kuenya lapis demi lapis untuk ' + esc(d.penerima) + '.</p><div class="ku-meja"><div class="ku-tumpuk" id="kuT" aria-hidden="true"><div class="ku-piring"></div></div></div><div class="ku-kartu" id="kuK" aria-live="polite"></div><div class="ku-aksi"><button type="button" class="ku-btn" id="kuB"></button></div></div>';
      var el = root.firstChild, tumpuk = el.querySelector('#kuT'), kartu = el.querySelector('#kuK'), btn = el.querySelector('#kuB'), pet = el.querySelector('#kuP'), lilin = null;
      function label() { btn.textContent = sudah < n ? 'Taruh lapis ' + (sudah + 1) + ' dari ' + n : (lilin ? 'Tiup lilinnya' : 'Pasang lilin'); }
      function tambah() {
        var k = sudah, l = d.lapis[k], div = document.createElement('div'); div.className = 'ku-lapis'; div.style.cssText = 'width:' + LEBAR[k] + '%;--c:' + KUE[k % 5] + ';--g:' + KRIM[k % 5];
        tumpuk.appendChild(div); sudah++; if (window.Suara) { window.Suara.pop(); window.Suara.ding(); } S.dariEl(div, 12, KRIM.concat(['#fff']), { kuat: 5 });
        kartu.innerHTML = '<h3>' + esc(l.nama) + '</h3>' + (l.foto ? '<img alt="" src="' + esc(S.src(l.foto, k)) + '">' : '') + '<p>' + esc(l.cerita) + '</p>'; kartu.classList.remove('masuk'); void kartu.offsetWidth; kartu.classList.add('masuk');
        pet.textContent = sudah < n ? sudah + ' dari ' + n + ' lapis sudah disusun.' : 'Kuenya sudah tersusun!'; label();
      }
      function pasangLilin() {
        lilin = document.createElement('div'); lilin.className = 'ku-lilin'; lilin.innerHTML = '<i class="ku-api"></i><b></b>'; tumpuk.appendChild(lilin);
        if (window.Suara) window.Suara.tumbuh(); kartu.innerHTML = '<h3>Saatnya berharap</h3><p>Pejamkan mata, buat satu permohonan, lalu tiup lilinnya pelan-pelan.</p>'; kartu.classList.remove('masuk'); void kartu.offsetWidth; kartu.classList.add('masuk'); pet.textContent = 'Lilinnya sudah menyala.'; label();
      }
      function tiup() {
        btn.disabled = true; lilin.classList.add('padam'); if (window.Suara) window.Suara.tiup();
        S.jeda(function () { if (window.Suara) { window.Suara.sukses(); window.Suara.konfeti(); } S.confetti(innerWidth / 2, innerHeight * 0.35, 70, KRIM.concat(KUE, ['#fff']), { kuat: 9 });
          el.querySelector('.ku-aksi').remove(); kartu.remove(); pet.remove();
          var akhir = document.createElement('div'); akhir.className = 'ku-akhir'; akhir.innerHTML = '<p class="ku-harap">' + esc(d.harapan) + '</p><div class="ku-pesan"><p>' + S.kata(d.pesan, 5200, 55) + '</p>' + S.kredit(d.pengirim) + '</div>'; el.appendChild(akhir); el.scrollTo(0, el.scrollHeight); S.akhir(); }, 900);
      }
      btn.addEventListener('click', function () { if (sudah < n) tambah(); else if (!lilin) pasangLilin(); else tiup(); });
      label();
    }
  });
})();
