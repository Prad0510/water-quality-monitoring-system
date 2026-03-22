from flask import Blueprint, jsonify
from db import get_connection

alert_bp = Blueprint('alert', __name__)

@alert_bp.route('/alerts', methods=['GET'])
def get_alerts():
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM alert;")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)