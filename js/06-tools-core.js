/* ============================================================
   06-tools-core.js — движок психологических тренажёров
   Экспортирует: NP.createTool(gameEl, steps, onFinish)
   Зависит от: ничего. Используется в 07/08/09-файлах.
   ============================================================ */
(function () {
    'use strict';

    window.NP = window.NP || {};

    /**
     * Создать пошаговый тренажёр.
     * @param {HTMLElement} gameEl — .game[data-game="tool-*"]
     * @param {Array<{render: Function}>} steps — шаги. render(el, api)
     * @param {Function} [onFinish] — вызывается при api.finish()
     * @returns {{ render: Function, go: Function }}
     *
     * api, передаваемый в каждый step.render:
     *   api.state  — { step, data }
     *   api.go(n)  — перейти к шагу n
     *   api.next() — следующий
     *   api.back() — предыдущий
     *   api.finish() — завершить
     */
    function createTool(gameEl, steps, onFinish) {
        const stage = gameEl.querySelector('.game__stage');
        const progress = gameEl.querySelector('.game__progress');
        const state = { step: 0, data: {} };

        if (progress) {
            progress.innerHTML = steps.map((_, i) =>
                `<div class="game__progress-seg${i === 0 ? ' is-active' : ''}"></div>`
            ).join('');
        }
        const segs = progress ? progress.querySelectorAll('.game__progress-seg') : [];

        function updateProgress() {
            segs.forEach((s, i) => {
                s.classList.toggle('is-done', i < state.step);
                s.classList.toggle('is-active', i === state.step);
            });
        }

        function go(next) {
            state.step = Math.max(0, Math.min(steps.length - 1, next));
            render();
        }

        function render() {
            const s = steps[state.step];
            stage.innerHTML = '';

            const wrap = document.createElement('div');
            wrap.className = 'game__step';

            s.render(wrap, {
                state,
                go,
                next: () => go(state.step + 1),
                back: () => go(state.step - 1),
                finish: () => onFinish && onFinish(state, stage)
            });

            stage.appendChild(wrap);
            updateProgress();
        }

        render();
        return { render, go };
    }

    NP.createTool = createTool;
})();
