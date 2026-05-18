const adminService = require("../services/adminService");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await adminService.getPendingCompanies();
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

exports.approveCompany = async (req, res, next) => {
  try {
    const result = await adminService.approveCompany(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.rejectCompany = async (req, res, next) => {
  try {
    const result = await adminService.rejectCompany(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};