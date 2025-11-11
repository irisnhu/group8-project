import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gitname: { type: String, required: true },
  password: { type: String, required: true }, // mật khẩu
  role: { type: String, enum: ["user", "admin", "moderator"], default: "user" }, // phân quyền

  // 🔥 Thêm các trường cho Forgot Password
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  // 🔥 Thêm avatar nếu muốn lưu URL
  avatar: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);