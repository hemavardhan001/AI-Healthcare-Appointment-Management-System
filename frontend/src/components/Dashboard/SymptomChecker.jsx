import { useState } from "react";
import API from "../../services/api";
import "./PatientTheme.css";
import "./SymptomChecker.css";

const AI_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:5001";

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");
  const [guidance, setGuidance] = useState("");
  const [nextSteps, setNextSteps] = useState([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const analyze = async (event) => {
    event.preventDefault();
    setMessage("");
    setSpecialization("");
    setDoctors([]);
    setGuidance("");
    setNextSteps([]);
    setDisclaimer("");
    setUrgent(false);

    if (symptoms.trim().length < 3) {
      setMessage("Please describe your symptoms in more detail.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${AI_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to analyze symptoms.");
      }

      setSpecialization(result.recommended_specialization || "");
      setGuidance(result.guidance || "Please consult a qualified healthcare professional.");
      setNextSteps(Array.isArray(result.next_steps) ? result.next_steps : []);
      setDisclaimer(result.disclaimer || "This is general information, not a diagnosis.");
      setUrgent(Boolean(result.urgent));

      try {
        const doctorResponse = await API.get("/doctors");
        const data = doctorResponse.data;
        const allDoctors = Array.isArray(data) ? data : (data.doctors || []);
        const recommended = (result.recommended_specialization || "").trim().toLowerCase();

        setDoctors(
          allDoctors.filter(
            (doctor) =>
              doctor.specialization?.trim().toLowerCase() === recommended
          )
        );
      } catch {
        setMessage("AI guidance received, but doctor listings could not be loaded.");
      }
    } catch (error) {
      setMessage(
        error.message || "Could not connect to the AI service. Check that it is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="symptom-checker">
      <div className="assistant-heading">
        <span className="assistant-icon" aria-hidden="true">✚</span>
        <div>
          <h1>AI Health Assistant</h1>
          <p>Get general health guidance and a suggested medical specialty.</p>
        </div>
      </div>

      <form onSubmit={analyze}>
        <label htmlFor="symptoms">How are you feeling?</label>
        <textarea
          id="symptoms"
          rows="5"
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          placeholder="Describe your symptoms, when they started, and how you feel..."
          maxLength={2000}
          required
        />
        <div className="assistant-form-footer">
          <small>{symptoms.length}/2000 characters</small>
          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Get Health Guidance"}
          </button>
        </div>
      </form>

      {message && <p role="alert" className="symptom-message">{message}</p>}

      {urgent && (
        <div className="symptom-warning" role="alert">
          <strong>⚠️ Possible emergency</strong>
          <p>
            These symptoms may need immediate medical attention. Contact your
            local emergency service or go to an emergency department now.
            Do not wait for an AI response or appointment.
          </p>
        </div>
      )}

      {specialization && (
        <div className="symptom-result" aria-live="polite">
          <span className="assistant-result-label">YOUR GENERAL GUIDANCE</span>
          <h2>Suggested specialty: {specialization}</h2>
          <p>{guidance}</p>

          {nextSteps.length > 0 && (
            <>
              <h3>Suggested next steps</h3>
              <ul className="assistant-steps">
                {nextSteps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Matching doctors</h3>
          {doctors.length === 0 ? (
            <p>No exact specialty matches were found. You can browse the Doctors section.</p>
          ) : (
            <ul className="assistant-doctors">
              {doctors.map((doctor) => (
                <li key={doctor.doctor_id || doctor.id}>
                  <strong>Dr. {doctor.name}</strong>
                  {" — "}
                  {doctor.specialization}
                  {doctor.experience_years !== undefined &&
                    ` · ${doctor.experience_years} years experience`}
                </li>
              ))}
            </ul>
          )}

          <p className="assistant-disclaimer">
            {disclaimer} This assistant cannot diagnose a condition or rule out
            emergencies. Seek professional medical care if symptoms are severe,
            worsening, persistent, or concerning.
          </p>
        </div>
      )}

      <p className="symptom-disclaimer">
        This assistant provides general information only, not a diagnosis or
        treatment plan. For severe or rapidly worsening symptoms, seek urgent
        medical care.
      </p>
    </section>
  );
}

export default SymptomChecker;