
import { useState } from "react";
import { useCart } from "../context/CartContext";
import OrderTimeline from "../components/OrderTimeline";

function Cart() {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [stage, setStage] = useState(0);

  function nextStage() {
    setStage(prev => (prev < 3 ? prev + 1 : prev));
  }

  return (
    <section className="page">
      <div className="container">
        <h1>Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                      />
                    </td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-summary">
              <p>
                <strong>Total:</strong> ${totalPrice.toFixed(2)}
              </p>
              <button className="btn-outline" onClick={clearCart}>
                Clear Cart
              </button>
              <button className="btn-primary" onClick={nextStage}>
                Simulate Order Progress
              </button>
            </div>

            <OrderTimeline stage={stage} />
          </>
        )}
      </div>
    </section>
  );
}

export default Cart;
