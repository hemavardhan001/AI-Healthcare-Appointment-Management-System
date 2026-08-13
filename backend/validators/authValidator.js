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

// Register Validation
const registerValidation = [
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters"),

    body("email")
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("phone")
        .optional()
        .isMobilePhone("any")
        .withMessage("Invalid phone number"),

    body("role")
        .isIn(["patient", "doctor", "admin"])
        .withMessage("Invalid role"),

    validate
];

// Login Validation
const loginValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    validate
];

module.exports = {
    registerValidation,
    loginValidation
};