const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const validateObjectId = require("../middleware/validateObjectId");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { paginationValidator } = require("../validators/paginationValidator");
const { validate } = require("../middleware/validate");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/upload-resume",
  protect,
  authorize("student"),
  upload.single("resume"),
  studentController.uploadResume
);

router.post(
  "/profile",
  protect,
  authorize("student"),
  studentController.createProfile
);

router.get(
  "/me",
  protect,
  authorize("student"),
  studentController.getMe
);

router.put(
  "/me",
  protect,
  authorize("student"),
  studentController.updateMe
);

router.get(
  "/",
  protect,
  authorize("admin"),
  paginationValidator,
  validate,
  studentController.getStudents
);

router.post(
  "/",
  protect,
  authorize("admin"),
  studentController.createStudent
);

router.put(
  "/:id",
  protect,
  authorize("admin", "student"),
  validateObjectId,
  studentController.updateStudent
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  studentController.deleteStudent
);

module.exports = router;