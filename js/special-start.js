(function () {
  'use strict';
  var S = window.Special, k = new URLSearchParams(location.search).get('d') || '';
  if (S.ada(k)) { S.mount(k); return; }
  S.root().className = 'sp-root';
  S.root().innerHTML = '<div class="sp-pesan"><h1>Pilih desain</h1><p>Tambahkan <code>?d=</code> diikuti nama desain:</p><ul>' + S.daftar().map(function (x) { return '<li><a href="?d=' + S.esc(x) + '">' + S.esc(x) + '</a></li>'; }).join('') + '</ul></div>';
})();
