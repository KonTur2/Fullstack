// Массив для хранения книг (временное решение)
let books = [];

document.addEventListener('DOMContentLoaded', function() {
    // Загрузка обложки
    document.getElementById('cover-upload').addEventListener('click', function() {
        document.getElementById('cover-input').click();
    });

    document.getElementById('cover-input').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('cover-preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                document.querySelector('.cover-upload i').style.display = 'none';
                document.querySelector('.cover-upload span').textContent = 'Изменить обложку';
            }
            reader.readAsDataURL(file);
        }
    });

    // Проверка параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'search') {
        document.querySelector('.tab[onclick*="search-book"]').click();
    }
});

// Сохранение книги
function saveBook() {
    if (!validateForm('add-book-form')) return;

    const book = {
        id: Date.now(),
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        year: document.getElementById('year').value,
        genre: document.getElementById('genre').value,
        quantity: document.getElementById('quantity').value,
        available: document.getElementById('quantity').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        cover: document.getElementById('cover-preview').src || ''
    };

    // В реальном приложении здесь будет AJAX запрос
    books.push(book);
    alert('Книга успешно добавлена!');
    resetBookForm();
}

// Сброс формы добавления книги
function resetBookForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('isbn').value = '';
    document.getElementById('year').value = '';
    document.getElementById('genre').value = '';
    document.getElementById('quantity').value = '1';
    document.getElementById('location').value = '';
    document.getElementById('description').value = '';
    document.getElementById('cover-preview').style.display = 'none';
    document.getElementById('cover-preview').src = '#';
    document.querySelector('.cover-upload i').style.display = 'block';
    document.querySelector('.cover-upload span').textContent = 'Загрузите обложку книги';
}

// Поиск книг
function searchBooks() {
    const title = document.getElementById('search-title').value.toLowerCase();
    const author = document.getElementById('search-author').value.toLowerCase();
    const genre = document.getElementById('search-genre').value;
    const location = document.getElementById('search-location').value.toLowerCase();

    // Фильтрация книг (в реальном приложении будет AJAX запрос)
    const filteredBooks = books.filter(book => {
        return (title === '' || book.title.toLowerCase().includes(title)) &&
               (author === '' || book.author.toLowerCase().includes(author)) &&
               (genre === '' || book.genre === genre) &&
               (location === '' || book.location.toLowerCase().includes(location));
    });

    displaySearchResults(filteredBooks);
}

// Отображение результатов поиска
function displaySearchResults(results) {
    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = '';

    if (results.length === 0) {
        document.getElementById('search-results').style.display = 'none';
        alert('Книги не найдены');
        return;
    }

    results.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.quantity}</td>
            <td>${book.available}</td>
            <td>${book.location}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick="editBook(${book.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="showWriteOffModal(${book.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('search-results').style.display = 'block';
}

// Сброс поиска
function resetSearch() {
    document.getElementById('search-title').value = '';
    document.getElementById('search-author').value = '';
    document.getElementById('search-genre').value = '';
    document.getElementById('search-location').value = '';
    document.getElementById('search-results').style.display = 'none';
}

// Редактирование книги
function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Заполнение формы
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('isbn').value = book.isbn;
    document.getElementById('year').value = book.year;
    document.getElementById('genre').value = book.genre;
    document.getElementById('quantity').value = book.quantity;
    document.getElementById('location').value = book.location;
    document.getElementById('description').value = book.description;

    if (book.cover) {
        document.getElementById('cover-preview').src = book.cover;
        document.getElementById('cover-preview').style.display = 'block';
        document.querySelector('.cover-upload i').style.display = 'none';
        document.querySelector('.cover-upload span').textContent = 'Изменить обложку';
    }

    // Переключение на вкладку добавления
    document.querySelector('.tab[onclick*="add-book"]').click();

    // Можно добавить флаг редактирования и ID книги в скрытое поле
}

// Списание книги
function showWriteOffModal(bookId) {
    currentBookId = bookId;
    showModal('write-off-modal');
}

function confirmWriteOff() {
    const reason = document.getElementById('write-off-reason').value;
    const comment = document.getElementById('write-off-comment').value;

    if (!reason) {
        alert('Укажите причину списания');
        return;
    }

    // В реальном приложении здесь будет AJAX запрос
    books = books.filter(book => book.id !== currentBookId);
    alert('Книга списана');
    hideModal('write-off-modal');
    searchBooks(); // Обновляем результаты поиска
}
