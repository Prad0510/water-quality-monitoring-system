from flask import Blueprint, jsonify
from db import get_connection

optimization_bp = Blueprint('optimization', __name__)

@optimization_bp.route('/query-plan', methods=['GET'])
def query_plan():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        EXPLAIN ANALYZE
        SELECT *
        FROM testresult
        WHERE parameter_id = 1;
    """)

    result = cur.fetchall()

    # Convert tuple → string list
    plan = [row[0] for row in result]

    cur.close()
    conn.close()

    return jsonify(plan)