// settings.js - Логика страницы настроек

// Показать выбранную вкладку настроек
function showSettingsTab(tabId) {
    document.querySelectorAll('.settings-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Сохранение системных настроек
function saveSystemSettings() {
    const settings = {
        language: document.getElementById('system-language').value,
        backupFrequency: document.getElementById('backup-frequency').value,
        sessionTimeout: document.getElementById('session-timeout').value
    };

    // В реальном приложении здесь будет AJAX запрос
    console.log('Сохранение системных настроек:', settings);
    alert('Системные настройки сохранены');
}

// Сохранение библиотечных настроек
function saveLibrarySettings() {
    const settings = {
        loanPeriod: document.getElementById('default-loan-period').value,
        maxBooks: document.getElementById('max-books-per-user').value,
        finePerDay: document.getElementById('fine-per-day').value,
        allowReservations: document.getElementById('allow-reservations').checked
    };

    // В реальном приложении здесь будет AJAX запрос
    console.log('Сохранение библиотечных настроек:', settings);
    alert('Библиотечные настройки сохранены');
}

// Сохранение пользовательских настроек
function saveUserSettings() {
    const password = document.getElementById('user-password').value;
    const passwordConfirm = document.getElementById('user-password-confirm').value;

    if (password && password !== passwordConfirm) {
        alert('Пароли не совпадают');
        return;
    }

    const settings = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: password || undefined,
        receiveNotifications: document.getElementById('receive-notifications').checked
    };

    // В реальном приложении здесь будет AJAX запрос
    console.log('Сохранение пользовательских настроек:', settings);
    alert('Пользовательские настройки сохранены');

    if (password) {
        document.getElementById('user-password').value = '';
        document.getElementById('user-password-confirm').value = '';
    }
}

// Загрузка настроек при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    // В реальном приложении здесь будет загрузка текущих настроек с сервера
    // loadCurrentSettings();

    // Обработка параметров URL для открытия конкретной вкладки
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');

    if (tab && ['system-settings', 'library-settings', 'user-settings'].includes(tab)) {
        showSettingsTab(tab);
    }
});
