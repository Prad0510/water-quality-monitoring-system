from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp)
from routes.testresult import testresult_bp
from routes.alert import alert_bp
from routes.optimization import optimization_bp
from routes.image_analysis import image_analysis_bp
from routes.admin import admin_bp

app.register_blueprint(testresult_bp)
app.register_blueprint(alert_bp)
app.register_blueprint(optimization_bp)
app.register_blueprint(image_analysis_bp)
app.register_blueprint(admin_bp)
if __name__ == "__main__":
    app.run(debug=True)