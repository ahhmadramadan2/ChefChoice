
import { Link } from "react-router-dom";
import { dishes } from "../data/dishes";
import DishCard from "../components/DishCard";

import heroBb from "../assets/NB.jpg"; 
import heroBc from "../assets/bb.jpg"; 
import heroBg from "../assets/download.jpg";


function getRecommendationCategory() {
  const hour = new Date().getHours();
  if (hour < 12) return "Breakfast";
  if (hour < 17) return "Lunch";
  return "Dinner";
}

function Home() {
  const category = getRecommendationCategory();

  const recommended = dishes
    .filter(
      (d) =>
        d.category === category ||
        (d.isFeatured && (d.category === "Lunch" || d.category === "Dinner"))
    )
    .slice(0, 4);

  return (
    <section className="page home-page">
      
      <div className="hero" style={{ "--bg-img": `url(${heroBb})` }}>
        <div className="hero-text">
          <h1>
            Smart <span>Restaurant</span> Ordering.
          </h1>
          <p>
            Browse a full menu of burgers, pasta, salads, vegan and gluten-free
            dishes. Use filters, build custom meals, and keep your cart even
            after refresh.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn-primary">
              View Menu
            </Link>
            <Link to="/builder" className="btn-outline">
              Build a Meal
            </Link>
          </div>
        </div>
      </div>


      <div
        className="section section-soft"
        style={{ "--bg-img": `url(${heroBg})` }}
      >
        <div className="container">
          <h2>Chef’s Recommendations for {category}</h2>
          <p className="section-subtitle">
            A few popular choices we suggest for this time of day.
          </p>

          <div className="grid">
            {recommended.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </div>

      <div className="container section category-section"  style={{ "--bg-img": `url(${heroBc})` }}>
        <h2>Explore by Category</h2>
        <p className="section-subtitle">
          You can always fine-tune your choice later using filters on the menu.
        </p>
        <div className="category-buttons"> 
          <Link to="/menu" className="btn-secondary">
            Burgers & Sandwiches
          </Link>
          <Link to="/menu" className="btn-secondary">
            Pasta & Chicken
          </Link>
          <Link to="/menu" className="btn-secondary">
            Vegan & Gluten-Free
          </Link>
          <Link to="/menu" className="btn-secondary">
            Salads & Appetizers
          </Link>
          <Link to="/menu" className="btn-secondary">
            Drinks
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
