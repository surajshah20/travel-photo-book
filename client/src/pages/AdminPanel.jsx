// client/src/pages/AdminPanel.jsx
// Blushbook — Admin Dashboard

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Users, ShoppingBag, DollarSign,
  Package, ChevronLeft, Eye, TrendingUp,
  Clock, CheckCircle, Truck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const AdminPanel = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [updatingOrder, setUpdatingOrder] = useState(null);


  const loadData = async () => {
    try {
      const [ordersRes, usersRes, booksRes] = await Promise.all([
        api.get("/admin/orders"),
        api.get("/admin/users"),
        api.get("/admin/books"),
      ]);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setBooks(booksRes.data);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrder(orderId);
    try {
      await api.put(`/admin/orders/${orderId}`, { status });
      setOrders(orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "pending")
    .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

  const statusConfig = {
    pending: { label: "Pending", class: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
    paid: { label: "Paid", class: "bg-blue-50 text-blue-600 border border-blue-100" },
    shipped: { label: "Shipped", class: "bg-purple-50 text-purple-600 border border-purple-100" },
    delivered: { label: "Delivered", class: "bg-green-50 text-green-600 border border-green-100" },
  };

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
      sub: `${orders.filter((o) => o.status !== "pending").length} paid orders`,
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
      sub: `${orders.filter((o) => o.status === "pending").length} pending`,
    },
    {
      label: "Total Users",
      value: users.length,
      icon: <Users className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
      sub: "registered accounts",
    },
    {
      label: "Total Books",
      value: books.length,
      icon: <BookOpen className="w-5 h-5 text-purple-500" />,
      bg: "bg-purple-50",
      sub: `${books.filter((b) => b.status === "ordered").length} ordered`,
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { id: "books", label: "Books", icon: <BookOpen className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-gray-900"
              style={{ fontFamily: "Georgia, serif" }}
            >
              blush<span className="text-rose-500">book</span>
            </span>
          </div>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500 text-sm font-medium">Admin Panel</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
            <span className="text-rose-500 text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-gray-600 text-sm">{user?.name}</span>
          <button
            onClick={() => { logoutUser(); navigate("/login"); }}
            className="text-gray-400 hover:text-red-500 text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Manage orders, users, and books from one place
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-xs text-gray-300 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition
                ${activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-rose-500 text-xs font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {order.title || `Order #${order.id}`}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {order.shipping_name} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">
                        ${order.total_price}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[order.status]?.class}`}>
                        {statusConfig[order.status]?.label}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-300 text-sm">
                    No orders yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Users</h3>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-rose-500 text-xs font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-rose-500 text-sm font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </div>
                    <p className="ml-auto text-gray-300 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-300 text-sm">
                    No users yet
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-bold text-gray-800 mb-5">Order Status</h3>
              <div className="space-y-4">
                {[
                  { status: "pending", icon: <Clock className="w-4 h-4 text-yellow-500" />, label: "Pending", color: "bg-yellow-400" },
                  { status: "paid", icon: <CheckCircle className="w-4 h-4 text-blue-500" />, label: "Paid", color: "bg-blue-400" },
                  { status: "shipped", icon: <Truck className="w-4 h-4 text-purple-500" />, label: "Shipped", color: "bg-purple-400" },
                  { status: "delivered", icon: <Package className="w-4 h-4 text-green-500" />, label: "Delivered", color: "bg-green-400" },
                ].map((item) => {
                  const count = orders.filter((o) => o.status === item.status).length;
                  const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`${item.color} h-1.5 rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-1">Total Revenue</h3>
              <p className="text-4xl font-bold mt-4 mb-1">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-rose-200 text-sm">
                From {orders.filter((o) => o.status !== "pending").length} completed orders
              </p>
              <div className="mt-6 pt-6 border-t border-rose-400">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-rose-200 text-xs">Avg Order Value</p>
                    <p className="font-bold text-lg">
                      ${orders.length > 0
                        ? (totalRevenue / orders.length).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-rose-200 text-xs">This Month</p>
                    <p className="font-bold text-lg">
                      ${orders
                        .filter((o) => {
                          const d = new Date(o.created_at);
                          const now = new Date();
                          return d.getMonth() === now.getMonth() &&
                            d.getFullYear() === now.getFullYear();
                        })
                        .reduce((s, o) => s + parseFloat(o.total_price || 0), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">
                All Orders
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({orders.length})
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["Order ID", "Customer", "Book", "Amount", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-sm font-mono text-gray-400">
                        #{order.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {order.shipping_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.shipping_city}, {order.shipping_country}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {order.cover_image_url && (
                            <img
                              src={order.cover_image_url}
                              alt=""
                              className="w-8 h-8 object-cover rounded-lg"
                            />
                          )}
                          <p className="text-sm text-gray-700 truncate max-w-28">
                            {order.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-800">
                        ${order.total_price}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusConfig[order.status]?.class}`}>
                          {statusConfig[order.status]?.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingOrder === order.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-300 bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-300 text-sm">
                  No orders yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">
                All Users
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({users.length})
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["ID", "Name", "Email", "Joined", "Books"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-sm font-mono text-gray-400">
                        #{u.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-rose-500 text-xs font-bold">
                              {u.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {u.email}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {books.filter((b) => b.user_id === u.id).length} books
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-300 text-sm">
                  No users yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BOOKS TAB ── */}
        {activeTab === "books" && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">
                All Books
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({books.length})
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["Book", "User", "Type", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {book.cover_image_url ? (
                            <img
                              src={book.cover_image_url}
                              alt=""
                              className="w-10 h-8 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-rose-300" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-32">
                              {book.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-32">
                              {book.destination}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        User #{book.user_id}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                          {book.book_type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                          ${book.status === "draft" ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
                          : book.status === "complete" ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-green-50 text-green-600 border border-green-100"}`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(book.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => navigate(`/preview/${book.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {books.length === 0 && (
                <div className="text-center py-12 text-gray-300 text-sm">
                  No books yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;