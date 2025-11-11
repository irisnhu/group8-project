import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "./store/authSlice";


// === COMPONENTS ===
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ProfilePage from "./components/ProfilePage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

// === PAGES ===
import UserManagement from "./pages/UserManagement";
import ModeratorPanel from "./pages/ModeratorPanel";
import AdminDashboard from "./components/AdminDashboard";
import ActivityLogs from "./pages/ActivityLogs";

function App() {
  const dispatch = useDispatch();

  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem("user");
    if (!localUser || localUser === "undefined" || localUser === "null") return null;
    try {
      return JSON.parse(localUser);
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken")); // ← DÙNG accessToken

  // === XỬ LÝ LOGIN ===
  const handleLoginSuccess = (loggedInUser, accessToken) => {
    setIsAuthenticated(true);
    setUser(loggedInUser);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    dispatch(setCredentials({ user: loggedInUser, accessToken }));
  };

  // === XỬ LÝ LOGOUT ===
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // === CẬP NHẬT USER ===
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // === TẢI USER TỪ DB KHI CÓ TOKEN ===
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token || token === "undefined" || token === "null") return;

      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
          // Dispatch to Redux để restore state
          dispatch(setCredentials({ user: data, accessToken: token }));
        } else {
          // Token không hợp lệ, xóa và chuyển về chưa đăng nhập
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Lỗi lấy user từ DB:", err);
        // Xóa dữ liệu local nếu lỗi
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    if (isAuthenticated) fetchUser();
  }, [isAuthenticated, dispatch]);

  return (
    <Router>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ==================== PROTECTED ROUTES ==================== */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} user={user} />}>

          {/* PROFILE – TẤT CẢ USER */}
          <Route
            path="/profile"
            element={
              <ProfilePage
                key={user?._id}
                user={user}
                onLogout={handleLogout}
                onUpdate={handleUpdateUser}
              />
            }
          />

          {/* USER MANAGEMENT  - ADMIN */}
          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <UserManagement />
              </RoleGuard>
            }
          />

          {/* MODERATOR PANEL – CHỈ MOD */}
          <Route
            path="/mod"
            element={
              <RoleGuard allowedRoles={["moderator"]}>
                <ModeratorPanel />
              </RoleGuard>
            }
          />

          {/* ADMIN DASHBOARD – CHỈ ADMIN */}
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />

          {/* ACTIVITY LOGS – CHỈ ADMIN */}
          <Route
            path="/logs"
            element={
              isAuthenticated && user?.role === "admin" ? (
                <ActivityLogs />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />
        </Route>

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;