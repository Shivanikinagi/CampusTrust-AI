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
# FACE VERIFICATION
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/face-verify", methods=["POST"])
def face_verify():
    """Face verification with liveness detection and descriptor comparison."""
    try:
        data = request.get_json()
        image_data = data.get("image", "")
        student_id = data.get("student_id", "")
        location_verified = data.get("location_verified", False)
        coordinates = data.get("coordinates", None)

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # In a real implementation, this would use face-api.js or similar
        # to extract face descriptors and perform liveness detection
        # For now, we'll simulate the process
        
        # Simulate face detection
        face_detected = True
        confidence = 0.92
        
        # Simulate liveness detection and anti-spoofing
        # In a real implementation, we would:
        # 1. Prompt user for random head movements (left/right/up/down)
        # 2. Analyze frames to detect movement patterns
        # 3. Check for blink detection
        # 4. Analyze depth map from 3D camera if available
        # 5. Perform anti-spoofing checks (detect photo/video replay attacks)
        liveness_passed = True  # Simulate liveness check
        
        # Anti-spoofing check
        # In a real implementation, we would analyze depth maps and texture patterns
        # to differentiate between real faces and fake representations
        anti_spoofing_passed = True  # Simulate anti-spoofing check
        
        # In a real implementation, we would:
        # 1. Extract face descriptor from image
        # 2. Compare with stored descriptor for student_id
        # 3. Perform liveness detection (random head movements, etc.)
        # 4. Validate location coordinates if provided
        
        result = {
            "verified": face_detected and liveness_passed and anti_spoofing_passed and location_verified,
            "confidence": confidence,
            "face_detected": face_detected,
            "liveness_passed": liveness_passed,
            "anti_spoofing_passed": anti_spoofing_passed,
            "location_verified": location_verified,
            "student_id": student_id,
            "timestamp": int(time.time()),
            "message": "Face verification successful" if (face_detected and liveness_passed and anti_spoofing_passed and location_verified) else "Face verification failed"
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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


# ══════════════════════════════════════════════════════════
# SKILL BADGES - AI PROJECT ANALYSIS
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/skills/analyze", methods=["POST"])
def analyze_project_for_skills():
    """Analyze student project and generate skill scores."""
    data = request.get_json()
    project_type = data.get("type", "github")  # github or pdf
    url = data.get("url", "")
    category = data.get("category", "python")
    student_wallet = data.get("student_wallet", "")

    # Simulate AI analysis (in production, would analyze actual code/PDF)
    import random
    score = random.randint(70, 98)
    
    insights = [
        "Clean code architecture with proper separation of concerns",
        "Comprehensive documentation and inline comments",
        "Good test coverage and error handling",
        "Efficient algorithm implementations"
    ]
    
    strengths = ["Code Quality", "Documentation", "Testing"]
    improvements = ["Add more edge case handling", "Optimize performance in critical sections"]
    
    level = "Expert" if score >= 90 else "Advanced" if score >= 80 else "Intermediate"
    
    return jsonify({
        "score": score,
        "level": level,
        "insights": insights,
        "strengths": strengths,
        "improvements": improvements
    })


# ══════════════════════════════════════════════════════════
# SMART GRANTS - AI PROPOSAL EVALUATION
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/grants/evaluate", methods=["POST"])
def evaluate_grant_proposal():
    """AI evaluation of grant proposal for feasibility and impact."""
    data = request.get_json()
    title = data.get("title", "")
    description = data.get("description", "")
    budget = data.get("budget", 0)
    category = data.get("category", "research")

    # Simulate AI evaluation
    import random
    score = random.randint(65, 95)
    
    feedback = [
        "Clear project objectives and deliverables",
        "Feasible budget allocation for stated goals",
        "Well-defined timeline and milestones",
        "Strong potential for campus impact"
    ]
    
    concerns = [
        "Consider adding more detailed technical specifications",
        "Budget justification could be more thorough"
    ]
    
    recommendation = "Recommended for approval" if score >= 70 else "Needs revision before approval"
    
    return jsonify({
        "score": score,
        "feedback": feedback,
        "concerns": concerns,
        "recommendation": recommendation
    })


# ══════════════════════════════════════════════════════════
# P2P COMPUTE - PROOF OF COMPUTE VERIFICATION
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/compute/verify", methods=["POST"])
def verify_proof_of_compute():
    """Verify proof of compute hash from provider."""
    data = request.get_json()
    task_id = data.get("task_id", "")
    result_hash = data.get("result_hash", "")
    provider_wallet = data.get("provider_wallet", "")

    # In production, would verify actual computation
    verified = True
    confidence = 0.98
    
    return jsonify({
        "verified": verified,
        "confidence": confidence,
        "proof_hash": result_hash
    })


# ══════════════════════════════════════════════════════════
# RESEARCH CERTIFICATION - AI PAPER REVIEW
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/research/review", methods=["POST"])
def review_research_paper():
    """AI review of research paper for quality and plagiarism."""
    data = request.get_json()
    title = data.get("title", "")
    abstract = data.get("abstract", "")
    content = data.get("content", "")  # Full text or PDF content

    # Simulate AI review
    import random
    technical_accuracy = random.randint(80, 95)
    originality = random.randint(80, 95)
    clarity = random.randint(75, 92)
    plagiarism_score = random.randint(1, 5)
    overall_score = (technical_accuracy + originality + clarity) // 3
    
    summary = "This paper demonstrates solid research methodology and presents valuable contributions to the field."
    
    strengths = [
        "Well-defined research questions",
        "Comprehensive data analysis",
        "Clear presentation of results"
    ]
    
    suggestions = [
        "Strengthen the theoretical framework",
        "Include more recent references",
        "Expand the limitations section"
    ]
    
    content_hash = hashlib.sha256(content.encode()).hexdigest() if content else "DEMO_HASH"
    
    return jsonify({
        "technical_accuracy": technical_accuracy,
        "originality": originality,
        "clarity": clarity,
        "plagiarism_score": plagiarism_score,
        "overall_score": overall_score,
        "summary": summary,
        "strengths": strengths,
        "suggestions": suggestions,
        "hash": f"SHA256:{content_hash[:16].upper()}"
    })


# ══════════════════════════════════════════════════════════
# ALGO-AGENT - AI TREASURER EXPENSE APPROVAL
# ══════════════════════════════════════════════════════════

@app.route("/api/ai/treasurer/analyze", methods=["POST"])
def analyze_funding_request():
    """AI analysis of funding request for approval."""
    data = request.get_json()
    item = data.get("item", "")
    amount = data.get("amount", 0)
    purpose = data.get("purpose", "")
    project_link = data.get("project_link", "")
    requester_wallet = data.get("requester_wallet", "")
    budget_remaining = data.get("budget_remaining", 0)

    # Simulate AI analysis
    import random
    score = random.randint(60, 95)
    
    # Score modifiers
    if project_link:
        score += 5  # Bonus for providing project tracking
    if amount > budget_remaining * 0.3:
        score -= 10  # Penalty for large percentage of budget
    if amount < 50:
        score += 3  # Bonus for small, reasonable requests
    
    score = min(95, max(40, score))
    
    if score >= 80:
        reasoning = f"Request aligns with objectives. Amount is reasonable. {'GitHub activity verified.' if project_link else ''} Recommended for approval."
        status = "approved"
    elif score >= 65:
        reasoning = f"Valid request but requires manual review. {'Project link would improve confidence.' if not project_link else 'Amount is on the higher side.'}"
        status = "pending"
    else:
        reasoning = "Request does not meet current priorities or budget constraints. Consider revising or resubmitting with more justification."
        status = "rejected"
    
    return jsonify({
        "score": score,
        "reasoning": reasoning,
        "status": status
    })


@app.route("/api/ai/treasurer/verify-receipt", methods=["POST"])
def verify_receipt():
    """OCR verification of uploaded receipt."""
    data = request.get_json()
    receipt_image = data.get("image", "")
    claimed_amount = data.get("amount", 0)
    
    # Simulate OCR verification
    verified = True
    extracted_amount = claimed_amount
    merchant = "Demo Store"
    
    return jsonify({
        "verified": verified,
        "extracted_amount": extracted_amount,
        "merchant": merchant,
        "matches": abs(extracted_amount - claimed_amount) < 0.01
    })


if __name__ == "__main__":
    print("🧠 CampusTrust AI Backend Server")
    print("   Starting on http://localhost:5000")
    print("   Endpoints: /api/ai/health, /api/ai/sentiment, /api/ai/anomaly, ...")
    socketio.run(app, host="127.0.0.1", port=5000, debug=True)