import os
from ultralytics import YOLO

# ==============================================================================
# STEP 1: DOWNLOAD YOUR DATASET
# ==============================================================================
# 1. Create a free account at https://universe.roboflow.com
# 2. Search for "Floating Trash" or "Floating Plastic"
# 3. Click "Download Dataset" and select "YOLOv8" format.
# 4. Roboflow will give you a code snippet to paste below.
# 
# Install the roboflow package first in your terminal: 
#    pip install roboflow
#
# Paste your Roboflow snippet here (it will look something like this):
#
# from roboflow import Roboflow
# rf = Roboflow(api_key="YOUR_SECRET_API_KEY")
# project = rf.workspace("workspace-name").project("project-name")
# version = project.version(1)
# dataset = version.download("yolov8")


# ==============================================================================
# STEP 2: TRAIN YOLOv8
# ==============================================================================
def train_model():
    print("Initializing YOLOv8n model...")
    # Load the lightweight YOLOv8 Nano model
    model = YOLO('yolov8n.pt')
    
    # ⚠️ IMPORTANT: Replace 'dataset_name' with the folder name Roboflow downloaded!
    # E.g., if it downloaded to 'Floating-Trash-1', adjust the path below:
    # data_yaml_path = 'Floating-Trash-1/data.yaml'
    data_yaml_path = 'REPLACE_ME_WITH_ROBOFLOW_FOLDER_NAME/data.yaml'
    
    if not os.path.exists(data_yaml_path):
        print(f"Error: Could not find {data_yaml_path}.")
        print("Please paste your Roboflow snippet in STEP 1 to download the data first!")
        return
        
    print(f"Starting training on dataset: {data_yaml_path}")
    
    # Start training!
    # epochs=50 is a good starting point. imgsz=640 is standard YOLO resolution.
    model.train(
        data=data_yaml_path,
        epochs=50,          # How many times the model sees the entire dataset
        imgsz=640,          # Resize images to 640x640 during training
        batch=16,           # How many images to process at once
        name='water_trash_model' # This will save results to runs/detect/water_trash_model
    )
    
    print("Training Complete!")
    print("Your new fine-tuned model is saved at: runs/detect/water_trash_model/weights/best.pt")

if __name__ == '__main__':
    train_model()
