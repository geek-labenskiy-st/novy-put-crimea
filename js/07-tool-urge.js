/* ============================================================
   07-tool-urge.js — тренажёр «Сёрфинг желания» (Urge Surfing)
   Зависит от: NP.createTool (06), NP.plural (01), NP.closeModal (03).
   ============================================================ */
(function () {
    'use strict';

    window.NP = window.NP || {};
    NP.urgeTimer = null;

    const urgeGame = document.querySelector('[data-game="tool-urge"]');
    if (!urgeGame) return;

    const steps = [
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🌊</span>
                    <h3 class="game__step-title">Что вы сейчас чувствуете?</h3>
                    <p class="game__step-text">Отметьте, насколько сильна тяга прямо сейчас. Честно — это только для вас.</p>
                    <div class="tool-slider-labels"><span>Слабая</span><span>Сильная</span></div>
                    <input type="range" min="0" max="10" value="5" class="tool-slider" id="urgeLevel" aria-label="Уровень тяги от 0 до 10">
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="next">Дальше →</button>
                    </div>`;
                el.querySelector('[data-act="next"]').addEventListener('click', () => {
                    api.state.data.level = +el.querySelector('#urgeLevel').value;
                    api.next();
                });
            }
        },
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🫧</span>
                    <h3 class="game__step-title">Наблюдайте волну</h3>
                    <p class="game__step-text">Тяга — как волна: она нарастает, достигает пика и спадает. Вам не нужно с ней бороться. Просто заметьте, где в теле она ощущается.</p>
                    <div class="tool-choices">
                        <button type="button" class="tool-choice" data-body="голова">
                            <span class="tool-choice__icon">🧠</span>
                            <span class="tool-choice__label">В голове — мысли, картинки</span>
                        </button>
                        <button type="button" class="tool-choice" data-body="грудь">
                            <span class="tool-choice__icon">💓</span>
                            <span class="tool-choice__label">В груди — напряжение, тяжесть</span>
                        </button>
                        <button type="button" class="tool-choice" data-body="живот">
                            <span class="tool-choice__icon">🌀</span>
                            <span class="tool-choice__label">В животе — «бабочки», пустота</span>
                        </button>
                        <button type="button" class="tool-choice" data-body="руки">
                            <span class="tool-choice__icon">🤲</span>
                            <span class="tool-choice__label">В руках — беспокойство, дрожь</span>
                        </button>
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--secondary btn--sm" data-act="back">Назад</button>
                        <button type="button" class="btn btn--primary" data-act="next" disabled>Дальше →</button>
                    </div>`;
                const choices = el.querySelectorAll('.tool-choice');
                const nextBtn = el.querySelector('[data-act="next"]');
                choices.forEach(c => c.addEventListener('click', () => {
                    choices.forEach(x => x.classList.remove('is-selected'));
                    c.classList.add('is-selected');
                    api.state.data.body = c.dataset.body;
                    nextBtn.disabled = false;
                }));
                el.querySelector('[data-act="back"]').addEventListener('click', api.back);
                nextBtn.addEventListener('click', api.next);
            }
        },
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">⏳</span>
                    <h3 class="game__step-title">15 секунд наблюдения</h3>
                    <p class="game__step-text">Закройте глаза, если удобно. Дышите ровно. Просто замечайте ощущение в области «${api.state.data.body || 'тела'}» — не пытаясь его изменить.</p>
                    <div class="breath-circle-wrap">
                        <div class="breath-circle" id="urgeCircle">Дышите…</div>
                        <div class="breath-status" id="urgeStatus">Нажмите «Запустить»</div>
                        <div class="breath-count" id="urgeCount"></div>
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--secondary btn--sm" data-act="back">Назад</button>
                        <button type="button" class="btn btn--primary" data-act="start" id="urgeStart">▶ Запустить счётчик</button>
                        <button type="button" class="btn btn--primary" data-act="next" id="urgeNext" disabled>Завершить →</button>
                    </div>`;
                const status = el.querySelector('#urgeStatus');
                const count = el.querySelector('#urgeCount');
                const startBtn = el.querySelector('#urgeStart');
                const nextBtn = el.querySelector('#urgeNext');
                let started = false;

                function startTimer() {
                    if (started) return;
                    started = true;
                    startBtn.disabled = true;
                    startBtn.textContent = 'Идёт наблюдение…';
                    let left = 15;
                    status.textContent = 'Наблюдайте…';
                    count.textContent = left + ' с';

                    // FIX: сохраняем таймер глобально, чтобы 03-modal.js мог очистить
                    NP.urgeTimer = setInterval(() => {
                        left--;
                        count.textContent = left + ' с';
                        if (left <= 0) {
                            clearInterval(NP.urgeTimer);
                            NP.urgeTimer = null;
                            status.textContent = 'Готово ✓';
                            count.textContent = '';
                            startBtn.textContent = '✓ Выполнено';
                            nextBtn.disabled = false;
                            nextBtn.focus();
                        }
                    }, 1000);
                }

                startBtn.addEventListener('click', startTimer);
                el.querySelector('[data-act="back"]').addEventListener('click', () => {
                    if (NP.urgeTimer) { clearInterval(NP.urgeTimer); NP.urgeTimer = null; }
                    api.back();
                });
                nextBtn.addEventListener('click', () => {
                    if (NP.urgeTimer) { clearInterval(NP.urgeTimer); NP.urgeTimer = null; }
                    api.next();
                });
            }
        },
        {
            render(el, api) {
                const before = api.state.data.level;
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🌅</span>
                    <h3 class="game__step-title">Волна прошла</h3>
                    <p class="game__step-text">Вы пережили пик, не действуя по тяге. Это и есть навык. Оцените, как сейчас:</p>
                    <div class="tool-slider-labels"><span>Слабая</span><span>Сильная</span></div>
                    <input type="range" min="0" max="10" value="${before}" class="tool-slider" id="urgeAfter" aria-label="Уровень тяги после упражнения">
                    <div class="tool-result" id="urgeResult">
                        <strong>Ваш результат появится здесь.</strong>
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="next">Дальше →</button>
                    </div>`;
                const after = el.querySelector('#urgeAfter');
                const result = el.querySelector('#urgeResult');

                after.addEventListener('input', () => {
                    const diff = before - after.value;
                    let msg;
                    if (diff > 0) {
                        msg = `Тяга снизилась на <strong>${diff}</strong> ${NP.plural(diff, 'балл', 'балла', 'баллов')}. Это работает — вы справились.`;
                    } else if (diff === 0) {
                        msg = `Тяга осталась на том же уровне. Это нормально — главное, что вы <strong>не действовали</strong> по ней.`;
                    } else {
                        msg = `Тяга усилилась. Попробуйте ещё раз или позвоните нам — вы не одни.`;
                    }
                    result.innerHTML = msg;
                });
                after.dispatchEvent(new Event('input'));

                el.querySelector('[data-act="next"]').addEventListener('click', () => {
                    api.state.data.after = +after.value;
                    api.next();
                });
            }
        },
        {
            render(el, api) {
                const d = api.state.data;
                const diff = (d.level || 0) - (d.after || 0);
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">💚</span>
                    <h3 class="game__step-title">Что делать дальше</h3>
                    <div class="tool-result">
                        <p>Вы только что пережили тягу, не поддавшись ей. ${diff > 0 ? `Уровень снизился на <strong>${diff}</strong>.` : ''} Это навык, который тренируется.</p>
                        <ul>
                            <li>Повторите упражнение, если тяга вернётся.</li>
                            <li>Запишите, что помогло именно вам.</li>
                            <li>Если тяжело — позвоните, мы рядом круглосуточно.</li>
                        </ul>
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="call">📞 Позвонить</button>
                        <button type="button" class="btn btn--secondary" data-act="close">Закрыть</button>
                    </div>`;
                el.querySelector('[data-act="call"]').addEventListener('click', () => {
                    window.location.href = 'tel:+79789581188';
                });
                el.querySelector('[data-act="close"]').addEventListener('click', () => {
                    const dlg = urgeGame.closest('dialog');
                    if (dlg) NP.closeModal(dlg);
                });
            }
        }
    ];

    NP.createTool(urgeGame, steps);
})();
