const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  class_level: { type: String, default: "all" },
  file_path: String,
  file_size: String,
  file_type: String,
  download_count: { type: Number, default: 0 },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Material", MaterialSchema);
