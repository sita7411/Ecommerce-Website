import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiPackage } from "react-icons/fi";
import { useAdminAuth } from "../../context/AdminAuthContext";

const API_BASE = import.meta.env.VITE_API_URL + "/api/products";

export default function Inventory() {
  const { token } = useAdminAuth(); // ✅ Get JWT token from context

  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    stockQuantity: "",
    new_price: "",
    category: "",
  });

  const categories = ["General", "Men", "Women", "Kids", "Accessories"];

  // ✅ 1. Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(API_BASE, { headers });
      setInventory(res.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  // ✅ Filter list (search + stock)
  const filteredInventory = inventory.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterStock === "all"
        ? true
        : filterStock === "in"
        ? item.stockQuantity > 0
        : item.stockQuantity === 0;
    return matchSearch && matchFilter;
  });

  // ✅ Add / Update product
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      new_price: Number(formData.new_price),
      stockQuantity: Number(formData.stockQuantity),
      sku:
        formData.sku ||
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      category: formData.category || "General",
    };

    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (editMode) {
        await axios.put(`${API_BASE}/${formData._id}`, payload, { headers });
        console.log("✅ Product updated");
      } else {
        await axios.post(API_BASE, payload, { headers });
        console.log("✅ Product added");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("❌ Error saving product:", err);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`${API_BASE}/${id}`, { headers });
      fetchProducts();
    } catch (err) {
      console.error("❌ Error deleting product:", err);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      _id: "",
      name: "",
      stockQuantity: "",
      new_price: "",
      category: "",
    });
  };

  return (
    <div className="p-6">
      {/* ---------- Header ---------- */}
      <div className="page-header flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#ff6600] focus:outline-none transition"
          />
        </div>

        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#ff6600] transition"
        >
          <option value="all">All Products</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
          }}
          className="flex items-center gap-2 bg-[#ff6600] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#e65c00] transition"
        >
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* ---------- Table ---------- */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredInventory.length > 0 ? (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm font-semibold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredInventory.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-gray-800">{item.name}</td>
                  <td className="p-4 text-gray-600">{item.category || "General"}</td>
                  <td className="p-4">{item.stockQuantity}</td>
                  <td className="p-4">₹{item.new_price.toLocaleString()}</td>
                  <td
                    className={`p-4 font-medium ${
                      item.stockQuantity > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </td>
                  <td className="p-4 flex justify-center gap-3 text-gray-500">
                    <FiEdit2
                      className="cursor-pointer hover:text-[#ff6600] transition"
                      onClick={() => {
                        setEditMode(true);
                        setShowModal(true);
                        setFormData(item);
                      }}
                    />
                    <FiTrash2
                      className="cursor-pointer hover:text-red-500 transition"
                      onClick={() => handleDelete(item._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 flex flex-col items-center text-gray-500">
            <FiPackage size={40} className="mb-3 text-gray-400" />
            <p className="text-center">No products found in inventory.</p>
          </div>
        )}
      </div>

      {/* ---------- Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-fadeIn">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editMode ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff6600] transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#ff6600] transition bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock + Price */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff6600] transition"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="new_price"
                    value={formData.new_price}
                    onChange={(e) => setFormData({ ...formData, new_price: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ff6600] transition"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition"
                >
                  {editMode ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
