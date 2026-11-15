/* ============================================================
   04-legal.js — юридические документы в модалке
   Кнопки [data-legal-open], шаблоны #legal-<key>, контейнер #legal-content
   Зависит от: NP.openModal (03-modal.js).
   ============================================================ */
(function () {
    'use strict';

    const TITLES = {
        privacy: 'Политика конфиденциальности',
        terms: 'Пользовательское соглашение',
        consent: 'Согласие на обработку ПД',
        disclaimer: 'Отказ от ответственности',
        rules: 'Правила оказания помощи',
        admin: 'Администраторам'
    };

    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-legal-open]');
        if (!t) return;

        const key = t.dataset.legalOpen;
        const tpl = document.getElementById('legal-' + key);
        const content = document.getElementById('legal-content');
        const title = document.getElementById('legal-modal-title');

        if (!tpl || !content) return;

        content.innerHTML = '';
        content.appendChild(tpl.content.cloneNode(true));

        if (title) title.textContent = TITLES[key] || 'Документ';

        if (window.NP && NP.openModal) NP.openModal('legal');
    });
})();
