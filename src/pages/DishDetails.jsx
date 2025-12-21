import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";

function DishDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dishes/${id}`,
          { withCredentials: true }
        );
        setDish(res.data);
      } catch (err) {
        setDish(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  if (loading) {
    return (
      <section className="page container">
        <p>Loading dish...</p>
      </section>
    );
  }

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
      <p>Price: ${Number(dish.price).toFixed(2)}</p>

      <div className="dish-tags">
        {dish.tags?.map(tag => (
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
