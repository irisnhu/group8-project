import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { accessToken, user } = useSelector((state) => state.auth);

  console.log("ActivityLogs - accessToken:", accessToken);
  console.log("ActivityLogs - user:", user);

  useEffect(() => {
    if (accessToken) {
      fetchLogs();
    } else {
      setError("Không có token xác thực");
    }
  }, [accessToken]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(""); // Reset error
    try {
      console.log("Fetching logs with token:", accessToken);
      const res = await fetch("http://localhost:5000/api/admin/logs", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("Fetch response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch error response:", errorText);
        throw new Error(`Lỗi ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("Fetched logs data:", data);
      setLogs(data);
    } catch (err) {
      console.error("Fetch logs error:", err);
      setError(err.message || "Không thể tải logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getActionColor = (action) => {
    switch (action) {
      case "LOGIN_SUCCESS":
        return "#4caf50";
      case "LOGIN_FAILED":
        return "#f44336";
      case "SIGNUP_SUCCESS":
        return "#2196f3";
      case "SIGNUP_ERROR":
        return "#ff9800";
      case "LOGOUT":
        return "#9c27b0";
      case "RATE_LIMIT_BLOCK":
        return "#ff5722";
      default:
        return "#757575";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1976d2", textAlign: "center", marginBottom: "20px" }}>
        LOGS HOẠT ĐỘNG NGƯỜI DÙNG
      </h1>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Thời gian</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Hành động</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Người dùng</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>IP</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log._id || index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {formatDate(log.timestamp)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <span
                      style={{
                        backgroundColor: getActionColor(log.action),
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {log.userId?.name || "Guest"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {log.userId?.email || "N/A"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {log.ip || "N/A"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {log.details ? JSON.stringify(log.details, null, 2) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>Không có logs nào.</p>
      )}
    </div>
  );
}
export default ActivityLogs;

