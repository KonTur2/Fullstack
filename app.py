from flask import Flask, jsonify, request, render_template, redirect, url_for, flash, abort
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from flask_cors import CORS
from functools import wraps
import sqlite3
import os
from instance.fill_db import fill
from config import DB_PATH

app = Flask(__name__)
app.secret_key = 'SECRET'
CORS(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page'

# Wrapper for role management
def role_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated_view(*args, **kwargs):
            if not current_user.is_authenticated:
                return login_manager.unauthorized()
            if current_user.role not in roles:
                abort(403)  # доступ запрещен
            return f(*args, **kwargs)
        return decorated_view
    return wrapper


# Главная страница
@app.route('/')
@role_required('Библиотекарь', 'Бухгалтер', 'Администратор')
@login_required
def index():
    return render_template('/index.html', role=current_user.role)

# Страница книг
@app.route('/books')
@role_required('Библиотекарь', 'Администратор')
@login_required
def books_page():
    return render_template('books.html', role=current_user.role)

# Страница со списком читателей
@app.route('/readers')
@role_required('Библиотекарь', 'Администратор')
@login_required
def readers_page():
    return render_template('readers.html', role=current_user.role)

# Страница выдачи и возврата книг
@app.route('/transactions')
@role_required('Библиотекарь', 'Администратор')
@login_required
def transactions_page():
    return render_template('transactions.html', role=current_user.role)

# Страница отчётов
@app.route('/reports')
@role_required('Бухгалтер', 'Администратор')
@login_required
def reports_page():
    return render_template('reports.html', role=current_user.role)

# Страница настроек
@app.route('/settings')
@role_required('Администратор')
@login_required
def settings_page():
    return render_template('settings.html', role=current_user.role)

###############################################################################################

# API Routes

@login_manager.user_loader
def load_user(user_id):
    row = get_user_by_id(user_id)
    if row:
        return type('AnonUser', (UserMixin,), {
            'id': str(row[0]),
            'login': row[1],
            'role': row[3],
            'first_name': row[4],
            'last_name': row[5]
        })()
    return None


@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        login_ = request.form['login']
        password_ = request.form['password']
        user = get_user_by_login(login_)
        if user and user[2] == password_:
            user_obj = type('AnonUser', (UserMixin,), {
                'id': str(user[0]),
                'login': user[1],
                'role': user[3]  
            })()
            login_user(user_obj)
            return redirect(url_for('protected'))
        flash("Неверный логин или пароль")
    return render_template('login.html')


@app.route('/api/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        print(data)

        # Обязательные поля
        required_fields = ['firstName', 'lastName', 'patronymic', 'position', 'login', 'password']
        if not all(field in data and data[field] for field in required_fields):
            return jsonify({"error": "Не заполнены обязательные поля"}), 400

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Проверка уникальности логина
        cursor.execute("SELECT id FROM employee WHERE login = ?", (data['login'],))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Пользователь с таким логином уже существует"}), 409

        # Вставка нового пользователя
        cursor.execute('''
            INSERT INTO employee 
            (first_name, last_name, patronymic, position, login, password)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['firstName'],
            data['lastName'],
            data['patronymic'],
            data['position'],
            data['login'],
            data['password']  
        ))

        conn.commit()
        user_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "success": True,
            "message": "Пользователь успешно добавлен",
            "userId": user_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login_page'))

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    login_ = data.get('login')
    password_ = data.get('password')

    user = get_user_by_login(login_)
    if user and user[2] == password_:
        user_obj = type('AnonUser', (UserMixin,), {
            'id': str(user[0]),
            'login': user[1],
            'role': user[3]
        })()
        login_user(user_obj)
        return jsonify({'message': 'Успешный вход'}), 200
    else:
        return jsonify({'message': 'Неверный логин или пароль'}), 401

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
        print(data)
        
        # Валидация данных
        required_fields = ['firstName', 'lastName', 'phone', 'address', 'email', 'birthdate']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Не заполнены обязательные поля"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Вставка данных в БД
        cursor.execute('''
            INSERT INTO reader 
            (first_name, last_name, patronymic, date_birth, phone, address, email) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['firstName'],
            data['lastName'],
            data.get('patronymic', ''),
            data.get('birthdate', ''),
            data['phone'],
            data['address'],
            data['email']
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
               OR phone LIKE ?
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
                "phone": reader[5],
                "address": reader[6],
                "email": reader[7],
            })
        
        return jsonify({
            "success": True,
            "readers": readers_list,
            "count": len(readers_list)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
    
def get_user_by_login(login):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, login, password, position, first_name, last_name FROM employee WHERE login = ?", (login,))
    row = cursor.fetchone()
    conn.close()
    return row  # (id, login, password, position)

def get_user_by_id(user_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, login, password, position, first_name, last_name FROM employee WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row



if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        fill()
    app.run(debug=True)