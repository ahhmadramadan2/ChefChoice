
import { Link } from "react-router-dom";

function Services() {
  return (
    <section className="page">
      <div className="container">
        <h1>Features</h1>
        <p className="section-subtitle">
          ChefChoice is more than a simple menu. It includes small smart features
          to improve the user experience.
        </p>

        <div className="grid">
          <div className="dish-card">
            <h3>Smart Recommendations</h3>
            <p>
              The home page shows recommendations based on the time of day.
              For example, breakfast dishes in the morning and heavier meals at night.
            </p>
          </div>

          <div className="dish-card">
            <h3>Menu Filters & Search</h3>
            <p>
              Users can filter dishes by category, price, and diet tags such as
              Vegan, Vegetarian and Gluten-free. They can also search by name.
            </p>
          </div>

          <div className="dish-card">
            <h3>Custom Meal Builder</h3>
            <p>
              The Meal Builder page lets the user choose a main, side, and drink.
              The website calculates the total price and calories for the combo in real time.
            </p>
          </div>

          <div className="dish-card">
            <h3>Cart with Order Timeline</h3>
            <p>
              The cart page shows all selected items and the total. There is also a simple
              order timeline that simulates the order moving from Cart to Ready.
            </p>
          </div>

          <div className="dish-card">
            <h3>State Management with Context</h3>
            <p>
              The cart state is shared across the whole website using the React Context API.
              Items stay in the cart even after a page refresh thanks to localStorage.
            </p>
          </div>

          <div className="dish-card">
            <h3>Responsive Design</h3>
            <p>
              The layout adjusts to different screen sizes. The grid and navigation are
              tested on both desktop and mobile resolutions.
            </p>
          </div>
        </div>

        <div className="section" style={{ marginTop: "2rem" }}>
          <h2>Try It Out</h2>
          <p>
            You can start exploring the app from the menu or build a custom meal.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/menu" className="btn-primary">
              Go to Menu
            </Link>
            <Link to="/builder" className="btn-outline">
              Open Meal Builder
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
