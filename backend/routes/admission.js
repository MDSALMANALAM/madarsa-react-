// backend/routes/admission.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const db = require("../config/db");
const util = require('util');
const query = util.promisify(db.query).bind(db);

// Upload directories
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "admission_docs");
const RECEIPT_DIR = path.join(__dirname, "..", "receipts");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(RECEIPT_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// File fields - Fixed to match your database columns
const uploadFields = upload.fields([
  { name: "studentPhoto", maxCount: 1 },
  { name: "birthCertificate", maxCount: 1 },
  { name: "previousMarksheet", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "transferCertificate", maxCount: 1 },
  { name: "casteCertificate", maxCount: 1 },
  { name: "incomeCertificate", maxCount: 1 },
]);

// Generate Admission No
const generateAdmissionNo = async () => {
  try {
    const rows = await query("SELECT COUNT(*) AS total FROM admissions");
    const total = rows[0]?.total || 0;
    const year = new Date().getFullYear();

    return `ADM-${year}-${String(total + 1).padStart(4, "0")}`;
  } catch (err) {
    console.log("AdmissionNo Error:", err);
    const year = new Date().getFullYear();
    return `ADM-${year}-${Date.now().toString().slice(-4)}`;
  }
};

// Helper for file path
const filePath = (files, key) =>
  files[key] ? `/uploads/admission_docs/${files[key][0].filename}` : "";

// ===============================
// GENERATE PDF RECEIPT
// ===============================
const generateAdmissionReceipt = async (admissionData, photoPath) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `admission-receipt-${admissionData.admission_no}.pdf`;
      const filePath = path.join(RECEIPT_DIR, fileName);

      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ========================================
      // COMPACT HEADER
      // ========================================

      // Top border line
      doc.strokeColor('#0891b2').lineWidth(2).moveTo(30, 30).lineTo(doc.page.width - 30, 30).stroke();

      // Madarsa name - Compact
      doc.fontSize(18).fillColor('#1e40af').font('Helvetica-Bold')
         .text('MADARSA IMDADUL ULOOM', 30, 40, { align: 'center' });

      doc.fontSize(8).fillColor('#64748b').font('Helvetica')
         .text('Gidhor, Chatra, Jharkhand - 825408 | Phone: +91 9304678815', 30, 62, { align: 'center' });

      // Bottom border line
      doc.strokeColor('#0891b2').lineWidth(2).moveTo(30, 75).lineTo(doc.page.width - 30, 75).stroke();

      // ========================================
      // TITLE SECTION - COMPACT
      // ========================================
      const titleY = 85;
      doc.rect(30, titleY, doc.page.width - 60, 28).fill('#0891b2');
      doc.fontSize(14).fillColor('#ffffff').font('Helvetica-Bold')
         .text('ADMISSION APPLICATION RECEIPT', 30, titleY + 8, { align: 'center' });

      // ========================================
      // ADMISSION NUMBER & DATE - COMPACT
      // ========================================
      const admNoY = 123;

      // Single line with admission no and date
      doc.roundedRect(30, admNoY, doc.page.width - 60, 24, 3).fill('#dbeafe');
      doc.fontSize(9).fillColor('#1e40af').font('Helvetica-Bold')
         .text(`Admission No: ${admissionData.admission_no}`, 40, admNoY + 8);
      doc.fontSize(9).fillColor('#1e40af')
         .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, doc.page.width - 150, admNoY + 8);

      // ========================================
      // STUDENT PHOTO (RIGHT SIDE) - COMPACT
      // ========================================
      const photoY = 160;
      const photoX = doc.page.width - 100;
      if (photoPath && fs.existsSync(path.join(__dirname, '..', photoPath))) {
        try {
          // Photo border - smaller
          doc.roundedRect(photoX, photoY, 70, 85, 3).stroke('#0891b2');
          doc.image(path.join(__dirname, '..', photoPath), photoX + 3, photoY + 3, { width: 64, height: 79 });
        } catch (err) {
          console.log('Photo not added:', err.message);
        }
      }

      // ========================================
      // STUDENT DETAILS SECTION - COMPACT
      // ========================================
      let currentY = 160;

      // Section header - smaller
      doc.rect(30, currentY, doc.page.width - 220, 22).fill('#0891b2');
      doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold')
         .text('STUDENT INFORMATION', 38, currentY + 6);

      currentY += 28;

      // Details in compact 2-column format
      const leftX = 38;
      const rightX = 160;
      const lineHeight = 16;

      const addDetailRow = (label, value) => {
        doc.fontSize(8).fillColor('#475569').font('Helvetica-Bold')
           .text(label + ':', leftX, currentY);
        doc.fontSize(8).fillColor('#1e293b').font('Helvetica')
           .text(value || 'N/A', rightX, currentY, { width: 200 });
        currentY += lineHeight;
      };

      addDetailRow('Student Name', admissionData.student_name);
      addDetailRow('Father\'s Name', admissionData.father_name);
      addDetailRow('Mother\'s Name', admissionData.mother_name);
      addDetailRow('Date of Birth', admissionData.dob);
      addDetailRow('Gender', admissionData.gender);
      addDetailRow('Class Applied', admissionData.class_name);
      addDetailRow('Phone Number', admissionData.phone);
      addDetailRow('Email Address', admissionData.email);

      currentY += 8;

      // Address section - compact
      doc.rect(30, currentY, doc.page.width - 60, 20).fill('#0891b2');
      doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
         .text('ADDRESS', 38, currentY + 6);

      currentY += 25;
      doc.fontSize(8).fillColor('#1e293b').font('Helvetica')
         .text(`${admissionData.address || ''}, ${admissionData.city || ''}, ${admissionData.state || ''} - ${admissionData.pincode || ''}`,
               38, currentY, { width: doc.page.width - 76, align: 'left' });

      currentY += 22;

      // ========================================
      // DOCUMENT CHECKLIST - COMPACT
      // ========================================
      doc.rect(30, currentY, doc.page.width - 60, 20).fill('#0891b2');
      doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
         .text('DOCUMENTS SUBMITTED', 38, currentY + 6);

      currentY += 25;

      const documents = [
        'Birth Certificate',
        'Previous Marksheet',
        'Aadhar Card',
        'Transfer Certificate',
        'Caste Certificate',
        'Income Certificate',
        'Student Photo'
      ];

      // Three columns - compact
      const col1X = 38;
      const col2X = 210;
      const col3X = 382;
      let docY = currentY;

      documents.forEach((docName, idx) => {
        let xPos = col1X;
        if (idx >= 2 && idx < 4) xPos = col2X;
        if (idx >= 4) xPos = col3X;
        if (idx === 2 || idx === 4) docY = currentY;

        doc.fontSize(7).fillColor('#0891b2').font('Helvetica-Bold')
           .text('✓', xPos, docY, { continued: true });
        doc.fillColor('#1e293b').font('Helvetica')
           .text(` ${docName}`, { continued: false });
        docY += 14;
      });

      currentY += 35;

      // ========================================
      // ACADEMIC DETAILS BOX - COMPACT
      // ========================================
      doc.roundedRect(30, currentY, doc.page.width - 60, 45, 3).fill('#dbeafe');
      doc.fontSize(9).fillColor('#1e40af').font('Helvetica-Bold')
         .text('ACADEMIC INFORMATION', 38, currentY + 8);

      currentY += 24;

      doc.fontSize(8).fillColor('#475569').font('Helvetica-Bold');
      doc.text('Class:', 38, currentY, { continued: true });
      doc.fillColor('#1e293b').font('Helvetica').text(` ${admissionData.class_name}`, { continued: false });

      doc.fillColor('#475569').font('Helvetica-Bold').text('Academic Year:', 250, currentY, { continued: true });
      doc.fillColor('#1e293b').font('Helvetica').text(' 2025-2026', { continued: false });

      currentY += 14;

      doc.fillColor('#475569').font('Helvetica-Bold').text('Medium:', 38, currentY, { continued: true });
      doc.fillColor('#1e293b').font('Helvetica').text(' Urdu', { continued: false });

      doc.fillColor('#475569').font('Helvetica-Bold').text('Stream:', 250, currentY, { continued: true });
      doc.fillColor('#1e293b').font('Helvetica').text(' Regular', { continued: false });

      currentY += 25;

      // ========================================
      // SIGNATURE SECTION - COMPACT
      // ========================================
      doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold')
         .text('Signatures:', 30, currentY);

      currentY += 18;

      const sigBoxWidth = 165;
      const sigBoxHeight = 40;
      const sigGap = 10;

      // Student signature
      doc.roundedRect(30, currentY, sigBoxWidth, sigBoxHeight, 3).stroke('#0891b2');
      doc.fontSize(7).fillColor('#475569').font('Helvetica-Bold')
         .text('Student Signature', 30, currentY + sigBoxHeight + 5, { width: sigBoxWidth, align: 'center' });

      // Parent signature
      doc.roundedRect(30 + sigBoxWidth + sigGap, currentY, sigBoxWidth, sigBoxHeight, 3).stroke('#0891b2');
      doc.fontSize(7).fillColor('#475569').font('Helvetica-Bold')
         .text('Parent/Guardian Signature', 30 + sigBoxWidth + sigGap, currentY + sigBoxHeight + 5, { width: sigBoxWidth, align: 'center' });

      // Mohtamim signature
      doc.roundedRect(30 + (sigBoxWidth + sigGap) * 2, currentY, sigBoxWidth, sigBoxHeight, 3).stroke('#0891b2');
      doc.fontSize(7).fillColor('#475569').font('Helvetica-Bold')
         .text('Mohtamim Signature', 30 + (sigBoxWidth + sigGap) * 2, currentY + sigBoxHeight + 5, { width: sigBoxWidth, align: 'center' });

      // ========================================
      // FOOTER - COMPACT
      // ========================================
      const footerY = doc.page.height - 45;

      // Top border line
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(30, footerY).lineTo(doc.page.width - 30, footerY).stroke();

      doc.fontSize(7).fillColor('#64748b').font('Helvetica-Oblique')
         .text('This is a computer-generated admission receipt. No signature required for validity.', 30, footerY + 10, { align: 'center' });
      doc.fontSize(7).fillColor('#475569').font('Helvetica')
         .text('For queries: +91 9304678815 | info@madarasaimdadululoom.in', 30, footerY + 22, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/receipts/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// ===============================
// SUBMIT ADMISSION (MAIN FORM)
// ===============================
router.post("/submit", uploadFields, async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};

    console.log('📝 Admission Form Data:', data);
    console.log('📎 Files:', Object.keys(files));

    // Validate required fields
    if (!data.fullName || !data.fatherName || !data.parentPhone || !data.className) {
      return res.json({
        success: false,
        message: "Please fill all required fields: Student Name, Father Name, Phone, and Class"
      });
    }

    const admission_no = await generateAdmissionNo();

    // Documents JSON - Fixed to match your database columns
    const documents = {
      photo_path: filePath(files, "studentPhoto"),
      birth_certificate_path: filePath(files, "birthCertificate"),
      marksheet_path: filePath(files, "previousMarksheet"),
      aadhar_path: filePath(files, "aadharCard"),
      transfer_certificate_path: filePath(files, "transferCertificate"),
      caste_certificate_path: filePath(files, "casteCertificate"),
      income_certificate_path: filePath(files, "incomeCertificate"),
    };

    // Correct SQL query matching your database schema
    const sql = `
      INSERT INTO admissions 
      (
        admission_no, student_name, father_name, mother_name, dob, gender,
        email, phone, address, class_name, previous_school, guardian_phone,
        emergency_contact, blood_group,
        photo_path, birth_certificate_path, aadhar_path, transfer_certificate_path,
        marksheet_path, caste_certificate_path, income_certificate_path, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    // Correct params matching your database columns
    const params = [
      admission_no,
      data.fullName || null, // student_name
      data.fatherName || null, // father_name
      data.motherName || null, // mother_name
      data.dob || null, // dob
      data.gender || null, // gender
      data.parentEmail || null, // email
      data.parentPhone || null, // phone
      data.address || null, // address
      data.className || null, // class_name
      data.previousSchool || null, // previous_school
      data.guardianPhone || null, // guardian_phone
      data.emergencyContact || null, // emergency_contact
      data.bloodGroup || null, // blood_group
      documents.photo_path, // photo_path
      documents.birth_certificate_path, // birth_certificate_path
      documents.aadhar_path, // aadhar_path
      documents.transfer_certificate_path, // transfer_certificate_path
      documents.marksheet_path, // marksheet_path
      documents.caste_certificate_path, // caste_certificate_path
      documents.income_certificate_path, // income_certificate_path
    ];

    // Run SQL
    const result = await query(sql, params);
    console.log('✅ Admission saved:', admission_no, 'Insert ID:', result.insertId);

    // PDF Receipt Data (Correct mapping)
    const admissionData = {
      admission_no,
      student_name: data.fullName,
      father_name: data.fatherName,
      mother_name: data.motherName,
      dob: data.dob || 'N/A',
      gender: data.gender,
      class_name: data.className,
      phone: data.parentPhone,
      email: data.parentEmail,
      address: data.address,
      previous_school: data.previousSchool,
      guardian_phone: data.guardianPhone,
      emergency_contact: data.emergencyContact,
      blood_group: data.bloodGroup,
    };

    // Generate PDF Receipt
    let receiptUrl = null;
    try {
      const photoPath = documents.photo_path;
      receiptUrl = await generateAdmissionReceipt(admissionData, photoPath);
      console.log('✅ PDF Receipt generated:', receiptUrl);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
    }

    // Use environment variable or request host for receipt URL
    const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;

    res.json({
      success: true,
      message: "Admission submitted successfully! Your application is pending approval.",
      admissionNo: admission_no,
      receiptUrl: receiptUrl ? `${baseUrl}${receiptUrl}` : null,
    });

  } catch (err) {
    console.error("Admission submit error:", err);
    res.json({ success: false, message: err.message || "Error submitting admission" });
  }
});

// ===============================
// LIST ALL ADMISSIONS
// ===============================
router.get("/list", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM admissions ORDER BY id DESC");
    console.log('📋 Admissions list:', rows.length, 'records found');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error loading admissions:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// GET SINGLE ADMISSION
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM admissions WHERE id = ?", [req.params.id]);

    if (rows.length === 0)
      return res.json({ success: false, message: "Not found" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('❌ Error fetching admission:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// APPROVE
// ===============================
router.put("/approve/:id", async (req, res) => {
  try {
    await query("UPDATE admissions SET status='approved' WHERE id=?", [req.params.id]);
    console.log('✅ Admission approved:', req.params.id);
    res.json({ success: true, message: "Approved" });
  } catch (err) {
    console.error('❌ Error approving admission:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// REJECT
// ===============================
router.put("/reject/:id", async (req, res) => {
  try {
    await query("UPDATE admissions SET status='rejected' WHERE id=?", [req.params.id]);
    console.log('✅ Admission rejected:', req.params.id);
    res.json({ success: true, message: "Rejected" });
  } catch (err) {
    console.error('❌ Error rejecting admission:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;