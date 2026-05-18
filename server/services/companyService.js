const Company = require("../models/Company");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

exports.getCompanies = async () => {
  const companies = await Company.find({ isDeleted: false });
  return companies;
};

exports.createCompany = async (payload) => {
  const company = await Company.create(payload);
  return company;
};

exports.updateCompany = async (id, payload) => {
  const company = await Company.findByIdAndUpdate(id, payload, { new: true });
  if (!company) {
    const error = new Error("Company not found");
    error.status = 404;
    throw error;
  }
  return company;
};

exports.deleteCompany = async (id) => {
  const company = await Company.findByIdAndUpdate(id, { isDeleted: true });
  if (!company) {
    const error = new Error("Company not found");
    error.status = 404;
    throw error;
  }
  await User.findByIdAndUpdate(company.user, { isDeleted: true });
  return { message: "Company deleted" };
};

exports.createCompanyProfile = async (userId, payload) => {
  const exists = await Company.findOne({ user: userId, isDeleted: false });
  if (exists) {
    const error = new Error("Profile already exists");
    error.status = 400;
    throw error;
  }

  const profile = await Company.create({
    user: userId,
    name: payload.name,
    location: payload.location,
    description: payload.description
  });
  return profile;
};

exports.getMe = async (userId) => {
  const company = await Company.findOne({ user: userId });
  if (!company) return {};

  const jobs = await Job.find({ company: company._id, isDeleted: false });
  const jobIds = jobs.map(j => j._id);
        
  const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });
  const shortlistedCandidates = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted" });
        
  return {
    ...company.toObject(),
    stats: {
        totalApplicants,
        shortlistedCandidates
    }
  };
};

exports.updateMe = async (userId, payload) => {
  const updatePayload = { ...payload, user: userId };
  if (!updatePayload.name) {
    const user = await User.findById(userId);
    if (user) {
      updatePayload.name = user.name;
    }
  }

  const company = await Company.findOneAndUpdate(
    { user: userId },
    { $set: updatePayload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return company;
};
