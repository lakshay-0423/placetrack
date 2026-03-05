const Application = require("../models/Application");
const Student = require("../models/Student");

exports.applyJob = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id, isDeleted: false });

    if (!student)
      return res.status(400).json({ message: "Student profile required" });

    const application = await Application.create({
      student: student._id,
      job: req.params.jobId,
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};