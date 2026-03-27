from flask import Blueprint, request, jsonify
from db import get_connection

auth_bp = Blueprint('auth_bp', __name__)

# ✅ SIGNUP
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (username, password, role)
            VALUES (%s, %s, %s)
        """, (data['username'], data['password'], data['role']))

        conn.commit()
        return jsonify({"message": "Signup successful"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# ✅ LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM users
        WHERE username = %s AND password = %s AND role = %s
    """, (data['username'], data['password'], data['role']))

    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401