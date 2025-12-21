import { Link } from "react-router-dom";

function Services() {
  const features = [
    {
      title: "Smart Recommendations",
      icon: "✨",
      text:
        "The home page shows recommendations based on the time of day (lighter options in the morning, heavier meals at night).",
    },
    {
      title: "Menu Filters & Search",
      icon: "🔎",
      text:
        "Filter dishes by category, price, and tags like Vegan, Vegetarian and Gluten-free. You can also search by name.",
    },
    {
      title: "Custom Meal Builder",
      icon: "🍱",
      text:
        "Build a combo by choosing a main, side, and drink. Total price and calories update instantly.",
    },
    {
      title: "Cart with Order Timeline",
      icon: "🛒",
      text:
        "The cart shows selected items and total price, plus a simple timeline that simulates order progress.",
    },
    {
      title: "Context State + localStorage",
      icon: "🧠",
      text:
        "Cart state is shared using React Context API, and persists after refresh using localStorage.",
    },
    {
      title: "Responsive UI",
      icon: "📱",
      text:
        "Layout adapts to mobile and desktop. Grid, filters and navigation are tested across screen sizes.",
    },
  ];

  return (
    <section className="page services-page">
      <div className="container">
        {/* Hero */}
        <div className="services-hero">
          <div>
            <h1>Features</h1>
            <p className="services-hero-sub">
              ChefChoice is more than a simple menu — it includes small smart features
              to improve the user experience.
            </p>
          </div>

          {/* <div className="services-hero-actions">
            <Link to="/menu" className="btn-primary">
              Go to Menu
            </Link>
            <Link to="/builder" className="btn-outline">
              Open Meal Builder
            </Link>
          </div> */}
        </div>

        {/* Feature grid */}
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" aria-hidden="true">
                {f.icon}
              </div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="services-cta">
          <h2>Try it out</h2>
          <p className="section-subtitle">
            Start from the menu or build a combo meal.
          </p>
          <div className="services-cta-actions">
            <Link to="/menu" className="btn-primary">
              Browse Menu
            </Link>
            <Link to="/builder" className="btn-outline">
              Build a Meal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
