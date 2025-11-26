const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  classes: { type: String },
  contact: { type: String },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Teacher", teacherSchema);
