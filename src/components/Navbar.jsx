
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

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
        <Link to="/cart" className="cart-link">
          Cart ({itemCount})
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
