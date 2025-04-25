from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import sqlite3
from config import DB_PATH

app = Flask(__name__)
CORS(app)

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
    return render_template('books.html')

# Страница со списком читателей
@app.route('/readers')
def readers_page():
    return render_template('readers.html')

# Страница выдачи и возврата книг
@app.route('/transactions')
def transactions_page():
    return render_template('transactions.html')

# Страница отчётов
@app.route('/reports')
def reports_page():
    return render_template('reports.html')

# Страница настроек
@app.route('/settings')
def settings_page():
    return render_template('settings.html')

###############################################################################################

# API Routes

@app.route('/api/metrics')
def get_metrics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 1. Всего книг в фонде (сумма всех quantity)
        cursor.execute('SELECT SUM(quantity) FROM book')
        total_books = cursor.fetchone()[0] or 0
        
        # 2. Книг в наличии (сумма quantity минус выданные)
        cursor.execute('''
            SELECT SUM(b.quantity) - COUNT(gb.id) 
            FROM book b
            LEFT JOIN given_book gb ON b.id = gb.book_id AND gb.return_date_fact IS NULL
        ''')
        available_books = cursor.fetchone()[0] or 0
        
        # 3. На руках у читателей
        cursor.execute('''
            SELECT COUNT(*) 
            FROM given_book 
            WHERE return_date_fact IS NULL
        ''')
        borrowed_books = cursor.fetchone()[0] or 0
        
        # 4. Требуют списания (книги с quantity <= 0)
        cursor.execute('SELECT COUNT(*) FROM book WHERE quantity <= 0')
        to_write_off = cursor.fetchone()[0] or 0
        
        # 5. Новые поступления (за последние 30 дней)
        cursor.execute('''
            SELECT COUNT(*) 
            FROM lading_bill 
            WHERE date >= date('now', '-30 days')
        ''')
        new_arrivals = cursor.fetchone()[0] or 0
        
        metrics = [
            {"title": "Всего книг в фонде", "value": f"{total_books:,}", "class": "primary"},
            {"title": "Книг в наличии", "value": f"{available_books:,}", "class": "success"},
            {"title": "На руках у читателей", "value": f"{borrowed_books:,}", "class": "info"},
            {"title": "Требуют списания", "value": f"{to_write_off:,}", "class": "warning"},
            {"title": "Новые поступления", "value": f"{new_arrivals:,}", "class": "danger"}
        ]
        
        return jsonify(metrics)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    finally:
        conn.close()
        
@app.route('/api/readers', methods=['POST'])
def add_reader():
    try:
        data = request.get_json()
        
        # Валидация данных
        required_fields = ['firstName', 'lastName', 'phone']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Не заполнены обязательные поля"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Вставка данных в БД
        cursor.execute('''
            INSERT INTO reader 
            (first_name, last_name, patronymic, date_birth, contact) 
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['firstName'],
            data['lastName'],
            data.get('patronymic', ''),
            data.get('birthdate', ''),
            data['phone']
        ))
        
        conn.commit()
        reader_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Читатель успешно зарегистрирован",
            "readerId": reader_id
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/readers/search', methods=['GET'])
def search_readers():
    try:
        search_query = request.args.get('query')
        
        if not search_query:
            return jsonify({"error": "Не указана строка для поиска"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Ищем в любом из полей: first_name, last_name, patronymic, contact
        cursor.execute('''
            SELECT * FROM reader 
            WHERE first_name LIKE ? 
               OR last_name LIKE ? 
               OR patronymic LIKE ? 
               OR contact LIKE ?
        ''', [f"%{search_query}%"] * 4)
        
        readers = cursor.fetchall()
        conn.close()
        
        readers_list = []
        for reader in readers:
            readers_list.append({
                "id": reader[0],
                "firstName": reader[1],
                "lastName": reader[2],
                "patronymic": reader[3],
                "birthdate": reader[4],
                "phone": reader[5]
            })
        
        return jsonify({
            "success": True,
            "readers": readers_list,
            "count": len(readers_list)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)