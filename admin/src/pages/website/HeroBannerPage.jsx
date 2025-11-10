import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUpload, FiEdit, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:4000/api/hero-banners";

const HeroBannerPage = () => {
    const [banners, setBanners] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [subtext, setSubtext] = useState("");
    const [btnText, setBtnText] = useState("");
    const [btnLink, setBtnLink] = useState("");
    const [editingBanner, setEditingBanner] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPreview(null);
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile && !editingBanner)
            return toast.error("Please select an image!");
        if (!title || !desc) return toast.error("Please enter title and description!");

        const formData = new FormData();
        if (selectedFile) formData.append("image", selectedFile);
        formData.append("title", title);
        formData.append("desc", desc);
        formData.append("subtext", subtext);
        formData.append("btnText", btnText);
        formData.append("btnLink", btnLink);

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
            setSelectedFile(null);
            setPreview(null);
            setTitle("");
            setDesc("");
            setSubtext("");
            setBtnText("");
            setBtnLink("");
            fetchBanners();
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload banner");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setTitle(banner.title);
        setDesc(banner.desc);
        setSubtext(banner.subtext || "");
        setBtnText(banner.btnText || "");
        setBtnLink(banner.btnLink || "");
        setPreview(
            banner.imageUrl.startsWith("http")
                ? banner.imageUrl
                : `http://localhost:4000${banner.imageUrl}`
        );
        setSelectedFile(null);
    };

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
            <h1 className="text-3xl font-bold text-[#e65a00]">Hero Banner Management</h1>
            <p className="text-[#666666] -mt-6">
                Manage your website's hero banners effectively. Upload images, set links, and customize display.
            </p>

            {/* Form Section */}
            <div className="bg-white shadow-xl rounded-lg p-6 space-y-4 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
                    {editingBanner ? "Edit Banner" : "Add New Banner"}
                </h2>

                <div className="flex flex-col space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Banner Title"
                        className="border p-3 rounded-md w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                    />
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Banner Description"
                        className="border p-3 rounded-md w-full h-28 resize-none focus:ring-2 focus:ring-[#ff6600] outline-none"
                    />
                    <input
                        type="text"
                        value={subtext}
                        onChange={(e) => setSubtext(e.target.value)}
                        placeholder="Subtext (optional)"
                        className="border p-3 rounded-md w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                    />
                    <input
                        type="text"
                        value={btnText}
                        onChange={(e) => setBtnText(e.target.value)}
                        placeholder="Button Text (optional)"
                        className="border p-3 rounded-md w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                    />
                    <input
                        type="text"
                        value={btnLink}
                        onChange={(e) => setBtnLink(e.target.value)}
                        placeholder="Button Link (optional)"
                        className="border p-3 rounded-md w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                    />

                    {/* Image Upload */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md cursor-pointer hover:border-[#ff6600] transition">
                        <span className="text-gray-500">
                            {preview ? "Change Banner Image" : "Upload Banner Image (Recommended: 1899x748px)"}
                        </span>
                        <input type="file" onChange={handleFileChange} className="hidden" />
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-4 w-full max-h-[200px] object-cover rounded-md shadow-lg border"
                            />
                        )}
                    </label>
                </div>

                {/* Upload / Update Button */}
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`bg-[#ff6600] hover:bg-orange-600 text-white px-6 py-3 rounded-md w-full flex items-center justify-center gap-2 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    <FiUpload />
                    {loading ? "Processing..." : editingBanner ? "Update Banner" : "Upload Banner"}
                </button>
            </div>

            {/* Banners Table */}
            <div className="bg-white shadow-xl rounded-lg overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Preview</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
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
                                            src={
                                                banner.imageUrl.startsWith("http")
                                                    ? banner.imageUrl
                                                    : `http://localhost:4000${banner.imageUrl}`
                                            }
                                            alt={banner.title}
                                            className="w-32 h-16 object-cover rounded-md"
                                        />
                                    </td>
                                    <td className="px-4 py-2">{banner.title}</td>
                                    <td className="px-4 py-2">{banner.desc}</td>
                                    <td className="px-4 py-2 flex gap-2 mt-3">
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="flex items-center justify-center gap-2 bg-[#ff6600]  text-white px-4 py-2 rounded-full shadow-md transition-all duration-300"
                                            title="Edit Banner"
                                        >
                                            <FiEdit className="w-4 h-4" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md transition-all duration-300"
                                            title="Delete Banner"
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

export default HeroBannerPage;
