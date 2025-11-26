// backend/models/Admission.js
const mongoose = require("mongoose");

const docsSchema = new mongoose.Schema(
  {
    studentPhoto: { type: String, default: "" },
    birthCertificate: { type: String, default: "" },
    previousMarksheet: { type: String, default: "" },
    aadharCard: { type: String, default: "" },
    transferCertificate: { type: String, default: "" },
    parentIdProof: { type: String, default: "" },
  },
  { _id: false }
);

const admissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },

    // 🔴 Use one consistent field name everywhere (frontend + backend)
    className: { type: String, required: true },

    parentPhone: { type: String, required: true },
    parentEmail: { type: String, default: "" },

    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },

    admissionNo: { type: String, unique: true, index: true },
    status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },

    documents: { type: docsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
