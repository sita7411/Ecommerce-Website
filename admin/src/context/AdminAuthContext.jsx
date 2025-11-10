import { createContext, useContext, useState, useEffect } from "react";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");
      const storedToken = localStorage.getItem("adminToken");

      if (storedAdmin && storedToken) {
        setAdmin(JSON.parse(storedAdmin));
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to parse admin from localStorage:", err);
      setAdmin(null);
      setToken("");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (adminData, adminToken) => {
    setAdmin(adminData);
    setToken(adminToken);
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    localStorage.setItem("adminToken", adminToken);
  };

  // Logout function
  const logout = () => {
    setAdmin(null);
    setToken("");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
  };

  return (
    <AdminAuthContext.Provider
    value={{ admin, token, loading, login, logout, setAdmin, setToken }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
