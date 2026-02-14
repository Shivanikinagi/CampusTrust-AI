"""
CampusTrust AI - AI Backend Server
=====================================
Flask API server providing AI services for the campus
governance platform on Algorand.

Endpoints:
- POST /api/ai/sentiment       - Analyze feedback sentiment
- POST /api/ai/sentiment/batch  - Batch sentiment analysis
- POST /api/ai/anomaly         - Detect attendance anomalies
- POST /api/ai/anomaly/class   - Class-wide anomaly analysis
- POST /api/ai/nlp/keyphrases  - Extract key phrases
- POST /api/ai/nlp/similarity  - Compute text similarity
- POST /api/ai/nlp/summarize   - Summarize text
- POST /api/ai/proposal/score  - Score voting proposal quality
- POST /api/ai/credential/analyze - Analyze credential description
- POST /api/ai/automation/evaluate - Evaluate automation rules
- GET  /api/ai/automation/dashboard - Get automation dashboard
- GET  /api/ai/health           - Health check
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import hashlib
import json
import time

from sentiment_analyzer import SentimentAnalyzer
from anomaly_detector import AnomalyDetector
from nlp_processor import NLPProcessor
from ai_automation import CampusAutomation, generate_hash

app = Flask(__name__)
# Allow CORS for specific origins and methods
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize AI services
sentiment_analyzer = SentimentAnalyzer()
anomaly_detector = AnomalyDetector()
nlp_processor = NLPProcessor()
campus_automation = CampusAutomation()


# ══════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CampusTrust AI Engine",
        "version": "1.0.0",
        "timestamp": int(time.time()),
        "modules": {
            "sentiment_analyzer": "active",
            "anomaly_detector": "active",
            "nlp_processor": "active",
            "automation_engine": "active",
        },
    })


# ══════════════════════════════════════════════════════════
# SENTIMENT ANALYSIS
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/sentiment", methods=["POST"])
def analyze_sentiment():
    """Analyze sentiment of a single feedback text."""
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = sentiment_analyzer.analyze(text)
    result["hash"] = generate_hash(text)  # Hash for blockchain storage

    return jsonify(result)


@app.route("/api/ai/sentiment/batch", methods=["POST"])
def analyze_sentiment_batch():
    """Analyze sentiment of multiple feedback texts."""
    data = request.get_json()
    texts = data.get("texts", [])

    if not texts:
        return jsonify({"error": "No texts provided"}), 400

    result = sentiment_analyzer.analyze_batch(texts)
    return jsonify(result)


# ══════════════════════════════════════════════════════════
# ANOMALY DETECTION
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/anomaly", methods=["POST"])
def detect_anomaly():
    """Analyze a student's attendance for anomalies."""
    data = request.get_json()

    required = ["checkin_times", "session_ids", "total_sessions"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    result = anomaly_detector.analyze_student(data)
    return jsonify(result)


@app.route("/api/ai/anomaly/class", methods=["POST"])
def detect_class_anomalies():
    """Analyze entire class attendance for anomalies."""
    data = request.get_json()
    students = data.get("students", [])

    if not students:
        return jsonify({"error": "No student data provided"}), 400

    result = anomaly_detector.analyze_class(students)
    return jsonify(result)


# ══════════════════════════════════════════════════════════
# NLP PROCESSING
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/nlp/keyphrases", methods=["POST"])
def extract_keyphrases():
    """Extract key phrases from text."""
    data = request.get_json()
    text = data.get("text", "")
    top_n = data.get("top_n", 5)

    result = nlp_processor.extract_key_phrases(text, top_n)
    return jsonify({"key_phrases": result})


@app.route("/api/ai/nlp/similarity", methods=["POST"])
def compute_similarity():
    """Compute similarity between two texts."""
    data = request.get_json()
    text1 = data.get("text1", "")
    text2 = data.get("text2", "")

    similarity = nlp_processor.compute_similarity(text1, text2)
    return jsonify({"similarity": similarity})


@app.route("/api/ai/nlp/summarize", methods=["POST"])
def summarize_text():
    """Summarize text."""
    data = request.get_json()
    text = data.get("text", "")
    max_sentences = data.get("max_sentences", 3)

    summary = nlp_processor.summarize(text, max_sentences)
    return jsonify({"summary": summary})


# ══════════════════════════════════════════════════════════
# PROPOSAL SCORING
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/proposal/score", methods=["POST"])
def score_proposal():
    """Score voting proposal quality using AI."""
    data = request.get_json()
    text = data.get("text", "")

    result = nlp_processor.score_proposal_quality(text)
    return jsonify(result)


# ══════════════════════════════════════════════════════════
# CREDENTIAL ANALYSIS
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/credential/analyze", methods=["POST"])
def analyze_credential():
    """Analyze credential description for completeness."""
    data = request.get_json()
    description = data.get("description", "")

    result = nlp_processor.analyze_credential_description(description)
    return jsonify(result)


# ══════════════════════════════════════════════════════════
# AUTOMATION
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/automation/evaluate", methods=["POST"])
def evaluate_automation():
    """Evaluate automation rules against current context."""
    data = request.get_json()
    module = data.get("module", "")

    if module == "voting":
        result = campus_automation.process_voting_events(data.get("data", {}))
    elif module == "feedback":
        result = campus_automation.process_feedback_events(data.get("data", {}))
    elif module == "attendance":
        result = campus_automation.process_attendance_events(data.get("data", {}))
    elif module == "credential":
        result = campus_automation.process_credential_events(data.get("data", {}))
    else:
        return jsonify({"error": "Invalid module. Use: voting, feedback, attendance, credential"}), 400

    return jsonify({
        "triggered_actions": [
            {
                "rule": a["rule_name"],
                "action": a["action"],
                "timestamp": a["triggered_at"],
            }
            for a in result
        ],
    })


@app.route("/api/ai/automation/dashboard", methods=["GET"])
def automation_dashboard():
    """Get automation engine dashboard data."""
    return jsonify(campus_automation.get_dashboard_data())


# ══════════════════════════════════════════════════════════
# UTILITY: HASH GENERATION
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/hash", methods=["POST"])
def generate_hash_endpoint():
    """Generate SHA256 hash for blockchain storage."""
    data = request.get_json()
    content = data.get("content", "")

    hash_value = generate_hash(content)
    return jsonify({"hash": hash_value})


if __name__ == "__main__":
    print("🧠 CampusTrust AI Backend Server")
    print("   Starting on http://localhost:5001")
    print("   Endpoints: /api/ai/health, /api/ai/sentiment, /api/ai/anomaly, ...")
    socketio.run(app, host="0.0.0.0", port=5001, debug=True)
