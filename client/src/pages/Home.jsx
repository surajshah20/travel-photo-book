// client/src/pages/Home.jsx
// Blushbook — Production Customer Dashboard

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Plus, Trash2, Edit3, Eye,
  ShoppingBag, LogOut, Clock, CheckCircle,
  Package, ChevronRight, Images, MoreVertical,
  Calendar, MapPin
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";

// ─── REUSABLE COMPONENTS ──────────────────────────────────

const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">{value}</p>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    draft: { label: "Draft", classes: "bg-gray-100 text-gray-600" },
    complete: { label: "Ready to Print", classes: "bg-green-100 text-green-700" },
    ordered: { label: "Ordered", classes: "bg-blue-100 text-blue-700" },
  };
  const s = config[status] || { label: status, classes: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${s.classes}`}>
      {s.label}
    </span>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────
const Home = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

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
    if (!window.confirm("Are you sure you want to delete this book? This cannot be undone.")) return;
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

  const filteredBooks = activeFilter === "all"
    ? books
    : books.filter((b) => b.status === activeFilter);

  const filters = [
    { id: "all", label: "All Books" },
    { id: "draft", label: "In Progress" },
    { id: "complete", label: "Ready to Order" },
    { id: "ordered", label: "Ordered" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ─── HEADER AREA ─────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight font-display mb-2">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your photo books and track your recent orders.
            </p>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-rose-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Book
          </button>
        </header>

        {/* ─── QUICK STATS ─────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatCard 
              icon={<Images className="w-5 h-5" />} 
              value={books.length} 
              label="Total Books" 
            />
            <StatCard 
              icon={<Clock className="w-5 h-5" />} 
              value={books.filter(b => b.status === "draft").length} 
              label="In Progress" 
            />
            <StatCard 
              icon={<CheckCircle className="w-5 h-5" />} 
              value={books.filter(b => b.status === "complete").length} 
              label="Ready to Print" 
            />
            <StatCard 
              icon={<Package className="w-5 h-5" />} 
              value={orders.length} 
              label="Total Orders" 
            />
          </div>
        )}

        {/* ─── WORKSPACE DIVIDER ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT: MY BOOKS (Takes up 2/3 width on large screens) */}
          <section className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-display">My Workspace</h2>
              
              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
                      ${activeFilter === filter.id
                        ? "bg-gray-200 text-gray-900"
                        : "bg-transparent text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 text-sm font-medium">Loading your workspace...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">No books found</h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  {activeFilter === "all" 
                    ? "Your workspace is empty. Start your first project to bring your memories to life." 
                    : `You don't have any books marked as '${activeFilter}'.`}
                </p>
                {activeFilter === "all" && (
                  <button
                    onClick={() => navigate("/create")}
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-rose-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Start a New Book
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Always show a "New Book" card in the "All" view */}
                {activeFilter === "all" && (
                  <button
                    onClick={() => navigate("/create")}
                    className="group flex flex-col items-center justify-center h-full min-h-[340px] rounded-2xl border-2 border-dashed border-gray-200 bg-transparent hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-gray-900" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">Create New Book</span>
                    <span className="text-xs text-gray-500 mt-1">Start a fresh canvas</span>
                  </button>
                )}

                {/* Book Cards */}
                {filteredBooks.map((book) => (
                  <div key={book.id} className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    
                    {/* Cover Area */}
                    <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-t-2xl overflow-hidden p-4 flex items-center justify-center">
                      {book.cover_image_url ? (
                        <div className="relative w-full h-full rounded-md overflow-hidden shadow-md group-hover:scale-[1.02] transition-transform duration-500">
                           {/* Book Spine Shadow Effect */}
                           <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-10" />
                           <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-white/50">
                          <Images className="w-8 h-8 text-gray-300 mb-2" />
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">No Cover</span>
                        </div>
                      )}

                      {/* Floating Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button
                          onClick={() => navigate(`/preview/${book.id}`)}
                          className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 transition-transform hover:scale-110 shadow-lg"
                          title="Preview Book"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(book.id, e)}
                          disabled={deletingId === book.id}
                          className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-50 transition-transform hover:scale-110 shadow-lg disabled:opacity-50"
                          title="Delete Book"
                        >
                          {deletingId === book.id ? (
                            <span className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Book Metadata */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-base truncate pr-2 font-display">
                          {book.title || "Untitled Book"}
                        </h3>
                        <StatusBadge status={book.status} />
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{book.destination || "Destination unknown"}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Edited {new Date(book.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-50">
                        {book.status === "complete" ? (
                          <button
                            onClick={() => navigate(`/order/${book.id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-500 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Order Print
                          </button>
                        ) : book.status === "ordered" ? (
                          <button
                            onClick={() => navigate("/orders")}
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-100"
                          >
                            <Package className="w-4 h-4" />
                            Track Order
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(parseInt(book.photo_count) === 0 ? `/upload/${book.id}` : `/editor/${book.id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:border-gray-900 hover:text-gray-900 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            {parseInt(book.photo_count) === 0 ? "Add Photos" : "Continue Editing"}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: RECENT ORDERS (Takes up 1/3 width on large screens) */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 font-display">Recent Orders</h2>
                <Link to="/orders" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                  View All
                </Link>
              </div>

              {!loading && orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your printed books will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.slice(0, 4).map((order) => {
                    // Status config for sidebar
                    const statusConfig = {
                      pending: { label: "Processing", dot: "bg-yellow-400" },
                      paid: { label: "Printing", dot: "bg-blue-400" },
                      shipped: { label: "Shipped", dot: "bg-purple-400" },
                      delivered: { label: "Delivered", dot: "bg-green-400" },
                    };
                    const s = statusConfig[order.status] || statusConfig.pending;

                    return (
                      <div key={order.id} className="group flex gap-3 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                        {/* Mini Cover */}
                        <div className="w-12 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200/50">
                          {order.cover_image_url ? (
                            <img src={order.cover_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-sm font-bold text-gray-900 truncate mb-0.5">{order.title}</p>
                          <p className="text-xs text-gray-500 mb-1.5">Order #{String(order.id).padStart(5, '0')}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{s.label}</span>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

        </div>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs font-medium">
            © {new Date().getFullYear()} Blushbook Nepal. All rights reserved.
          </p>
          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </footer>

    </div>
  );
};

export default Home;