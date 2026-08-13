const { body, validationResult } = require("express-validator");

// Handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

const appointmentValidation = [

    body("patient_id")
        .isInt({ min: 1 })
        .withMessage("Valid patient ID is required"),

    body("doctor_id")
        .isInt({ min: 1 })
        .withMessage("Valid doctor ID is required"),

    body("appointment_date")
        .isISO8601()
        .withMessage("Appointment date must be YYYY-MM-DD"),

    body("start_time")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Start time must be HH:MM"),

    body("end_time")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("End time must be HH:MM"),

    body("notes")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Notes cannot exceed 500 characters"),

    validate
];

module.exports = {
    appointmentValidation
};