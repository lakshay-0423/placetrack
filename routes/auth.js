const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { signupValidator } = require("../validators/authValidators");
const { validate } = require("../middleware/validate");

router.post("/signup", signupValidator, validate, authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;