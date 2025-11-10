import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { FaCreditCard, FaGooglePay, FaMoneyBillWave } from "react-icons/fa";
import "../Pages/CSS/CheckoutPage.css";
const API_BASE = process.env.REACT_APP_API_URL;


// Country → State → City mapping
const countryStateCity = {
  India: { Gujarat: ["Ahmedabad", "Surat"], Maharashtra: ["Mumbai", "Pune"] },
  USA: { California: ["Los Angeles", "San Francisco"], Texas: ["Houston", "Dallas"] },
};

// Shipping cost options
const shippingRates = { standard: 0, express: 5, priority: 10 };

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { allCartProducts, setCart, token } = useContext(ShopContext);

  // ✅ Filter valid cart items
  const cartItems = useMemo(() => {
    const items = Array.isArray(allCartProducts) ? allCartProducts : [];
    return items.filter(
      (item) =>
        item._id &&
        Number.isFinite(item.new_price) &&
        Number.isFinite(item.qty) &&
        item.new_price > 0 &&
        item.qty > 0 &&
        item.name
    );
  }, [allCartProducts]);

  // Load shipping details
  const savedShipping = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("shippingDetails")) || {};
    } catch {
      return {};
    }
  }, []);

  const [billingOption, setBillingOption] = useState("same");
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    city: "",
    address: "",
    zip: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const [toast, setToast] = useState({ show: false, message: "" });
  const [processing, setProcessing] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false); // ✅ track first order

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // ✅ Fetch if user has placed any order
  useEffect(() => {
    const checkFirstOrder = async () => {
      try {
const response = await fetch(`${API_BASE}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (Array.isArray(data.orders) && data.orders.length === 0) {
          setIsFirstOrder(true); // ✅ New user → eligible for 20% off
        } else {
          setIsFirstOrder(false);
        }
      } catch (err) {
        console.error("Error checking first order:", err);
      }
    };
    if (token) checkFirstOrder();
  }, [token]);

  // ✅ Sync billing with shipping
  useEffect(() => {
    if (billingOption === "same") {
      setBillingDetails((prev) => ({
        ...prev,
        ...savedShipping,
      }));
    } else {
      setBillingDetails({
        firstName: "",
        lastName: "",
        country: "",
        state: "",
        city: "",
        address: "",
        zip: "",
        phone: "",
      });
    }
  }, [billingOption, savedShipping]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => {
      let updated = {
        ...prev,
        [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
      };
      if (name === "country") updated.state = updated.city = "";
      if (name === "state") updated.city = "";
      return updated;
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Price calculations
  const subTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.new_price || 0) * (i.qty || 0), 0),
    [cartItems]
  );

  const shippingCost = useMemo(
    () => shippingRates[savedShipping.method] || 0,
    [savedShipping.method]
  );

  const savedDiscount = useMemo(() => {
    if (isFirstOrder) {
      return subTotal * 0.2; // 20% discount for first order
    }
    return 0;
  }, [subTotal, isFirstOrder]);

  const total = useMemo(
    () => subTotal + shippingCost - savedDiscount,
    [subTotal, shippingCost, savedDiscount]
  );

  const handlePlaceOrder = async () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "country",
      "state",
      "city",
      "address",
      "zip",
      "phone",
    ];

    if (requiredFields.some((f) => !billingDetails[f]?.trim())) {
      showToast("Please fill all billing details");
      return;
    }

    if (!/^\d{10}$/.test(billingDetails.phone)) {
      showToast("Phone must be 10 digits");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Cart is empty");
      return;
    }

    if (!token) {
      showToast("Please log in to continue");
      navigate("/login");
      return;
    }

    if (paymentMethod === "card") {
      const { cardNumber, expiry, cvv } = paymentDetails;
      if (!/^\d{16}$/.test(cardNumber) || !expiry || !/^\d{3,4}$/.test(cvv)) {
        showToast("Enter valid card details");
        return;
      }
    } else if (paymentMethod === "upi" && !paymentDetails.upiId) {
      showToast("Enter UPI ID");
      return;
    }

    setProcessing(true);

    try {
      const shippingAddress = {
        fullName: `${billingDetails.firstName} ${billingDetails.lastName}`,
        phone: billingDetails.phone,
        address: billingDetails.address,
        city: billingDetails.city,
        state: billingDetails.state,
        pincode: billingDetails.zip,
      };

      const backendPaymentMethod =
        paymentMethod === "card" ? "ONLINE" : paymentMethod === "upi" ? "UPI" : "COD";

      const orderPayload = {
        shippingAddress,
        paymentMethod: backendPaymentMethod,
        totalAmount: total,
        shippingPrice: shippingCost,
        discount: savedDiscount,
        items: cartItems.map((item) => ({
          productId: item._id,
          qty: Number(item.qty),
          size: item.size || "",
          price: Number(item.new_price),
          name: item.name,
          image: item.images?.[0] || item.image || "",
        })),
      };

const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) throw new Error("Failed to place order");

      const data = await response.json();
      showToast("Order placed successfully!");
      setCart([]);
      localStorage.setItem("firstOrderUsed", "true");
      navigate("/order-completed", { state: { order: data.order } });
    } catch (error) {
      console.error("Order placement error:", error);
      showToast(error.message || "Error placing order");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-modern-banner">
        <h1>Checkout</h1>
      </div>

      {toast.show && <div className="toast-notification show">{toast.message}</div>}

      {processing ? (
        <div className="processing-overlay">
          <h2>Processing your order...</h2>
        </div>
      ) : (
        <div className="checkout-modern-main">
          {/* LEFT SIDE */}
          <div className="checkout-modern-left">
            <section className="card-section">
              <h2>Billing Address</h2>
              <div className="billing-toggle">
                <button
                  className={billingOption === "same" ? "active" : ""}
                  onClick={() => setBillingOption("same")}
                >
                  Same as Shipping
                </button>
                <button
                  className={billingOption === "different" ? "active" : ""}
                  onClick={() => setBillingOption("different")}
                >
                  Use Different Address
                </button>
              </div>

              {/* Billing form */}
              <div className="billing-form">
                <div className="name-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="firstName"
                      value={billingDetails.firstName}
                      onChange={handleBillingChange}
                      placeholder=" "
                    />
                    <label>First Name*</label>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="lastName"
                      value={billingDetails.lastName}
                      onChange={handleBillingChange}
                      placeholder=" "
                    />
                    <label>Last Name*</label>
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="phone"
                    value={billingDetails.phone}
                    onChange={handleBillingChange}
                    placeholder=" "
                  />
                  <label>Phone Number*</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="address"
                    value={billingDetails.address}
                    onChange={handleBillingChange}
                    placeholder=" "
                  />
                  <label>Street Address*</label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <select
                      name="country"
                      value={billingDetails.country}
                      onChange={handleBillingChange}
                    >
                      <option value="">Select Country</option>
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
                      value={billingDetails.state}
                      onChange={handleBillingChange}
                      disabled={!billingDetails.country}
                    >
                      <option value="">Select State</option>
                      {billingDetails.country &&
                        Object.keys(countryStateCity[billingDetails.country]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>
                    <label>State*</label>
                  </div>

                  <div className="form-group">
                    <select
                      name="city"
                      value={billingDetails.city}
                      onChange={handleBillingChange}
                      disabled={!billingDetails.state}
                    >
                      <option value="">Select City</option>
                      {billingDetails.country &&
                        billingDetails.state &&
                        countryStateCity[billingDetails.country][billingDetails.state].map(
                          (city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          )
                        )}
                    </select>
                    <label>City*</label>
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="zip"
                    value={billingDetails.zip}
                    onChange={handleBillingChange}
                    placeholder=" "
                  />
                  <label>Postal Code*</label>
                </div>
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="card-section">
              <h2>Payment Method</h2>
              <div className="payment-toggle">
                <button
                  className={paymentMethod === "card" ? "active" : ""}
                  onClick={() => setPaymentMethod("card")}
                >
                  <FaCreditCard /> Card
                </button>
                <button
                  className={paymentMethod === "upi" ? "active" : ""}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <FaGooglePay /> UPI
                </button>
                <button
                  className={paymentMethod === "cod" ? "active" : ""}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <FaMoneyBillWave /> COD
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="payment-card">
                  <div className="form-group">
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder=" "
                      maxLength={16}
                    />
                    <label>Card Number*</label>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        name="expiry"
                        value={paymentDetails.expiry}
                        onChange={(e) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            expiry: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        placeholder="MMYY"
                        maxLength={4}
                      />
                      <label>Expiry (MM/YY)*</label>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={(e) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        placeholder=" "
                        maxLength={4}
                      />
                      <label>CVV*</label>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="form-group with-icon">
                  <input
                    type="text"
                    name="upiId"
                    value={paymentDetails.upiId}
                    onChange={handlePaymentChange}
                    placeholder=" "
                  />
                  <label>UPI ID*</label>
                  <img src="/assets/upi_icon.png" alt="UPI" className="input-icon" />
                </div>
              )}

              {paymentMethod === "cod" && (
                <p className="cod-info">You will pay with cash on delivery</p>
              )}
            </section>

            <button
              className="btn-primary"
              onClick={handlePlaceOrder}
              disabled={processing}
            >
              Place Order
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="checkout-modern-right">
            <section className="card-section">
              <h2>Order Summary</h2>
              {cartItems.length === 0 ? (
                <p>Cart is empty</p>
              ) : (
                cartItems.map((i) => (
                  <div className="order-item" key={i._id}>
                    <img
                      src={i.images?.[0] || i.image || "/assets/placeholder.png"}
                      alt={i.name || "Product"}
                    />
                    <div className="item-info">
                      <p>{i.name}</p>
                      <p>Price: ${(i.new_price || 0).toFixed(2)}</p>
                      <p>
                        Qty: {i.qty || 1} | Size: {i.size || "N/A"} | Color:{" "}
                        {i.color || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="order-summary">
                <p>Subtotal: <span>${subTotal.toFixed(2)}</span></p>
                <p>Shipping: <span>${shippingCost.toFixed(2)}</span></p>

                {savedDiscount > 0 && (
                  <p className="discount-line">
                    🎉 First Order Discount (20%): <span>- ${savedDiscount.toFixed(2)}</span>
                  </p>
                )}

                <p className="grand-total">
                  Total: <span>${total.toFixed(2)}</span>
                </p>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
