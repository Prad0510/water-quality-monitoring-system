from flask import request, jsonify, Blueprint
from db import get_connection
import joblib
import pandas as pd
import numpy as np
import os

testresult_bp = Blueprint('testresult', __name__)

# --- LOAD THE BRAIN ---
try:
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'water_model.pkl')
    medians_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'train_medians.pkl')
    features_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'features.pkl')
    
    model = joblib.load(model_path)
    medians = joblib.load(medians_path)
    feature_order = joblib.load(features_path)
    print("[SUCCESS] AI Model and Preprocessing logic loaded successfully.")
    
    try:
        import shap
        shap_explainer = shap.TreeExplainer(model)
        print("[SUCCESS] SHAP Explainer initialized.")
    except Exception as e:
        shap_explainer = None
        print(f"[WARNING] SHAP failed: {e}")

except Exception as e:
    model = None
    medians = None
    feature_order = None
    shap_explainer = None
    print(f"[ERROR] Error loading model files: {e}")

@testresult_bp.route('/api/predict_potability', methods=['POST'])
def predict_potability():
    try:
        raw_data = request.json.get('metrics', {})
        pollution_log_id = raw_data.pop('pollution_log_id', None)
        df = pd.DataFrame([raw_data])

        for col, median_val in medians.items():
            if col not in df.columns or pd.isna(df[col][0]) or df[col][0] == "":
                df[col] = median_val

        df['Hardness_to_Solids'] = df['Hardness'] / (df['Solids'] + 1e-9)
        df['Sulfate_to_Conductivity'] = df['Sulfate'] / (df['Conductivity'] + 1e-9)
        df['ph_x_Turbidity'] = df['ph'] * df['Turbidity']
        
        df['ph_bin'] = pd.cut(df['ph'], bins=[-np.inf, 6.27767, 7.38531, 8.92451, np.inf], labels=[0, 1, 2, 3]).astype(int)
        df['Turbidity_bin'] = pd.cut(df['Turbidity'], bins=[-np.inf, 3.43971, 3.95502, 4.50031, np.inf], labels=[0, 1, 2, 3]).astype(int)
        df['Solids_bin'] = pd.cut(df['Solids'], bins=[-np.inf, 15666.69, 20927.83, 27332.76, np.inf], labels=[0, 1, 2, 3]).astype(int)

        for col in feature_order:
            if col not in df.columns:
                df[col] = 0
        
        df = df[feature_order]
        prediction = int(model.predict(df)[0])
        probabilities = model.predict_proba(df)[0]
        confidence = float(probabilities[1] if prediction == 1 else probabilities[0])

        # Feature Importance Extraction via SHAP
        explainability = []
        if shap_explainer is not None:
            sv = shap_explainer.shap_values(df)
            if isinstance(sv, list):
                sv = sv[1] # Handle multi-class / list structural fallback
            sv_row = sv[0] if len(sv.shape) == 2 else sv
            
            impacts = []
            for i, feat in enumerate(feature_order):
                # Filter out pure binary bins or engineered names for clean UI if desired,
                # but returning exact features is fine.
                impacts.append({"feature": feat, "impact": float(sv_row[i])})
                
            # Highest absolute impact first
            impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
            explainability = impacts[:4]

        insight = "All parameters are within typical ranges."
        if df['Sulfate'][0] > 400:
            insight = "High Sulfate levels detected; this is the primary risk factor."
        elif df['ph'][0] < 6.5 or df['ph'][0] > 8.5:
            insight = "Abnormal pH levels detected, affecting water stability."

        # --- LATE FUSION OVERRIDE LOGIC ---
        if pollution_log_id:
            try:
                conn_fusion = get_connection("central")
                if conn_fusion:
                    cur_fusion = conn_fusion.cursor()
                    cur_fusion.execute("SELECT plastic_count, severity_score, pollution_level FROM ai_pollution_log WHERE log_id = %s", (pollution_log_id,))
                    log_row = cur_fusion.fetchone()
                    if log_row:
                        p_count, s_score, p_level = log_row
                        if p_count > 0:
                            prediction = 0
                            confidence = min(99.9, 50.0 + float(s_score))
                            insight = f"Chemicals were stable, but Severe Surface Pollution ({p_count} plastic items detected) immediately violates potability standards."
                            explainability.insert(0, {
                                "feature": "Visual Surface Plastics",
                                "impact": -float(s_score)
                            })
                    cur_fusion.close()
                    conn_fusion.close()
            except Exception as fuse_err:
                print(f"Fusion Error: {fuse_err}")

        return jsonify({
            "potable": prediction,
            "confidence": round(confidence * 100, 2),
            "status": "Potable" if prediction == 1 else "Not Potable",
            "insight": insight,
            "explainability": explainability,
            "model_type": "XGBoost + YOLOv8 Fusion"
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": "Failed to process data. Ensure all 9 metrics are sent."}), 400


@testresult_bp.route('/testresults', methods=['GET', 'POST'])
def handle_testresults():
    # 🌍 DISTRIBUTED LOGIC: Capture 'region' from URL (?region=govelli)
    # Defaults to 'central' if not provided
    region = request.args.get("region", "central")
    
    conn = get_connection(region)
    if not conn:
        return jsonify({"error": f"Node '{region}' is unreachable or offline"}), 503
        
    cur = conn.cursor()
    role = request.headers.get("role")

    # --- 1. HANDLE POST: ADD NEW TEST RESULT TO SPECIFIC NODE ---
    if request.method == 'POST':
        if role not in ["admin", "lab_technician"]:
            return jsonify({"error": "Unauthorized"}), 403
            
        assigned_region = request.headers.get("assigned-region")
        if role == "lab_technician" and region != assigned_region:
            return jsonify({"error": f"Unauthorized: You can only post to {assigned_region}"}), 403
        
        try:
            data = request.json
            sample_id = data.get('sample_id')
            ph = data.get('ph')
            hardness = data.get('Hardness', data.get('hardness'))
            solids = data.get('Solids', data.get('solids'))
            chloramines = data.get('Chloramines', data.get('chloramines'))
            sulfate = data.get('Sulfate', data.get('sulfate'))
            conductivity = data.get('Conductivity', data.get('conductivity'))
            organic_carbon = data.get('Organic_carbon', data.get('organic_carbon'))
            trihalomethanes = data.get('Trihalomethanes', data.get('trihalomethanes'))
            turbidity = data.get('Turbidity', data.get('turbidity'))
            test_date = data.get('test_date')

            # --- AUTO POTABILITY ENGINE (ML MODEL) ---
            if model is not None:
                raw_data = {
                    'ph': float(ph) if ph else np.nan,
                    'Hardness': float(hardness) if hardness else np.nan,
                    'Solids': float(solids) if solids else np.nan,
                    'Chloramines': float(chloramines) if chloramines else np.nan,
                    'Sulfate': float(sulfate) if sulfate else np.nan,
                    'Conductivity': float(conductivity) if conductivity else np.nan,
                    'Organic_carbon': float(organic_carbon) if organic_carbon else np.nan,
                    'Trihalomethanes': float(trihalomethanes) if trihalomethanes else np.nan,
                    'Turbidity': float(turbidity) if turbidity else np.nan
                }
                df = pd.DataFrame([raw_data])
                for col, median_val in medians.items():
                    if col not in df.columns or pd.isna(df[col][0]) or df[col][0] == "":
                        df[col] = median_val
                df['Hardness_to_Solids'] = df['Hardness'] / (df['Solids'] + 1e-9)
                df['Sulfate_to_Conductivity'] = df['Sulfate'] / (df['Conductivity'] + 1e-9)
                df['ph_x_Turbidity'] = df['ph'] * df['Turbidity']
                df['ph_bin'] = pd.cut(df['ph'], bins=[-np.inf, 6.27767, 7.38531, 8.92451, np.inf], labels=[0, 1, 2, 3]).astype(int)
                df['Turbidity_bin'] = pd.cut(df['Turbidity'], bins=[-np.inf, 3.43971, 3.95502, 4.50031, np.inf], labels=[0, 1, 2, 3]).astype(int)
                df['Solids_bin'] = pd.cut(df['Solids'], bins=[-np.inf, 15666.69, 20927.83, 27332.76, np.inf], labels=[0, 1, 2, 3]).astype(int)
                for col in feature_order:
                    if col not in df.columns: df[col] = 0
                df = df[feature_order]
                prediction = int(model.predict(df)[0])
                status = "Safe" if prediction == 1 else "Unsafe"
            else:
                # Fallback Basic WHO-inspired heuristics
                is_safe = True
                if ph and (float(ph) < 6.5 or float(ph) > 8.5): is_safe = False
                if solids and float(solids) > 1000: is_safe = False # TDS limit
                if chloramines and float(chloramines) > 4: is_safe = False
                if sulfate and float(sulfate) > 250: is_safe = False
                if turbidity and float(turbidity) > 5: is_safe = False
                if trihalomethanes and float(trihalomethanes) > 80: is_safe = False
                status = "Safe" if is_safe else "Unsafe"
                
            pollution_log_id = data.get('pollution_log_id')
            if pollution_log_id:
                try:
                    conn_cen = get_connection("central")
                    if conn_cen:
                        cur_cen = conn_cen.cursor()
                        cur_cen.execute("SELECT plastic_count FROM ai_pollution_log WHERE log_id = %s", (pollution_log_id,))
                        log_row = cur_cen.fetchone()
                        if log_row and log_row[0] > 0:
                            status = "Unsafe"
                        cur_cen.close()
                        conn_cen.close()
                except Exception as e:
                    print(f"Post fusion error: {e}")

            cur.execute("""
                INSERT INTO testresult (
                    sample_id, ph, hardness, solids, chloramines, 
                    sulfate, conductivity, organic_carbon, trihalomethanes, 
                    turbidity, potability, test_date
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, NOW()))
                RETURNING result_id;
            """, (
                sample_id, ph, hardness, solids, chloramines, 
                sulfate, conductivity, organic_carbon, trihalomethanes, 
                turbidity, status, test_date
            ))

            new_id = cur.fetchone()[0]
            conn.commit()
            return jsonify({
                "message": f"Inserted successfully into {region} node", 
                "result_id": new_id,
                "node": region,
                "status_calculated": status
            }), 201

        except Exception as e:
            print(f"POST Error ({region}): {e}")
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()

    # --- 2. HANDLE GET: FETCH FROM SPECIFIC NODE WITH FILTERS ---
    assigned_region = request.headers.get("assigned-region")
    if role == "lab_technician" and region != assigned_region:
        return jsonify({"error": f"Unauthorized: You can only view {assigned_region}"}), 403

    try:
        filter_status = request.args.get("filter", "all")
        sort_column = request.args.get("sort", "test_date")
        sort_order = request.args.get("order", "DESC")
        search_term = request.args.get("search", "")

        # Support the new column names for sorting
        allowed_columns = ["test_date", "ph", "hardness", "solids", "chloramines", "sulfate", "conductivity", "organic_carbon", "trihalomethanes", "turbidity", "potability", "status", "result_id", "sample_id"]
        if sort_column not in allowed_columns:
            sort_column = "test_date"

        # 🌟 DISTRIBUTED ARCHITECTURE: Unified View via FDW
        # If the user asks for national view, we query the unified view
        table_to_query = "national_testresults_view" if region == "national" else "testresult"

        # Schema drift: Kaggle 'central' uses potability, whereas L2 nodes & unified view rely on 'status'
        target_col = "potability" if region == "central" else "status"

        if role == "public":
            query = f"SELECT * FROM {table_to_query} WHERE {target_col} = 'Safe'"
        else:
            if filter_status == "all":
                query = f"SELECT * FROM {table_to_query} WHERE 1=1"
            else:
                query = f"SELECT * FROM {table_to_query} WHERE {target_col} = '{filter_status}'"

        query_params = []
        if search_term:
            query += " AND sample_id::text ILIKE %s"
            query_params.append(f"%{search_term}%")

        query += f" ORDER BY {sort_column} {sort_order} LIMIT 10"

        if query_params:
            cur.execute(query, tuple(query_params))
        else:
            cur.execute(query)
        columns = [desc[0] for desc in cur.description]
        results = []
        for row in cur.fetchall():
            res_dict = dict(zip(columns, row))
            # Seamless conversion so frontend TestResults.tsx array parser never fails
            if "status" in res_dict and "potability" not in res_dict:
                res_dict["potability"] = res_dict.pop("status")
            results.append(res_dict)

        # Include the node name in the response so the dashboard can display it
        for res in results:
            res['node_location'] = region

        return jsonify(results)

    except Exception as e:
        print(f"GET Error ({region}): {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if not conn.closed:
            cur.close()
            conn.close()


# --- 3. TIME SERIES ANALYTICS ENDPOINT ---
@testresult_bp.route('/testresults/timeseries', methods=['GET'])
def timeseries():
    region = request.args.get("region", "national")
    metric = request.args.get("metric", "ph")
    interval = request.args.get("interval", "day")  # e.g., 'hour', 'day', 'week', 'month'
    
    # FDW handles national mapping via central connection
    conn = get_connection("central") if region == "national" else get_connection(region)
    if not conn:
        return jsonify({"error": "Node offline"}), 503
        
    valid_metrics = ["ph", "hardness", "solids", "chloramines", "sulfate", "conductivity", "organic_carbon", "trihalomethanes", "turbidity"]
    if metric not in valid_metrics: 
        metric = "ph"
        
    valid_intervals = ["second", "minute", "hour", "day", "week", "month"]
    if interval not in valid_intervals: 
        interval = "day"

    table_name = "national_testresults_view" if region == "national" else "testresult"

    try:
        cur = conn.cursor()
        # SQL aggregation dynamically bucketing by time interval
        query = f"""
            SELECT 
                DATE_TRUNC(%s, test_date) as time_bucket,
                AVG({metric}) as avg_value,
                MIN({metric}) as min_value,
                MAX({metric}) as max_value,
                COUNT(*) as sample_count
            FROM {table_name}
            WHERE test_date IS NOT NULL AND {metric} IS NOT NULL
            GROUP BY time_bucket
            ORDER BY time_bucket ASC
            LIMIT 100
        """
        cur.execute(query, (interval,))
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in cur.fetchall()]
        
        # Serialize timestamps
        for r in results:
            if r['time_bucket']:
                # Simplify string output based on interval
                if interval in ['day', 'week', 'month']:
                    format_str = '%Y-%m-%d'
                elif interval == 'minute':
                    format_str = '%Y-%m-%d %H:%M'
                elif interval == 'second':
                    format_str = '%H:%M:%S'
                else:
                    format_str = '%Y-%m-%d %H:%M'
                r['time_bucket'] = r['time_bucket'].strftime(format_str)
                # Convert decimals to floats
                r['avg_value'] = float(r['avg_value']) if r['avg_value'] else 0
                r['min_value'] = float(r['min_value']) if r['min_value'] else 0
                r['max_value'] = float(r['max_value']) if r['max_value'] else 0

        return jsonify(results)
    except Exception as e:
        print(f"TimeSeries Error ({region}): {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if not conn.closed:
            cur.close()
            conn.close()


# --- 5. MARKOV CHAIN FORECASTING ENDPOINT ---
@testresult_bp.route('/testresults/markov_forecast', methods=['GET'])
def markov_forecast():
    region = request.args.get("region", "national")
    steps_str = request.args.get("steps", "7")
    try:
        steps = int(steps_str)
    except ValueError:
        steps = 7

    conn = get_connection("central") if region == "national" else get_connection(region)
    if not conn:
        return jsonify({"error": "Node offline"}), 503

    table_name = "national_testresults_view" if region == "national" else "testresult"

    try:
        cur = conn.cursor()
        
        # Schema drift handling: unified view uses 'status'
        target_col = "status" if region == "national" else "potability"
            
        query = f"""
            SELECT DATE_TRUNC('day', test_date) as day, 
                   MODE() WITHIN GROUP (ORDER BY {target_col}) as prevailing_state
            FROM {table_name}
            WHERE test_date IS NOT NULL AND {target_col} IS NOT NULL
            GROUP BY day
            ORDER BY day ASC;
        """
        cur.execute(query)
        rows = cur.fetchall()
        
        if not rows:
            return jsonify({"error": "Insufficient historical data for forecasting"}), 400

        # Construct transition counts
        transition_counts = {
            "Safe": {"Safe": 0, "Unsafe": 0},
            "Unsafe": {"Safe": 0, "Unsafe": 0}
        }
        
        last_state = None
        for row in rows:
            day, state = row
            norm_state = "Safe" if state == "Safe" else "Unsafe"
            
            if last_state is not None:
                transition_counts[last_state][norm_state] += 1
            last_state = norm_state

        if last_state is None:
            last_state = "Safe"

        # Calculate empirical probabilities
        P = {"Safe": {"Safe": 0.5, "Unsafe": 0.5}, "Unsafe": {"Safe": 0.5, "Unsafe": 0.5}}
        
        for s1 in ["Safe", "Unsafe"]:
            total = transition_counts[s1]["Safe"] + transition_counts[s1]["Unsafe"]
            if total > 0:
                P[s1]["Safe"] = transition_counts[s1]["Safe"] / total
                P[s1]["Unsafe"] = transition_counts[s1]["Unsafe"] / total

        # Markov Projection (N steps)
        current_probs = {"Safe": 1.0, "Unsafe": 0.0} if last_state == "Safe" else {"Safe": 0.0, "Unsafe": 1.0}
        
        forecast = []
        for i in range(1, steps + 1):
            next_safe = current_probs["Safe"] * P["Safe"]["Safe"] + current_probs["Unsafe"] * P["Unsafe"]["Safe"]
            next_unsafe = current_probs["Safe"] * P["Safe"]["Unsafe"] + current_probs["Unsafe"] * P["Unsafe"]["Unsafe"]
            current_probs["Safe"] = next_safe
            current_probs["Unsafe"] = next_unsafe
            
            forecast.append({
                "step": f"Day {i}",
                "safe_probability": round(next_safe * 100, 2),
                "unsafe_probability": round(next_unsafe * 100, 2)
            })

        return jsonify({
            "transition_matrix": P,
            "forecast": forecast
        })

    except Exception as e:
        print(f"Markov Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if not conn.closed:
            cur.close()
            conn.close()


# --- 4. DISTRIBUTED STATION MAPPING ---
@testresult_bp.route('/station-results', methods=['GET'])
def station_results():
    region = request.args.get("region", "central")
    conn = get_connection(region)
    if not conn:
        return jsonify({"error": "Node offline"}), 503
        
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                ms.station_id,
                ms.location,
                ws.sample_id,
                tr.result_id,
                tr.potability
            FROM monitoringstation ms
            JOIN watersample ws ON ms.station_id = ws.station_id
            JOIN testresult tr ON ws.sample_id = tr.sample_id;
        """)
        columns = [desc[0] for desc in cur.description]
        result = [dict(zip(columns, row)) for row in cur.fetchall()]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()