/**
 * JewelCraft HRM — Admin Payments Page
 * File: src/pages/Admin/Payments.jsx
 *
 * Drop this into your existing src/pages/Admin/ directory.
 * Then in App.jsx add:
 *   import Payments from "./pages/Admin/Payments";
 *   <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={["admin","super_admin"]}><Payments /></ProtectedRoute>} />
 *
 * And in Sidebar.jsx inside the Finance section add:
 *   <li><Link to="/admin/payments" style={linkStyle("/admin/payments")}>Payments</Link></li>
 */

import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import AdminTopBar from "../../components/AdminTopBar";
import { apiCall } from "../../utils/api";

// ─── tiny helpers ────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n ?? 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const WAGE_LABELS = {
  monthly_salary: "Monthly Salary",
  daily_wage:     "Daily Wage",
  per_task:       "Per Task",
};

const METHOD_LABELS = { cash: "💵 Cash", bank: "🏦 Bank", upi: "📱 UPI" };

// ─── sub-components ──────────────────────────────────────────────────────────

function SummaryCard({ label, value, color = "#1e293b", sub }) {
  return (
    <div style={{
      background: color, color: "#fff", borderRadius: 12, padding: "18px 22px",
      minWidth: 160, flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    }}>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function WorkSummaryBox({ summary, wageType }) {
  if (!summary) return null;
  if (summary.error) return (
    <div style={{ color: "#ef4444", padding: "12px 0", fontSize: 13 }}>{summary.error}</div>
  );

  const rows = [];
  if (wageType === "monthly_salary") {
    rows.push(["Months Worked", summary.months_worked]);
    rows.push(["Monthly Rate", fmt(summary.monthly_rate)]);
    rows.push(["Period", `${fmtDate(summary.period_start)} → ${fmtDate(summary.period_end)}`]);
  } else if (wageType === "daily_wage") {
    rows.push(["Days Present", summary.days_present]);
    rows.push(["Daily Rate", fmt(summary.daily_rate)]);
  } else if (wageType === "per_task") {
    rows.push(["Tasks Completed", summary.tasks_completed]);
    rows.push(["Rate per Task", fmt(summary.per_task_rate)]);
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 16px", minWidth: 140 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{k}</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

const Payments = () => {
  const [employees, setEmployees]         = useState([]);
  const [selectedEmp, setSelectedEmp]     = useState("");
  const [summary, setSummary]             = useState(null);
  const [history, setHistory]             = useState([]);
  const [historyTotal, setHistoryTotal]   = useState(0);
  const [historyPage, setHistoryPage]     = useState(1);
  const [overview, setOverview]           = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // Payment config state
  const [config, setConfig]         = useState(null);
  const [configForm, setConfigForm] = useState({ wage_type: "monthly_salary", wage_amount: "", effective_from: "", notes: "" });

  // Record-payment modal
  const [showPayModal, setShowPayModal]   = useState(false);
  const [payForm, setPayForm]             = useState({
    amount: "", payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash", reference_note: "",
  });

  // Config modal
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [msg, setMsg]         = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // ── fetch helpers ────────────────────────────────────────────────────────

  useEffect(() => { fetchEmployees(); fetchOverview(); }, []);

  const fetchEmployees = async () => {
    try {
      const res  = await apiCall("/users/?per_page=200");
      const data = await res.json();
      if (data.status === "success")
        setEmployees(data.data?.users?.filter(u => u.role === "employee") || []);
    } catch {}
  };

  const fetchOverview = async () => {
    try {
      const res  = await apiCall("/payments/overview");
      const data = await res.json();
      if (data.status === "success") setOverview(data.data || []);
    } catch {}
  };

  const fetchSummary = useCallback(async (empId, fd, td) => {
    if (!empId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fd) params.set("from_date", fd);
      if (td) params.set("to_date", td);
      const res  = await apiCall(`/payments/summary/${empId}?${params}`);
      const data = await res.json();
      if (data.status === "success") setSummary(data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async (empId, page = 1) => {
    if (!empId) return;
    try {
      const res  = await apiCall(`/payments/history/${empId}?page=${page}&per_page=10`);
      const data = await res.json();
      if (data.status === "success") {
        setHistory(data.data.transactions || []);
        setHistoryTotal(data.data.total || 0);
        setHistoryPage(page);
      }
    } catch {}
  }, []);

  const fetchConfig = useCallback(async (empId) => {
    if (!empId) return;
    try {
      const res  = await apiCall(`/payments/config/${empId}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setConfig(data.data);
        setConfigForm({
          wage_type:      data.data.wage_type,
          wage_amount:    data.data.wage_amount,
          effective_from: data.data.effective_from || "",
          notes:          data.data.notes || "",
        });
      } else { setConfig(null); }
    } catch {}
  }, []);

  // ── employee selection ───────────────────────────────────────────────────

  const handleEmpSelect = (empId) => {
    setSelectedEmp(empId);
    setSummary(null);
    setHistory([]);
    if (empId) {
      fetchSummary(empId, fromDate, toDate);
      fetchHistory(empId);
      fetchConfig(empId);
    }
  };

  const handleDateFilter = () => {
    if (selectedEmp) fetchSummary(selectedEmp, fromDate, toDate);
  };

  // ── record payment ───────────────────────────────────────────────────────

  const handleRecordPayment = async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      const res  = await apiCall("/payments/pay", {
        method: "POST",
        body: JSON.stringify({ ...payForm, employee_id: parseInt(selectedEmp), amount: parseFloat(payForm.amount) }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setMsg({ text: "Payment recorded successfully", type: "success" });
        setShowPayModal(false);
        setPayForm({ amount: "", payment_date: new Date().toISOString().split("T")[0], payment_method: "cash", reference_note: "" });
        setSummary(data.data.updated_balance);
        fetchHistory(selectedEmp);
        fetchOverview();
      } else {
        setMsg({ text: data.message, type: "error" });
      }
    } catch { setMsg({ text: "Network error", type: "error" }); }
    finally { setLoading(false); setTimeout(() => setMsg({ text: "", type: "" }), 4000); }
  };

  // ── save config ──────────────────────────────────────────────────────────

  const handleSaveConfig = async () => {
    if (!selectedEmp) return;
    try {
      const res  = await apiCall(`/payments/config/${selectedEmp}`, {
        method: "POST",
        body: JSON.stringify({ ...configForm, wage_amount: parseFloat(configForm.wage_amount) }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setMsg({ text: "Config saved", type: "success" });
        setConfig(data.data);
        setShowConfigModal(false);
        fetchSummary(selectedEmp, fromDate, toDate);
      } else { setMsg({ text: data.message, type: "error" }); }
    } catch { setMsg({ text: "Network error", type: "error" }); }
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  // ── reverse payment ──────────────────────────────────────────────────────

  const handleReverse = async (txId) => {
    if (!window.confirm("Reverse this payment? It will be marked as reversed.")) return;
    try {
      const res  = await apiCall(`/payments/reverse/${txId}`, { method: "POST", body: JSON.stringify({ reason: "Admin reversal" }) });
      const data = await res.json();
      if (data.status === "success") {
        setMsg({ text: "Payment reversed", type: "success" });
        fetchHistory(selectedEmp, historyPage);
        fetchSummary(selectedEmp, fromDate, toDate);
        fetchOverview();
      } else { setMsg({ text: data.message, type: "error" }); }
    } catch {}
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const S = styles;

  return (
    <Layout topBar={<AdminTopBar />}>
      <div style={S.page}>

        {/* ── Page Header ── */}
        <div style={S.pageHeader}>
          <div>
            <h2 style={S.pageTitle}>💳 Payment Management</h2>
            <p style={S.pageSubtitle}>Track earnings, record payments, and manage employee balances</p>
          </div>
        </div>

        {/* ── Flash Message ── */}
        {msg.text && (
          <div style={{ ...S.flash, background: msg.type === "success" ? "#dcfce7" : "#fee2e2", color: msg.type === "success" ? "#166534" : "#991b1b" }}>
            {msg.type === "success" ? "✅" : "❌"} {msg.text}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TOP: Employee selector + date filters
        ════════════════════════════════════════════════════════════════════ */}
        <div style={S.card}>
          <div style={S.filterRow}>
            <div style={{ flex: 2 }}>
              <label style={S.label}>Select Employee</label>
              <select
                style={S.select}
                value={selectedEmp}
                onChange={e => handleEmpSelect(e.target.value)}
              >
                <option value="">— Choose Employee —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>From Date</label>
              <input type="date" style={S.input} value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>To Date</label>
              <input type="date" style={S.input} value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button style={S.btnSecondary} onClick={handleDateFilter}>🔍 Filter</button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            EMPLOYEE DETAIL SECTION  (shown only when employee is selected)
        ════════════════════════════════════════════════════════════════════ */}
        {selectedEmp && (
          <>
            {/* Wage Config row */}
            <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={S.label}>Wage Configuration: </span>
                {config ? (
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>
                    {WAGE_LABELS[config.wage_type] || config.wage_type} — {fmt(config.wage_amount)}
                    <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>
                      (since {fmtDate(config.effective_from)})
                    </span>
                  </span>
                ) : (
                  <span style={{ color: "#ef4444", fontSize: 13 }}>⚠️ No wage config set</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={S.btnSecondary} onClick={() => setShowConfigModal(true)}>⚙️ Set Wage Config</button>
                <button style={S.btnPrimary} onClick={() => setShowPayModal(true)}>💰 Record Payment</button>
              </div>
            </div>

            {/* Summary Cards */}
            {loading && <div style={{ color: "#64748b", padding: 8 }}>Calculating...</div>}
            {summary && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <SummaryCard label="Total Earned"  value={fmt(summary.total_earned)} color="#1e293b" sub={WAGE_LABELS[summary.wage_type]} />
                <SummaryCard label="Total Paid"    value={fmt(summary.total_paid)}   color="#0f766e" />
                <SummaryCard label="Remaining Balance" value={fmt(summary.remaining)} color={summary.remaining > 0 ? "#b45309" : "#166534"} sub={summary.remaining > 0 ? "Amount Owed" : "Settled"} />
              </div>
            )}

            {/* Work Summary */}
            {summary?.work_summary && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>📊 Work Summary</h3>
                <WorkSummaryBox summary={summary.work_summary} wageType={summary.wage_type} />
              </div>
            )}

            {/* Payment History Table */}
            <div style={S.card}>
              <h3 style={S.sectionTitle}>🧾 Payment History
                <span style={{ color: "#64748b", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>({historyTotal} records)</span>
              </h3>

              {history.length === 0 ? (
                <div style={{ color: "#64748b", padding: "20px 0", textAlign: "center" }}>No payments recorded yet</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.thead}>
                        <th style={S.th}>#</th>
                        <th style={S.th}>Date</th>
                        <th style={S.th}>Amount</th>
                        <th style={S.th}>Method</th>
                        <th style={S.th}>Reference</th>
                        <th style={S.th}>Paid By</th>
                        <th style={S.th}>Status</th>
                        <th style={S.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((tx, i) => (
                        <tr key={tx.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={S.td}>{tx.id}</td>
                          <td style={S.td}>{fmtDate(tx.payment_date)}</td>
                          <td style={{ ...S.td, fontWeight: 700, color: tx.status === "reversed" ? "#94a3b8" : "#0f766e", textDecoration: tx.status === "reversed" ? "line-through" : "none" }}>
                            {fmt(tx.amount)}
                          </td>
                          <td style={S.td}>{METHOD_LABELS[tx.payment_method] || tx.payment_method}</td>
                          <td style={{ ...S.td, color: "#64748b", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{tx.reference_note || "—"}</td>
                          <td style={S.td}>{tx.paid_by_name}</td>
                          <td style={S.td}>
                            <span style={{ background: tx.status === "completed" ? "#dcfce7" : "#fee2e2", color: tx.status === "completed" ? "#166534" : "#991b1b", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                              {tx.status}
                            </span>
                          </td>
                          <td style={S.td}>
                            {tx.status === "completed" && (
                              <button style={S.btnDanger} onClick={() => handleReverse(tx.id)}>↩️ Reverse</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                    {historyPage > 1 && <button style={S.btnSecondary} onClick={() => fetchHistory(selectedEmp, historyPage - 1)}>← Prev</button>}
                    <span style={{ padding: "6px 12px", fontSize: 13, color: "#64748b" }}>Page {historyPage}</span>
                    {history.length === 10 && <button style={S.btnSecondary} onClick={() => fetchHistory(selectedEmp, historyPage + 1)}>Next →</button>}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            OVERVIEW TABLE — all employees
        ════════════════════════════════════════════════════════════════════ */}
        <div style={S.card}>
          <h3 style={S.sectionTitle}>👥 All Employees — Balance Overview</h3>
          {overview.length === 0 ? (
            <div style={{ color: "#64748b", padding: "16px 0", textAlign: "center" }}>No data yet</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    <th style={S.th}>Employee</th>
                    <th style={S.th}>Wage Type</th>
                    <th style={S.th}>Total Earned</th>
                    <th style={S.th}>Total Paid</th>
                    <th style={S.th}>Remaining</th>
                    <th style={S.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map((row, i) => (
                    <tr key={row.employee_id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{row.employee_name}</td>
                      <td style={S.td}>{WAGE_LABELS[row.wage_type] || "—"}</td>
                      <td style={S.td}>{fmt(row.total_earned)}</td>
                      <td style={{ ...S.td, color: "#0f766e" }}>{fmt(row.total_paid)}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: row.remaining > 0 ? "#b45309" : "#166534" }}>
                        {fmt(row.remaining)}
                      </td>
                      <td style={S.td}>
                        <button
                          style={S.btnSecondary}
                          onClick={() => handleEmpSelect(String(row.employee_id))}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════════ */}

      {/* Record Payment Modal */}
      {showPayModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <h3 style={{ margin: "0 0 16px", fontSize: 17 }}>💰 Record Payment</h3>
            <label style={S.label}>Amount (₹)</label>
            <input style={S.input} type="number" min="1" placeholder="5000" value={payForm.amount}
              onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />

            <label style={S.label}>Payment Date</label>
            <input style={S.input} type="date" value={payForm.payment_date}
              onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />

            <label style={S.label}>Payment Method</label>
            <select style={S.select} value={payForm.payment_method}
              onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}>
              <option value="cash">💵 Cash</option>
              <option value="bank">🏦 Bank Transfer</option>
              <option value="upi">📱 UPI</option>
            </select>

            <label style={S.label}>Reference / Note (optional)</label>
            <input style={S.input} type="text" placeholder="e.g. March salary advance"
              value={payForm.reference_note}
              onChange={e => setPayForm(f => ({ ...f, reference_note: e.target.value }))} />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={S.btnPrimary} onClick={handleRecordPayment} disabled={loading}>
                {loading ? "Saving..." : "✅ Record Payment"}
              </button>
              <button style={S.btnSecondary} onClick={() => setShowPayModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Wage Config Modal */}
      {showConfigModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <h3 style={{ margin: "0 0 16px", fontSize: 17 }}>⚙️ Set Wage Configuration</h3>

            <label style={S.label}>Wage Type</label>
            <select style={S.select} value={configForm.wage_type}
              onChange={e => setConfigForm(f => ({ ...f, wage_type: e.target.value }))}>
              <option value="monthly_salary">Monthly Salary</option>
              <option value="daily_wage">Daily Wage</option>
              <option value="per_task">Per Task</option>
            </select>

            <label style={S.label}>
              {configForm.wage_type === "monthly_salary" ? "Monthly Amount (₹)" :
               configForm.wage_type === "daily_wage"     ? "Per Day Rate (₹)" :
                                                           "Per Task Rate (₹)"}
            </label>
            <input style={S.input} type="number" min="0" step="0.01"
              placeholder="e.g. 15000" value={configForm.wage_amount}
              onChange={e => setConfigForm(f => ({ ...f, wage_amount: e.target.value }))} />

            <label style={S.label}>Effective From</label>
            <input style={S.input} type="date" value={configForm.effective_from}
              onChange={e => setConfigForm(f => ({ ...f, effective_from: e.target.value }))} />

            <label style={S.label}>Notes (optional)</label>
            <input style={S.input} type="text" placeholder="Any notes..."
              value={configForm.notes}
              onChange={e => setConfigForm(f => ({ ...f, notes: e.target.value }))} />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={S.btnPrimary} onClick={handleSaveConfig}>💾 Save Config</button>
              <button style={S.btnSecondary} onClick={() => setShowConfigModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// ─── style constants ──────────────────────────────────────────────────────────

const styles = {
  page:        { display: "flex", flexDirection: "column", gap: 16 },
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center" },
  pageTitle:   { margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" },
  pageSubtitle:{ margin: "4px 0 0", fontSize: 13, color: "#64748b" },
  flash:       { padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 },
  card:        { background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  sectionTitle:{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#1e293b" },
  filterRow:   { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" },
  label:       { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" },
  input:       { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" },
  select:      { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#fff" },
  table:       { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead:       { background: "#f8fafc" },
  th:          { padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" },
  td:          { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#334155" },
  btnPrimary:  { padding: "9px 18px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  btnSecondary:{ padding: "9px 18px", background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  btnDanger:   { padding: "5px 10px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal:       { background: "#fff", borderRadius: 14, padding: "24px 28px", width: 420, maxWidth: "95vw", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
};

export default Payments;
