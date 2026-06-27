import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("unread");
  const [expandedId, setExpandedId] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/admin/messages");
      setMessages(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleRead(m) {
    try {
      const res = await api.patch(`/api/admin/messages/${m.id}/read`, {
        is_read: !m.is_read,
      });
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, is_read: res.data.is_read } : x))
      );
    } catch {
      alert("Failed to update.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      await api.delete(`/api/admin/messages/${id}`);
      setMessages((prev) => prev.filter((x) => x.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  }

  const filtered = messages.filter((m) => {
    if (filter === "all") return true;
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <section className="page">
      <div className="container">
        <div className="menu-hero">
          <div>
            <h1>Messages {unreadCount > 0 && <span style={{ color: "#ef4444" }}>({unreadCount})</span>}</h1>
            <p className="menu-hero-sub">Customer messages from the contact form.</p>
          </div>
          <div className="menu-hero-actions">
            <button className="btn-outline" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
            <Link to="/admin" className="btn-outline">← Dashboard</Link>
          </div>
        </div>

        <div className="menu-filters-card" style={{ marginBottom: 16 }}>
          <div className="tag-row">
            {[["unread", "Unread"], ["all", "All"], ["read", "Read"]].map(([val, label]) => (
              <button key={val}
                className={`tag-chip ${filter === val ? "active" : ""}`}
                onClick={() => setFilter(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {err && <div className="auth-alert">{err}</div>}
        {loading && messages.length === 0 && <div className="menu-state">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="menu-state">No messages in this view.</div>
        )}

        <div className="cart-items-list">
          {filtered.map((m) => {
            const expanded = expandedId === m.id;
            return (
              <div key={m.id} className="cart-item-card"
                style={{ borderLeft: m.is_read ? "3px solid #e5e7eb" : "3px solid #ef4444" }}>
                <div className="cart-item-main"
                  style={{ cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : m.id)}>
                  <div>
                    <div className="cart-item-name">
                      {expanded ? "▼ " : "▶ "}
                      {m.topic}
                      {!m.is_read && <span style={{ color: "#ef4444", marginLeft: 8, fontSize: "0.8em" }}>● NEW</span>}
                    </div>
                    <div className="cart-item-desc">
                      <strong>{m.name}</strong> • {m.email}
                    </div>
                    <div className="cart-item-desc" style={{ opacity: 0.6 }}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="cart-item-bottom"
                    style={{ flexDirection: "column", alignItems: "stretch", gap: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                    <div style={{ background: "#f9fafb", padding: 12, borderRadius: 6, whiteSpace: "pre-wrap" }}>
                      {m.message}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <a className="btn-outline" href={`mailto:${m.email}?subject=Re: ${m.topic}`}>
                        Reply via email
                      </a>
                      <button className="btn-outline" onClick={() => toggleRead(m)}>
                        Mark as {m.is_read ? "unread" : "read"}
                      </button>
                      <button className="cart-remove" onClick={() => remove(m.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}