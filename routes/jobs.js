const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const validateObjectId = require("../middleware/validateObjectId");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get(
  "/",
  protect,
  authorize("student", "admin", "company"),
  jobController.getJobs
);

router.post(
  "/",
  protect,
  authorize("admin", "company"),
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