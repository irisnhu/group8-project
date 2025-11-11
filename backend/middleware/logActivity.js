// middleware/logActivity.js
import Log from "../models/Log.js";

export const createLog = async ({ userId = null, action, details = {}, req }) => {
  try {
    const log = new Log({
      userId,
      action,
      details,
      ip: req?.ip || "unknown",
      timestamp: new Date(),
    });

    await log.save();

    // ✅ In ra console để thấy log trực tiếp
    console.log(
      `📘 [LOG] Action: ${action} | User: ${userId || "Guest"} | IP: ${
        req?.ip || "?"
      } | Details:`,
      details
    );
  } catch (err) {
    console.error("❌ Lỗi khi ghi log:", err.message);
  }
};
