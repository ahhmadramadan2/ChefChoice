
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function DishCard({ dish }) {
  const { addToCart } = useCart();

  return (
    <div className="dish-card">
      <div className="dish-card-header">
        <h3>{dish.name}</h3>
        <span className="dish-price">${dish.price.toFixed(2)}</span>
      </div>
      <p className="dish-category">{dish.category}</p>
      <p className="dish-desc">{dish.description}</p>
      <div className="dish-tags">
        {dish.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="dish-actions">
        <Link to={`/menu/${dish.id}`} className="btn-secondary">
          Details
        </Link>
        <button
          className="btn-primary"
          onClick={() => addToCart({ ...dish, isCombo: false })}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default DishCard;
