const Company = require("../models/Company");

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ isDeleted: false });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!company)
      return res.status(404).json({ message: "Company not found" });

    res.json(company);
  } catch (error) {
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, { isDeleted: true });

    if (!company)
      return res.status(404).json({ message: "Company not found" });

    res.json({ message: "Company deleted" });
  } catch (error) {
    next(error);
  }
};

exports.createCompanyProfile = async (req, res, next) => {
  try {
    const exists = await Company.findOne({ user: req.user.id, isDeleted: false });
    if (exists)
      return res.status(400).json({ message: "Profile already exists" });

    const profile = await Company.create({
      user: req.user.id,
      name: req.body.name,
      location: req.body.location,
      description: req.body.description
    });

    res.status(201).json(profile);

  } catch (error) {
    next(error);
  }
};