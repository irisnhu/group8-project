import React, { useState } from "react";
import background from "../assets/bg4.png";
import "../styles/Auth.css";

function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    gitname: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("Mật khẩu không khớp");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          gitname: form.gitname,
          password: form.password, // ✅ GỬI THÊM password
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lỗi khi đăng ký");
      }

      const data = await res.json();
      setMessage(`✅ ${data.message || "Đăng ký thành công!"}`);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div
      className="auth-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="auth-container">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <h1>Đăng ký</h1>
          <form onSubmit={handleSubmit}>
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Nhập tên người dùng"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <label style={{ marginTop: "20px" }}>Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <label style={{ marginTop: "20px" }}>Tên git</label>
            <input
              type="text"
              placeholder="Nhập tên hiển thị"
              value={form.gitname}
              onChange={(e) => setForm({ ...form, gitname: e.target.value })}
              required
            />

            <div className="auth-password-group">
              <div>
                <label>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="********"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Nhập lại mật khẩu</label>
                <input
                  type="password"
                  placeholder="********"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button">
              Đăng ký
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-link">
            Đã có tài khoản? <a href="/login">Đăng nhập</a>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <div className="auth-right-inner"></div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
