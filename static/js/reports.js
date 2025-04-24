// reports.js - Логика для страницы отчетов

// Объект с заголовками отчетов
const reportTitles = {
    'all-books': 'Список всех книг',
    'by-genre': 'Список книг по жанрам',
    'by-author': 'Список книг по авторам',
    'issued-books': 'Список книг на руках у читателей',
    'write-off': 'Список книг, требующих списания',
    'new-arrivals': 'Отчет о новых поступлениях за период',
    'issue-return': 'Отчет о выданных и возвращенных книгах за период'
};

// Объект с шаблонами столбцов для каждого отчета
const reportColumns = {
    'all-books': ['Название', 'Автор', 'Жанр', 'Год издания', 'Место хранения', 'Статус'],
    'by-genre': ['Жанр', 'Количество книг', 'Доступно', 'На руках'],
    'by-author': ['Автор', 'Количество книг', 'Доступно', 'На руках'],
    'issued-books': ['Название', 'Автор', 'Читатель', 'Дата выдачи', 'Дата возврата'],
    'write-off': ['Название', 'Автор', 'Год издания', 'Причина списания'],
    'new-arrivals': ['Название', 'Автор', 'Дата поступления', 'Количество', 'Место хранения'],
    'issue-return': ['Дата', 'Книга', 'Автор', 'Читатель', 'Тип операции']
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Установка дат по умолчанию (текущий месяц)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('start-date').valueAsDate = firstDay;
    document.getElementById('end-date').valueAsDate = lastDay;

    // Обработка изменения типа отчета
    document.getElementById('report-type').addEventListener('change', function() {
        const reportType = this.value;
        const periodFields = document.getElementById('period-fields');

        // Показываем поля периода только для определенных отчетов
        if (reportType === 'new-arrivals' || reportType === 'issue-return') {
            periodFields.style.display = 'flex';
        } else {
            periodFields.style.display = 'none';
        }
    });
});

// Генерация отчета
function generateReport() {
    const reportType = document.getElementById('report-type').value;

    if (!reportType) {
        alert('Выберите тип отчета');
        return;
    }

    // Проверка периода для отчетов, требующих даты
    if (reportType === 'new-arrivals' || reportType === 'issue-return') {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate || !endDate) {
            alert('Укажите период для отчета');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('Дата начала не может быть позже даты окончания');
            return;
        }
    }

    // В реальном приложении здесь будет AJAX запрос к серверу
    // Для примера используем mock-данные
    const reportData = getMockReportData(reportType);

    // Отображаем результаты
    displayReportResults(reportType, reportData);

    // Показываем опции экспорта
    document.getElementById('export-options').style.display = 'flex';

    // Прокрутка к результатам
    document.getElementById('report-results').scrollIntoView({ behavior: 'smooth' });
}

