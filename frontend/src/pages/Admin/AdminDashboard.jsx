import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const res = await API.get("/appointments");
            setAppointments(res.data.appointments || res.data.data || []);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Failed to load appointments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const total = appointments.length;

    const scheduled = appointments.filter(
        (a) => a.status === "scheduled"
    ).length;

    const completed = appointments.filter(
        (a) => a.status === "completed"
    ).length;

    const cancelled = appointments.filter(
        (a) => a.status === "cancelled"
    ).length;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f4fbfa",
                padding: "30px"
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px"
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
                    <p style={{ color: "#666" }}>
                        Welcome, {user.name || "Admin"} 👋
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#dc3545",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    🚪 Logout
                </button>
            </div>

            {/* Statistics */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px"
                }}
            >
                <div style={cardStyle}>
                    <h3>Total Appointments</h3>
                    <h2>{total}</h2>
                </div>

                <div style={cardStyle}>
                    <h3>Scheduled</h3>
                    <h2>{scheduled}</h2>
                </div>

                <div style={cardStyle}>
                    <h3>Completed</h3>
                    <h2>{completed}</h2>
                </div>

                <div style={cardStyle}>
                    <h3>Cancelled</h3>
                    <h2>{cancelled}</h2>
                </div>
            </div>

            {/* Appointments */}
            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <h2>All Appointments</h2>

                    <button
                        onClick={loadAppointments}
                        style={{
                            padding: "8px 15px",
                            border: "none",
                            borderRadius: "5px",
                            background: "#0e9f91",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {loading && <p>Loading appointments...</p>}

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                {!loading && !error && appointments.length === 0 && (
                    <p>No appointments found.</p>
                )}

                {!loading &&
                    !error &&
                    appointments.length > 0 && (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    marginTop: "15px"
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={thStyle}>ID</th>
                                        <th style={thStyle}>Patient</th>
                                        <th style={thStyle}>Doctor</th>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Time</th>
                                        <th style={thStyle}>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td style={tdStyle}>
                                                #{appointment.id}
                                            </td>

                                            <td style={tdStyle}>
                                                {appointment.patient_name ||
                                                    "N/A"}
                                            </td>

                                            <td style={tdStyle}>
                                                {appointment.doctor_name ||
                                                    "N/A"}
                                            </td>

                                            <td style={tdStyle}>
                                                {appointment.appointment_date}
                                            </td>

                                            <td style={tdStyle}>
                                                {appointment.start_time} -{" "}
                                                {appointment.end_time}
                                            </td>

                                            <td style={tdStyle}>
                                                {appointment.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>
        </div>
    );
};

const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
};

const thStyle = {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #ddd"
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee"
};

export default AdminDashboard;