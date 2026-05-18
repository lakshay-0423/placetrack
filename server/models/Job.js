const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  salary: Number,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  description: String,
  minCGPA: {
    type: Number,
    default: 0
  },
  eligibleBranches: [String],
  passingYear: Number,
  requiredSkills: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);