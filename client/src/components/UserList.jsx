// src/components/UserList.jsx
import React from "react";

function UserList({ users, onEditUser, onDeleteUser, onDeleteAllUsers }) {
  const handleDelete = (id) => {
    
      onDeleteUser(id);
    
  };

  const handleDeleteAll = () => {
    if (window.confirm("XÓA TẤT CẢ? Không thể khôi phục!")) {
      onDeleteAllUsers();
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", marginTop: "20px" }}>
      <h2>Danh sách người dùng</h2>
      {users.length === 0 ? (
        <p>Chưa có người dùng nào.</p>
      ) : (
        <>
          <div style={{ marginBottom: "10px", textAlign: "right" }}>
            <button
              onClick={handleDeleteAll}
              style={{
                backgroundColor: "#b4170cff",
                color: "#fff",
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Xóa tất cả
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px", width: "8%", textAlign: "center" }}>STT</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Tên</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Email</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Git Name</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Vai trò</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", width: "22%", textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u._id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                    {index + 1}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.name || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.email || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.gitname || "N/A"}</td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: u.role === "admin" ? "#d32f2f" : "#1976d2",
                    }}
                  >
                    {u.role === "admin" ? "ADMIN" : u.role === "moderator" ? "MODERATOR" : "USER"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                    <button
                      onClick={() => onEditUser(u)}
                      style={{
                        backgroundColor: "#2a842df6",
                        color: "#fff",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "5px",
                        fontSize: "13px",
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      style={{
                        backgroundColor: "#c73126ff",
                        color: "#fff",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default UserList;