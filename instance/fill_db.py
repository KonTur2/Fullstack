import sqlite3
from config import DB_PATH

def fill():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Создание таблиц
    with open('instance/script.sql') as sql_script:
        cursor.executescript(sql_script.read())

    # Добавление авторов
    authors = [
        ("Лев", "Толстой", "Николаевич", "1828", "Россия"),
        ("Фёдор", "Достоевский", "Михайлович", "1821", "Россия"),
        ("Антон", "Чехов", "Павлович", "1860", "Россия"),
    ]
    cursor.executemany(
        "INSERT INTO author (first_name, last_name, patronymic, birth_year, country) VALUES (?, ?, ?, ?, ?)",
        authors
    )

    # Добавление жанров
    genres = [
        ("Художественная", "Роман"),
        ("Художественная", "Повесть"),
        ("Художественная", "Рассказ"),
    ]
    cursor.executemany(
        "INSERT INTO genre (genre_type, name) VALUES (?, ?)",
        genres
    )

    # Добавление книг
    books = [
        ("Война и мир", "isbn1", "1869", 10, 1500.50, 1, 1, "Эксмо"),
        ("Преступление и наказание", "isbn2", "1866", 5, 1200.00, 2, 1, "АСТ"),
        ("Вишнёвый сад", "isbn3", "1904", 8, 800.75, 3, 3, "Речь"),
    ]
    cursor.executemany(
        "INSERT INTO book (name, isbn, year, quantity, price, author_id, genre_id, publishing_house) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        books
    )

    # Добавление сотрудников
    employees = [
        ("Иван", "Иванов", "Иванович", "Библиотекарь", "user1", "pass"),
        ("Пётр", "Петров", "Петрович", "Администратор", "user2", "pass"),
        ("Димочка", "Димочкин", "Димович", "Бухгалтер", "user3", "pass"),
    ]
    cursor.executemany(
        "INSERT INTO employee (first_name, last_name, patronymic, position, login, password) VALUES (?, ?, ?, ?, ?, ?)",
        employees
    )

    # Добавление читателей
    readers = [
        ("Алексей", "Сидоров", "Алексеевич", "1990-05-15", "+7 (123) 456-7890"),
        ("Мария", "Кузнецова", "Сергеевна", "1985-08-20", "+7 (987) 654-3210"),
    ]
    cursor.executemany(
        "INSERT INTO reader (first_name, last_name, patronymic, date_birth, phone) VALUES (?, ?, ?, ?, ?)",
        readers
    )

    # Добавление поставщиков
    suppliers = [
        ("Книжный мир", "info@knigi.ru", "Сергей Васильев"),
        ("Литература", "sales@literatura.ru", "Ольга Петрова"),
    ]
    cursor.executemany(
        "INSERT INTO supplier (name, contact, contact_person) VALUES (?, ?, ?)",
        suppliers
    )

    # Фиксация изменений и закрытие соединения
    conn.commit()
    conn.close()

    print("База данных успешно заполнена!")