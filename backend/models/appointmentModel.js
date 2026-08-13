const { getDB } = require("../config/database");

// ==============================
// Create Appointment
// ==============================
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

// ==============================
// Check Slot Availability
// ==============================
const checkSlotAvailability = async (
    doctor_id,
    appointment_date,
    start_time,
    end_time
) => {

    const db = getDB();

    return await db.get(
        `
        SELECT id
        FROM appointments
        WHERE doctor_id = ?
        AND appointment_date = ?
        AND status = 'scheduled'
        AND (
            start_time < ?
            AND end_time > ?
        )
        `,
        [
            doctor_id,
            appointment_date,
            end_time,
            start_time
        ]
    );
};

// ==============================
// Get All Appointments
// ==============================
const getAllAppointments = async () => {

    const db = getDB();

    return await db.all(
        `
        SELECT
            a.*,
            p.name AS patient_name,
            u.name AS doctor_name
        FROM appointments a
        JOIN users p
            ON a.patient_id = p.id
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users u
            ON d.user_id = u.id
        ORDER BY appointment_date, start_time
        `
    );
};

// ==============================
// Get Patient Appointments
// ==============================
const getPatientAppointments = async (patient_id) => {

    const db = getDB();

    return await db.all(
        `
        SELECT
            a.*,
            u.name AS doctor_name,
            d.specialization
        FROM appointments a
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users u
            ON d.user_id = u.id
        WHERE a.patient_id = ?
        ORDER BY
            a.appointment_date DESC,
            a.start_time DESC
        `,
        [patient_id]
    );
};

// ==============================
// Get Appointment By ID
// ==============================
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

// ==============================
// Update Appointment
// ==============================
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

// ==============================
// Delete Appointment
// ==============================
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

module.exports = {
    createAppointment,
    checkSlotAvailability,
    getAllAppointments,
    getPatientAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
};