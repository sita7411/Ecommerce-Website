import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import {
  FiBell,
  FiUser,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiTrash2,
  FiShoppingBag,
  FiPlus,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

// Utility: time ago
const getTimeDifference = (dateString) => {
  if (!dateString) return "just now";
  const now = new Date();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "just now";

  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "yesterday";
  return `${diffDay} days ago`;
};

const Navbar = () => {
  const navigate = useNavigate();
  const { setAdmin, setToken } = useAdminAuth();
  const { notifications, deleteOne } = useNotifications();

  const [localAdmin, setLocalAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    const token = localStorage.getItem("adminToken");
    if (!storedAdmin || !token) {
      navigate("/admin/login");
    } else {
      setLocalAdmin(JSON.parse(storedAdmin));
    }
  }, [navigate]);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setNotifOpen(false);
        setAddOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    setAdmin(null);
    setToken("");
    navigate("/admin/login");
  };

  if (!localAdmin) return null;

  const avatarSrc = localAdmin?.avatar || "/admin-avatar.jpg";

  const handleNotificationClick = (notif) => {
    if (notif.orderId) {
      navigate(`/admin/orders/${notif.orderId}`);
      setNotifOpen(false);
    }
  };

  return (
    <nav className="navbar" ref={dropdownRef}>
      {/* Center (empty) */}
      <div className="navbar-center"></div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Add Dropdown (+) */}
        <div className="dropdown-wrapper">
          <button
            className="icon-btn"
            onClick={() => {
              setAddOpen(!addOpen);
              setNotifOpen(false);
              setDropdownOpen(false);
            }}
            title="Add New"
          >
            <FiPlus />
          </button>

          {addOpen && (
            <div className="dropdown-menu">
              <ul>
                <li
                  onClick={() => {
                    navigate("/admin/products/add");
                    setAddOpen(false);
                  }}
                >
                  Add Product
                </li>
                <li
                  onClick={() => {
                    navigate("/admin/customers");
                    setAddOpen(false);
                  }}
                >
                  Customers
                </li>
                <li
                  onClick={() => {
                    navigate("/admin/orders");
                    setAddOpen(false);
                  }}
                >
                  Orders
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="dropdown-wrapper">
          <button
            className="icon-btn"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setAddOpen(false);
              setDropdownOpen(false);
            }}
          >
            <FiBell />
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </button>

          {notifOpen && (
            <div className="dropdown-menu notification-menu">
              <ul className="custom-scrollbar">
                {notifications.length === 0 ? (
                  <li className="empty">No notifications</li>
                ) : (
                  notifications.map((n) => (
                    <li key={n._id} onClick={() => handleNotificationClick(n)}>
                      <div className="notif-icon">
                        <FiShoppingBag />
                      </div>
                      <div className="notif-text">
                        <p>

                          {n.message || "placed an order"}!
                        </p>
                        <div className="notif-meta">
                          <span className="notif-type bg-gradient">
                            {n.type || "Order"}
                          </span>
                          <span>{getTimeDifference(n.date || n.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        className="notif-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOne(n._id);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  ))
                )}
              </ul>
              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button onClick={() => navigate("/admin/notifications")}>
                    Show all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown-wrapper">
          <div
            className="navbar-profile"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
              setAddOpen(false);
            }}
          >
            <img src={avatarSrc} alt="Admin Avatar" className="profile-img" />
            <span className="profile-name">
              {localAdmin?.name || localAdmin?.email?.split("@")[0]}
            </span>
            <FiChevronDown />
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li
                  onClick={() => {
                    navigate("/admin/account");
                    setDropdownOpen(false);
                  }}
                >
                  <FiUser /> My Profile
                </li>
                <li>
                  <FiSettings /> Settings
                </li>
                <li onClick={handleLogout}>
                  <FiLogOut /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
