import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import "../styles/Login.css";
import background from "../assets/bg4.png";

function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Tự động điền nếu có remember me
  useEffect(() => {
    const savedPasswords = JSON.parse(localStorage.getItem("savedPasswords")) || {};
    const lastEmail = localStorage.getItem("lastEmail");
    if (lastEmail && savedPasswords[lastEmail]) {
      setForm({ email: lastEmail, password: savedPasswords[lastEmail] });
      setRemember(true);
    }
  }, []);

  // Đếm ngược khi bị rate limit
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (countdown > 0) return;

    setLoading(true);
    setMessage("");
    setRateLimitError("");

    try {
      // 1. ĐĂNG NHẬP – NHẬN ACCESS + REFRESH TOKEN
      const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      let loginData;
      try {
        loginData = await loginRes.json();
      } catch (err) {
        throw new Error("Server trả về phản hồi không hợp lệ");
      }

      // XỬ LÝ LỖI & RATE LIMIT
      if (!loginRes.ok) {
        if (loginRes.status === 429) {
          const retryAfter = loginRes.headers.get('Retry-After');
          const retryAfterNum = retryAfter ? parseInt(retryAfter, 10) : 900; // fallback 15 phút
          setCountdown(retryAfterNum);
          setRateLimitError(`Quá nhiều lần thử! Vui lòng chờ ${Math.ceil(retryAfterNum / 60)} phút.`);
          return;
        }
        throw new Error(loginData.message || "Đăng nhập thất bại");
      }

      // 2. LƯU REMEMBER ME
      if (remember) {
        const savedPasswords = JSON.parse(localStorage.getItem("savedPasswords")) || {};
        savedPasswords[form.email.trim()] = form.password;
        localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
        localStorage.setItem("lastEmail", form.email.trim());
      } else {
        localStorage.removeItem("lastEmail");
      }

      // 3. LẤY PROFILE
      const profileRes = await fetch("http://localhost:5000/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginData.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileRes.ok) {
        let err;
        try {
          err = await profileRes.json();
        } catch (jsonErr) {
          throw new Error("Server trả về phản hồi không hợp lệ");
        }
        throw new Error(err.message || "Không thể lấy thông tin profile");
      }

      let profileData;
      try {
        profileData = await profileRes.json();
      } catch (jsonErr) {
        throw new Error("Server trả về phản hồi không hợp lệ");
      }

      // 4. LƯU VÀO REDUX + CALLBACK
      console.log("Login success - profileData:", profileData);
      console.log("Login success - token:", loginData.token);

      dispatch(
        setCredentials({
          user: profileData,
          accessToken: loginData.token,
          refreshToken: loginData.refreshToken,
        })
      );

      // Giữ tương thích với App.js
      onLoginSuccess(profileData, loginData.token);

      // Lưu token với key "token" để tương thích với backend
      localStorage.setItem("token", loginData.token);

      setMessage(`Chào mừng ${profileData.name || "bạn"}!`);
      setTimeout(() => navigate("/profile"), 600);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${background})` }}>
      <div className="auth-container">
        <div className="auth-left">
          <h1 className="auth-title">Đăng nhập</h1>

          {/* THÔNG BÁO RATE LIMIT */}
          {rateLimitError && (
            <div
              style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                margin: "10px 0",
                border: "1px solid #ffcdd2",
                fontWeight: "bold",
              }}
            >
              {rateLimitError}
              {countdown > 0 && ` (${countdown}s)`}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="auth-input"
              disabled={loading || countdown > 0}
            />

            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="auth-input"
              disabled={loading || countdown > 0}
            />

            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading || countdown > 0}
                />
                Ghi nhớ đăng nhập
              </label>
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
                style={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline" }}
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || countdown > 0}
              style={{
                background: countdown > 0 ? "#ccc" : "",
                cursor: countdown > 0 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Đang đăng nhập..." : countdown > 0 ? `Chờ ${countdown}s` : "Đăng nhập"}
            </button>

            <p className="auth-bottom-text">
              Chưa có tài khoản? <a href="/signup">Đăng ký ngay</a>
            </p>

            {message && <p className="auth-message">{message}</p>}
          </form>
        </div>
        <div className="auth-right"></div>
      </div>
    </div>
  );
}

export default Login;