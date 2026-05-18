const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { signupValidator } = require("../validators/authValidators");
const { validate } = require("../middleware/validate");

const protect = require("../middleware/authMiddleware");

router.post("/signup", signupValidator, validate, authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);

module.exports = router;