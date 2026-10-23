
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../models/doctorModel");

const { getDoctorByUserId } = require("../models/availabilityModel");

const parsePositiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Add Doctor
const addDoctor = async (req, res) => {
  try {
    const user_id = parsePositiveId(req.body.user_id);
    const {
      specialization,
      bio,
      experience_years,
      is_active,
    } = req.body;

    if (!user_id || typeof specialization !== "string" || !specialization.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID and specialization are required.",
      });
    }

    if (
      experience_years !== undefined &&
      experience_years !== null &&
      (!Number.isInteger(Number(experience_years)) || Number(experience_years) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience years must be a non-negative integer.",
      });
    }

    if (is_active !== undefined && ![0, 1, true, false].includes(is_active)) {
      return res.status(400).json({
        success: false,
        message: "is_active must be true, false, 1, or 0.",
      });
    }

    const existingUserDoctor = await getDoctorByUserId(user_id);
    if (existingUserDoctor) {
      return res.status(409).json({
        success: false,
        message: "A doctor profile already exists for this user.",
      });
    }

    const doctorId = await createDoctor({
      user_id,
      specialization: specialization.trim(),
      bio: typeof bio === "string" ? bio.trim() : null,
      experience_years:
        experience_years === undefined || experience_years === null
          ? 0
          : Number(experience_years),
      is_active:
        is_active === undefined
          ? 1
          : is_active === true
            ? 1
            : is_active === false
              ? 0
              : Number(is_active),
    });

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully.",
      doctorId,
    });
  } catch (err) {
    console.error("Add doctor error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to add doctor.",
    });
  }
};

// Get All Doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctors();

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    console.error("Get doctors error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve doctors.",
    });
  }
};

// Get Doctor By ID
const getDoctor = async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (err) {
    console.error("Get doctor error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve doctor.",
    });
  }
};

// Get Logged-in Doctor
const getMyDoctor = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.user.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (err) {
    console.error("Get my doctor error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your doctor profile.",
    });
  }
};

// Update Doctor
const editDoctor = async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const existing = await getDoctorById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const {
      specialization = existing.specialization,
      bio = existing.bio,
      experience_years = existing.experience_years,
      is_active = existing.is_active,
    } = req.body;

    if (typeof specialization !== "string" || !specialization.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid specialization is required.",
      });
    }

    if (
      experience_years !== null &&
      (!Number.isInteger(Number(experience_years)) || Number(experience_years) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience years must be a non-negative integer.",
      });
    }

    if (![0, 1, true, false].includes(is_active)) {
      return res.status(400).json({
        success: false,
        message: "is_active must be true, false, 1, or 0.",
      });
    }

    const result = await updateDoctor(id, {
      specialization: specialization.trim(),
      bio: typeof bio === "string" ? bio.trim() : bio,
      experience_years: Number(experience_years),
      is_active: is_active === true ? 1 : is_active === false ? 0 : Number(is_active),
    });

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: "No doctor changes were saved.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully.",
    });
  } catch (err) {
    console.error("Update doctor error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to update doctor.",
    });
  }
};

// Delete Doctor
const removeDoctor = async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const existing = await getDoctorById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const result = await deleteDoctor(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor could not be deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully.",
    });
  } catch (err) {
    console.error("Delete doctor error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to delete doctor.",
    });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  getDoctor,
  getMyDoctor,
  editDoctor,
  removeDoctor,
};
