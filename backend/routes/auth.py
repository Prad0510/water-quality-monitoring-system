from flask import Blueprint, request, jsonify
from db import get_connection

auth_bp = Blueprint('auth_bp', __name__)

# ✅ SIGNUP
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    role = data.get('role', 'public')
    # Default admin to true, log tech to false
    is_approved = True if role == 'admin' else False
    assigned_region = data.get('assigned_region', 'central')

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (username, password, role, assigned_region, is_approved)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['username'], data['password'], role, assigned_region, is_approved))

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
    role = data.get('role')

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT username, role, assigned_region, is_approved FROM users
        WHERE username = %s AND password = %s AND role = %s
    """, (data['username'], data['password'], role))

    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        username, user_role, assigned_region, is_approved = user

        if user_role == 'lab_technician' and not is_approved:
            return jsonify({"error": "Account pending admin approval"}), 403

        return jsonify({
            "message": "Login successful",
            "assigned_region": assigned_region,
            "is_approved": is_approved
        })
    else:
        return jsonify({"error": "Invalid credentials"}), 401