"""
Voice Scam Guard — Python ML microservice

Exposes the AI/ML stages of the pipeline as simple HTTP endpoints that the
Node/Express backend calls (see backend/services/pipeline/*.js and
AI_SERVICE_URL in backend/.env).

Run:
    pip install -r requirements.txt
    python app.py
Then it listens on http://localhost:8000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

from features import extract_features
from voice_detector import detect_ai_voice
from behavior_analyzer import analyze_behavior
from transcriber import transcribe

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "voice-scam-guard-ml"})


@app.post("/extract-features")
def extract_features_route():
    data = request.get_json(silent=True) or {}
    file_path = data.get("filePath")
    if not file_path:
        return jsonify({"error": "filePath is required"}), 400
    try:
        features = extract_features(file_path)
        return jsonify(features)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.post("/detect-voice")
def detect_voice_route():
    data = request.get_json(silent=True) or {}
    features = data.get("features")

    if not isinstance(features, dict) or not features:
        return jsonify({"error": "features is required"}), 400

    try:
        result = detect_ai_voice(features)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/analyze-behavior")
def analyze_behavior_route():
    data = request.get_json(silent=True) or {}
    features = data.get("features")
    if not isinstance(features, dict) or not features:
        return jsonify({"error": "features is required"}), 400
    try:
        result = analyze_behavior(features)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/transcribe")
def transcribe_route():
    data = request.get_json(silent=True) or {}
    file_path = data.get("filePath")
    if not file_path:
        return jsonify({"error": "filePath is required"}), 400
    try:
        result = transcribe(file_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
