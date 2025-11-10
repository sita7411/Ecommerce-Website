import React, { useState } from "react";
import "./FAQ.css";

const faqData = {
  "General Information": [
    { question: "How can I place an order?", answer: "You can place an order by adding items to your cart and checking out." },
    { question: "What payment methods do you accept?", answer: "We accept Credit Cards, Debit Cards, PayPal, and Net Banking." },
    { question: "Can I track my order after it’s been placed?", answer: "Yes, you will receive a tracking link once your order is shipped." },
    { question: "Do you offer customer support?", answer: "Yes, you can contact us via email or phone for support." },
  ],
  "Ordering & Shipping": [
    { question: "What is the shipping time?", answer: "Orders are usually delivered within 3–7 business days." },
    { question: "Do you ship internationally?", answer: "Yes, we offer worldwide shipping with additional charges." },
  ],
  "Returns & Exchanges": [
    { question: "What is your return policy?", answer: "You can return items within 30 days of purchase." },
    { question: "Do you offer exchanges?", answer: "Yes, exchanges are available for size and defective items." },
  ],
  "Payments & Discounts": [
    { question: "Do you offer discounts?", answer: "Yes, seasonal and promotional discounts are available." },
    { question: "Can I use multiple discount codes?", answer: "No, only one discount code can be applied per order." },
  ],
  "Account & Profile": [
    { question: "How to Create Account?", answer: "Click on the 'Sign Up' button and enter your details." },
    { question: "Can I delete my account?", answer: "Yes, please contact support to delete your account." },
  ],
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("General Information");
  const [openIndex, setOpenIndex] = useState(null);

  const handleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-wrapper">
      {/* Banner */}
      <div className="faq-banner">
        <h1>Frequently Asked Questions</h1>
        <p>
          <a href="/">Home</a> / <span>FAQ</span>
        </p>
      </div>

      {/* FAQ Content */}
      <div className="faq-container">
        {/* Sidebar */}
        <div className="faq-sidebar">
          {Object.keys(faqData).map((category) => (
            <button
              key={category}
              className={`faq-tab ${activeCategory === category ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(category);
                setOpenIndex(null); // close all accordions when switching tabs
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="faq-content">
          <h2>{activeCategory}</h2>
          <div className="faq-list">
            {faqData[activeCategory].map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
              >
                <div
                  className="faq-question"
                  onClick={() => handleAccordion(index)}
                >
                  <span>{item.question}</span>
                  <span>{openIndex === index ? "−" : "+"}</span>
                </div>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
