import User from "../models/User.js";

// Lấy thông tin người dùng
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // ẩn mật khẩu
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin người dùng
export const updateProfile = async (req, res) => {
  try {
    const { name, gitname, avatar, password } = req.body;

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (gitname) updatedFields.gitname = gitname;
    if (avatar) updatedFields.avatar = avatar;
    if (password) updatedFields.password = password; // Có thể mã hóa sau

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
