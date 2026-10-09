import { useEffect, useState } from "react";
import API from "../../services/api";
import "./TodayAppointments.css";

function TodayAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await API.get(
                "/appointments/doctor"
            );

            setAppointments(
                res.data.appointments || []
            );
        } catch (err) {
            console.error(
                "Error loading appointments:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load appointments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // Get today's date in local time
    const getTodayDate = () => {
        const date = new Date();

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const today = getTodayDate();

    const todayAppointments =
        appointments.filter(
            (appointment) =>
                appointment.appointment_date ===
                today
        );
        const scheduledToday = todayAppointments.filter(
    (appointment) => appointment.status === "scheduled"
).length;

const completedToday = todayAppointments.filter(
    (appointment) => appointment.status === "completed"
).length;

const cancelledToday = todayAppointments.filter(
    (appointment) => appointment.status === "cancelled"
).length;

    const updateStatus = async (
        appointment,
        status
    ) => {
        try {
            setUpdatingId(appointment.id);
            setError("");
            setMessage("");

            await API.put(
                `/appointments/${appointment.id}`,
                {
                    appointment_date:
                        appointment.appointment_date,

                    start_time:
                        appointment.start_time,

                    end_time:
                        appointment.end_time,

                    status: status,

                    notes:
                        appointment.notes || ""
                }
            );

            setMessage(
                `Appointment marked as ${status}.`
            );

            await loadAppointments();

        } catch (err) {
            console.error(
                "Update appointment error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update appointment."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleComplete = (appointment) => {
        updateStatus(
            appointment,
            "completed"
        );
    };

    const handleCancel = (appointment) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmed) {
            return;
        }

        updateStatus(
            appointment,
            "cancelled"
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(
            `${dateString}T00:00:00`
        );

        return date.toLocaleDateString(
            [],
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    };

    const formatTime = (time) => {
        if (!time) return "";

        const [hours, minutes] =
            time.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes)
        );

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    const formatStatus = (status) => {
        if (!status) return "";

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    if (loading) {
        return (
            <div className="doctor-page">
                <h1>Today's Appointments</h1>
                <p>Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="doctor-page">

            <div className="page-header">

                <div>
                    <h1>
                        Today's Appointments
                    </h1>

                    <p>
                        {formatDate(today)}
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={loadAppointments}
                >
                    🔄 Refresh
                </button>

            </div>

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="appointment-summary">

    <div className="summary-card">
        <strong>
            {todayAppointments.length}
        </strong>
        <span>Total Today</span>
    </div>

    <div className="summary-card">
        <strong>
            {scheduledToday}
        </strong>
        <span>Scheduled</span>
    </div>

    <div className="summary-card">
        <strong>
            {completedToday}
        </strong>
        <span>Completed</span>
    </div>

    <div className="summary-card">
        <strong>
            {cancelledToday}
        </strong>
        <span>Cancelled</span>
    </div>

</div>

            {todayAppointments.length === 0 ? (

                <div className="empty-message">

                    <div className="empty-icon">
                        📅
                    </div>

                    <h3>
                        No appointments today
                    </h3>

                    <p>
                        You have no appointments
                        scheduled for today.
                    </p>

                    <small>
                        Your upcoming appointments
                        will appear here on their
                        scheduled date.
                    </small>

                </div>

            ) : (

                <div className="appointment-list">

                    {todayAppointments.map(
                        (appointment) => (

                            <div
                                className="doctor-appointment-card"
                                key={appointment.id}
                            >

                                <div className="appointment-time">

                                    <strong>
                                        {formatTime(
                                            appointment.start_time
                                        )}
                                    </strong>

                                    <span>
                                        to{" "}
                                        {formatTime(
                                            appointment.end_time
                                        )}
                                    </span>

                                </div>

                                <div className="patient-info">

                                    <h3>
                                        👤{" "}
                                        {appointment.patient_name ||
                                            "Patient"}
                                    </h3>

                                    {appointment.patient_email && (
                                        <p>
                                            📧{" "}
                                            {
                                                appointment.patient_email
                                            }
                                        </p>
                                    )}

                                    {appointment.patient_phone && (
                                        <p>
                                            📞{" "}
                                            {
                                                appointment.patient_phone
                                            }
                                        </p>
                                    )}

                                    {appointment.notes && (
                                        <p>
                                            📝{" "}
                                            {appointment.notes}
                                        </p>
                                    )}

                                </div>

                                <div className="appointment-actions">

                                    <span
                                        className={`status ${appointment.status}`}
                                    >
                                        {formatStatus(
                                            appointment.status
                                        )}
                                    </span>

                                    {appointment.status ===
                                        "scheduled" && (
                                        <div className="action-buttons">

                                            <button
                                                className="complete-btn"
                                                disabled={
                                                    updatingId ===
                                                    appointment.id
                                                }
                                                onClick={() =>
                                                    handleComplete(
                                                        appointment
                                                    )
                                                }
                                            >
                                                {updatingId ===
                                                appointment.id
                                                    ? "Updating..."
                                                    : "✓ Complete"}
                                            </button>

                                            <button
                                                className="cancel-btn"
                                                disabled={
                                                    updatingId ===
                                                    appointment.id
                                                }
                                                onClick={() =>
                                                    handleCancel(
                                                        appointment
                                                    )
                                                }
                                            >
                                                ✕ Cancel
                                            </button>

                                        </div>
                                    )}

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default TodayAppointments;