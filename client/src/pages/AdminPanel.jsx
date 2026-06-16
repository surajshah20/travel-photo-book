// client/src/pages/AdminPanel.jsx
// BlushBook — Production Admin Command Center

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, ShoppingBag, Package,
  TrendingUp, Clock, CheckCircle, Truck,
  AlertCircle, ChevronLeft, ChevronRight, Search, Eye
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../design-system/AppNavbar";

// ─── REUSABLE COMPONENTS ──────────────────────────────────
const AdminStatCard = ({ title, value, subtext, icon, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 border border-gray-100">
        {icon}
      </div>
      {trend && (
        <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-3xl font-black text-gray-900 font-display mb-1 tracking-tight">
      {value}
    </h3>
    <p className="text-sm font-bold text-gray-900 mb-0.5">{title}</p>
    <p className="text-xs font-medium text-gray-500">{subtext}</p>
  </div>
);

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────
const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Data
  const [stats, setStats] = useState(null);
  const [ordersData, setOrdersData] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);

  // Fetch Data
  const fetchDashboardData = async (page = 1) => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, booksRes] = await Promise.all([
        api.get("/admin/orders/stats"),
        api.get(`/admin/orders?page=${page}&limit=15`),
        api.get("/admin/users"), 
        api.get("/admin/books"),
      ]);
      
      setStats(statsRes.data);
      setOrdersData(ordersRes.data); 
      setUsers(usersRes.data);
      setBooks(booksRes.data);
    } catch (err) {
      console.error("Admin data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      // Optimistically update UI
      setOrdersData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o)
      }));
      // Refresh stats quietly in background
      api.get("/admin/orders/stats").then(res => setStats(res.data));
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "orders", label: "Orders Ledger", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "users", label: "Customer Base", icon: <Users className="w-4 h-4" /> },
  ];

  // ✅ Added cancellation_requested color mapping
  const STATUS_COLORS = {
    pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    printing: "bg-blue-50 text-blue-700 ring-blue-200",
    shipped: "bg-purple-50 text-purple-700 ring-purple-200",
    delivered: "bg-green-50 text-green-700 ring-green-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    cancellation_requested: "bg-orange-50 text-orange-700 ring-orange-200",
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <AppNavbar 
        title="Admin Command Center" 
        backTo="/dashboard" 
        backLabel="Exit Admin" 
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* ─── HEADER & TABS ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-2">
              System Overview
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Welcome back, Admin. Here is what's happening today.
            </p>
          </div>
          
          <div className="flex bg-white border border-gray-200 p-1.5 rounded-full shadow-sm overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap
                  ${activeTab === tab.id 
                    ? "bg-gray-900 text-white shadow-md" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard 
                title="Total Revenue" 
                value={`Rs. ${Number(stats?.total_revenue || 0).toLocaleString()}`} 
                subtext="Gross volume (paid orders)" 
                icon={<TrendingUp className="w-6 h-6" />} 
                trend="Live"
              />
              <AdminStatCard 
                title="Active Orders" 
                value={Number(stats?.pending || 0) + Number(stats?.printing || 0)} 
                subtext="Requires fulfillment action" 
                icon={<Clock className="w-6 h-6" />} 
              />
              <AdminStatCard 
                title="Shipped/Delivered" 
                value={Number(stats?.shipped || 0) + Number(stats?.delivered || 0)} 
                subtext="Successfully dispatched" 
                icon={<Truck className="w-6 h-6" />} 
              />
              <AdminStatCard 
                title="Total Customers" 
                value={users.length} 
                subtext="Registered accounts" 
                icon={<Users className="w-6 h-6" />} 
              />
            </div>

            {/* Quick Action Boards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Needs Attention */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 font-display">Needs Attention</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-rose-500 hover:text-rose-600">View All</button>
                </div>
                
                <div className="space-y-4">
                  {ordersData.orders.filter(o => o.order_status === "pending" || o.order_status === "confirmed" || o.order_status === "cancellation_requested").slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-0.5">Order #{String(order.id).padStart(5, '0')}</p>
                        <p className="text-xs font-medium text-gray-500">{order.shipping_name} • Rs. {order.amount_npr}</p>
                      </div>
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                      >
                        {order.order_status === "cancellation_requested" && <option value="cancellation_requested" disabled>Cancel Req.</option>}
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="printing">Printing</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  ))}
                  {ordersData.orders.filter(o => o.order_status === "pending" || o.order_status === "confirmed" || o.order_status === "cancellation_requested").length === 0 && (
                    <p className="text-sm text-gray-400 font-medium py-4">No pending orders. You're all caught up!</p>
                  )}
                </div>
              </div>

              {/* System Health / Recent Activity */}
              <div className="bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm text-white">
                <h2 className="text-lg font-bold font-display mb-6">System Health</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <span className="text-sm font-medium text-gray-400">Database Connection</span>
                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Online</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <span className="text-sm font-medium text-gray-400">Total Books Created</span>
                    <span className="text-lg font-black">{books.length}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <span className="text-sm font-medium text-gray-400">Conversion Rate</span>
                    <span className="text-lg font-black">{books.length > 0 ? Math.round((stats?.total_paid / books.length) * 100) : 0}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── ORDERS LEDGER TAB ─── */}
        {activeTab === "orders" && (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display">Orders Ledger</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Managing {ordersData.total} total orders.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordersData.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <span className="text-sm font-bold text-gray-900 font-mono">#{String(order.id).padStart(5, '0')}</span>
                        <br/>
                        <span className="text-[11px] font-medium text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-gray-900">{order.shipping_name}</p>
                        <p className="text-xs font-medium text-gray-500 truncate max-w-[150px]">{order.shipping_city}, {order.shipping_district}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{order.book_title}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{order.book_type}</p>
                        
                        {/* ✅ CANCELLATION REASON RENDERED HERE */}
                        {order.order_status === "cancellation_requested" && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-1 max-w-[200px]">
                            <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Cancel Reason:
                            </p>
                            <p className="text-xs font-medium text-orange-900 leading-snug">
                              "{order.cancellation_reason || "No reason provided"}"
                            </p>
                          </div>
                        )}
                      </td>
                      
                      {/* ✅ UPDATED COLUMN: Displays Price, Payment Method, and View Receipt Button */}
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-black text-gray-900">Rs. {order.amount_npr}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {order.payment_method === 'qr_transfer' ? 'Manual QR' : order.payment_method} ({order.payment_status})
                        </span>
                        
                        {order.payment_method === 'qr_transfer' && order.payment_proof_url && (
                          <a 
                            href={order.payment_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View Receipt
                          </a>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 inset-ring ${STATUS_COLORS[order.order_status]}`}>
                          {order.order_status === "cancellation_requested" ? "Cancel Req." : order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer w-full max-w-[120px]"
                        >
                          {order.order_status === "cancellation_requested" && <option value="cancellation_requested" disabled>Cancel Req.</option>}
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="printing">Printing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Page {ordersData.page} of {ordersData.pages}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={ordersData.page === 1}
                  onClick={() => fetchDashboardData(ordersData.page - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button 
                  disabled={ordersData.page === ordersData.pages}
                  onClick={() => fetchDashboardData(ordersData.page + 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── CUSTOMER BASE TAB ─── */}
        {activeTab === "users" && (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display">Customer Base</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Total registered accounts: {users.length}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Books Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-sm font-black">{u.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{u.name}</p>
                            <span className="text-[10px] font-bold text-gray-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-black text-gray-900">
                        {books.filter(b => b.user_id === u.id).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminPanel;