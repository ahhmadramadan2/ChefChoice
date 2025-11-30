
import { useState } from "react";
import { dishes } from "../data/dishes";
import DishCard from "../components/DishCard";

const ALL = "All";

function Menu() {
  const [category, setCategory] = useState(ALL);
  const [maxPrice, setMaxPrice] = useState(30);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const categories = [ALL, ...new Set(dishes.map(d => d.category))];
  const tags = ["Vegan", "Vegetarian", "Gluten-free", "Spicy"];

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  const filtered = dishes.filter(d => {
    if (category !== ALL && d.category !== category) return false;
    if (d.price > maxPrice) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (selectedTags.length > 0) {
     
      if (selectedTags.includes("Spicy") && d.spicyLevel === 0) return false;

      const nonSpicyTags = selectedTags.filter(t => t !== "Spicy");
      if (
        nonSpicyTags.length > 0 &&
        !nonSpicyTags.every(t => d.tags.includes(t))
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <section className="page">
      <div className="container">
        <h1>Menu</h1>
        <p className="section-subtitle">
          Filter by category, diet and price to find your perfect dish.
        </p>

        <div className="filters">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Max Price: ${maxPrice}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
            />
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Find a dish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Diet & Spice</label>
            <div className="tag-row">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={
                    selectedTags.includes(tag) ? "tag-chip active" : "tag-chip"
                  }
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid">
          {filtered.length === 0 && <p>No dishes match your filters.</p>}
          {filtered.map(dish => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Menu;
