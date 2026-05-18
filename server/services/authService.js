const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (payload) => {
    const { name, email, password, role, rollNumber } = payload;
    
    const exists = await User.findOne({ email });
    if (exists) {
        const error = new Error("Email already registered");
        error.status = 400;
        throw error;
    }

    if (role === "student" && rollNumber) {
        const existingRoll = await Student.findOne({ rollNumber, isDeleted: false });
        if (existingRoll) {
            const error = new Error("Roll number already registered");
            error.status = 400;
            throw error;
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });

    if (role === "student") {
        await Student.create({
            name,
            email,
            rollNumber,
            user: user._id
        });
    } else if (role === "company") {
        await Company.create({
            name,
            user: user._id
        });
    }

    return { message: "User created successfully" };
};

exports.login = async (payload) => {
    const { email, password } = payload;

    const user = await User.findOne({ email, isDeleted: { $ne: true } });
    if (!user) {
        const error = new Error("Invalid credentials");
        error.status = 400;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error("Invalid credentials");
        error.status = 400;
        throw error;
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

exports.getMe = async (userId) => {
    const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } }).select("-password");
    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }
    return user;
};
