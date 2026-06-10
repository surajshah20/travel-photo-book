// client/src/pages/Home.jsx
// Blushbook — Production Customer Dashboard

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Plus, Trash2, Edit3, Eye,
  ShoppingBag, LogOut, Clock, CheckCircle,
  Package, Download, ChevronRight, Images,
  Sparkles, User
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ─── Reusable Components ──────────────────────────────────

const StatCard = ({ icon, value, label, bg }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-none mb-0.5">{value}</p>
      <p className="text-gray-400 text-xs">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    draft: { label: "Draft", class: "bg-amber-50 text-amber-600 border border-amber-100" },
    complete: { label: "Ready", class: "bg-green-50 text-green-600 border border-green-100" },
    ordered: { label: "Ordered", class: "bg-blue-50 text-blue-600 border border-blue-100" },
  };
  const s = config[status] || { label: status, class: "bg-gray-50 text-gray-500 border border-gray-100" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.class}`}>
      {s.label}
    </span>
  );
};

// ─── Main Dashboard ───────────────────────────────────────
const Home = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [booksRes, ordersRes] = await Promise.all([
          api.get("/books"),
          api.get("/orders"),
        ]);
        setBooks(booksRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (bookId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this book? This cannot be undone.")) return;
    setDeletingId(bookId);
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(books.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const filteredBooks = activeFilter === "all"
    ? books
    : books.filter((b) => b.status === activeFilter);

  const recentBooks = books.slice(0, 8);

  const stats = [
    {
      label: "Total Books",
      value: books.length,
      icon: <Images className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
    },
    {
      label: "In Progress",
      value: books.filter((b) => b.status === "draft").length,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50",
    },
    {
      label: "Completed",
      value: books.filter((b) => b.status === "complete").length,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      label: "Orders",
      value: orders.length,
      icon: <Package className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
    },
  ];

  const filters = [
    { id: "all", label: "All" },
    { id: "draft", label: "In Progress" },
    { id: "complete", label: "Ready to Order" },
    { id: "ordered", label: "Ordered" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "Georgia, serif" }}
            >
              blush<span className="text-rose-500">book</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50"
            >
              <Images className="w-4 h-4" />
              My Books
            </button>
            <Link
              to="/orders"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Orders
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Create button — always visible */}
            <button
              onClick={() => navigate("/create")}
              className="hidden md:flex items-center gap-2 bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Book
            </button>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-100 hover:border-gray-200 transition"
              >
                <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-rose-600 text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 text-sm font-medium hidden sm:block max-w-24 truncate">
                  {user?.name?.split(" ")[0]}
                </span>
              </button>

              {/* Dropdown */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      <Images className="w-4 h-4 text-gray-400" />
                      My Books
                    </button>
                    <button
                      onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      My Orders
                    </button>
                    <button
                      onClick={() => { navigate("/create"); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                      Create New Book
                    </button>
                  </div>
                  <div className="border-t border-gray-50 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ─── HERO CTA ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-rose-500/5 rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400 text-xs font-semibold uppercase tracking-widest">
                  Welcome back
                </span>
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Hello, {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                {books.length === 0
                  ? "You haven't created any books yet. Start with your first travel photo book today."
                  : books.filter((b) => b.status === "draft").length > 0
                  ? `You have ${books.filter((b) => b.status === "draft").length} book${books.filter((b) => b.status === "draft").length > 1 ? "s" : ""} in progress. Continue where you left off.`
                  : "Your books are ready. Create a new one or order a printed copy."
                }
              </p>
            </div>
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-2.5 bg-rose-500 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-rose-400 transition shadow-lg flex-shrink-0 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              Create New Book
            </button>
          </div>
        </div>

        {/* ─── STATS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* ─── BOOKS SECTION ──────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2
                className="font-bold text-gray-900 text-lg"
                style={{ fontFamily: "Georgia, serif" }}
              >
                My Books
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {books.length} book{books.length !== 1 ? "s" : ""} total
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {filters.map((filter) => {
                const count = filter.id === "all"
                  ? books.length
                  : books.filter((b) => b.status === filter.id).length;

                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap
                      ${activeFilter === filter.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {filter.label}
                    {count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                        ${activeFilter === filter.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-500"
                        }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Loading your books...</p>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && filteredBooks.length === 0 && (
            <div className="text-center py-20 px-8">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-8 h-8 text-rose-300" />
              </div>
              <h3
                className="text-lg font-bold text-gray-800 mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {activeFilter === "all" ? "No books yet" : `No ${activeFilter === "draft" ? "in-progress" : activeFilter} books`}
              </h3>
              <p className="text-gray-400 text-sm mb-7 max-w-xs mx-auto leading-relaxed">
                {activeFilter === "all"
                  ? "Create your first travel photo book and turn your memories into something beautiful."
                  : "Nothing here yet. Books will appear here when their status changes."
                }
              </p>
              {activeFilter === "all" && (
                <button
                  onClick={() => navigate("/create")}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full font-semibold text-sm hover:bg-rose-500 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Book
                </button>
              )}
            </div>
          )}

          {/* ── Books Grid ── */}
          {!loading && filteredBooks.length > 0 && (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                {/* New book card */}
                {activeFilter === "all" && (
                  <button
                    onClick={() => navigate("/create")}
                    className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition group min-h-64 text-center"
                  >
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-rose-100 rounded-2xl flex items-center justify-center mb-3 transition">
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-rose-500 transition" />
                    </div>
                    <p className="font-semibold text-gray-400 group-hover:text-rose-500 text-sm transition mb-1">
                      New Book
                    </p>
                    <p className="text-gray-300 text-xs">
                      Start a new project
                    </p>
                  </button>
                )}

                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 group flex flex-col"
                  >
                    {/* Cover image */}
                    <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden flex-shrink-0">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <BookOpen className="w-10 h-10 text-rose-200" />
                          <p className="text-rose-300 text-xs font-medium">No cover yet</p>
                        </div>
                      )}

                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-200" />

                      {/* Status badge */}
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={book.status} />
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(book.id, e)}
                        disabled={deletingId === book.id}
                        className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                        title="Delete book"
                      >
                        {deletingId === book.id
                          ? <span className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-3 h-3 text-red-400" />
                        }
                      </button>
                    </div>

                    {/* Book info */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3
                        className="font-bold text-gray-900 truncate mb-0.5 text-sm"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {book.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate mb-1">
                        {book.destination || "No destination"}
                      </p>
                      {book.travel_date_start && (
                        <p className="text-gray-300 text-xs mb-3">
                          {new Date(book.travel_date_start).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Last edited */}
                      <p className="text-gray-300 text-xs mb-3 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(book.updated_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>

                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/editor/${book.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white py-2 rounded-xl text-xs font-semibold hover:bg-rose-500 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {book.status === "draft" ? "Continue" : "Edit"}
                          </button>
                          <button
                            onClick={() => navigate(`/preview/${book.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100 transition border border-gray-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                        </div>

                        {book.status === "complete" && (
                          <button
                            onClick={() => navigate(`/order/${book.id}`)}
                            className="w-full flex items-center justify-center gap-1.5 bg-rose-500 text-white py-2 rounded-xl text-xs font-semibold hover:bg-rose-600 transition"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Order Printed Book
                          </button>
                        )}

                        {book.status === "ordered" && (
                          <button
                            onClick={() => navigate("/orders")}
                            className="w-full flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-semibold hover:bg-blue-100 transition border border-blue-100"
                          >
                            <Package className="w-3.5 h-3.5" />
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RECENT ORDERS ──────────────────────────────── */}
        {orders.length > 0 && (
          <div className="mt-6 bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2
                  className="font-bold text-gray-900 text-lg"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Recent Orders
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Your printed book orders
                </p>
              </div>
              <Link
                to="/orders"
                className="text-rose-500 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {orders.slice(0, 3).map((order) => {
                const statusConfig = {
                  pending: { label: "Processing", class: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
                  paid: { label: "Printing", class: "bg-blue-50 text-blue-600 border border-blue-100" },
                  shipped: { label: "Shipped", class: "bg-purple-50 text-purple-600 border border-purple-100" },
                  delivered: { label: "Delivered", class: "bg-green-50 text-green-600 border border-green-100" },
                };
                const s = statusConfig[order.status] || statusConfig.pending;

                return (
                  <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                    {/* Book cover */}
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                      {order.cover_image_url ? (
                        <img src={order.cover_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-rose-200" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {order.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Order #{order.id} · {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* Status + price */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:inline-flex ${s.class}`}>
                        {s.label}
                      </span>
                      <p className="font-bold text-gray-800 text-sm">
                        ${order.total_price}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── QUICK ACTIONS ──────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/create")}
            className="bg-rose-500 text-white rounded-2xl p-5 text-left hover:bg-rose-600 transition group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-white mb-0.5">Create New Book</p>
            <p className="text-rose-200 text-xs">Start a new photo book project</p>
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="bg-white border border-gray-100 text-left rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-bold text-gray-800 mb-0.5">Track Orders</p>
            <p className="text-gray-400 text-xs">View and track your printed books</p>
          </button>

          <button
            onClick={() => {
              const completedBook = books.find((b) => b.status === "complete");
              if (completedBook) navigate(`/preview/${completedBook.id}`);
              else navigate("/create");
            }}
            className="bg-white border border-gray-100 text-left rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition group"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-green-500" />
            </div>
            <p className="font-bold text-gray-800 mb-0.5">Download PDF</p>
            <p className="text-gray-400 text-xs">Export your book as a PDF file</p>
          </button>
        </div>

        {/* ─── FOOTER ─────────────────────────────────────── */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 pb-8">
          <p className="text-gray-300 text-xs">
            © 2026 Blushbook Nepal
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-300 hover:text-red-400 text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;