import { useEffect, useState } from "react";
import { apiCall } from "../../utils/api";
import Layout from "../../components/Layout";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingFor, setUploadingFor] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [viewTask, setViewTask] = useState(null); // NEW

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiCall("/tasks/");
      const data = await res.json();

      if (data.status === "success") {
        setTasks(data.data?.tasks || data.data || []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
      setTasks([]);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const startTask = async (id) => {
    try {
      await apiCall(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "in_progress" }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Start failed:", err);
    }
  };

  const submitForReview = async (id) => {
    setSubmitting(id);
    try {
      for (const file of selectedFiles) {
        await apiCall(`/tasks/${id}/comments`, {
          method: "POST",
          body: JSON.stringify({ comment: `📸 Image submitted: ${file.name}` }),
        });
      }

      await apiCall(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "on_hold" }),
      });

      setSelectedFiles([]);
      setUploadingFor(null);
      fetchTasks();
    } catch (err) {
      console.error("Submit for review failed:", err);
    } finally {
      setSubmitting(null);
    }
  };

  const prioColor = (p) => {
    const c = { low: "#6b7280", medium: "#3b82f6", high: "#ea580c", urgent: "#dc2626" };
    return c[p] || "#6b7280";
  };

  return (
    <Layout>
      <div style={{ padding: "16px", width: "100%" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px" }}>
          My Tasks
        </h1>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            Loading tasks...
          </div>
        )}

        {!loading && error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <p style={{ fontSize: "18px", fontWeight: "600", color: "#64748b" }}>
              No tasks assigned
            </p>
            <p style={{ fontSize: "14px", marginTop: "4px" }}>
              You're all caught up
            </p>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                {/* Task Info */}
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    {task.title}
                  </h3>

                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.4", marginBottom: "12px" }}>
                    {task.description || "No description"}
                  </p>

                  {/* NEW META */}
                  <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
                    📅 Assigned: {task.created_at || "—"} <br />
                    ⏰ Due: {task.due_date || "—"} <br />
                    💰 Payment: ₹{task.payment_amount || 0}
                  </div>

                  {/* Meta Chips */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {task.category && (
                      <span style={{ background: "#f1f5f9", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
                        {task.category}
                      </span>
                    )}
                    <span style={{ background: `${prioColor(task.priority)}15`, color: prioColor(task.priority), padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: task.status === "pending" ? "#fef3c7" : task.status === "in_progress" ? "#dbeafe" : task.status === "on_hold" ? "#fef9c3" : task.status === "completed" ? "#dcfce7" : "#f1f5f9",
                    color: task.status === "pending" ? "#d97706" : task.status === "in_progress" ? "#2563eb" : task.status === "on_hold" ? "#a16207" : task.status === "completed" ? "#16a34a" : "#64748b",
                  }}>
                    {task.status === "pending" && "📌 Assigned"}
                    {task.status === "in_progress" && "🔧 In Progress"}
                    {task.status === "on_hold" && "👀 Under Review"}
                    {task.status === "completed" && "✅ Completed"}
                  </span>
                </div>

                {/* ACTIONS */}
                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={() => setViewTask(task)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "white",
                      cursor: "pointer",
                      marginBottom: "8px",
                    }}
                  >
                    👁 View Details
                  </button>

                  {task.status === "pending" && (
                    <button
                      onClick={() => startTask(task.id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                        background: "#3b82f6",
                        color: "white",
                      }}
                    >
                      ▶ Start Task
                    </button>
                  )}

                  {task.status === "in_progress" && (
                    <div>
                      {uploadingFor !== task.id ? (
                        <button
                          onClick={() => {
                            setUploadingFor(task.id);
                            setSelectedFiles([]);
                          }}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "2px dashed #cbd5e1",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "14px",
                            background: "white",
                            color: "#475569",
                          }}
                        >
                          📸 Upload Images & Submit for Review
                        </button>
                      ) : (
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", background: "#f8fafc" }}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setSelectedFiles([...e.target.files])}
                            style={{ marginBottom: "10px" }}
                          />

                          {selectedFiles.length > 0 && (
                            <ul style={{ fontSize: "12px", marginBottom: "10px" }}>
                              {selectedFiles.map((file, i) => (
                                <li key={i}>{file.name}</li>
                              ))}
                            </ul>
                          )}

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => submitForReview(task.id)}
                              disabled={selectedFiles.length === 0 || submitting === task.id}
                              style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "13px",
                                background: "#16a34a",
                                color: "white",
                              }}
                            >
                              {submitting === task.id ? "Submitting..." : "✓ Submit"}
                            </button>

                            <button
                              onClick={() => {
                                setUploadingFor(null);
                                setSelectedFiles([]);
                              }}
                              style={{
                                padding: "10px 14px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                cursor: "pointer",
                                fontSize: "13px",
                                background: "white",
                                color: "#64748b",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {task.status === "on_hold" && (
                    <div style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      padding: "12px",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}>
                      ⏳ Submitted — Waiting for admin approval
                    </div>
                  )}

                  {task.status === "completed" && (
                    <div style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "12px",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}>
                      ✅ Task completed — Approved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW DETAILS MODAL */}
        {viewTask && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}>
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}>
              <h2>{viewTask.title}</h2>
              <p>{viewTask.description}</p>

              {/* Task Attachment */}
              {viewTask.attachment_url && (
                <div style={{ marginTop: "10px" }}>
                  <p style={{ fontWeight: "600" }}>Task Attachment:</p>
              
                  {viewTask.attachment_url.match(/\.(mp4|webm|ogg)$/) ? (
                    <video controls style={{ width: "100%", marginTop: "8px", borderRadius: "8px" }}>
                      <source src={viewTask.attachment_url} />
                    </video>
                  ) : (
                    <img
                      src={viewTask.attachment_url}
                      alt="Task Attachment"
                      style={{ width: "100%", marginTop: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    />
                  )}
                </div>
              )}

              <h4>Comments:</h4>
              {viewTask.comments?.length > 0 ? (
                viewTask.comments.map((c, i) => (
                  <p key={i}>• {c.comment}</p>
                ))
              ) : (
                <p>No comments</p>
              )}

              <button
                onClick={() => setViewTask(null)}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  width: "100%",
                  borderRadius: "6px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeTasks;