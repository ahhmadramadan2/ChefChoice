import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";


const API = import.meta.env.VITE_API_URL;

function MealBuilder() {
  const { addToCart } = useCart();

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("Main"); // Main | Side | Drink

  const [mainId, setMainId] = useState("");
  const [sideId, setSideId] = useState("");
  const [drinkId, setDrinkId] = useState("");

  // category filters
  const MAIN_CATS = [
    "All",
    "Breakfast",
    "Burgers",
    "Sandwiches",
    "Chicken",
    "Beef & Meat",
    "Seafood",
    "Pasta",
    "Vegan",
  ];
  const SIDE_CATS = ["All", "Sides", "Salads"];
  const DRINK_CATS = ["All", "Drinks"];

  const [mainCat, setMainCat] = useState("All");
  const [sideCat, setSideCat] = useState("All");
  const [drinkCat, setDrinkCat] = useState("All");

  const catRef = useRef(null);

  function scrollCats(dir) {
    if (!catRef.current) return;
    catRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
  }

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await axios.get(`${API}/api/dishes`, { withCredentials: true });
        setDishes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  // base groups
  const mainsAll = useMemo(() => {
    const baseCats = MAIN_CATS.filter((x) => x !== "All");
    return dishes.filter((d) => baseCats.includes(d.category));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishes]);

  const sidesAll = useMemo(
    () => dishes.filter((d) => d.category === "Sides" || d.category === "Salads"),
    [dishes]
  );
  const drinksAll = useMemo(() => dishes.filter((d) => d.category === "Drinks"), [dishes]);

  // filtered groups
  const mains = useMemo(
    () => (mainCat === "All" ? mainsAll : mainsAll.filter((d) => d.category === mainCat)),
    [mainsAll, mainCat]
  );
  const sides = useMemo(
    () => (sideCat === "All" ? sidesAll : sidesAll.filter((d) => d.category === sideCat)),
    [sidesAll, sideCat]
  );
  const drinks = useMemo(
    () => (drinkCat === "All" ? drinksAll : drinksAll.filter((d) => d.category === drinkCat)),
    [drinksAll, drinkCat]
  );

  // defaults after load
  useEffect(() => {
    if (!mainId && mainsAll[0]?.id) setMainId(String(mainsAll[0].id));
    if (!sideId && sidesAll[0]?.id) setSideId(String(sidesAll[0].id));
    if (!drinkId && drinksAll[0]?.id) setDrinkId(String(drinksAll[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainsAll, sidesAll, drinksAll]);

  // keep selection valid when filtering
  useEffect(() => {
    if (mains.length && !mains.some((x) => String(x.id) === String(mainId))) {
      setMainId(String(mains[0].id));
    }
  }, [mains, mainId]);

  useEffect(() => {
    if (sides.length && !sides.some((x) => String(x.id) === String(sideId))) {
      setSideId(String(sides[0].id));
    }
  }, [sides, sideId]);

  useEffect(() => {
    if (drinks.length && !drinks.some((x) => String(x.id) === String(drinkId))) {
      setDrinkId(String(drinks[0].id));
    }
  }, [drinks, drinkId]);

  const selectedMain = useMemo(
    () => mainsAll.find((m) => String(m.id) === String(mainId)),
    [mainId, mainsAll]
  );
  const selectedSide = useMemo(
    () => sidesAll.find((s) => String(s.id) === String(sideId)),
    [sideId, sidesAll]
  );
  const selectedDrink = useMemo(
    () => drinksAll.find((d) => String(d.id) === String(drinkId)),
    [drinkId, drinksAll]
  );

  const totalPrice =
    Number(selectedMain?.price || 0) +
    Number(selectedSide?.price || 0) +
    Number(selectedDrink?.price || 0);

  const totalCalories =
    Number(selectedMain?.calories || 0) +
    Number(selectedSide?.calories || 0) +
    Number(selectedDrink?.calories || 0);

  function handlePick(id) {
    if (tab === "Main") setMainId(String(id));
    if (tab === "Side") setSideId(String(id));
    if (tab === "Drink") setDrinkId(String(id));
  }

  function handleAddCombo() {
    if (!selectedMain || !selectedSide || !selectedDrink) return;

    addToCart({
      id: `combo-${selectedMain.id}-${selectedSide.id}-${selectedDrink.id}-${Date.now()}`,
      name: "Custom Meal Combo",
      description: `${selectedMain.name} + ${selectedSide.name} + ${selectedDrink.name}`,
      price: totalPrice,
      calories: totalCalories,
      isCombo: true,
      items: [
        { id: selectedMain.id, name: selectedMain.name },
        { id: selectedSide.id, name: selectedSide.name },
        { id: selectedDrink.id, name: selectedDrink.name },
      ],
    });
  }

  if (loading) {
    return (
      <section className="page">
        <div className="container">
          <div className="mb-hero">
            <h1>Build Your Meal</h1>
            <p className="mb-sub">Loading dishes…</p>
          </div>
        </div>
      </section>
    );
  }

  if (!dishes.length) {
    return (
      <section className="page">
        <div className="container">
          <div className="mb-hero">
            <h1>Build Your Meal</h1>
            <p className="mb-sub">No dishes available right now.</p>
            <Link to="/menu" className="btn-primary" style={{ marginTop: 10 }}>
              Go to Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const activeCats = tab === "Main" ? MAIN_CATS : tab === "Side" ? SIDE_CATS : DRINK_CATS;
  const activeCat = tab === "Main" ? mainCat : tab === "Side" ? sideCat : drinkCat;
  const setActiveCat = tab === "Main" ? setMainCat : tab === "Side" ? setSideCat : setDrinkCat;

  const activeList = tab === "Main" ? mains : tab === "Side" ? sides : drinks;
  const activeSelectedId = tab === "Main" ? mainId : tab === "Side" ? sideId : drinkId;

  return (
    <section className="page mealbuilder-page">
      <div className="container">
        {/* Hero */}
        <div className="mb-hero">
          <div>
            <h1>Build Your Meal</h1>
            <p className="mb-sub">Choose a main, side, and drink — totals update instantly.</p>
          </div>

          <div className="mb-hero-actions">
            <Link to="/menu" className="btn-outline">
              Browse Menu
            </Link>
            <button
              className="btn-primary"
              onClick={handleAddCombo}
              disabled={!selectedMain || !selectedSide || !selectedDrink}
            >
              Add Combo to Cart
            </button>
          </div>
        </div>

        <div className="mb-layout">
          {/* Left */}
          <div className="mb-selectors">
            <div className="mb-card">
              {/* Block 1 */}
              <div className="mb-block">
                <div className="mb-block-title">Step 1 — Type</div>
                <div className="segmented">
                  {["Main", "Side", "Drink"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`seg-btn ${tab === t ? "active" : ""}`}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block 2 */}
              <div className="mb-block">
                <div className="mb-block-title">Step 2 — Category</div>

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
                    {activeCats.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`pill mb-pillwide ${activeCat === c ? "active" : ""}`}
                        onClick={() => setActiveCat(c)}
                      >
                        {c}
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

              {/* Block 3 */}
              <div className="mb-block">
                <div className="mb-block-title">Step 3 — Pick Item</div>

                <div className="mb-table">
                  <div className="mb-thead">
                    <span>Item</span>
                    <span>Price</span>
                  </div>

                  <div className="mb-tbody">
                    {activeList.length ? (
                      activeList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`mb-tr ${
                            String(activeSelectedId) === String(item.id) ? "selected" : ""
                          }`}
                          onClick={() => handlePick(item.id)}
                        >
                          <div className="mb-td-left">
                            <strong>{item.name}</strong>
                            <span className="mb-td-sub">
                              {item.category} • {item.calories} kcal
                            </span>
                          </div>
                          <div className="mb-td-right">${Number(item.price).toFixed(2)}</div>
                        </button>
                      ))
                    ) : (
                      <p className="mb-warn">No items found in this category.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <aside className="mb-summary">
            <h2 className="mb-summary-title">Summary</h2>

            <div className="mb-summary-row">
              <span>Main</span>
              <strong>{selectedMain?.name || "—"}</strong>
            </div>
            <div className="mb-summary-row">
              <span>Side</span>
              <strong>{selectedSide?.name || "—"}</strong>
            </div>
            <div className="mb-summary-row">
              <span>Drink</span>
              <strong>{selectedDrink?.name || "—"}</strong>
            </div>

            <div className="mb-summary-total">
              <div className="mb-total-line">
                <span>Total</span>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              <div className="mb-total-line">
                <span>Calories</span>
                <strong>{totalCalories} kcal</strong>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleAddCombo}
              disabled={!selectedMain || !selectedSide || !selectedDrink}
            >
              Add Meal to Cart
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default MealBuilder;
