import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:4000/api/category-banners";

const CategoryBannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bannerName, setBannerName] = useState("");
  const [bannerCategory, setBannerCategory] = useState(""); // NEW
  const [preview, setPreview] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch banners
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(API_URL);
      setBanners(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch banners");
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreview(editingBanner ? editingBanner.imageUrl : null);
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload or update banner
  const handleUpload = async () => {
    if (!bannerName.trim()) return toast.error("Banner name is required!");
    if (!bannerCategory) return toast.error("Banner category is required!");
    if (!selectedFile && !editingBanner) return toast.error("Please select an image!");

    const formData = new FormData();
    formData.append("name", bannerName);
    formData.append("category", bannerCategory);
    if (selectedFile) formData.append("image", selectedFile);

    try {
      setLoading(true);
      if (editingBanner) {
        await axios.put(`${API_URL}/${editingBanner._id}`, formData);
        toast.success("Banner updated successfully!");
        setEditingBanner(null);
      } else {
        await axios.post(API_URL, formData);
        toast.success("Banner uploaded successfully!");
      }

      // Reset form
      setBannerName("");
      setBannerCategory("");
      setSelectedFile(null);
      setPreview(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload banner");
    } finally {
      setLoading(false);
    }
  };

  // Edit banner
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setBannerName(banner.name);
    setBannerCategory(banner.category); // NEW
    setPreview(
      banner.imageUrl.startsWith("http")
        ? banner.imageUrl
        : `http://localhost:4000${banner.imageUrl}`
    );
    setSelectedFile(null);
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Banner deleted successfully!");
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-[#e65a00]">Category Banner Management</h1>
      <p className="text-[#666666] -mt-6">
        Manage your website's category banners effectively. Upload images, set links, and customize display.
      </p>

      {/* Upload / Edit Form */}
      <div className="bg-white shadow-xl rounded-lg p-6 space-y-4 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
          {editingBanner ? "Edit Banner" : "Add New Banner"}
        </h2>

        <div className="flex flex-col space-y-4">
          {/* Banner Name */}
          <input
            type="text"
            placeholder="Banner Name"
            value={bannerName}
            onChange={(e) => setBannerName(e.target.value)}
            className="border p-2 rounded-md w-full"
          />

          {/* Category Dropdown */}
          <select
            value={bannerCategory}
            onChange={(e) => setBannerCategory(e.target.value)}
            className="border p-2 rounded-md w-full"
          >
            <option value="">Select Category</option>
            <option value="mens">Mens</option>
            <option value="womens">Womens</option>
            <option value="kids">Kids</option>
          </select>

          {/* Image Upload */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md cursor-pointer hover:border-[#ff6600] transition">
            <span className="text-gray-500">
              {preview ? "Change Banner Image" : "Upload Banner Image (Recommended: 1200x400px)"}
            </span>
            <input type="file" onChange={handleFileChange} className="hidden" />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-4 w-full max-h-[200px] object-cover rounded-md shadow-md border"
              />
            )}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`bg-[#ff6600] hover:bg-orange-600 text-white px-6 py-3 rounded-md w-full flex items-center justify-center gap-2 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Processing..." : editingBanner ? "Update Banner" : "Upload Banner"}
        </button>
      </div>

      {/* Banners Table */}
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Preview</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                  No banners found.
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">
                    <img
                      src={banner.imageUrl.startsWith("http") ? banner.imageUrl : `http://localhost:4000${banner.imageUrl}`}
                      alt="Banner"
                      className="w-64 h-24 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2">{banner.name}</td>
                  <td className="px-4 py-2">{banner.category}</td>
                  <td className="px-4 py-2 flex gap-2 mt-7">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex items-center justify-center gap-2 bg-[#ff6600] text-white px-4 py-2 rounded-full shadow-md transition-all duration-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md transition-all duration-300"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryBannerPage;
