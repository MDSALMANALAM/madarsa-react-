const express = require("express");
const router = express.Router();
const multer = require("multer");
const Material = require("../models/materials.model");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  const record = await Material.create({
    title,
    description,
    fileType: file.mimetype,
    fileURL: `/uploads/${file.filename}`
  });

  res.json({ success: true, message: "Uploaded Successfully", record });
});

module.exports = router;
