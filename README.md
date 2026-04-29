# Water Quality Monitoring System 💧

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)

A scalable, distributed, and AI-powered Water Quality Monitoring System that provides real-time evaluations of water potability using combined chemical and visual data. 

This project aims to revolutionize the way water quality is tracked, reported, and verified across distributed geographic zones by combining Web Technologies and Machine Learning.

## 🌟 Key Features

*   **Distributed Database Architecture:** Utilizes PostgreSQL Foreign Data Wrappers (FDW) to create a multi-tiered network (L1 Central Hub, L2 Regional Labs like `lab_thane` & `lab_vasai`).
*   **AI-Powered Predictions:**
    *   **XGBoost:** Analyzes chemical compositions (pH, Sulfates, Conductivity) to predict potability.
    *   **YOLOv8:** Computer vision model trained to detect visual anomalies and particulate matter from water sample images.
    *   **Decision-Level Late Fusion:** Combines chemical and visual predictions for high-confidence final potability status.
*   **Explainable AI (XAI):** Integration of SHAP (SHapley Additive exPlanations) values to provide trust and transparency on why a sample was deemed safe or unsafe.
*   **Dynamic Dashboards:** React-based single-page application (SPA) offering dedicated portals for both the public and laboratory staff.
*   **Real-time Tracking:** End-to-end digitization eliminating manual bottlenecks in traditional laboratory pipelines.

## 🏗️ System Architecture

### Frontend (User Interface)
*   React with Vite for extremely fast compilation.
*   TailwindCSS for modern, responsive, and dynamic styling.
*   Specialized charting libraries for rendering AI metrics and SHAP beeswarm graphs.

### Backend (API & Inference Engine)
*   RESTful API built with Flask (Python).
*   Handles high-frequency telemetry and complex AI inference routing.
*   Text filtering preprocessing pipelines for object detection.

### Database (Distributed Persistence)
*   PostgreSQL 14+ natively supporting `postgres_fdw`.
*   Partitioned inheritance schema. Data belongs to regional nodes geographically while aggregating globally for L1 central analysis.

## 🚀 Installation & Setup (Local Development)

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   PostgreSQL 14+
*   Git

### 1. Database Configuration
Enable PostgreSQL FDW and set up the local lab databases.
```sql
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
-- Set up lab_thane, lab_vasai databases alongside central hub
-- Map foreign tables across connections
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
# Install dependencies
pip install -r requirements.txt
# Run the Flask server
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install
# Start development server
npm run dev
```

## 🧠 Machine Learning Models

*   **XGBoost:** Selected over Random Forest for its superior handling of unstructured NaN values and imbalanced target classes in tabular environmental datasets (trained using SMOTE).
*   **YOLOv8:** Single-shot target detector (Ultralytics/PyTorch) chosen over R-CNNs for rapid, real-time bounding box framing of visual impurities. 

## 🗺️ Roadmap / Further Improvements
*   [ ] Direct IoT Edge integration (Raspberry Pi/Arduino sensors).
*   [ ] Containerize the entire cluster setup using Docker/docker-compose to simulate FDW completely.
*   [ ] Enhanced role-based access control (RBAC) across local labs vs central administrators.

## 📄 License
This project was developed as a Bachelor of Engineering Specialization Project for the Department of Computer Engineering.
