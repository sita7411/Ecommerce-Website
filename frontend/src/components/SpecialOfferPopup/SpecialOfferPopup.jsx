import React, { useState, useEffect } from "react";
import "./SpecialOfferPopup.css";

const SpecialOfferPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const claimed = localStorage.getItem("offerClaimed");
    if (!claimed) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 5000);
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email to claim the offer.");
      return;
    }

    try {
const res = await fetch(`${process.env.REACT_APP_API_URL}/api/offer/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("🎉 20% OFF Offer Claimed! Apply at Checkout.");
        localStorage.setItem("offerClaimed", "true");
        setIsOpen(false);
      } else {
        showToast(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error claiming offer. Try again.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="spec-overlay">
          <div className="spec-popup">
            <button className="spec-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
            <div className="spec-content">
              <div className="spec-left">
                <img
                  src={`${process.env.PUBLIC_URL}/images/product_quality.png`}
                  alt="Special Offer"
                />
              </div>
              <div className="spec-right">
                <h4 className="spec-subtitle">Special Offer</h4>
                <h2 className="spec-title">Get 20% Off Your First Order</h2>
                <p className="spec-text">
                  Enter your email below and claim your exclusive discount.
                </p>
                <form onSubmit={handleClaim}>
                  <div className="spec-form">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit">Claim Offer</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="spec-toast">{toast}</div>}
    </>
  );
};

export default SpecialOfferPopup;
