import { useState, useEffect, useRef } from "react";
import { getUser, logout, apiCall } from "../utils/api";
import { useNavigate } from "react-router-dom";

// ── helpers ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "task",
    message: "New task assigned: Polish gold rings",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    type: "leave",
    message: "Your leave request has been approved",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    type: "payroll",
    message: "Your salary for March has been processed",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 4,
    type: "task",
    message: "Task 'Engrave bracelet' marked as completed",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function notifIcon(type) {
  const map = {
    task: "📋",
    leave: "🗓️",
    payroll: "💰",
    attendance: "🕐",
    system: "🔔",
  };
  return map[type] || "🔔";
}

// ── component ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const user = getUser();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await apiCall("/notifications");
      const data = await res.json();

      if (data.status === "success") {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      await apiCall(`/notifications/${n.id}/read`, {
        method: "PUT",
      });

      if (n.type === "task") {
        navigate("/employee/tasks");
      } else if (n.type === "leave") {
        navigate("/employee/leaves");
      } else if (n.type === "payroll") {
        navigate("/employee/payroll");
      }

      setOpen(false);
    } catch (err) {
      console.error("Notification click failed:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // ── close dropdown when clicking outside ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── mark all as read ──
  const markAllRead = async () => {
    try {
      await apiCall("/notifications/mark-all-read", {
        method: "PUT",
      });

      // Refresh from backend (BEST way)
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  // ── mark single as read ──
  const markRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, {
        method: "PUT",
      });

      fetchNotifications(); // sync with backend
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <div
      style={{
        height: "60px",
        background: "white",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        gap: "20px",
      }}
    >
      {/* Left */}
      <h1
        style={{ fontSize: "18px", fontWeight: "bold", whiteSpace: "nowrap" }}
      >
        {user?.role === "employee" ? "Employee Panel" : "Admin Panel"}
      </h1>

      {/* Center – Search */}
      <input
        type="text"
        placeholder="Search..."
        style={{
          flex: 1,
          maxWidth: "400px",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* ── Bell ── */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          {/* Bell Button */}
          <button
            onClick={() => {
              setOpen((v) => !v);
              if (!open) fetchNotifications();
            }}
            style={{
              position: "relative",
              background: open ? "#f1f5f9" : "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "9px",
                  fontWeight: "700",
                  minWidth: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  padding: "0 3px",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              style={{
                position: "absolute",
                top: "46px",
                right: 0,
                width: "340px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                border: "1px solid #e2e8f0",
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "#1e293b",
                  }}
                >
                  Notifications{" "}
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "10px",
                        fontSize: "11px",
                        padding: "1px 7px",
                        marginLeft: "6px",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#2563eb",
                      fontWeight: "600",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      🔕
                    </div>
                    <p style={{ fontSize: "13px" }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f8fafc",
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        cursor: "pointer",
                        background: n.is_read ? "white" : "#eff6ff",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          fontSize: "20px",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        {notifIcon(n.type)}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#1e293b",
                            fontWeight: n.is_read ? "400" : "600",
                            lineHeight: "1.4",
                            margin: 0,
                          }}
                        >
                          {n.message}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "3px",
                          }}
                        >
                          {timeAgo(n.created_at)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!n.is_read && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#2563eb",
                            flexShrink: 0,
                            marginTop: "5px",
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderTop: "1px solid #f1f5f9",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={{ textAlign: "right", fontSize: "14px" }}>
          <div style={{ fontWeight: "600" }}>
            {user?.first_name} {user?.last_name}
          </div>
          <div style={{ color: "#64748b", fontSize: "12px" }}>
            {user?.employee_id} • {user?.role?.replace("_", " ")}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={async () => {
            try {
              await apiCall("/attendance/check-out", { method: "POST" });
              await apiCall("/auth/logout", { method: "POST" });
            } catch (e) {}

            logout(); // clears localStorage and redirects
          }}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "6px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
