import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  // ✅ Load from localStorage at initialization (avoids double-mount overwrite)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartData");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      return [];
    }
  });

  // ✅ Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem("cartData", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.key === item.key);
      if (existing) {
        return prev.map((p) =>
          p.key === item.key ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (key, qty) => {
    setCart((prev) =>
      prev.map((item) => (item.key === key ? { ...item, qty } : item))
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, updateQty, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
