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

    var html = r ? r.view(ctx()) : V.tidakAda();
    var y = window.scrollY;
    $main.innerHTML = '<div class="view">' + html + '</div>';
    document.title = (r ? r.judul : 'Halaman Tidak Ditemukan') + ' — Dearora';
    tandaiNav(r ? r.nav : '');
    pasangReveal();
    isiFooter();

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
      state.data = res.data; state.status = 'ready'; state.sumber = 'live';
      simpanCache(res.data);
      if (berubah) render({ jagaScroll: true });
    } catch (err) {
      console.warn('[Dearora] Gagal memuat data:', err && err.message);
      if (state.status !== 'ready') { state.status = 'error'; render({ jagaScroll: true }); }
    }
  }

  /* ---------------- Drawer menu ---------------- */
  function bukaDrawer() { $drawer.classList.add('open'); $menuBtn.setAttribute('aria-expanded', 'true'); $menuBtn.setAttribute('aria-label', 'Tutup menu'); document.body.style.overflow = 'hidden'; }
  function tutupDrawer() { $drawer.classList.remove('open'); $menuBtn.setAttribute('aria-expanded', 'false'); $menuBtn.setAttribute('aria-label', 'Buka menu'); document.body.style.overflow = ''; }

  /* ---------------- Modal demo ---------------- */
  function bukaDemo(id, pemicu) {
    if (!state.data) return;
    var d = state.data.desain.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    var tema = U.temaDari(d.thumbnail);
    var kat = U.infoKategori(d.kategori);
    var cth = U.CONTOH[d.kategori] || U.CONTOH['Ulang Tahun'];
    var ikon = U.ikonTema(tema, d.kategori);
    var partIkon = (tema === 'cinema' || tema === 'arcade' || tema === 'grad') ? 'sparkles' : 'heart';
    var tags = (d.paket || []).map(function (p) { return U.badgePaket(p, state.data.paket); }).join(' ');
    var urlDemo = U.amanHttps(d.urlDemo);

    $dialog.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-bar"><div><strong id="demoTitle">' + esc(d.nama) + '</strong><small>Demo dengan data contoh</small></div>' +
        '<button type="button" class="icon-btn" data-action="close-demo" aria-label="Tutup demo">' + ic('x') + '</button></div>' +
        '<div class="demo-stage"><div class="demo-phone theme theme-' + tema + '" id="demoPhone">' + U.partikel(9, partIkon) +
          '<div class="demo-layer demo-cover"><span class="ico">' + ic(ikon) + '</span>' +
            '<p style="font-weight:700;letter-spacing:.06em;font-size:.75rem">UNTUK RANI</p>' +
            '<h3>' + esc(cth.judul) + '</h3><p>Ada pesan kecil yang menunggumu.</p>' +
            '<button type="button" class="demo-open" data-action="open-card">Ketuk untuk membuka</button></div>' +
          '<div class="demo-layer demo-msg" aria-live="polite">' +
            '<span class="to">Untuk Rani</span><div class="demo-photos" aria-hidden="true"><i></i><i></i><i></i></div>' +
            '<p class="body">' + esc(cth.pesan) + '</p><p class="from">— Dimas</p>' +
            '<button type="button" class="btn btn-ghost-light btn-sm" style="color:var(--tink);border-color:var(--tacc)" data-action="replay-card">Ulangi</button></div>' +
        '</div></div>' +
        '<div class="modal-foot"><div style="display:flex;flex-wrap:wrap;gap:.375rem;justify-content:center">' +
          '<span class="tag lav">' + esc(kat.judul.split(' & ')[0]) + '</span>' + tags + '</div>' +
          '<a class="btn btn-primary" data-action="close-demo" href="#/buat?desain=' + encodeURIComponent(d.id) + '">Pakai Desain Ini</a>' +
          (urlDemo ? '<a class="btn btn-secondary" href="' + esc(urlDemo) + '" target="_blank" rel="noopener noreferrer">Buka Demo Lengkap</a>' : '') +
          '<p class="small">Ini hanya contoh dengan nama dan pesan fiktif.</p></div>' +
      '</div>';
    $dialog.setAttribute('aria-labelledby', 'demoTitle');
    if (typeof $dialog.showModal === 'function') $dialog.showModal(); else $dialog.setAttribute('open', '');
    $dialog._pemicu = pemicu;
  }
  function tutupDemo() {
    if ($dialog.open) { if (typeof $dialog.close === 'function') $dialog.close(); else $dialog.removeAttribute('open'); }
  }

  /* ---------------- Event (delegasi) ---------------- */
  document.addEventListener('click', function (ev) {
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
