/* ============================================================
   01-utils.js — общие утилиты
   Экспортирует в window: NP.plural, NP.escapeHtml
   ============================================================ */
(function () {
    'use strict';

    window.NP = window.NP || {};

    /**
     * Склонение русских существительных по числу.
     * @param {number} n — число
     * @param {string} one — «балл»
     * @param {string} few — «балла»
     * @param {string} many — «баллов»
     * @returns {string}
     */
    function plural(n, one, few, many) {
        const abs = Math.abs(n) % 100;
        const n1 = abs % 10;
        if (abs > 10 && abs < 20) return many;
        if (n1 > 1 && n1 < 5) return few;
        if (n1 === 1) return one;
        return many;
    }

    /**
     * Экранирование HTML-спецсимволов (защита от XSS при вставке в innerHTML).
     * @param {*} str
     * @returns {string}
     */
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    NP.plural = plural;
    NP.escapeHtml = escapeHtml;
})();
