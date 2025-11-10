import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import { HashRouter, Routes, Route } from "react-router-dom";

import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/Shopcategory";
import Product from "./Pages/Product"; // ✅ Use Product page
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import LoginSignup from "./Pages/LoginSignup";
import CheckoutPage from "./Pages/CheckoutPage";
import OrderCompleted from "./Pages/OrderCompleted";
import MyOrdersPage from "./Pages/MyOrdersPage";
import ShippingPage from "./Pages/ShippingPage";
import AboutUs from "./Pages/AboutUs";
import MyAccount from "./Pages/MyAccount";
import FAQPage from "./Pages/FAQPage";
import SpecialOfferPopup from "./components/SpecialOfferPopup/SpecialOfferPopup";
import ReturnPage from "./Pages/ReturnPage";
import Contact from "./Pages/Contact";

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/mens" element={<ShopCategory category="mens" />} />
        <Route path="/womens" element={<ShopCategory category="womens" />} />
        <Route path="/kids" element={<ShopCategory category="kids" />} />
        <Route path="/product/:productId" element={<Product />} />{" "}
        {/* ✅ Product page */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-completed" element={<OrderCompleted />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/returns" element={<ReturnPage />} />
        <Route path="/contact" element={<Contact />} />

      </Routes>
      <SpecialOfferPopup />
      <Footer />
    </HashRouter>
  );
}

export default App;
