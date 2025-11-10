import { createContext, useState, useEffect } from "react";

export const ShopContext = createContext();

const ShopProvider = ({ children }) => {
  // ✅ Cart & Wishlist
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // ✅ User state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token"); // optional: remove token on logout
    }
  }, [user]);

  // Add to cart
  const addToCart = (item) => {
    setCartItems((prev) => [...prev, item]);
    alert(`${item.name} added to cart!`);
  };

  // Add to wishlist
  const addToWishlist = (item) => {
    setWishlist((prev) => {
      if (!prev.find((i) => i.id === item.id)) {
        alert(`${item.name} added to wishlist!`);
        return [...prev, item];
      } else {
        alert(`${item.name} is already in your wishlist!`);
        return prev;
      }
    });
  };

  // ✅ Logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        wishlist,
        user,          // ✅ user info available
        setUser,       // ✅ can update on login/signup
        addToCart,
        addToWishlist,
        logout,        // ✅ logout function
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopProvider;
