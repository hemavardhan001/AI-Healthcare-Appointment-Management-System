const { getDB } = require("../config/database");

// Add Availability
const addAvailability = async (availability) => {
    const db = getDB();

    const result = await db.run(
        `
        INSERT INTO availability
        (
            doctor_id,
            day_of_week,
            start_time,
            end_time
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            availability.doctor_id,
            availability.day_of_week,
            availability.start_time,
            availability.end_time
        ]
    );

    return result.lastID;
};

// Get All Availability
const getAllAvailability = async () => {
    const db = getDB();

    return await db.all(
        `
        SELECT
            a.id,
            a.doctor_id,
            u.name AS doctor_name,
            u.email AS doctor_email,
            d.specialization,
            a.day_of_week,
            a.start_time,
            a.end_time
        FROM availability a
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users u
            ON d.user_id = u.id
        ORDER BY
            a.day_of_week ASC,
            a.start_time ASC
        `
    );
};

// Get Availability by Doctor ID
const getAvailabilityByDoctor = async (doctorId) => {
    const db = getDB();

    return await db.all(
        `
        SELECT
            a.id,
            a.doctor_id,
            u.name AS doctor_name,
            u.email AS doctor_email,
            d.specialization,
            a.day_of_week,
            a.start_time,
            a.end_time
        FROM availability a
        JOIN doctors d
            ON a.doctor_id = d.id
        JOIN users u
            ON d.user_id = u.id
        WHERE a.doctor_id = ?
        ORDER BY
            a.day_of_week ASC,
            a.start_time ASC
        `,
        [doctorId]
    );
};

// Add/update helper: Find doctor by logged-in user ID
const getDoctorByUserId = async (userId) => {
    const db = getDB();

    return await db.get(
        `
        SELECT
            d.id AS doctor_id,
            d.user_id,
            u.name,
            u.email,
            d.specialization
        FROM doctors d
        JOIN users u
            ON d.user_id = u.id
        WHERE d.user_id = ?
        `,
        [userId]
    );
};

// Get Availability by Availability ID
const getAvailabilityById = async (id) => {
    const db = getDB();

    return await db.get(
        `
        SELECT
            a.*,
            d.user_id
        FROM availability a
        JOIN doctors d
            ON a.doctor_id = d.id
        WHERE a.id = ?
        `,
        [id]
    );
};

// Update Availability
const updateAvailability = async (id, availability) => {
    const db = getDB();

    return await db.run(
        `
        UPDATE availability
        SET
            day_of_week = ?,
            start_time = ?,
            end_time = ?
        WHERE id = ?
        `,
        [
            availability.day_of_week,
            availability.start_time,
            availability.end_time,
            id
        ]
    );
};

// Delete Availability
const deleteAvailability = async (id) => {
    const db = getDB();

    return await db.run(
        `
        DELETE FROM availability
        WHERE id = ?
        `,
        [id]
    );
};

module.exports = {
    addAvailability,
    getAllAvailability,
    getAvailabilityByDoctor,
    getDoctorByUserId,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
};