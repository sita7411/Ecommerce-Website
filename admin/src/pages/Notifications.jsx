import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import toast, { Toaster } from "react-hot-toast";
import io from "socket.io-client";
import { FiCheckCircle, FiTrash2, FiX, FiPackage, FiUser, FiShoppingCart } from "react-icons/fi";

const socket = io(import.meta.env.VITE_API_URL);

const Notifications = () => {
  const navigate = useNavigate(); // ✅ useNavigate hook
  const [notifications, setNotifications] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const toastStyle = {
    style: { background: "#333", color: "#fff" },
    success: { style: { background: "#ff6600" } },
    error: { style: { background: "#f87171" } },
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ----------------- FETCH NOTIFICATIONS -----------------
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const mappedNotifications = (data.notifications || []).map((n) => ({
          ...n,
          date: n.createdAt,
        }));
        setNotifications(mappedNotifications);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notifications", toastStyle.error);
      }
    };
    fetchNotifications();
  }, []);

  // ----------------- SOCKET.IO REAL-TIME -----------------
  useEffect(() => {
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message, toastStyle.success);
    });
    return () => socket.off("newNotification");
  }, []);

  // ----------------- MARK ALL READ -----------------
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read!", toastStyle.success);
  };

  // ----------------- DELETE -----------------
  const deleteAllConfirm = () => {
    setDeleteType("all");
    setShowConfirm(true);
  };

  const deleteOneConfirm = (id) => {
    setDeleteType("one");
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === "all") {
        await fetch("http://localhost:4000/api/notifications", { method: "DELETE" });
        setNotifications([]);
        toast.success("All notifications deleted!", toastStyle.success);
      } else if (deleteType === "one" && selectedId) {
        await fetch(`http://localhost:4000/api/notifications/${selectedId}`, { method: "DELETE" });
        setNotifications((prev) => prev.filter((n) => n._id !== selectedId));
        toast.success("Notification deleted!", toastStyle.success);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification", toastStyle.error);
    } finally {
      setShowConfirm(false);
      setDeleteType("");
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setDeleteType("");
    setSelectedId(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "order": return <FiShoppingCart className="text-[#ff6600]" size={22} />;
      case "inventory": return <FiPackage className="text-blue-500" size={22} />;
      case "user": return <FiUser className="text-green-600" size={22} />;
      default: return <FiCheckCircle className="text-gray-500" size={22} />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "order": return "bg-[#ff6600]";
      case "inventory": return "bg-blue-500";
      case "user": return "bg-green-600";
      default: return "bg-gray-400";
    }
  };

  // ----------------- NAVIGATE TO ORDER -----------------
  const handleNotificationClick = (notification) => {
    if (notification.orderId) {
      navigate(`/admin/orders/${notification.orderId}`); // ✅ redirect to Orders page with orderId
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      <Toaster position="top-right" toastOptions={toastStyle} />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications</h1>

      {/* Top Buttons */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-6 py-4 mb-8">
        <button onClick={markAllRead} className="flex items-center gap-2 bg-[#ff6600]/10 text-[#ff6600] font-medium px-4 py-2 rounded-md border border-[#ff6600]/20 hover:bg-[#ff6600]/20 transition-all">
          <FiCheckCircle className="text-[#ff6600]" size={18} /> Mark as read
        </button>
        <button onClick={deleteAllConfirm} className="flex items-center gap-2 bg-red-100 text-red-500 font-medium px-4 py-2 rounded-md border border-red-200 hover:bg-red-200/70 transition-all">
          <FiTrash2 className="text-red-500" size={18} /> Delete All
        </button>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3 font-semibold text-gray-700">
          <span>Unread Notifications ({notifications.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 w-12"></th>
                <th className="px-6 py-3">Notification</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? notifications.map((n) => (
                <tr key={n._id} className="border-b hover:bg-orange-50 transition-all cursor-pointer" onClick={() => handleNotificationClick(n)}>
                  <td className="px-6 py-4">{getTypeIcon(n.type)}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800">
                      {n.type === "order" ? (
                        <>
                          <span className="font-medium text-[#ff6600]">{n.name || "Customer"}</span>{" "}
                          placed a new order{" "}
                          <span className="font-semibold">#{n.orderId ? n.orderId.slice(-6).toUpperCase() : "N/A"}</span>
                        </>
                      ) : (
                        n.message
                      )}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      <span className={`${getBadgeColor(n.type)} text-white text-xs px-2 py-1 rounded-md capitalize`}>{n.type}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(n.date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); deleteOneConfirm(n._id); }} className="text-red-500 hover:text-red-600 transition-all">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">No notifications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl text-center relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={handleCancel}><FiX size={20} /></button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete {deleteType === "all" ? "all notifications" : "this notification"}?
            </h2>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={handleConfirmDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all">Yes, Delete</button>
              <button onClick={handleCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
