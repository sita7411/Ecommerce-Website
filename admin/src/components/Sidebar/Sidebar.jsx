import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiImage,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiChevronDown,
  FiGlobe,
  FiEye,
  FiTrendingUp,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  // Detect which dropdown should be open based on current path
  useEffect(() => {
    if (location.pathname.startsWith("/admin/products"))
      setOpenMenu("products");
    else if (location.pathname.startsWith("/admin/marketing"))
      setOpenMenu("marketing");
    else if (location.pathname.startsWith("/admin/visibility"))
      setOpenMenu("visibility");
    else if (location.pathname.startsWith("/admin/website"))
      setOpenMenu("websiteManagement");
    else setOpenMenu(null);
  }, [location.pathname]);

  const handleToggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    logout(); // Clears admin context & localStorage
    navigate("/admin/login"); // Redirect to login page
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
      </div>

      <ul className="sidebar-menu">
        <SidebarItem
          to="/admin/dashboard"
          icon={<FiGrid />}
          label="Dashboard"
          isActive={
            location.pathname === "/admin/dashboard" &&
            openMenu === null
          }
        />

        <SidebarDropdown
          icon={<FiBox />}
          label="Products"
          menu="products"
          open={openMenu === "products"}
          onClick={() => handleToggle("products")}
          items={[
            { label: "All Products", to: "/admin/products" },
            { label: "Add Product", to: "/admin/products/add" },
            { label: "Inventory", to: "/admin/products/inventory" },
          ]}
        />

        <SidebarItem
          to="/admin/orders"
          icon={<FiShoppingCart />}
          label="Orders"
          isActive={location.pathname.startsWith("/admin/orders")}
        />
        <SidebarItem
          to="/admin/returns"
          icon={<FiTrendingUp />}  // You can choose another icon if you like
          label="Returns"
          isActive={location.pathname.startsWith("/admin/returns")}
        />

        <SidebarItem
          to="/admin/customers"
          icon={<FiUsers />}
          label="Customers"
          isActive={location.pathname.startsWith("/admin/customers")}
        />

        <SidebarDropdown
          icon={<FiGlobe />}
          label="Website Management"
          menu="websiteManagement"
          open={openMenu === "websiteManagement"}
          onClick={() => handleToggle("websiteManagement")}
          items={[
            { label: "Change Logo", to: "/admin/website/logo" },
            { label: "Hero Banner", to: "/admin/website/hero-banner" },
            { label: "Category Banner", to: "/admin/website/category-banner" },
          ]}
        />

        <SidebarDropdown
          icon={<FiEye />}
          label="Product Visibility"
          menu="visibility"
          open={openMenu === "visibility"}
          onClick={() => handleToggle("visibility")}
          items={[
            { label: "Popular Products", to: "/admin/visibility/popular" },
            { label: "New Collections", to: "/admin/visibility/newcollections" },
          ]}
        />

<SidebarDropdown
  icon={<FiSettings />}
  label="Settings"
  menu="settings"
  open={openMenu === "settings"}
  onClick={() => handleToggle("settings")}
  items={[
    { label: "Contact Page", to: "/admin/settings/contact" },
  ]}
/>


      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

// SidebarItem component
const SidebarItem = ({ to, icon, label, isActive }) => (
  <li>
    <NavLink to={to} className={`sidebar-item ${isActive ? "active" : ""}`}>
      <span className="sidebar-icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  </li>
);

// SidebarDropdown component
const SidebarDropdown = ({ icon, label, items, open, onClick }) => {
  const location = useLocation();
  const isActive = items.some((item) =>
    location.pathname.startsWith(item.to)
  );

  return (
    <li className="sidebar-dropdown">
      <button
        onClick={onClick}
        className={`sidebar-dropdown-header ${open || isActive ? "open" : ""}`}
      >
        <span className="flex items-center gap-3">
          <span className="sidebar-icon">{icon}</span>
          {label}
        </span>
        {open || isActive ? <FiChevronDown /> : <FiChevronRight />}
      </button>

      <div className={`sidebar-dropdown-items ${open ? "show" : ""}`}>
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-dropdown-item ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </li>
  );
};

export default Sidebar;
