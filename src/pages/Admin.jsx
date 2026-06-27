import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

function Admin() {
  const [stats, setStats] = useState({ orders: 0, pending: 0, dishes: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [orders, dishes] = await Promise.all([
          api.get("/api/admin/orders"),
          api.get("/api/dishes"),
        ]);
        const pending = orders.data.filter(
          (o) => !["delivered", "cancelled"].includes(o.status)
        ).length;
        setStats({
          orders: orders.data.length,
          pending,
          dishes: dishes.data.length,
        });
      } catch {/* ignore */}
    })();
  }, []);

  return (
    <section className="page">
      <div className="container">
        <div className="menu-hero">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="menu-hero-sub">Manage your restaurant</p>
          </div>
        </div>

        <div className="cart-layout" style={{ marginTop: 20 }}>
          <Link to="/admin/orders" className="cart-summary-card" style={{ textDecoration: "none" }}>
            <h2 className="cart-section-title">Orders</h2>
            <div className="summary-row"><span>Total</span><strong>{stats.orders}</strong></div>
            <div className="summary-row"><span>Active</span><strong>{stats.pending}</strong></div>
            <div className="summary-note" style={{ marginTop: 8 }}>
              View and update order status
            </div>
          </Link>

          <Link to="/admin/dishes" className="cart-summary-card" style={{ textDecoration: "none" }}>
            <h2 className="cart-section-title">Dishes</h2>
            <div className="summary-row"><span>Total</span><strong>{stats.dishes}</strong></div>
            <div className="summary-note" style={{ marginTop: 8 }}>
              Add, edit, and remove menu items
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Admin;