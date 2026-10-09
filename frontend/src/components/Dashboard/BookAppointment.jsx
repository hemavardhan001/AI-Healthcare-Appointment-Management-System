import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";

function BookAppointment() {
    const navigate = useNavigate();
    const location = useLocation();

    // =======================================
    // STATE
    // =======================================

    const [doctors, setDoctors] = useState([]);
    const [availability, setAvailability] = useState([]);

    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    const [form, setForm] = useState({
        doctor_id: location.state?.doctorId || "",
        appointment_date: "",
        start_time: "",
        end_time: "",
        notes: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [booking, setBooking] = useState(false);

    // =======================================
    // DAYS
    // =======================================

    const days = [
        { value: 0, label: "Sunday" },
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" }
    ];

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

    const today = getTodayDate();

    // =======================================
    // LOAD DOCTORS
    // =======================================

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoadingDoctors(true);
            setError("");

            const res = await API.get("/doctors");

            console.log("Doctors Response:", res.data);

            setDoctors(res.data.doctors || []);

        } catch (err) {
            console.error(
                "Doctor Error:",
                err
            );

            setDoctors([]);

            setError(
                err.response?.data?.message ||
                "Unable to load doctors."
            );

        } finally {
            setLoadingDoctors(false);
        }
    };

    // =======================================
    // LOAD DOCTOR AVAILABILITY
    // =======================================

    const fetchAvailability = async (doctorId) => {
        if (!doctorId) {
            setAvailability([]);
            return;
        }

        try {
            setLoadingAvailability(true);
            setError("");

            console.log(
                "Loading availability for doctor:",
                doctorId
            );

            const res = await API.get(
                `/availability/doctor/${doctorId}`
            );

            console.log(
                "Doctor availability:",
                res.data
            );

            setAvailability(
                res.data.availability || []
            );

        } catch (err) {
            console.error(
                "Availability Error:",
                err
            );

            setAvailability([]);

            setError(
                err.response?.data?.message ||
                "Unable to load doctor availability."
            );

        } finally {
            setLoadingAvailability(false);
        }
    };

    // =======================================
    // LOAD INITIAL DOCTOR AVAILABILITY
    // =======================================

    useEffect(() => {
        if (form.doctor_id) {
            fetchAvailability(form.doctor_id);
        }
    }, []);

    // =======================================
    // HANDLE INPUT
    // =======================================

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setMessage("");
        setError("");

        // ===================================
        // DOCTOR CHANGED
        // ===================================

        if (name === "doctor_id") {
            setForm({
                doctor_id: value,
                appointment_date: "",
                start_time: "",
                end_time: "",
                notes: ""
            });

            setAvailability([]);

            if (value) {
                fetchAvailability(value);
            }

            return;
        }

        // ===================================
        // DATE CHANGED
        // ===================================

        if (name === "appointment_date") {
            setForm((prev) => ({
                ...prev,
                appointment_date: value,
                start_time: "",
                end_time: ""
            }));

            return;
        }

        // ===================================
        // OTHER FIELDS
        // ===================================

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // =======================================
    // GET SELECTED DATE DAY
    // =======================================

    const getSelectedDay = () => {
        if (!form.appointment_date) {
            return null;
        }

        const date = new Date(
            `${form.appointment_date}T00:00:00`
        );

        return date.getDay();
    };

    const selectedDay = getSelectedDay();

    // =======================================
    // GET AVAILABLE SLOTS FOR SELECTED DAY
    // =======================================

    const availableSlots =
        form.appointment_date
            ? availability.filter(
                (slot) =>
                    Number(slot.day_of_week) ===
                    Number(selectedDay)
            )
            : [];

    // =======================================
    // CHECK SELECTED TIME AGAINST AVAILABILITY
    // =======================================

    const getSelectedAvailabilitySlot = () => {
        if (
            !form.appointment_date ||
            !form.start_time ||
            !form.end_time
        ) {
            return null;
        }

        return availability.find(
            (slot) =>
                Number(slot.day_of_week) ===
                    Number(selectedDay) &&
                slot.start_time <=
                    form.start_time &&
                slot.end_time >=
                    form.end_time
        );
    };

    // =======================================
    // BOOK APPOINTMENT
    // =======================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        // ===================================
        // REQUIRED FIELD VALIDATION
        // ===================================

        if (
            !form.doctor_id ||
            !form.appointment_date ||
            !form.start_time ||
            !form.end_time
        ) {
            setError(
                "Please fill all required fields."
            );
            return;
        }

        // ===================================
        // DATE VALIDATION
        // ===================================

        if (form.appointment_date < today) {
            setError(
                "Appointment date cannot be in the past."
            );
            return;
        }

        // ===================================
        // TIME VALIDATION
        // ===================================

        if (
            form.start_time >=
            form.end_time
        ) {
            setError(
                "End time must be after start time."
            );
            return;
        }

        // ===================================
        // PREVENT BOOKING PAST TIME TODAY
        // ===================================

        if (
            form.appointment_date === today
        ) {
            const now = new Date();

            const currentTime =
                `${String(
                    now.getHours()
                ).padStart(2, "0")}:${String(
                    now.getMinutes()
                ).padStart(2, "0")}`;

            if (
                form.start_time <=
                currentTime
            ) {
                setError(
                    "You cannot book an appointment in the past."
                );
                return;
            }
        }

        // ===================================
        // CHECK DOCTOR AVAILABILITY
        // ===================================

        const selectedSlot =
            getSelectedAvailabilitySlot();

        if (!selectedSlot) {
            setError(
                "The doctor is not available during the selected date and time."
            );
            return;
        }

        // ===================================
        // BOOKING
        // ===================================

        try {
            setBooking(true);

            const data = {
                doctor_id:
                    Number(form.doctor_id),

                appointment_date:
                    form.appointment_date,

                start_time:
                    form.start_time,

                end_time:
                    form.end_time,

                notes:
                    form.notes.trim()
            };

            console.log(
                "Booking Data:",
                data
            );

            const res =
                await API.post(
                    "/appointments",
                    data
                );

            console.log(
                "Booking Response:",
                res.data
            );

            setMessage(
                res.data.message ||
                "Appointment booked successfully!"
            );

            // Keep doctor selected
            setForm({
                doctor_id:
                    form.doctor_id,

                appointment_date: "",

                start_time: "",

                end_time: "",

                notes: ""
            });

        } catch (err) {
            console.error(
                "Booking Error:",
                err.response?.data ||
                err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to book appointment."
            );

        } finally {
            setBooking(false);
        }
    };

    // =======================================
    // FORMAT DAY NAME
    // =======================================

    const getDayName = (day) => {
        const found =
            days.find(
                (item) =>
                    item.value ===
                    Number(day)
            );

        return found
            ? found.label
            : "Unknown";
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
                    marginBottom: "30px"
                }}
            >

                <div>
                    <h1>
                        📅 Book Appointment
                    </h1>

                    <p
                        style={{
                            color: "#6b7280"
                        }}
                    >
                        Schedule an appointment
                        with a doctor
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/patient")
                    }
                    style={buttonStyle}
                >
                    ← Dashboard
                </button>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    background: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow:
                        "0 2px 10px rgba(0,0,0,0.06)"
                }}
            >

                {/* DOCTOR */}

                <label>
                    <strong>
                        Choose Doctor *
                    </strong>
                </label>

                <select
                    name="doctor_id"
                    value={form.doctor_id}
                    onChange={handleChange}
                    required
                    disabled={loadingDoctors}
                    style={inputStyle}
                >

                    <option value="">
                        {loadingDoctors
                            ? "Loading doctors..."
                            : "Select a doctor"}
                    </option>

                    {doctors.map((doctor) => {

                        const doctorId =
                            doctor.doctor_id ||
                            doctor.id;

                        return (
                            <option
                                key={doctorId}
                                value={doctorId}
                            >
                                Dr.{" "}
                                {doctor.name}
                                {" - "}
                                {doctor.specialization}
                            </option>
                        );
                    })}

                </select>

                {/* AVAILABILITY */}

                {form.doctor_id && (
                    <div
                        style={{
                            background:
                                "#eff6ff",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    >

                        <strong>
                            🕐 Doctor Availability
                        </strong>

                        {loadingAvailability ? (

                            <p>
                                Loading
                                availability...
                            </p>

                        ) : availability.length === 0 ? (

                            <p
                                style={{
                                    color: "#b91c1c"
                                }}
                            >
                                No availability
                                has been added
                                for this doctor.
                            </p>

                        ) : (

                            <div
                                style={{
                                    marginTop: "10px"
                                }}
                            >

                                {availability.map(
                                    (slot) => (
                                        <div
                                            key={slot.id}
                                            style={{
                                                marginBottom:
                                                    "5px"
                                            }}
                                        >

                                            <strong>
                                                {
                                                    getDayName(
                                                        slot.day_of_week
                                                    )
                                                }
                                            </strong>

                                            {" : "}

                                            {
                                                slot.start_time
                                            }

                                            {" - "}

                                            {
                                                slot.end_time
                                            }

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>
                )}

                {/* DATE */}

                <label>
                    <strong>
                        Appointment Date *
                    </strong>
                </label>

                <input
                    type="date"
                    name="appointment_date"
                    value={
                        form.appointment_date
                    }
                    onChange={handleChange}
                    min={today}
                    required
                    style={inputStyle}
                />

                {/* SELECTED DAY AVAILABILITY */}

                {form.appointment_date && (
                    <div
                        style={{
                            background:
                                availableSlots.length
                                    ? "#f0fdf4"
                                    : "#fef2f2",

                            color:
                                availableSlots.length
                                    ? "#166534"
                                    : "#991b1b",

                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    >

                        {availableSlots.length ? (

                            <>
                                <strong>
                                    Available on{" "}
                                    {getDayName(
                                        selectedDay
                                    )}
                                </strong>

                                {availableSlots.map(
                                    (slot) => (
                                        <div
                                            key={slot.id}
                                            style={{
                                                marginTop:
                                                    "5px"
                                            }}
                                        >
                                            {
                                                slot.start_time
                                            }

                                            {" - "}

                                            {
                                                slot.end_time
                                            }
                                        </div>
                                    )
                                )}
                            </>

                        ) : (

                            <strong>
                                ❌ Doctor is not
                                available on{" "}
                                {getDayName(
                                    selectedDay
                                )}
                            </strong>

                        )}

                    </div>
                )}

                {/* START TIME */}

                <label>
                    <strong>
                        Start Time *
                    </strong>
                </label>

                <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                    disabled={
                        !form.appointment_date ||
                        availableSlots.length === 0 ||
                        loadingAvailability
                    }
                    style={inputStyle}
                />

                {/* END TIME */}

                <label>
                    <strong>
                        End Time *
                    </strong>
                </label>

                <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                    disabled={
                        !form.appointment_date ||
                        availableSlots.length === 0 ||
                        loadingAvailability
                    }
                    style={inputStyle}
                />

                {/* NOTES */}

                <label>
                    <strong>
                        Notes
                    </strong>
                </label>

                <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Enter reason for appointment..."
                    rows="4"
                    maxLength="500"
                    style={inputStyle}
                />

                {/* MESSAGES */}

                {message && (
                    <div style={successStyle}>
                        ✅ {message}
                    </div>
                )}

                {error && (
                    <div style={errorStyle}>
                        ❌ {error}
                    </div>
                )}

                {/* BOOK BUTTON */}

                <button
                    type="submit"
                    disabled={
                        booking ||
                        loadingDoctors ||
                        loadingAvailability ||
                        !form.doctor_id ||
                        !form.appointment_date ||
                        !form.start_time ||
                        !form.end_time ||
                        availableSlots.length === 0
                    }
                    style={{
                        width: "100%",
                        padding: "13px",
                        border: "none",
                        borderRadius: "8px",

                        background:
                            booking ||
                            loadingDoctors ||
                            loadingAvailability
                                ? "#9ca3af"
                                : "#2563eb",

                        color: "white",
                        fontSize: "16px",

                        cursor:
                            booking ||
                            loadingDoctors ||
                            loadingAvailability
                                ? "not-allowed"
                                : "pointer"
                    }}
                >

                    {booking
                        ? "Booking..."
                        : "📅 Book Appointment"}

                </button>

            </form>
        </div>
    );
}

// =======================================
// STYLES
// =======================================

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box"
};

const buttonStyle = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer"
};

const successStyle = {
    background: "#dcfce7",
    color: "#15803d",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px"
};

const errorStyle = {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px"
};

export default BookAppointment;