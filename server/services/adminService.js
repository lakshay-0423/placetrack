const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

exports.getDashboardStats = async () => {
  const stats = {
    users: await User.countDocuments({ isDeleted: { $ne: true } }),
    students: await Student.countDocuments({ isDeleted: { $ne: true } }),
    companies: await Company.countDocuments({ isDeleted: { $ne: true } }),
    jobs: await Job.countDocuments({ isDeleted: { $ne: true } }),
    applications: await Application.countDocuments({ isDeleted: { $ne: true } }),
    placementsSecured: await Application.countDocuments({ status: "Accepted", isDeleted: { $ne: true } }),
  };

  return stats;
};

exports.getPendingCompanies = async () => {
  const companies = await Company.find({ status: "pending" })
    .populate("user", "email role");

  return companies;
};

exports.approveCompany = async (id) => {
  const company = await Company.findByIdAndUpdate(
    id,
    { status: "approved" },
    { new: true }
  );

  return {
    message: "Company approved",
    company
  };
};

exports.rejectCompany = async (id) => {
  const company = await Company.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true }
  );

  return {
    message: "Company rejected",
    company
  };
};
