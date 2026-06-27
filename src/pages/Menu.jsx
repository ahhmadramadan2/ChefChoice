import { useEffect, useMemo, useRef, useState } from "react";

import DishCard from "../components/DishCard";
import { Link } from "react-router-dom";

import api from "../api/client";
const ALL = "All";

function Menu() {
  const catRef = useRef(null);

  function scrollCats(dir) {
    if (!catRef.current) return;
    const amount = 260;
    catRef.current.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [category, setCategory] = useState(ALL);
  const [maxPrice, setMaxPrice] = useState(30);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    async function loadDishes() {
      setLoading(true);
      setLoadError("");

      try {
       const res = await api.get("/api/dishes");
        const data = Array.isArray(res.data) ? res.data : [];

        setDishes(data);
      } catch (err) {
        console.error("Failed to load dishes from API:", err);
        setDishes([]);
        setLoadError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dishes from server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDishes();
  }, []);

  const tags = ["Vegan", "Vegetarian", "Gluten-free", "Spicy"];

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setCategory(ALL);
    setMaxPrice(30);
    setSearch("");
    setSelectedTags([]);
  }

  const CATEGORY_ORDER = ["Burgers", "Sandwiches", "Salads", "Sides", "Drinks", "Desserts"];

  const categories = useMemo(() => {
    const present = new Set(dishes.map((d) => d.category).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extras = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return [ALL, ...ordered, ...extras];
  }, [dishes]);

  const filtered = useMemo(() => {
    return dishes.filter((d) => {
      if (category !== ALL && d.category !== category) return false;
      if (Number(d.price) > Number(maxPrice)) return false;

      if (search && !String(d.name || "").toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      if (selectedTags.length > 0) {
        if (selectedTags.includes("Spicy") && Number(d.spicyLevel || 0) === 0) return false;

        const nonSpicyTags = selectedTags.filter((t) => t !== "Spicy");
        if (nonSpicyTags.length > 0) {
          const dishTags = Array.isArray(d.tags) ? d.tags : [];
          if (!nonSpicyTags.every((t) => dishTags.includes(t))) return false;
        }
      }

      return true;
    });
  }, [dishes, category, maxPrice, search, selectedTags]);

  const hasActiveFilters =
    category !== ALL || maxPrice !== 30 || search.trim() !== "" || selectedTags.length > 0;

  return (
    <section className="page menu-page">
      <div className="container">
        {/* Hero */}
        <div className="menu-hero">
          <div>
            <h1>Menu</h1>
            <p className="menu-hero-sub">
              Filter by category, diet and price to find your perfect dish.
            </p>
          </div>

          <div className="menu-hero-actions">
            <Link to="/builder" className="btn-outline">
              Build a Meal
            </Link>
            {hasActiveFilters && (
              <button className="btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Show API error (instead of silently using mock) */}
        {!loading && loadError && (
          <div className="auth-alert" style={{ marginBottom: "1rem" }}>
            {loadError}
          </div>
        )}

        {/* Filters card */}
        <div className="menu-filters-card">
          <div className="filters">
            <div className="filter-group">
              <label>Category</label>

              <div className="pillbar">
                <button
                  type="button"
                  className="pillbar-btn"
                  onClick={() => scrollCats(-1)}
                  aria-label="Scroll left"
                >
                  ‹
                </button>

                <div className="pillbar-track" ref={catRef}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`tag-chip cat-chip ${category === cat ? "active" : ""}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pillbar-btn"
                  onClick={() => scrollCats(1)}
                  aria-label="Scroll right"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Max Price: ${maxPrice}</label>
              <input
                type="range"
                min="5"
                max="30"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Find a dish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Diet & Spice</label>
              <div className="tag-row">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={selectedTags.includes(tag) ? "tag-chip active" : "tag-chip"}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="menu-results-head">
          <div>
            <h2 className="menu-results-title">Results</h2>
            <p className="menu-results-sub">
              {loading ? "Loading dishes…" : `${filtered.length} dish(es) found`}
            </p>
          </div>

          {hasActiveFilters && (
            <button className="btn-outline" onClick={clearFilters}>
              Reset
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid">
          {loading && <div className="menu-state">Loading dishes…</div>}

          {!loading && filtered.length === 0 && (
            <div className="menu-state">
              <h3>No dishes match your filters</h3>
              <p className="section-subtitle">Try changing category, tags or price.</p>
              <button className="btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          {!loading && filtered.map((dish) => <DishCard key={dish.id} dish={dish} />)}
        </div>
      </div>
    </section>
  );
}

export default Menu;
