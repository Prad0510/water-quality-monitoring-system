from flask import request, jsonify, Blueprint
from db import get_connection

testresult_bp = Blueprint('testresult', __name__)

@testresult_bp.route('/testresults', methods=['GET'])
def get_testresults():

        role = request.headers.get("role")
        
        conn = get_connection()
        cur = conn.cursor()
        
        if role == "public":
            cur.execute("SELECT * FROM testresult WHERE status = 'Safe';")
        else:
            cur.execute("SELECT * FROM testresult;")

        rows = cur.fetchall()
        
        columns = [desc[0] for desc in cur.description]
        result = [dict(zip(columns, row)) for row in rows]

        cur.close()
        conn.close()

        return jsonify(result)

@testresult_bp.route('/testresults', methods=['POST'])
def add_testresult():
    role = request.headers.get("role")
    if role not in ["admin", "lab_technician"]:
        return {"error": "Unauthorized"}, 403
    try:
        data = request.json

        required_fields = ['sample_id', 'parameter_id', 'value', 'status', 'test_date']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO testresult (sample_id, parameter_id, value, status, test_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING result_id;
        """, (
            data['sample_id'],
            data['parameter_id'],
            data['value'],
            data['status'],
            data['test_date']
        ))

        new_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "message": "Inserted successfully",
            "result_id": new_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500