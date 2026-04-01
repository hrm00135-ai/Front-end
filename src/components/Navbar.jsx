import { useState, useEffect, useRef } from "react";
import { getUser, logout, apiCall } from "../utils/api";
import { useNavigate } from "react-router-dom";

// ── helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "read_notification_ids";

/** Persist read IDs in localStorage so they survive page refresh */
function getLocalReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveLocalReadId(id) {
  const ids = getLocalReadIds();
  ids.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function saveAllReadIds(notifications) {
  const ids = getLocalReadIds();
  notifications.forEach((n) => ids.add(n.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/** Merge backend notifications with locally-persisted read state */
function mergeReadState(notifications) {
  const localReadIds = getLocalReadIds();
  return notifications.map((n) => ({
    ...n,
    is_read: n.is_read || localReadIds.has(n.id),
  }));
}

/** Return the correct base route based on notification type and user role */
function getNotifRoute(type, role) {
  const isAdmin = role === "admin" || role === "super_admin";
  if (isAdmin) {
    const adminMap = {
      task: "/admin/assign-task",
      leave: "/admin/leaves",
      payroll: "/admin/payroll",
      attendance: "/admin/attendance",
    };
    return adminMap[type] || null;
  }
  const employeeMap = {
    task: "/employee/tasks",
    leave: "/employee/leaves",
    payroll: "/employee/payroll",
    attendance: "/employee/attendance",
  };
  return employeeMap[type] || null;
}

/**
 * Extract the task/entity ID from a notification.
 * Backends typically attach task_id / related_id on the notification object.
 */
function extractRelatedId(notification) {
  return (
    notification.task_id ||
    notification.related_id ||
    notification.related_object_id ||
    null
  );
}

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
        // Merge backend data with locally-persisted read state
        setNotifications(mergeReadState(data.data || []));
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleNotificationClick = async (n) => {
    // 1. Optimistically update UI immediately (no waiting for API)
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, is_read: true } : item
      )
    );

    // 2. Persist locally so read state survives page refresh
    saveLocalReadId(n.id);

    // 3. Close dropdown
    setOpen(false);

    // 4. Navigate to the relevant page, passing the related entity ID so
    //    the page can auto-open the correct task / leave / etc.
    const route = getNotifRoute(n.type, user?.role);
    if (route) {
      const relatedId = extractRelatedId(n);
      const destination =
        relatedId && n.type === "task"
          ? `${route}?taskId=${relatedId}`
          : route;
      navigate(destination);
    }

    // 5. Tell backend in background (fire-and-forget)
    try {
      await apiCall(`/notifications/${n.id}/read`, { method: "PUT" });
    } catch (err) {
      console.error("Failed to mark notification as read on server:", err);
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
    // 1. Optimistically update UI immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    // 2. Persist all IDs locally so refresh doesn't reset them
    saveAllReadIds(notifications);

    // 3. Tell backend in background (fire-and-forget)
    try {
      await apiCall("/notifications/mark-all-read", { method: "PUT" });
    } catch (err) {
      console.error("Failed to mark all notifications as read on server:", err);
    }
  };

  // ── mark single as read (kept for legacy usage) ──
  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    saveLocalReadId(id);
    try {
      await apiCall(`/notifications/${id}/read`, { method: "PUT" });
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = n.is_read
                          ? "#f8fafc"
                          : "#dbeafe";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = n.is_read
                          ? "white"
                          : "#eff6ff";
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