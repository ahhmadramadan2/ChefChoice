import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const itemCount = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          Chef<span>Choice</span>
        </Link>

        {/* Main navigation */}
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/services">Features</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/builder">Meal Builder</NavLink>
          <NavLink to="/contact">Contact</NavLink>

          {/* Admin link — only shows if user is admin */}
          {user?.role === "admin" && (
            <NavLink to="/admin">Admin</NavLink>
          )}
        </nav>

        {/* Right-side actions */}
        <div className="nav-actions">
          <NavLink to="/cart" className="cart-link">
            Cart ({itemCount})
          </NavLink>

          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <button className="btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;