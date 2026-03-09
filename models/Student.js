const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    branch: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    cgpa: Number,
    passingYear: Number,
    skills: [String],
    experience: Number
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);