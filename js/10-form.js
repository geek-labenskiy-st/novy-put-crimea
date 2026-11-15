/* ============================================================
   10-form.js — форма обратного звонка, капча, маска телефона
   Зависит от: ничего.
   ============================================================ */
(function () {
    'use strict';

    const ROLE_LABELS = {
        dependent: 'Зависимый',
        relative: 'Родственник',
        friend: 'Друг'
    };

    /* ---------- Маска телефона ---------- */
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            if (e.inputType === 'deleteContentBackward') {
                const digits = e.target.value.replace(/\D/g, '');
                if (!digits || digits === '7') {
                    e.target.value = '';
                    return;
                }
            }

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

    /* ---------- Капча-сумма ---------- */
    let captchaAnswer = 0;

    function generateCaptcha() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = a + b;
        const q = document.getElementById('captchaQuestion');
        if (q) q.textContent = `Проверка: сколько будет ${a} + ${b}?`;
        const inp = document.getElementById('captcha');
        if (inp) inp.value = '';
    }
    generateCaptcha();

    /* ---------- Отправка формы ---------- */
    const form = document.getElementById('callbackForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('callbackSuccess');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form__input').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => el.classList.remove('error'));

        // Honeypot
        const honey = document.getElementById('website');
        if (honey && honey.value) return;

        let isValid = true;

        const phoneEl = document.getElementById('phone');
        const phone = phoneEl.value.replace(/\D/g, '');
        if (phone.length !== 11) {
            document.getElementById('phoneError').textContent = 'Введите корректный номер телефона';
            phoneEl.classList.add('error');
            isValid = false;
        }

        const role = document.querySelector('input[name="role"]:checked');
        if (!role) {
            document.getElementById('roleError').textContent = 'Пожалуйста, выберите кто вы';
            document.querySelectorAll('input[name="role"]').forEach(el => el.classList.add('error'));
            isValid = false;
        }

        const consent = document.getElementById('consent');
        if (consent && !consent.checked) {
            document.getElementById('consentError').textContent = 'Необходимо согласие на обработку данных';
            consent.classList.add('error');
            isValid = false;
        }

        const captchaEl = document.getElementById('captcha');
        const captchaValue = parseInt(captchaEl.value, 10);
        if (captchaValue !== captchaAnswer) {
            document.getElementById('captchaError').textContent = 'Неверный ответ. Попробуйте ещё раз.';
            captchaEl.classList.add('error');
            generateCaptcha();
            isValid = false;
        }

        if (!isValid) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const formData = new FormData(form);
            const roleValue = formData.get('role');
            formData.set('role', ROLE_LABELS[roleValue] || roleValue);
            // FIX: не отправляем служебные поля в письмо
            formData.delete('website');
            formData.delete('captcha');

            // FIX: таймаут запроса, чтобы кнопка не висела вечно
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            let response;
            try {
                response = await fetch('https://formsubmit.co/ajax/repair-service-sev@mail.ru', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData,
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) throw new Error('network');

            let data = null;
            try { data = await response.json(); } catch (_) { /* тело не JSON — считаем ok */ }
            if (data && String(data.success) !== 'true') {
                throw new Error('formsubmit rejected');
            }

            form.hidden = true;
            if (successMessage) successMessage.hidden = false;
        } catch (err) {
            // FIX: честный fallback — не притворяемся, что всё отправлено
            const name = (document.getElementById('name') || {}).value || 'Не указано';
            const phoneFormatted = phoneEl.value;
            const roleChecked = document.querySelector('input[name="role"]:checked');
            const roleTextFallback = roleChecked
                ? (ROLE_LABELS[roleChecked.value] || roleChecked.value)
                : 'Не указано';
            const comment = (document.getElementById('comment') || {}).value || 'Не указано';

            const subject = encodeURIComponent('Новая заявка с сайта Новый Путь');
            const body = encodeURIComponent(
                `Имя: ${name}\nТелефон: ${phoneFormatted}\nКто: ${roleTextFallback}\nКомментарий: ${comment}`
            );

            submitBtn.disabled = false;
            submitBtn.textContent = 'Перезвоните мне';

            // Показываем пользователю выбор: почта или звонок
            const errBox = document.getElementById('phoneError');
            if (errBox) {
                errBox.textContent = 'Не удалось отправить автоматически. Откройте почту или позвоните: 8 (978) 958-11-88';
                errBox.style.color = 'var(--color-error)';
            }

            // Открываем mailto только если пользователь явно согласится —
            // через диалог confirm (без потери данных)
            if (window.confirm('Автоматическая отправка не удалась. Открыть почтовый клиент, чтобы отправить заявку вручную?')) {
                window.location.href = `mailto:repair-service-sev@mail.ru?subject=${subject}&body=${body}`;
            }
        }
    });
})();