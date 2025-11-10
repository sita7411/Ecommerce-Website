import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Column 1 - Logo/About */}
        <div>
          <div className="footer-logo">
            <Link to='/'>
              <img src={`${process.env.PUBLIC_URL}/images/logoo.png`} alt="logo" />
            </Link>
          </div>
          <p className="footer-about">
            Shopper brings you the latest fashion trends with premium quality at affordable prices.
            Style made simple for everyone.
          </p>
          <div className="footer-social-icon">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-icon-container">
              <img src={`${process.env.PUBLIC_URL}/images/instagram_icon.png`} alt="Instagram" />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="footer-icon-container">
              <img src={`${process.env.PUBLIC_URL}/images/pinterest_icon.png`} alt="Pinterest" />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="footer-icon-container">
              <img src={`${process.env.PUBLIC_URL}/images/whatsapp_icon.png`} alt="WhatsApp" />
            </a>
          </div>
        </div>

        {/* Column 2 - Company */}
        <div>
          <h3 className="footer-title">Company</h3>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
          </ul>
        </div>

        {/* Column 3 - Support */}
        <div>
          <h3 className="footer-title">Support</h3>
          <ul className="footer-links">
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
          </ul>
        </div>

        {/* Column 4 - Newsletter */}
        <div className="footer-newsletter">
          <h3 className="footer-title">Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest collections and offers.</p>
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Shopper — All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
