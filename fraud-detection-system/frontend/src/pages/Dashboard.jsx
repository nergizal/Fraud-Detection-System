import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from "recharts";

const API_URL = "http://localhost:8000";

const getRiskScore = (t) => {
  if (t.risk_score != null) return t.risk_score;
  if (t.status === "FRAUD") return Math.floor(Math.random() * 20 + 80);
  return Math.floor(Math.random() * 40);
};

const getRiskLabel = (score) => {
  if (score >= 75) return { label: "High", color: "#E24B4A", bg: "rgba(226,75,74,0.12)", border: "rgba(226,75,74,0.25)" };
  if (score >= 40) return { label: "Medium", color: "#EF9F27", bg: "rgba(239,159,39,0.12)", border: "rgba(239,159,39,0.25)" };
  return { label: "Low", color: "#639922", bg: "rgba(99,153,34,0.12)", border: "rgba(99,153,34,0.25)" };
};

const S = {
  root: {
    minHeight: "100vh",
    background: "#f4f6f9",
    padding: "24px",
    fontFamily: "'IBM Plex Sans', 'SF Pro Display', system-ui, sans-serif",
    color: "#1e293b",
    boxSizing: "border-box",
  },
  inner: { maxWidth: 1280, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid #e2e8f0",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
  },
  h1: { fontSize: 16, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" },
  subtext: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  liveBadge: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 500, color: "#16a34a",
    background: "#f0fdf4",
    padding: "5px 12px", borderRadius: 20,
    border: "0.5px solid #bbf7d0",
  },
  liveDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#22c55e", flexShrink: 0,
  },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  clockText: {
    fontSize: 11, color: "#64748b",
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "4px 10px",
    background: "#fff",
    borderRadius: 6, border: "1px solid #e2e8f0",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 10, marginBottom: 14,
  },
  kpiCard: {
    background: "#ffffff",
    borderRadius: 10,
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
  },
  kpiLabel: {
    fontSize: 10, fontWeight: 600, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  },
  kpiValue: { fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 },
  kpiTrend: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 10, marginTop: 5, padding: "2px 7px", borderRadius: 4,
  },
  mainGrid: {
    display: "grid", gridTemplateColumns: "1fr 256px",
    gap: 10, marginBottom: 10,
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 16,
  },
  panelTitle: {
    fontSize: 10, fontWeight: 600, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 14, display: "flex", alignItems: "center",
    justifyContent: "space-between",
  },
  autoTag: {
    fontSize: 10, fontWeight: 400, color: "#94a3b8",
    background: "#f8fafc",
    padding: "2px 8px", borderRadius: 4,
    border: "1px solid #e2e8f0",
  },
  chartLegend: { display: "flex", gap: 16, marginBottom: 10 },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  donutLegend: { display: "flex", gap: 14, justifyContent: "center", marginTop: 8 },
  riskBarWrap: { marginBottom: 9 },
  riskBarHeader: {
    display: "flex", justifyContent: "space-between",
    fontSize: 11, color: "#64748b", marginBottom: 4,
  },
  riskBarTrack: {
    height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden",
  },
  bottomGrid: {
    display: "grid", gridTemplateColumns: "1fr 256px 256px", gap: 10,
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    textAlign: "left", fontSize: 10, fontWeight: 600, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    padding: "7px 12px",
    background: "#f8fafc",
  },
  td: {
    padding: "9px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 12,
  },
  amountCell: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600, color: "#0f172a",
  },
  userLink: {
    color: "#3b82f6", cursor: "pointer", fontWeight: 500,
    textDecoration: "none",
  },
  userLinkHover: {
    color: "#1d4ed8", cursor: "pointer", fontWeight: 500,
    textDecoration: "underline", textUnderlineOffset: "2px",
  },
  badge: (color, bg, border) => ({
    fontSize: 10, fontWeight: 600, padding: "2px 8px",
    borderRadius: 4, background: bg, color: color, border: `0.5px solid ${border}`,
    display: "inline-block",
  }),
  alertItem: (danger) => ({
    display: "flex", gap: 10, alignItems: "flex-start",
    padding: "10px 12px", borderRadius: 8, marginBottom: 8,
    background: danger ? "#fff5f5" : "#fffbeb",
    border: `1px solid ${danger ? "#fecaca" : "#fde68a"}`,
    borderLeft: `3px solid ${danger ? "#ef4444" : "#f59e0b"}`,
  }),
  alertIcon: (danger) => ({
    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700,
    background: danger ? "#fee2e2" : "#fef3c7",
    color: danger ? "#dc2626" : "#d97706",
  }),
  alertTitle: (danger) => ({
    fontSize: 12, fontWeight: 600,
    color: danger ? "#dc2626" : "#b45309", marginBottom: 2,
  }),
  alertMsg: { fontSize: 11, color: "#64748b", lineHeight: 1.45 },
  userPanelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14, paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  closeBtn: {
    fontSize: 10, color: "#64748b", cursor: "pointer",
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 4, padding: "3px 8px",
  },
  userStatGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 8, marginBottom: 14,
  },
  userStatCard: {
    padding: "10px 12px", borderRadius: 8, textAlign: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  txRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "7px 10px", borderRadius: 6, marginBottom: 5,
    background: "#f8fafc",
    border: "1px solid #f1f5f9",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
  },
  footer: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 14, paddingTop: 10,
    borderTop: "1px solid #f1f5f9",
    fontSize: 10, color: "#cbd5e1",
  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 8, padding: "10px 14px", fontSize: 11,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: "#64748b", marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2, fontWeight: 500 }}>
          {p.name}: {p.name === "Fraud" ? p.value : `₺${p.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleDateString("en-US") + " " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000);

    const eventSource = new EventSource(`${API_URL}/stream-alerts`);
    eventSource.addEventListener("fraud_alert", (event) => {
      try {
        const data = JSON.parse(event.data);
        setAlerts((prev) => [data, ...prev].slice(0, 10));
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const openUser = async (id) => {
    if (!id) return;
    setUserData(null);
    setSelectedUser(id);
    try {
      const response = await fetch(`${API_URL}/user-status/${id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserData({
          total_transactions: data.length,
          fraud_count: data.filter((t) => t.status === "FRAUD").length,
          transactions: data,
        });
      } else {
        setUserData(data);
      }
    } catch (err) {
      console.error("Failed to load user status:", err);
    }
  };

  const chartData = useMemo(() => {
    const defaultData = [
      { label: "Tx #1", amount: 0, fraud: 0 },
      { label: "Tx #2", amount: 0, fraud: 0 },
      { label: "Tx #3", amount: 0, fraud: 0 },
      { label: "Tx #4", amount: 0, fraud: 0 },
      { label: "Tx #5", amount: 0, fraud: 0 },
    ];
    if (!transactions.length) return defaultData;

    return transactions.slice(-12).map((t, idx) => ({
      label: `Tx #${idx + 1}`,
      amount: t.amount || 0,
      fraud: t.status === "FRAUD" ? 1 : 0
    }));
  }, [transactions]);

  const fraudCount = transactions.filter((t) => t.status === "FRAUD").length;
  const totalAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const fraudRatio = transactions.length ? ((fraudCount / transactions.length) * 100).toFixed(2) : "0.00";

  const pieData = [
    { name: "Valid", value: Math.max(0, transactions.length - fraudCount) },
    { name: "Fraud", value: fraudCount },
  ];
  const PIE_COLORS = ["#378ADD", "#E24B4A"];

  return (
    <div style={S.root}>
      <div style={S.inner}>

        <div style={S.header}>
          <div style={S.logoRow}>
            <div style={S.logoMark}>F</div>
            <div>
              <div style={S.h1}>Fraud Analytics Intelligence</div>
              <div style={S.subtext}>Real-time credit card transaction monitoring</div>
            </div>
          </div>
          <div style={S.headerRight}>
            <span style={S.clockText}>{clock}</span>
            <div style={S.liveBadge}>
              <div style={{ ...S.liveDot, animation: "pulse 1.5s ease-in-out infinite" }} />
              Live engine
            </div>
          </div>
        </div>

        <div style={S.kpiGrid}>
          <div style={S.kpiCard}>
            <div style={S.kpiLabel}>Total transactions</div>
            <div style={{ ...S.kpiValue, color: "#0f172a" }}>{transactions.length.toLocaleString()}</div>
            <div style={{ ...S.kpiTrend, background: "#f0fdf4", color: "#16a34a" }}>
              ↑ +12.3% vs yesterday
            </div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiLabel}>Fraudulent</div>
            <div style={{ ...S.kpiValue, color: "#dc2626" }}>{fraudCount}</div>
            <div style={{ ...S.kpiTrend, background: "#fff5f5", color: "#dc2626" }}>
              ↑ +3 this hour
            </div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiLabel}>Total volume</div>
            <div style={{ ...S.kpiValue, color: "#1d4ed8" }}>
              ₺{totalAmount >= 1000000
                ? (totalAmount / 1000000).toFixed(2) + "M"
                : totalAmount.toLocaleString()}
            </div>
            <div style={{ ...S.kpiTrend, background: "#eff6ff", color: "#2563eb" }}>
              Avg ₺{transactions.length ? Math.round(totalAmount / transactions.length).toLocaleString() : 0} / txn
            </div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiLabel}>Fraud ratio</div>
            <div style={{ ...S.kpiValue, color: "#b45309" }}>{fraudRatio}%</div>
            <div style={{
              ...S.kpiTrend,
              background: parseFloat(fraudRatio) < 2 ? "#f0fdf4" : "#fff5f5",
              color: parseFloat(fraudRatio) < 2 ? "#16a34a" : "#dc2626",
            }}>
              {parseFloat(fraudRatio) < 2 ? "✓ Below 2% threshold" : "⚠ Above threshold"}
            </div>
          </div>
        </div>

        <div style={S.mainGrid}>
          <div style={S.panel}>
            <div style={S.panelTitle}>
              Transaction trend - Recent Transactions
              <span style={S.Tag}>Auto-updated</span>
            </div>
            <div style={S.chartLegend}>
              <span style={S.legendItem}>
                <span style={{ ...S.legendDot, background: "#378ADD" }} />
                Amount (₺)
              </span>
              <span style={S.legendItem}>
                <span style={{ ...S.legendDot, background: "#E24B4A" }} />
                Fraud Status (0=Valid, 1=Fraud)
              </span>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 32, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={[0, 1]} ticks={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#378ADD" strokeWidth={2.5} name="Amount" dot={true} />
                  <Line yAxisId="right" type="monotone" dataKey="fraud" stroke="#E24B4A" strokeWidth={1.5} name="Fraud" dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={S.panel}>
            {selectedUser ? (
              userData ? (
                <div>
                  <div style={S.userPanelHeader}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>User #{selectedUser}</span>
                    <button style={S.closeBtn} onClick={() => { setSelectedUser(null); setUserData(null); }}>
                      ✕ Close
                    </button>
                  </div>
                  <div style={S.userStatGrid}>
                    <div style={S.userStatCard}>
                      <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Total txns</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{userData.total_transactions}</div>
                    </div>
                    <div style={S.userStatCard}>
                      <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Fraud count</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: "#dc2626" }}>{userData.fraud_count}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Recent transactions
                  </div>
                  <div style={{ maxHeight: 160, overflowY: "auto" }}>
                    {Array.isArray(userData.transactions) && userData.transactions.length > 0 ? (
                      userData.transactions.slice(-5).map((t, i) => (
                        <div key={i} style={S.txRow}>
                          <span style={{ color: "#475569" }}>
                            {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "—"}
                          </span>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>
                            {t.amount ? t.amount.toFixed(2) : "0.00"}₺
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, padding: "20px 0", fontStyle: "italic" }}>
                        No transaction history
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#2563eb", fontSize: 12 }}>
                  Loading...
                </div>
              )
            ) : (
              <div>
                <div style={S.panelTitle}>Status distribution</div>
                <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={55} paddingAngle={4} dataKey="value">
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11, color: "#0f172a" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={S.donutLegend}>
                  {pieData.map((d, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i], display: "inline-block" }} />
                      {d.name} — {d.value.toLocaleString()}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                  {[
                    { label: "High risk", count: fraudCount, pct: Math.min(100, (fraudCount / (transactions.length || 1)) * 100 * 8), color: "#E24B4A" },
                    { label: "Medium risk", count: Math.round(transactions.length * 0.04), pct: 40, color: "#EF9F27" },
                    { label: "Low risk", count: Math.max(0, transactions.length - fraudCount - Math.round(transactions.length * 0.04)), pct: 94, color: "#639922" },
                  ].map(({ label, count, pct, color }) => (
                    <div key={label} style={S.riskBarWrap}>
                      <div style={S.riskBarHeader}>
                        <span>{label}</span>
                        <span style={{ color, fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={S.riskBarTrack}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={S.bottomGrid} style={{ display: "grid", gridTemplateColumns: "1fr 256px 256px", gap: 10 }}>
          <div style={{ ...S.panel, padding: 0, overflow: "hidden" }}>
            <div style={{
              padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Live transaction feed
              </span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>
                Showing {Math.min(6, transactions.length)} of {transactions.length}
              </span>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["User", "Amount", "Risk score", "Status"].map((h) => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((t, i) => {
                    const score = getRiskScore(t);
                    const risk = getRiskLabel(score);
                    const isEven = i % 2 === 0;
                    return (
                      <tr key={i} style={{ background: isEven ? "#ffffff" : "#fafafa" }}>
                        <td style={S.td}>
                          <span
                            style={S.userLink}
                            onClick={() => openUser(t.user_id || t.id)}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, S.userLinkHover)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, S.userLink)}
                          >
                            User #{t.user_id || t.id}
                          </span>
                        </td>
                        <td style={{ ...S.td, ...S.amountCell }}>
                          ₺{t.amount?.toFixed(2) ?? "0.00"}
                        </td>
                        <td style={S.td}>
                          <span style={{
                            fontSize: 10, fontWeight: 600,
                            color: risk.color, fontFamily: "'IBM Plex Mono', monospace",
                          }}>
                            {score}/100
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={S.badge(
                            t.status === "FRAUD" ? "#fca5a5" : t.status === "REVIEW" ? "#fcd34d" : "#86c14b",
                            t.status === "FRAUD" ? "rgba(226,75,74,0.12)" : t.status === "REVIEW" ? "rgba(239,159,39,0.1)" : "rgba(99,153,34,0.1)",
                            t.status === "FRAUD" ? "rgba(226,75,74,0.25)" : t.status === "REVIEW" ? "rgba(239,159,39,0.2)" : "rgba(99,153,34,0.2)",
                          )}>
                            {t.status || "VALID"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#334155", fontStyle: "italic", padding: "24px" }}>
                        Waiting for transactions...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...S.panel, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ ...S.panelTitle, marginBottom: 12 }}>
                Critical alerts
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                  background: alerts.length > 0 ? "#fff5f5" : "#f8fafc",
                  color: alerts.length > 0 ? "#dc2626" : "#94a3b8",
                  border: `1px solid ${alerts.length > 0 ? "#fecaca" : "#e2e8f0"}`,
                }}>
                  {alerts.length} new
                </span>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {alerts.length > 0 ? (
                  alerts.map((a, i) => {
                    const isDanger = a.severity !== "warning";
                    return (
                      <div key={i} style={S.alertItem(isDanger)}>
                        <div style={S.alertIcon(isDanger)}>{isDanger ? "!" : "~"}</div>
                        <div>
                          <div style={S.alertTitle(isDanger)}>User #{a.user_id || a.id}</div>
                          <div style={S.alertMsg}>{a.message}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#cbd5e1" }}>
                    <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.5 }}>✓</div>
                    <div style={{ fontSize: 11, fontStyle: "italic" }}>No high-risk alerts detected</div>
                  </div>
                )}
              </div>
            </div>
            <div style={S.footer}>
              <span>Fraud Risk Intelligence © 2026</span>
              <span style={{ color: "#1e3a5f", fontSize: 9 }}>v2.0</span>
            </div>
          </div>

          <div style={{ ...S.panel, display: "flex", flexDirection: "column" }}>
            <div style={S.panelTitle}>Transaction breakdown</div>
            <div style={{ position: "relative", height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={44} outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff", border: "1px solid #e2e8f0",
                      borderRadius: 8, fontSize: 11,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                    formatter={(val, name) => [`${val.toLocaleString()} txn`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center", pointerEvents: "none",
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", lineHeight: 1 }}>
                  {transactions.length.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  total
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Valid", value: transactions.length - fraudCount, color: "#3b82f6", pct: (((transactions.length - fraudCount) / (transactions.length || 1)) * 100).toFixed(1) },
                { label: "Fraud", value: fraudCount, color: "#ef4444", pct: ((fraudCount / (transactions.length || 1)) * 100).toFixed(1) },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block", flexShrink: 0 }} />
                      {label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {value.toLocaleString()} <span style={{ fontWeight: 400, color: "#94a3b8" }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}