// client/src/pages/Home.jsx
// FIXES: H1 (skeleton loaders), H8 (contrast), H9 (focus), H12 (tap targets)
// FIXES: Mobile card layout, empty state quality, accessible status badges

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Plus, Trash2, Edit3, Eye,
  ShoppingBag, LogOut, Clock, CheckCircle,
  Package, ChevronRight, Images,
  Calendar, MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";

// ─── SKELETON COMPONENTS (Fix H1) ────────────────────────
const SkeletonCard = () => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #F0F0F0",
      overflow: "hidden",
    }}
    aria-hidden="true"
  >
    <div className="skeleton" style={{ aspectRatio: "3/4", width: "100%" }} />
    <div style={{ padding: "16px" }}>
      <div className="skeleton skeleton-title" style={{ width: "70%", marginBottom: 10 }} />
      <div className="skeleton skeleton-text" style={{ width: "50%", marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: "40%", marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 36, borderRadius: 10 }} />
    </div>
  </div>
);

const SkeletonStatCard = () => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #F0F0F0",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}
    aria-hidden="true"
  >
    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-title" style={{ width: "60%", marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: "80%" }} />
    </div>
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────
const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1" aria-label={`${value} ${label}`}>
        {value}
      </p>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ─── STATUS BADGE ─────────────────────────────────────────
