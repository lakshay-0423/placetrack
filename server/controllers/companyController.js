const companyService = require("../services/companyService");

exports.getCompanies = async (req, res, next) => {
  try {
    const result = await companyService.getCompanies();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const result = await companyService.createCompany(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const result = await companyService.updateCompany(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const result = await companyService.deleteCompany(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createCompanyProfile = async (req, res, next) => {
  try {
    const result = await companyService.createCompanyProfile(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const result = await companyService.getMe(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const result = await companyService.updateMe(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};