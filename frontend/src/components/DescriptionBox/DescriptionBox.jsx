import React, { useState } from "react";
import "./DescriptionBox.css";

const DescriptionBox = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [reviews] = useState([]); // only reading reviews

  // Render stars
  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div className="descriptionbox">
      {/* Tabs */}
      <div className="tabs">
        <span
          className={activeTab === "description" ? "active" : ""}
          onClick={() => setActiveTab("description")}
        >
          Description
        </span>
        <span
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({reviews.length})
        </span>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === "description" ? (
          <>
            <p>{product?.description || "No description available."}</p>
            <p>
              <strong>Material:</strong> {product?.material || "N/A"}<br />
              <strong>Sizes:</strong> {product?.sizes?.join(", ") || "N/A"}<br />
              <strong>Colors:</strong> {product?.colors?.join(", ") || "N/A"}
            </p>
          </>
        ) : (
          <div className="reviews-wrapper">
            {reviews.length === 0 ? (
              <p>No reviews yet for this product.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-name">{review.user || review.name}</div>
                    <div className="review-date">{review.date || "N/A"}</div>
                  </div>
                  <div className="review-stars">{renderStars(review.rating || 0)}</div>
                  <p className="review-text">{review.comment || review.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionBox;
