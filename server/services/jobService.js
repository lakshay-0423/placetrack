const Application = require("../models/Application");
const Job = require("../models/Job");
const Company = require("../models/Company");
const { calculateScore } = require("../utils/candidateScoring");

exports.getRankedCandidates = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) {
      const error = new Error("Job not found");
      error.status = 404;
      throw error;
  }

  const applications = await Application.find({
    job: job._id
  }).populate({
    path: "student",
    populate: { path: "user" }
  });

  const ranked = applications.map(app => {
    const score = calculateScore(app.student, job);
    return {
      applicationId: app._id,
      student: app.student,
      status: app.status,
      score
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
};

exports.getJobs = async (pagination, user) => {
  const { page, limit, skip } = pagination;
    
  let filter = { isDeleted: false };
  if (user && user.role === "company") {
    const company = await Company.findOne({ user: user.id });
    if (company) filter.company = company._id;
  }

  const total = await Job.countDocuments(filter);

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("company");

  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    data: jobs
  };
};

exports.createJob = async (userId, payload) => {
  const company = await Company.findOne({ user: userId });

  if (!company) {
    const error = new Error("Company profile required");
    error.status = 400;
    throw error;
  }

  if (company.status !== "approved") {
    const error = new Error("Company not approved by admin");
    error.status = 403;
    throw error;
  }

  const job = await Job.create({
    ...payload,
    company: company._id
  });

  return job;
};

exports.updateJob = async (id, userId, userRole, payload) => {
  const jobToUpdate = await Job.findById(id);
  if (!jobToUpdate) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  if (userRole === "company") {
      const company = await Company.findOne({ user: userId });
      if (!company || company._id.toString() !== jobToUpdate.company.toString()) {
          const error = new Error("Not authorized to update this job");
          error.status = 403;
          throw error;
      }
  }

  const job = await Job.findByIdAndUpdate(
    id,
    payload,
    { new: true }
  );

  return job;
};

exports.deleteJob = async (id, userId, userRole) => {
  const jobToDelete = await Job.findById(id);
  if (!jobToDelete) {
      const error = new Error("Job not found");
      error.status = 404;
      throw error;
  }

  if (userRole === "company") {
      const company = await Company.findOne({ user: userId });
      if (!company || company._id.toString() !== jobToDelete.company.toString()) {
          const error = new Error("Not authorized to delete this job");
          error.status = 403;
          throw error;
      }
  }

  await Job.findByIdAndUpdate(id, { isDeleted: true });
  return { message: "Job deleted" };
};
