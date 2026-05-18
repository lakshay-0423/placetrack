const Student = require("../models/Student");
const User = require("../models/User");

exports.getStudents = async (pagination) => {
    const { page, limit, skip } = pagination;
    const total = await Student.countDocuments({ isDeleted: false });
    const students = await Student.find({ isDeleted: false })
        .skip(skip)
        .limit(limit)
        .populate("user", "-password");

    return {
        total,
        page,
        pages: Math.ceil(total / limit),
        data: students
    };
};

exports.createStudent = async (payload) => {
    if (payload.rollNumber) {
        const existingRoll = await Student.findOne({ rollNumber: payload.rollNumber, isDeleted: false });
        if (existingRoll) {
            const error = new Error("Roll number already registered");
            error.status = 400;
            throw error;
        }
    }
    const student = await Student.create(payload);
    return student;
};

exports.updateStudent = async (id, payload) => {
    if (payload.rollNumber) {
        const existingRoll = await Student.findOne({ rollNumber: payload.rollNumber, isDeleted: false, _id: { $ne: id } });
        if (existingRoll) {
            const error = new Error("Roll number already registered");
            error.status = 400;
            throw error;
        }
    }
    const student = await Student.findByIdAndUpdate(id, payload, { new: true });
    if (!student) {
        const error = new Error("Student not found");
        error.status = 404;
        throw error;
    }
    return student;
};

exports.deleteStudent = async (id) => {
    const student = await Student.findByIdAndUpdate(id, { isDeleted: true });
    if (!student) {
        const error = new Error("Student not found");
        error.status = 404;
        throw error;
    }
    await User.findByIdAndUpdate(student.user, { isDeleted: true });
    return { message: "Student deleted" };
};

exports.createProfile = async (userId, payload) => {
    const exists = await Student.findOne({ user: userId });
    if (exists) {
        const error = new Error("Profile already exists");
        error.status = 400;
        throw error;
    }

    const profile = await Student.create({
        user: userId,
        name: payload.name,
        branch: payload.branch,
        cgpa: payload.cgpa
    });
    return profile;
};

exports.getMe = async (userId) => {
    const student = await Student.findOne({ user: userId });
    if (!student) return {}; // Return empty if not found so frontend can show empty form
    return student;
};

exports.updateMe = async (userId, payload) => {
    if (payload.rollNumber) {
        const existingRoll = await Student.findOne({ rollNumber: payload.rollNumber, isDeleted: false, user: { $ne: userId } });
        if (existingRoll) {
            const error = new Error("Roll number already registered");
            error.status = 400;
            throw error;
        }
    }
    const updatePayload = { ...payload, user: userId };
    if (!updatePayload.name) {
        const user = await User.findById(userId);
        if (user) {
            updatePayload.name = user.name;
            updatePayload.email = user.email;
        }
    }

    const student = await Student.findOneAndUpdate(
        { user: userId },
        { $set: updatePayload },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return student;
};
