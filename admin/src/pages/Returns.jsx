import React, { useEffect, useState } from "react";
import { AiOutlineDownload, AiOutlineSearch } from "react-icons/ai";
import { FiFilter, FiRefreshCw, FiPrinter, FiEye, FiX } from "react-icons/fi";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [methodFilter, setMethodFilter] = useState("");
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const formatPrice = (amount) => {
        const num = Number(amount) || 0;
        return `$ ${num.toFixed(2)}`;
    };

    const getCustomerName = (user) => {
        return user?.firstName
            ? `${user.firstName} ${user.lastName}`
            : user?.email || "Unknown";
    };

    // Fetch returns
    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await fetch("http://localhost:4000/api/returns", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                const data = await res.json();
                if (data.returns) {
                    setReturns(data.returns);
                    setFilteredReturns(data.returns);
                }
            } catch (error) {
                console.error("Error fetching returns:", error);
            }
        };
        fetchReturns();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-700";
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "Rejected":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Filter returns
    const handleFilter = () => {
        const filtered = returns.filter((ret) => {
            const customerName = getCustomerName(ret.user);
            const matchesSearch = search
                ? customerName.toLowerCase().includes(search.toLowerCase())
                : true;
            const matchesStatus = statusFilter ? ret.status === statusFilter : true;
            const matchesMethod = methodFilter ? ret.paymentMethod === methodFilter : true;
            return matchesSearch && matchesStatus && matchesMethod;
        });
        setFilteredReturns(filtered);
    };

    const handleReset = () => {
        setSearch("");
        setStatusFilter("");
        setMethodFilter("");
        setFilteredReturns(returns);
    };

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Returns");

        worksheet.columns = [
            { header: "Return ID", key: "_id", width: 25 },
            { header: "Customer", key: "customer", width: 25 },
            { header: "Method", key: "method", width: 15 },
            { header: "Amount", key: "amount", width: 15 },
            { header: "Date", key: "date", width: 25 },
            { header: "Status", key: "status", width: 15 },
        ];

        filteredReturns.forEach((ret) =>
            worksheet.addRow({
                _id: ret._id,
                customer: getCustomerName(ret.user),
                method: ret.paymentMethod,
                amount: formatPrice(ret.totalAmount),
                date: new Date(ret.createdAt).toLocaleString(),
                status: ret.status,
            })
        );

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Admin_Returns.xlsx";
        link.click();
    };

    const handlePrint = async (ret) => {
        const logoUrl = "../logo.png";
        const doc = new jsPDF("p", "pt");
        const themeColor = [255, 102, 0];

        let logoBase64 = null;
        try {
            const logoResponse = await fetch(logoUrl);
            if (logoResponse.ok) {
                const blob = await logoResponse.blob();
                logoBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (error) {
            console.warn("Logo not found, skipping:", error);
        }

        if (logoBase64) doc.addImage(logoBase64, "PNG", 40, 30, 100, 90);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text("123 Street, City, Country", 140, 65);
        doc.text("Phone: +1 234 567 890", 140, 80);
        doc.text("Email: info@company.com", 140, 95);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(...themeColor);
        doc.text("RETURN INVOICE", 550, 60, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Return ID: #${ret._id}`, 550, 90, { align: "right" });
        doc.text(`Date: ${new Date(ret.createdAt).toLocaleDateString()}`, 550, 105, { align: "right" });
        doc.text(`Payment: ${ret.paymentMethod}`, 550, 120, { align: "right" });

        doc.setDrawColor(200);
        doc.line(40, 150, 560, 150);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Customer:", 40, 170);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(getCustomerName(ret.user), 40, 185);

        autoTable(doc, {
            startY: 210,
            head: [["QTY", "DESCRIPTION", "UNIT PRICE ($)", "TOTAL ($)"]],
            body: ret.items?.map((item) => [
                item.qty || 0,
                item.name || "N/A",
                (item.price || 0).toFixed(2),
                ((item.price || 0) * (item.qty || 0)).toFixed(2),
            ]) || [],
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

        const totalY = doc.lastAutoTable.finalY + 20;
        doc.setFillColor(...themeColor);
        doc.roundedRect(380, totalY, 180, 35, 4, 4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255);
        doc.text(`GRAND TOTAL: ${formatPrice(ret.totalAmount)}`, 470, totalY + 22, { align: "center" });

        const footerY = totalY + 70;
        doc.setDrawColor(200);
        doc.line(40, footerY, 560, footerY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...themeColor);
        doc.text("Thank you for your business!", 40, footerY + 20);

        doc.save(`return_${ret._id}.pdf`);
    };

    return (
        <div className="px-10 py-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#e65a00" }}>
                        Returns
                    </h1>
                    <p className="mt-1" style={{ color: "#666666" }}>
                        Manage and track all product returns efficiently.
                    </p>
                </div>

                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                    <AiOutlineDownload className="text-lg" />
                    Download Excel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-5 gap-4">
                    <div className="relative">
                        <AiOutlineSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Customer"
                            className="border border-gray-300 rounded-lg pl-10 pr-3 p-2 text-sm w-full focus:ring-2 focus:ring-[#ff6600] outline-none"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 text-sm w-full focus:ring-2 focus:ring-[#ff6600]"
                    >
                        <option value="">All Status</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                    </select>

                    <select
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 text-sm w-full focus:ring-2 focus:ring-[#ff6600]"
                    >
                        <option value="">All Methods</option>
                        <option value="COD">COD</option>
                        <option value="ONLINE">Online</option>
                        <option value="UPI">UPI</option>
                    </select>

                    <button
                        onClick={handleFilter}
                        className="flex items-center justify-center gap-2 bg-[#ff6600] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e65c00] transition-all shadow-sm hover:shadow-md"
                    >
                        <FiFilter /> Filter
                    </button>

                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all"
                    >
                        <FiRefreshCw /> Reset
                    </button>
                </div>
            </div>

            {/* Returns Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
                <table className="min-w-full table-auto">
                    <thead className="bg-[#ff6600]/10 text-gray-700 uppercase text-xs font-semibold">
                        <tr>
                            <th className="py-3 px-5 text-left">Return ID</th>
                            <th className="py-3 px-5 text-left">Order Time</th>
                            <th className="py-3 px-5 text-left">Customer</th>
                            <th className="py-3 px-5 text-left">Method</th>
                            <th className="py-3 px-5 text-left">Amount</th>
                            <th className="py-3 px-5 text-left">Status</th>
                            <th className="py-3 px-5 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredReturns.length > 0 ? (
                            filteredReturns.map((ret) => (
                                <tr key={ret._id} className="border-b hover:bg-[#ff6600]/5 transition-colors duration-150">
                                    <td
                                        className="py-3 px-5 cursor-pointer hover:text-[#ff6600]"
                                        onClick={() => {
                                            setSelectedReturn(ret);
                                            setShowModal(true);
                                        }}
                                    >
                                        <div className="flex flex-col justify-center items-center h-full gap-1">
                                            <span className="text-[0.75rem]">
                                                #{ret._id.slice(0, ret._id.length / 2).toUpperCase()}
                                            </span>
                                            <span className="text-[0.75rem]">
                                                {ret._id.slice(ret._id.length / 2).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-gray-600  whitespace-nowrap">
                                        {new Date(ret.createdAt).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-5 text-gray-600  whitespace-nowrap">
                                        {getCustomerName(ret.user)}
                                    </td>
                                    <td className="py-3 px-5 text-gray-600">{ret.paymentMethod}</td>
                                    <td className="py-3 px-5 text-gray-600  whitespace-nowrap">
                                        {formatPrice(ret.totalAmount)}
                                    </td>
                                    <td className="py-3 px-5">
                                        <span
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full  whitespace-nowrap ${getStatusColor(
                                                ret.status
                                            )}`}
                                        >
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-5 flex gap-2">
                                        <button
                                            onClick={() => handlePrint(ret)}
                                            className="bg-gray-100 text-gray-700 p-2.5 rounded-md text-sm hover:bg-gray-200 transition-all"
                                        >
                                            <FiPrinter />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedReturn(ret);
                                                setShowModal(true);
                                            }}
                                            className="bg-[#ff6600]/10 text-[#ff6600] p-2.5 rounded-md text-sm hover:bg-[#ff6600]/20 transition-all"
                                        >
                                            <FiEye />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500 font-medium">
                                    No returns found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Returns Modal */}
            {showModal && selectedReturn && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className="relative ml-70 bg-white rounded-xl p-6 w-[400px] shadow-xl z-50">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowModal(false)}
                        >
                            <FiX size={20} />
                        </button>

                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Return Details</h2>

                        <div className="text-sm text-gray-600 space-y-2">
                            <p>
                                <strong>Return ID:</strong>{" "}
                                <div className="flex flex-col">
                                    <span>#{selectedReturn._id.slice(0, selectedReturn._id.length / 2).toUpperCase()}</span>
                                    <span>{selectedReturn._id.slice(selectedReturn._id.length / 2).toUpperCase()}</span>
                                </div>
                            </p>
                            <p>
                                <strong>Customer:</strong>{" "}
                                {getCustomerName(selectedReturn.user)}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedReturn.status}
                            </p>
                            <p>
                                <strong>Method:</strong> {selectedReturn.paymentMethod}
                            </p>
                            <p>
                                <strong>Amount:</strong> {formatPrice(selectedReturn.totalAmount)}
                            </p>
                            <p>
                                <strong>Order Time:</strong> {new Date(selectedReturn.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Returns;
