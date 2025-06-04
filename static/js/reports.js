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
        // Скрываем результаты и опции экспорта при смене типа отчета
        document.getElementById('report-results').style.display = 'none';
        document.getElementById('export-options').style.display = 'none';
        document.getElementById('charts-container').style.display = 'none';
    });
});

// Генерация отчета
async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!reportType) {
        alert('Выберите тип отчета');
        return;
    }

    // Проверка периода для отчетов, требующих даты
    if ((reportType === 'new-arrivals' || reportType === 'issue-return') && (!startDate || !endDate)) {
        alert('Укажите период для отчета');
        return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('Дата начала не может быть позже даты окончания');
        return;
    }

    try {
        const response = await fetch('/api/reports/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                report_type: reportType,
                start_date: startDate,
                end_date: endDate
            })
        });

        const result = await response.json();

        if (response.ok) {
            if (result.success && result.report_url && result.report_pdf_url) {
                // Показываем кнопку скачивания
                const downloadButton = document.getElementById('download-report-btn');
                downloadButton.href = result.report_url;
                downloadButton.style.display = 'inline-block';
                const downloadButtonPDF = document.getElementById('download-report-pdf-btn');
                downloadButtonPDF.href = result.report_pdf_url;
                downloadButtonPDF.style.display = 'inline-block';
                document.getElementById('export-options').style.display = 'flex';
                document.getElementById('report-results').style.display = 'block';
                document.getElementById('report-title').textContent = `Отчет "${reportTitles[reportType]}" готов`;
                document.getElementById('report-content').innerHTML = '<p>Нажмите кнопку "Скачать отчет" для загрузки файла.</p>';
            } else {
                alert('Ошибка при генерации отчета: ' + (result.error || 'Неизвестная ошибка'));
            }
        } else {
            alert('Ошибка сервера: ' + (result.error || response.statusText));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке запроса.');
    }
}

// Экспорт отчета (теперь только печать)
function exportReport(format) {
    if (format === 'print') {
        printReport();
    } else {
        // Для docx теперь используется прямая ссылка на скачивание
        // Эта функция может быть переименована или удалена, если не будет других форматов
        alert('Для скачивания отчета используйте кнопку "Скачать отчет".');
    }
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
    // Скрываем кнопку скачивания при сбросе
    document.getElementById('download-report-btn').style.display = 'none';
}

// Удаляем mock-данные и функции отображения таблиц/графиков, так как они больше не нужны
// const reportColumns = {...}; // Удалено
// function displayReportResults(...) // Удалено
// function renderCharts(...) // Удалено
// function getMockReportData(...) // Удалено
