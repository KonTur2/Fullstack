// Глобальные переменные для хранения текущих данных
let currentReader = null;
let currentBook = null;

// Поиск читателя по телефону
async function findReader() {
    const phone = document.getElementById('reader-ticket').value.trim();
    if (!phone) {
        alert('Введите номер телефона читателя');
        return;
    }

    try {
        const response = await fetch(`/api/reader/by-phone?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        const readerInfo = document.getElementById('reader-info');
        const createReaderBtn = document.getElementById('create-reader-btn');

        if (!data.exists) {
            readerInfo.style.display = 'none';
            
            if (!createReaderBtn) {
                const btn = document.createElement('button');
                btn.id = 'create-reader-btn';
                btn.className = 'btn btn-primary';
                btn.style.marginTop = '10px';
                btn.style.width = 'auto';
                btn.textContent = 'Создать нового читателя';
                btn.onclick = () => {
                    window.location.href = '/readers';
                };
                
                const formGroup = document.querySelector('#reader-ticket').closest('.form-group');
                formGroup.appendChild(btn);
            }
            
            alert('Читатель с таким телефоном не найден');
            return;
        }

        currentReader = data.reader;
        document.getElementById('reader-name').textContent = 
            `${data.reader.last_name} ${data.reader.first_name} ${data.reader.patronymic || ''}`.trim();
        document.getElementById('reader-phone').textContent = data.reader.phone;
        
        readerInfo.style.display = 'block';
        
        if (createReaderBtn) {
            createReaderBtn.remove();
        }
    } catch (error) {
        console.error('Ошибка при поиске читателя:', error);
        alert('Произошла ошибка при поиске читателя: ' + error.message);
    }
}

// Поиск книги по ISBN или ID
async function findBook() {
    const identifier = document.getElementById('book-isbn').value.trim();
    if (!identifier) {
        alert('Введите ISBN или код книги');
        return;
    }

    try {
        const response = await fetch(`/api/book/by-identifier?identifier=${encodeURIComponent(identifier)}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        currentBook = data.book;
        document.getElementById('book-title').textContent = data.book.title;
        document.getElementById('book-author').textContent = data.book.author;
        document.getElementById('book-year').textContent = data.book.year;
        document.getElementById('book-publishing_house').textContent = data.book.publishing_house;

        
        document.getElementById('book-info').style.display = 'block';
        
        // Устанавливаем даты
        const today = new Date();
        const returnDate = new Date();
        returnDate.setDate(today.getDate() + 14);
        
        document.getElementById('issue-date').valueAsDate = today;
        document.getElementById('return-date').valueAsDate = returnDate;
        document.getElementById('return-date').readOnly = true;
    } catch (error) {
        console.error('Ошибка при поиске книги:', error);
        alert('Произошла ошибка при поиске книги: ' + error.message);
    }
}

// Выдача книги
async function issueBook() {
    if (!currentReader || !currentBook) {
        alert('Необходимо найти читателя и книгу');
        return;
    }

    const issueDate = document.getElementById('issue-date').value;
    const returnDate = document.getElementById('return-date').value;
    const notes = document.getElementById('issue-notes').value;

    if (!issueDate || !returnDate) {
        alert('Заполните даты выдачи и возврата');
        return;
    }

    try {
        const response = await fetch('/api/book/issue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reader_id: currentReader.id,
                book_id: currentBook.id,
                issue_date: issueDate,
                return_date: returnDate,
                notes: notes
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        alert('Книга успешно выдана!');
        resetIssueForm();
    } catch (error) {
        console.error('Ошибка при выдаче книги:', error);
        alert('Произошла ошибка при выдаче книги: ' + error.message);
    }
}

// Сброс формы выдачи
function resetIssueForm() {
    document.getElementById('reader-ticket').value = '';
    document.getElementById('reader-info').style.display = 'none';
    document.getElementById('book-isbn').value = '';
    document.getElementById('book-info').style.display = 'none';
    document.getElementById('issue-notes').value = '';
    
    const createReaderBtn = document.getElementById('create-reader-btn');
    if (createReaderBtn) {
        createReaderBtn.remove();
    }
    
    currentReader = null;
    currentBook = null;
    
    // Сброс дат
    document.getElementById('issue-date').value = '';
    document.getElementById('return-date').value = '';
    document.getElementById('return-date').readOnly = false;
}

