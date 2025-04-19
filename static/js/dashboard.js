document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных для dashboard
    loadMetrics();
    loadNotifications();
});

// Загрузка показателей
function loadMetrics() {
    // В реальном приложении здесь будет AJAX запрос
    const metrics = [
        { title: 'Всего книг в фонде', value: '12 458', class: 'primary' },
        { title: 'Книг в наличии', value: '8 742', class: 'success' },
        { title: 'На руках у читателей', value: '3 216', class: 'info' },
        { title: 'Требуют списания', value: '327', class: 'warning' },
        { title: 'Новые поступления', value: '173', class: 'danger' }
    ];

    const metricsContainer = document.querySelector('.metrics');
    metricsContainer.innerHTML = '';

    metrics.forEach(metric => {
        const metricCard = document.createElement('div');
        metricCard.className = `metric-card ${metric.class}`;
        metricCard.innerHTML = `
            <div class="metric-title">${metric.title}</div>
            <div class="metric-value">${metric.value}</div>
        `;
        metricsContainer.appendChild(metricCard);
    });
}

// Загрузка уведомлений
function loadNotifications() {
    // В реальном приложении здесь будет AJAX запрос
    const notifications = [
        {
            type: 'danger',
            icon: 'exclamation',
            title: '15 книг требуют срочного списания',
            time: 'Сегодня, 10:45'
        },
        {
            type: 'warning',
            icon: 'clock',
            title: '42 книги с истекающим сроком возврата',
            time: 'Вчера, 16:30'
        },
        {
            type: 'info',
            icon: 'bookmark',
            title: '7 новых запросов на бронирование',
            time: 'Вчера, 14:15'
        }
    ];

    const notificationsContainer = document.querySelector('.notifications');
    const notificationsList = notificationsContainer.querySelector('.notifications-list') ||
        document.createElement('div');

    notificationsList.className = 'notifications-list';
    notificationsList.innerHTML = '';

    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="fas fa-${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-time">${notification.time}</div>
            </div>
        `;
        notificationsList.appendChild(notificationItem);
    });

    if (!notificationsContainer.querySelector('.notifications-list')) {
        notificationsContainer.appendChild(notificationsList);
    }
}
