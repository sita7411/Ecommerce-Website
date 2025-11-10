import React, { useEffect } from 'react';
import './Featurs.css';

const FeaturesList = [
  { icon: `${process.env.PUBLIC_URL}/images/safe.png`, title: 'Safe Transaction', description: 'Semper nascetur facilisis interdum' },
  { icon: `${process.env.PUBLIC_URL}/images/delivery.png`, title: 'Secure Delivery', description: 'Pulvinar rutrum dignissim mollis' },
  { icon: `${process.env.PUBLIC_URL}/images/help.png`, title: 'Exclusive Help', description: 'Sollicitudin vitae mi fringilla' },
  { icon: `${process.env.PUBLIC_URL}/images/price.png`, title: 'Affordable Price', description: 'Aliquam porta turpis primis suscipit' },
];


const Features = () => {
  useEffect(() => {
    const items = document.querySelectorAll(".feature-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-up");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((item) => observer.observe(item));
  }, []);

  return (
    <section className="features-section">
      <div className="features-wrapper">
        {FeaturesList.map((feature, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon">
              <img src={feature.icon} alt={feature.title} />
            </div>
            <div className="feature-text">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <hr className="features-hr" />
    </section>
  );
};

export default Features;
