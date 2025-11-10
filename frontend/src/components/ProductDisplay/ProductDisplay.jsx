import React, { useState, useEffect, useContext } from "react";
import "./ProductDisplay.css";
import { FaFacebook, FaPinterest, FaLinkedin, FaTwitter } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";
import { useNavigate, useParams } from "react-router-dom";

const ProductDisplay = () => {
  const { productId } = useParams();
  const cleanProductId = productId?.trim() || "";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const { cart, addToCart, wishlist, toggleWishlist } = useContext(ShopContext);

  const isInCart = product && cart[product._id]?.qty > 0;
  const isInWishlist = product && wishlist[product._id] !== undefined;

  /** Fetch product details **/
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!cleanProductId || cleanProductId.length !== 24) {
          setError("Invalid product ID.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:4000/api/products/${cleanProductId}`);
        if (!res.ok) {
          setError("Product not found.");
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [cleanProductId]);

  useEffect(() => {
    if (product) {
      setMainImage(product.image || product.images?.[0] || "");
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
      setSizeError(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [product]);

  /** Toast Notification **/
  const showNotification = (msg) => {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  /** Add to Cart **/
  const handleAddToCart = () => {
    if (!product?.inStock) return showNotification("Product is out of stock!");
    if (product.sizes?.length && !selectedSize) {
      setSizeError(true);
      return showNotification("Please select a size!");
    }
    addToCart(product._id, quantity, selectedSize, selectedColor);
    showNotification("Added to cart!");
    return true;
  };

const handleAddToWishlist = () => {
  if (product.sizes?.length && !selectedSize) {
    setSizeError(true);
    return showNotification("Please select a size!");
  }
  toggleWishlist(product._id, selectedSize); // pass selectedSize
  showNotification(
    isInWishlist ? "Removed from Wishlist!" : "Added to Wishlist!"
  );
};



  if (loading) return <p>Loading product...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Product not found</p>;

  const images = product.images?.length ? product.images : [product.image];

  /** ✅ Handle Color Click **/
  const handleColorClick = (color, index) => {
    setSelectedColor(color);
    const img = images[index];
    if (img) setMainImage(img);
  };

  return (
    <div className="product-page">

      <div className="productdisplay">
        {toast && (
          <div className={`toast-notification ${showToast ? "show" : ""}`}>
            {toast}
          </div>
        )}

        {/* ---------- Left Section ---------- */}
        <div className="productdisplay-left">
          <div className="productdisplay-thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.startsWith("http") ? img : `http://localhost:4000${img}`}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${mainImage === img ? "active" : ""}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>

          <div className="productdisplay-main">
            <img
              src={
                mainImage.startsWith("http")
                  ? mainImage
                  : `http://localhost:4000${mainImage}`
              }
              alt={product.name}
              className="productdisplay-main-img"
            />
          </div>
        </div>

        {/* ---------- Right Section ---------- */}
        <div className="productdisplay-right">
          <p className="category">{product.category || "General"}</p>
          <h1>{product.name}</h1>

          <div className="productdisplay-prices">
            <div className="price-values">
              <span className="new-price">${product.new_price}</span>
              {product.old_price > 0 && (
                <>
                  <span className="old-price">${product.old_price}</span>
                  <span className="discount-badge">
                    -{Math.round(
                      ((product.old_price - product.new_price) / product.old_price) * 100
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="stock-status">
            {product.inStock ? (
              <span className="in-stock">
                In Stock ({product.stockQuantity} left)
              </span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <p className="product-description">
            {product.description || "No description available."}
          </p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="productdisplay-sizes">
              <span>Size:</span>
              <div className={`size-options ${sizeError ? "error" : ""}`}>
                {product.sizes.map((size) => (
                  <div
                    key={size}
                    className={`size-box ${selectedSize === size ? "active" : ""}`}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Colors (Amazon style with image switch) */}
          {product.colors?.length > 0 && (
            <div className="productdisplay-sizes">
              <span>Color:</span>
              <div className="color-options">
                {product.colors.map((color, index) => (
                  <div
                    key={color}
                    className={`color-circle ${
                      selectedColor === color ? "active" : ""
                    }`}
                    onClick={() => handleColorClick(color, index)}
                    style={{
                      background:
                        color.startsWith("#") || color.startsWith("rgb")
                          ? color
                          : color.toLowerCase(),
                    }}
                    title={color}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="quantity">
            <span>Qty:</span>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          {/* Buttons */}
          <div className="productdisplay-buttons">
            <button
              onClick={handleAddToCart}
              className={`add-to-cart ${isInCart ? "in-cart" : ""}`}
            >
              {isInCart ? "In Cart" : "Add to Cart"}
            </button>
            <button
              onClick={handleAddToWishlist}
              className={`add-to-wishlist ${isInWishlist ? "in-wishlist" : ""}`}
            >
              {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            </button>
            
          </div>

          <p className="sku">
            <span>SKU:</span> {product.sku || "N/A"}
          </p>
          <p className="tags">
            <span>Tags:</span>{" "}
            {product.tags?.length ? product.tags.join(", ") : "No Tags"}
          </p>

          <div className="share">
            <span>Share:</span> <FaFacebook /> <FaPinterest /> <FaLinkedin />{" "}
            <FaTwitter />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDisplay;
