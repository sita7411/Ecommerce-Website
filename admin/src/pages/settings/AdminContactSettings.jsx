import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AdminContactSettings = () => {
  const [formData, setFormData] = useState({
    bannerTitle: "",
    bannerSubtitle: "",
    phone: "",
    email: "",
    address: "",
    mapSrc: "",
  });

  // 🧠 Fetch existing contact data from backend
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/contact")
      .then((res) => setFormData(res.data))
      .catch((err) => {
        console.error("❌ Error fetching contact data:", err);
        toast.error("Failed to load contact data!");
      });
  }, []);

  // 🧩 Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Submit updated data
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:4000/api/contact", formData)
      .then(() => {
        toast.success("contact Page Updated Successfully!");
      })
      .catch((err) => {
        console.error("❌ Error updating contact data:", err);
        toast.error("Something went wrong while saving!");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 font-inter">
      <Toaster position="top-right" reverseOrder={false} />

      {/* 🏷️ Page Title */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#ff6600] mb-2">
          Contact Page Settings
        </h1>
        <p className="text-[#666666] text-base leading-relaxed max-w-2xl mx-auto">
          Manage your website’s contact page — update banner content, contact
          details, and embedded Google Map link easily below.
        </p>
      </div>

      {/* 🧾 Form Section */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Title
            </label>
            <input
              type="text"
              name="bannerTitle"
              value={formData.bannerTitle}
              onChange={handleChange}
              placeholder="Enter banner title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
            />
          </div>

          {/* Banner Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Subtitle
            </label>
            <input
              type="text"
              name="bannerSubtitle"
              value={formData.bannerSubtitle}
              onChange={handleChange}
              placeholder="Enter banner subtitle"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 99999 99999"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="support@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your business address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
            />
          </div>

          {/* Google Map Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Map Embed Link
            </label>
            <input
              type="text"
              name="mapSrc"
              value={formData.mapSrc}
              onChange={handleChange}
              placeholder="Paste your Google Maps embed URL"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              className="px-8 py-3 bg-[#ff6600] text-white rounded-lg shadow-md hover:bg-[#e65a00] transition font-semibold"
            >
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContactSettings;
