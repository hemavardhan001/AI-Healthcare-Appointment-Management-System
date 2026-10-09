from flask import Flask, request, jsonify

app = Flask(__name__)


# --------------------------------
# AI Symptom Analysis
# --------------------------------
def analyze_symptoms(symptoms):
    symptoms = symptoms.lower()

    if any(word in symptoms for word in [
        "chest pain",
        "heart pain",
        "palpitations",
        "shortness of breath"
    ]):
        specialization = "Cardiologist"

    elif any(word in symptoms for word in [
        "headache",
        "migraine",
        "dizziness",
        "memory"
    ]):
        specialization = "Neurologist"

    elif any(word in symptoms for word in [
        "skin",
        "rash",
        "acne",
        "itching"
    ]):
        specialization = "Dermatologist"

    elif any(word in symptoms for word in [
        "stomach",
        "abdominal",
        "digestion",
        "vomiting"
    ]):
        specialization = "Gastroenterologist"

    elif any(word in symptoms for word in [
        "fever",
        "cold",
        "cough",
        "sore throat"
    ]):
        specialization = "General Physician"

    else:
        specialization = "General Physician"

    return specialization


# --------------------------------
# Health Check
# --------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "AI Healthcare Service is running"
    })


# --------------------------------
# Analyze Symptoms
# --------------------------------
@app.route("/api/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    if not data or not data.get("symptoms"):
        return jsonify({
            "success": False,
            "message": "Symptoms are required"
        }), 400

    symptoms = data["symptoms"]

    specialization = analyze_symptoms(symptoms)

    return jsonify({
        "success": True,
        "symptoms": symptoms,
        "recommended_specialization": specialization,
        "message": f"Based on the provided symptoms, consider consulting a {specialization}."
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
