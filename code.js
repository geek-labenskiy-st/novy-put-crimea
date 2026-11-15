(function () {
    'use strict';

    /* ---------- SEASON ---------- */
    const seasonBtns = document.querySelectorAll('[data-season-set]');
    function applySeason(s) {
        document.documentElement.dataset.season = s;
        try { localStorage.setItem('np-season', s); } catch (e) { }
        seasonBtns.forEach(b => b.classList.toggle('is-active', b.dataset.seasonSet === s));
        const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--season-primary').trim();
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta && themeColor) meta.setAttribute('content', themeColor);
    }
    seasonBtns.forEach(b => b.addEventListener('click', () => applySeason(b.dataset.seasonSet)));
    applySeason(document.documentElement.dataset.season || 'summer');

    /* ---------- MODAL CONTROLLER ---------- */
    let lastTrigger = null;

    function openModal(id) {
        const dlg = document.getElementById('modal-' + id);
        if (!dlg) return;
        lastTrigger = document.activeElement;
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
        const first = dlg.querySelector('button, input, [tabindex]');
        if (first) setTimeout(() => first.focus(), 50);
    }

    function closeModal(dlg) {
        if (!dlg) return;
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    }

    document.querySelectorAll('dialog.modal').forEach(dlg => {
        const closeBtn = dlg.querySelector('.modal__close');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(dlg));
        dlg.addEventListener('click', (e) => {
            if (e.target === dlg) closeModal(dlg);
        });
        dlg.addEventListener('close', () => {
            if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
        });
    });

    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-modal-open]');
        if (!t) return;
        e.preventDefault();
        openModal(t.dataset.modalOpen);
    });
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-modal-open][role="button"]')) {
            e.preventDefault();
            openModal(e.target.dataset.modalOpen);
        }
    });

    /* ---------- LEGAL ---------- */
    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-legal-open]');
        if (!t) return;
        const key = t.dataset.legalOpen;
        const tpl = document.getElementById('legal-' + key);
        const content = document.getElementById('legal-content');
        const title = document.getElementById('legal-modal-title');
        const titles = {
            privacy: 'Политика конфиденциальности',
            terms: 'Пользовательское соглашение',
            consent: 'Согласие на обработку ПД',
            disclaimer: 'Отказ от ответственности',
            rules: 'Правила оказания помощи',
            admin: 'Администраторам'
        };
        if (!tpl || !content) return;
        content.innerHTML = '';
        content.appendChild(tpl.content.cloneNode(true));
        if (title) title.textContent = titles[key] || 'Документ';
        openModal('legal');
    });

    /* ---------- GAMES «3 клика» ---------- */
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
            { icon: '🔔', title: 'Шаг 2: Мы перезвоним', text: 'В течение пары часов с вами свяжется специалист. Спокойно, без давления.' },
            { icon: '🤲', title: 'Шаг 3: Подберём программу', text: 'Вместе определим, что подходит именно вам. Начнём с первого шага — вместе.' }
        ]
    };

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
                    : '<button type="button" class="btn btn--primary" data-game-cta="call">Позвонить</button><button type="button" class="btn btn--secondary" data-game-cta="callback">Оставить номер</button>'
                }
                </div>
            </div>`;
            updateProgress();
        }

        stage.addEventListener('click', (e) => {
            if (e.target.closest('[data-game-next]')) {
                if (current < steps.length - 1) { current++; render(); }
            } else if (e.target.closest('[data-game-back]')) {
                if (current > 0) { current--; render(); }
            } else if (e.target.closest('[data-game-cta="call"]')) {
                window.location.href = 'tel:+79789581188';
            } else if (e.target.closest('[data-game-cta="callback"]')) {
                const dlg = gameEl.closest('dialog');
                if (dlg) closeModal(dlg);
                setTimeout(() => openModal('callback'), 150);
            }
        });

        render();
    }
    document.querySelectorAll('[data-game]:not([data-game^="tool-"])').forEach(renderGame);

    /* ==========================================================
       ПСИХОЛОГИЧЕСКИЕ ТРЕНАЖЁРЫ (3 методики)
       ========================================================== */

    /* -------- Утилита: управление шагами тренажёра -------- */
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

    /* ==========================================================
       ТРЕНАЖЁР 1: СЁРФИНГ ЖЕЛАНИЯ (Urge Surfing)
       ========================================================== */
    const urgeGame = document.querySelector('[data-game="tool-urge"]');
    if (urgeGame) {
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
                    const circle = el.querySelector('#urgeCircle');
                    const status = el.querySelector('#urgeStatus');
                    const count = el.querySelector('#urgeCount');
                    const startBtn = el.querySelector('#urgeStart');
                    const nextBtn = el.querySelector('#urgeNext');
                    let timer = null;
                    let started = false;

                    function startTimer() {
                        if (started) return;
                        started = true;
                        startBtn.disabled = true;
                        startBtn.textContent = 'Идёт наблюдение…';
                        let left = 15;
                        status.textContent = 'Наблюдайте…';
                        count.textContent = left + ' с';
                        timer = setInterval(() => {
                            left--;
                            count.textContent = left + ' с';
                            if (left <= 0) {
                                clearInterval(timer);
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
                        if (timer) clearInterval(timer);
                        api.back();
                    });
                    nextBtn.addEventListener('click', () => {
                        if (timer) clearInterval(timer);
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
                        if (diff > 0) msg = `Тяга снизилась на <strong>${diff}</strong> ${plural(diff, 'балл', 'балла', 'баллов')}. Это работает — вы справились.`;
                        else if (diff === 0) msg = `Тяга осталась на том же уровне. Это нормально — главное, что вы <strong>не действовали</strong> по ней.`;
                        else msg = `Тяга усилилась. Попробуйте ещё раз или позвоните нам — вы не одни.`;
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
                        if (dlg) closeModal(dlg);
                    });
                }
            }
        ];
        createTool(urgeGame, steps);
    }

    /* ==========================================================
       ТРЕНАЖЁР 2: КАРТА ТРИГГЕРОВ (КПТ-опросник)
       ========================================================== */
    const triggersGame = document.querySelector('[data-game="tool-triggers"]');
    if (triggersGame) {
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
                                    <span class="tool-choice__label">${o.label}</span>
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
                            <ul>${labels.map(o => `<li>${o.icon} ${o.label}</li>`).join('')}</ul>
                            ${api.state.data.story ? `<p style="margin-top:12px;"><strong>Ваш случай:</strong> ${escapeHtml(api.state.data.story)}</p>` : ''}
                        </div>
                        <p class="game__step-text">Для каждого триггера можно заранее придумать <strong>план Б</strong> — что вы сделаете вместо привычного действия.</p>
                        <div class="game__nav">
                            <button type="button" class="btn btn--primary" data-act="plan">Составить план</button>
                            <button type="button" class="btn btn--secondary" data-act="close">Закрыть</button>
                        </div>`;
                    el.querySelector('[data-act="close"]').addEventListener('click', () => {
                        const dlg = triggersGame.closest('dialog');
                        if (dlg) closeModal(dlg);
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
                                    <label class="form__label" for="plan-${o.key}">${o.icon} ${o.label}</label>
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
                                ${labels.map(o => `<li><strong>${o.icon} ${o.label}</strong>${d.plans && d.plans[o.key] ? ' → ' + escapeHtml(d.plans[o.key]) : ''}</li>`).join('')}
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
                        if (dlg) closeModal(dlg);
                    });
                }
            }
        ];
        createTool(triggersGame, steps);
    }

    /* ==========================================================
       ТРЕНАЖЁР 3: ДЫХАНИЕ SOBER (1 минута)
       ========================================================== */
    const soberGame = document.querySelector('[data-game="tool-sober"]');
    if (soberGame) {
        let breathTimer = null;

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
                        if (dlg) closeModal(dlg);
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

                    function runPhase() {
                        const p = phases[phase];
                        circle.className = 'breath-circle ' + p.cls;
                        circle.textContent = p.text;
                        status.textContent = p.name;
                        count.textContent = `Цикл ${Math.min(cycle + 1, 3)} из 3`;
                        breathTimer = setTimeout(() => {
                            phase++;
                            if (phase >= phases.length) {
                                phase = 0;
                                cycle++;
                                if (cycle >= 3) {
                                    status.textContent = 'Готово ✓';
                                    circle.className = 'breath-circle';
                                    circle.textContent = '✓';
                                    count.textContent = '';
                                    api.state.data.done = true;
                                    setTimeout(() => api.next(), 600);
                                    return;
                                }
                            }
                            runPhase();
                        }, p.dur);
                    }
                    setTimeout(runPhase, 400);
                    el.querySelector('[data-act="stop"]').addEventListener('click', () => {
                        clearTimeout(breathTimer);
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
                        if (dlg) closeModal(dlg);
                    });
                }
            }
        ];
        createTool(soberGame, steps);
    }

    /* -------- Вспомогательные -------- */
    function plural(n, one, few, many) {
        const abs = Math.abs(n) % 100;
        const n1 = abs % 10;
        if (abs > 10 && abs < 20) return many;
        if (n1 > 1 && n1 < 5) return few;
        if (n1 === 1) return one;
        return many;
    }
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    /* ---------- CALLBACK FORM ---------- */
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('8')) value = '7' + value.slice(1);
            if (!value.startsWith('7')) value = '7' + value;
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.slice(1, 4);
            if (value.length >= 5) formatted += ') ' + value.slice(4, 7);
            if (value.length >= 8) formatted += '-' + value.slice(7, 9);
            if (value.length >= 10) formatted += '-' + value.slice(9, 11);
            e.target.value = formatted;
        });
    }

    let captchaAnswer = 0;
    function generateCaptcha() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = a + b;
        const q = document.getElementById('captchaQuestion');
        if (q) q.textContent = `Проверка: сколько будет ${a} + ${b}?`;
    }
    generateCaptcha();

    const form = document.getElementById('callbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('callbackSuccess');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
            document.querySelectorAll('.form__input').forEach(el => el.classList.remove('error'));

            if (document.getElementById('website').value) return;

            let isValid = true;
            const phone = document.getElementById('phone').value.replace(/\D/g, '');
            if (phone.length !== 11) {
                document.getElementById('phoneError').textContent = 'Введите корректный номер телефона';
                document.getElementById('phone').classList.add('error');
                isValid = false;
            }
            const role = document.querySelector('input[name="role"]:checked');
            if (!role) {
                document.getElementById('roleError').textContent = 'Пожалуйста, выберите кто вы';
                isValid = false;
            }
            const consent = document.getElementById('consent');
            if (consent && !consent.checked) {
                document.getElementById('consentError').textContent = 'Необходимо согласие на обработку данных';
                isValid = false;
            }
            const captchaValue = parseInt(document.getElementById('captcha').value);
            if (captchaValue !== captchaAnswer) {
                document.getElementById('captchaError').textContent = 'Неверный ответ. Попробуйте ещё раз.';
                document.getElementById('captcha').classList.add('error');
                generateCaptcha();
                isValid = false;
            }
            if (!isValid) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            try {
                const formData = new FormData(form);
                const roleValue = formData.get('role');
                const roleText = { dependent: 'Зависимый', relative: 'Родственник', friend: 'Друг' };
                formData.set('role', roleText[roleValue] || roleValue);
                formData.set('phone', document.getElementById('phone').value);

                const response = await fetch('https://formsubmit.co/ajax/repair-service-sev@mail.ru', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
                if (response.ok) {
                    form.hidden = true;
                    successMessage.hidden = false;
                } else {
                    throw new Error('network');
                }
            } catch (err) {
                const name = document.getElementById('name').value || 'Не указано';
                const phoneFormatted = document.getElementById('phone').value;
                const roleChecked = document.querySelector('input[name="role"]:checked');
                const roleTextFallback = roleChecked ? roleChecked.nextElementSibling.textContent : 'Не указано';
                const comment = document.getElementById('comment').value || 'Не указано';
                const subject = encodeURIComponent('Новая заявка с сайта Новый Путь');
                const body = encodeURIComponent(`Имя: ${name}\nТелефон: ${phoneFormatted}\nКто: ${roleTextFallback}\nКомментарий: ${comment}`);
                window.location.href = `mailto:repair-service-sev@mail.ru?subject=${subject}&body=${body}`;
                submitBtn.disabled = false;
                submitBtn.textContent = 'Перезвоните мне';
            }
        });
    }

    /* ---------- SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ---------- REVEAL ---------- */
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }
})();
