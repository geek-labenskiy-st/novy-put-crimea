/* ============================================================
   09-tool-sober.js — тренажёр «Дыхание SOBER»
   Экспортирует: NP.breathTimer (чтобы 03-modal.js мог сбросить при close)
   Зависит от: NP.createTool (06), NP.closeModal (03).
   ============================================================ */
(function () {
    'use strict';

    window.NP = window.NP || {};
    NP.breathTimer = NP.breathTimer || null;

    const soberGame = document.querySelector('[data-game="tool-sober"]');
    if (!soberGame) return;

    const steps = [
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🫁</span>
                    <h3 class="game__step-title">Дыхание SOBER</h3>
                    <p class="game__step-text">Короткая практика, чтобы снизить тревогу и вернуть контроль. 3 цикла: вдох 4 с — задержка 2 с — выдох 6 с.</p>
                    <div class="tool-result">
                        <strong>S — Stop.</strong> Остановитесь.<br>
                        <strong>O — Observe.</strong> Наблюдайте.<br>
                        <strong>B — Breathe.</strong> Дышите.<br>
                        <strong>E — Expand.</strong> Расширяйте внимание.<br>
                        <strong>R — Respond.</strong> Реагируйте осознанно.
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="start">Начать дыхание</button>
                        <button type="button" class="btn btn--secondary" data-act="close">Закрыть</button>
                    </div>`;
                el.querySelector('[data-act="start"]').addEventListener('click', api.next);
                el.querySelector('[data-act="close"]').addEventListener('click', () => {
                    const dlg = soberGame.closest('dialog');
                    if (dlg) NP.closeModal(dlg);
                });
            }
        },
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🌬️</span>
                    <h3 class="game__step-title">Следуйте за кругом</h3>
                    <p class="game__step-text">Вдох — круг растёт. Задержка — пауза. Выдох — круг сжимается.</p>
                    <div class="breath-circle-wrap">
                        <div class="breath-circle" id="breathCircle">Вдох</div>
                        <div class="breath-status" id="breathStatus">Приготовьтесь…</div>
                        <div class="breath-count" id="breathCount">Цикл 1 из 3</div>
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--secondary btn--sm" data-act="stop">Остановить</button>
                    </div>`;

                const circle = el.querySelector('#breathCircle');
                const status = el.querySelector('#breathStatus');
                const count = el.querySelector('#breathCount');

                let cycle = 0;
                let phase = 0;
                const phases = [
                    { name: 'Вдох', text: 'Вдох', cls: 'is-inhale', dur: 4000 },
                    { name: 'Задержка', text: 'Задержка', cls: 'is-hold', dur: 2000 },
                    { name: 'Выдох', text: 'Выдох', cls: 'is-exhale', dur: 6000 }
                ];
                // FIX: конец текущей фазы по реальному времени
                let phaseEnd = 0;

                function runPhase() {
                    const p = phases[phase];
                    circle.className = 'breath-circle ' + p.cls;
                    circle.textContent = p.text;
                    status.textContent = p.name;
                    count.textContent = `Цикл ${Math.min(cycle + 1, 3)} из 3`;
                    phaseEnd = Date.now() + p.dur;

                    NP.breathTimer = setTimeout(() => {
                        // FIX: если вкладка была в фоне — догоняем пропущенные фазы
                        const now = Date.now();
                        if (now < phaseEnd) {
                            // ещё не пора — перезапускаем на остаток
                            NP.breathTimer = setTimeout(arguments.callee, phaseEnd - now);
                            return;
                        }

                        phase++;
                        if (phase >= phases.length) {
                            phase = 0;
                            cycle++;
                            if (cycle >= 3) {
                                status.textContent = 'Готово ✓';
                                circle.className = 'breath-circle';
                                circle.textContent = '✓';
                                count.textContent = '';
                                NP.breathTimer = setTimeout(() => api.next(), 600);
                                return;
                            }
                        }
                        runPhase();
                    }, p.dur);
                }

                NP.breathTimer = setTimeout(runPhase, 400);

                el.querySelector('[data-act="stop"]').addEventListener('click', () => {
                    if (NP.breathTimer) { clearTimeout(NP.breathTimer); NP.breathTimer = null; }
                    api.back();
                });
            }
        },
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">💚</span>
                    <h3 class="game__step-title">Как вы себя чувствуете?</h3>
                    <p class="game__step-text">Оцените своё состояние после практики.</p>
                    <div class="tool-slider-labels"><span>Спокойно</span><span>Тревожно</span></div>
                    <input type="range" min="0" max="10" value="5" class="tool-slider" id="soberLevel" aria-label="Уровень тревоги от 0 до 10">
                    <div class="tool-result" id="soberResult">
                        <strong>Спасибо, что сделали это для себя.</strong> Дыхание — простой инструмент, который всегда с вами.
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="call">📞 Позвонить</button>
                        <button type="button" class="btn btn--secondary" data-act="close">Закрыть</button>
                    </div>`;
                const level = el.querySelector('#soberLevel');
                const result = el.querySelector('#soberResult');

                level.addEventListener('input', () => {
                    const v = +level.value;
                    let msg;
                    if (v <= 3) msg = 'Вы чувствуете себя спокойно. Отлично — закрепите это состояние.';
                    else if (v <= 6) msg = 'Умеренная тревога. Попробуйте ещё один цикл или выпейте воды.';
                    else msg = 'Высокая тревога. Не оставайтесь одни — позвоните нам, мы рядом.';
                    result.innerHTML = `<strong>${msg}</strong>`;
                });
                level.dispatchEvent(new Event('input'));

                el.querySelector('[data-act="call"]').addEventListener('click', () => {
                    window.location.href = 'tel:+79789581188';
                });
                el.querySelector('[data-act="close"]').addEventListener('click', () => {
                    const dlg = soberGame.closest('dialog');
                    if (dlg) NP.closeModal(dlg);
                });
            }
        }
    ];

    NP.createTool(soberGame, steps);
})();
