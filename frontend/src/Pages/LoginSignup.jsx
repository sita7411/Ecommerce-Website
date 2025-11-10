// LoginSignup.js
import React, { useState, useEffect, useContext } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaVenusMars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import "./CSS/LoginSignup.css";
const API_BASE = process.env.REACT_APP_API_URL;

const LoginSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useContext(ShopContext);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Female",
    password: "",
  });

  // Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const firstName = params.get("firstName");
    const lastName = params.get("lastName");
    const email = params.get("email");
    const phone = params.get("phone");
    const gender = params.get("gender");

    if (token) {
      const userData = { firstName, lastName, email, phone, gender };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setToken(token);
      navigate("/");
    }
  }, [location, navigate, setUser, setToken]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- PASSWORD LOGIN/SIGNUP ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const url = isLogin
      ? `${API_BASE}/api/auth/login"
      : `${API_BASE}/api/auth/register";

    const payload = isLogin
      ? { email: formData.email.trim(), password: formData.password.trim() }
      : {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          phone: formData.phone.trim(),
          gender: formData.gender,
        };

    // Prevent empty fields
    if (isLogin && (!payload.email || !payload.password)) {
      setMessage("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setToken(data.token);
        setMessage(`${isLogin ? "Login" : "Signup"} successful!`);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "Female",
          password: "",
        });
        navigate("/");
      } else {
        setMessage(data.message || "Server returned an error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="loginsignup">
      <div className="loginsignup-left">
        <img
          src={`${process.env.PUBLIC_URL}/images/shopping-illustration.png`}
          alt="Shooper"
          className="brand-image"
        />
        <h2>
          Welcome to <span>SHOOPER</span> 🛒
        </h2>
        <p>Shop smarter — exclusive deals, quick checkout, personalized experience.</p>
      </div>

      <div className="loginsignup-container">
        <h1>{isLogin ? "Login to Your Account" : "Create Your Account"}</h1>
        {message && <p className="message">{message}</p>}

        <form className="loginsignup-fields" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-box">
                <FaUser className="icon" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaUser className="icon" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaPhone className="icon" />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="input-box">
                <FaVenusMars className="icon" />
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="input-box">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-box">
            <FaLock className="icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="button-row">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Sign Up"}
            </button>
          </div>
        </form>

       

        <p className="loginsignup-login">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
 
