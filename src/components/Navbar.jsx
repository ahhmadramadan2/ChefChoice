import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Navbar({ user, setUser }) {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const nav = useNavigate();

  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // even if backend fails, clear user locally
    }
    setUser(null);
    nav("/");
  };
  const handleLogout = async () => {
  try {
    await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    setUser(null); // or however you're storing user
    navigate("/login"); // optional
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          Chef<span>Choice</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/services">Features</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/builder">Meal Builder</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* Right side: Cart + Auth */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link to="/cart" className="cart-link">
            Cart ({itemCount})
          </Link>

          {user ? (
            <>
              <span style={{ fontSize: 14 }}>Hi, {user.name}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>


            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
