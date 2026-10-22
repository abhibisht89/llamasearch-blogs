/* Theme toggle + optional Utterances sync. Requires #themeToggle. */
(function () {
  var STORAGE = 'tcw-theme';
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');

  function syncUtterances(theme) {
    var frame = document.querySelector('.utterances-frame');
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        {
          type: 'set-theme',
          theme: theme === 'light' ? 'github-light' : 'github-dark',
        },
        'https://utteranc.es'
      );
    } catch (e) {}
  }

  function currentIsLight() {
    return root.getAttribute('data-theme') === 'light';
  }

  function setTheme(light) {
    if (light) {
      root.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem(STORAGE, 'light');
      } catch (e) {}
      syncUtterances('light');
    } else {
      root.removeAttribute('data-theme');
      try {
        localStorage.setItem(STORAGE, 'dark');
      } catch (e) {}
      syncUtterances('dark');
    }
  }

  // Utterances loads async — re-apply when its iframe is ready
  window.addEventListener('message', function (e) {
    if (e.origin === 'https://utteranc.es') {
      syncUtterances(currentIsLight() ? 'light' : 'dark');
    }
  });

  if (!btn) return;
  btn.addEventListener('click', function () {
    setTheme(!currentIsLight());
  });
})();
