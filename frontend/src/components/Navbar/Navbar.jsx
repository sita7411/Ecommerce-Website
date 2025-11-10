import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { FaUser } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [menu, setMenu] = useState("shop");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(`${process.env.PUBLIC_URL}/images/logoo.png`);

  const { cart = {}, wishlist = {}, user, logout } = useContext(ShopContext);

  // Highlight active menu
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setMenu("shop");
    else if (path === '/mens') setMenu("mens");
    else if (path === '/womens') setMenu("womens");
    else if (path === '/kids') setMenu("kids");
  }, [location.pathname]);

  // Fetch logo from backend
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/logo`);
        const data = await res.json();
        if (data.success && data.logo) setLogoUrl(data.logo.url);
      } catch (err) {
        console.error("Error fetching logo:", err);
      }
    };
    fetchLogo();
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Count totals
  const cartCount = Object.values(cart).reduce((sum, item) => sum + (item?.qty || 0), 0);
  const wishlistCount = Object.values(wishlist).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-user')) setDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      {/* Logo */}
      <div className="nav-logo">
        <Link to="/">
          <img src={logoUrl} alt="logo" />
        </Link>
      </div>

      {/* Menu */}
      <ul className="nav-menu">
        <li className={menu === "shop" ? "active" : ""}>
          <Link to="/">Shop</Link>
          {menu === "shop" && <hr />}
        </li>
        <li className={menu === "mens" ? "active" : ""}>
          <Link to="/mens">Men</Link>
          {menu === "mens" && <hr />}
        </li>
        <li className={menu === "womens" ? "active" : ""}>
          <Link to="/womens">Women</Link>
          {menu === "womens" && <hr />}
        </li>
        <li className={menu === "kids" ? "active" : ""}>
          <Link to="/kids">Kids</Link>
          {menu === "kids" && <hr />}
        </li>
      </ul>

      {/* User / Wishlist / Cart */}
      <div className="nav-login-cart">
        {user ? (
          <div className="nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="user-icon-circle"><FaUser /></div>
            {dropdownOpen && (
              <div className="user-dropdown">
                <p className="welcome">
                  Welcome, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <Link to="/my-account">My Account</Link>
                <Link to="/my-orders">My Orders</Link>
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/loginsignup">
            <button>Login / Signup</button>
          </Link>
        )}

        <div className="wishlist-container">
          <Link to="/wishlist">
            <img
              src={`${process.env.PUBLIC_URL}/images/wishlist_icon.png`}
              alt="wishlist_icon"
            />
            <div className="nav-wishlist-count">{wishlistCount}</div>
          </Link>
        </div>

        <div className="cart-container">
          <Link to="/cart">
            <img
              src={`${process.env.PUBLIC_URL}/images/cart_icon.png`}
              alt="cart_icon"
            />
            <div className="nav-cart-count">{cartCount}</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
