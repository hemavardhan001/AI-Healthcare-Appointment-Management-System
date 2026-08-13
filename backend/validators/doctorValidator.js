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

// Doctor Validation
const doctorValidation = [
    body("user_id")
        .isInt({ min: 1 })
        .withMessage("Valid user ID is required"),

    body("specialization")
        .trim()
        .notEmpty()
        .withMessage("Specialization is required"),

    body("bio")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Bio cannot exceed 500 characters"),

    body("experience_years")
        .isInt({ min: 0 })
        .withMessage("Experience must be a non-negative integer"),

    body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be true or false"),

    validate
];

module.exports = {
    doctorValidation
};