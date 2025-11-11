
import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { v2 as cloudinaryV2 } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import verifyToken from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

// Cấu hình Cloudinary
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình Multer lưu tạm file trên ổ cứng
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'backend/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/upload-avatar
router.post("/upload-avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa chọn file" });

    // Upload lên Cloudinary
    const result = await cloudinaryV2.uploader.upload(req.file.path, { folder: "avatars" });

    // Xóa file tạm sau khi upload
    fs.unlinkSync(req.file.path);

    res.json({ message: "Avatar uploaded successfully", url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    // Xóa file tạm nếu có lỗi
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

export default router;
