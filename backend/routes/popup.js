const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");   // <-- FIXED (no .js, no import)

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// GET popup
router.get("/", (req, res) => {
    const sql = `SELECT * FROM popup WHERE active = 1 ORDER BY updatedAt DESC LIMIT 1`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: "database error" });

        if (result.length === 0) return res.json({ active: false });

        const popup = result[0];
        const base = `${req.protocol}://${req.get("host")}`;

        res.json({
            active: popup.active === 1,
            title: popup.title,
            text: popup.text,
            footer: popup.footer,
            imageUrl: popup.imagePath ? `${base}/uploads/${path.basename(popup.imagePath)}` : null,
            fileUrl: popup.filePath ? `${base}/uploads/${path.basename(popup.filePath)}` : null,
            link: popup.link,
            linkText: popup.linkText,
            expires: popup.expires
        });
    });
});

// POST popup
router.post(
    "/",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    (req, res) => {
        const { title, text, footer, link, linkText, active, expires } = req.body;

        const imagePath = req.files?.image?.[0]?.path || null;
        const filePath = req.files?.file?.[0]?.path || null;

        const sql = `
            INSERT INTO popup 
            (title, text, footer, imagePath, filePath, link, linkText, active, expires)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const args = [
            title,
            text,
            footer,
            imagePath,
            filePath,
            link,
            linkText,
            active == "true" ? 1 : 0,
            expires || null,
        ];

        db.query(sql, args, (err, result) => {
            if (err) return res.status(500).json({ error: "insert failed" });

            res.json({ success: true, popupId: result.insertId });
        });
    }
);

module.exports = router;
