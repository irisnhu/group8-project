// middleware/roleMiddleware.js
import User from "../models/User.js";

export const requireAdmin = async (req, res, next) => { // ĐỔI TÊN TỪ verifyAdmin → requireAdmin
  try {
    const user = await User.findById(req.user.id).select("role");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ 
        message: "Bạn không có quyền truy cập (chỉ Admin được phép)" 
      });
    }

    next(); // XÓA req.user = user;
  } catch (error) {
    console.error("Lỗi requireAdmin:", error);
    res.status(500).json({ message: "Lỗi xác thực quyền" });
  }
};