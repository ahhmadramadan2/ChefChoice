
import { useParams, Link } from "react-router-dom";
import { dishes } from "../data/dishes";
import { useCart } from "../context/CartContext";

function DishDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const dish = dishes.find(d => d.id === Number(id));

  if (!dish) {
    return (
      <section className="page container">
        <p>Dish not found.</p>
        <Link to="/menu" className="btn-outline">
          Back to Menu
        </Link>
      </section>
    );
  }

  return (
    <section className="page container">
      <h1>{dish.name}</h1>
      <p className="dish-category">{dish.category}</p>
      <p>{dish.description}</p>
      <p>Calories: {dish.calories}</p>
      <p>Price: ${dish.price.toFixed(2)}</p>
      <div className="dish-tags">
        {dish.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <button
        className="btn-primary"
        onClick={() => addToCart({ ...dish, isCombo: false })}
      >
        Add to Cart
      </button>
    </section>
  );
}

export default DishDetails;
