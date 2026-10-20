/* ==========================================================
   APP — router SPA (hash), pemuatan data, event, modal demo.
   • Navigasi 100% di sisi klien: tidak ada reload halaman.
   • Data toko: cache localStorage + validasi ulang di latar belakang.
   ========================================================== */
(function () {
  'use strict';
  var cfg = window.DEARORA_CONFIG, API = window.DearoraAPI, U = window.UI, V = window.Views;
  var esc = U.esc, ic = U.ic;

  var KEY_CACHE = 'dearora:public:v1';
  var state = { data: null, status: 'loading', sumber: '', rute: '', query: {} };
  var $main = document.getElementById('main');
  var $drawer = document.getElementById('drawer');
  var $menuBtn = document.getElementById('menuBtn');
  var $dialog = document.getElementById('demoDialog');
  var $toast = document.getElementById('toast');
  var observer = null;

  /* ---------------- Util ---------------- */
  function ctx() { return { data: state.data, status: state.status, query: state.query }; }
  function toast(msg) {
    $toast.textContent = msg; $toast.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { $toast.classList.remove('show'); }, 2600);
  }
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var i = h.indexOf('?');
    var path = (i >= 0 ? h.slice(0, i) : h).replace(/\/+$/, '');
    var query = {};
    new URLSearchParams(i >= 0 ? h.slice(i + 1) : '').forEach(function (v, k) { query[k] = v; });
    return { path: path, query: query };
  }
  function buatHash(path, query) {
    var qs = new URLSearchParams();
    Object.keys(query || {}).forEach(function (k) { if (query[k]) qs.set(k, query[k]); });
    var s = qs.toString();
    return '#/' + path + (s ? '?' + s : '');
  }

  /* ---------------- Render ---------------- */
  function pasangReveal() {
    var els = $main.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); observer.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    els.forEach(function (e) { observer.observe(e); });
  }

  function tandaiNav(nav) {
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function render(opsi) {
    opsi = opsi || {};
    var h = parseHash();
    state.query = h.query;
    var r = V.rute[h.path];
    var gantiHalaman = h.path !== state.rute;
    state.rute = h.path;

    if (window.Status) window.Status.stop();                 // hentikan polling halaman status
    var html = r ? r.view(ctx()) : V.tidakAda();
    var y = window.scrollY;
    $main.innerHTML = '<div class="view">' + html + '</div>';
    document.title = (r ? r.judul : 'Halaman Tidak Ditemukan') + ' — Dearora';
    tandaiNav(r ? r.nav : '');
    pasangReveal();
    isiFooter();
    if (window.Auth) window.Auth.syncHeader();
    if (r && r.after) r.after($main, ctx());

    if (opsi.jagaScroll || !gantiHalaman) window.scrollTo(0, y);
    else { window.scrollTo(0, 0); $main.focus({ preventScroll: true }); }
    tutupDrawer();
  }

  function isiFooter() {
    var e = V.kontak(ctx());
    var el = document.getElementById('footerKontak');
    if (el) el.innerHTML = e ? '<a href="mailto:' + esc(e) + '">' + esc(e) + '</a>' : '';
    var th = document.getElementById('tahun'); if (th) th.textContent = new Date().getFullYear();
  }

  /* ---------------- Data ---------------- */
  function bacaCache() {
    try { var j = JSON.parse(localStorage.getItem(KEY_CACHE)); if (j && j.t && j.data) return j; } catch (e) { /* abaikan */ }
    return null;
  }
  function simpanCache(data) {
    try { localStorage.setItem(KEY_CACHE, JSON.stringify({ t: Date.now(), data: data })); } catch (e) { /* penyimpanan penuh/diblokir */ }
  }
  function bentukValid(d) { return d && Array.isArray(d.paket) && Array.isArray(d.desain); }
  function tanpaStempel(d) { var c = Object.assign({}, d); delete c.diperbarui; return JSON.stringify(c); }

  async function muatData(paksa) {
    var pill = document.getElementById('previewPill');

    if (!API.siap()) {                       // Mode pratinjau: data contoh bawaan
      state.data = window.DEARORA_SEED; state.status = 'ready'; state.sumber = 'pratinjau';
      if (pill) pill.hidden = false;
      render({ jagaScroll: true });
      return;
    }
    if (pill) pill.hidden = true;

    var c = bacaCache();
    var umur = c ? Date.now() - c.t : Infinity;
    if (c && umur < 24 * 3600 * 1000 && bentukValid(c.data)) {
      state.data = c.data; state.status = 'ready'; state.sumber = 'cache';
      render({ jagaScroll: true });
      if (umur < (cfg.CACHE_MENIT || 10) * 60000 && !paksa) return;   // masih segar
    } else {
      state.status = 'loading'; render({ jagaScroll: true });
    }

    try {
      var res = await API.get('getPublicData');
      if (!res || !res.success || !bentukValid(res.data)) throw new Error((res && res.message) || 'Data tidak valid');
      var berubah = !state.data || tanpaStempel(state.data) !== tanpaStempel(res.data);
      var sebelumnya = state.status;
      state.data = res.data; state.status = 'ready'; state.sumber = 'live';
      simpanCache(res.data);
      var r0 = V.rute[state.rute];
      // Jangan merender ulang form/status yang sedang diisi hanya karena data segar tiba.
      var lewati = r0 && r0.jagaState && sebelumnya === 'ready';
      if (berubah && !lewati) render({ jagaScroll: true });
    } catch (err) {
      console.warn('[Dearora] Gagal memuat data:', err && err.message);
      if (state.status !== 'ready') { state.status = 'error'; render({ jagaScroll: true }); }
    }
  }

  /* ---------------- Drawer menu ---------------- */
  function bukaDrawer() { $drawer.classList.add('open'); $menuBtn.setAttribute('aria-expanded', 'true'); $menuBtn.setAttribute('aria-label', 'Tutup menu'); document.body.style.overflow = 'hidden'; }
  function tutupDrawer() { $drawer.classList.remove('open'); $menuBtn.setAttribute('aria-expanded', 'false'); $menuBtn.setAttribute('aria-label', 'Buka menu'); document.body.style.overflow = ''; }

  /* ---------------- Modal demo ---------------- */
  var DEMO_JENIS = [['kado', 'Kado'], ['kuis', 'Kuis'], ['gosok', 'Gosok'], ['pilihan', 'Pilihan'], ['kode', 'Kode'], ['harapan', 'Tiup lilin'], ['taman', 'Taman'], ['cinta', 'Cinta']];
  function urlDemo(tema, kat, j) { return '/u/?demo=1&tema=' + encodeURIComponent(tema) + '&kat=' + encodeURIComponent(kat) + '&j=' + encodeURIComponent(j); }
  function bukaDemo(id, pemicu) {
    if (!state.data) return;
    var d = state.data.desain.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    var tema = U.temaDari(d.thumbnail), kat = '', gs = window.Gaya && Gaya.G[tema], khusus = !!(gs && gs.special);
    var undangan = (d.paket || []).indexOf('invitation') >= 0 && (d.paket || []).indexOf('premium') < 0 && (d.paket || []).indexOf('basic') < 0;          // desain undangan: tanpa kejutan Basic
    var tags = (d.paket || []).map(function (p) { return U.badgePaket(p, state.data.paket); }).join(' ');
    var urlDemoLengkap = U.amanHttps(d.urlDemo);
    $dialog.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-bar"><div><strong id="demoTitle">' + esc(d.nama) + '</strong><small>Demo interaktif · data contoh</small></div>' +
        '<button type="button" class="icon-btn" data-action="close-demo" aria-label="Tutup demo">' + ic('x') + '</button></div>' +
        '<div class="demo-mode" role="group" aria-label="Ukuran tampilan demo"><button type="button" class="chip on" data-demo-m="hp" aria-pressed="true">Tampilan HP</button><button type="button" class="chip" data-demo-m="desk" aria-pressed="false">Tampilan Desktop</button></div>' +
        '<div class="demo-stage"><iframe class="demo-frame" id="demoFrame" title="Demo ucapan: ' + esc(d.nama) + '" src="' + esc(urlDemo(tema, kat, 'kado')) + '"></iframe></div>' +
        (undangan ? '<div class="demo-jenis"><span class="small muted">Demo undangan interaktif: amplop pembuka → halaman undangan → konfirmasi hadir (di demo hanya simulasi, tidak terkirim ke siapa pun).</span></div>' : (khusus ? '<div class="demo-jenis"><span class="small muted">Demo lengkap Paket Premium: pembuka → ucapan → surat → halaman ' + esc(d.nama) + ' → kejutan → kenangan.</span></div>' : '') + ('<div class="demo-jenis" role="group" aria-label="Coba jenis kejutan"><span class="small muted">Coba kejutan:</span>' + DEMO_JENIS.map(function (j, i) { return '<button type="button" class="chip' + (i === 0 ? ' on' : '') + '" data-demo-j="' + j[0] + '" aria-pressed="' + (i === 0) + '">' + esc(j[1]) + '</button>'; }).join('') + '</div>')) +
        '<div class="modal-foot"><div style="display:flex;flex-wrap:wrap;gap:.375rem;justify-content:center">' + tags + '</div>' +
          '<a class="btn btn-primary" data-action="close-demo" href="#/buat?desain=' + encodeURIComponent(d.id) + '">Pakai Desain Ini</a>' +
          (urlDemoLengkap ? '<a class="btn btn-secondary" href="' + esc(urlDemoLengkap) + '" target="_blank" rel="noopener noreferrer">Buka Demo Lengkap</a>' : '') +
          '<p class="small">Ini hanya contoh dengan nama dan pesan fiktif.</p></div>' +
      '</div>';
    $dialog.setAttribute('aria-labelledby', 'demoTitle');
    $dialog.classList.remove('demo-desk'); $dialog._tema = tema; $dialog._kat = kat;
    if (typeof $dialog.showModal === 'function') $dialog.showModal(); else $dialog.setAttribute('open', '');
    $dialog._pemicu = pemicu;
  }
  /** Mode desktop: skala bingkai 1280×720 agar muat di jendela (tanpa terpotong). */
  function aturDemoDesk() {
    if (!$dialog.classList.contains('demo-desk')) return;
    var st = $dialog.querySelector('.demo-stage'); if (!st) return;
    var k = Math.min((st.clientWidth - 24) / 1280, (window.innerHeight - 260) / 720, 1);
    $dialog.style.setProperty('--demo-k', k.toFixed(3)); $dialog.style.setProperty('--demo-h', Math.round(720 * k) + 'px');
  }
  window.addEventListener('resize', aturDemoDesk);
  function tutupDemo() {
    if ($dialog.open) { if (typeof $dialog.close === 'function') $dialog.close(); else $dialog.removeAttribute('open'); }
  }

  /* ---------------- Event (delegasi) ---------------- */
  document.addEventListener('click', function (ev) {
    var mode = ev.target.closest('[data-demo-m]');
    if (mode && $dialog.open) {
      var desk = mode.dataset.demoM === 'desk'; $dialog.classList.toggle('demo-desk', desk); aturDemoDesk();
      $dialog.querySelectorAll('[data-demo-m]').forEach(function (c) { c.classList.toggle('on', c === mode); c.setAttribute('aria-pressed', c === mode ? 'true' : 'false'); });
      return;
    }
    var chip = ev.target.closest('[data-demo-j]');
    if (chip && $dialog.open) {
      var fr = document.getElementById('demoFrame'); if (fr) fr.src = urlDemo($dialog._tema, $dialog._kat, chip.dataset.demoJ);
      $dialog.querySelectorAll('[data-demo-j]').forEach(function (c) { var on = c === chip; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
      return;
    }
    var el = ev.target.closest('[data-action]');
    if (!el) {
      if (ev.target === $dialog) tutupDemo();     // klik backdrop
      return;
    }
    var aksi = el.dataset.action;
    switch (aksi) {
      case 'menu': $drawer.classList.contains('open') ? tutupDrawer() : bukaDrawer(); break;
      case 'demo': bukaDemo(el.dataset.id, el); break;
      case 'close-demo': tutupDemo(); break;
      case 'open-card': document.getElementById('demoPhone').classList.add('opened'); break;
      case 'replay-card': document.getElementById('demoPhone').classList.remove('opened'); break;
      case 'retry': state.status = 'loading'; render({ jagaScroll: true }); muatData(true); break;
      case 'filter': {
        var q = Object.assign({}, state.query); q[el.dataset.k] = el.dataset.v;
        location.hash = buatHash('contoh-desain', q); break;
      }
      case 'reset-filter': location.hash = '#/contoh-desain'; break;
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && $drawer.classList.contains('open')) { tutupDrawer(); $menuBtn.focus(); }
  });
  window.addEventListener('hashchange', function () { render(); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960) tutupDrawer(); });

  /* ---------------- Mulai ---------------- */
  render();
  muatData();
})();
