from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-healthcare-appointment-managemen.vercel.app"
]}})

def analyze_symptoms(symptoms):
    text = symptoms.lower()

    if any(w in text for w in [
        "chest pain", "heart pain", "palpitations",
        "shortness of breath"
    ]):
        return "Cardiologist"
    elif any(w in text for w in [
        "headache", "migraine", "dizziness", "memory"
    ]):
        return "Neurologist"
    elif any(w in text for w in [
        "skin", "rash", "acne", "itching"
    ]):
        return "Dermatologist"
    elif any(w in text for w in [
        "stomach", "abdominal", "digestion", "vomiting"
    ]):
        return "Gastroenterologist"
    elif any(w in text for w in [
        "fever", "cold", "cough", "sore throat"
    ]):
        return "General Physician"
    return "General Physician"


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "AI Healthcare Service is running"
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms", "")

    if not isinstance(symptoms, str) or len(symptoms.strip()) < 3:
        return jsonify({
            "success": False,
            "message": "Please describe your symptoms in at least 3 characters."
        }), 400

    symptoms = symptoms.strip()[:2000]
    text = symptoms.lower()
    specialization = analyze_symptoms(text)

    emergency_terms = [
        "chest pain", "shortness of breath",
        "difficulty breathing", "cannot breathe",
        "unconscious", "severe bleeding",
        "face drooping", "sudden weakness"
    ]
    urgent = any(term in text for term in emergency_terms)

    if urgent:
        guidance = (
            "These symptoms may indicate an emergency. "
            "Seek emergency medical care now; do not rely on this assistant."
        )
        next_steps = [
            "Contact your local emergency service or go to an emergency department.",
            "Do not delay urgent care while waiting for an appointment."
        ]
    else:
        guidance = (
            "This tool cannot determine the cause of your symptoms. "
            "A qualified healthcare professional can assess your situation."
        )
        next_steps = [
            "Note when symptoms started and whether they are getting worse.",
            "Record any other symptoms and relevant medicines for your clinician.",
            "Arrange medical advice if symptoms persist, worsen, or concern you."
        ]

    return jsonify({
        "success": True,
        "symptoms": symptoms,
        "recommended_specialization": specialization,
        "message": f"Consider consulting a {specialization}.",
        "guidance": guidance,
        "next_steps": next_steps,
        "urgent": urgent,
        "disclaimer": "General information only; this is not a diagnosis."
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
