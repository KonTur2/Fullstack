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

let allBooks = []; // Глобальная переменная для хранения всех книг

// Загружаем все книги при загрузке страницы
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/books/all');
        const data = await response.json();
        if (data.success) {
            allBooks = data.books;
        }
    } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
    }
});

// Функция поиска книг с фильтрацией
function searchBooks() {
    const title = document.getElementById('search-title').value.toLowerCase();
    const author = document.getElementById('search-author').value.toLowerCase();
    const genre = document.getElementById('search-genre').value;
    const isbn = document.getElementById('search-isbn').value.toLowerCase();

    // Фильтрация книг
    const filteredBooks = allBooks.filter(book => {
        const matchesTitle = title === '' || book.title.toLowerCase().includes(title);
        const matchesAuthor = author === '' || book.author.toLowerCase().includes(author);
        const matchesGenre = genre === '' || book.genre.toLowerCase() === genre.toLowerCase();
        const matchesIsbn = isbn === '' || (book.isbn && book.isbn.toLowerCase().includes(isbn));
        
        return matchesTitle && matchesAuthor && matchesGenre && matchesIsbn;
    });

    displaySearchResults(filteredBooks);
}

// Функция сброса поиска
function resetSearch() {
    document.getElementById('search-title').value = '';
    document.getElementById('search-author').value = '';
    document.getElementById('search-genre').value = '';
    document.getElementById('search-isbn').value = '';
    displaySearchResults(allBooks);
}

// Отображение результатов
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
            <td>${book.publishing_house || 'Не указано'}</td>
            <td class="actions">
                <button class="btn btn-danger" onclick="showWriteOffModal(${book.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('search-results').style.display = 'block';
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
