const studentService = require("../services/studentService");
const resumeService = require("../services/resumeService");
const { getPagination } = require("../utils/pagination");

exports.getStudents = async (req, res, next) => {
    try {
        const pagination = getPagination(req);
        const result = await studentService.getStudents(pagination);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.createStudent = async (req, res, next) => {
    try {
        const result = await studentService.createStudent(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.updateStudent = async (req, res, next) => {
    try {
        const result = await studentService.updateStudent(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = async (req, res, next) => {
    try {
        const result = await studentService.deleteStudent(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.createProfile = async (req, res, next) => {
    try {
        const result = await studentService.createProfile(req.user.id, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const result = await studentService.getMe(req.user.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        const result = await studentService.updateMe(req.user.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.uploadResume = async (req, res, next) => {
    try {
        const result = await resumeService.uploadResume(req.user.id, req.file);
        res.json(result);
    } catch (error) {
        next(error);
    }
};