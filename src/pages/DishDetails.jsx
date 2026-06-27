import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";

export default function DishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setErr("");
    api.get(`/api/dishes/${id}`)
      .then((res) => setDish(res.data))
      .catch((e) => setErr(e?.response?.data?.message || "Dish not found."))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAdd() {
    if (!dish) return;
    addToCart({
      id: dish.id,
      name: dish.name,
      price: Number(dish.price),
      quantity: qty,
      description: dish.description,
    });
    navigate("/cart");
  }

  if (loading) {
    return (
      <section className="page">
        <div className="container">
          <p className="menu-state">Loading…</p>
        </div>
      </section>
    );
  }

  if (err || !dish) {
    return (
      <section className="page">
        <div className="container">
          <h2>Dish not found.</h2>
          <Link to="/menu" className="btn-primary" style={{ marginTop: 12 }}>
            Back to Menu
          </Link>
        </div>
      </section>
    );
  }

  const tags = [];
  if (dish.is_vegan) tags.push("Vegan");
  else if (dish.is_vegetarian) tags.push("Vegetarian");
  if (dish.is_gluten_free) tags.push("Gluten-free");
  if (Number(dish.spice_level) > 0) tags.push(`Spice ${dish.spice_level}/5`);

  return (
    <section className="page">
      <div className="container">
        <div className="menu-hero">
          <div>
            <h1>{dish.name}</h1>
            <p className="menu-hero-sub">{dish.category}</p>
          </div>
          <div className="menu-hero-actions">
            <Link to="/menu" className="btn-outline">← Back to Menu</Link>
          </div>
        </div>

        <div className="cart-layout" style={{ marginTop: 16 }}>
          <div className="cart-items">
            <div className="cart-item-card">
              <div className="cart-item-main">
                <div>
                  <div className="cart-item-name">{dish.name}</div>
                  {dish.description && (
                    <p className="cart-item-desc" style={{ marginTop: 8 }}>{dish.description}</p>
                  )}
                  {tags.length > 0 && (
                    <div className="tag-row" style={{ marginTop: 12 }}>
                      {tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="cart-item-bottom">
                <div className="cart-price">
                  <div className="cart-price-line"><span>Price</span><strong>${Number(dish.price).toFixed(2)}</strong></div>
                  <div className="cart-price-line"><span>Calories</span><strong>{dish.calories} kcal</strong></div>
                </div>
              </div>
            </div>
          </div>

          <aside className="cart-summary-card">
            <h2 className="cart-section-title">Order this dish</h2>
            <div className="summary-row"><span>Price</span><strong>${Number(dish.price).toFixed(2)}</strong></div>

            <div className="qty-control" style={{ marginTop: 12 }}>
              <button type="button" className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <input className="qty-input" type="number" min="1" value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
              <button type="button" className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
            </div>

            <div className="summary-row" style={{ marginTop: 12 }}>
              <span>Subtotal</span>
              <strong>${(Number(dish.price) * qty).toFixed(2)}</strong>
            </div>

            <div className="summary-actions">
              <button className="btn-primary" onClick={handleAdd}>Add to Cart</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}