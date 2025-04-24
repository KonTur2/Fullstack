document.addEventListener('DOMContentLoaded', function () {
    // Проверка параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'search') {
        document.querySelector('.tab[onclick*="search-reader"]').click();
    }

    // Маска на телефон (через jQuery Mask Plugin)
    $(function () {
        $("#phone").mask("+7 (999) 999-99 99");
    });
});

// Массив для хранения читателей (временное решение)
let readers = [];

document.addEventListener('DOMContentLoaded', function () {
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
        fullName: document.getElementById('full-name').value,
        ticketNumber: document.getElementById('ticket-number').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        birthdate: document.getElementById('birthdate').value,
        address: document.getElementById('address').value,
        notes: document.getElementById('notes').value
    };

    // В реальном приложении здесь будет AJAX запрос
    readers.push(reader);
    alert('Читатель успешно зарегистрирован!');
    resetReaderForm();
}

// Сброс формы читателя
function resetReaderForm() {
    document.getElementById('full-name').value = '';
    document.getElementById('ticket-number').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('birthdate').value = '';
    document.getElementById('address').value = '';
    document.getElementById('notes').value = '';
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

function saveReader() {
    const birthdateStr = document.getElementById('birthdate').value;
    if (!birthdateStr) {
        alert("Пожалуйста, введите дату рождения");
        return;
    }

    const birthdate = new Date(birthdateStr);
    const today = new Date();

    if (birthdate > today) {
        alert("Дата рождения не может быть в будущем");
        return;
    }

    const age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    const dayDiff = today.getDate() - birthdate.getDate();

    const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

    if (adjustedAge < 5) {
        alert("Читателю должно быть не менее 5 лет");
        return;
    } else if (adjustedAge > 100) {
        alert("Вам 100 лет +, идите отдыхайте уже");
    }
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
