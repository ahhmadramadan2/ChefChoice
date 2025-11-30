
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("chefCart");
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("chefCart", JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(item) {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing && !item.isCombo) {
        // normal dish: increase quantity
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // combo or first time dish
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(i => i.id !== id));
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
