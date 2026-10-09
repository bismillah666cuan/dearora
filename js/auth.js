/* ==========================================================
   AUTH — sesi pembeli (kode redeem + password)
   • Token sesi disimpan di sessionStorage (hilang saat tab ditutup), bukan di URL.
   • Semua pemeriksaan hak akses terjadi di SERVER; sisi ini hanya menyimpan token.
   ========================================================== */
(function () {
  'use strict';
  var API = window.DearoraAPI, U = window.UI;
  var KEY = 'dearora:sesi:v1';

  function baca() { try { var j = JSON.parse(sessionStorage.getItem(KEY)); return j && j.token ? j : null; } catch (e) { return null; } }
  function simpan(token, profil) { try { sessionStorage.setItem(KEY, JSON.stringify({ token: token, profil: profil || null })); } catch (e) { /* diblokir */ } syncHeader(); }
  function hapus() { try { sessionStorage.removeItem(KEY); } catch (e) { /* abaikan */ } syncHeader(); }

  /** Judul tautan "Masuk" di header berubah menjadi "Portal Saya" setelah masuk. */
  function syncHeader() {
    var masuk = !!baca();
    document.querySelectorAll('[data-auth-link]').forEach(function (a) {
      a.textContent = masuk ? 'Portal Saya' : 'Masuk';
      a.setAttribute('href', masuk ? '#/portal' : '#/masuk');
      a.dataset.nav = 'portal';
    });
  }

  async function panggil(aksi, data) {
    var s = baca();
    var r = await API.post(aksi, data || {}, { token: s && s.token, timeout: 30000 });
    if (!r.success && /Sesi berakhir/i.test(r.message || '')) hapus();
    return r;
  }

  window.Auth = {
    ada: function () { return !!baca(); },
    token: function () { var s = baca(); return s ? s.token : ''; },
    profil: function () { var s = baca(); return s ? s.profil : null; },
    simpan: simpan, keluarLokal: hapus, syncHeader: syncHeader, panggil: panggil,

    async cek(kode) { return API.post('customerCheck', { kode: kode }, { timeout: 20000 }); },
    async masuk(kode, password) {
      var r = await API.post('customerLogin', { kode: kode, password: password }, { timeout: 25000 });
      if (r.success) simpan(r.data.token, r.data.profil);
      return r;
    },
    async buatPassword(kode, password) {
      var r = await API.post('setPassword', { kode: kode, password: password }, { timeout: 25000 });
      if (r.success) simpan(r.data.token, r.data.profil);
      return r;
    },
    async keluar() {
      var s = baca(); hapus();
      if (s) { try { await API.post('customerLogout', {}, { token: s.token, timeout: 8000 }); } catch (e) { /* sesi lokal sudah dihapus */ } }
    }
  };
})();
