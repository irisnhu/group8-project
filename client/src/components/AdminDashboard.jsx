// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";  // ← THAY ĐỔI Ở ĐÂY
import UserList from "./UserList";

function AdminDashboard() {
  const navigate = useNavigate();
  console.log("AdminDashboard component rendered");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: "", name: "" });


  const { accessToken, user: currentUser } = useSelector((state) => state.auth);
  // Removed redundant role check since RoleGuard handles it

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response:", errorText);
        throw new Error("Không thể lấy danh sách");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // GỌI API SIGNUP VỚI ROLE
  const handleAddUser = async (userData) => {
    await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, password: "123456" }),
    });
    fetchUsers();
  };

  // GỌI API UPDATE VỚI ROLE
  const handleUpdateUser = async ({ id, ...userData }) => {
    await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });
    fetchUsers();
    setEditingUser(null);
  };


  const handleDeleteUser = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Xóa thất bại");
    }

    // Chỉ gọi fetchUsers khi xóa thành công
    await fetchUsers();
    setDeleteConfirm({ show: false, id: "", name: "" });
    alert("Xóa thành công!");
  } catch (err) {
    alert(`Lỗi: ${err.message}`);
  }
};

  const handleDeleteAll = async () => {
    if (!window.confirm("XÓA TẤT CẢ?")) return;
    await Promise.all(users.map(u => handleDeleteUser(u._id)));
  };

  useEffect(() => {
    if (accessToken && currentUser?.role === "admin") fetchUsers();
  }, [accessToken, currentUser?.role, fetchUsers]);



  const getRoleInVietnamese = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'moderator': return 'Điều hành viên';
      case 'user': return 'Người dùng';
      default: return 'Người dùng';
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* WELCOME TEXT */}
      <div style={{ textAlign: "left", margin: "20px 0", fontSize: "18px", fontWeight: "600", color: "#1976d2" }}>
        Xin chào {getRoleInVietnamese(currentUser?.role)} {currentUser?.name || "Người dùng"}
      </div>

      <h1 style={{ color: "#1976d2", textAlign: "center" }}>QUẢN TRỊ NGƯỜI DÙNG</h1>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
        <button
        onClick={() => navigate('/logs')}
        className="auth-btn"
        style={{ width: "200px", height: "50px", marginLeft: "10px" }}
      >
       Xem Logs
      </button>
      </div>
      

      {/* FORM MỚI – NHỎ HƠN + CÓ RADIO */}
      <AddUser
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        editingUser={editingUser}
      />
      {editingUser && (
        <button onClick={() => setEditingUser(null)} style={{ display: "block", margin: "10px auto" }}>
          Hủy sửa
        </button>
      )}

      {loading ? <p>Đang tải...</p> : (
        <UserList
          users={users}
          onEditUser={setEditingUser}
          onDeleteUser={(id) => {
            const user = users.find(u => u._id === id);
            setDeleteConfirm({ show: true, id, name: user?.name || "" });
          }}
          onDeleteAllUsers={handleDeleteAll}
        />
      )}

      {/* Modal xác nhận xóa */}
      {deleteConfirm.show && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "320px", textAlign: "center" }}>
            <h3>Xác nhận xóa</h3>
            <p>Xóa <strong>{deleteConfirm.name}</strong>?</p>
            <button onClick={() => handleDeleteUser(deleteConfirm.id)} style={{ background: "#d32f2f", color: "#fff", padding: "10px 20px", margin: "0 8px", border: "none", borderRadius: "6px" }}>
              Xóa
            </button>
            <button onClick={() => setDeleteConfirm({ show: false })} style={{ background: "#757575", color: "#fff", padding: "10px 20px", margin: "0 8px", border: "none", borderRadius: "6px" }}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;