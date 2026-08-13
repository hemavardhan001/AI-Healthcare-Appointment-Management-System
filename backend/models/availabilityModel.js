const { getDB } = require('../config/database');

// Add Availability
const addAvailability = async (availability) => {
    const db = getDB();

    const result = await db.run(
        `INSERT INTO availability
        (doctor_id, day_of_week, start_time, end_time)
        VALUES (?, ?, ?, ?)`,
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

    return await db.all(`
        SELECT
            a.id,
            a.doctor_id,
            u.name AS doctor_name,
            d.specialization,
            a.day_of_week,
            a.start_time,
            a.end_time
        FROM availability a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        ORDER BY a.day_of_week, a.start_time
    `);
};

// Get Availability by Doctor
const getAvailabilityByDoctor = async (doctorId) => {
    const db = getDB();

    return await db.all(
        `SELECT *
         FROM availability
         WHERE doctor_id = ?
         ORDER BY day_of_week, start_time`,
        [doctorId]
    );
};

// Update Availability
const updateAvailability = async (id, availability) => {
    const db = getDB();

    await db.run(
        `UPDATE availability
         SET
            day_of_week = ?,
            start_time = ?,
            end_time = ?
         WHERE id = ?`,
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

    await db.run(
        `DELETE FROM availability WHERE id = ?`,
        [id]
    );
};

module.exports = {
    addAvailability,
    getAllAvailability,
    getAvailabilityByDoctor,
    updateAvailability,
    deleteAvailability
};