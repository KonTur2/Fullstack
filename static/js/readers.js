// Массив для хранения читателей (временное решение)
let readers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Проверка параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'search') {
        document.querySelector('.tab[onclick*="search-reader"]').click();
    }
});

// Сохранение читателя
function saveReader() {
    if (!validateForm('add-reader-form')) return;

    const reader = {
        id: Date.now(),
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        phone: document.getElementById('phone').value,
        patronymic: document.getElementById('patronymic').value,
        birthdate: document.getElementById('birthdate').value,
    };

    // В реальном приложении здесь будет AJAX запрос
    readers.push(reader);
    alert('Читатель успешно зарегистрирован!');
    resetReaderForm();
}

// Сброс формы читателя
function resetReaderForm() {
    document.getElementById('first-name').value = '';
    document.getElementById('last-name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('patronymic').value = '';
    document.getElementById('birthdate').value = '';
}

// Поиск читателей
function searchReaders() {
    const name = document.getElementById('search-name').value.toLowerCase();
    const ticket = document.getElementById('search-ticket').value.toLowerCase();

    // Фильтрация читателей (в реальном приложении будет AJAX запрос)
    const filteredReaders = readers.filter(reader => {
        return (name === '' || reader.fullName.toLowerCase().includes(name)) &&
               (ticket === '' || reader.ticketNumber.toLowerCase().includes(ticket));
    });

    displayReaderResults(filteredReaders);
}

// Отображение результатов поиска читателей
function displayReaderResults(results) {
    const tbody = document.getElementById('readers-table-body');
    tbody.innerHTML = '';

    if (results.length === 0) {
        document.getElementById('reader-results').style.display = 'none';
        alert('Читатели не найдены');
        return;
    }

    results.forEach(reader => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${reader.fullName}</td>
            <td>${reader.ticketNumber}</td>
            <td>${reader.phone}</td>
            <td>${reader.email || '-'}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick="editReader(${reader.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('reader-results').style.display = 'block';
}

// Сброс поиска читателей
function resetReaderSearch() {
    document.getElementById('search-name').value = '';
    document.getElementById('search-ticket').value = '';
    document.getElementById('reader-results').style.display = 'none';
}

// Редактирование читателя
function editReader(readerId) {
    const reader = readers.find(r => r.id === readerId);
    if (!reader) return;

    // Заполнение формы
    document.getElementById('full-name').value = reader.fullName;
    document.getElementById('ticket-number').value = reader.ticketNumber;
    document.getElementById('phone').value = reader.phone;
    document.getElementById('email').value = reader.email;
    document.getElementById('birthdate').value = reader.birthdate;
    document.getElementById('address').value = reader.address;
    document.getElementById('notes').value = reader.notes;

    // Переключение на вкладку добавления
    document.querySelector('.tab[onclick*="add-reader"]').click();

    // Можно добавить флаг редактирования и ID читателя в скрытое поле
}
