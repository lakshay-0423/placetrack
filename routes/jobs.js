const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const validateObjectId = require("../middleware/validateObjectId");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const { createJobValidator } = require("../validators/jobValidators");

router.get(
  "/",
  protect,
  authorize("student", "admin", "company"),
  jobController.getJobs
);


router.post(
  "/",
  protect,
  authorize("admin","Company"),
  createJobValidator,
  validate,
  jobController.createJob
);

router.put(
  "/:id",
  protect,
  authorize("admin", "company"),
  validateObjectId,
  jobController.updateJob
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  jobController.deleteJob
);

router.get(
  "/:id/rank",
  protect,
  authorize("company", "admin"),
  jobController.getRankedCandidates
);

module.exports = router;