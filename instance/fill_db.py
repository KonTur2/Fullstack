import sqlite3
from datetime import datetime

conn = sqlite3.connect('instance/sqlite.db')
cursor = conn.cursor()

# Очистка таблиц (если нужно)
cursor.executescript("""
    DELETE FROM given_book;
    DELETE FROM lading_bill;
    DELETE FROM order_request;
    DELETE FROM debiting_act;
    DELETE FROM book;
    DELETE FROM author;
    DELETE FROM genre;
    DELETE FROM employee;
    DELETE FROM supplier;
    DELETE FROM reader;
""")

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
    ("Война и мир", "1869", 10, 1500.50, 1, 1, "Эксмо"),
    ("Преступление и наказание", "1866", 5, 1200.00, 2, 1, "АСТ"),
    ("Вишнёвый сад", "1904", 8, 800.75, 3, 3, "Речь"),
]
cursor.executemany(
    "INSERT INTO book (name, year, quantity, price, author_id, genre_id, publishing_house) VALUES (?, ?, ?, ?, ?, ?, ?)",
    books
)

# Добавление сотрудников
employees = [
    ("Иван", "Иванов", "Иванович", "Библиотекарь"),
    ("Пётр", "Петров", "Петрович", "Администратор"),
]
cursor.executemany(
    "INSERT INTO employee (first_name, last_name, patronymic, position) VALUES (?, ?, ?, ?)",
    employees
)

# Добавление читателей
readers = [
    ("Алексей", "Сидоров", "Алексеевич", "1990-05-15", "+7 (123) 456-7890"),
    ("Мария", "Кузнецова", "Сергеевна", "1985-08-20", "+7 (987) 654-3210"),
]
cursor.executemany(
    "INSERT INTO reader (first_name, last_name, patronymic, date_birth, contact) VALUES (?, ?, ?, ?, ?)",
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