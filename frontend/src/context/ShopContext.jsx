// ShopContext.js
import React, { createContext, useState, useEffect } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState({});
  const [user, setUser] = useState(null);
  const [allCartProducts, setAllCartProducts] = useState([]);
  const [allWishlistProducts, setAllWishlistProducts] = useState([]);

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  // 🔐 Ensure token stays in context after page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !token) {
      setToken(savedToken);
    }
  }, [token]);

  // --- Initialize user, cart, wishlist from localStorage (with error handling) ---
  useEffect(() => {
    try {
      const storedUserStr = localStorage.getItem("user");
      const storedCartStr = localStorage.getItem("cart");
      const storedWishlistStr = localStorage.getItem("wishlist");

      const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
      const storedCart = storedCartStr ? JSON.parse(storedCartStr) : {};
      const storedWishlist = storedWishlistStr ? JSON.parse(storedWishlistStr) : {};

      if (storedUser) setUser(storedUser);
      setCart(storedCart); // Always set, even if empty
      setWishlist(storedWishlist); // Always set, even if empty
    } catch (err) {
      console.error("Error parsing localStorage data:", err);
      // Clear corrupted entries and reset to defaults
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");
      setUser(null);
      setCart({});
      setWishlist({});
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchCart();
    fetchWishlist();
  }, [token]);

  // --- Persist cart & wishlist to localStorage (safeguard against undefined) ---
  useEffect(() => {
    const cartToSave = cart || {}; // Ensure it's always an object
    localStorage.setItem("cart", JSON.stringify(cartToSave));
  }, [cart]);

  useEffect(() => {
    const wishlistToSave = wishlist || {}; // Ensure it's always an object
    localStorage.setItem("wishlist", JSON.stringify(wishlistToSave));
  }, [wishlist]);

  // Helper function: Handle API errors consistently (401 logout, etc.)
  const handleApiError = async (res, operationName) => {
    if (!res.ok) {
      let errorMsg = `Failed to ${operationName}. Try again.`;
      if (res.status === 401) {
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || "Session expired. Please login again.";
        } catch (parseErr) {
          errorMsg = "Authentication failed. Please login again.";
        }
        console.error(`${operationName} 401 Error:`, errorMsg);
        alert(errorMsg);
        logout();
        window.location.href = '/login';  // Redirect to login
        throw new Error(`HTTP ${res.status}: ${errorMsg}`);
      } else {
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || `HTTP ${res.status}`;
        } catch (parseErr) {
          errorMsg = `HTTP ${res.status}`;
        }
        console.error(`${operationName} Error:`, errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
      }
    }
  };

  // --- Fetch Cart from backend if user logs in ---
  const fetchCart = async () => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for fetchCart");
      setCart({});
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleApiError(res, 'fetch cart');
      const data = await res.json();
      console.log("fetchCart response:", data);
      setCart(data.cart || {}); // Always object
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCart({}); // Reset to empty on failure to avoid stale data
    }
  };

  // --- Fetch Wishlist from backend if user logs in ---
  const fetchWishlist = async () => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for fetchWishlist");
      setWishlist({});
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleApiError(res, 'fetch wishlist');
      const data = await res.json();
      console.log("fetchWishlist response:", data);
      setWishlist(data.wishlist || {}); // Always object
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setWishlist({}); // Reset to empty on failure
    }
  };

  // ... (rest of the file remains the same)

  // --- Merge cart items with product details ---
  useEffect(() => {
    const fetchCartProducts = async () => {
      const ids = Object.keys(cart || {});
      if (ids.length === 0) {
        setAllCartProducts([]);
        return;
      }
      try {
        const requests = ids.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:4000/api/products/${id}`);
            if (res.ok) {
              const product = await res.json();
              return {
                ...product,
                qty: cart[id]?.qty || 1,
              size: cart[id]?.size || (product.sizes[0] || null), // ✅ fallback to first size
              };
            } else if (res.status === 404) {
              console.warn(`Product ${id} not found in cart, skipping.`);
              return null; // Skip invalid products
            } else {
              throw new Error(`Failed to fetch product ${id}: ${res.status}`);
            }
          } catch (err) {
            console.error(`Error fetching cart product ${id}:`, err);
            return null;
          }
        });
        const products = await Promise.all(requests);
        const validProducts = products.filter((p) => p !== null);
        setAllCartProducts(validProducts);
      } catch (err) {
        console.error("Failed to fetch cart products:", err);
        setAllCartProducts([]);
      }
    };

    fetchCartProducts();
  }, [cart]);

  // --- Merge wishlist items with product details ---
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      const ids = Object.keys(wishlist || {});
      if (ids.length === 0) {
        setAllWishlistProducts([]);
        return;
      }
      try {
        const requests = ids.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:4000/api/products/${id}`);
            if (res.ok) {
              const product = await res.json();
              return {
                ...product,
                size: wishlist[id]?.size || null,
                dateAdded: wishlist[id]?.dateAdded || null,
              };
            } else if (res.status === 404) {
              console.warn(`Product ${id} not found in wishlist, skipping.`);
              return null; // Skip invalid products
            } else {
              throw new Error(`Failed to fetch product ${id}: ${res.status}`);
            }
          } catch (err) {
            console.error(`Error fetching wishlist product ${id}:`, err);
            return null;
          }
        });
        const products = await Promise.all(requests);
        const validProducts = products.filter((p) => p !== null);
        setAllWishlistProducts(validProducts);
      } catch (err) {
        console.error("Failed to fetch wishlist products:", err);
        setAllWishlistProducts([]);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);


  // --- Cart Functions ---
  const addToCart = async (id, qty = 1, size = null) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for addToCart");
      alert("Please login to add items to cart");
      window.location.href = '/login';
      return;
    }
    try {
      console.log("Sending addToCart with token length:", token.length); // Debug
      const res = await fetch("http://localhost:4000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, qty, size }),
      });
      await handleApiError(res, 'add item to cart');
      const data = await res.json();
      console.log("addToCart response:", data);
      setCart(data.cart || {});
      // Optional: Success feedback (you can add alert or toast here)
    } catch (err) {
      console.error("addToCart error:", err);
      // Don't update state on error to avoid corruption
    }
  };

  const removeFromCart = async (id) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for removeFromCart");
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleApiError(res, 'remove item from cart');
      const data = await res.json();
      console.log("removeFromCart response:", data);
      setCart(data.cart || {});
    } catch (err) {
      console.error("removeFromCart error:", err);
    }
  };

  // increaseQty function
  const increaseQty = async (id) => {
    const currentItem = cart[id];
    if (!currentItem) return;
    const newQty = currentItem.qty + 1;
    await updateCartItem(id, newQty);
  };

  // decreaseQty function
  const decreaseQty = async (id) => {
    const currentItem = cart[id];
    if (!currentItem || currentItem.qty <= 1) return;
    const newQty = currentItem.qty - 1;
    await updateCartItem(id, newQty);
  };

  const updateCartItem = async (id, qty) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for updateCartItem");
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qty }),
      });
      await handleApiError(res, 'update cart item');
      const data = await res.json();
      console.log("updateCartItem response:", data);
      setCart(data.cart || {});
    } catch (err) {
      console.error("updateCartItem error:", err);
    }
  };

  const resetCart = async () => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for resetCart");
      setCart({});
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/cart/reset", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleApiError(res, 'reset cart');
      setCart({});
    } catch (err) {
      console.error("resetCart error:", err);
      setCart({}); // Reset anyway on error
    }
  };

  const getTotalAmount = () => {
    return allCartProducts.reduce(
      (total, item) => total + (item.new_price || 0) * (item.qty || 1),
      0
    );
  };

  // --- Wishlist Functions ---
  const toggleWishlist = async (id, size = null) => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    alert("Please login first");
    window.location.href = '/login';
    return;
  }
  try {
    const method = wishlist[id] ? "DELETE" : "POST";
    const url = wishlist[id]
      ? `http://localhost:4000/api/wishlist/${id}`
      : "http://localhost:4000/api/wishlist";

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(method === "POST" && { body: JSON.stringify({ productId: id, size }) }),
    };

    const res = await fetch(url, options);
    await handleApiError(res, 'toggle wishlist');
    const data = await res.json();
    setWishlist(data.wishlist || {});
  } catch (err) {
    console.error("toggleWishlist error:", err);
  }
};


  const clearWishlist = async () => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn("No valid token for clearWishlist");
      setWishlist({});
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/wishlist/reset", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleApiError(res, 'clear wishlist');
      setWishlist({});
    } catch (err) {
      console.error("clearWishlist error:", err);
      setWishlist({}); // Reset anyway
    }
  };

  // --- Logout Function (clear localStorage fully) ---
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    setCart({});
    setWishlist({});
    setAllCartProducts([]);
    setAllWishlistProducts([]);
    // Optional: Redirect to home or login
    window.location.href = '/';
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        logout,
        setWishlist,
        cart,
        setCart,
        wishlist,
        allCartProducts,
        allWishlistProducts,
        addToCart,
        removeFromCart,
        updateCartItem,
        increaseQty,
        decreaseQty,
        resetCart,
        getTotalAmount,
        toggleWishlist,
        clearWishlist,
        fetchCart,
        fetchWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
