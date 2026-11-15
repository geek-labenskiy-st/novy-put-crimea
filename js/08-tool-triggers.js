/* ============================================================
   08-tool-triggers.js — тренажёр «Карта триггеров» (КПТ-опросник)
   Зависит от: NP.createTool (06), NP.escapeHtml (01), NP.closeModal (03).
   ============================================================ */
(function () {
    'use strict';

    const triggersGame = document.querySelector('[data-game="tool-triggers"]');
    if (!triggersGame) return;

    const TRIGGER_OPTIONS = [
        { key: 'stress', icon: '😣', label: 'Стресс, усталость, выгорание' },
        { key: 'emotions', icon: '😢', label: 'Сильные эмоции: злость, грусть, тревога' },
        { key: 'social', icon: '👥', label: 'Компания, где употребляют / играют' },
        { key: 'boredom', icon: '😐', label: 'Скука, пустота, «нечего делать»' },
        { key: 'conflict', icon: '⚡', label: 'Конфликты, ссоры, давление' },
        { key: 'celebration', icon: '🎉', label: 'Праздники, поводы «расслабиться»' },
        { key: 'lonely', icon: '🌙', label: 'Одиночество, изоляция' },
        { key: 'habit', icon: '🔁', label: 'Привычные места и время (ритуалы)' }
    ];

    const esc = (s) => (window.NP && NP.escapeHtml) ? NP.escapeHtml(s) : String(s);

    const steps = [
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🧭</span>
                    <h3 class="game__step-title">Что чаще всего запускает тягу?</h3>
                    <p class="game__step-text">Отметьте все ситуации, которые узнаёте. Это поможет увидеть паттерн.</p>
                    <div class="tool-choices" id="trigList">
                        ${TRIGGER_OPTIONS.map(o => `
                            <button type="button" class="tool-choice" data-key="${o.key}">
                                <span class="tool-choice__icon">${o.icon}</span>
                                <span class="tool-choice__label">${esc(o.label)}</span>
                            </button>`).join('')}
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="next" disabled>Дальше →</button>
                    </div>`;
                const list = el.querySelector('#trigList');
                const nextBtn = el.querySelector('[data-act="next"]');

                list.addEventListener('click', (e) => {
                    const c = e.target.closest('.tool-choice');
                    if (!c) return;
                    c.classList.toggle('is-selected');
                    const selected = list.querySelectorAll('.tool-choice.is-selected');
                    nextBtn.disabled = selected.length === 0;
                });

                nextBtn.addEventListener('click', () => {
                    api.state.data.triggers = [...list.querySelectorAll('.tool-choice.is-selected')]
                        .map(c => c.dataset.key);
                    api.next();
                });
            }
        },
        {
            render(el, api) {
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">📝</span>
                    <h3 class="game__step-title">Один недавний случай</h3>
                    <p class="game__step-text">Вспомните последний раз, когда тяга была сильной. Что произошло <strong>за час до этого</strong>?</p>
                    <textarea class="form__input form__textarea" id="trigStory" rows="4" placeholder="Коротко: где вы были, с кем, что чувствовали…"></textarea>
                    <div class="game__nav">
                        <button type="button" class="btn btn--secondary btn--sm" data-act="back">Назад</button>
                        <button type="button" class="btn btn--primary" data-act="next">Дальше →</button>
                    </div>`;
                el.querySelector('[data-act="back"]').addEventListener('click', api.back);
                el.querySelector('[data-act="next"]').addEventListener('click', () => {
                    api.state.data.story = el.querySelector('#trigStory').value.trim();
                    api.next();
                });
            }
        },
        {
            render(el, api) {
                const selected = api.state.data.triggers || [];
                const labels = TRIGGER_OPTIONS.filter(o => selected.includes(o.key));
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🗺️</span>
                    <h3 class="game__step-title">Ваша карта триггеров</h3>
                    <p class="game__step-text">Вот что вы отметили. Это не приговор — это карта, по которой можно проложить обходные пути.</p>
                    <div class="tool-result">
                        <strong>Ваши триггеры:</strong>
                        <ul>${labels.map(o => `<li>${o.icon} ${esc(o.label)}</li>`).join('')}</ul>
                        ${api.state.data.story ? `<p class="tool-result__story"><strong>Ваш случай:</strong> ${esc(api.state.data.story)}</p>` : ''}
                    </div>
                    <p class="game__step-text">Для каждого триггера можно заранее придумать <strong>план Б</strong> — что вы сделаете вместо привычного действия.</p>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="plan">Составить план</button>
                        <button type="button" class="btn btn--secondary" data-act="close">Закрыть</button>
                    </div>`;
                el.querySelector('[data-act="close"]').addEventListener('click', () => {
                    const dlg = triggersGame.closest('dialog');
                    if (dlg) NP.closeModal(dlg);
                });
                el.querySelector('[data-act="plan"]').addEventListener('click', api.next);
            }
        },
        {
            render(el, api) {
                const selected = api.state.data.triggers || [];
                const labels = TRIGGER_OPTIONS.filter(o => selected.includes(o.key));
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">🛡️</span>
                    <h3 class="game__step-title">План Б для каждого триггера</h3>
                    <p class="game__step-text">Коротко запишите, что вы сделаете вместо привычного действия. Это ваша защита.</p>
                    <div class="tool-choices" id="planList">
                        ${labels.map(o => `
                            <div style="margin-bottom:12px;text-align:left;">
                                <label class="form__label" for="plan-${o.key}">${o.icon} ${esc(o.label)}</label>
                                <input type="text" class="form__input" id="plan-${o.key}" data-key="${o.key}" placeholder="Например: позвоню другу, выйду на прогулку…">
                            </div>`).join('')}
                    </div>
                    <div class="game__nav">
                        <button type="button" class="btn btn--secondary btn--sm" data-act="back">Назад</button>
                        <button type="button" class="btn btn--primary" data-act="next">Готово →</button>
                    </div>`;
                el.querySelector('[data-act="back"]').addEventListener('click', api.back);
                el.querySelector('[data-act="next"]').addEventListener('click', () => {
                    const plans = {};
                    el.querySelectorAll('#planList input').forEach(inp => {
                        if (inp.value.trim()) plans[inp.dataset.key] = inp.value.trim();
                    });
                    api.state.data.plans = plans;
                    api.next();
                });
            }
        },
        {
            render(el, api) {
                const d = api.state.data;
                const labels = TRIGGER_OPTIONS.filter(o => (d.triggers || []).includes(o.key));
                el.innerHTML = `
                    <span class="game__icon" aria-hidden="true">💚</span>
                    <h3 class="game__step-title">Ваша карта готова</h3>
                    <p class="game__step-text">Сохраните её — например, сделайте скриншот или запишите в заметки.</p>
                    <div class="tool-result">
                        <strong>Триггеры и план Б:</strong>
                        <ul>
                            ${labels.map(o => `<li><strong>${o.icon} ${esc(o.label)}</strong>${d.plans && d.plans[o.key] ? ' → ' + esc(d.plans[o.key]) : ''}</li>`).join('')}
                        </ul>
                    </div>
                    <p class="game__step-text">Если чувствуете, что не справляетесь — позвоните. Мы поможем разобрать вашу карту вместе.</p>
                    <div class="game__nav">
                        <button type="button" class="btn btn--primary" data-act="call">📞 Позвонить</button>
                        <button type="button" class="btn btn--secondary" data-act="close">Закрыть</button>
                    </div>`;
                el.querySelector('[data-act="call"]').addEventListener('click', () => {
                    window.location.href = 'tel:+79789581188';
                });
                el.querySelector('[data-act="close"]').addEventListener('click', () => {
                    const dlg = triggersGame.closest('dialog');
                    if (dlg) NP.closeModal(dlg);
                });
            }
        }
    ];

    NP.createTool(triggersGame, steps);
})();
