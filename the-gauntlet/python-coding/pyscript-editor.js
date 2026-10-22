/**
 * PyScript Editor Injector
 *
 * Auto-discovers all .problem blocks on the page and injects
 * a "Let's Code" button + collapsible editor panel powered by
 * PyRunner (pyrunner.js).
 *
 * Requires (loaded before this script):
 *   1. codemirror-bundle.js  (window.CM)
 *   2. pyrunner.js           (window.PyRunner)
 */

(function () {
  'use strict';

  // ── Minimal CSS for the toggle button and panel wrapper ─────────
  const INJECTOR_CSS = `
    .code-btn {
      background: transparent;
      border: 1px solid rgba(52,211,153,0.35);
      color: #34d399;
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.8rem;
      padding: 9px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.5px;
      margin-left: 8px;
    }
    .code-btn:hover {
      background: rgba(52,211,153,0.08);
      border-color: #34d399;
    }
    .code-btn.active {
      background: rgba(52,211,153,0.12);
      border-color: #34d399;
    }

    .editor-panel {
      display: none;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #2a2a3a;
    }
    .editor-panel.open { display: block; }
  `;

  const style = document.createElement('style');
  style.textContent = INJECTOR_CSS;
  document.head.appendChild(style);

  // ── Extract starter code from the solution code-block ───────────
  function extractStarterCode(problem) {
    const codeBlock = problem.querySelector('.answer .code-block');
    if (!codeBlock) return '# Write your solution here\n';

    const fullCode = codeBlock.textContent;
    const lines = fullCode.split('\n');
    const starterLines = [];
    let foundDef = false;

    for (const line of lines) {
      const trimmed = line.trimStart();

      // Always include imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        starterLines.push(line);
        continue;
      }

      // Include constants (UPPER_CASE = ...)
      if (/^[A-Z_][A-Z_0-9]*\s*=/.test(trimmed)) {
        starterLines.push(line);
        continue;
      }

      // Include class definitions (just the signature)
      if (trimmed.startsWith('class ')) {
        if (foundDef) starterLines.push('');
        starterLines.push(line);
        starterLines.push('    # Your implementation here');
        starterLines.push('    pass');
        foundDef = true;
        continue;
      }

      // Include function signatures
      if (trimmed.startsWith('def ')) {
        if (foundDef) starterLines.push('');
        starterLines.push(line);
        starterLines.push('    # Your implementation here');
        starterLines.push('    pass');
        foundDef = true;
        continue;
      }
    }

    if (!foundDef) return '# Write your solution here\n';

    // Add structured test cases if available
    const tests = (window.PROBLEM_TESTS || {})[problem.id];
    if (tests && tests.length > 0) {
      starterLines.push('');
      starterLines.push('');
      starterLines.push('# ──────────────────────────────────────────────');
      starterLines.push('# Test Cases (editable — add your own below!)');
      starterLines.push('# ──────────────────────────────────────────────');
      starterLines.push('');
      starterLines.push('_pass = _fail = 0');
      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        starterLines.push('');
        starterLines.push('# Test ' + (i + 1) + ': ' + (t.name || ''));
        if (t.setup) {
          for (const setupLine of t.setup.split('\n')) {
            starterLines.push(setupLine);
          }
        }
        starterLines.push('_result = ' + t.call);
        starterLines.push('_expected = ' + t.expected);
        starterLines.push('if _result == _expected:');
        starterLines.push('    print(f"  \u2713 Test ' + (i + 1) + ' PASSED: ' + (t.name || '') + '")');
        starterLines.push('    _pass += 1');
        starterLines.push('else:');
        starterLines.push('    print(f"  \u2717 Test ' + (i + 1) + ' FAILED: ' + (t.name || '') + '")');
        starterLines.push('    print(f"    Expected: {_expected}")');
        starterLines.push('    print(f"    Got:      {_result}")');
        starterLines.push('    _fail += 1');
      }
      starterLines.push('');
      starterLines.push('print()');
      starterLines.push('print(f"Results: {_pass} passed, {_fail} failed, {_pass + _fail} total")');
    } else {
      // Fallback: extract test hints from the example block
      const example = problem.querySelector('.example');
      if (example) {
        const exText = example.textContent.trim();
        const callLines = exText.split('\n').filter(l => {
          const t = l.trim();
          return (t.includes('(') && !t.startsWith('#') && !t.startsWith('\u2192')
                  && !t.startsWith('Input') && !t.startsWith('{')
                  && !t.startsWith('//'));
        });
        if (callLines.length > 0) {
          starterLines.push('');
          starterLines.push('# --- Test your solution ---');
          for (const cl of callLines.slice(0, 4)) {
            const cleaned = cl.trim()
              .replace(/\s*\u2192.*$/, '')
              .replace(/\s*#.*$/, '');
            if (cleaned) starterLines.push('print(' + cleaned + ')');
          }
        }
      }
    }

    return starterLines.join('\n') + '\n';
  }

  // ── Main: discover problems and inject buttons ──────────────────
  function init() {
    const problems = document.querySelectorAll('.problem');

    problems.forEach(problem => {
      // Only problems with a code solution
      if (!problem.querySelector('.answer .code-block')) return;

      const revealBtn = problem.querySelector('.reveal-btn');
      if (!revealBtn) return;

      // "Let's Code" toggle button
      const codeBtn = document.createElement('button');
      codeBtn.className = 'code-btn';
      codeBtn.textContent = "\u2726 Let's Code";
      revealBtn.parentNode.insertBefore(codeBtn, revealBtn.nextSibling);

      // Lazy-create the PyRunner panel on first click
      let wrapper = null;
      let panelAPI = null;

      codeBtn.addEventListener('click', () => {
        if (!wrapper) {
          const starterCode = extractStarterCode(problem);
          panelAPI = window.PyRunner.createPanel({ initialCode: starterCode });

          wrapper = document.createElement('div');
          wrapper.className = 'editor-panel';
          wrapper.appendChild(panelAPI.panel);

          const answer = problem.querySelector('.answer');
          if (answer) {
            answer.parentNode.insertBefore(wrapper, answer.nextSibling);
          } else {
            problem.appendChild(wrapper);
          }
        }

        const isOpen = wrapper.classList.contains('open');
        if (isOpen) {
          wrapper.classList.remove('open');
          codeBtn.classList.remove('active');
          codeBtn.textContent = "\u2726 Let's Code";
        } else {
          wrapper.classList.add('open');
          codeBtn.classList.add('active');
          codeBtn.textContent = "\u2726 Hide Editor";
          panelAPI.ensureEditor();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
