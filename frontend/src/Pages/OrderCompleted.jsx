import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaFileDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../Pages/CSS/OrderCompleted.css";
const API_BASE = process.env.REACT_APP_API_URL; // at top of file


const OrderCompleted = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

  const response = await fetch(`${API_BASE}/api/orders/my-orders`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();

        if (data.orders && data.orders.length > 0) {
          // Assuming backend returns orders sorted by newest first
          setOrder(data.orders[0]);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error(err);
        setError("Could not fetch order. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) return <div className="order-wrapper"><h2>Loading...</h2></div>;
  if (error) return <div className="order-wrapper"><h2>{error}</h2></div>;
  if (!order) return <div className="order-wrapper"><h2>No Recent Order Found</h2></div>;

  const {
    _id,
    paymentMethod,
    createdAt,
    items = [],
    shippingPrice = 0,
    discount = 0,
    taxes = 0,
    shippingAddress = {},
  } = order;

  // 🧮 Perfect Calculations (consistent with other components)
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
  const shipping = shippingPrice || 0;
  const discountAmount = discount || 0; // Discount is already applied only for first orders in backend
  const taxAmount = taxes || 0;
  const total = subtotal + shipping - discountAmount + taxAmount;

  // ---------------- PDF Invoice Download ----------------
  const downloadInvoice = async () => {
    try {
      const logoUrl = "/images/logoo.png"; // from public/images
      const doc = new jsPDF("p", "pt");
      const themeColor = [255, 102, 0];

      // Logo
      const logoBase64 = await fetch(logoUrl)
        .then(res => res.blob())
        .then(
          blob =>
            new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );
      doc.addImage(logoBase64, "PNG", 40, 30, 100, 90);

      // Company Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text("123 Street, City, Country", 140, 65);
      doc.text("Phone: +1 234 567 890", 140, 80);
      doc.text("Email: info@company.com", 140, 95);

      // Invoice Title & Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...themeColor);
      doc.text("INVOICE", 550, 60, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Invoice No: #${_id}`, 550, 90, { align: "right" });
      doc.text(`Date: ${new Date(createdAt).toLocaleDateString("en-GB")}`, 550, 105, { align: "right" });
      doc.text(`Payment: ${paymentMethod}`, 550, 120, { align: "right" });

      doc.setDrawColor(200);
      doc.line(40, 150, 560, 150);

      // Bill To
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Bill To:", 40, 170);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(shippingAddress.fullName || "Customer", 40, 185);
      doc.text(shippingAddress.address || "Address not provided", 40, 200);
      doc.text(`${shippingAddress.city || ""}, ${shippingAddress.state || ""}`, 40, 215);
      doc.text(`Phone: ${shippingAddress.phone || "-"}`, 40, 230);

      // Products Table
      autoTable(doc, {
        startY: 250,
        head: [["QTY", "DESCRIPTION", "UNIT PRICE", "TOTAL"]],
        body: items.map(item => [
          item.qty || 0,
          item.name || "",
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

      // Order Summary
      const summaryStartY = doc.lastAutoTable.finalY + 20;
      autoTable(doc, {
        startY: summaryStartY,
        theme: "plain",
        body: [
          ["Subtotal", `$${subtotal.toFixed(2)}`],
          ["Shipping", `$${shipping.toFixed(2)}`],
          ["Taxes", `$${taxAmount.toFixed(2)}`],
          ...(discountAmount > 0 ? [["Discount", `-$${discountAmount.toFixed(2)}`]] : []), // Only show if discount > 0
        ],
        styles: { fontSize: 11, cellPadding: 3 },
        columnStyles: { 0: { halign: "right", cellWidth: 100 }, 1: { halign: "right", cellWidth: 100 } },
        margin: { left: 360 },
      });

      const totalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(...themeColor);
      doc.roundedRect(380, totalY, 180, 35, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255);
      doc.text(`GRAND TOTAL: $${total.toFixed(2)}`, 470, totalY + 22, { align: "center" });

      // Footer
      const footerY = totalY + 70;
      doc.setDrawColor(200);
      doc.line(40, footerY, 560, footerY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...themeColor);
      doc.text("Thank you for your business!", 40, footerY + 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("Terms & Conditions: Payment is due within 15 days. Goods once sold cannot be returned.", 40, footerY + 35);

      doc.save(`invoice_${_id}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  };

  return (
    <div className="order-wrapper">
      <div className="order-banner">
        <h1>Order Completed</h1>
      </div>

      <div className="order-confirmation">
        <FaCheckCircle className="check-icon" />
        <h2>Thank you! Your order has been placed.</h2>
      </div>

      <div className="order-info-bar">
        <div><strong>Order ID:</strong> {_id}</div>
        <div><strong>Payment:</strong> {paymentMethod}</div>
        <div><strong>Date:</strong> {new Date(createdAt).toLocaleDateString("en-GB")}</div>
        <button className="download-btn" onClick={downloadInvoice}>
          <FaFileDownload /> Download Invoice
        </button>
      </div>

      <div className="order-details">
        <h3>Order Details</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Attributes</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <img
                    src={item.image || "/assets/placeholder.png"}
                    alt={item.name}
                    className="product-img"
                  />
                  <span>{item.name}</span>
                </td>
                <td>Size: {item.size || "-"}</td>
                <td>${(item.price || 0).toFixed(2)}</td>
                <td>{item.qty || 0}</td>
                <td>${((item.price || 0) * (item.qty || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="order-summary">
          <p><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></p>
          <p><span>Shipping:</span> <span>${shipping.toFixed(2)}</span></p>
          {taxAmount > 0 && <p><span>Taxes:</span> <span>${taxAmount.toFixed(2)}</span></p>}
          {discountAmount > 0 && <p className="discount"><span>Discount:</span> <span>-${discountAmount.toFixed(2)}</span></p>} {/* Only show if discount > 0 */}
          <hr />
          <p className="total"><span>Total:</span> <span>${total.toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
};

export default OrderCompleted;
