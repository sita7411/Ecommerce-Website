import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext";
import { NotificationsProvider } from "./context/NotificationsContext"; // ✅ import provider
import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import AllProducts from "./pages/products/AllProducts";
import AddProduct from "./pages/products/AddProduct";
import Inventory from "./pages/products/Inventory";
import ChangeLogo from "./pages/website/ChangeLogo";
import HeroBannerPage from "./pages/website/HeroBannerPage";
import CategoryBannerPage from "./pages/website/CategoryBannerPage";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import PopularProducts from "./pages/visibility/PopularProducts";
import NewCollections from "./pages/visibility/NewCollections";
import MyAccount from "./pages/MyAccount";
import Notifications from "./pages/Notifications";
import Returns from "./pages/Returns";
import AdminContactSettings from "./pages/settings/AdminContactSettings";

function App() {
  const { admin, loading } = useAdminAuth();

  if (loading) return <div>Loading...</div>; // prevent flicker

  return (
    <NotificationsProvider> {/* ✅ Wrap with provider */}
      <Routes>
        {/* ---------------- Login ---------------- */}
        <Route
          path="/admin/login"
          element={!admin ? <AdminLogin /> : <Navigate to="/admin/dashboard" />}
        />

        {/* ---------------- Dashboard ---------------- */}
        <Route
          path="/admin/dashboard"
          element={
            admin ? (
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- Products ---------------- */}
        <Route
          path="/admin/products"
          element={
            admin ? (
              <AdminLayout>
                <AllProducts />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/products/add"
          element={
            admin ? (
              <AdminLayout>
                <AddProduct />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/products/inventory"
          element={
            admin ? (
              <AdminLayout>
                <Inventory />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- Orders & Customers ---------------- */}
        <Route
          path="/admin/orders"
          element={
            admin ? (
              <AdminLayout>
                <Orders />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/customers"
          element={
            admin ? (
              <AdminLayout>
                <Customers />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- Website ---------------- */}
        <Route
          path="/admin/website/logo"
          element={
            admin ? (
              <AdminLayout>
                <ChangeLogo />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/website/hero-banner"
          element={
            admin ? (
              <AdminLayout>
                <HeroBannerPage />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/website/category-banner"
          element={
            admin ? (
              <AdminLayout>
                <CategoryBannerPage />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- Product Visibility ---------------- */}
        <Route
          path="/admin/visibility/popular"
          element={
            admin ? (
              <AdminLayout>
                <PopularProducts />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/visibility/newcollections"
          element={
            admin ? (
              <AdminLayout>
                <NewCollections />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- My Account ---------------- */}
        <Route
          path="/admin/account"
          element={
            admin ? (
              <AdminLayout>
                <MyAccount />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        <Route
          path="/admin/orders/:orderId"
          element={
            admin ? (
              <AdminLayout>
                <Orders />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- Notifications ---------------- */}
        <Route
          path="/admin/notifications"
          element={
            admin ? (
              <AdminLayout>
                <Notifications />
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* ---------------- Returns ---------------- */}
<Route
  path="/admin/returns"
  element={
    admin ? (
      <AdminLayout>
        <Returns />
      </AdminLayout>
    ) : (
      <Navigate to="/admin/login" />
    )
  }
/>

{/* ---------------- Settings ---------------- */}
<Route
  path="/admin/settings/contact"
  element={
    admin ? (
      <AdminLayout>
        <AdminContactSettings />
      </AdminLayout>
    ) : (
      <Navigate to="/admin/login" />
    )
  }
/>

        {/* ---------------- Catch All ---------------- */}
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </NotificationsProvider>
  );
}

export default App;
