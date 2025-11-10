import React from "react";
import "./OurStory.css";
import { FaAward, FaUsers, FaStore, FaSmile, FaClock } from "react-icons/fa";

const OurStory = () => {
  return (
    <section className="our-story">
      {/* Text Content */}
      <div className="our-story-header">
        <h4 className="sub-title">Our Journey</h4>
        <h2 className="main-title">
          Redefining Shopping <br /> with Trust & Quality
        </h2>
        <p className="description">
          Since day one, our mission has been simple - bring customers closer to
          products they love, with unmatched quality and service. From sourcing
          premium collections to ensuring a seamless shopping experience, we are
          proud to serve a growing community of loyal customers worldwide.
        </p>

        <div className="signature">
          <p className="name">Jenny Alexander</p>
          <p className="role">Founder & CEO</p>
        </div>
      </div>

      {/* Unique Image Layout */}
      <div className="our-story-images">
        <div className="img-large">
          <img src={`${process.env.PUBLIC_URL}/images/about-main-img.png`} alt="Premium Collections" />
        </div>
        <div className="img-stack">
          <img src={`${process.env.PUBLIC_URL}/images/about-small-img1.png`} alt="Customer Experience" />
          <img src={`${process.env.PUBLIC_URL}/images/about-small-img2.png`} alt="Quality Products" />
        </div>
      </div>

      {/* Stats Band */}
      <div className="our-story-stats">
        <div className="stat-item">
          <div className="icon-circle"><FaClock /></div>
          <h3>10+</h3>
          <p>Years in E-commerce</p>
        </div>
        <div className="stat-item">
          <div className="icon-circle"><FaStore /></div>
          <h3>180+</h3>
          <p>Partner Brands</p>
        </div>
        <div className="stat-item">
          <div className="icon-circle"><FaUsers /></div>
          <h3>100k+</h3>
          <p>Happy Shoppers</p>
        </div>
        <div className="stat-item">
          <div className="icon-circle"><FaAward /></div>
          <h3>35+</h3>
          <p>Industry Awards</p>
        </div>
        <div className="stat-item">
          <div className="icon-circle"><FaSmile /></div>
          <h3>98%</h3>
          <p>Customer Satisfaction</p>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
