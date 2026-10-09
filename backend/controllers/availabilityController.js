const {
    addAvailability,
    getAllAvailability,
    getAvailabilityByDoctor,
    getDoctorByUserId,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
} = require("../models/availabilityModel");

// =====================================================
// VALIDATION HELPERS
// =====================================================

const isValidDay = (day) => {
    if (
        day === undefined ||
        day === null ||
        day === ""
    ) {
        return false;
    }

    const value = Number(day);

    return (
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 6
    );
};

const isValidTime = (time) => {
    return (
        typeof time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    );
};

const isValidId = (id) => {
    const value = Number(id);

    return (
        id !== undefined &&
        id !== null &&
        id !== "" &&
        Number.isInteger(value) &&
        value > 0
    );
};

const handleError = (res, err, label) => {
    console.error(`${label}:`, err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

// =====================================================
// ADD AVAILABILITY
// =====================================================

const createAvailability = async (req, res) => {
    try {
        const {
            doctor_id,
            day_of_week,
            start_time,
            end_time
        } = req.body;

        // Validate day: 0 = Sunday, 6 = Saturday
        if (!isValidDay(day_of_week)) {
            return res.status(400).json({
                success: false,
                message:
                    "A valid day_of_week from 0 (Sunday) to 6 (Saturday) is required."
            });
        }

        // Validate time format
        if (
            !isValidTime(start_time) ||
            !isValidTime(end_time)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid start_time and end_time in HH:MM format are required."
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time."
            });
        }

        let finalDoctorId;

        // Admin can create availability for any doctor
        if (req.user.role === "admin") {
            if (!isValidId(doctor_id)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A valid doctor_id is required for admin."
                });
            }

            finalDoctorId = Number(doctor_id);

        } else if (req.user.role === "doctor") {
            // Doctor can create availability only for themselves
            const doctor =
                await getDoctorByUserId(req.user.id);

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found."
                });
            }

            finalDoctorId = doctor.doctor_id;

        } else {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to create availability."
            });
        }

        const availabilityId = await addAvailability({
            doctor_id: finalDoctorId,
            day_of_week: Number(day_of_week),
            start_time,
            end_time
        });

        return res.status(201).json({
            success: true,
            message: "Availability added successfully.",
            availabilityId
        });

    } catch (err) {
        return handleError(
            res,
            err,
            "Create availability error"
        );
    }
};

// =====================================================
// GET ALL AVAILABILITY
// =====================================================

const getAvailability = async (req, res) => {
    try {
        const availability = await getAllAvailability();

        return res.status(200).json({
            success: true,
            count: availability.length,
            availability
        });

    } catch (err) {
        return handleError(
            res,
            err,
            "Get availability error"
        );
    }
};

// =====================================================
// GET AVAILABILITY BY DOCTOR
// =====================================================

const getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!isValidId(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid doctor ID."
            });
        }

        const availability =
            await getAvailabilityByDoctor(Number(doctorId));

        return res.status(200).json({
            success: true,
            count: availability.length,
            availability
        });

    } catch (err) {
        return handleError(
            res,
            err,
            "Get doctor availability error"
        );
    }
};

// =====================================================
// UPDATE AVAILABILITY
// =====================================================

const editAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            day_of_week,
            start_time,
            end_time
        } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid availability ID."
            });
        }

        if (!isValidDay(day_of_week)) {
            return res.status(400).json({
                success: false,
                message:
                    "A valid day_of_week from 0 (Sunday) to 6 (Saturday) is required."
            });
        }

        if (
            !isValidTime(start_time) ||
            !isValidTime(end_time)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid start_time and end_time in HH:MM format are required."
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time."
            });
        }

        const existingAvailability =
            await getAvailabilityById(Number(id));

        if (!existingAvailability) {
            return res.status(404).json({
                success: false,
                message: "Availability not found."
            });
        }

        // Check doctor ownership
        if (req.user.role === "doctor") {
            const doctor =
                await getDoctorByUserId(req.user.id);

            if (
                !doctor ||
                Number(existingAvailability.doctor_id) !==
                    Number(doctor.doctor_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only update your own availability."
                });
            }

        } else if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to update availability."
            });
        }

        await updateAvailability(Number(id), {
            day_of_week: Number(day_of_week),
            start_time,
            end_time
        });

        return res.status(200).json({
            success: true,
            message: "Availability updated successfully."
        });

    } catch (err) {
        return handleError(
            res,
            err,
            "Update availability error"
        );
    }
};

// =====================================================
// DELETE AVAILABILITY
// =====================================================

const removeAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid availability ID."
            });
        }

        const existingAvailability =
            await getAvailabilityById(Number(id));

        if (!existingAvailability) {
            return res.status(404).json({
                success: false,
                message: "Availability not found."
            });
        }

        // Check doctor ownership
        if (req.user.role === "doctor") {
            const doctor =
                await getDoctorByUserId(req.user.id);

            if (
                !doctor ||
                Number(existingAvailability.doctor_id) !==
                    Number(doctor.doctor_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only delete your own availability."
                });
            }

        } else if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to delete availability."
            });
        }

        await deleteAvailability(Number(id));

        return res.status(200).json({
            success: true,
            message: "Availability deleted successfully."
        });

    } catch (err) {
        return handleError(
            res,
            err,
            "Delete availability error"
        );
    }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    createAvailability,
    getAvailability,
    getDoctorAvailability,
    editAvailability,
    removeAvailability
};