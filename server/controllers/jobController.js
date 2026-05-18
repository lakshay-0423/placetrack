const jobService = require("../services/jobService");
const { getPagination } = require("../utils/pagination");

exports.getRankedCandidates = async (req, res, next) => {
  try {
    const result = await jobService.getRankedCandidates(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const pagination = getPagination(req);
    const result = await jobService.getJobs(pagination, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const result = await jobService.createJob(req.user.id, req.body);
    
    const io = req.app.get("io");
    if (io) {
      io.emit("job_updated");
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const result = await jobService.updateJob(req.params.id, req.user.id, req.user.role, req.body);

    const io = req.app.get("io");
    if (io) {
      io.emit("job_updated");
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const result = await jobService.deleteJob(req.params.id, req.user.id, req.user.role);

    const io = req.app.get("io");
    if (io) {
      io.emit("job_updated");
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};