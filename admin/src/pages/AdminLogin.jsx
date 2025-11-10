import React, { useState, useContext } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";
const API_URL = import.meta.env.VITE_API_URL;

const AdminAuth = () => {
  const navigate = useNavigate();
  const { setAdmin, setToken } = useContext(AdminAuthContext);

  const [isLogin, setIsLogin] = useState(true); // 🔁 switch between login/register
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
  const url = isLogin
  ? `${API_URL}/api/admin/login`
  : `${API_URL}/api/admin/register`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminUser", JSON.stringify(data.admin));
          setAdmin(data.admin);
          setToken(data.token);
          navigate("/admin/dashboard");
        } else {
          setMessage("✅ " + data.message);
          setTimeout(() => setIsLogin(true), 1500); // switch to login after register
        }
      } else {
        setMessage("❌ " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 lg:px-12 bg-gray-50">
      {/* Left branding */}
      <div className="flex-1 text-center lg:text-left mb-10 lg:mb-0">
        <img
          src={isLogin ? "/shopping-illustration.png" : "/shopping-illustration.png"}
          alt="Admin"
          className="mx-auto lg:mx-0 w-3/4 lg:w-full mb-6"
        />
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3 text-center">
          {isLogin ? "Welcome Back, " : "Create Your "}
          <span className="text-[#ff6600]">Admin</span>
        </h2>
        <p className="text-gray-600 max-w-md mx-auto text-center">
          {isLogin
            ? "Manage your e-commerce operations efficiently and securely."
            : "Register to start managing your e-commerce platform securely."}
        </p>
      </div>

      {/* Right card */}
      <div className="flex-1 max-w-md bg-white rounded-xl shadow-lg p-8 lg:p-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {isLogin ? "Admin Login" : "Create Account"}
        </h1>

        {message && (
          <p
            className={`text-center mb-4 text-sm font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name (only show in Register mode) */}
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg text-gray-700 focus:border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/20 outline-none transition"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg text-gray-700 focus:border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/20 outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg text-gray-700 focus:border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/20 outline-none transition"
            />
          </div>

          {/* Switch link */}
          <div className="text-sm text-center">
            {isLogin ? (
              <p>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="text-[#ff6600] hover:underline"
                  onClick={() => setIsLogin(false)}
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#ff6600] hover:underline"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6600] text-white font-medium py-3 rounded-lg hover:bg-[#ff914d] transition disabled:opacity-70"
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Creating Account..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
