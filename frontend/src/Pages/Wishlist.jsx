import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import "../Pages/CSS/Wishlist.css";

const Wishlist = () => {
  const { wishlist, addToCart, toggleWishlist, clearWishlist, user } = useContext(ShopContext);
  const [all_product, setAllProduct] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const goToProduct = (id) => navigate(`/product/${id}`);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4000/api/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Wishlist API response:", data);

        const safeWishlist = data.wishlist || {};
        const ids = Object.keys(safeWishlist).filter(Boolean);
        console.log("Fetching wishlist products for IDs:", ids);

        if (ids.length === 0) {
          setAllProduct([]);
          return;
        }
        const requests = ids.map((id) =>
          fetch(`http://localhost:4000/api/products/${encodeURIComponent(id)}`).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
        );
        const products = await Promise.all(requests);
        console.log("Fetched wishlist products:", products);
        setAllProduct(products);
      } catch (err) {
        console.error("fetchWishlistProducts error:", err);
        setAllProduct([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [token]);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://www.example.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // FIXED: Use context's toggleWishlist instead of custom fetch
  const handleToggleWishlist = (productId) => {
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    const item = wishlist?.[productId];
    toggleWishlist(productId, item?.size || null);
  };


  return (
    <div className="wishlist-wrapper">
      <div className="wishlist-banner">
        <div className="banner-overlay">
          <h1>Wishlist</h1>
          <p><a href="/">Home</a> / <span>Wishlist</span></p>
        </div>
      </div>

      <div className="wishlist-table">
        <div className="wishlist-header">
          <span>Remove</span>
          <span>Product</span>
          <span>Price</span>
          <span>Date Added</span>
          <span>Stock Status</span>
          <span>Action</span>
        </div>

        {loading && <p style={{ textAlign: "center", margin: "20px" }}>Loading...</p>}

        {!loading && Object.keys(wishlist || {}).length === 0 && (
          <div className="empty-wishlist"><p>Your wishlist is empty.</p></div>
        )}

        {!loading && all_product.map((product) => {
          const item = wishlist?.[product._id];
          if (!item) return null;
          const outOfStock = !product.inStock;

          return (
            <div key={product._id} className="wishlist-row">
              <div className="remove-wishlist-btn" onClick={() => handleToggleWishlist(product._id)}>×</div>

              <div className="wishlist-product" onClick={() => goToProduct(product._id)} style={{ cursor: "pointer" }}>
                <img src={product.images[0]} alt={product.name} />
                <div>
                  <p>{product.name}</p>
                  <small>Size: {item.size || (product.sizes && product.sizes[0]) || "N/A"}</small>
                </div>
              </div>

              <span className="cart-item-price">${product.new_price.toFixed(2)}</span>
              <span>{item.dateAdded || "N/A"}</span>
              <span className={`stock-status ${outOfStock ? "out-of-stock" : "in-stock"}`}>
                {outOfStock ? "Out of Stock" : "In Stock"}
              </span>

              <button
                onClick={() => {
                  if (!user) {
                    alert("Please login first");
                    navigate("/login");
                    return;
                  }
                  addToCart(product._id, 1, item.size);
                }}
                className="addcart-btn"
                disabled={outOfStock}
              >
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          );
        })}
      </div>

      {Object.keys(wishlist || {}).length > 0 && (
        <div className="wishlist-footer">
          <div className="wishlist-link">
            <input type="text" value="https://www.example.com" readOnly />
            <button onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
          </div>

          <div className="footer-buttons">
            <button className="reset-btn" onClick={clearWishlist}>Clear Wishlist</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
