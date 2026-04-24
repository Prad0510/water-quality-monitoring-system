import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allows your React frontend to talk to this API

# --- LOAD THE BRAIN ---
try:
    model = joblib.load('water_model.pkl')
    medians = joblib.load('train_medians.pkl')
    feature_order = joblib.load('features.pkl')
    print("✅ AI Model and Preprocessing logic loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model files: {e}")

@app.route('/api/predict_potability', methods=['POST'])
def predict():
    try:
        # 1. Get raw input from React form
        raw_data = request.json.get('metrics', {})
        
        # 2. Convert to DataFrame for processing
        df = pd.DataFrame([raw_data])

        # 3. HANDLING MISSING VALUES (Imputation)
        # We use the medians saved from your Colab training
        for col, median_val in medians.items():
            if col not in df.columns or pd.isna(df[col][0]) or df[col][0] == "":
                df[col] = median_val

        # 4. FEATURE ENGINEERING (The "Specialization" Math)
        # Must match your Colab logic exactly
        df['Hardness_to_Solids'] = df['Hardness'] / (df['Solids'] + 1e-9)
        df['Sulfate_to_Conductivity'] = df['Sulfate'] / (df['Conductivity'] + 1e-9)
        df['ph_x_Turbidity'] = df['ph'] * df['Turbidity']
        
        # Bins (Categorical to Numerical logic)
        # If your model expects numerical bins, we map them here
        df['ph_bin'] = pd.cut(df['ph'], bins=[-np.inf, 6.5, 8.5, np.inf], labels=[0, 1, 2]).astype(int)
        df['Turbidity_bin'] = pd.cut(df['Turbidity'], bins=[-np.inf, 3, 5, np.inf], labels=[0, 1, 2]).astype(int)
        df['Solids_bin'] = pd.qcut(df['Solids'], q=4, labels=[0, 1, 2, 3], duplicates='drop').astype(int)

        # 5. ALIGN COLUMNS
        # Ensure the web data has the same 26 columns in the same order as training
        for col in feature_order:
            if col not in df.columns:
                df[col] = 0 # Safety for missing engineered features
        
        df = df[feature_order]

        # 6. AI PREDICTION
        prediction = int(model.predict(df)[0])
        probabilities = model.predict_proba(df)[0]
        confidence = float(probabilities[1] if prediction == 1 else probabilities[0])

        # 7. SPECIALIZED INSIGHTS
        # Logic to explain the result based on your findings
        insight = "All parameters are within typical ranges."
        if df['Sulfate'][0] > 400:
            insight = "High Sulfate levels detected; this is the primary risk factor."
        elif df['ph'][0] < 6.5 or df['ph'][0] > 8.5:
            insight = "Abnormal pH levels detected, affecting water stability."

        return jsonify({
            "potable": prediction,
            "confidence": round(confidence * 100, 2),
            "status": "Potable" if prediction == 1 else "Not Potable",
            "insight": insight,
            "model_type": "XGBoost (Recall-Optimized)"
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": "Failed to process data. Ensure all 9 metrics are sent."}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)