# Main entry point of the Flask app
import os
from flask import Flask, render_template, jsonify
from routes.analyze_routes import analyze_bp
from routes.session_routes import session_bp

app = Flask(__name__)

# Security & reliability config
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'krishi-dev-secret')
# Block uploads larger than 16 MB to prevent DoS via large file attacks.
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

# Register blueprints
app.register_blueprint(analyze_bp)
app.register_blueprint(session_bp)

# Handle 413 (file too large) gracefully instead of crashing
@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({"error": "File is too large. Maximum upload size is 16 MB."}), 413

@app.route('/')
def index():
    """Serve the landing page"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Serve the dashboard page"""
    return render_template('dashboard.html')


@app.route('/pest-detection')
def pest_detection():
    """Serve the pest detection page"""
    return render_template('pest-detection.html')

@app.route('/crop-advisory')
def crop_advisory():
    """Serve the crop advisory page"""
    return render_template('crop-advisory.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')