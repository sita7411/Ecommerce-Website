import React from "react";
import { FaLeaf, FaWind } from "react-icons/fa";
import "./ProductQuality.css";

const features = [
  {
    icon: <FaLeaf />,
    title: "100% Organic Cotton",
    description: "Crafted from premium organic cotton for unmatched comfort and sustainability."
  },
  {
    icon: <FaWind />,
    title: "Breathable & Lightweight",
    description: "Engineered for optimal airflow, keeping you cool and comfortable all day long."
  }
];

const ProductQuality = () => {
  return (
    <section className="product-quality">
      <div className="pq-container">
        <div className="pq-left">
          <img src={`${process.env.PUBLIC_URL}/images/product_quality.png`} alt="Product Quality" />
        </div>
        <div className="pq-right">
          <p className="pq-subtitle">Our Product Quality</p>
          <h2 className="pq-title">Designed for Comfort, Style, and Longevity</h2>
          <p className="pq-description">
            We focus on crafting premium clothing that balances style, comfort, and durability. Every piece is thoughtfully designed to enhance your everyday experience while respecting the environment.
          </p>
          <div className="pq-features">
            {features.map((item, index) => (
              <div className="pq-feature" key={index}>
                <div className="pq-icon">{item.icon}</div>
                <div className="pq-text">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductQuality;
