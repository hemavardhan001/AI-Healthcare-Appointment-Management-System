import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function MyAppointments() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    // =======================================
    // GET TODAY'S LOCAL DATE
    // =======================================

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

    // =======================================
    // LOAD APPOINTMENTS
    // =======================================

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await API.get(
                "/appointments/my"
            );

            setAppointments(
                Array.isArray(
                    res.data.appointments
                )
                    ? res.data.appointments
                    : []
            );

        } catch (err) {
            console.error(
                "Appointment loading error:",
                err
            );

            setAppointments([]);

            setError(
                err.response?.data?.message ||
                "Unable to load appointments."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // =======================================
    // CHECK WHETHER APPOINTMENT CAN BE CANCELLED
    // =======================================

    const canCancelAppointment = (
        appointment
    ) => {
        if (!appointment) {
            return false;
        }

        // Only scheduled appointments
        if (
            appointment.status !==
            "scheduled"
        ) {
            return false;
        }

        const today =
            getTodayDate();

        // Future date
        if (
            appointment.appointment_date >
            today
        ) {
            return true;
        }

        // Past date
        if (
            appointment.appointment_date <
            today
        ) {
            return false;
        }

        // Today's appointment
        if (
            appointment.appointment_date ===
            today
        ) {
            const now = new Date();

            const currentTime =
                `${String(
                    now.getHours()
                ).padStart(2, "0")}:${String(
                    now.getMinutes()
                ).padStart(2, "0")}`;

            return (
                appointment.start_time >
                currentTime
            );
        }

        return false;
    };

    // =======================================
    // CANCEL APPOINTMENT
    // =======================================

    const handleCancel = async (
        appointment
    ) => {
        if (
            !appointment ||
            !appointment.id
        ) {
            setError(
                "Invalid appointment."
            );
            return;
        }

        // Prevent duplicate clicks
        if (
            cancellingId ===
            appointment.id
        ) {
            return;
        }

        // Check whether cancellation is allowed
        if (
            !canCancelAppointment(
                appointment
            )
        ) {
            setError(
                "This appointment can no longer be cancelled."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to cancel appointment #${appointment.id}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(
                appointment.id
            );

            setError("");
            setMessage("");

            const doctorId =
                appointment.doctor_id ||
                appointment.doctorId;

            if (!doctorId) {
                setError(
                    "Doctor information is missing for this appointment."
                );
                return;
            }

            await API.put(
                `/appointments/${appointment.id}`,
                {
                    doctor_id:
                        Number(doctorId),

                    appointment_date:
                        appointment.appointment_date,

                    start_time:
                        appointment.start_time,

                    end_time:
                        appointment.end_time,

                    status:
                        "cancelled",

                    notes:
                        appointment.notes ||
                        ""
                }
            );

            setMessage(
                "Appointment cancelled successfully."
            );

            await fetchAppointments();

        } catch (err) {
            console.error(
                "Cancel appointment error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to cancel appointment."
            );

        } finally {
            setCancellingId(null);
        }
    };

    // =======================================
    // FORMAT DATE
    // =======================================

    const formatDate = (
        dateString
    ) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateString;
        }

        return date.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // =======================================
    // FORMAT TIME
    // =======================================

    const formatTime = (
        time
    ) => {
        if (!time) {
            return "";
        }

        const parts =
            time.split(":");

        const hours =
            Number(parts[0]);

        const minutes =
            Number(parts[1]);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
        ) {
            return time;
        }

        const date = new Date();

        date.setHours(
            hours,
            minutes,
            0,
            0
        );

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // =======================================
    // FORMAT STATUS
    // =======================================

    const formatStatus = (
        status
    ) => {
        if (!status) {
            return "Unknown";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    // =======================================
    // GET STATUS COLORS
    // =======================================

    const getStatusStyle = (
        status
    ) => {
        switch (status) {
            case "scheduled":
                return {
                    background:
                        "#dcfce7",
                    color:
                        "#15803d"
                };

            case "completed":
                return {
                    background:
                        "#dbeafe",
                    color:
                        "#1d4ed8"
                };

            case "cancelled":
                return {
                    background:
                        "#fee2e2",
                    color:
                        "#b91c1c"
                };

            default:
                return {
                    background:
                        "#f3f4f6",
                    color:
                        "#374151"
                };
        }
    };

    // =======================================
    // RENDER
    // =======================================

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "30px"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                    gap: "20px"
                }}
            >

                <div>
                    <h1>
                        📅 My Appointments
                    </h1>

                    <p
                        style={{
                            color:
                                "#6b7280",
                            margin: 0
                        }}
                    >
                        View and manage
                        your appointments
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/patient"
                        )
                    }
                    style={
                        buttonStyle
                    }
                >
                    ← Dashboard
                </button>

            </div>

            {/* SUCCESS MESSAGE */}

            {message && (
                <div
                    style={
                        successStyle
                    }
                >
                    ✅ {message}
                </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
                <div
                    style={
                        errorStyle
                    }
                >
                    ❌ {error}
                </div>
            )}

            {/* LOADING */}

            {loading && (
                <div
                    style={
                        emptyStyle
                    }
                >
                    <h3>
                        Loading appointments...
                    </h3>
                </div>
            )}

            {/* EMPTY */}

            {!loading &&
                !error &&
                appointments.length ===
                    0 && (
                    <div
                        style={
                            emptyStyle
                        }
                    >

                        <div
                            style={{
                                fontSize:
                                    "45px"
                            }}
                        >
                            📭
                        </div>

                        <h2>
                            No appointments
                            found
                        </h2>

                        <p
                            style={{
                                color:
                                    "#6b7280"
                            }}
                        >
                            You haven't
                            booked any
                            appointments
                            yet.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/patient/book-appointment"
                                )
                            }
                            style={
                                buttonStyle
                            }
                        >
                            📅 Book Appointment
                        </button>

                    </div>
                )}

            {/* APPOINTMENT LIST */}

            {!loading &&
                appointments.length >
                    0 && (
                    <div
                        style={{
                            display:
                                "grid",
                            gap: "20px",
                            maxWidth:
                                "900px",
                            margin:
                                "0 auto"
                        }}
                    >

                        {appointments.map(
                            (
                                appointment
                            ) => {

                                const isScheduled =
                                    appointment.status ===
                                    "scheduled";

                                const canCancel =
                                    canCancelAppointment(
                                        appointment
                                    );

                                const isCancelling =
                                    cancellingId ===
                                    appointment.id;

                                const statusColors =
                                    getStatusStyle(
                                        appointment.status
                                    );

                                return (
                                    <div
                                        key={
                                            appointment.id
                                        }
                                        style={
                                            cardStyle
                                        }
                                    >

                                        {/* TOP SECTION */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "flex-start",
                                                gap:
                                                    "20px",
                                                flexWrap:
                                                    "wrap"
                                            }}
                                        >

                                            <div>

                                                <h2
                                                    style={{
                                                        margin:
                                                            "0 0 5px"
                                                    }}
                                                >
                                                    👨‍⚕️ Dr.{" "}
                                                    {
                                                        appointment.doctor_name ||
                                                        "Doctor"
                                                    }
                                                </h2>

                                                <p
                                                    style={{
                                                        margin:
                                                            0,
                                                        color:
                                                            "#6b7280"
                                                    }}
                                                >
                                                    {
                                                        appointment.specialization ||
                                                        "Medical Specialist"
                                                    }
                                                </p>

                                            </div>

                                            <span
                                                style={{
                                                    ...statusStyle,
                                                    background:
                                                        statusColors.background,
                                                    color:
                                                        statusColors.color
                                                }}
                                            >
                                                {
                                                    formatStatus(
                                                        appointment.status
                                                    )
                                                }
                                            </span>

                                        </div>

                                        {/* DIVIDER */}

                                        <hr
                                            style={{
                                                border:
                                                    "none",
                                                borderTop:
                                                    "1px solid #e5e7eb",
                                                margin:
                                                    "20px 0"
                                            }}
                                        />

                                        {/* DETAILS */}

                                        <div
                                            style={{
                                                display:
                                                    "grid",
                                                gap:
                                                    "10px"
                                            }}
                                        >

                                            <p
                                                style={{
                                                    margin:
                                                        0
                                                }}
                                            >
                                                📅{" "}
                                                <strong>
                                                    Date:
                                                </strong>{" "}
                                                {
                                                    formatDate(
                                                        appointment.appointment_date
                                                    )
                                                }
                                            </p>

                                            <p
                                                style={{
                                                    margin:
                                                        0
                                                }}
                                            >
                                                ⏰{" "}
                                                <strong>
                                                    Time:
                                                </strong>{" "}
                                                {
                                                    formatTime(
                                                        appointment.start_time
                                                    )
                                                }

                                                {" - "}

                                                {
                                                    formatTime(
                                                        appointment.end_time
                                                    )
                                                }
                                            </p>

                                            {appointment.notes && (
                                                <p
                                                    style={{
                                                        margin:
                                                            0,
                                                        wordBreak:
                                                            "break-word"
                                                    }}
                                                >
                                                    📝{" "}
                                                    <strong>
                                                        Notes:
                                                    </strong>{" "}
                                                    {
                                                        appointment.notes
                                                    }
                                                </p>
                                            )}

                                        </div>

                                        {/* CANCEL BUTTON */}

                                        {isScheduled && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        "15px"
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCancel(
                                                            appointment
                                                        )
                                                    }
                                                    disabled={
                                                        !canCancel ||
                                                        isCancelling
                                                    }
                                                    style={{
                                                        padding:
                                                            "10px 18px",
                                                        border:
                                                            "none",
                                                        borderRadius:
                                                            "8px",

                                                        background:
                                                            !canCancel ||
                                                            isCancelling
                                                                ? "#9ca3af"
                                                                : "#ef4444",

                                                        color:
                                                            "white",

                                                        cursor:
                                                            !canCancel ||
                                                            isCancelling
                                                                ? "not-allowed"
                                                                : "pointer",

                                                        fontSize:
                                                            "14px"
                                                    }}
                                                >
                                                    {isCancelling
                                                        ? "Cancelling..."
                                                        : canCancel
                                                        ? "✕ Cancel Appointment"
                                                        : "✕ Cannot Cancel"}
                                                </button>

                                                {!canCancel && (
                                                    <p
                                                        style={{
                                                            margin:
                                                                "8px 0 0",
                                                            color:
                                                                "#6b7280",
                                                            fontSize:
                                                                "13px"
                                                        }}
                                                    >
                                                        This appointment
                                                        can no longer
                                                        be cancelled.
                                                    </p>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

        </div>
    );
}

// =======================================
// STYLES
// =======================================

const buttonStyle = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "14px"
};

const cardStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
        "0 2px 10px rgba(0,0,0,0.06)"
};

const statusStyle = {
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    fontSize: "13px"
};

const successStyle = {
    background: "#dcfce7",
    color: "#15803d",
    padding: "12px 15px",
    borderRadius: "8px",
    marginBottom: "15px"
};

const errorStyle = {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 15px",
    borderRadius: "8px",
    marginBottom: "15px"
};

const emptyStyle = {
    background: "white",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
    maxWidth: "700px",
    margin: "0 auto"
};

export default MyAppointments;