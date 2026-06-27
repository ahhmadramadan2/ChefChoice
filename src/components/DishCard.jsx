import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function DishCard({ dish }) {
  const { addToCart } = useCart();

  const price = Number(dish?.price ?? 0);
  const calories = Number(dish?.calories ?? 0);
  const spiceLevel = Number(dish?.spice_level ?? 0);

  const tags = [
    ...(Number(dish?.is_vegan) === 1 ? ["Vegan"] : []),
    ...(Number(dish?.is_vegetarian) === 1 ? ["Vegetarian"] : []),
    ...(Number(dish?.is_gluten_free) === 1 ? ["Gluten-free"] : []),
    ...(spiceLevel > 0 ? ["Spicy"] : []),
  ];

  function handleAdd() {
    addToCart({
      id: dish.id,
      name: dish.name,
      price,
      quantity: 1,
      description: dish?.description || "",
      category: dish?.category || "",
      calories,
      isCombo: false,
    });
  }

  return (
    <div className="dish-card">
      <div className="dish-card-body">
        <div className="dish-card-header">
          <h3 className="dish-title">{dish?.name || "Untitled Dish"}</h3>
          <span className="dish-price">${price.toFixed(2)}</span>
        </div>

        <p className="dish-category">{dish?.category || "Uncategorised"}</p>

        {dish?.description && (
          <p className="dish-desc">{dish.description}</p>
        )}

        <div className="dish-meta">
          <span>{calories} kcal</span>
          {spiceLevel > 0 && <span>🌶️ {spiceLevel}</span>}
        </div>

        {tags.length > 0 && (
          <div className="dish-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="dish-actions">
          <Link to={`/menu/${dish.id}`} className="btn-secondary">
            Details
          </Link>
          <button className="btn-primary" onClick={handleAdd}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default DishCard;
