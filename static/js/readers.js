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

// Сохранение читателя
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


    if (!validateForm('add-reader-form')) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    // Собираем данные формы
    const formData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        phone: document.getElementById('phone').value,
        patronymic: document.getElementById('patronymic').value,
        birthdate: document.getElementById('birthdate').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };

    // Отправляем данные на сервер
    fetch('http://localhost:5000/api/readers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Читатель успешно зарегистрирован!');
        resetReaderForm();
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert(error.error || 'Произошла ошибка при сохранении читателя');
    });
}

// Сброс формы читателя
function resetReaderForm() {
    document.getElementById('first-name').value = '';
    document.getElementById('last-name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('patronymic').value = '';
    document.getElementById('birthdate').value = '';
    document.getElementById('email').value = '';
    document.getElementById('address').value = '';
}

// Поиск читателей
async function searchReaders() {
    const query = document.getElementById('search-query').value.trim();
    
    if (!query) {
        alert('Пожалуйста, введите поисковый запрос');
        return;
    }

    try {
        // Отправляем запрос к API
        const response = await fetch(`/api/readers/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            displayReaderResults(data.readers);
        } else {
            alert(data.error || 'Читатели не найдены');
        }
    } catch (error) {
        console.error('Ошибка при поиске читателей:', error);
        alert('Произошла ошибка при поиске читателей');
    }
}

// Отображение результатов поиска читателей (остается без изменений)
function displayReaderResults(results) {
    console.log(results);
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
            <td>${reader.id}</td>
            <td>${reader.lastName}</td>
            <td>${reader.firstName}</td>
            <td>${reader.patronymic || '-'}</td>
            <td>${reader.birthdate}</td>
            <td>${reader.phone}</td>
            <td>${reader.address}</td>
            <td>${reader.email}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('reader-results').style.display = 'block';
}

// Сброс поиска читателей
function resetReaderSearch() {
    document.getElementById('search-query').value = '';
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