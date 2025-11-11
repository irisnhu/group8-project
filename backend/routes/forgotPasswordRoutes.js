// routes/forgotPasswordRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // ← GỬI EMAIL
import User from "../models/User.js";

const router = express.Router();

// ==================== 1. GỬI LINK QUÊN MẬT KHẨU ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Nếu email tồn tại, link sẽ được gửi!" });
    }

    // Tạo token JWT (hết hạn 1 giờ)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Lưu token vào DB
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 giờ
    await user.save();

    // === GỬI EMAIL ===
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: `"Hệ thống" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1976d2;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${user.name || "bạn"}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn vào nút dưới đây để đặt lại (hiệu lực <strong>1 giờ</strong>):</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Đặt lại mật khẩu
          </a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
          </p>
          <hr>
          <small style="color: #999;">Email tự động – Vui lòng không trả lời</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Link đặt lại mật khẩu đã được gửi đến email!" });
  } catch (error) {
    console.error("Lỗi gửi email reset password:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== 2. ĐẶT LẠI MẬT KHẨU ====================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Kiểm tra mật khẩu
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải ít nhất 6 ký tự" });
    }

    // Xác thực token JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Tìm user theo token + chưa hết hạn
    const user = await User.findOne({
      _id: payload.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Xóa token sau khi dùng
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Mật khẩu đã được cập nhật thành công!" });
  } catch (error) {
    console.error("Lỗi reset password:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;