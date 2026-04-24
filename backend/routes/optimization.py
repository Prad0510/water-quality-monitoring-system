from flask import Blueprint, request, jsonify
from db import get_connection
import time

optimization_bp = Blueprint('optimization', __name__)

@optimization_bp.route('/query-metrics', methods=['GET'])
def get_query_metrics():
    # RBAC: Only Admin and Technician can see performance metrics
    role = request.headers.get("role")
    if role not in ["admin", "lab_technician"]:
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cur = conn.cursor()

    # We use EXPLAIN ANALYZE to get the real-world performance data
    # format JSON allows us to parse the time and scan type easily
    query = """
    EXPLAIN (ANALYZE, FORMAT JSON)
    SELECT * FROM testresult ORDER BY test_date DESC LIMIT 100;
    """
    
    try:
        # Prevent Postgres from preferring Seq Scan over Index Scan due to small table sizes
        cur.execute("SET enable_seqscan = off;")
        
        cur.execute(query)
        plan = cur.fetchone()[0] # PostgreSQL returns the plan as a list of dicts
        
        # Extracting key metrics from the plan
        execution_time = plan[0]['Execution Time']
        planning_time = plan[0]['Planning Time']

        def get_scan_node(node):
            node_type = node.get('Node Type', '')
            if 'Scan' in node_type:
                return node_type
            for child in node.get('Plans', []):
                res = get_scan_node(child)
                if res:
                    return res
            return node_type

        scan_type = get_scan_node(plan[0]['Plan'])

        cur.close()
        conn.close()

        return jsonify({
            "execution_time_ms": execution_time,
            "planning_time_ms": planning_time,
            "scan_type": scan_type,
            "explain_plan": plan
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500