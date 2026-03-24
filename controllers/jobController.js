const Application = require("../models/Application");
const Student = require("../models/Student");
const Job = require("../models/Job");
const Company = require("../models/Company");
const { calculateScore } = require("../utils/candidateScoring");

exports.getRankedCandidates = async (req, res, next) => {
  try {

    const job = await Job.findById(req.params.jobId);

    const applications = await Application.find({
      job: job._id,
      status: "Applied"
    }).populate({
      path: "student",
      populate: { path: "user" }
    });

    const ranked = applications.map(app => {

      const score = calculateScore(app.student, job);

      return {
        student: app.student,
        score
      };

    });

    ranked.sort((a, b) => b.score - a.score);

    res.json(ranked);

  } catch (error) {
    next(error);
  }
};

const Job = require("../models/Job");
const { getPagination } = require("../utils/pagination");

exports.getJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const total = await Job.countDocuments({ isDeleted: false });

    const jobs = await Job.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .populate("company");

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });

  } catch (error) {
    next(error);
  }
};

exports.createJob = async (req, res, next) => {
  try {

    const company = await Company.findOne({ user: req.user.id });

    if (!company)
      return res.status(400).json({ message: "Company profile required" });

    if (company.status !== "approved") {
      return res.status(403).json({
        message: "Company not approved by admin"
      });
    }

    const job = await Job.create({
      ...req.body,
      company: company._id
    });

    res.status(201).json(job);

  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!job)
      return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { isDeleted: true });

    if (!job)
      return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};