import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const STATUS_OPTIONS = [
  "pending","confirmed","preparing","ready","on_the_way","delivered","cancelled"
];
const STATUS_LABEL = {
  pending: "Pending", confirmed: "Confirmed", preparing: "Preparing",
  ready: "Ready", on_the_way: "On the way", delivered: "Delivered", cancelled: "Cancelled",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("active");
  const [expandedId, setExpandedId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({}); // { [id]: { items, notes } }
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(orderId) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!detailsCache[orderId]) {
      setDetailsLoading(true);
      try {
        const res = await api.get(`/api/admin/orders/${orderId}`);
        setDetailsCache((prev) => ({
          ...prev,
          [orderId]: { items: res.data.items || [], notes: res.data.notes || "" },
        }));
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load order details.");
      } finally {
        setDetailsLoading(false);
      }
    }
  }

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active") return !["delivered", "cancelled"].includes(o.status);
    if (filter === "done") return ["delivered", "cancelled"].includes(o.status);
    return true;
  });

  return (
    <section className="page">
      <div className="container">
        <div className="menu-hero">
          <div>
            <h1>Manage Orders</h1>
            <p className="menu-hero-sub">Click an order to see details. Use the refresh button to check for new orders.</p>
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
            {[["active", "Active"], ["all", "All"], ["done", "Completed"]].map(([val, label]) => (
              <button key={val}
                className={`tag-chip ${filter === val ? "active" : ""}`}
                onClick={() => setFilter(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {err && <div className="auth-alert">{err}</div>}
        {loading && orders.length === 0 && <div className="menu-state">Loading orders...</div>}
        {!loading && filtered.length === 0 && (
          <div className="menu-state">No orders in this view.</div>
        )}

        <div className="cart-items-list">
          {filtered.map((o) => {
            const isExpanded = expandedId === o.id;
            const details = detailsCache[o.id];

            return (
              <div key={o.id} className="cart-item-card">
                <div
                  className="cart-item-main"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleExpand(o.id)}
                >
                  <div>
                    <div className="cart-item-name">
                      {isExpanded ? "▼ " : "▶ "}
                      Order #{o.id} <span style={{ opacity: 0.6 }}>• {o.item_count} items</span>
                    </div>
                    <div className="cart-item-desc">
                      {o.customer_name} • {o.customer_phone}
                    </div>
                    <div className="cart-item-desc">{o.customer_address}</div>
                    <div className="cart-item-desc" style={{ opacity: 0.6 }}>
                      {new Date(o.created_at).toLocaleString()} • {o.user_email}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <strong>${Number(o.total_price).toFixed(2)}</strong>
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isExpanded && (
                  <div className="cart-item-bottom" style={{ flexDirection: "column", alignItems: "stretch", gap: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                    {detailsLoading && !details ? (
                      <div className="menu-state">Loading details...</div>
                    ) : (
                      <>
                        {details?.notes && (
                          <div className="summary-note" style={{ background: "#fff7ed", borderLeft: "3px solid #f97316", padding: 10 }}>
                            <strong>Customer note:</strong> {details.notes}
                          </div>
                        )}

                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>Items:</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {details?.items?.map((it) => (
                              <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f9fafb", borderRadius: 6 }}>
                                <span>
                                  <strong>{it.quantity}×</strong> {it.dish_name}
                                </span>
                                <span>${Number(it.line_total).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
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