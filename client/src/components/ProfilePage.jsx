// src/components/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Login.css";
import "./../styles/ProfileCard.css";
import gitIcon from "../assets/git-icon.png";
import mailIcon from "../assets/mail-icon.png";
import defaultAvatar from "../assets/default-avatar.jpg";

const ProfilePage = ({ user: initialUser, onLogout, onUpdate }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser || {});
  const [name, setName] = useState("");
  const [gitname, setGitName] = useState("");
  const [avatar, setAvatar] = useState(initialUser?.avatar || defaultAvatar); // ← DÙNG avatarUrl
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setName(initialUser.name || "");
      setGitName(initialUser.gitname || "");
      setAvatar(initialUser.avatar || defaultAvatar); // ← DÙNG avatarUrl
    }
  }, [initialUser]);

  const handleInputChange = (field, value, setter) => {
    setter(value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setMessage("");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Ảnh quá lớn! Vui lòng chọn ảnh dưới 3MB.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    console.log("BƯỚC 1: ĐÃ CHỌN FILE", file.name, file.size); // LOG 1

    setMessage("Đang tải ảnh lên...");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:5000/api/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Upload thất bại");
      }

      const data = await res.json();

      console.log("BƯỚC 2: RESPONSE TỪ CLOUDINARY", data); // LOG 2

      console.log("BƯỚC 3: UPLOAD THÀNH CÔNG → URL:", data.url); // LOG 3
      setAvatar(data.url);
      setMessage("Upload thành công! Nhấn Cập nhật để lưu.");
    } catch (err) {
      console.error("LỖI UPLOAD", err);
      setMessage(`Lỗi: ${err.message}`);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Tên không được để trống";
    if (!gitname.trim()) newErrors.gitname = "Git name không được để trống";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setMessage("Đang lưu vào cơ sở dữ liệu...");

    console.log("BƯỚC 4: DỮ LIỆU GỬI LÊN DB", { name: name.trim(), gitname: gitname.trim(), avatar: avatar }); // LOG 4

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          gitname: gitname.trim(),
          avatar: avatar,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        throw new Error("Server trả về phản hồi không hợp lệ");
      }
      console.log("BƯỚC 5: RESPONSE TỪ /api/profile", data); // LOG 5

      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      const updatedUser = data.user;
      console.log("BƯỚC 6: USER ĐÃ CẬP NHẬT TRONG DB", updatedUser); // LOG 6

      setUser(updatedUser);
      onUpdate && onUpdate(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Cập nhật thành công!");
      setTimeout(() => {
        console.log("BƯỚC 7: TẢI LẠI TRANG..."); // LOG 7
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("LỖI CẬP NHẬT DB", err);
      setMessage(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === XỬ LÝ XÓA TÀI KHOẢN ===
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:5000/api/admin/users/${initialUser._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      let err;
      try {
        err = await res.json();
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        throw new Error("Server trả về phản hồi không hợp lệ");
      }

      if (!res.ok) {
        throw new Error(err.message || "Xóa tài khoản thất bại");
      }

      alert("Tài khoản đã được xóa vĩnh viễn!");
      onLogout();
      navigate("/login");
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  if (!initialUser) return <p>Không có thông tin người dùng</p>;

  const displayName = initialUser?.name?.trim() || "Chưa có tên";
  const displayGitName = initialUser?.gitname?.trim() || "Chưa có Git name";
  const email = initialUser?.email?.trim() || "Chưa có email";

  const getRoleInVietnamese = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'moderator': return 'Điều hành viên';
      case 'user': return 'Người dùng';
      default: return 'Người dùng';
    }
  };

  return (
    <div className="profile-container">
      {/* WELCOME TEXT */}
      <div style={{ textAlign: "left", margin: "20px 0", fontSize: "18px", fontWeight: "600", color: "#1976d2" }}>
        Xin chào {getRoleInVietnamese(user?.role)} {user?.name || "Người dùng"}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0"}}>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="auth-btn"
            style={{ width: "250px", height: "50px" }}
          >
            Admin Dashboard
          </button>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="auth-btn logout-btn"
            style={{ width: "250px"}}
          >
            Đăng xuất
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* === FORM CẬP NHẬT (30%) === */}
        <div
          style={{
            flex: "0 0 30%",
            minWidth: "300px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid #e0e0e0",
          }}
        >
          <h2 style={{ margin: "0 0 20px", color: "#1976d2", fontSize: "1.4rem", fontWeight: "600" }}>
            Cập nhật thông tin
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Tên */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#333" }}>
                Tên:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleInputChange("name", e.target.value, setName)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${errors.name ? "#d32f2f" : "#ccc"}`,
                  fontSize: "15px",
                  fontFamily: "'Poppins', sans-serif",
                }}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p style={{ color: "#d32f2f", fontSize: "13px", margin: "6px 0 0" }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Git Name */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#333" }}>
                Git Name:
              </label>
              <input
                type="text"
                value={gitname}
                onChange={(e) => handleInputChange("gitname", e.target.value, setGitName)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${errors.gitname ? "#d32f2f" : "#ccc"}`,
                  fontSize: "15px",
                  fontFamily: "'Poppins', sans-serif",
                }}
                disabled={isSubmitting}
              />
              {errors.gitname && (
                <p style={{ color: "#d32f2f", fontSize: "13px", margin: "6px 0 0" }}>
                  {errors.gitname}
                </p>
              )}
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#333" }}>
                Avatar:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isSubmitting}
                style={{ fontSize: "14px" }}
              />
              <p style={{ fontSize: "12px", color: "#666", margin: "6px 0 0" }}>
                Chọn ảnh mới (tối đa 3MB)
              </p>
            </div>

            {/* === NÚT CẬP NHẬT + XÓA CẠNH NHAU === */}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: "1",
                  backgroundColor: isSubmitting ? "#999" : "#1976d2",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {isSubmitting ? "Đang lưu..." : "Cập nhật"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  flex: "1",
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Xóa tài khoản
              </button>
            </div>

            {/* THÔNG BÁO */}
            {message && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  textAlign: "center",
                  backgroundColor: message.includes("thành công") ? "#d4edda" : "#f8d7da",
                  color: message.includes("thành công") ? "#155724" : "#721c24",
                  border: `1px solid ${message.includes("thành công") ? "#c3e6cb" : "#f5c6cb"}`,
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        {/* === CARD PROFILE (70%) === */}
        <div style={{ flex: "1", minWidth: "300px" }}>
          <div className="profile-card">
            <div className="profile-left">
              <h1 className="user-name">{displayName}</h1>
              <div className="info-row">
                <img src={gitIcon} alt="Git icon" className="icon" />
                <span className="label">Tên git:</span>
                <span className="value">{displayGitName}</span>
              </div>
              <div className="info-row">
                <img src={mailIcon} alt="Mail icon" className="icon" />
                <span className="label">Email:</span>
                <span className="value">{email}</span>
              </div>
            </div>
            <div className="profile-right">
              <img src={avatar} alt="Avatar" className="avatar" /> {/* ← DÙNG avatar state */}
            </div>
          </div>
        </div>
      </div>

      {/* === MODAL XÁC NHẬN XÓA === */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "340px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ color: "#d32f2f", margin: "0 0 12px" }}>Xác nhận xóa tài khoản</h3>
            <p style={{ margin: "0 0 16px", fontSize: "15px" }}>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{displayName}</strong>?
            </p>
            <p style={{ color: "#d32f2f", fontSize: "13px", margin: "0 0 16px" }}>
              Hành động này <strong>KHÔNG THỂ HOÀN TÁC</strong>!
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={handleDeleteAccount}
                style={{
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Xóa vĩnh viễn
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  backgroundColor: "#757575",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;