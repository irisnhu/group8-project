import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";  
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import userRoutes from "./routes/user.js"; 
import uploadRoutes from "./routes/uploadRoutes.js";


import User from "./models/User.js";
console.log("✅ Server đang chạy, console.log hoạt động");

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", methods: ["GET","POST","PUT","DELETE"], credentials: true }));
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi MongoDB:", err));

// Test route
app.get("/", (req, res) => res.send("Server đang chạy đúng"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api", forgotPasswordRoutes); 
app.use("/api", userRoutes); 
app.use("/api", uploadRoutes); 


// Khởi động server
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
