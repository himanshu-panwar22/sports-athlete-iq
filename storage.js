const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const config = require("../config");

// Ensure upload directories exist
const uploadDir = config.LOCAL_STORAGE_DIR;
const rawDir = path.join(uploadDir, "raw");
const overlayDir = path.join(uploadDir, "overlay");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
if (!fs.existsSync(overlayDir)) fs.mkdirSync(overlayDir, { recursive: true });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, rawDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    const sessionId = req.params.id || "session";
    const uniqueSuffix = `${sessionId}_${Date.now()}${ext}`;
    cb(null, uniqueSuffix);
  }
});

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for assessment videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "application/octet-stream"];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith(".mp4")) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported video format: ${file.mimetype}. Expected MP4/WebM.`));
    }
  }
});

function computeFileSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", data => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", err => reject(err));
  });
}

function getAccessibleVideoUrl(storageKey) {
  if (!storageKey) return null;
  if (storageKey.startsWith("http")) return storageKey;
  // Local static streaming URL
  return `/uploads/${storageKey}`;
}

module.exports = {
  uploadMiddleware,
  computeFileSha256,
  getAccessibleVideoUrl,
  rawDir,
  overlayDir
};
