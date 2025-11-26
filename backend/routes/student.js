// backend/routes/student.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const db = require("../config/db"); // ✅ MySQL connection

// ---------------------------
// ✅ MULTER CONFIG (for optional file uploads in admission form)
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/students/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF files are allowed!"), false);
    }
  },
});

// ---------------------------
// 🧾 1️⃣ STUDENT ADMISSION FORM (UPLOAD)
// ---------------------------
router.post(
  "/register",
  upload.fields([
    { name: "studentPhoto", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
    { name: "previousMarksheet", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        fullName,
        dateOfBirth,
        gender,
        class: studentClass,
        previousSchool,
        parentName,
        parentPhone,
        parentEmail,
        parentOccupation,
        address,
      } = req.body;

      // Agar file upload use kar rahe ho to yahan MongoDB ya MySQL insert kar sakte ho
      res.status(201).json({
        success: true,
        message: "Student registration submitted successfully",
        files: req.files,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ---------------------------
// ➕ 2️⃣ ADD STUDENT (Admin Dashboard se)
// ---------------------------
router.post("/", async (req, res) => {
  try {
    // 👇 Debugging ke liye log
    console.log("📩 Received Data:", req.body);

    const { name, class: studentClass, parent, contact, status } = req.body;

    // Validation check
    if (!name || !studentClass || !parent || !contact) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const query =
      "INSERT INTO students (name, class, parent, contact, status) VALUES (?, ?, ?, ?, ?)";
    await db
      .promise()
      .query(query, [name, studentClass, parent, contact, status || "Active"]);

    res.json({ success: true, message: "Student added successfully." });
  } catch (error) {
    console.error("Add Student Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------
// 📋 3️⃣ GET ALL STUDENTS (Table me show karne ke liye)
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM students ORDER BY id DESC");
    res.json({ success: true, students: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------
// 🗑️ 4️⃣ DELETE STUDENT
// ---------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query("DELETE FROM students WHERE id = ?", [id]);
    res.json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
