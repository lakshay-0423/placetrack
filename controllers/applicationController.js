const Job = require("../models/Job");
const Student = require("../models/Student");
const Application = require("../models/Application");

exports.applyJob = async (req, res, next) => {
  try {

    const student = await Student.findOne({ user: req.user.id });

    if (!student)
      return res.status(400).json({ message: "Student profile required" });

    const job = await Job.findById(req.params.jobId);

    if (!job)
      return res.status(404).json({ message: "Job not found" });

    let status = "Applied";

    if (
      student.cgpa < job.minCGPA ||
      !job.eligibleBranches.includes(student.branch) ||
      student.passingYear !== job.passingYear
    ) {
      status = "Rejected";
    }

    const application = await Application.create({
      student: student._id,
      job: job._id,
      status
    });

    res.status(201).json({
      message:
        status === "Rejected"
          ? "Application rejected due to eligibility"
          : "Application submitted",
      application
    });

  } catch (error) {
    next(error);
  }
};