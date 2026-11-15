/* ============================================================
   11-scroll.js — плавная прокрутка по якорям + кнопка «Наверх»
   Зависит от: ничего.
   ============================================================ */
(function () {
    'use strict';

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            let target = null;
            try { target = document.querySelector(href); } catch (_) { return; }

            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-scroll-top]')) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
})();
