from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from routes.testresult import testresult_bp
from routes.alert import alert_bp
from routes.optimization import optimization_bp

app.register_blueprint(testresult_bp)
app.register_blueprint(alert_bp)
app.register_blueprint(optimization_bp)

if __name__ == "__main__":
    app.run(debug=True)