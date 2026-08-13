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
            id,
            name,
            email,
            phone,
            role,
            created_at
         FROM users
         WHERE id = ?`,
        [id]
    );
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};