/* ============================================================
   10-form.js — форма обратного звонка, капча, маска телефона
   Зависит от: ничего.
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Маска телефона ---------- */
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

    /* ---------- Капча-сумма ---------- */
    let captchaAnswer = 0;

    function generateCaptcha() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = a + b;
        const q = document.getElementById('captchaQuestion');
        if (q) q.textContent = `Проверка: сколько будет ${a} + ${b}?`;
    }
    generateCaptcha();

    /* ---------- Отправка формы ---------- */
    const form = document.getElementById('callbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('callbackSuccess');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Сброс ошибок
        document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form__input').forEach(el => el.classList.remove('error'));

        // Honeypot
        if (document.getElementById('website').value) return;

        let isValid = true;

        // Телефон
        const phone = document.getElementById('phone').value.replace(/\D/g, '');
        if (phone.length !== 11) {
            document.getElementById('phoneError').textContent = 'Введите корректный номер телефона';
            document.getElementById('phone').classList.add('error');
            isValid = false;
        }

        // Роль
        const role = document.querySelector('input[name="role"]:checked');
        if (!role) {
            document.getElementById('roleError').textContent = 'Пожалуйста, выберите кто вы';
            isValid = false;
        }

        // Согласие
        const consent = document.getElementById('consent');
        if (consent && !consent.checked) {
            document.getElementById('consentError').textContent = 'Необходимо согласие на обработку данных';
            isValid = false;
        }

        // Капча
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
            // Fallback: mailto
            const name = document.getElementById('name').value || 'Не указано';
            const phoneFormatted = document.getElementById('phone').value;
            const roleChecked = document.querySelector('input[name="role"]:checked');
            const roleTextFallback = roleChecked ? roleChecked.nextElementSibling.textContent : 'Не указано';
            const comment = document.getElementById('comment').value || 'Не указано';

            const subject = encodeURIComponent('Новая заявка с сайта Новый Путь');
            const body = encodeURIComponent(
                `Имя: ${name}\nТелефон: ${phoneFormatted}\nКто: ${roleTextFallback}\nКомментарий: ${comment}`
            );

            window.location.href = `mailto:repair-service-sev@mail.ru?subject=${subject}&body=${body}`;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Перезвоните мне';
        }
    });
})();
