
const { getDB } = require("../config/database");

// Add Doctor
const createDoctor = async (doctor) => {
  const db = getDB();

  const result = await db.run(
    `INSERT INTO doctors
      (user_id, specialization, bio, experience_years, is_active)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id`,
    [
      doctor.user_id,
      doctor.specialization,
      doctor.bio,
      doctor.experience_years,
      doctor.is_active ?? 1,
    ]
  );

  return result.lastID;
};

// Get All Doctors
const getAllDoctors = async () => {
  const db = getDB();

  return db.all(`
    SELECT
      d.id,
      u.name,
      u.email,
      u.phone,
      d.specialization,
      d.bio,
      d.experience_years,
      d.is_active
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.id
  `);
};

// Get Doctor By ID
const getDoctorById = async (id) => {
  const db = getDB();

  return db.get(
    `SELECT
       d.id,
       u.name,
       u.email,
       u.phone,
       d.specialization,
       d.bio,
       d.experience_years,
       d.is_active
     FROM doctors d
     JOIN users u ON d.user_id = u.id
     WHERE d.id = ?`,
    [id]
  );
};

// Update Doctor
const updateDoctor = async (id, doctor) => {
  const db = getDB();

  return db.run(
    `UPDATE doctors
     SET
       specialization = ?,
       bio = ?,
       experience_years = ?,
       is_active = ?
     WHERE id = ?`,
    [
      doctor.specialization,
      doctor.bio,
      doctor.experience_years,
      doctor.is_active,
      id,
    ]
  );
};

// Delete Doctor
const deleteDoctor = async (id) => {
  const db = getDB();

  return db.run(
    `DELETE FROM doctors WHERE id = ?`,
    [id]
  );
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
