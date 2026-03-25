const Student = require("../models/Student");
const { getPagination } = require("../utils/pagination");

exports.getStudents = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req);

        const total = await Student.countDocuments({ isDeleted: false });

        const students = await Student.find({ isDeleted: false })
            .skip(skip)
            .limit(limit)
            .populate("user", "-password");

        res.json({
            total,
            page,
            pages: Math.ceil(total / limit),
            data: students
        });

    } catch (error) {
        next(error);
    }
};
exports.createStudent = async (req, res, next) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        next(error);
    }
};

exports.updateStudent = async (req, res, next) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!student)
            return res.status(404).json({ message: "Student not found" });

        res.json(student);
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isDeleted: true });

        if (!student)
            return res.status(404).json({ message: "Student not found" });

        res.json({ message: "Student deleted" });
    } catch (error) {
        next(error);
    }
};

exports.createProfile = async (req, res, next) => {
    try {
        const exists = await Student.findOne({ user: req.user.id });
        if (exists)
            return res.status(400).json({ message: "Profile already exists" });

        const profile = await Student.create({
            user: req.user.id,
            name: req.body.name,
            branch: req.body.branch,
            cgpa: req.body.cgpa
        });

        res.status(201).json(profile);

    } catch (error) {
        next(error);
    }
};