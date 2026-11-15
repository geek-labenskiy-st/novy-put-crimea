/* ============================================================
   02-season.js — сезонные темы
   data-season на <html>, кнопки [data-season-set], meta theme-color
   Зависит от: ничего.
   ============================================================ */
(function () {
    'use strict';

    const seasonBtns = document.querySelectorAll('[data-season-set]');

    /**
     * Применить сезонную тему.
     * @param {'winter'|'spring'|'summer'|'autumn'} s
     */
    function applySeason(s) {
        document.documentElement.dataset.season = s;
        try { localStorage.setItem('np-season', s); } catch (e) { /* приватный режим */ }

        seasonBtns.forEach(b =>
            b.classList.toggle('is-active', b.dataset.seasonSet === s)
        );

        // читаем ПОСЛЕ установки data-season — иначе на первом рендере пусто
        requestAnimationFrame(() => {
            const themeColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--season-primary')
                .trim();
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta && themeColor) meta.setAttribute('content', themeColor);
        });
    }

    seasonBtns.forEach(b =>
        b.addEventListener('click', () => applySeason(b.dataset.seasonSet))
    );

    applySeason(document.documentElement.dataset.season || 'summer');

    window.NP = window.NP || {};
    NP.applySeason = applySeason;
})();
