const { body } = require("express-validator");

exports.createJobValidator = [
  body("title").notEmpty().withMessage("Job title required"),
  body("minCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0 and 10"),
  body("requiredSkills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array"),
];