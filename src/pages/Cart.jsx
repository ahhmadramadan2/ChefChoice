import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import OrderTimeline from "../components/OrderTimeline";


const STATUS_LABEL = {
  pending: "Order received",
  confirmed: "Confirmed by restaurant",
  preparing: "Being prepared",
  ready: "Ready",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function Cart() {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeOrder, setActiveOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");

  // Checkout form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [notes, setNotes] = useState("");

  const totalItems = cartItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const hasCartItems = cartItems.length > 0;
  const trackingMode = !hasCartItems && activeOrder;

  // Autofill from user profile
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    api.get("/api/auth/profile").then((res) => {
      if (res.data.phone) setPhone(res.data.phone);
      if (res.data.address) setAddress(res.data.address);
    }).catch(() => {});
  }, [user]);

  // Poll for status updates every 5s while tracking
  useEffect(() => {
    if (!activeOrder?.id) return;
    const tick = async () => {
      try {
        const res = await api.get(`/api/orders/${activeOrder.id}`);
        setActiveOrder((prev) => prev ? { ...prev, status: res.data.status } : prev);
      } catch { /* ignore */ }
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => clearInterval(t);
  }, [activeOrder?.id]);

  function resetOrder() {
    setActiveOrder(null);
    setOrderMessage("");
    setOrderError("");
  }

  async function handleCheckout(e) {
    e?.preventDefault?.();
    if (!user) return navigate("/login");
    if (!cartItems.length || placingOrder) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setOrderError("Please fill in name, phone, and address.");
      return;
    }

    setPlacingOrder(true);
    setOrderMessage("");
    setOrderError("");

    try {
      const itemsCopy = cartItems.map((it) => ({
        id: it.id, name: it.name,
        price: Number(it.price),
        quantity: Number(it.quantity || 1),
        isCombo: !!it.isCombo,
        items: it.items || [],
        description: it.description || "",
      }));

      const payload = {
        items: itemsCopy.map((item) => ({
          id: item.isCombo ? null : item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: Number(totalPrice),
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        notes: notes.trim() || null,
        saveAddress,
      };

      const res = await api.post("/api/orders", payload);
      const orderId = res.data?.orderId ?? null;

      setActiveOrder({
        id: orderId,
        items: itemsCopy,
        total: Number(totalPrice),
        createdAt: new Date().toISOString(),
        status: "pending",
        customerName: name.trim(),
        customerAddress: address.trim(),
      });

      setOrderMessage(res.data?.message || "Order received. The restaurant will confirm shortly.");
      clearCart();
    } catch (err) {
      console.error("Error placing order:", err?.response?.data || err);
      setOrderError(err?.response?.data?.message || "Could not place the order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  
  const statusLabel = activeOrder ? STATUS_LABEL[activeOrder.status] : "";

  return (
    <section className="page cart-page">
      <div className="container">
        <div className="cart-hero">
          <div className="cart-hero-text">
            {trackingMode ? (
              <>
                <h1>Order in Progress</h1>
                <p className="cart-hero-sub">
                  Your order has been received. Status updates automatically.
                </p>
              </>
            ) : (
              <>
                <h1>Your Cart</h1>
                <p className="cart-hero-sub">
                  Review your items, adjust quantities, and place your order.
                </p>
              </>
            )}
          </div>

          {hasCartItems && (
            <div className="cart-hero-actions">
              <button className="btn-outline" onClick={clearCart}>Clear cart</button>
              <Link to="/menu" className="btn-primary">Add more</Link>
            </div>
          )}
        </div>

        {!hasCartItems && !trackingMode && (
          <div className="cart-empty-card">
            <div>
              <h2>Cart is empty</h2>
              <p className="section-subtitle">Pick something from the menu and it will appear here.</p>
              <Link to="/menu" className="btn-primary">Browse Menu</Link>
            </div>
          </div>
        )}

        {(hasCartItems || trackingMode) && (
          <div className="cart-layout">
            <div className="cart-items">
              {trackingMode ? (
                <>
                  <h2 className="cart-section-title">
                    Current order {activeOrder?.id ? `#${activeOrder.id}` : ""}
                  </h2>

                  <div className="cart-items-list">
                    {activeOrder.items.map((item) => (
                      <div key={item.id} className="cart-item-card">
                        <div className="cart-item-main">
                          <div>
                            <div className="cart-item-name">{item.name}</div>
                            {item.description && (
                              <div className="cart-item-desc">{item.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="cart-price">
                            <div className="cart-price-line"><span>Qty</span><strong>{item.quantity}</strong></div>
                            <div className="cart-price-line">
                              <span>Subtotal</span>
                              <strong>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-timeline-card">
                    <OrderTimeline status={activeOrder?.status || "pending"} />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="cart-section-title">Items ({totalItems})</h2>
                  <div className="cart-items-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="cart-item-card">
                        <div className="cart-item-main">
                          <div>
                            <div className="cart-item-name">{item.name}</div>
                            {item.description && (<div className="cart-item-desc">{item.description}</div>)}
                          </div>
                          <button
                            className="cart-remove"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                          >✕</button>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="qty-control">
                            <button type="button" className="qty-btn"
                              onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}>−</button>
                            <input className="qty-input" type="number" min="1" value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value) || 1)} />
                            <button type="button" className="qty-btn"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                          </div>
                          <div className="cart-price">
                            <div className="cart-price-line">
                              <span>Price</span>
                              <strong>${Number(item.price).toFixed(2)}</strong>
                            </div>
                            <div className="cart-price-line">
                              <span>Subtotal</span>
                              <strong>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <aside className="cart-summary-card">
              <h2 className="cart-section-title">
                {trackingMode ? "Order status" : "Checkout"}
              </h2>

              {trackingMode ? (
                <>
                  <div className="summary-row"><span>Status</span><strong>{statusLabel}</strong></div>
                  <div className="summary-row"><span>Total</span><strong>${activeOrder.total.toFixed(2)}</strong></div>
                  <div className="summary-row"><span>Delivering to</span><strong>{activeOrder.customerName}</strong></div>
                  <div className="summary-note" style={{ marginTop: 8 }}>{activeOrder.customerAddress}</div>
                  <div className="summary-note" style={{ marginTop: 8 }}>
                    Status updates automatically every few seconds.
                  </div>
                  <div className="summary-actions">
                    <button className="btn-outline" type="button" onClick={resetOrder}>
                      Start new order
                    </button>
                  </div>
                  {orderMessage && (<div className="summary-note" style={{ marginTop: 12 }}>{orderMessage}</div>)}
                </>
              ) : (
                <>
                  <div className="summary-row"><span>Items</span><strong>{totalItems}</strong></div>
                  <div className="summary-row">
                    <span>Estimated total</span>
                    <strong>${Number(totalPrice).toFixed(2)}</strong>
                  </div>

                  {!user ? (
                    <>
                      <div className="summary-note">You must be logged in to place an order.</div>
                      <div className="summary-actions">
                        <Link to="/login" className="btn-primary">Login to checkout</Link>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleCheckout} className="auth-form" style={{ marginTop: 12 }}>
                      <div className="field">
                        <label htmlFor="cname">Name</label>
                        <input id="cname" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="field">
                        <label htmlFor="cphone">Phone</label>
                        <input id="cphone" value={phone} onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 03 123 456" required />
                      </div>
                      <div className="field">
                        <label htmlFor="caddr">Delivery address</label>
                        <input id="caddr" value={address} onChange={(e) => setAddress(e.target.value)}
                          placeholder="Street, building, city" required />
                      </div>
                      <div className="field">
  <label htmlFor="cnotes">Special requests (optional)</label>
  <textarea
    id="cnotes"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="e.g. no onions, extra spicy, leave at door"
    rows={3}
    style={{ width: "100%", resize: "vertical", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontFamily: "inherit" }}
  />
</div>
                      <label className="tag-chip" style={{ display: "inline-flex", gap: 8 }}>
                        <input type="checkbox" checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)} />
                        Save phone and address to my profile
                      </label>

                      <div className="summary-actions" style={{ marginTop: 12 }}>
                        <button className="btn-primary" type="submit"
                          disabled={!hasCartItems || placingOrder}>
                          {placingOrder ? "Placing order..." : "Place Order"}
                        </button>
                      </div>

                      {orderError && (<div className="auth-alert" style={{ marginTop: 12 }}>{orderError}</div>)}
                    </form>
                  )}
                </>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;