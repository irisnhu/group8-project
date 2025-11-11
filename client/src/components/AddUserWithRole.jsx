// src/components/AddUserWithRole.jsx
import React, { useState, useEffect } from "react";
import AddUser from "./AddUser";

function AddUserWithRole({ onAddUser, onUpdateUser, editingUser }) {
  const [role, setRole] = useState("user");

  // Khi chỉnh sửa → lấy role hiện tại
  useEffect(() => {
    if (editingUser) {
      setRole(editingUser.role || "user");
    } else {
      setRole("user");
    }
  }, [editingUser]);

  // Ghi đè onAddUser và onUpdateUser để thêm role
  const handleAdd = (userData) => {
    onAddUser({ ...userData, role });
  };

  const handleUpdate = ({ id, ...userData }) => {
    onUpdateUser({ id, ...userData, role });
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      {/* Form AddUser – chỉ chiếm 70% chiều rộng */}
      <div style={{ marginBottom: "16px" }}>
        <AddUser
          onAddUser={handleAdd}
          onUpdateUser={handleUpdate}
          editingUser={editingUser}
        />
      </div>

      {/* Radio Button chọn Role */}
      <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
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
    </div>
  );
}

export default AddUserWithRole;