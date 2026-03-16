const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      students: await Student.countDocuments(),
      companies: await Company.countDocuments(),
      jobs: await Job.countDocuments(),
      applications: await Application.countDocuments(),
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getPendingCompanies = async (req, res, next) => {
  try {

    const companies = await Company.find({ status: "pending" })
      .populate("user", "email role");

    res.json(companies);

  } catch (error) {
    next(error);
  }
};

exports.approveCompany = async (req, res, next) => {
  try {

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    res.json({
      message: "Company approved",
      company
    });

  } catch (error) {
    next(error);
  }
};

exports.rejectCompany = async (req, res, next) => {
  try {

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    res.json({
      message: "Company rejected",
      company
    });

  } catch (error) {
    next(error);
  }
};