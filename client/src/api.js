// src/api.js
import axios from "axios";

// ✅ Kiểm tra biến môi trường để bật/tắt mock
const globalMock = process.env.REACT_APP_USE_MOCK === "true";

// ✅ Tạo axios client cho backend thật
const realAPI = axios.create({
  baseURL: "http://localhost:5000/api", // Đảm bảo backend dùng app.use("/api", userRoutes)
});

// ✅ Mock API cho test giao diện
const mockAPI = {
  signup: async (data) => {
    console.log("📦 Mock signup:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả độ trễ mạng
    if (data.email === "test@example.com") {
      throw { response: { data: { message: "Email đã tồn tại (mock)" } } };
    }
    return {
      data: {
        success: true,
        message: "✅ Đăng ký thành công (mock)",
        data: {
          token: "mocked_token_signup_123456789",
          user: {
            id: "mocked_id_123",
            name: data.name,
            email: data.email,
            gitname: data.gitname,
            role: "user",
          },
        },
      },
    };
  },

  login: async (data) => {
    console.log("📦 Mock login:", data);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (data.email === "test@example.com" && data.password === "123456") {
      return {
        data: {
          success: true,
          message: "✅ Đăng nhập thành công (mock)",
          data: {
            token: "mocked_token_login_123456789",
            user: {
              id: "mocked_id_123",
              name: "Test User",
              email: data.email,
              gitname: "testgit",
              role: "user",
            },
          },
        },
      };
    } else {
      throw { response: { data: { message: "Sai email hoặc mật khẩu (mock)" } } };
    }
  },

  logout: async () => {
    console.log("📦 Mock logout");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: { success: true, message: "✅ Đăng xuất thành công (mock)" } };
  },
};

// ✅ Kết hợp mock + API thật
const API = {
  // ⚙️ Sửa endpoint cho khớp với backend (signup/login/logout)
  signup: globalMock ? mockAPI.signup : (data) => realAPI.post("/signup", data),
  login: globalMock ? mockAPI.login : (data) => realAPI.post("/login", data),
  logout: globalMock ? mockAPI.logout : () => realAPI.post("/logout"),

  // Các API khác (nếu cần)
  getUsers: () => realAPI.get("/users"),
  addUser: (data) => realAPI.post("/users", data),
  updateUser: (id, data) => realAPI.put(`/users/${id}`, data),
  deleteUser: (id) => realAPI.delete(`/users/${id}`),
};

// ✅ Export mặc định
export default API;