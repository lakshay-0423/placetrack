const applicationService = require("../services/applicationService");
const { getPagination } = require("../utils/pagination");

exports.getApplications = async (req, res, next) => {
  try {
    const pagination = getPagination(req);
    const result = await applicationService.getApplications(pagination, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.applyJob = async (req, res, next) => {
  try {
    const result = await applicationService.applyJob(req.user.id, req.params.jobId);
    
    const io = req.app.get("io");
    if (io) {
      io.emit("application_updated");
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const result = await applicationService.updateApplicationStatus(
      req.params.id, 
      req.user.id, 
      req.user.role, 
      req.body.status
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("application_updated");
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};