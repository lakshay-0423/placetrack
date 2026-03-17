const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  adminController.getDashboardStats
);

router.get(
  "/companies/pending",
  protect,
  authorize("Admin"),
  adminController.getPendingCompanies
);

router.put(
  "/companies/:id/approve",
  protect,
  authorize("Admin"),
  adminController.approveCompany
);

router.put(
  "/companies/:id/reject",
  protect,
  authorize("Admin"),
  adminController.rejectCompany
);

module.exports = router;