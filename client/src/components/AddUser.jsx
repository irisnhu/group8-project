import React, { useState, useEffect } from "react";

function AddUser({ onAddUser, onUpdateUser, editingUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gitname, setGitname] = useState("");
  const [role, setRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", gitname: "", form: "" });

  // Điền form khi chỉnh sửa
  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
      setGitname(editingUser.gitname || "");
      setRole(editingUser.role || "user");
      setErrors({ name: "", email: "", gitname: "", form: "" });
    } else {
      setName("");
      setEmail("");
      setGitname("");
      setRole("user");
      setErrors({ name: "", email: "", gitname: "", form: "" });
    }
  }, [editingUser]);

  // Validation cho từng field
  const validateField = (field, value) => {
    switch (field) {
      case "name":
        return value.trim() ? "" : "Tên không được để trống";
      case "email":
        if (!value.trim()) return "Email không được để trống";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email không hợp lệ";
      case "gitname":
        return value.trim() ? "" : "Git Name không được để trống";
      default:
        return "";
    }
  };

  // Validation real-time khi nhập
  const handleInputChange = (field, value, setter) => {
    setter(value);
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
      form: "",
    }));
  };

  // Validation toàn form khi submit
  const validateForm = () => {
    const newErrors = {
      name: validateField("name", name),
      email: validateField("email", email),
      gitname: validateField("gitname", gitname),
      form: "",
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.gitname;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingUser) {
        if (!editingUser._id) throw new Error("ID người dùng không hợp lệ");
        await onUpdateUser({ id: editingUser._id, name, email, gitname, role });
      } else {
        await onAddUser({ name, email, gitname, role });
      }
      // Không reset form, chỉ xóa lỗi
      setErrors({ name: "", email: "", gitname: "", form: "" });
    } catch (error) {
      console.error(`❌ Lỗi khi ${editingUser ? "cập nhật" : "thêm"} user:`, error.message);
      let errorMessage = `Lỗi khi ${editingUser ? "cập nhật" : "thêm"} người dùng. Vui lòng thử lại!`;
      if (error.message.includes("E11000")) {
        errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác!";
      } else if (error.message.includes("404")) {
        errorMessage = "Người dùng không tồn tại!";
      }
      setErrors({
        ...errors,
        form: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: "70%", margin: "0 auto", border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
      <h2>{editingUser ? "Sửa người dùng" : "Thêm người dùng"}</h2>
      {errors.form && <p style={{ color: "red" }}>{errors.form}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Tên: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleInputChange("name", e.target.value, setName)}
            style={{
              width: "100%",
              padding: "5px",
              borderColor: errors.name ? "red" : "#ddd",
            }}
            disabled={isSubmitting}
          />
          {errors.name && <p style={{ color: "red", fontSize: "12px" }}>{errors.name}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
            style={{
              width: "100%",
              padding: "5px",
              borderColor: errors.email ? "red" : "#ddd",
            }}
            disabled={isSubmitting}
          />
          {errors.email && <p style={{ color: "red", fontSize: "12px" }}>{errors.email}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Git Name: </label>
          <input
            type="text"
            value={gitname}
            onChange={(e) => handleInputChange("gitname", e.target.value, setGitname)}
            style={{
              width: "100%",
              padding: "5px",
              borderColor: errors.gitname ? "red" : "#ddd",
            }}
            disabled={isSubmitting}
          />
          {errors.gitname && <p style={{ color: "red", fontSize: "12px" }}>{errors.gitname}</p>}
        </div>

        {/* Radio Button chọn Role */}
        <div style={{ marginBottom: "10px", textAlign: "center", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <label style={{ marginRight: "16px", fontWeight: "600" }}>
            <input
              type="radio"
              value="user"
              checked={role === "user"}
              onChange={(e) => setRole(e.target.value)}
              style={{ marginRight: "6px" }}
            />
            User
          </label>
          <label style={{ marginRight: "16px", fontWeight: "600" }}>
            <input
              type="radio"
              value="moderator"
              checked={role === "moderator"}
              onChange={(e) => setRole(e.target.value)}
              style={{ marginRight: "6px" }}
            />
            Moderator
          </label>
          <label style={{ fontWeight: "600" }}>
            <input
              type="radio"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
              style={{ marginRight: "6px" }}
            />
            Admin
          </label>
        </div>

        {/* Hiển thị role hiện tại khi sửa */}
        {editingUser && (
          <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginTop: "8px" }}>
            Đang sửa: <strong>{editingUser.name}</strong> – Vai trò: <strong>{role}</strong>
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? "#cccccc" : "#1976d2",
            color: "#fff",
            padding: "8px 22px",
            border: "none",
            borderRadius: "5px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Đang xử lý..." : editingUser ? "Cập nhật" : "Thêm"}
        </button>
      </form>
    </div>
  );
}

export default AddUser;