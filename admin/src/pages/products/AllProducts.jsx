import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import "../Css/products.css";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL + "/api/products";

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
];

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const AllProducts = () => {
  const { token } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("❌ Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add or Edit Product
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const newProduct = {
      name: form.get("name"),
      category: form.get("category"),
      description: form.get("description"),
      old_price: parseFloat(form.get("old_price")) || 0,
      new_price: parseFloat(form.get("new_price")) || 0,
      stockQuantity: parseInt(form.get("stock")) || 0,
      colors: form.getAll("colors"),
      sizes: form.getAll("sizes"),
      sku: editProduct?.sku || `SKU-${Date.now()}`,
      tags: form.get("tags")
        ? form.get("tags").split(",").map((t) => t.trim())
        : [],
      image: form.get("image") || "/images/default.jpg",
      images: form.get("images")
        ? form.get("images").split(",").map((i) => i.trim())
        : [],
      published: form.get("published") === "on",
      status: "Selling",
    };

    const method = editProduct ? "PUT" : "POST";
    const url = editProduct ? `${API_URL}/${editProduct._id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(
        editProduct ? " Product updated successfully" : "Product added successfully"
      );
      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
    } catch {
      toast.error("❌ Failed to save product");
    }
  };

  // Delete single
  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        toast.success("🗑️ Product deleted successfully");
        fetchProducts();
      } catch {
        toast.error("❌ Failed to delete product");
      }
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selected.length === 0) return toast.warning("⚠️ No products selected.");
    if (window.confirm("Delete selected products?")) {
      try {
        const res = await fetch(`${API_URL}/bulk-delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selected }),
        });
        if (!res.ok) throw new Error();
        toast.success("✅ Selected products deleted");
        setSelected([]);
        setSelectAll(false);
        fetchProducts();
      } catch {
        toast.error("❌ Bulk delete failed");
      }
    }
  };

  const handlePublishToggle = async (p) => {
    try {
      await fetch(`${API_URL}/${p._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !p.published }),
      });
      toast.info(
        p.published ? "🔒 Product unpublished" : "🌟 Product published"
      );
      fetchProducts();
    } catch {
      toast.error("❌ Failed to update publish status");
    }
  };

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (category ? p.category === category : true)
    )
    .sort((a, b) =>
      priceFilter === "low"
        ? a.new_price - b.new_price
        : priceFilter === "high"
        ? b.new_price - a.new_price
        : 0
    );

  const handleSelectAll = () => {
    if (!selectAll) setSelected(products.map((p) => p._id));
    else setSelected([]);
    setSelectAll(!selectAll);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="all-products-container">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <div className="all-products-header">
        <h2>All Products</h2>
        <div className="all-products-actions">
          <button
            className="all-products-bulk-btn"
            onClick={() => setShowModal(true)}
          >
            <FiPlus /> Add Product
          </button>
          <button
            className="all-products-delete-top-btn"
            onClick={handleBulkDelete}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="all-products-filters-box">
        <div className="all-products-search-box">
          <FiSearch className="all-products-search-icon" />
          <input
            type="text"
            placeholder="Search Product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="all-products-filter-select"
        >
          <option value="">Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
          <option value="Skin Care">Skin Care</option>
          <option value="Fresh Vegetable">Fresh Vegetable</option>
        </select>

        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="all-products-filter-select"
        >
          <option value="">Price</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setCategory("");
            setPriceFilter("");
          }}
          className="all-products-reset-btn"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="all-products-table-box">
        <table className="all-products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Colors</th>
              <th>Sizes</th>
              <th>New Price</th>
              <th>Old Price</th>
              <th>Stock</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(p._id)}
                      onChange={() => handleSelect(p._id)}
                    />
                  </td>
                  <td className="all-products-table-product">
                    <img
                      src={
                        p.image ||
                        (p.images && p.images[0]) ||
                        "https://via.placeholder.com/100"
                      }
                      alt={p.name}
                    />
                    <span>{p.name}</span>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {p.colors?.map((color) => {
                        const colorData = availableColors.find(
                          (c) => c.name === color
                        );
                        return (
                          <span
                            key={color}
                            title={color}
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: colorData?.code || "#ccc" }}
                          ></span>
                        );
                      })}
                    </div>
                  </td>
                  <td>{p.sizes?.length > 0 ? p.sizes.join(", ") : "—"}</td>
                  <td>₹{p.new_price}</td>
                  <td className="text-slate-500 line-through">₹{p.old_price}</td>
                  <td>{p.stockQuantity || 0}</td>
                  <td>
                    <label className="all-products-switch">
                      <input
                        type="checkbox"
                        checked={p.published}
                        onChange={() => handlePublishToggle(p)}
                      />
                      <span className="all-products-slider"></span>
                    </label>
                  </td>
                  <td className="all-products-actions">
                    <button
                      className="all-products-edit-btn"
                      onClick={() => {
                        setEditProduct(p);
                        setShowModal(true);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="all-products-delete-btn"
                      onClick={() => handleDelete(p._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-5 text-slate-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="all-products-modal-overlay">
          <div className="all-products-modal-box">
            <h3>{editProduct ? "Edit Product" : "Add Product"}</h3>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                defaultValue={editProduct?.name || ""}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                defaultValue={editProduct?.category || ""}
                required
              />
              <textarea
                name="description"
                placeholder="Product Description"
                defaultValue={editProduct?.description || ""}
              ></textarea>
              <input
                type="number"
                name="new_price"
                placeholder="New Price"
                defaultValue={editProduct?.new_price || ""}
              />
              <input
                type="number"
                name="old_price"
                placeholder="Old Price"
                defaultValue={editProduct?.old_price || ""}
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock Quantity"
                defaultValue={editProduct?.stockQuantity || ""}
              />

              <input
                type="text"
                name="sku"
                placeholder="SKU"
                defaultValue={editProduct?.sku || ""}
              />
              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated)"
                defaultValue={editProduct?.tags?.join(", ") || ""}
              />
              <input
                type="text"
                name="image"
                placeholder="Main Image URL"
                defaultValue={editProduct?.image || ""}
              />
              <input
                type="text"
                name="images"
                placeholder="Extra Images (comma separated)"
                defaultValue={editProduct?.images?.join(", ") || ""}
              />

              <div>
                <p>Available Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <label key={c.name}>
                      <input
                        type="checkbox"
                        name="colors"
                        value={c.name}
                        defaultChecked={editProduct?.colors?.includes(c.name)}
                      />
                      <span style={{ backgroundColor: c.code }}></span> {c.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p>Available Sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        name="sizes"
                        value={s}
                        defaultChecked={editProduct?.sizes?.includes(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={editProduct?.published || false}
                />{" "}
                Published
              </label>

              <div className="flex gap-4 mt-4 justify-end">
                <button
                  type="button"
                  className="all-products-cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="all-products-save-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
