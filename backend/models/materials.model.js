const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileType: String,  // pdf / image / video / link
  fileURL: String,   // Storage path
  uploadedBy: { type: Number, ref: "users" }, // MySQL User ID
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("materials", materialSchema);
