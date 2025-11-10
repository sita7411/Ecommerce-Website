import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import "./CSS/ShippingPage.css";

const countryStateCity = {
  India: {
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  },
  USA: {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    Texas: ["Houston", "Dallas", "Austin"],
  },
};

const ShippingPage = () => {
  const navigate = useNavigate();
  const { allCartProducts, token } = useContext(ShopContext);

  // 🧾 Memoized cart items
  const cartItems = useMemo(() => {
    return Array.isArray(allCartProducts)
      ? allCartProducts.filter(
          (item) =>
            item._id &&
            Number.isFinite(item.new_price) &&
            Number.isFinite(item.qty) &&
            item.new_price > 0 &&
            item.qty > 0 &&
            item.name
        )
      : [];
  }, [allCartProducts]);

  // 🏷️ Load saved shipping info
  const [shippingDetails, setShippingDetails] = useState(() => {
    const saved = localStorage.getItem("shippingDetails");
    return saved
      ? JSON.parse(saved)
      : {
          firstName: "",
          lastName: "",
          email: "",
          country: "",
          state: "",
          city: "",
          address: "",
          zip: "",
          phone: "",
          method: "standard",
        };
  });

  // 🧠 Save shipping details persistently
  useEffect(() => {
    localStorage.setItem("shippingDetails", JSON.stringify(shippingDetails));
  }, [shippingDetails]);

  // ✍️ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
      };
      if (name === "country") updated.state = updated.city = "";
      if (name === "state") updated.city = "";
      return updated;
    });
  };

  // 🔔 Toast Notification
  const [toast, setToast] = useState({ show: false, message: "" });
  const showToastMessage = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // 🟢 Check first-order status
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  useEffect(() => {
    const checkFirstOrder = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setIsFirstOrder(Array.isArray(data.orders) && data.orders.length === 0);
      } catch (err) {
        console.error("Error checking first order:", err);
        setIsFirstOrder(false);
      }
    };
    if (token) checkFirstOrder();
  }, [token]);

  // 🧮 Calculate totals
  const subTotal = cartItems.reduce(
    (sum, i) => sum + (i.new_price || 0) * (i.qty || 0),
    0
  );

  const shippingRates = { standard: 0, express: 5, priority: 10 };
  const shippingCost = shippingRates[shippingDetails.method] || 0;

  // 🧮 Discount (20% only for first order)
  const discount = isFirstOrder ? subTotal * 0.2 : 0;

  // 🧮 Final Total
  const total = subTotal + shippingCost - discount;

  // 💾 Save summary
  useEffect(() => {
    localStorage.setItem("discount", discount.toFixed(2));
    localStorage.setItem("subTotal", subTotal.toFixed(2));
    localStorage.setItem("shippingCost", shippingCost.toFixed(2));
    localStorage.setItem("grandTotal", total.toFixed(2));
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [discount, subTotal, shippingCost, total, cartItems]);

  // 🧭 Continue to checkout
  const handleContinue = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "country",
      "state",
      "city",
      "address",
      "zip",
      "phone",
    ];
    if (required.some((f) => !shippingDetails[f]?.trim())) {
      showToastMessage("Please fill all required fields");
      return;
    }
    if (!/^\d{10}$/.test(shippingDetails.phone)) {
      showToastMessage("Phone number must be 10 digits");
      return;
    }
    if (cartItems.length === 0) {
      showToastMessage("Your cart is empty");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="shipping-page">
      <div className="shipping-banner">
        <h1>Shipping Details</h1>
        <p>
          <a href="/">Home</a> / <a href="/cart">Cart</a> / <span>Shipping</span>
        </p>
      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}

      <div className="shipping-main">
        {/* 🟢 Left: Form */}
        <div className="shipping-form-card">
          <h2>Shipping Information</h2>

          <div className="name-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                value={shippingDetails.firstName}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>First Name*</label>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                value={shippingDetails.lastName}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Last Name*</label>
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={shippingDetails.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Email*</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="phone"
              value={shippingDetails.phone}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Phone Number*</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="address"
              value={shippingDetails.address}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Street Address*</label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                name="country"
                value={shippingDetails.country}
                onChange={handleChange}
                required
              >
                <option value=""> </option>
                {Object.keys(countryStateCity).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label>Country*</label>
            </div>

            <div className="form-group">
              <select
                name="state"
                value={shippingDetails.state}
                onChange={handleChange}
                disabled={!shippingDetails.country}
                required
              >
                <option value=""> </option>
                {shippingDetails.country &&
                  Object.keys(countryStateCity[shippingDetails.country]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
              </select>
              <label>State*</label>
            </div>

            <div className="form-group">
              <select
                name="city"
                value={shippingDetails.city}
                onChange={handleChange}
                disabled={!shippingDetails.state}
                required
              >
                <option value=""> </option>
                {shippingDetails.country &&
                  shippingDetails.state &&
                  countryStateCity[shippingDetails.country][
                    shippingDetails.state
                  ].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>
              <label>City*</label>
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="zip"
              value={shippingDetails.zip}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Postal Code*</label>
          </div>

          <h3>Shipping Method</h3>
          <div className="shipping-methods">
            {Object.keys(shippingRates).map((method) => (
              <label key={method}>
                <input
                  type="radio"
                  name="method"
                  value={method}
                  checked={shippingDetails.method === method}
                  onChange={handleChange}
                />
                <span>
                  {method.charAt(0).toUpperCase() + method.slice(1)}{" "}
                  {shippingRates[method] > 0
                    ? `- $${shippingRates[method]}`
                    : "(Free)"}
                </span>
              </label>
            ))}
          </div>

          <button className="btn-primary" onClick={handleContinue}>
            Continue to Checkout
          </button>
        </div>

        {/* 🟢 Right: Summary */}
        <div className="shipping-summary-card">
          <h2>Your Order</h2>

          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            cartItems.map((item, idx) => (
              <div className="order-item" key={idx}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                />
                <div className="item-info">
                  <p>{item.name}</p>
                  <p>Price: ${item.new_price?.toFixed(2)}</p>
                  <p>
                    Size: {item.size || "N/A"} | Qty: {item.qty || 0}
                  </p>
                </div>
              </div>
            ))
          )}

          <div className="order-summary">
            <p>
              Subtotal: <span>${subTotal.toFixed(2)}</span>
            </p>
            <p>
              Shipping: <span>${shippingCost.toFixed(2)}</span>
            </p>
            {discount > 0 && (
              <p className="discount-line">
                🎉 First Order Discount (20%):{" "}
                <span>- ${discount.toFixed(2)}</span>
              </p>
            )}
            <p className="grand-total-shipping">
              Grand Total: <span>${total.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;