// Отображение результатов отчета
function displayReportResults(reportType, data) {
    const reportTitle = reportTitles[reportType];
    const reportContent = document.getElementById('report-content');

    // Устанавливаем заголовок
    document.getElementById('report-title').textContent = reportTitle;

    // Очищаем предыдущие результаты
    reportContent.innerHTML = '';

    if (data.length === 0) {
        // Если нет данных
        reportContent.innerHTML = `
            <div class="no-data">
                <i class="fas fa-database"></i>
                <h4>Нет данных для отображения</h4>
                <p>По вашему запросу не найдено ни одной записи.</p>
            </div>
        `;
    } else {
        // Создаем таблицу
        const table = document.createElement('table');
        table.className = 'report-table';

        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        reportColumns[reportType].forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Создаем тело таблицы
        const tbody = document.createElement('tbody');

        data.forEach(item => {
            const row = document.createElement('tr');

            // Заполняем строку данными в зависимости от типа отчета
            switch(reportType) {
                case 'all-books':
                    row.innerHTML = `
                        <td>${item.title}</td>
                        <td>${item.author}</td>
                        <td>${item.genre}</td>
                        <td>${item.year}</td>
                        <td>${item.location}</td>
                        <td>${item.status}</td>
                    `;
                    break;

                case 'by-genre':
                    row.innerHTML = `
                        <td>${item.genre}</td>
                        <td>${item.total}</td>
                        <td>${item.available}</td>
                        <td>${item.issued}</td>
                    `;
                    break;

                case 'issued-books':
                    row.innerHTML = `
                        <td>${item.title}</td>
                        <td>${item.author}</td>
                        <td>${item.reader}</td>
                        <td>${item.issueDate}</td>
                        <td>${item.returnDate}</td>
                    `;
                    break;

                // Добавьте другие case для каждого типа отчета
                default:
                    // Общий случай для простых отчетов
                    Object.values(item).forEach(value => {
                        const td = document.createElement('td');
                        td.textContent = value;
                        row.appendChild(td);
                    });
            }

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        reportContent.appendChild(table);

        // Для некоторых отчетов добавляем графики
        if (reportType === 'by-genre' || reportType === 'by-author') {
            renderCharts(reportType, data);
        }
    }

    // Показываем блок с результатами
    document.getElementById('report-results').style.display = 'block';
}

// Визуализация данных (графики)
function renderCharts(reportType, data) {
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    // Очищаем предыдущие графики
    if (window.reportChart1) window.reportChart1.destroy();
    if (window.reportChart2) window.reportChart2.destroy();

    // Подготавливаем данные для графиков
    const labels = data.map(item => item[reportType === 'by-genre' ? 'genre' : 'author']);
    const totalData = data.map(item => item.total);
    const availableData = data.map(item => item.available);

    // Первый график - общее распределение
    window.reportChart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Всего книг',
                data: totalData,
                backgroundColor: 'rgba(78, 115, 223, 0.5)',
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: reportType === 'by-genre'
                        ? 'Распределение книг по жанрам'
                        : 'Распределение книг по авторам'
                }
            }
        }
    });

    // Второй график - доступность
    window.reportChart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Доступно', 'На руках'],
            datasets: [{
                data: [
                    availableData.reduce((a, b) => a + b, 0),
                    totalData.reduce((a, b) => a + b, 0) - availableData.reduce((a, b) => a + b, 0)
                ],
                backgroundColor: [
                    'rgba(28, 200, 138, 0.5)',
                    'rgba(231, 74, 59, 0.5)'
                ],
                borderColor: [
                    'rgba(28, 200, 138, 1)',
                    'rgba(231, 74, 59, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Соотношение доступных и выданных книг'
                }
            }
        }
    });

    // Показываем контейнер с графиками
    document.getElementById('charts-container').style.display = 'block';
}

// Экспорт отчета
function exportReport(format) {
    const reportType = document.getElementById('report-type').value;
    const reportTitle = reportTitles[reportType];

    // В реальном приложении здесь будет реализация экспорта
    // Для примера просто показываем сообщение
    alert(`Отчет "${reportTitle}" будет экспортирован в формате ${format.toUpperCase()}`);

    // Реальная реализация может использовать библиотеки:
    // - Для CSV: PapaParse или ручное формирование
    // - Для Excel: SheetJS
    // - Для PDF: jsPDF или запрос к серверу
}

// Печать отчета
function printReport() {
    window.print();
}

// Сброс формы отчета
function resetReportForm() {
    document.getElementById('report-type').value = '';
    document.getElementById('period-fields').style.display = 'none';
    document.getElementById('report-results').style.display = 'none';
    document.getElementById('export-options').style.display = 'none';
    document.getElementById('charts-container').style.display = 'none';
}

// Mock-данные для демонстрации (в реальном приложении будут приходить с сервера)
function getMockReportData(reportType) {
    switch(reportType) {
        case 'all-books':
            return [
                { title: 'Математика. 5 класс', author: 'Иванов А.А.', genre: 'Учебная литература', year: 2020, location: 'Стеллаж А-12', status: 'В наличии' },
                { title: 'Основы программирования', author: 'Петров В.В.', genre: 'Научная литература', year: 2021, location: 'Стеллаж В-8', status: 'Выдана' },
                { title: 'Война и мир', author: 'Толстой Л.Н.', genre: 'Роман', year: 2019, location: 'Стеллаж Б-5', status: 'Требует списания' }
            ];

        case 'by-genre':
            return [
                { genre: 'Учебная литература', total: 45, available: 32, issued: 13 },
                { genre: 'Научная литература', total: 28, available: 15, issued: 13 },
                { genre: 'Роман', total: 36, available: 22, issued: 14 }
            ];

        case 'issued-books':
            return [
                { title: 'Основы программирования', author: 'Петров В.В.', reader: 'Иванов И.И.', issueDate: '15.05.2023', returnDate: '15.06.2023' },
                { title: 'Физика. 10 класс', author: 'Сидоров С.С.', reader: 'Петрова М.И.', issueDate: '20.05.2023', returnDate: '20.06.2023' }
            ];

        default:
            return [];
    }
}
