/**
 * PyRunner — Shared Python Editor Component
 *
 * Provides a complete, self-contained editor panel with:
 *   - CodeMirror 6 (Python, One Dark, autocomplete, line numbers)
 *   - Pyodide-powered code execution
 *   - Stopwatch (play / pause / reset)
 *   - Clear, Reset, Run buttons
 *   - Output panel with motivational default message
 *
 * Requires codemirror-bundle.js (window.CM) to be loaded first.
 *
 * Usage:
 *   const { panel, ensureEditor, getCode, setCode } = PyRunner.createPanel({
 *     initialCode: '# hello\nprint("hi")\n'
 *   });
 *   someContainer.appendChild(panel);
 *   ensureEditor();   // call when panel becomes visible
 */

(function () {
  'use strict';

  const DEFAULT_MESSAGE =
    'Take a deep breath, relax and give it your best shot. We\u2019re rooting for you!';

  // ── CSS (injected once) ────────────────────────────────────────
  const CSS = `
    /* ── PyRunner editor panel ── */
    .pyr-panel {
      border: 1px solid #2a2a3a;
      border-radius: 10px;
      overflow: hidden;
      background: #12121a;
    }

    /* Header bar */
    .pyr-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px;
      border-bottom: 1px solid #2a2a3a;
      background: rgba(255,255,255,0.015);
      gap: 8px;
      flex-wrap: wrap;
    }
    .pyr-label {
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.78rem;
      color: #34d399;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .pyr-actions {
      display: flex;
      gap: 7px;
      align-items: center;
      flex-wrap: wrap;
    }

    /* Stopwatch */
    .pyr-timer-group {
      display: flex;
      align-items: center;
      gap: 5px;
      padding-right: 9px;
      margin-right: 3px;
      border-right: 1px solid #2a2a3a;
    }
    .pyr-sw-display {
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.78rem;
      color: #6c8cff;
      letter-spacing: 1px;
      min-width: 60px;
      text-align: center;
      user-select: none;
    }
    .pyr-btn-timer {
      background: transparent;
      border: 1px solid #2a2a3a;
      color: #8888a0;
      font-size: 0.78rem;
      padding: 3px 7px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s;
      line-height: 1;
    }
    .pyr-btn-timer:hover {
      border-color: #6c8cff;
      color: #6c8cff;
    }
    .pyr-btn-timer.active {
      border-color: #6c8cff;
      color: #6c8cff;
      background: rgba(108,140,255,0.1);
    }

    /* Buttons */
    .pyr-btn {
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.76rem;
      padding: 5px 14px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .pyr-btn-clear {
      background: transparent;
      border: 1px solid #2a2a3a;
      color: #8888a0;
    }
    .pyr-btn-clear:hover { border-color: #f87171; color: #f87171; }

    .pyr-btn-reset {
      background: transparent;
      border: 1px solid #2a2a3a;
      color: #8888a0;
    }
    .pyr-btn-reset:hover { border-color: #8888a0; color: #e0e0e8; }

    .pyr-btn-run {
      background: rgba(52,211,153,0.12);
      color: #34d399;
      border: 1px solid rgba(52,211,153,0.25);
    }
    .pyr-btn-run:hover {
      background: rgba(52,211,153,0.2);
      border-color: #34d399;
    }
    .pyr-btn-run:disabled { opacity: 0.5; cursor: wait; }

    /* Editor-only theme toggle (independent of site light/dark) */
    .pyr-btn-theme {
      background: transparent;
      border: 1px solid #2a2a3a;
      color: #8888a0;
      padding: 4px 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .pyr-btn-theme:hover { border-color: #6c8cff; color: #6c8cff; }
    .pyr-btn-theme svg { width: 14px; height: 14px; fill: currentColor; }
    .pyr-btn-theme .pyr-icon-sun { display: none; }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-theme .pyr-icon-moon { display: none; }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-theme .pyr-icon-sun { display: block; }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-theme {
      border-color: #dddde8;
      color: #5a5a7a;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-theme:hover {
      border-color: #3d5ce0;
      color: #3d5ce0;
    }


    /* CodeMirror mount — default viewport ~10 lines (not content-sized) */
    .pyr-cm-mount .cm-editor {
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace !important;
      font-size: 0.84rem;
      line-height: 1.75;
      height: calc(0.84rem * 1.75 * 10);
      min-height: calc(0.84rem * 1.75 * 10);
      max-height: none;
    }
    .pyr-cm-mount .cm-editor.cm-focused {
      outline: none;
    }
    .pyr-cm-mount .cm-scroller { overflow: auto; height: 100%; }
    .pyr-cm-mount .cm-gutters { border-right: 1px solid #2a2a3a; }

    /* Output */
    .pyr-output-wrap {
      border-top: 1px solid #2a2a3a;
    }
    .pyr-output-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: rgba(255,255,255,0.015);
      border-bottom: 1px solid #1e1e2a;
    }
    .pyr-output-label {
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.72rem;
      color: #8888a0;
      letter-spacing: 0.5px;
    }
    .pyr-status {
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.7rem;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .pyr-status.loading { color: #6c8cff; background: rgba(108,140,255,0.1); }
    .pyr-status.success  { color: #34d399; background: rgba(52,211,153,0.1); }
    .pyr-status.error    { color: #f87171; background: rgba(248,113,113,0.1); }

    .pyr-output {
      padding: 12px 16px;
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.82rem;
      line-height: 1.6;
      color: #8888a0;
      white-space: pre-wrap;
      word-break: break-word;
      min-height: 40px;
      max-height: 320px;
      overflow-y: auto;
    }
    .pyr-output.has-output { color: #c9d1e8; }
    .pyr-output.error { color: #f87171; }

    /* Responsive */
    @media (max-width: 600px) {
      .pyr-header { padding: 8px 10px; }
      .pyr-sw-display { font-size: 0.7rem; min-width: 50px; }
      .pyr-btn { font-size: 0.7rem; padding: 4px 10px; }
      /* Still ~10 lines on small screens; slightly smaller type */
      .pyr-cm-mount .cm-editor {
        font-size: 0.78rem;
        height: calc(0.78rem * 1.75 * 10);
        min-height: calc(0.78rem * 1.75 * 10);
      }
    }

    /* Light mode — match The Context Window page theme */
    .pyr-panel[data-editor-theme="light"] {
      background: #ffffff;
      border-color: #dddde8;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-header {
      background: #f5f5f8;
      border-bottom-color: #dddde8;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-timer-group { border-right-color: #dddde8; }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-timer {
      border-color: #dddde8;
      color: #5a5a7a;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-timer:hover,
    .pyr-panel[data-editor-theme="light"] .pyr-btn-timer.active {
      border-color: #3d5ce0;
      color: #3d5ce0;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-timer.active {
      background: rgba(61,92,224,0.08);
    }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-clear,
    .pyr-panel[data-editor-theme="light"] .pyr-btn-reset {
      border-color: #dddde8;
      color: #5a5a7a;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-reset:hover { color: #1a1a2e; border-color: #5a5a7a; }
    .pyr-panel[data-editor-theme="light"] .pyr-btn-run {
      background: rgba(15,154,106,0.1);
      color: #0f9a6a;
      border-color: rgba(15,154,106,0.3);
    }
    .pyr-panel[data-editor-theme="light"] .pyr-output-wrap { border-top-color: #dddde8; }
    .pyr-panel[data-editor-theme="light"] .pyr-output-header {
      background: #f5f5f8;
      border-bottom-color: #dddde8;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-output {
      background: #ffffff;
      color: #5a5a7a;
    }
    .pyr-panel[data-editor-theme="light"] .pyr-output.has-output { color: #1a1a2e; }
    .pyr-panel[data-editor-theme="light"] .pyr-cm-mount .cm-gutters { border-right-color: #dddde8; }
  `;

  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    cssInjected = true;
  }

  // ── Pyodide lazy singleton ──────────────────────────────────────
  let pyodidePromise = null;

  function loadPyodideOnce() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
      s.onload = async () => {
        try { resolve(await loadPyodide()); }
        catch (e) { reject(e); }
      };
      s.onerror = () => reject(new Error('Failed to load Pyodide'));
      document.head.appendChild(s);
    });
    return pyodidePromise;
  }

  // ── Run Python code ─────────────────────────────────────────────
  async function runPython(code, outputEl, statusEl, runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = '\u23F3 Running...';
    statusEl.textContent = 'Loading Python...';
    statusEl.className = 'pyr-status loading';
    outputEl.textContent = '';
    outputEl.className = 'pyr-output';

    try {
      const pyodide = await loadPyodideOnce();
      statusEl.textContent = 'Running...';

      pyodide.runPython(
        'import sys, io\n' +
        '_captured_stdout = io.StringIO()\n' +
        '_captured_stderr = io.StringIO()\n' +
        'sys.stdout = _captured_stdout\n' +
        'sys.stderr = _captured_stderr\n'
      );

      try {
        pyodide.runPython(code);
      } catch (pyErr) {
        const stderr = pyodide.runPython('_captured_stderr.getvalue()');
        outputEl.textContent = stderr || String(pyErr);
        outputEl.className = 'pyr-output error';
        statusEl.textContent = '\u2717 Error';
        statusEl.className = 'pyr-status error';
        return;
      }

      const stdout = pyodide.runPython('_captured_stdout.getvalue()');
      const stderr = pyodide.runPython('_captured_stderr.getvalue()');
      pyodide.runPython('sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__\n');

      if (stderr) {
        outputEl.textContent = stdout + '\n' + stderr;
        outputEl.className = 'pyr-output error';
        statusEl.textContent = '\u26A0 Warning';
        statusEl.className = 'pyr-status error';
      } else {
        outputEl.textContent = stdout || '(no output)';
        outputEl.className = 'pyr-output has-output';
        statusEl.textContent = '\u2713 Done';
        statusEl.className = 'pyr-status success';
      }
    } catch (err) {
      outputEl.textContent = String(err);
      outputEl.className = 'pyr-output error';
      statusEl.textContent = '\u2717 Error';
      statusEl.className = 'pyr-status error';
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = '\u25B6 Run';
    }
  }

  var EDITOR_THEME_KEY = 'tcw-sandbox-editor-theme';

  // Editor theme is independent of the site theme toggle.
  function getEditorTheme() {
    var stored = localStorage.getItem(EDITOR_THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Default: dark editor (works well even on a light page)
    return 'dark';
  }

  function setEditorTheme(theme) {
    localStorage.setItem(EDITOR_THEME_KEY, theme);
  }

  function editorIsLight() {
    return getEditorTheme() === 'light';
  }

  // Light editor chrome (bundle only ships oneDark for dark mode)
  function lightEditorTheme(EditorView) {
    return EditorView.theme({
      '&': {
        backgroundColor: '#f7f7fb',
        color: '#1a1a2e',
      },
      '.cm-content': { caretColor: '#1a1a2e' },
      '&.cm-focused .cm-cursor': { borderLeftColor: '#1a1a2e' },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(61, 92, 224, 0.22)',
      },
      '.cm-selectionBackground': { backgroundColor: 'rgba(61, 92, 224, 0.18)' },
      '.cm-gutters': {
        backgroundColor: '#eef0f6',
        color: '#6a6a80',
        border: 'none',
        borderRight: '1px solid #dddde8',
      },
      '.cm-activeLine': { backgroundColor: 'rgba(61, 92, 224, 0.06)' },
      '.cm-activeLineGutter': { backgroundColor: 'rgba(61, 92, 224, 0.06)' },
    }, { dark: false });
  }

  // ── Create CodeMirror editor ────────────────────────────────────
  function createCM(mountEl, doc, onRun) {
    const { basicSetup, EditorView, python, oneDark, keymap, EditorState, indentWithTab } = window.CM;

    const runKM = keymap.of([{
      key: 'Mod-Enter',
      run: () => { onRun(); return true; }
    }]);

    // Follow editor-only preference (not the site theme)
    const themeExt = editorIsLight() ? lightEditorTheme(EditorView) : oneDark;

    return new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: [
          basicSetup,
          python(),
          themeExt,
          keymap.of([indentWithTab]),
          runKM,
          EditorView.lineWrapping,
        ]
      }),
      parent: mountEl
    });
  }

  // ── Stopwatch helper ────────────────────────────────────────────
  function createStopwatch(displayEl, toggleBtn, resetBtn) {
    let seconds = 0, interval = null, running = false;

    function fmt(t) {
      const h = String(Math.floor(t / 3600)).padStart(2, '0');
      const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
      const s = String(t % 60).padStart(2, '0');
      return h + ':' + m + ':' + s;
    }

    toggleBtn.addEventListener('click', () => {
      if (running) {
        clearInterval(interval); interval = null; running = false;
        toggleBtn.textContent = '\u25B6';
        toggleBtn.classList.remove('active');
      } else {
        interval = setInterval(() => { seconds++; displayEl.textContent = fmt(seconds); }, 1000);
        running = true;
        toggleBtn.textContent = '\u23F8';
        toggleBtn.classList.add('active');
      }
    });

    resetBtn.addEventListener('click', () => {
      clearInterval(interval); interval = null; running = false;
      seconds = 0;
      displayEl.textContent = '00:00:00';
      toggleBtn.textContent = '\u25B6';
      toggleBtn.classList.remove('active');
    });
  }

  // ── Public API: createPanel ─────────────────────────────────────
  // Builds the entire editor + output panel DOM and returns it.
  //
  // options.initialCode  — code to pre-fill (default: empty comment)
  //
  // Returns { panel, ensureEditor, getCode, setCode, resetAll }

  function createPanel(options) {
    injectCSS();
    const opts = options || {};
    const starterCode = opts.initialCode || '# Write your code here\n';

    // Build DOM
    const panel = document.createElement('div');
    panel.className = 'pyr-panel';

    panel.innerHTML =
      '<div class="pyr-header">' +
        '<div class="pyr-label">\u2726 editor.py</div>' +
        '<div class="pyr-actions">' +
          '<div class="pyr-timer-group">' +
            '<span class="pyr-sw-display">00:00:00</span>' +
            '<button class="pyr-btn pyr-btn-timer" title="Start / Pause">\u25B6</button>' +
            '<button class="pyr-btn pyr-btn-timer" title="Reset stopwatch">\u21BA</button>' +
          '</div>' +
          '<button class="pyr-btn pyr-btn-theme" type="button" title="Editor theme" aria-label="Toggle editor theme">' +
            '<svg class="pyr-icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
            '<svg class="pyr-icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
          '</button>' +
          '<button class="pyr-btn pyr-btn-clear">Clear</button>' +
          '<button class="pyr-btn pyr-btn-reset" title="Reset to starter code">\u21BA Reset</button>' +
          '<button class="pyr-btn pyr-btn-run">\u25B6 Run</button>' +
        '</div>' +
      '</div>' +
      '<div class="pyr-cm-mount"></div>' +
      '<div class="pyr-output-wrap">' +
        '<div class="pyr-output-header">' +
          '<span class="pyr-output-label">Output</span>' +
          '<span class="pyr-status"></span>' +
        '</div>' +
        '<div class="pyr-output">' + DEFAULT_MESSAGE + '</div>' +
      '</div>';

    // Grab references
    const cmMount   = panel.querySelector('.pyr-cm-mount');
    const outputEl  = panel.querySelector('.pyr-output');
    const statusEl  = panel.querySelector('.pyr-status');
    const runBtn    = panel.querySelector('.pyr-btn-run');
    const clearBtn  = panel.querySelector('.pyr-btn-clear');
    const resetBtn  = panel.querySelector('.pyr-btn-reset');
    const swDisplay = panel.querySelector('.pyr-sw-display');
    const timerBtns = panel.querySelectorAll('.pyr-btn-timer');

    // Stopwatch
    createStopwatch(swDisplay, timerBtns[0], timerBtns[1]);

    // Apply editor theme to panel chrome (independent of site theme)
    function applyEditorThemeAttr() {
      panel.setAttribute('data-editor-theme', getEditorTheme());
    }
    applyEditorThemeAttr();

    const themeBtn = panel.querySelector('.pyr-btn-theme');
    themeBtn.addEventListener('click', function () {
      setEditorTheme(editorIsLight() ? 'dark' : 'light');
      applyEditorThemeAttr();
      // Rebuild CodeMirror with the matching syntax theme
      if (view) {
        const code = view.state.doc.toString();
        view.destroy();
        view = null;
        cmMount.innerHTML = '';
        view = createCM(cmMount, code, doRun);
        appliedEditorLight = editorIsLight();
      }
    });

    // CodeMirror (lazy — only created when ensureEditor is called)
    let view = null;
    let appliedEditorLight = null;

    function ensureEditor() {
      const wantLight = editorIsLight();
      if (!view || appliedEditorLight !== wantLight) {
        const code = view ? view.state.doc.toString() : starterCode;
        if (view) {
          view.destroy();
          view = null;
          cmMount.innerHTML = '';
        }
        view = createCM(cmMount, code, doRun);
        appliedEditorLight = wantLight;
      }
      return view;
    }

    function getCode() {
      return view ? view.state.doc.toString() : starterCode;
    }

    function setCode(code) {
      const v = ensureEditor();
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: code } });
    }

    function resetOutput() {
      outputEl.textContent = DEFAULT_MESSAGE;
      outputEl.className = 'pyr-output';
      statusEl.textContent = '';
      statusEl.className = 'pyr-status';
    }

    function doRun() {
      const code = getCode();
      if (!code.trim()) {
        outputEl.textContent = DEFAULT_MESSAGE;
        outputEl.className = 'pyr-output';
        return;
      }
      runPython(code, outputEl, statusEl, runBtn);
    }

    // Button handlers
    runBtn.addEventListener('click', doRun);

    clearBtn.addEventListener('click', () => {
      setCode('');
      resetOutput();
      ensureEditor().focus();
    });

    resetBtn.addEventListener('click', () => {
      setCode(starterCode);
      resetOutput();
    });

    return { panel, ensureEditor, getCode, setCode, resetAll: resetOutput };
  }

  // ── Expose global ───────────────────────────────────────────────
  window.PyRunner = { createPanel, loadPyodide: loadPyodideOnce };

})();
