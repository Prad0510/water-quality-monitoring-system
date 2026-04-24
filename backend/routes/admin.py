from flask import Blueprint, request, jsonify
from db import get_connection

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/admin/pending_users', methods=['GET'])
def get_pending_users():
    role = request.headers.get("role")
    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
        
    conn = get_connection()
    if not conn:
         return jsonify({"error": "Database error"}), 500
         
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT username, role, assigned_region, is_approved FROM users
            WHERE role = 'lab_technician' AND is_approved = FALSE
        """)
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in cur.fetchall()]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@admin_bp.route('/admin/approve_user', methods=['POST'])
def approve_user():
    role = request.headers.get("role")
    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.json
    username = data.get("username")
    
    conn = get_connection()
    if not conn:
         return jsonify({"error": "Database error"}), 500
         
    cur = conn.cursor()
    try:
        cur.execute("UPDATE users SET is_approved = TRUE WHERE username = %s AND role = 'lab_technician'", (username,))
        conn.commit()
        return jsonify({"message": f"User {username} approved successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
