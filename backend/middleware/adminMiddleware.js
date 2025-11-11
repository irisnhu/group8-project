// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Yêu cầu quyền Admin' });
  }
  next();
};

// BẮT BUỘC PHẢI CÓ DÒNG NÀY
export default adminMiddleware;