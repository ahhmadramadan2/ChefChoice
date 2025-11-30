
import { useState, useMemo } from "react";
import { dishes } from "../data/dishes";
import { useCart } from "../context/CartContext";

function MealBuilder() {
  const mains = dishes.filter(d => d.category === "Lunch" || d.category === "Dinner");
  const sides = dishes.filter(d => d.category === "Side");
  const drinks = dishes.filter(d => d.category === "Drink");

  const [mainId, setMainId] = useState(mains[0]?.id || null);
  const [sideId, setSideId] = useState(sides[0]?.id || null);
  const [drinkId, setDrinkId] = useState(drinks[0]?.id || null);

  const { addToCart } = useCart();

  const selectedMain = useMemo(
    () => mains.find(m => m.id === Number(mainId)),
    [mainId, mains]
  );
  const selectedSide = useMemo(
    () => sides.find(s => s.id === Number(sideId)),
    [sideId, sides]
  );
  const selectedDrink = useMemo(
    () => drinks.find(d => d.id === Number(drinkId)),
    [drinkId, drinks]
  );

  const totalPrice =
    (selectedMain?.price || 0) +
    (selectedSide?.price || 0) +
    (selectedDrink?.price || 0);

  const totalCalories =
    (selectedMain?.calories || 0) +
    (selectedSide?.calories || 0) +
    (selectedDrink?.calories || 0);

  function handleAddCombo() {
    if (!selectedMain || !selectedSide || !selectedDrink) return;

    const combo = {
      id: `combo-${selectedMain.id}-${selectedSide.id}-${selectedDrink.id}-${Date.now()}`,
      name: "Custom Meal Combo",
      description: `${selectedMain.name} + ${selectedSide.name} + ${selectedDrink.name}`,
      price: totalPrice,
      calories: totalCalories,
      isCombo: true,
    };

    addToCart(combo);
  }

  return (
    <section className="page">
      <div className="container">
        <h1>Build Your Meal</h1>
        <p className="section-subtitle">
          Choose a main, side and drink. We’ll calculate the total for you.
        </p>

        <div className="builder-grid">
          <div className="builder-column">
            <h3>Main</h3>
            <select
              value={mainId || ""}
              onChange={e => setMainId(e.target.value)}
            >
              {mains.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (${m.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="builder-column">
            <h3>Side</h3>
            <select
              value={sideId || ""}
              onChange={e => setSideId(e.target.value)}
            >
              {sides.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (${s.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="builder-column">
            <h3>Drink</h3>
            <select
              value={drinkId || ""}
              onChange={e => setDrinkId(e.target.value)}
            >
              {drinks.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} (${d.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="builder-summary">
          <p>
            <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
          </p>
          <p>
            <strong>Total Calories:</strong> {totalCalories} kcal
          </p>
          <button className="btn-primary" onClick={handleAddCombo}>
            Add Meal to Cart
          </button>
        </div>
      </div>
    </section>
  );
}

export default MealBuilder;
