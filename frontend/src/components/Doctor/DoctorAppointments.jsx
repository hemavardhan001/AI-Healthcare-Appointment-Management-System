import { useEffect, useState } from "react";
import API from "../../services/api";

function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // ================================
    // LOAD DOCTOR APPOINTMENTS
    // ================================
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

    // ================================
    // LOAD ON PAGE OPEN
    // ================================
    useEffect(() => {
        loadAppointments();
    }, []);

    // ================================
    // UPDATE APPOINTMENT STATUS
    // ================================
    const updateStatus = async (
        appointment,
        status
    ) => {
        try {
            setUpdatingId(appointment.id);
            setError("");
            setMessage("");

            const data = {
                appointment_date:
                    appointment.appointment_date,

                start_time:
                    appointment.start_time,

                end_time:
                    appointment.end_time,

                status: status,

                notes:
                    appointment.notes || ""
            };

            console.log(
                "Updating appointment:",
                appointment.id,
                status
            );

            await API.put(
                `/appointments/${appointment.id}`,
                data
            );

            setMessage(
                `Appointment #${appointment.id} marked as ${status}.`
            );

            // Reload appointments
            await loadAppointments();

        } catch (err) {
            console.error(
                "Update appointment error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                "Unable to update appointment."
            );

        } finally {
            setUpdatingId(null);
        }
    };

    // ================================
    // COMPLETE APPOINTMENT
    // ================================
    const handleComplete = (appointment) => {
        updateStatus(
            appointment,
            "completed"
        );
    };

    // ================================
    // CANCEL APPOINTMENT
    // ================================
    const handleCancel = (appointment) => {
        const confirmed = window.confirm(
            `Cancel appointment #${appointment.id}?`
        );

        if (!confirmed) {
            return;
        }

        updateStatus(
            appointment,
            "cancelled"
        );
    };

    // ================================
    // FORMAT DATE
    // ================================
    const formatDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        return date.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // ================================
    // FORMAT TIME
    // ================================
    const formatTime = (time) => {
        if (!time) {
            return "";
        }

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

    // ================================
    // FORMAT STATUS
    // ================================
    const formatStatus = (status) => {
        if (!status) {
            return "";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    // ================================
    // LOADING SCREEN
    // ================================
    if (loading) {
        return (
            <div className="doctor-page">

                <h1>
                    📅 All Appointments
                </h1>

                <p>
                    Loading appointments...
                </p>

            </div>
        );
    }

    // ================================
    // MAIN UI
    // ================================
    return (
        <div className="doctor-page">

            {/* PAGE HEADER */}
            <div className="page-header">

                <div>

                    <h1>
                        📅 All Appointments
                    </h1>

                    <p>
                        Manage your patient appointments
                    </p>

                </div>

                <button
                    className="refresh-btn"
                    onClick={loadAppointments}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>

            </div>

            {/* SUCCESS MESSAGE */}
            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* APPOINTMENT SUMMARY */}
            <div className="appointment-summary">

                {/* TOTAL */}
                <div>

                    <strong>
                        {appointments.length}
                    </strong>

                    <span>
                        Total Appointments
                    </span>

                </div>

                {/* SCHEDULED */}
                <div>

                    <strong>
                        {
                            appointments.filter(
                                (appointment) =>
                                    appointment.status ===
                                    "scheduled"
                            ).length
                        }
                    </strong>

                    <span>
                        Scheduled
                    </span>

                </div>

                {/* COMPLETED */}
                <div>

                    <strong>
                        {
                            appointments.filter(
                                (appointment) =>
                                    appointment.status ===
                                    "completed"
                            ).length
                        }
                    </strong>

                    <span>
                        Completed
                    </span>

                </div>

                {/* CANCELLED */}
                <div>

                    <strong>
                        {
                            appointments.filter(
                                (appointment) =>
                                    appointment.status ===
                                    "cancelled"
                            ).length
                        }
                    </strong>

                    <span>
                        Cancelled
                    </span>

                </div>

            </div>

            {/* NO APPOINTMENTS */}
            {appointments.length === 0 ? (

                <div className="empty-message">

                    <div className="empty-icon">
                        📭
                    </div>

                    <h3>
                        No appointments found
                    </h3>

                    <p>
                        You don't have any
                        appointment records yet.
                    </p>

                </div>

            ) : (

                /* APPOINTMENT LIST */
                <div className="appointment-list">

                    {appointments.map(
                        (appointment) => (

                            <div
                                className="doctor-appointment-card"
                                key={appointment.id}
                            >

                                {/* TIME & DATE */}
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

                                    <small>
                                        {formatDate(
                                            appointment.appointment_date
                                        )}
                                    </small>

                                </div>

                                {/* PATIENT INFORMATION */}
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

                                {/* STATUS & ACTIONS */}
                                <div className="appointment-actions">

                                    <span
                                        className={`status ${appointment.status}`}
                                    >
                                        {formatStatus(
                                            appointment.status
                                        )}
                                    </span>

                                    {/* ACTION BUTTONS */}
                                    {appointment.status ===
                                        "scheduled" && (

                                        <div className="action-buttons">

                                            {/* COMPLETE */}
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

                                            {/* CANCEL */}
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

export default DoctorAppointments;