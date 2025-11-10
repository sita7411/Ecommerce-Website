import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/ShopContext";
import { useNavigate } from "react-router-dom";
import "./CartItems.css";
const API_BASE = process.env.REACT_APP_API_URL;

const CartItems = () => {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    resetCart,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [all_product, setAllProduct] = useState([]);
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  // 🟢 Fetch cart product details
  useEffect(() => {
    const fetchProducts = async () => {
      const safeCart = cart || {};
      const ids = Object.keys(safeCart);
      if (ids.length === 0) {
        setAllProduct([]);
        return;
      }

      try {
        const responses = await Promise.all(
          ids.map((id) =>
            fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`).then((res) => res.json())
              res.json()
            )
          )
        );
        setAllProduct(responses);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [cart]);

  // 🟢 Check first-order status (only if first order, i.e., no previous orders)
  useEffect(() => {
    const checkFirstOrder = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsFirstOrder(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setIsFirstOrder(Array.isArray(data.orders) && data.orders.length === 0);
      } catch (err) {
        console.error("Error checking first order:", err);
        setIsFirstOrder(false);
      }
    };

    checkFirstOrder();
  }, []);

  const goToProduct = (id) => navigate(`/product/${id}`);

  const cartEntries = Object.entries(cart || {});
  const totalItems = cartEntries.reduce((sum, [_, item]) => sum + item.qty, 0);

  // 🧮 Subtotal (only for in-stock products)
  const subTotal = all_product.reduce((sum, product) => {
    const item = cart[product._id];
    if (item && product.inStock) {
      return sum + product.new_price * item.qty;
    }
    return sum;
  }, 0);

  // 🧮 Discount (20% only for first order)
  const discount = isFirstOrder ? subTotal * 0.2 : 0;

  // 🧮 Final Total
  const total = subTotal - discount;

  // 💾 Store for next page
  useEffect(() => {
    localStorage.setItem("subTotal", subTotal.toFixed(2));
    localStorage.setItem("discount", discount.toFixed(2));
    localStorage.setItem("grandTotal", total.toFixed(2));
    localStorage.setItem("isFirstOrder", isFirstOrder);
  }, [subTotal, discount, total, isFirstOrder]);

  if (cartEntries.length === 0) {
    return (
      <div className="cart-wrapper">
        <div className="cart-banner">
          <div className="banner-overlay">
            <h1>Shopping Cart</h1>
            <p>
              <a href="/">Home</a> / <span>Shopping Cart</span>
            </p>
          </div>
        </div>
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>
            Go back to <a href="/">shop</a> and add some products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrapper">
      <div className="cart-banner">
        <div className="banner-overlay">
          <h1>Shopping Cart</h1>
          <p>
            <a href="/">Home</a> / <span>Shopping Cart</span>
          </p>
        </div>
      </div>

      <div className="cart-container">
        {/* Left Side */}
        <div className="cart-left">
          <div className="cart-header">
            <p>Remove</p>
            <p>Image</p>
            <p>Product</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Subtotal</p>
          </div>

          {cartEntries.map(([productId, cartItem]) => {
            const product = all_product.find((p) => p._id === productId);
            if (!product) return null;
            const outOfStock = !product.inStock;

            return (
              <div key={productId} className="cart-row">
                <div
                  className="remove-cart-btn"
                  onClick={() => removeFromCart(productId)}
                >
                  ×
                </div>

                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="cart-product-img"
                  onClick={() => goToProduct(productId)}
                  style={{ cursor: "pointer" }}
                />

 <div className="cart-product-info">
  <h4 onClick={() => goToProduct(productId)}>{product.name}</h4>
  {product.sizes?.length > 0 && (
    <p className="cart-size">
      Size: {cart[productId]?.size || product.sizes[0]}
    </p>
  )}
</div>


                <p className="cart-price">
                  {outOfStock ? "Out of Stock" : `$${product.new_price}`}
                </p>

                <div className="cart-qty">
                  <button
                    onClick={() => decreaseQty(productId)}
                    disabled={outOfStock}
                  >
                    -
                  </button>
                  <span>{cartItem.qty}</span>
                  <button
                    onClick={() => increaseQty(productId)}
                    disabled={outOfStock}
                  >
                    +
                  </button>
                </div>

                <p className="cart-subtotal">
                  {outOfStock
                    ? "Out of Stock"
                    : `$${(product.new_price * cartItem.qty).toFixed(2)}`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="summary-row">
            <span>Sub Total</span>
            <span>${subTotal.toFixed(2)}</span>
          </div>

          {isFirstOrder && (
            <div className="summary-row discount">
              <span>First Order Discount (20%)</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={() => navigate("/shipping")}
          >
            Proceed to Shipping
          </button>

          <button className="reset-btn" onClick={resetCart}>
            Reset All Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
