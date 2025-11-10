import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import "../Css/products.css";
import { useAdminAuth } from "../../context/AdminAuthContext"; // for token
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = import.meta.env.VITE_API_URL;


const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    images: [],
    old_price: "",
    new_price: "",
    stockQuantity: "",
    inStock: true,
    sizes: [],
    sku: "",
    tags: [],
    colors: [],
  });

  const [mainImage, setMainImage] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Slug generator
  const slugify = (text) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? name === "inStock"
            ? checked
            : prev[name]
          : value,
      inStock:
        name === "stockQuantity"
          ? parseInt(value) > 0
          : name === "inStock"
          ? checked
          : prev.inStock,
    }));
  };

  // ✅ Add Size
  const handleSizeKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && sizeInput.trim() !== "") {
      e.preventDefault();
      const newSize = sizeInput.trim().toUpperCase();
      if (!formData.sizes.includes(newSize)) {
        setFormData((prev) => ({
          ...prev,
          sizes: [...prev.sizes, newSize],
        }));
      }
      setSizeInput("");
    }
  };

  const handleRemoveSize = (index) => {
    const removed = formData.sizes[index];
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // ✅ Handle Color Select
  const handleColorChange = (colorName) => {
    setFormData((prev) => {
      const updated = prev.colors.includes(colorName)
        ? prev.colors.filter((c) => c !== colorName)
        : [...prev.colors, colorName];
   
      return { ...prev, colors: updated };
    });
  };

  // ✅ Handle Image Upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      toast.warn("⚠️ You can upload a maximum of 5 images.");
      return;
    }

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const all = [...formData.images, ...previews].slice(0, 5);
    setFormData((prev) => ({ ...prev, images: all }));
    if (!mainImage && all.length > 0) setMainImage(all[0].preview);
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ✅ Handle Tags
  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim() !== "") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    const removed = formData.tags[index];
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // ✅ Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, new_price, sku } = formData;
    if (!name || !category || !new_price || !sku) {
      toast.error("⚠️ Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Upload images
      const files = formData.images.map((img) => img.file);
      const imageFormData = new FormData();
      files.forEach((file) => imageFormData.append("images", file));

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: imageFormData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { urls } = await uploadRes.json();

      // STEP 2: Add Product
      const newProduct = {
        name,
        category,
        description: formData.description,
        images: urls,
        old_price: parseFloat(formData.old_price || 0),
        new_price: parseFloat(formData.new_price),
        stockQuantity: parseInt(formData.stockQuantity || 0),
        inStock: formData.inStock,
        sizes: formData.sizes,
        sku: formData.sku,
        tags: formData.tags,
        colors: formData.colors,
        slug: slugify(name),
      };

      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      toast.success(" Product added successfully!");
      resetForm();
    } catch (err) {
      toast.error("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      images: [],
      old_price: "",
      new_price: "",
      stockQuantity: "",
      inStock: true,
      sizes: [],
      sku: "",
      tags: [],
      colors: [],
    });
    setMainImage(null);
    setTagInput("");
    setSizeInput("");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      resetForm();
      toast.info("Form reset successfully");
    }
  };

  const availableColors = [
    { name: "Red", code: "#ff0000" },
    { name: "Orange", code: "#ff6600" },
    { name: "Yellow", code: "#ffcc00" },
    { name: "Green", code: "#22c55e" },
    { name: "Blue", code: "#0066cc" },
    { name: "Sky Blue", code: "#38bdf8" },
    { name: "Teal", code: "#14b8a6" },
    { name: "Purple", code: "#8b5cf6" },
    { name: "Pink", code: "#ec4899" },
    { name: "Brown", code: "#8b4513" },
    { name: "Beige", code: "#f5f5dc" },
    { name: "Gray", code: "#808080" },
    { name: "Light Gray", code: "#d1d5db" },
    { name: "Dark Gray", code: "#374151" },
    { name: "Black", code: "#000000" },
    { name: "White", code: "#ffffff" },
    { name: "Maroon", code: "#800000" },
    { name: "Navy Blue", code: "#001f3f" },
    { name: "Olive", code: "#808000" },
    { name: "Cyan", code: "#00ffff" },
    { name: "Magenta", code: "#ff00ff" },
    { name: "Lavender", code: "#e6e6fa" },
    { name: "Peach", code: "#ffdab9" },
    { name: "Mint", code: "#98ff98" },
    { name: "Gold", code: "#ffd700" },
    { name: "Silver", code: "#c0c0c0" },
    { name: "Bronze", code: "#cd7f32" },
  ];

  return (
    <div className="add-product-container mx-auto my-10 max-w-5xl bg-white rounded-2xl p-10 shadow-lg">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />

      <h2
        className="text-center text-3xl font-bold mb-8 relative after:mx-auto after:mt-2"
        style={{ color: "#e65a00" }}
      >
        Add New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name + Category */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name *"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field flex-1"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="input-field flex-1"
          >
            <option value="">Select Category *</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="input-field w-full"
        />

        {/* Image Upload */}
        <div className="image-upload-box">
          <p className="upload-instruction">
            Drag your images here <br />
            <span>(Max 5 images)</span>
          </p>

          <input
            type="file"
            id="imageUpload"
            multiple
            accept=".jpeg,.jpg,.png,.webp"
            onChange={handleImageUpload}
            hidden
          />
          <label
            htmlFor="imageUpload"
            className="upload-btn inline-flex items-center gap-2"
          >
            <FaPlus /> Upload
          </label>

          <div className="image-preview-grid mt-5">
            {formData.images.map((img, index) => (
              <div key={index} className="preview-item">
                <img src={img.preview} alt={`preview-${index}`} />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Prices */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="number"
            name="old_price"
            placeholder="Old Price"
            value={formData.old_price}
            onChange={handleChange}
            className="input-field flex-1"
          />
          <input
            type="number"
            name="new_price"
            placeholder="New Price *"
            value={formData.new_price}
            onChange={handleChange}
            required
            className="input-field flex-1"
          />
          {formData.old_price && formData.new_price && (
            <span className="discount-info">
              Discount:{" "}
              {Math.round(
                ((formData.old_price - formData.new_price) /
                  formData.old_price) *
                  100
              )}
              % OFF
            </span>
          )}
        </div>

        {/* Stock + Sizes */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            className="input-field flex-1"
          />
          <label className="flex items-center gap-3 font-medium text-gray-700">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="accent-[#ff6600] w-4 h-4"
            />
            In Stock
          </label>
        </div>

        {/* Sizes */}
        <div className="tags-input-container">
          <label>Sizes</label>
          <div className="tags-list">
            {formData.sizes.map((size, index) => (
              <span key={index} className="tag-item">
                {size}
                <button
                  type="button"
                  className="remove-tag"
                  onClick={() => handleRemoveSize(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            className="tag-input"
            placeholder="Add size (e.g. S, M, L) and press Enter"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={handleSizeKeyDown}
          />
        </div>

        {/* Colors */}
        <div>
          <label className="font-semibold text-gray-800 mb-2 block">
            Available Colors
          </label>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <div
                key={color.name}
                className={`color-item ${
                  formData.colors.includes(color.name) ? "selected" : ""
                }`}
                onClick={() => handleColorChange(color.name)}
              >
                <span
                  className="color-circle"
                  style={{
                    backgroundColor: color.code,
                    border:
                      color.name.toLowerCase() === "white"
                        ? "1px solid #ccc"
                        : "none",
                  }}
                ></span>
                <span>{color.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SKU + Tags */}
        <div className="input-group">
          <label htmlFor="sku">
            Product SKU <span>*</span>
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            placeholder="Enter unique SKU code (e.g. CODX-1234)"
            value={formData.sku}
            onChange={handleChange}
            className="sku-input"
          />
        </div>

        <div className="tags-input-container">
          <label>Tags</label>
          <div className="tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag-item">
                {tag}
                <button
                  type="button"
                  className="remove-tag"
                  onClick={() => handleRemoveTag(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            className="tag-input"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-5 mt-8">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "⏳ Saving..." : "💾 Save Product"}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            🔄 Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
