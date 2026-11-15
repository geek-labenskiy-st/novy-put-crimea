/* ============================================================
   03-modal.js — контроллер модальных окон <dialog>
   Экспортирует в window.NP: openModal, closeModal
   Зависит от: ничего (модалки должны существовать в DOM).
   ВАЖНО: подключать раньше games/tools, т.к. они используют openModal/closeModal.
   ============================================================ */
(function () {
    'use strict';

    window.NP = window.NP || {};

    /**
     * Открыть модалку по суффиксу id (modal-<id>).
     * @param {string} id
     */
    function openModal(id) {
        const dlg = document.getElementById('modal-' + id);
        if (!dlg) return;
        if (dlg.open) return;

        // FIX: храним триггер per-dialog, а не глобально
        dlg._trigger = document.activeElement;

        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');

        // FIX: сброс состояния тренажёра при открытии (см. 06-tools-core.js)
        if (typeof window.NP.resetTool === 'function') {
            const gameEl = dlg.querySelector('[data-game^="tool-"]');
            if (gameEl) window.NP.resetTool(gameEl);
        }

        const first = dlg.querySelector('button, input, [tabindex]');
        if (first) setTimeout(() => first.focus(), 50);
    }

    /**
     * Закрыть модалку и вернуть фокус.
     * @param {HTMLDialogElement} dlg
     */
    function closeModal(dlg) {
        if (!dlg) return;
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');

        const trigger = dlg._trigger;
        if (trigger && trigger.isConnected && typeof trigger.focus === 'function') {
            trigger.focus();
        }
        dlg._trigger = null;
    }

    /* Навешиваем обработчики на все <dialog class="modal"> */
    document.querySelectorAll('dialog.modal').forEach(dlg => {
        const closeBtn = dlg.querySelector('.modal__close');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(dlg));

        // Клик по подложке (backdrop)
        dlg.addEventListener('click', (e) => {
            if (e.target === dlg) closeModal(dlg);
        });

        // FIX: общий сброс таймеров + фокус при закрытии
        dlg.addEventListener('close', () => {
            // SOBER
            if (window.NP && NP.breathTimer) {
                clearTimeout(NP.breathTimer);
                NP.breathTimer = null;
            }
            // FIX: URGE — отдельный таймер
            if (window.NP && NP.urgeTimer) {
                clearInterval(NP.urgeTimer);
                NP.urgeTimer = null;
            }
            const trigger = dlg._trigger;
            if (trigger && trigger.isConnected && typeof trigger.focus === 'function') {
                trigger.focus();
            }
            dlg._trigger = null;
        });
    });

    /* Делегирование клика по [data-modal-open] */
    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-modal-open]');
        if (!t) return;
        e.preventDefault();
        openModal(t.dataset.modalOpen);
    });

    /* Клавиатура для role="button" */
    document.addEventListener('keydown', (e) => {
        if (
            (e.key === 'Enter' || e.key === ' ') &&
            e.target.matches('[data-modal-open][role="button"]')
        ) {
            e.preventDefault();
            openModal(e.target.dataset.modalOpen);
        }
    });

    NP.openModal = openModal;
    NP.closeModal = closeModal;
})();
