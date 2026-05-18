const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const reportsController = require("../controllers/reportsController");

// All routes require admin authentication
router.use(protect, authorize("admin"));

// EJS page routes
router.get("/reports", reportsController.analyticsDashboard);
router.get("/leaderboard", reportsController.leaderboard);
router.get("/company-history", reportsController.companyHistory);
router.get("/company-analytics", reportsController.companyAnalytics);

// Data sync API
router.post("/reports/sync", reportsController.syncData);

module.exports = router;
