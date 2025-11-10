import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/Contact.css";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  const [contactData, setContactData] = useState({
    bannerTitle: "",
    bannerSubtitle: "",
    phone: "",
    email: "",
    address: "",
    mapSrc: "",
  });

  // 🧠 Fetch contact data from Node.js API
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/contact")
      .then((res) => {
        setContactData(res.data);
      })
      .catch((err) => {
        console.error("❌ Error fetching contact data:", err);
      });
  }, []);

  return (
    <div className="contact-page">
      {/* 🌈 Modern Hero Banner */}
      <section className="contact-modern-banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1>{contactData.bannerTitle || "Get in Touch"}</h1>
          <p>
            {contactData.bannerSubtitle ||
              "We’d love to hear from you — let’s start a conversation!"}
          </p>
        </div>
      </section>

      {/* 📞 Contact Cards */}
      <section className="contact-info-section">
        <div className="contact-card">
          <div className="contact-icon">
            <FaPhoneAlt />
          </div>
          <h3>Customer Support</h3>
          <p>Need help with your order or have questions?</p>
          <a href={`tel:${contactData.phone}`}>{contactData.phone}</a>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <FaEnvelope />
          </div>
          <h3>Email Us</h3>
          <p>Reach out anytime - we respond within 24 hours.</p>
          <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <FaMapMarkerAlt />
          </div>
          <h3>Visit Us</h3>
          <p>{contactData.address}</p>
        </div>
      </section>

      {/* 📨 Contact Form */}
      <section className="contact-form-section">
        <div className="form-container">
          <h2>Send Us a Message</h2>
          <p>Our team will get back to you shortly!</p>
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
            </div>
            <textarea rows="5" placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>

      {/* 🗺️ Map */}
      <div className="contact-map">
        {contactData.mapSrc ? (
          <iframe
            title="Google Map"
            src={contactData.mapSrc}
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            Loading map...
          </p>
        )}
      </div>
    </div>
  );
};

export default Contact;
