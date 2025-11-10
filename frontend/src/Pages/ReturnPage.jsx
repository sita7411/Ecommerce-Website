import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Pages/CSS/ReturnPage.css";
import toast, { Toaster } from "react-hot-toast";
const API_BASE = process.env.REACT_APP_API_URL;


const ReturnPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (res.ok) {
          // Map all delivered orders, but mark if they can be returned
          const mappedOrders = (data.orders || []).map((order) => ({
            ...order,
            canReturn: order.status === "Delivered" && !order.isReturned,
          }));
          setOrders(mappedOrders.reverse());
        } else {
          toast.error(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle return request submission
  const handleReturnSubmit = async () => {
    if (!returnReason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
const res = await fetch(`${API_BASE}/api/returns`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder._id, reason: returnReason }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Return request submitted successfully!");

        // Update order status in UI without removing it
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrder._id
              ? { ...o, isReturnRequested: true, returnReason }
              : o
          )
        );

        setSelectedOrder(null);
        setReturnReason("");
      } else {
        toast.error(data.message || "Failed to submit return");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting return request");
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <h1>Return Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>Return Orders</h1>
        <p>No orders found.</p>
        <Link to="/">Go to Shop</Link>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }

  return (
    <div className="myorders-wrapper">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="myorders-banner">
        <h1>RETURN ORDERS</h1>
      </div>

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <span>Order ID: {order._id}</span>
            <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
            <span>Total: ${(order.totalAmount || 0).toFixed(2)}</span>
          </div>

          <div className="order-items">
            {(order.items || []).map((item, i) => (
              <div key={i} className="order-item">
                <img
                  src={item.image || "/images/placeholder.png"}
                  alt={item.name || "Product"}
                />
                <div className="item-details">
                  <p><strong>{item.name || "N/A"}</strong></p>
                  <p>Size: {item.size || "N/A"}</p>
                  <p>Qty: {item.qty || 0}</p>
                  <p>Price: ${(item.price || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Return button logic */}
          {order.isReturnRequested ? (
            <button className="return-btn" disabled>
              Return Requested
            </button>
          ) : order.canReturn ? (
            <button className="return-btn" onClick={() => setSelectedOrder(order)}>
              Return This Order
            </button>
          ) : (
            <button className="return-btn" disabled>
              Cannot Return
            </button>
          )}
        </div>
      ))}

      {/* Modal for return reason */}
      {selectedOrder && (
        <div className="return-modal">
          <div className="return-modal-content">
            <h3>Return Order #{selectedOrder._id}</h3>
            <p>Please select a reason for your return:</p>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            >
              <option value="">--Select Reason--</option>
              <option value="Size Issue">Size Issue</option>
              <option value="Wrong Item">Wrong Item</option>
              <option value="Damaged Item">Damaged Item</option>
              <option value="Other">Other</option>
            </select>
            <div className="modal-buttons">
              <button
                className="submit-btn"
                onClick={handleReturnSubmit}
              >
                Submit
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedOrder(null);
                  setReturnReason("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnPage;
