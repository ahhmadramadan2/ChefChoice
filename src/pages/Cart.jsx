import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import OrderTimeline from "../components/OrderTimeline";

const API = import.meta.env.VITE_API_URL;

function Cart() {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  // 0 = not started, 1 = order received, 2 = preparing, 3 = ready for pickup/delivery
  const [stage, setStage] = useState(0);

  // store the last placed order, even after cart is cleared
  const [activeOrder, setActiveOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");

  const totalItems = cartItems.reduce((sum, it) => sum + (it.quantity || 0), 0);

  function advanceStage() {
    setStage((prev) => (prev < 3 ? prev + 1 : prev));
  }

  function resetOrder() {
    setActiveOrder(null);
    setStage(0);
    setOrderMessage("");
    setOrderError("");
  }

  async function handleCheckout() {
    if (!cartItems.length || placingOrder) return;

    setPlacingOrder(true);
    setOrderMessage("");
    setOrderError("");

    try {
      const payload = {
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          isCombo: !!item.isCombo,
          comboItems: item.items || [],
        })),
      total: totalPrice,
      };

      const res = await axios.post(`${API}/api/orders`, payload, {
        withCredentials: true,
      });

      const orderId = res.data?.orderId || res.data?.id || null;

      // Save this order as the "current active order" for tracking
      setActiveOrder({
        id: orderId,
        items: cartItems,
        total: totalPrice,
        createdAt: new Date().toISOString(),
      });

      setOrderMessage(
        res.data?.message ||
          "✅ Order received. We’re now preparing your meal."
      );

      // move timeline to "Order received / preparing"
      setStage(1);

      // Now it's OK to clear the cart, because we kept a copy in activeOrder
      clearCart();
    } catch (err) {
      console.error("Error placing order:", err);
      setOrderError("⚠️ Could not place the order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  const hasCartItems = cartItems.length > 0;
  const trackingMode = !hasCartItems && activeOrder; // cart empty but order in progress

  return (
    <section className="page cart-page">
      <div className="container">
        {/* Header / Hero */}
        <div className="cart-hero">
          <div className="cart-hero-text">
            {trackingMode ? (
              <>
                <h1>Order in Progress</h1>
                <p className="cart-hero-sub">
                  Your order has been received and is being prepared. You can track its status below.
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
              <button className="btn-outline" onClick={clearCart}>
                Clear cart
              </button>
              <Link to="/menu" className="btn-primary">
                Add more
              </Link>
            </div>
          )}
        </div>

        {/* If no items & no active order → true empty state */}
        {!hasCartItems && !trackingMode && (
          <div className="cart-empty-card">
            <div>
              <h2>Cart is empty</h2>
              <p className="section-subtitle">
                Pick something from the menu and it will appear here.
              </p>
              <Link to="/menu" className="btn-primary">
                Browse Menu
              </Link>
            </div>

            <div className="cart-empty-emoji" aria-hidden="true">
              🛒
            </div>
          </div>
        )}

        {/* Cart with items OR tracking view */}
        {(hasCartItems || trackingMode) && (
          <div className="cart-layout">
            {/* Left column */}
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
                              <div className="cart-item-desc">
                                {item.description}
                              </div>
                            )}
                            {item.isCombo && item.items?.length ? (
                              <div className="cart-item-chip">
                                {item.items.map((x) => x.name).join(" • ")}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="cart-item-bottom">
                          <div>
                            <div className="cart-price">
                              <div className="cart-price-line">
                                <span>Qty</span>
                                <strong>{item.quantity}</strong>
                              </div>
                              <div className="cart-price-line">
                                <span>Subtotal</span>
                                <strong>
                                  {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-timeline-card">
                    <OrderTimeline stage={stage} />
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
                            {item.description && (
                              <div className="cart-item-desc">{item.description}</div>
                            )}
                            {item.isCombo && item.items?.length ? (
                              <div className="cart-item-chip">
                                {item.items.map((x) => x.name).join(" • ")}
                              </div>
                            ) : null}
                          </div>

                          <button
                            className="cart-remove"
                            onClick={() => removeFromCart(item.id)}
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          <div className="qty-control">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() =>
                                updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <input
                              className="qty-input"
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, Number(e.target.value) || 1)
                              }
                            />

                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() =>
                                updateQuantity(item.id, (item.quantity || 1) + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-price">
                            <div className="cart-price-line">
                              <span>Price</span>
                              <strong>${Number(item.price).toFixed(2)}</strong>
                            </div>
                            <div className="cart-price-line">
                              <span>Subtotal</span>
                              <strong>
                                {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-timeline-card">
                    <OrderTimeline stage={stage} />
                  </div>
                </>
              )}
            </div>

            {/* Right column: summary / tracking */}
            <aside className="cart-summary-card">
              <h2 className="cart-section-title">
                {trackingMode ? "Order status" : "Order Summary"}
              </h2>

              {trackingMode ? (
                <>
                  <div className="summary-row">
                    <span>Current stage</span>
                    <strong>
                      {stage === 1 && "Order received"}
                      {stage === 2 && "Preparing"}
                      {stage === 3 && "Ready"}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>Total</span>
                    <strong>${activeOrder.total.toFixed(2)}</strong>
                  </div>

                  <div className="summary-note">
                    Your order has been received and is moving through the kitchen.
                    Use the button below to simulate status updates for this project.
                  </div>

                  <div className="summary-actions">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={advanceStage}
                      disabled={stage >= 3}
                    >
                      Advance status
                    </button>
                    <button
                      className="btn-outline"
                      type="button"
                      onClick={resetOrder}
                    >
                      Start new order
                    </button>
                  </div>

                  {orderMessage && (
                    <div
                      className="summary-note"
                      style={{ marginTop: "0.8rem" }}
                    >
                      {orderMessage}
                    </div>
                  )}
                  {orderError && (
                    <div
                      className="auth-alert"
                      style={{ marginTop: "0.8rem" }}
                    >
                      {orderError}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="summary-row">
                    <span>Items</span>
                    <strong>{totalItems}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Estimated total</span>
                    <strong>${Number(totalPrice).toFixed(2)}</strong>
                  </div>

                  <div className="summary-note">
                    This project simulates a real restaurant checkout and order tracking
                    flow. No payment is processed.
                  </div>

                  <div className="summary-actions">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={advanceStage}
                    >
                      Simulate progress
                    </button>

                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleCheckout}
                      disabled={!hasCartItems || placingOrder}
                    >
                      {placingOrder ? "Placing order..." : "Checkout"}
                    </button>
                  </div>

                  {orderMessage && (
                    <div
                      className="summary-note"
                      style={{ marginTop: "0.8rem" }}
                    >
                      {orderMessage}
                    </div>
                  )}
                  {orderError && (
                    <div
                      className="auth-alert"
                      style={{ marginTop: "0.8rem" }}
                    >
                      {orderError}
                    </div>
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

