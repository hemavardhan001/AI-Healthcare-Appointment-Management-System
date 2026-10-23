
const { body, validationResult } = require("express-validator");

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array(),
    });
  }

  next();
};

// Doctor Validation
const doctorValidation = [
  body("user_id")
    .isInt({ min: 1 })
    .withMessage("Valid user ID is required.")
    .toInt(),

  body("specialization")
    .isString()
    .withMessage("Specialization must be text.")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required.")
    .isLength({ max: 100 })
    .withMessage("Specialization cannot exceed 100 characters."),

  body("bio")
    .optional({ nullable: true })
    .isString()
    .withMessage("Bio must be text.")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters."),

  body("experience_years")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Experience must be an integer between 0 and 100.")
    .toInt(),

  body("is_active")
    .optional()
    .custom((value) => {
      if (![true, false, 0, 1, "0", "1", "true", "false"].includes(value)) {
        throw new Error("is_active must be true, false, 1, or 0.");
      }
      return true;
    })
    .customSanitizer((value) => {
      return value === true || value === 1 ||
        value === "1" || value === "true" ? 1 : 0;
    }),

  validate,
];

module.exports = {
  doctorValidation,
};
