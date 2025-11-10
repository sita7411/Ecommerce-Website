import React from 'react';
import './Offer.css';

const Offer = () => {
  return (
    <section className="offer-banner">
      <div className="offer-container">
        <div className="offer-content">
          {/* Left Content */}
          <div className="offer-left">
            <h1>
              Exclusive <span>Deals</span>
            </h1>
            <h2>Special Offers Just for You</h2>
            <p>
              Unlock unbeatable discounts on our best-selling products. Hurry up, these offers are valid for a limited time only!
            </p>
            <button>Check Now</button>
          </div>

          {/* Right Content */}
          <div className="offer-right">
            <img src={`${process.env.PUBLIC_URL}/images/offer_img.png`} alt="Exclusive Offer" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offer;
