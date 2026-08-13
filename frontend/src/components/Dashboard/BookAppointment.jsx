import { useState } from "react";
import API from "../../services/api";

function BookAppointment() {
    const [form, setForm] = useState({
        doctor_id: "",
        appointment_date: "",
        start_time: "",
        end_time: "",
        notes: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            await API.post("/appointments", {
                patient_id: user.id,
                doctor_id: Number(form.doctor_id),
                appointment_date: form.appointment_date,
                start_time: form.start_time,
                end_time: form.end_time,
                notes: form.notes,
            });

            alert("✅ Appointment booked successfully!");

            setForm({
                doctor_id: "",
                appointment_date: "",
                start_time: "",
                end_time: "",
                notes: "",
            });

        } catch (err) {
            alert(err.response?.data?.message || "Booking failed");
        }
    };

    return (
        <div>
            <h2>📅 Book Appointment</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="number"
                    name="doctor_id"
                    placeholder="Doctor ID"
                    value={form.doctor_id}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="appointment_date"
                    value={form.appointment_date}
                    onChange={handleChange}
                    required
                />

                <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                />

                <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="notes"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={handleChange}
                />

                <button type="submit">
                    Book Appointment
                </button>

            </form>
        </div>
    );
}

export default BookAppointment;