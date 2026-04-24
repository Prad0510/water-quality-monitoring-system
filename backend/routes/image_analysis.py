import os
import io
import base64
import numpy as np
import cv2
import easyocr
from ultralytics import YOLO
from flask import Blueprint, request, jsonify
from PIL import Image
from db import get_connection

image_analysis_bp = Blueprint('image_analysis', __name__)

# Load custom YOLOv8 model
print("Loading Ultra-fast Custom YOLOv8 model...")
try:
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'v8_plastic.pt')
    model = YOLO(model_path)
except Exception as e:
    print(f"Error loading YOLOv8 model: {e}")
    model = None

# Load EasyOCR for text clearing
print("Loading EasyOCR model for text removal...")
try:
    reader = easyocr.Reader(['en']) 
except Exception as e:
    print(f"Error loading EasyOCR: {e}")
    reader = None

@image_analysis_bp.route('/api/analyze_image', methods=['POST'])
def analyze_image():
    if model is None:
        return jsonify({"error": "Model not loaded properly on the server."}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read the image file and ensure it is RGB
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # --- Text Clear Processing ---
        if reader is not None:
            # Convert PIL Image to Numpy array
            img_np = np.array(img)
            
            # Read text from image
            text_detections = reader.readtext(img_np)
            
            # Mask out text to prevent false positive plastic detections
            for (bbox, text, prob) in text_detections:
                # Bounding box points: top-left, top-right, bottom-right, bottom-left
                tl = (int(min(bbox[0][0], bbox[3][0])), int(min(bbox[0][1], bbox[1][1])))
                br = (int(max(bbox[1][0], bbox[2][0])), int(max(bbox[2][1], bbox[3][1])))
                
                # Fill rectangle with nearest color or black to hide text
                cv2.rectangle(img_np, tl, br, (0, 0, 0), -1)
                print(f"Cleared detected text: '{text}' at {tl}-{br}")
                
            # Convert back to PIL Image
            img = Image.fromarray(img_np)
        # ----------------------------

        # Perform inference with custom parameters via YOLOv8 native syntax
        results = model(img, imgsz=1024, conf=0.1, iou=0.5, max_det=100)
        
        # YOLOv8 returns a list of result objects for each image fed in (we fed 1 image)
        result = results[0]

        print("--- YOLOv8 Detections ---")
        print(f"Items detected: {len(result.boxes)}")
        print("-----------------------")
        
        # --- SEVERITY SCORE PARAMETERS ---
        plastic_count = len(result.boxes)
        total_image_area = img.width * img.height
        total_bbox_area = 0
        
        # Calculate the area of all bounding boxes
        if result.boxes is not None:
            for box in result.boxes.xyxy:  # box is [xmin, ymin, xmax, ymax]
                width = float(box[2] - box[0])
                height = float(box[3] - box[1])
                total_bbox_area += (width * height)
            
        # Calculate coverage percentage
        coverage_percent = (total_bbox_area / total_image_area) * 100 if total_image_area > 0 else 0
        
        # Severity Formula: 
        calculated_severity = (plastic_count * 5) + (coverage_percent * 2) 
        severity = min(100, int(calculated_severity))

        if severity == 0:
            pollution_level = "Safe"
        elif severity <= 30:
            pollution_level = "Moderate"
        else:
            pollution_level = "Severe"

        # Render the bounding boxes on the image
        annotated_img_arr = result.plot()  # Returns a numpy array in BGR format
        
        # Convert annotated BGR image array to RGB, then to PIL Image to base64
        annotated_img_rgb = annotated_img_arr[..., ::-1] # Reverse color channels BGR -> RGB
        annotated_img = Image.fromarray(annotated_img_rgb)
        
        buffered = io.BytesIO()
        annotated_img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        response_data = {
            "plastic_count": plastic_count,
            "pollution_level": pollution_level,
            "severity_score": severity,
            "annotated_image": f"data:image/jpeg;base64,{img_str}",
            "dataset_info": "Custom YOLOv8 Model (v8_plastic.pt)",
            "log_id": None
        }
        
        # Save to database
        try:
            conn = get_connection("central")
            if conn:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO ai_pollution_log (plastic_count, severity_score, pollution_level)
                    VALUES (%s, %s, %s) RETURNING log_id;
                """, (plastic_count, severity, pollution_level))
                
                log_id = cur.fetchone()[0]
                conn.commit()
                response_data["log_id"] = log_id
                
                cur.close()
                conn.close()
                print(f"✅ Saved AI Detection to DB. Log ID: {log_id}")
        except Exception as db_err:
            print(f"⚠️ Error saving detection to database: {db_err}")

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({"error": str(e)}), 500

