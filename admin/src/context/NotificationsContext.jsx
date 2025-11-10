// NotificationsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const NotificationsContext = createContext();
const socket = io("http://localhost:4000");

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch all notifications initially
    fetch("http://localhost:4000/api/notifications", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => console.error("Failed to fetch notifications:", err));

    // Socket event for new notification
    socket.on("newNotification", (n) => {
      setNotifications((prev) => [n, ...prev]);
    });

    return () => socket.off("newNotification");
  }, []);

  // ✅ Mark all read (frontend only)
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ✅ Delete single notification (backend + frontend)
  const deleteOne = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // ✅ Delete all notifications (backend + frontend)
  const deleteAll = async () => {
    try {
      await fetch("http://localhost:4000/api/notifications", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, markAllRead, deleteOne, deleteAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