const STATUS_CONFIG = {
  draft:    { label: "Draft",          classes: "bg-gray-100 text-gray-700"     },
  complete: { label: "Ready to Print", classes: "bg-green-100 text-green-800"   },
  ordered:  { label: "Ordered",        classes: "bg-blue-100 text-blue-800"     },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || { label: status, classes: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${s.classes}`}
      aria-label={`Status: ${s.label}`}
    >
      {s.label}
    </span>
  );
};

// ─── BOOK CARD ────────────────────────────────────────────
const BookCard = ({ book, onDelete, deletingId }) => {
  const navigate = useNavigate();
  const isDeleting = deletingId === book.id;
  const photoCount = parseInt(book.photo_count) || 0;

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${book.title || "this book"}"? This cannot be undone.`)) return;
    onDelete(book.id);
  }, [book.id, book.title, onDelete]);

  const primaryAction = book.status === "complete"
    ? { label: "Order Print", icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />, path: `/order/${book.id}` }
    : book.status === "ordered"
    ? { label: "Track Order", icon: <Package className="w-4 h-4" aria-hidden="true" />, path: "/orders" }
    : { label: photoCount === 0 ? "Add Photos" : "Continue Editing", icon: <Edit3 className="w-4 h-4" aria-hidden="true" />, path: photoCount === 0 ? `/upload/${book.id}` : `/editor/${book.id}` };

  return (
    <article
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
      aria-label={`${book.title || "Untitled Book"} — ${STATUS_CONFIG[book.status]?.label || book.status}`}
    >
      {/* Cover Area */}
      <div className="relative w-full bg-gray-100 rounded-t-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
        {book.cover_image_url ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-10 rounded-tl-2xl" aria-hidden="true" />
            <img
              src={book.cover_image_url}
              alt={`Cover of ${book.title || "Untitled Book"}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
              width="300"
              height="400"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
            <Images className="w-8 h-8 text-gray-300 mb-2" aria-hidden="true" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">No Cover</span>
          </div>
        )}

        {/* Floating actions overlay */}
        <div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]"
          aria-hidden="true"
        >
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/preview/${book.id}`); }}
            className="w-11 h-11 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 hover:scale-110 transition-all shadow-lg"
            aria-label={`Preview ${book.title || "book"}`}
            tabIndex={-1}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-11 h-11 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all shadow-lg disabled:opacity-50"
            aria-label={`Delete ${book.title || "book"}`}
            tabIndex={-1}
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-900 text-base truncate font-display">
            {book.title || "Untitled Book"}
          </h3>
          <StatusBadge status={book.status} />
        </div>

        {book.destination && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{book.destination}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <time dateTime={book.updated_at}>
            Edited {new Date(book.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </time>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50">
          <button
            onClick={() => navigate(primaryAction.path)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-colors min-h-[44px] ${
              book.status === "complete"
                ? "bg-gray-900 text-white hover:bg-rose-500"
                : book.status === "ordered"
                ? "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100"
                : "bg-white border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900"
            }`}
            aria-label={`${primaryAction.label} for ${book.title || "this book"}`}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        </div>
      </div>
    </article>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────
const EmptyWorkspace = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-5" aria-hidden="true">
      <BookOpen className="w-9 h-9 text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">Your workspace is empty</h3>
    <p className="text-gray-500 text-sm max-w-xs mb-7 leading-relaxed">
      Upload your photos and let AI build your first photo book in seconds.
    </p>
    <button
      onClick={onCreateClick}
      className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-rose-500 transition-colors min-h-[48px]"
    >
      <Plus className="w-4 h-4" aria-hidden="true" />
      Create your first book
    </button>
  </div>
);

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
    let cancelled = false;
    const loadData = async () => {
      try {
        const [booksRes, ordersRes] = await Promise.all([
          api.get("/books"),
          api.get("/orders"),
        ]);
        if (!cancelled) {
          setBooks(booksRes.data);
          setOrders(ordersRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = useCallback(async (bookId) => {
    setDeletingId(bookId);
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const filteredBooks = activeFilter === "all"
    ? books
    : books.filter(b => b.status === activeFilter);

  const filters = [
    { id: "all",      label: "All" },
    { id: "draft",    label: "In Progress" },
    { id: "complete", label: "Ready" },
    { id: "ordered",  label: "Ordered" },
  ];

  const statsData = [
    { icon: <Images className="w-5 h-5" aria-hidden="true" />,      value: books.length,                             label: "Books" },
    { icon: <Clock className="w-5 h-5" aria-hidden="true" />,       value: books.filter(b => b.status === "draft").length,    label: "Drafts" },
    { icon: <CheckCircle className="w-5 h-5" aria-hidden="true" />, value: books.filter(b => b.status === "complete").length, label: "Ready" },
    { icon: <Package className="w-5 h-5" aria-hidden="true" />,     value: orders.length,                            label: "Orders" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10" id="main-content">

        {/* ─── HEADER ──────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-display mb-1">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-gray-500 text-sm">Manage your photo books and orders.</p>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-rose-500 transition-colors shadow-sm min-h-[48px] self-start sm:self-auto"
            aria-label="Create a new photo book"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Book
          </button>
        </header>

        {/* ─── STATS ───────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10" aria-busy="true" aria-label="Loading statistics">
            {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        ) : (
          <section aria-label="Your statistics" className="mb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statsData.map(s => <StatCard key={s.label} {...s} />)}
            </div>
          </section>
        )}

        {books.length > 0 && (
  <section className="mb-10">
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        ✨ Ready for your next story?
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        You've already created {books.length} book{books.length > 1 ? "s" : ""}.
        Start another memory book today.
      </p>

      <button
        onClick={() => navigate("/create")}
        className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-500 transition-colors"
      >
        Create Another Book
      </button>
    </div>
  </section>
)}

        {/* ─── WORKSPACE ───────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT: BOOKS */}
          <section className="flex-1 min-w-0" aria-label="My books workspace">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-gray-900 font-display">My Workspace</h2>

              {/* Filter pills */}
              <div
                className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar"
                role="tablist"
                aria-label="Filter books"
              >
                {filters.map(f => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={activeFilter === f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
                      activeFilter === f.id
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {f.label}
                    {f.id !== "all" && !loading && (
                      <span className={`ml-1.5 text-[10px] font-bold ${activeFilter === f.id ? "text-gray-300" : "text-gray-400"}`}>
                        {books.filter(b => b.status === f.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading skeletons */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading books">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredBooks.length === 0 && activeFilter === "all" ? (
              <EmptyWorkspace onCreateClick={() => navigate("/create")} />
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm font-medium">
                No books with status "{filters.find(f => f.id === activeFilter)?.label}".
              </div>
            ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">                {/* "Add new" card — first position */}
                {activeFilter === "all" && (
                  <button
                    onClick={() => navigate("/create")}
                    className="group flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 bg-transparent hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
                    aria-label="Create a new book"
                  >
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                      <Plus className="w-5 h-5 text-gray-900" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">New Book</span>
                  </button>
                )}
                {filteredBooks.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: RECENT ORDERS */}
          <aside
            className="w-full lg:w-72 xl:w-80 flex-shrink-0"
            aria-label="Recent orders"
          >
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm lg:sticky lg:top-24">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-bold text-gray-900 font-display">Recent Orders</h2>
                <Link
                  to="/orders"
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="View all orders"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div aria-busy="true" aria-label="Loading orders">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-2 mb-3" aria-hidden="true">
                      <div className="skeleton" style={{ width: 48, height: 64, borderRadius: 8, flexShrink: 0 }} />
                      <div className="flex-1">
                        <div className="skeleton skeleton-title" style={{ width: "80%", marginBottom: 8 }} />
                        <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                    <Package className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1">Printed books appear here.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {orders.slice(0, 4).map(order => {
                    const statusDots = {
                      pending:   "bg-yellow-400",
                      confirmed: "bg-emerald-400",
                      printing:  "bg-blue-400",
                      shipped:   "bg-purple-400",
                      delivered: "bg-green-400",
                      cancelled: "bg-red-400",
                    };
                    const statusLabels = {
                      pending:   "Processing",
                      confirmed: "Confirmed",
                      printing:  "Printing",
                      shipped:   "Shipped",
                      delivered: "Delivered",
                      cancelled: "Cancelled",
                    };
                    const dotClass = statusDots[order.order_status] || "bg-gray-400";
                    const statusLabel = statusLabels[order.order_status] || order.order_status;

                    return (
                      <li key={order.id}>
                        <button
                          className="w-full group flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left min-h-[44px]"
                          onClick={() => navigate("/orders")}
                          aria-label={`Order #${String(order.id).padStart(5,"0")} — ${statusLabel}`}
                        >
                          <div className="w-11 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200/50">
                            {order.cover_image_url ? (
                              <img
                                src={order.cover_image_url}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                                aria-hidden="true"
                                width="44"
                                height="56"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                                <BookOpen className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-bold text-gray-900 truncate mb-0.5">{order.title}</p>
                            <p className="text-xs text-gray-500 mb-1.5">#{String(order.id).padStart(5,"0")}</p>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
                              <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{statusLabel}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors self-center flex-shrink-0" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-xs font-medium">
            © {new Date().getFullYear()} Blushbook Nepal. All rights reserved.
          </p>
          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-xs font-semibold transition-colors min-h-[36px]"
            aria-label="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;