import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Pages/CSS/MyOrdersPage.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch orders from backend using token (NOT userId)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Please log in first.");
          return;
        }

        const res = await fetch("http://localhost:4000/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          setOrders((data.orders || []).reverse()); // latest first
        } else {
          console.error("Failed to fetch orders:", data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Download PDF Invoice
 // ✅ Download PDF Invoice
const downloadInvoice = async (order) => {
  const logoUrl = "/images/logoo.png";
  const {
    _id,
    items = [],
    paymentMethod,
    createdAt,
    shippingPrice = 0,
    taxPrice = 0,
    discount = 0,
    shippingAddress,
  } = order;

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  const shipping = shippingPrice || 0;
  const taxAmount = taxPrice || 0;
  const discountAmount = discount || 0;
  const total = subtotal + shipping - discountAmount + taxAmount;

  const doc = new jsPDF("p", "pt");
  const themeColor = [255, 102, 0];

  const logoBase64 = await fetch(logoUrl)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        })
    );

  doc.addImage(logoBase64, "PNG", 40, 30, 100, 90);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...themeColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("123 Street, City, Country", 140, 65);
  doc.text("Phone: +1 234 567 890", 140, 80);
  doc.text("Email: info@company.com", 140, 95);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...themeColor);
  doc.text("INVOICE", 550, 60, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Invoice No: #${_id}`, 550, 90, { align: "right" });
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, 550, 105, { align: "right" });
  doc.text(`Payment: ${paymentMethod}`, 550, 120, { align: "right" });

  doc.setDrawColor(200);
  doc.line(40, 150, 560, 150);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Bill To:", 40, 170);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(shippingAddress?.fullName || "Customer", 40, 185);
  doc.text(shippingAddress?.address || "", 40, 200);
  doc.text(`${shippingAddress?.city || ""}, ${shippingAddress?.state || ""}`, 40, 215);
  doc.text(`Pincode: ${shippingAddress?.pincode || ""}`, 40, 230);

  autoTable(doc, {
    startY: 250,
    head: [["QTY", "DESCRIPTION", "UNIT PRICE", "TOTAL"]],
    body: items.map((item) => [
      item.qty || 0,
      item.name || "N/A",
      `$${(item.price || 0).toFixed(2)}`,
      `$${((item.price || 0) * (item.qty || 0)).toFixed(2)}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: themeColor, textColor: 255, fontStyle: "bold", halign: "center" },
    bodyStyles: { fontSize: 11 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { halign: "center", cellWidth: 50 },
      1: { cellWidth: 250 },
      2: { halign: "right", cellWidth: 110 },
      3: { halign: "right", cellWidth: 110 },
    },
  });

  const summaryStartY = doc.lastAutoTable.finalY + 20;
  autoTable(doc, {
    startY: summaryStartY,
    theme: "plain",
    body: [
      ["Subtotal", `$${subtotal.toFixed(2)}`],
      ["Shipping", `$${shipping.toFixed(2)}`],
      ["Tax", `$${taxAmount.toFixed(2)}`],
      ["Discount", `-$${discountAmount.toFixed(2)}`],
    ],
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: {
      0: { halign: "right", cellWidth: 100 },
      1: { halign: "right", cellWidth: 100 },
    },
    margin: { left: 360 },
  });

  const totalY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(...themeColor);
  doc.roundedRect(380, totalY, 180, 35, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255);
  doc.text(`GRAND TOTAL: $${total.toFixed(2)}`, 470, totalY + 22, { align: "center" });

  const footerY = totalY + 70;
  doc.setDrawColor(200);
  doc.line(40, footerY, 560, footerY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...themeColor);
  doc.text("Thank you for your business!", 40, footerY + 20);

  doc.save(`invoice_${_id}.pdf`);
};

  // Handle return click - navigate to return page
  const handleReturnClick = (orderId) => {
    navigate("/returns");
  };

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>My Orders</h1>
        <p>You have no orders yet.</p>
        <Link to="/">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="myorders-wrapper">
      <div className="myorders-banner">
        <h1>MY ORDERS</h1>
      </div>

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <span>Order ID: {order._id}</span>
            <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
            <span>Payment: {order.paymentMethod}</span>
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

          <button className="download-btn" onClick={() => downloadInvoice(order)}>
            Download Invoice
          </button>
          <button className="return-btn" onClick={handleReturnClick}>
            Return Order
          </button>

        </div>
      ))}

    </div>
  );
};

export default MyOrdersPage;
