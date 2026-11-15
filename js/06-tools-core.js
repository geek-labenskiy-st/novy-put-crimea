/* ============================================================
   06-tools-core.js — движок психологических тренажёров
   Экспортирует: NP.createTool(gameEl, steps, onFinish), NP.resetTool(gameEl)
   Зависит от: ничего. Используется в 07/08/09-файлах.
   ============================================================ */
(function () {
    'use strict';

    window.NP = window.NP || {};

    const registry = new WeakMap(); // gameEl -> { render, steps, onFinish }

    /**
     * Создать пошаговый тренажёр.
     * @param {HTMLElement} gameEl — .game[data-game="tool-*"]
     * @param {Array<{render: Function}>} steps
     * @param {Function} [onFinish]
     * @returns {{ render: Function, go: Function }}
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

        const api = {
            render,
            go,
            // сброс к первому шагу + чистые data + глобальные таймеры
            reset() {
                if (window.NP && NP.breathTimer) { clearTimeout(NP.breathTimer); NP.breathTimer = null; }
                if (window.NP && NP.urgeTimer) { clearInterval(NP.urgeTimer); NP.urgeTimer = null; }
                state.step = 0;
                state.data = {};
                render();
            }
        };

        registry.set(gameEl, api);
        render();
        return api;
    }

    /**
     * Сбросить тренажёр по его контейнеру.
     * @param {HTMLElement} gameEl
     */
    function resetTool(gameEl) {
        const api = registry.get(gameEl);
        if (api) api.reset();
    }

    NP.createTool = createTool;
    NP.resetTool = resetTool;
})();
