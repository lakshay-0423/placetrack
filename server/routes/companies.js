const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const validateObjectId = require("../middleware/validateObjectId");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get("/", protect, companyController.getCompanies);

router.post(
  "/profile",
  protect,
  authorize("company"),
  companyController.createCompanyProfile
);

router.get(
  "/me",
  protect,
  authorize("company"),
  companyController.getMe
);

router.put(
  "/me",
  protect,
  authorize("company"),
  companyController.updateMe
);

router.post(
  "/",
  protect,
  authorize("admin"),
  companyController.createCompany
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  companyController.updateCompany
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  companyController.deleteCompany
);

module.exports = router;
