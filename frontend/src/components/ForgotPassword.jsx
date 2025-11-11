// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import {Link} from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        throw new Error("Server trả về phản hồi không hợp lệ");
      }
      if (!res.ok) throw new Error(data.message || "Gửi thất bại");

      setMessage("Đã gửi link đặt lại mật khẩu đến email của bạn!");
    } catch (err) {
      setMessage(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
      <h2 style={{ color: "#1976d2", marginBottom: "20px" }}>Quên mật khẩu</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Nhập email để nhận link đặt lại mật khẩu
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "16px",
          }}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#999" : "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Đang gửi..." : "Gửi link đặt lại"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: message.includes("Đã gửi") ? "#d4edda" : "#f8d7da",
            color: message.includes("Đã gửi") ? "#155724" : "#721c24",
          }}
        >
          {message}
        </p>
      )}

      <p style={{ marginTop: "20px" }}>
        <Link to="/login" style={{ color: "#1976d2", textDecoration: "none" }}>
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;