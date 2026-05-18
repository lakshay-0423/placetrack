const { body } = require("express-validator");

exports.signupValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "student", "company"])
    .withMessage("Invalid role"),
];