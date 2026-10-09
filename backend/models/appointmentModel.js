const { getDB } = require("../config/database");

// =======================================
// Create Appointment
// =======================================

const createAppointment = async (appointment) => {
    const db = getDB();

    const result = await db.run(
        `
        INSERT INTO appointments
        (
            patient_id,
            doctor_id,
            appointment_date,
            start_time,
            end_time,
            status,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            appointment.patient_id,
            appointment.doctor_id,
            appointment.appointment_date,
            appointment.start_time,
            appointment.end_time,
            appointment.status,
            appointment.notes || null
        ]
    );

    return result.lastID;
};


// =======================================
// Check Doctor Availability
// =======================================

const checkDoctorAvailability = async (
    doctor_id,
    appointment_date,
    start_time,
    end_time
) => {
    const db = getDB();

    // Validate YYYY-MM-DD and calculate weekday
    // without timezone conversion.
    if (
        typeof appointment_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)
    ) {
        return false;
    }

    const [year, month, day] = appointment_date
        .split("-")
        .map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    // Reject impossible calendar dates
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return false;
    }

    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfWeek = date.getUTCDay();

    const availability = await db.get(
        `
        SELECT id
        FROM availability
        WHERE doctor_id = ?
          AND day_of_week = ?
          AND start_time <= ?
          AND end_time >= ?
        LIMIT 1
        `,
        [
            doctor_id,
            dayOfWeek,
            start_time,
            end_time
        ]
    );

    return Boolean(availability);
};


// =======================================
// Check Slot Availability
// Prevent Double Booking
// Optionally exclude an appointment being
// rescheduled.
// =======================================

const checkSlotAvailability = async (
    doctor_id,
    appointment_date,
    start_time,
    end_time,
    excludeAppointmentId = null
) => {
    const db = getDB();

    return await db.get(
        `
        SELECT id
        FROM appointments
        WHERE doctor_id = ?
          AND appointment_date = ?
          AND status = 'scheduled'
          AND start_time < ?
          AND end_time > ?
          AND (? IS NULL OR id != ?)
        LIMIT 1
        `,
        [
            doctor_id,
            appointment_date,
            end_time,
            start_time,
            excludeAppointmentId,
            excludeAppointmentId
        ]
    );
};


// =======================================
// Get All Appointments
// Admin
// =======================================

const getAllAppointments = async () => {
    const db = getDB();

    return await db.all(
        `
        SELECT
            a.*,
            p.name AS patient_name,
            u.name AS doctor_name,
            d.specialization
        FROM appointments a
        JOIN users p
            ON a.patient_id = p.id
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users u
            ON d.user_id = u.id
        ORDER BY
            a.appointment_date ASC,
            a.start_time ASC
        `
    );
};


// =======================================
// Get Patient's Appointments
// =======================================

const getPatientAppointments = async (patient_id) => {
    const db = getDB();

    return await db.all(
        `
        SELECT
            a.id,
            a.patient_id,
            a.doctor_id,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.status,
            a.notes,
            a.reminder_sent,
            a.created_at,
            u.name AS doctor_name,
            d.specialization
        FROM appointments a
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users u
            ON d.user_id = u.id
        WHERE a.patient_id = ?
        ORDER BY
            a.appointment_date ASC,
            a.start_time ASC
        `,
        [patient_id]
    );
};


// =======================================
// Get Doctor's Appointments
// =======================================

const getDoctorAppointments = async (user_id) => {
    const db = getDB();

    return await db.all(
        `
        SELECT
            a.id,
            a.patient_id,
            a.doctor_id,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.status,
            a.notes,
            a.reminder_sent,
            a.created_at,
            p.name AS patient_name,
            p.email AS patient_email,
            p.phone AS patient_phone
        FROM appointments a
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users p
            ON a.patient_id = p.id
        WHERE d.user_id = ?
        ORDER BY
            a.appointment_date ASC,
            a.start_time ASC
        `,
        [user_id]
    );
};


// =======================================
// Get Appointment By ID
// =======================================

const getAppointmentById = async (id) => {
    const db = getDB();

    return await db.get(
        `
        SELECT *
        FROM appointments
        WHERE id = ?
        `,
        [id]
    );
};


// =======================================
// Update Appointment
// =======================================

const updateAppointment = async (id, appointment) => {
    const db = getDB();

    return await db.run(
        `
        UPDATE appointments
        SET
            appointment_date = ?,
            start_time = ?,
            end_time = ?,
            status = ?,
            notes = ?
        WHERE id = ?
        `,
        [
            appointment.appointment_date,
            appointment.start_time,
            appointment.end_time,
            appointment.status,
            appointment.notes,
            id
        ]
    );
};


// =======================================
// Delete Appointment
// =======================================

const deleteAppointment = async (id) => {
    const db = getDB();

    return await db.run(
        `
        DELETE FROM appointments
        WHERE id = ?
        `,
        [id]
    );
};


// =======================================
// Export Functions
// =======================================

module.exports = {
    createAppointment,
    checkDoctorAvailability,
    checkSlotAvailability,
    getAllAppointments,
    getPatientAppointments,
    getDoctorAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
};