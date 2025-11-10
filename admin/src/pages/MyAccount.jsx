import { useState, useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiInfo, FiUpload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

const MyAccount = () => {
  const navigate = useNavigate();
  const { setAdmin } = useAdminAuth();
  const [admin, setLocalAdmin] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("/admin-avatar.jpg");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Admin");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    if (!storedAdmin) navigate("/admin/login");
    else {
      const adminData = JSON.parse(storedAdmin);
      setLocalAdmin(adminData);
      setName(adminData.name);
      setEmail(adminData.email);
      setAvatar(adminData.avatar || "/admin-avatar.jpg");
      setPhone(adminData.phone || "");
      setRole(adminData.role || "Admin");
    }
  }, [navigate]);

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = avatar;
      if (file) {
        const formData = new FormData();
        formData.append("images", file);

        const uploadRes = await API.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data?.urls?.length) {
          imageUrl = uploadRes.data.urls[0];
        }
      }

      const updatedAdmin = { name, phone, role, avatar: imageUrl };
      const token = localStorage.getItem("adminToken");

      const res = await API.put("/admin/update", updatedAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const newAdminData = res.data.admin;
        localStorage.setItem("adminUser", JSON.stringify(newAdminData));
        setLocalAdmin(newAdminData);
        setAdmin(newAdminData);
        toast.success("Profile updated successfully!");
      } else toast.error("Failed to update profile.");
    } catch (error) {
      console.error("❌ Update profile error:", error);
      toast.error("Server error while updating profile!");
    }
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-10 border border-orange-100">
        <h1 className="text-3xl font-extrabold text-center text-[#ff6600] mb-8">
          My Account
        </h1>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div
              className="relative group w-36 h-36 rounded-full overflow-hidden border-4 border-[#ff6600]/80 shadow-md flex items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile)
                  handleAvatarChange({ target: { files: [droppedFile] } });
              }}
            >
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                <FiUpload className="text-white text-3xl mb-2" />
                <p className="text-white text-xs font-medium">Change Photo</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <p className="text-sm text-gray-500 mt-3 text-center leading-tight">
              <span className="font-medium text-[#ff6600]">
                Upload a new profile photo
              </span>
              <br />
              <span className="text-gray-400 text-xs">
                (JPG, PNG, WEBP • Max 2MB)
              </span>
            </p>
          </div>

          {/* Input Fields */}
          <div className="relative">
            <FiUser className="absolute top-1/2 left-3 -translate-y-1/2 text-[#ff6600]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] outline-none transition"
              required
            />
          </div>

          {/* Read-only email */}
          <div className="relative">
            <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-[#ff6600]" />
            <input
              type="email"
              value={email}
              readOnly
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2.5 border border-orange-200 bg-gray-50 rounded-xl text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <FiPhone className="absolute top-1/2 left-3 -translate-y-1/2 text-[#ff6600]" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact Number"
              className="w-full pl-10 pr-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] outline-none transition"
            />
          </div>

          {/* Role Dropdown - Professional Look */}
          <div className="relative">
            <FiInfo className="absolute top-1/2 left-3 -translate-y-1/2 text-[#ff6600]" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-orange-200 rounded-xl appearance-none bg-gradient-to-r from-white to-orange-50 focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] outline-none transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="Admin">Admin</option>
              <option value="Editor"> Editor</option>
              <option value="Manager">Manager</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[#ff6600]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Update Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="px-10 py-3 bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;
