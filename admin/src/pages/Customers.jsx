import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AiOutlineSearch,
  AiOutlineUpload,
  AiOutlineDownload,
} from "react-icons/ai";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import ExcelJS from "exceljs";

const API_URL = import.meta.env.VITE_API_URL + "/users";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [loading, setLoading] = useState(false);

  // ------------------- Fetch All Customers -------------------
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/all`);
      const data = Array.isArray(res.data) ? res.data : [];
      setCustomers(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      alert("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ------------------- Utilities -------------------
  const getFullName = (c) => `${c.firstName || ""} ${c.lastName || ""}`;

  const handleSearch = () => {
    const f = customers.filter(
      (c) =>
        c._id?.toLowerCase().includes(search.toLowerCase()) ||
        getFullName(c).toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  };

  const handleReset = () => {
    setSearch("");
    setFiltered(customers);
  };

  // ------------------- Export Excel -------------------
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Customers");

    sheet.columns = [
      { header: "ID", key: "_id", width: 25 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    filtered.forEach((c) =>
      sheet.addRow({
        _id: c._id,
        name: getFullName(c),
        email: c.email,
        phone: c.phone,
        createdAt: new Date(c.createdAt).toLocaleDateString(),
      })
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Customers_List.xlsx";
    link.click();
  };

  // ------------------- Import Excel -------------------
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      fetchCustomers(); // refresh list
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import customers");
    }
  };

  // ------------------- View/Edit/Delete -------------------
  const handleView = (c) => {
    setSelected(c);
    setMode("view");
  };

  const handleEdit = (c) => {
    setEditData(c);
    setMode("edit");
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${getFullName(c)}?`)) return;

    try {
      await axios.delete(`${API_URL}/${c._id}`);
      const updated = customers.filter((x) => x._id !== c._id);
      setCustomers(updated);
      setFiltered(updated);
      alert("Customer deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete customer");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/${editData._id}`, editData);
      const updatedList = customers.map((c) =>
        c._id === res.data._id ? res.data : c
      );
      setCustomers(updatedList);
      setFiltered(updatedList);
      setMode("");
      setEditData({});
      alert("Customer updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update customer");
    }
  };

  const closePopup = () => {
    setMode("");
    setSelected(null);
    setEditData({});
  };

  // ------------------- JSX -------------------
  return (
    <div className="px-10 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
<h1
  className="text-3xl font-bold"
  style={{ color: "#e65a00" }}
>
  Customers
</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#e65c00] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            <AiOutlineDownload /> Export
          </button>
          <label className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-100">
            <AiOutlineUpload /> Import
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleImport}
              hidden
            />
          </label>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative w-full">
            <AiOutlineSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name/email/phone"
              className="border border-gray-300 rounded-lg pl-10 pr-3 p-2 text-sm w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#ff6600] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#e65c00] transition-all"
          >
            Filter
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
        <table className="min-w-full table-auto">
          <thead className="bg-[#ff6600]/10 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="py-3 px-5 text-left">ID</th>
              <th className="py-3 px-5 text-left">Name</th>
              <th className="py-3 px-5 text-left">Email</th>
              <th className="py-3 px-5 text-left">Phone</th>
              <th className="py-3 px-5 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((c) => (
                <tr
                  key={c._id}
                  className="border-b hover:bg-[#ff6600]/5 transition-colors"
                >
                  <td className="py-3 px-5 font-medium text-gray-800">{c._id}</td>
                  <td className="py-3 px-5 text-gray-600">{getFullName(c)}</td>
                  <td className="py-3 px-5 text-gray-600">{c.email}</td>
                  <td className="py-3 px-5 text-gray-600">{c.phone}</td>
                  <td className="py-3 px-5 flex items-center gap-3">
                    <button
                      onClick={() => handleView(c)}
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-2 rounded-md hover:bg-gray-100 text-blue-600"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-2 rounded-md hover:bg-gray-100 text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 font-medium">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View/Edit Popup */}
      {(mode === "view" || mode === "edit") && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-[400px] relative animate-fadeIn">
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✖
            </button>

            {mode === "view" && selected && (
              <>
                <h2 className="text-2xl font-bold text-[#ff6600] mb-5">
                  Customer Details
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p><b>ID:</b> {selected._id}</p>
                  <p><b>Name:</b> {getFullName(selected)}</p>
                  <p><b>Email:</b> {selected.email}</p>
                  <p><b>Phone:</b> {selected.phone}</p>
                </div>
              </>
            )}

            {mode === "edit" && (
              <>
                <h2 className="text-2xl font-bold text-[#ff6600] mb-5">
                  Edit Customer
                </h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    value={editData.firstName || ""}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    placeholder="First Name"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                  />
                  <input
                    type="text"
                    value={editData.lastName || ""}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                  />
                  <input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Email"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                  />
                  <input
                    type="text"
                    value={editData.phone || ""}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Phone"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-4 py-2 rounded-lg text-sm font-semibold w-full"
                  >
                    Save Changes
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
