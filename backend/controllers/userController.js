import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ------------------ Cloudinary config ------------------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ------------------ CRUD cơ bản ------------------

// Lấy tất cả user
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo user mới
export const createUser = async (req, res) => {
  const { name, email, gitname, password, role } = req.body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const newUser = new User({ name, email, gitname, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ------------------ Nâng cao ------------------

// 1️⃣ Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 giờ
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Click link để reset password: http://localhost:3000/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email reset password đã được gửi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "Chưa chọn file" });

    const result = await cloudinary.uploader.upload(file.path, { folder: "avatars" });
    fs.unlinkSync(file.path); // xóa file tạm

    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.avatarUrl = result.secure_url;
        await user.save();
      }
    }

    res.json({ message: "Upload thành công", url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};