import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const API_URL = import.meta.env.VITE_API_URL;

const COLORS = ["#ff6600", "#ff944d", "#ffbb80", "#ff9966", "#ff7f32"];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [newCustomers, setNewCustomers] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [returnedOrders, setReturnedOrders] = useState(0);

  // 🧠 Prevent double API call in StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        // ✅ Fetch orders
        const ordersRes = await axios.get(`${API_URL}/api/orders`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const fetchedOrders = ordersRes.data.orders || [];
        setOrders(fetchedOrders);
        toast.success("Orders data loaded successfully! 🚀");

        // ✅ Fetch returned orders (only if admin token exists)
        if (token) {
          try {
            const returnsRes = await axios.get(`${API_URL}/api/returns`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            setReturnedOrders(returnsRes.data.returns.length || 0);
          } catch (err) {
            toast.error("Unable to fetch returned orders!");
            console.warn(
              "Cannot fetch returned orders:",
              err.response?.data?.message || err.message
            );
            setReturnedOrders(0);
          }
        } else {
          console.warn("Admin token missing, skipping returned orders fetch.");
          setReturnedOrders(0);
        }

        // ✅ Aggregate monthly data
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthlyData = Array(12)
          .fill(0)
          .map((_, i) => ({
            month: months[i],
            revenue: 0,
            orders: 0,
          }));

        fetchedOrders.forEach((order) => {
          const monthIndex = new Date(order.createdAt).getMonth();
          monthlyData[monthIndex].revenue += order.totalAmount;
          monthlyData[monthIndex].orders += 1;
        });

        setSalesData(monthlyData);

        const totalRevenue = fetchedOrders.reduce(
          (sum, o) => sum + o.totalAmount,
          0
        );
        const totalOrders = fetchedOrders.length;
        setStats({ totalRevenue, totalOrders });

        // ✅ Aggregate product sales
        const productMap = {};
        fetchedOrders.forEach((order) => {
          order.items.forEach((p) => {
            const productName = p.name;
            const productQty = p.qty || 1;
            if (productMap[productName])
              productMap[productName] += productQty;
            else productMap[productName] = productQty;
          });
        });

        setProductSales(
          Object.keys(productMap).map((name) => ({
            name,
            value: productMap[name],
          }))
        );

        // ✅ Fetch new customers
        const customersRes = await axios.get(`${API_URL}/api/user/new-customers`);

        setNewCustomers(customersRes.data.newCustomers || 0);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        toast.error("Failed to load dashboard data!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔔 Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your store’s performance, revenue, and orders overview.
          </p>
        </div>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
          onClick={() => toast("🛍️ Add Product feature coming soon!")}
        >
          + Add Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          amount={`$${stats.totalRevenue.toFixed(2)}`}
        />
        <StatCard title="Total Orders" amount={stats.totalOrders} />
        <StatCard title="New Customers" amount={newCustomers} />
        <StatCard title="Returned Orders" amount={returnedOrders} />
        <StatCard
          title="Avg Order Value"
          amount={`$${stats.totalOrders
            ? (stats.totalRevenue / stats.totalOrders).toFixed(2)
            : 0}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales & Orders Chart */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Monthly Sales & Orders
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f3f3"
              />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ borderRadius: "10px" }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar
                dataKey="revenue"
                barSize={22}
                fill="#ff6600"
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="orders"
                fill="rgba(255,102,0,0.15)"
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#e65a00"
                strokeWidth={2.5}
                dot={false}
                name="Orders"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Best Selling Categories
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productSales}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {productSales.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Orders
        </h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-100 text-left text-[0.7rem] font-medium text-orange-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Customer Email</th>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[0.76rem]">
                {orders.map((o, i) => (
                  <tr key={i} className="hover:bg-orange-50">
                    <td className="px-4 py-2">{o._id}</td>
                    <td className="px-4 py-2">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{o.user?.email || "N/A"}</td>
                    <td className="px-4 py-2">{o.paymentMethod}</td>
                    <td className="px-4 py-2 font-semibold">
                      ${o.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status.toLowerCase() === "delivered"
                          ? "bg-orange-50 text-orange-700 border border-orange-500"
                          : o.status.toLowerCase() === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : o.status.toLowerCase() === "processing"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2 text-right text-orange-500 font-semibold cursor-pointer hover:underline"
                      onClick={() => toast(`📦 Viewing Order: ${o._id}`)}
                    >
                      View
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, amount }) => (
  <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all">
    <h3 className="text-sm font-semibold uppercase opacity-90">{title}</h3>
    <p className="text-2xl font-bold mt-2">{amount}</p>
  </div>
);

export default Dashboard;
