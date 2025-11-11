// controllers/adminController.js
import User from "../models/User.js";

// GET: Danh sách user - CHỈ ADMIN
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE: Xóa user - ADMIN HOẶC TỰ XÓA
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.id === req.params.id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: "Không có quyền xóa" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};