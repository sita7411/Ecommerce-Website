import React from "react";
import { FaInstagram } from "react-icons/fa";
import "./InstagramFeed.css";



// Replace these URLs with your actual Instagram post images
const instaImages = [
  "/images/lifestyle.jpg",
  "/images/product_flatlay.jpg",
  "/images/behind_scenes.jpg",
  "/images/customer_ugc1.jpg",
  "/images/event_highlight.jpg",
];


const InstagramFeed = () => {
  return (
    <section className="instagram-section">
      <div className="instagram-title-container">
        <p className="instagram-pretitle">Follow Us</p>
        <h2 className="instagram-title">Follow Us On Instagram</h2>
      </div>
      <div className="instagram-grid">
        {instaImages.map((img, index) => (
          <a
            href="https://www.instagram.com/yourbrand"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-item"
            key={index}
          >
            <img src={img} alt={`Instagram ${index + 1}`} />
            <div className="instagram-overlay">
              <FaInstagram className="instagram-icon" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
