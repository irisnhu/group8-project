// src/components/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    setError("Mật khẩu không khớp!");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }), // ĐÚNG: { password: "..." }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Reset thất bại");

    setMessage("Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...");
    setTimeout(() => navigate("/login"), 2000);
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Đặt lại mật khẩu</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          required
        />
        <button type="submit" style={{ width: "100%", padding: "10px", background: "#1976d2", color: "#fff", border: "none" }}>
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
};

export default ResetPassword; // ← ĐÚNG: default export