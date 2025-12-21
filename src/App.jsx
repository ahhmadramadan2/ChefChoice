import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Menu from "./pages/Menu";
import DishDetails from "./pages/DishDetails";
import MealBuilder from "./pages/MealBuilder";
import Cart from "./pages/Cart";

// NEW pages (you must create these files)
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState(null);

  // Keep user logged in on refresh (session cookie)
  useEffect(() => {
  axios
    .get(`${API}/api/auth/me`, { withCredentials: true })
    .then((res) => {
      // Only accept a real user object
      if (res.data && typeof res.data === "object" && res.data.id) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    })
    .catch(() => setUser(null));
}, []);

  return (
    <div className="app">
      <Navbar user={user} setUser={setUser} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<DishDetails />} />
          <Route path="/builder" element={<MealBuilder />} />
          <Route path="/cart" element={<Cart />} />

          {/* NEW auth routes */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
