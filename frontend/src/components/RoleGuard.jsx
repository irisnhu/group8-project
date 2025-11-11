// src/components/RoleGuard.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, accessToken } = useSelector((state) => state.auth);

  console.log("RoleGuard - user:", user);
  console.log("RoleGuard - accessToken:", accessToken);
  console.log("RoleGuard - allowedRoles:", allowedRoles);
  console.log("RoleGuard - user.role:", user?.role);

  // Nếu chưa đăng nhập → về login
  if (!accessToken || !user) {
    console.log("RoleGuard: Redirecting to login - no token or user");
    return <Navigate to="/login" replace />;
  }

  // Nếu không có quyền → về profile (thay vì login để tránh loop)
  if (!allowedRoles.includes(user.role)) {
    console.log("RoleGuard: Redirecting to profile - role not allowed");
    return <Navigate to="/profile" replace />;
  }

  console.log("RoleGuard: Access granted");
  // Nếu đủ quyền → render route con
  return <Outlet />;
};

export default RoleGuard;