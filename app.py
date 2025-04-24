from flask import Flask, jsonify, request, render_template
import sqlite3

app = Flask(__name__)

# Подключение к базе данных
def get_db_connection():
    conn = sqlite3.connect('instance/sqlite.db')
    conn.row_factory = sqlite3.Row 
    return conn

# Главная страница
@app.route('/')
def index():
    return render_template('/index.html')

# Маршрут для получения списка всех книг
@app.route('/books')
def books_page():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT book.*, author.first_name, author.last_name, genre.name as genre_name
        FROM book
        JOIN author ON book.author_id = author.id
        JOIN genre ON book.genre_id = genre.id
    ''')
    books = cursor.fetchall()
    conn.close()
    
    return render_template('books.html', books=books)

# Страница со списком читателей
@app.route('/readers')
def readers_page():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM reader')
    readers = cursor.fetchall()
    conn.close()
    return render_template('readers.html', readers=readers)

# Страница выдачи и возврата книг
@app.route('/transactions')
def transactions_page():
    conn = get_db_connection()
    cursor = conn.cursor()
    # cursor.execute('SELECT * FROM reader')
    # readers = cursor.fetchall()
    conn.close()
    return render_template('transactions.html')

# Страница отчётов
@app.route('/reports')
def reports_page():
    conn = get_db_connection()
    cursor = conn.cursor()
    # cursor.execute('SELECT * FROM reader')
    # readers = cursor.fetchall()
    conn.close()
    return render_template('reports.html')

# Страница настроек
@app.route('/settings')
def settings_page():
    conn = get_db_connection()
    cursor = conn.cursor()
    # cursor.execute('SELECT * FROM reader')
    # readers = cursor.fetchall()
    conn.close()
    return render_template('settings.html')

if __name__ == '__main__':
    app.run(debug=True)