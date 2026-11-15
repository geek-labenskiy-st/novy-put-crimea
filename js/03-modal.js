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

        // храним триггер per-dialog
        dlg._trigger = document.activeElement;

        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');

        // сброс состояния тренажёров и «3 клика» при открытии
        if (typeof window.NP.resetTool === 'function') {
            const toolEl = dlg.querySelector('[data-game^="tool-"]');
            if (toolEl) window.NP.resetTool(toolEl);
        }
        // FIX: карусели «3 клика» тоже сбрасываем — паритет с тренажёрами
        if (typeof window.NP.resetGame === 'function') {
            dlg.querySelectorAll('[data-game]:not([data-game^="tool-"])')
                .forEach(el => window.NP.resetGame(el));
        }

        // FIX: фокус — на первый интерактив в теле, а не на крестик
        const first = dlg.querySelector(
            '.modal__body button, .modal__body input, .modal__body [tabindex]'
        ) || dlg.querySelector('button, input, [tabindex]');
        if (first) setTimeout(() => first.focus(), 50);
    }

    /**
     * Закрыть модалку. Возврат фокуса — только в обработчике 'close'.
     * @param {HTMLDialogElement} dlg
     */
    function closeModal(dlg) {
        if (!dlg) return;
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
    }

    /* Навешиваем обработчики на все <dialog class="modal"> */
    document.querySelectorAll('dialog.modal').forEach(dlg => {
        const closeBtn = dlg.querySelector('.modal__close');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(dlg));

        // Клик по подложке (backdrop)
        dlg.addEventListener('click', (e) => {
            if (e.target === dlg) closeModal(dlg);
        });

        // Единая точка: сброс таймеров + возврат фокуса
        dlg.addEventListener('close', () => {
            // SOBER
            if (window.NP && NP.breathTimer) {
                clearTimeout(NP.breathTimer);
                NP.breathTimer = null;
            }
            // URGE
            if (window.NP && NP.urgeTimer) {
                clearInterval(NP.urgeTimer);
                NP.urgeTimer = null;
            }
            const trigger = dlg._trigger;
            if (trigger && trigger.isConnected && trigger !== document.body &&
                typeof trigger.focus === 'function') {
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
