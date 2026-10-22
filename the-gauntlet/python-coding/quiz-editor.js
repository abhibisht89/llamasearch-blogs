/**
 * Quiz Editor Injector
 *
 * Auto-discovers all .question blocks on Python Skills quiz pages
 * and injects a "Try it" button that opens a PyRunner editor
 * pre-filled with the question's code snippet.
 *
 * Requires (loaded before this script):
 *   1. codemirror-bundle.js  (window.CM)
 *   2. pyrunner.js           (window.PyRunner)
 */

(function () {
  'use strict';

  // ── CSS for the Try-it button and panel wrapper ─────────────────
  const CSS = `
    .try-btn {
      background: transparent;
      border: 1px solid rgba(52,211,153,0.35);
      color: #34d399;
      font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.78rem;
      padding: 8px 18px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.5px;
      margin-top: 12px;
      margin-left: 8px;
    }
    .try-btn:hover {
      background: rgba(52,211,153,0.08);
      border-color: #34d399;
    }
    .try-btn.active {
      background: rgba(52,211,153,0.12);
      border-color: #34d399;
    }

    .quiz-editor-panel {
      display: none;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #2a2a3a;
    }
    .quiz-editor-panel.open { display: block; }
  `;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // ── Main: discover questions and inject buttons ─────────────────
  function init() {
    const questions = document.querySelectorAll('.question');

    questions.forEach(question => {
      const codeBlock = question.querySelector('.code-block');
      if (!codeBlock) return;

      // Extract plain text code from the syntax-highlighted pre block
      const code = codeBlock.textContent;

      // Find where to insert the button:
      // After .reveal-btn for "Predict the Output" questions,
      // after .options for "Multiple Choice" questions
      const revealBtn = question.querySelector('.reveal-btn');
      const optionsDiv = question.querySelector('.options');
      const insertAfter = revealBtn || optionsDiv || codeBlock;

      // Create "Try it" button
      const tryBtn = document.createElement('button');
      tryBtn.className = 'try-btn';
      tryBtn.textContent = '\u2726 Try it';
      insertAfter.parentNode.insertBefore(tryBtn, insertAfter.nextSibling);

      // Lazy-create the PyRunner panel on first click
      let wrapper = null;
      let panelAPI = null;

      tryBtn.addEventListener('click', () => {
        if (!wrapper) {
          panelAPI = window.PyRunner.createPanel({ initialCode: code + '\n' });

          wrapper = document.createElement('div');
          wrapper.className = 'quiz-editor-panel';
          wrapper.appendChild(panelAPI.panel);

          // Insert after the answer div (or at end of question)
          const answer = question.querySelector('.answer');
          if (answer) {
            answer.parentNode.insertBefore(wrapper, answer.nextSibling);
          } else {
            question.appendChild(wrapper);
          }
        }

        const isOpen = wrapper.classList.contains('open');
        if (isOpen) {
          wrapper.classList.remove('open');
          tryBtn.classList.remove('active');
          tryBtn.textContent = '\u2726 Try it';
        } else {
          wrapper.classList.add('open');
          tryBtn.classList.add('active');
          tryBtn.textContent = '\u2726 Hide Editor';
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
