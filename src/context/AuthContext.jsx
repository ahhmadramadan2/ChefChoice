import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore from localStorage and verify token with backend
  useEffect(() => {
    const saved = localStorage.getItem("chefUser");
    const token = localStorage.getItem("chefToken");
    if (saved && token) {
      setUser(JSON.parse(saved));
      api.get("/api/auth/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("chefUser", JSON.stringify(res.data));
        })
        .catch(() => {
          // Token invalid -> clear
          setUser(null);
          localStorage.removeItem("chefToken");
          localStorage.removeItem("chefUser");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function login({ token, user }) {
    localStorage.setItem("chefToken", token);
    localStorage.setItem("chefUser", JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("chefToken");
    localStorage.removeItem("chefUser");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}