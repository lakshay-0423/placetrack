const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  location: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  description: String
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);