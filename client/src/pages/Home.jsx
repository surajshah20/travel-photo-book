// client/src/pages/Home.jsx
// My Books Dashboard — manage all travel books

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Home = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ─── Load All Books ──────────────────────────────────────
  useEffect(() => {
    api.get("/books").then((res) => {
      setBooks(res.data);
      setLoading(false);
    });
  }, []);

  // ─── Delete Book ─────────────────────────────────────────
  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
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

  // ─── Status Badge ────────────────────────────────────────
  const statusBadge = (status) => {
    const styles = {
      draft: "bg-yellow-100 text-yellow-700",
      complete: "bg-blue-100 text-blue-700",
      ordered: "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Navbar ───────────────────────────────────── */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">
          📸 Travel Photo Book
        </h1>
        <div className="flex items-center gap-4">
          <Link
            to="/orders"
            className="text-gray-600 hover:text-blue-600 text-sm font-medium transition"
          >
            📦 My Orders
          </Link>
          <span className="text-gray-600 text-sm">
            Hello, {user?.name} 👋
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ─── Header ───────────────────────────────────── */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              My Travel Books
            </h2>
            <p className="text-gray-500 mt-1">
              {books.length} {books.length === 1 ? "book" : "books"} created
            </p>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            + Create New Book
          </button>
        </div>

        {/* ─── Loading ──────────────────────────────────── */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your books...</p>
          </div>
        )}

        {/* ─── Empty State ──────────────────────────────── */}
        {!loading && books.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <p className="text-6xl mb-4">📖</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No books yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first travel photo book!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              + Create New Book
            </button>
          </div>
        )}

        {/* ─── Books Grid ───────────────────────────────── */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition group"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">📸</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    {statusBadge(book.status)}
                  </div>

                  {/* Quick action overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition" />
                </div>

                {/* Book Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-1">
                    📍 {book.destination || "No destination"}
                  </p>
                  {book.travel_date_start && (
                    <p className="text-gray-400 text-xs mb-3">
                      📅{" "}
                      {new Date(book.travel_date_start).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" }
                      )}
                      {book.travel_date_end && (
                        <>
                          {" "}—{" "}
                          {new Date(book.travel_date_end).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}
                        </>
                      )}
                    </p>
                  )}

                  <p className="text-gray-400 text-xs mb-4">
                    Last updated:{" "}
                    {new Date(book.updated_at).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/editor/${book.id}`)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => navigate(`/preview/${book.id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      disabled={deletingId === book.id}
                      className="bg-red-50 text-red-500 px-3 py-2 rounded-xl text-sm hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {deletingId === book.id ? "..." : "🗑️"}
                    </button>
                  </div>

                  {/* Order button if complete */}
                  {book.status === "complete" && (
                    <button
                      onClick={() => navigate(`/preview/${book.id}`)}
                      className="w-full mt-2 bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
                    >
                      🛒 Order Printed Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Stats Bar ────────────────────────────────── */}
        {!loading && books.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Books",
                value: books.length,
                icon: "📚",
                color: "blue",
              },
              {
                label: "Drafts",
                value: books.filter((b) => b.status === "draft").length,
                icon: "✏️",
                color: "yellow",
              },
              {
                label: "Ordered",
                value: books.filter((b) => b.status === "ordered").length,
                icon: "📦",
                color: "green",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl shadow-sm p-5 text-center"
              >
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;