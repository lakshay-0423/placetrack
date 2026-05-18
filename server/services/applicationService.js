const Job = require("../models/Job");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Application = require("../models/Application");

exports.getApplications = async (pagination, user) => {
  const { page, limit, skip } = pagination;

  let filter = {};
  if (user.role === "student") {
    const student = await Student.findOne({ user: user.id });
    if (student) filter.student = student._id;
  }

  const total = await Application.countDocuments(filter);

  const applications = await Application.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("student")
    .populate({ path: "job", populate: { path: "company" } });

  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    data: applications
  };
};

exports.applyJob = async (userId, jobId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) {
    const error = new Error("Student profile required");
    error.status = 400;
    throw error;
  }

  if (!student.resume || !student.resume.url) {
    const error = new Error("Please upload your resume before applying");
    error.status = 400;
    throw error;
  }

  const job = await Job.findById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  const existingApplication = await Application.findOne({ student: student._id, job: job._id });
  if (existingApplication) {
    const error = new Error("You have already applied to this job");
    error.status = 400;
    throw error;
  }

  const application = await Application.create({
    student: student._id,
    job: job._id,
    status: "Pending",
    resume: student.resume
  });

  return {
    message: "Application submitted",
    application
  };
};

exports.updateApplicationStatus = async (id, userId, userRole, status) => {
  if (!["Pending", "Accepted", "Rejected"].includes(status)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  const application = await Application.findById(id).populate("job");
  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    throw error;
  }

  // Only the company that posted the job or an admin should be able to update status
  if (userRole === "company") {
    const company = await Company.findOne({ user: userId });
    if (!company || company._id.toString() !== application.job.company.toString()) {
      const error = new Error("Access denied");
      error.status = 403;
      throw error;
    }
  }

  application.status = status;
  await application.save();

  return {
    message: `Application marked as ${status}`,
    application
  };
};
