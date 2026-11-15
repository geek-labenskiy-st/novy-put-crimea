/* ============================================================
   05-games.js — модалки «3 клика» (services / trust / help)
   Зависит от: NP.closeModal, NP.openModal (03-modal.js).
   ============================================================ */
(function () {
    'use strict';

    const GAMES = {
        services: [
            { icon: '🌿', title: 'Реабилитация', text: 'Индивидуальная программа восстановления в комфортных условиях Крыма — шаг за шагом, с поддержкой на каждом этапе.' },
            { icon: '💚', title: 'Поддержка', text: 'Психолог и группы поддержки. Без осуждения и давления — только внимание к вам и вашей ситуации.' },
            { icon: '🌱', title: 'Адаптация', text: 'Возвращение к семье, работе и полноценной жизни. Помогаем выстроить новые опоры и связи.' }
        ],
        trust: [
            { icon: '👥', title: '~10 000 человек', text: 'Единовременно проходят реабилитацию по Содружеству центров. Мы не одни — и вы не одни.' },
            { icon: '🤝', title: '~500 волонтёров', text: 'Каждый день рядом с теми, кому нужна помощь. Живые люди, готовые выслушать.' },
            { icon: '🕊️', title: '24/7 на связи', text: 'Днём и ночью. Один звонок — и вы уже не в одиночестве.' }
        ],
        help: [
            { icon: '📞', title: 'Шаг 1: Позвоните', text: 'Или оставьте номер — в форме ниже. Это анонимно и бесплатно. Один клик.' },
            { icon: '🔔', title: 'Шаг 2: Мы перезвоним', text: 'В течение нескольких часов с вами свяжется специалист. Спокойно, без давления.' },
            { icon: '🤲', title: 'Шаг 3: Подберём программу', text: 'Вместе определим, что подходит именно вам. Начнём с первого шага — вместе.' }
        ]
    };

    // FIX: реестр для сброса «3 клика» при повторном открытии модалки
    const registry = new WeakMap(); // gameEl -> reset()

    function renderGame(gameEl) {
        const key = gameEl.dataset.game;
        const steps = GAMES[key];
        if (!steps) return;

        const stage = gameEl.querySelector('.game__stage');
        const segs = gameEl.querySelectorAll('.game__progress-seg');
        let current = 0;

        function updateProgress() {
            segs.forEach((s, i) => {
                s.classList.toggle('is-done', i < current);
                s.classList.toggle('is-active', i === current);
            });
        }

        function render() {
            const s = steps[current];
            const isLast = current === steps.length - 1;

            stage.innerHTML = `
            <div class="game__step">
                <span class="game__icon" aria-hidden="true">${s.icon}</span>
                <h3 class="game__step-title">${s.title}</h3>
                <p class="game__step-text">${s.text}</p>
                <div class="game__nav">
                    ${current > 0 ? '<button type="button" class="btn btn--secondary btn--sm" data-game-back>Назад</button>' : ''}
                    ${!isLast
                    ? '<button type="button" class="btn btn--primary" data-game-next>Дальше →</button>'
                    : '<button type="button" class="btn btn--secondary" data-game-close>Закрыть</button>'}
                </div>
            </div>`;
            updateProgress();
        }

        stage.addEventListener('click', (e) => {
            if (e.target.closest('[data-game-next]')) {
                if (current < steps.length - 1) { current++; render(); }
            } else if (e.target.closest('[data-game-back]')) {
                if (current > 0) { current--; render(); }
            } else if (e.target.closest('[data-game-close]')) {
                const dlg = gameEl.closest('dialog');
                if (dlg) NP.closeModal(dlg);
            }
        });

        function reset() {
            current = 0;
            render();
        }

        registry.set(gameEl, reset);
        render();
    }

    /**
     * FIX: сброс карусели «3 клика» по её контейнеру.
     * @param {HTMLElement} gameEl
     */
    function resetGame(gameEl) {
        const fn = registry.get(gameEl);
        if (fn) fn();
    }

    document.querySelectorAll('[data-game]:not([data-game^="tool-"])').forEach(renderGame);

    window.NP = window.NP || {};
    NP.resetGame = resetGame;
})();
