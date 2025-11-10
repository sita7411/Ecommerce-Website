import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Switch } from "@headlessui/react";
import toast, { Toaster } from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useAdminAuth } from "../../context/AdminAuthContext"; // for token
import "../Css/visiblity.css";

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        toast.error("Failed to fetch products!");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const handleTogglePopular = async (id, currentStatus) => {
    const token = localStorage.getItem("adminToken"); // ✅ correct key

    if (!token) {
      toast.error("You are not logged in as admin!");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:4000/api/products/${id}/popular`,
        { isPopular: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ pass token
          },
        }
      );

      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
      toast.success(
        `Product ${!currentStatus ? "marked as popular" : "removed from popular"}`
      );
    } catch (err) {
      console.error("❌ Error updating popularity:", err);
      toast.error("Error updating product popularity!");
    }
  };


  // ✅ Confirm Delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/products/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      toast.error("Failed to delete product!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
      {/* ✅ Toast Notification */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#333", color: "#fff" },
          success: { style: { background: "#ff6600" } },
          error: { style: { background: "#f87171" } },
        }}
      />

      <div className="flex flex-col items-start gap-1 mb-7 animate-fadeIn">
        <h1 className="text-3xl font-bold text-[#e65a00]">Manage Popular Products</h1>
        <p className="text-[#666666]">
          View, edit, or delete your popular products below.
        </p>
      </div>

      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 animate-slideUp">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <h2 className="text-lg font-semibold text-gray-800">Product List</h2>
          <button
            className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md"
            onClick={() => navigate("/admin/products/add")}
          >
            + Add Product
          </button>
        </div>

        {/* ✅ Table Content */}
        {loading ? (
          <p className="text-center py-16 text-gray-500 text-lg">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-16 text-gray-500 text-lg">
            No products found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-t text-sm sm:text-base">
              <thead className="bg-[#fff5f0] text-gray-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Image</th>
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3 text-left font-semibold">Price</th>
                  <th className="px-5 py-3 text-center font-semibold">Popular</th>
                  <th className="px-5 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-orange-50 transition-all">
                    <td className="px-5 py-3">
                      <img
                        src={p.image || "/placeholder.png"}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-5 py-3 text-gray-600">{p.category}</td>
                    <td className="px-5 py-3 font-semibold text-gray-700">
                      ₹{p.new_price}
                      {p.discount > 0 && (
                        <span className="ml-2 text-gray-400 line-through text-sm">
                          ₹{p.old_price}
                        </span>
                      )}
                    </td>

                    {/* ✅ Popular Switch */}
                    <td className="px-5 py-3 text-center">
                      <Switch
                        checked={p.isPopular}
                        onChange={() => handleTogglePopular(p._id, p.isPopular)}
                        className={`${p.isPopular ? "bg-[#ff6600]" : "bg-gray-300"
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-all`}
                      >
                        <span
                          className={`${p.isPopular ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
                        />
                      </Switch>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center items-center gap-3">


                        <button
                          onClick={() => setDeleteModal({ open: true, id: p._id })}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm animate-slideUp">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Product?
            </h3>
            <p className="text-gray-600 mb-5 text-sm">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularProducts;
