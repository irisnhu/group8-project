import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { createLog } from "../middleware/logActivity.js"; // <-- thêm import

const router = express.Router();

/* -------------------- RATE LIMIT LOGIN -------------------- */
// Giới hạn 5 lần đăng nhập sai / 15 phút
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res, next) => {
    // Khi bị chặn -> log lại
    await createLog({
      action: "RATE_LIMIT_BLOCK",
      details: {
        message: "Too many login attempts",
        ip: req.ip,
        email: req.body?.email,
      },
      req,
    });
    // Sử dụng header Retry-After của express-rate-limit
    res.set('Retry-After', Math.ceil(15 * 60)); // 15 phút tính bằng giây
    return res.status(429).json({
      success: false,
      message: "Bạn đã đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút.",
    });
  },
});

/* -------------------- ĐĂNG KÝ -------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, gitname, password } = req.body;

    if (!name || !email || !gitname || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      gitname,
      password: hashedPassword,
      role: "user", // mặc định là user
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Ghi log tạo tài khoản
    await createLog({
      userId: newUser._id,
      action: "SIGNUP_SUCCESS",
      details: { email },
      req,
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi đăng ký:", error);
    await createLog({
      action: "SIGNUP_ERROR",
      details: { error: error.message },
    });
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* -------------------- ĐĂNG NHẬP -------------------- */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await createLog({
        action: "LOGIN_FAILED",
        details: { reason: "Email không tồn tại", email },
        req,
      });
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await createLog({
        userId: user._id,
        action: "LOGIN_FAILED",
        details: { reason: "Sai mật khẩu", email },
        req,
      });
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Ghi log thành công
    await createLog({
      userId: user._id,
      action: "LOGIN_SUCCESS",
      details: { email },
      req,
    });

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    await createLog({
      action: "LOGIN_ERROR",
      details: { error: error.message },
      req,
    });
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* -------------------- ĐĂNG XUẤT -------------------- */
router.post("/logout", async (req, res) => {
  await createLog({
    userId: req.user?._id || null,
    action: "LOGOUT",
    details: { message: "User logged out" },
    req,
  });
  res.status(200).json({ message: "Đăng xuất thành công!" });
});

export default router;
