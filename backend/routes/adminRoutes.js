// routes/adminRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import Log from "../models/Log.js";
import { getAllUsers, deleteUser } from "../controllers/adminController.js";

const router = express.Router();

// Route test quyền admin
router.get("/check", verifyToken, adminMiddleware, (req, res) => {
  res.json({ success: true, message: "Chào mừng Admin hợp lệ!" });
});

// Lấy danh sách tất cả người dùng
router.get("/users", verifyToken, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // không trả password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
  }
});

// Lấy danh sách logs hoạt động
router.get("/logs", verifyToken, adminMiddleware, async (req, res) => {
  try {
    const logs = await Log.find().populate('userId', 'name email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy logs" });
  }
});

// PUT: Cập nhật user - CHỈ ADMIN
router.put("/users/:id", verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { name, email, gitname, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, gitname, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Xóa user - ADMIN HOẶC TỰ XÓA (KHÔNG CẦN adminMiddleware để user tự xóa)
router.delete("/users/:id", verifyToken, deleteUser);

// Lấy danh sách logs hoạt động - CHỈ ADMIN
router.get("/logs", verifyToken, adminMiddleware, async (req, res) => {
  try {
    const logs = await Log.find({})
      .populate("userId", "name email") // populate user info
      .sort({ timestamp: -1 }) // sort by newest first
      .limit(100); // limit to last 100 logs

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách logs" });
  }
});

export default router;
