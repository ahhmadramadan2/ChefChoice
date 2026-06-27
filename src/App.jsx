import { Routes, Route, Navigate } from "react-router-dom";

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
import AdminDishes from "./pages/AdminDishes";
import AdminOrders from "./pages/AdminOrders";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminMessages from "./pages/AdminMessages";

import { useAuth } from "./context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="app">
      <Navbar />

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

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dishes"
            element={
              <AdminRoute>
                <AdminDishes />
              </AdminRoute>
            }
          />
          <Route
  path="/admin/orders"
  element={
    <AdminRoute>
      <AdminOrders />
    </AdminRoute>
  }
/>
<Route
  path="/admin/messages"
  element={
    <AdminRoute>
      <AdminMessages />
    </AdminRoute>
  }
/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;