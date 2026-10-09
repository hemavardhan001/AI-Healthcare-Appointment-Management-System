const { getDB } = require('../config/database');

const createUser = async (user) => {
    const db = getDB();

    const result = await db.run(
        `INSERT INTO users (name, email, password, phone, role)
         VALUES (?, ?, ?, ?, ?)`,
        [
            user.name,
            user.email,
            user.password,
            user.phone,
            user.role
        ]
    );

    return result.lastID;
};

const findUserByEmail = async (email) => {
    const db = getDB();

    return await db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );
};

const findUserById = async (id) => {
    const db = getDB();

    return await db.get(
        `SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.role,
            u.created_at,
            d.id AS doctor_id,
            d.specialization
         FROM users u
         LEFT JOIN doctors d
            ON d.user_id = u.id
         WHERE u.id = ?`,
        [id]
    );
};

// ===============================
// Update User Profile
// ===============================
const updateUserProfile = async (id, user) => {
    const db = getDB();

    return await db.run(
        `UPDATE users
         SET
            name = ?,
            email = ?,
            phone = ?
         WHERE id = ?`,
        [
            user.name,
            user.email,
            user.phone,
            id
        ]
    );
};
const updateUserPassword = async (id, password) => {
    const db = getDB();

    return await db.run(
        `UPDATE users SET password = ? WHERE id = ?`,
        [password, id]
    );
};
module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword
};