import { Link, useLocation } from "react-router-dom";
import { getUser, BASE_URL } from "../utils/api";

const Sidebar = () => {
  const user = getUser();
  const location = useLocation();
  const role = user?.role;
  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  const photoUrl = user?.photo_url
    ? user.photo_url.startsWith("http") ? user.photo_url : `${BASE_URL}/${user.photo_url}`
    : `https://ui-avatars.com/api/?name=${user?.first_name || "U"}+${user?.last_name || ""}&background=3b82f6&color=fff&size=40`;

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#60a5fa" : "white",
    textDecoration: "none",
    display: "block",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    background: location.pathname === path ? "rgba(255,255,255,0.1)" : "transparent",
  });

  const sectionLabel = (text) => ({
    fontSize: "10px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "700",
    padding: "16px 12px 4px",
    display: "block",
  });

  return (
    <div style={{ width: "220px", minWidth: "220px", background: "#1e293b", color: "white", padding: "16px 12px", overflowY: "auto" }}>
      {/* User Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 12px 12px", borderBottom: "1px solid #334155", marginBottom: "8px" }}>
        <img src={photoUrl} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #475569" }} />
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", lineHeight: "1.2" }}>{user?.first_name} {user?.last_name?.charAt(0)}.</div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{isAdmin ? (isSuperAdmin ? "Super Admin" : "Admin") : "Employee"}</div>
        </div>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {isAdmin && (
          <>
            <span style={sectionLabel("Overview")}>Overview</span>
            <li><Link to="/admin" style={linkStyle("/admin")}>Dashboard</Link></li>
            <li><Link to="/admin/employees" style={linkStyle("/admin/employees")}>Employees</Link></li>

            <span style={sectionLabel("Work")}>Work</span>
            <li><Link to="/admin/assign-task" style={linkStyle("/admin/assign-task")}>Assign Tasks</Link></li>
            <li><Link to="/admin/attendance" style={linkStyle("/admin/attendance")}>Attendance</Link></li>
            <li><Link to="/admin/leaves" style={linkStyle("/admin/leaves")}>Leaves</Link></li>

            <span style={sectionLabel("Finance")}>Finance</span>
            {/* <li><Link to="/admin/payroll" style={linkStyle("/admin/payroll")}>Payroll</Link></li> */}
            <li><Link to="/admin/metals" style={linkStyle("/admin/metals")}>Metal Prices</Link></li>
            <li><Link to="/admin/payments" style={linkStyle("/admin/payments")}>Payments</Link></li>

            <span style={sectionLabel("Admin")}>Admin</span>
            <li><Link to="/admin/login-activity" style={linkStyle("/admin/login-activity")}>Login Activity</Link></li>
            <li><Link to="/admin/reports" style={linkStyle("/admin/reports")}>Reports</Link></li>
            <li><Link to="/admin/password-resets" style={linkStyle("/admin/password-resets")}>Password Resets</Link></li>
            {isSuperAdmin && (
              <li><Link to="/admin/system-logs" style={linkStyle("/admin/system-logs")}>System Logs</Link></li>
            )}
          </>
        )}

        {!isAdmin && (
          <>
            <span style={sectionLabel("Employee")}>Employee</span>
            <li><Link to="/employee" style={linkStyle("/employee")}>Dashboard</Link></li>
            <li><Link to="/employee/tasks" style={linkStyle("/employee/tasks")}>My Tasks</Link></li>
            <li><Link to="/employee/attendance" style={linkStyle("/employee/attendance")}>Attendance</Link></li>
            <li><Link to="/employee/leaves" style={linkStyle("/employee/leaves")}>Leaves</Link></li>
            <li><Link to="/employee/documents" style={linkStyle("/employee/documents")}>Documents</Link></li>
            <li><Link to="/employee/profile" style={linkStyle("/employee/profile")}>My Profile</Link></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;