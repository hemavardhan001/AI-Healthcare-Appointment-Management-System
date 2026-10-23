
const {
  addAvailability,
  getAllAvailability,
  getAvailabilityByDoctor,
  getDoctorByUserId,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
} = require("../models/availabilityModel");

const { getDoctorById } = require("../models/doctorModel");

const isValidDay = (day) => {
  if (day === undefined || day === null || day === "") return false;
  const value = Number(day);
  return Number.isInteger(value) && value >= 0 && value <= 6;
};

const isValidTime = (time) =>
  typeof time === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

const isValidId = (id) => {
  if (id === undefined || id === null || id === "") return false;
  const value = Number(id);
  return Number.isInteger(value) && value > 0;
};

const handleError = (res, err, label) => {
  console.error(`${label}:`, err);
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

const validateAvailabilityInput = (req, res) => {
  const { day_of_week, start_time, end_time } = req.body;

  if (!isValidDay(day_of_week)) {
    res.status(400).json({
      success: false,
      message: "day_of_week must be between 0 (Sunday) and 6 (Saturday).",
    });
    return false;
  }

  if (!isValidTime(start_time) || !isValidTime(end_time)) {
    res.status(400).json({
      success: false,
      message: "Valid start_time and end_time in HH:MM format are required.",
    });
    return false;
  }

  if (start_time >= end_time) {
    res.status(400).json({
      success: false,
      message: "End time must be after start time.",
    });
    return false;
  }

  return true;
};

// Create availability
const createAvailability = async (req, res) => {
  try {
    if (!validateAvailabilityInput(req, res)) return;

    const { doctor_id, day_of_week, start_time, end_time } = req.body;
    let finalDoctorId;

    if (req.user.role === "admin") {
      if (!isValidId(doctor_id)) {
        return res.status(400).json({
          success: false,
          message: "A valid doctor_id is required.",
        });
      }

      finalDoctorId = Number(doctor_id);

      const doctor = await getDoctorById(finalDoctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found.",
        });
      }
    } else if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user.id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found for this account.",
        });
      }

      finalDoctorId = Number(doctor.doctor_id);
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create availability.",
      });
    }

    const availabilityId = await addAvailability({
      doctor_id: finalDoctorId,
      day_of_week: Number(day_of_week),
      start_time,
      end_time,
    });

    return res.status(201).json({
      success: true,
      message: "Availability added successfully.",
      availabilityId,
    });
  } catch (err) {
    return handleError(res, err, "Create availability error");
  }
};

// Get all availability
const getAvailability = async (req, res) => {
  try {
    const availability = await getAllAvailability();

    return res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (err) {
    return handleError(res, err, "Get availability error");
  }
};

// Get availability for a doctor
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!isValidId(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await getDoctorById(Number(doctorId));
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const availability = await getAvailabilityByDoctor(Number(doctorId));

    return res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (err) {
    return handleError(res, err, "Get doctor availability error");
  }
};

// Update availability
const editAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability ID.",
      });
    }

    if (!validateAvailabilityInput(req, res)) return;

    const availabilityId = Number(id);
    const existing = await getAvailabilityById(availabilityId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user.id);

      if (!doctor || Number(existing.doctor_id) !== Number(doctor.doctor_id)) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own availability.",
        });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update availability.",
      });
    }

    const result = await updateAvailability(availabilityId, {
      day_of_week: Number(req.body.day_of_week),
      start_time: req.body.start_time,
      end_time: req.body.end_time,
    });

    if (!result || result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Availability was not updated.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully.",
    });
  } catch (err) {
    return handleError(res, err, "Update availability error");
  }
};

// Delete availability
const removeAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability ID.",
      });
    }

    const availabilityId = Number(id);
    const existing = await getAvailabilityById(availabilityId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user.id);

      if (!doctor || Number(existing.doctor_id) !== Number(doctor.doctor_id)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own availability.",
        });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete availability.",
      });
    }

    const result = await deleteAvailability(availabilityId);

    if (!result || result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Availability was not deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully.",
    });
  } catch (err) {
    return handleError(res, err, "Delete availability error");
  }
};

module.exports = {
  createAvailability,
  getAvailability,
  getDoctorAvailability,
  editAvailability,
  removeAvailability,
};
