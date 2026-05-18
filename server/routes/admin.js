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
  authorize("admin"),
  adminController.getPendingCompanies
);

router.put(
  "/companies/:id/approve",
  protect,
  authorize("admin"),
  adminController.approveCompany
);

router.put(
  "/companies/:id/reject",
  protect,
  authorize("admin"),
  adminController.rejectCompany
);

module.exports = router;