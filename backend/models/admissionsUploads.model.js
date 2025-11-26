const mongoose = require("mongoose");

const admissionUploadSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: String,
    dateOfBirth: String,
    gender: String,
    className: String,
    
    parentPhone: { type: String, required: true },
    parentEmail: String,
    
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    
    // Files storage paths
    studentPhoto: String,
    birthCertificate: String,
    previousMarksheet: String,
    aadharCard: String,
    transferCertificate: String,
    parentIdProof: String,

    admissionNo: String,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdmissionUpload", admissionUploadSchema);

