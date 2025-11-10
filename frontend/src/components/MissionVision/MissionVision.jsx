import React from "react";
import { FaBullseye, FaEye } from "react-icons/fa";
import "./MissionVision.css";

const MissionVision = () => {
  return (
    <section className="mv-cards-section">
      <div className="mv-cards-container">
        {/* Mission Card */}
        <div className="mv-card mv-card-left">
          <div className="mv-icon-circle">
            <FaBullseye />
          </div>
          <h3>Our Mission</h3>
          <p>
            Stylish, high-quality, and sustainable clothing while empowering local artisans and communities.
          </p>
        </div>

        {/* Vision Card */}
        <div className="mv-card mv-card-right">
          <div className="mv-icon-circle">
            <FaEye />
          </div>
          <h3>Our Vision</h3>
          <p>
            To be a globally recognized clothing brand known for quality, sustainability, and customer-centric designs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
