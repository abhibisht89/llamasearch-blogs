/* Apply saved theme before paint. Load sync in <head>. */
(function () {
  try {
    if (localStorage.getItem('tcw-theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
