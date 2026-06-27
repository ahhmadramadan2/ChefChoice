import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const CATEGORIES = [
  "Breakfast","Burgers","Sandwiches","Chicken","Beef & Meat",
  "Seafood","Pasta","Vegan","Sides","Salads","Drinks","Desserts",
];

const EMPTY = {
  name: "", description: "", category: "Burgers", price: "", calories: "",
  spice_level: 0, is_vegan: false, is_vegetarian: false, is_gluten_free: false,
};

export default function AdminDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(
    () => form.name.trim().length >= 2 && form.category && String(form.price).trim() !== "",
    [form]
  );

  async function loadDishes() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/dishes");
      setDishes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dishes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDishes(); }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function startEdit(d) {
    setEditingId(d.id);
    setForm({
      name: d.name || "",
      description: d.description || "",
      category: d.category || "Burgers",
      price: d.price,
      calories: d.calories || "",
      spice_level: d.spice_level || 0,
      is_vegan: !!d.is_vegan,
      is_vegetarian: !!d.is_vegetarian,
      is_gluten_free: !!d.is_gluten_free,
    });
    setMsg("");
    setErr("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr(""); setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        calories: form.calories === "" ? 0 : Number(form.calories),
        spice_level: Number(form.spice_level || 0),
      };
      if (editingId) {
        await api.put(`/api/dishes/${editingId}`, payload);
        setMsg(`Updated "${payload.name}".`);
      } else {
        await api.post("/api/dishes", payload);
        setMsg(`Added "${payload.name}".`);
      }
      setForm(EMPTY);
      setEditingId(null);
      await loadDishes();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to save dish.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove "${name}" from the menu?`)) return;
    setMsg(""); setErr("");
    try {
      await api.delete(`/api/dishes/${id}`);
      setMsg(`Removed "${name}".`);
      await loadDishes();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to remove dish.");
    }
  }

  return (
    <section className="page">
      <div className="container">
        <div className="menu-hero">
          <div>
            <h1>Manage Dishes</h1>
            <p className="menu-hero-sub">
              {editingId ? "Editing dish" : "Add or edit menu items"}
            </p>
          </div>
          <div className="menu-hero-actions">
            <Link to="/admin" className="btn-outline">← Dashboard</Link>
          </div>
        </div>

        {err && <div className="auth-alert" style={{ marginBottom: 12 }}>{err}</div>}
        {msg && <div className="summary-note" style={{ marginBottom: 12 }}>{msg}</div>}

        <div className="menu-filters-card" style={{ marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? `Edit dish #${editingId}` : "Add new dish"}</h2>
          <form onSubmit={handleSubmit} className="filters">
            <div className="filter-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Price ($)</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
            </div>
            <div className="filter-group">
              <label>Calories</label>
              <input name="calories" type="number" value={form.calories} onChange={handleChange} />
            </div>
            <div className="filter-group">
              <label>Spice level (0-5)</label>
              <input name="spice_level" type="number" min="0" max="5"
                value={form.spice_level} onChange={handleChange} />
            </div>
            <div className="filter-group" style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="filter-group" style={{ gridColumn: "1 / -1" }}>
              <label>Flags</label>
              <div className="tag-row">
                <label className="tag-chip">
                  <input type="checkbox" name="is_vegan" checked={form.is_vegan} onChange={handleChange} /> Vegan
                </label>
                <label className="tag-chip">
                  <input type="checkbox" name="is_vegetarian" checked={form.is_vegetarian} onChange={handleChange} /> Vegetarian
                </label>
                <label className="tag-chip">
                  <input type="checkbox" name="is_gluten_free" checked={form.is_gluten_free} onChange={handleChange} /> Gluten-free
                </label>
              </div>
            </div>
            <div className="filter-group" style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button className="btn-primary" type="submit" disabled={!canSubmit || saving}>
                {saving ? "Saving..." : editingId ? "Update dish" : "Add dish"}
              </button>
              {editingId && (
                <button className="btn-outline" type="button" onClick={cancelEdit}>Cancel edit</button>
              )}
            </div>
          </form>
        </div>

        <h2>Current dishes ({dishes.length})</h2>
        {loading ? (
          <div className="menu-state">Loading...</div>
        ) : (
          <div className="cart-items-list">
            {dishes.map((d) => (
              <div key={d.id} className="cart-item-card">
                <div className="cart-item-main">
                  <div>
                    <div className="cart-item-name">
                      {d.name} <span style={{ opacity: 0.7 }}>({d.category})</span>
                    </div>
                    {d.description && <div className="cart-item-desc">{d.description}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-outline" onClick={() => startEdit(d)}>Edit</button>
                    <button className="cart-remove" onClick={() => handleDelete(d.id, d.name)}>✕</button>
                  </div>
                </div>
                <div className="cart-item-bottom">
                  <div className="cart-price">
                    <div className="cart-price-line"><span>Price</span><strong>${Number(d.price).toFixed(2)}</strong></div>
                    <div className="cart-price-line"><span>Calories</span><strong>{Number(d.calories || 0)} kcal</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}