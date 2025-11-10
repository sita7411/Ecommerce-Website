import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/MyAccount.css";

const API_BASE = "http://localhost:4000/api/user";

const MyAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    gender: "Female",
    dob: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    occupation: "",
    company: "",
    bio: "",
  });

  // ---------------- FETCH USER INFO ----------------
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setFormData((prev) => ({ ...prev, ...data }));
        } else {
          alert(data.message || "Failed to fetch user info");
        }
      } catch (err) {
        console.error(err);
        alert("Server connection error!");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // ---------------- HANDLE FORM CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- UPDATE PROFILE ----------------
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!user?._id) return;

    try {
      const res = await fetch(`${API_BASE}/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Profile updated successfully!");
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error!");
    }
  };

  // ---------------- UPDATE PASSWORD ----------------
  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword !== confirmPassword) {
      alert("⚠️ New passwords do not match!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!user?._id) return;

    try {
      const res = await fetch(`${API_BASE}/password/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🔐 Password updated successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.message || "Password update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error!");
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <p className="account-loading-text">Loading your account...</p>;
  if (!user) return <p className="account-loading-text">Please login to view your account.</p>;

  return (
    <div className="account-page-container">
      <div className="account-page-header">
        <h1>My Account</h1>
        <p>
          Welcome back, <strong>{formData.firstName || "User"}</strong> 👋
        </p>
      </div>

      <div className="account-layout">
        {/* Sidebar */}
        <aside className="account-sidebar-menu">
          <button
            className={activeTab === "personal" ? "active" : ""}
            onClick={() => setActiveTab("personal")}
          >
            👤 Personal Info
          </button>
          <button
            className={activeTab === "address" ? "active" : ""}
            onClick={() => setActiveTab("address")}
          >
            📍 Address Info
          </button>
          <button
            className={activeTab === "professional" ? "active" : ""}
            onClick={() => setActiveTab("professional")}
          >
            💼 Professional Info
          </button>
          <button
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            🔒 Password Manager
          </button>
          <button className="account-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </aside>

        {/* Main Section */}
        <div className="account-main-section">
          {/* PERSONAL INFO */}
          {activeTab === "personal" && (
            <form className="account-form">
              <div className="account-form-row">
                <div className="account-form-group">
                  <label>First Name *</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="account-form-group">
                  <label>Last Name *</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="account-form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} readOnly />
              </div>

              <div className="account-form-group">
                <label>Phone *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="account-form-row">
                <div className="account-form-group">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="account-form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob ? formData.dob.slice(0, 10) : ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="button" className="account-save-btn" onClick={handleSave}>
                💾 Update Changes
              </button>
            </form>
          )}

          {/* ADDRESS INFO */}
          {activeTab === "address" && (
            <form className="account-form">
              <h2>Address Information</h2>
              <div className="account-form-group">
                <label>Street Address *</label>
                <input name="address" value={formData.address} onChange={handleChange} />
              </div>

              <div className="account-form-row">
                <div className="account-form-group">
                  <label>City *</label>
                  <input name="city" value={formData.city} onChange={handleChange} />
                </div>
                <div className="account-form-group">
                  <label>State *</label>
                  <input name="state" value={formData.state} onChange={handleChange} />
                </div>
              </div>

              <div className="account-form-row">
                <div className="account-form-group">
                  <label>Country *</label>
                  <input name="country" value={formData.country} onChange={handleChange} />
                </div>
                <div className="account-form-group">
                  <label>ZIP Code *</label>
                  <input name="zip" value={formData.zip} onChange={handleChange} />
                </div>
              </div>

              <button type="button" className="account-save-btn" onClick={handleSave}>
                💾 Save Address
              </button>
            </form>
          )}

          {/* PROFESSIONAL INFO */}
          {activeTab === "professional" && (
            <form className="account-form">
              <h2>Professional Information</h2>

              <div className="account-form-row">
                <div className="account-form-group">
                  <label>Occupation *</label>
                  <input name="occupation" value={formData.occupation} onChange={handleChange} />
                </div>
                <div className="account-form-group">
                  <label>Company *</label>
                  <input name="company" value={formData.company} onChange={handleChange} />
                </div>
              </div>

              <div className="account-form-group">
                <label>About You / Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <button type="button" className="account-save-btn" onClick={handleSave}>
                💾 Save Professional Info
              </button>
            </form>
          )}

          {/* PASSWORD MANAGER */}
          {activeTab === "password" && (
            <form className="account-form">
              <h2>Password Manager</h2>

              <div className="account-form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
              </div>
              <div className="account-form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>
              <div className="account-form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>

              <button type="button" className="account-save-btn" onClick={handlePasswordChange}>
                🔐 Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
