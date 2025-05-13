// Останавливаем отправку формы для валидации
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    let valid = true;
    document.querySelectorAll('.error').forEach(error => error.textContent = ''); // Очистка ошибок

    // Валидация имени пользователя
    const username = document.getElementById('username').value;
    if (username.trim() === '') {
        valid = false;
        document.getElementById('username-error').textContent = 'Логин не может быть пустым.';
    }

    // Валидация пароля
    const password = document.getElementById('password').value;
    if (password.length < 6) {
        valid = false;
        document.getElementById('password-error').textContent = 'Пароль должен содержать минимум 6 символов.';
    }

    // Если форма валидна, отправляем её
    if (valid) {
        this.submit(); // Отправляем форму
    }
});