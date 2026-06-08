// client/src/pages/BookEditor.jsx
// The main book editor — drag & drop, edit captions, customize cover

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api/axios";

const BookEditor = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("pages"); // pages, cover, style
  const [editingCaption, setEditingCaption] = useState(null);
  const [captionText, setCaptionText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Cover customization state
  const [coverData, setCoverData] = useState({
    title: "",
    cover_subtitle: "",
    font_style: "modern",
    color_scheme: "blue",
  });

  // ─── Load Book Data ──────────────────────────────────────
  useEffect(() => {
    const loadBook = async () => {
      try {
        const [bookRes, photosRes, pagesRes] = await Promise.all([
          api.get(`/books/${bookId}`),
          api.get(`/photos/${bookId}`),
          api.get(`/pages/${bookId}`),
        ]);

        setBook(bookRes.data);
        setPhotos(photosRes.data);
        setPages(pagesRes.data);
        setCoverData({
          title: bookRes.data.title || "",
          cover_subtitle: bookRes.data.cover_subtitle || "",
          font_style: bookRes.data.font_style || "modern",
          color_scheme: bookRes.data.color_scheme || "blue",
        });
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  // ─── Drag and Drop Handler ───────────────────────────────
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(photos);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setPhotos(reordered);
    showSuccess("Photos reordered!");
  };

  // ─── Save Caption ────────────────────────────────────────
  const saveCaption = async (photoId) => {
    try {
      await api.put(`/photos/${photoId}/caption`, { caption: captionText });
      setPhotos(photos.map((p) =>
        p.id === photoId ? { ...p, caption: captionText } : p
      ));
      setEditingCaption(null);
      showSuccess("Caption saved!");
    } catch (err) {
      console.error("Save caption error:", err);
    }
  };

  // ─── Set Cover Photo ─────────────────────────────────────
  const setCoverPhoto = async (imageUrl) => {
    try {
      await api.put(`/books/${bookId}`, { cover_image_url: imageUrl });
      setBook({ ...book, cover_image_url: imageUrl });
      showSuccess("Cover photo updated!");
    } catch (err) {
      console.error("Cover error:", err);
    }
  };

  // ─── Save Cover Details ──────────────────────────────────
  const saveCoverDetails = async () => {
    setSaving(true);
    try {
      await api.put(`/books/${bookId}`, coverData);
      setBook({ ...book, ...coverData });
      showSuccess("Cover details saved!");
    } catch (err) {
      console.error("Save cover error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Show Success Message ────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // ─── Color Schemes ───────────────────────────────────────
  const colorSchemes = {
    blue: "from-blue-600 to-blue-800",
    purple: "from-purple-600 to-purple-800",
    green: "from-green-600 to-green-800",
    rose: "from-rose-600 to-rose-800",
    amber: "from-amber-600 to-amber-800",
    gray: "from-gray-700 to-gray-900",
  };

  const fontStyles = {
    modern: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ─── Top Navbar ─────────────────────────────────── */}
      <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-blue-600">
            ✏️ {book?.title || "Book Editor"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
              ✅ {successMsg}
            </span>
          )}
          <button
            onClick={() => navigate(`/preview/${bookId}`)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            👁️ Preview
          </button>
          <button
            onClick={saveCoverDetails}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            {saving ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-60px)]">
        {/* ─── Left Sidebar: Tabs ─────────────────────── */}
        <div className="w-64 bg-white shadow-sm flex flex-col">
          <div className="p-4 border-b">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Editor
            </p>
          </div>

          {[
            { id: "pages", label: "📄 Pages & Photos" },
            { id: "cover", label: "🖼️ Cover Design" },
            { id: "style", label: "🎨 Fonts & Colors" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition
                ${activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Book Info */}
          <div className="mt-auto p-4 border-t bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Destination</p>
            <p className="text-sm font-medium text-gray-700">
              {book?.destination || "—"}
            </p>
            <p className="text-xs text-gray-500 mt-2 mb-1">Photos</p>
            <p className="text-sm font-medium text-gray-700">
              {photos.length} uploaded
            </p>
            <p className="text-xs text-gray-500 mt-2 mb-1">Pages</p>
            <p className="text-sm font-medium text-gray-700">
              {pages.length} pages
            </p>
          </div>
        </div>

        {/* ─── Main Editor Area ───────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── TAB: Pages & Photos ── */}
          {activeTab === "pages" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Pages & Photos
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Drag photos to reorder them. Click a caption to edit it.
              </p>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="photos" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-wrap gap-4"
                    >
                      {photos.map((photo, index) => (
                        <Draggable
                          key={String(photo.id)}
                          draggableId={String(photo.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-2xl shadow-sm overflow-hidden w-52 transition
                                ${snapshot.isDragging ? "shadow-xl scale-105 rotate-1" : ""}`}
                            >
                              {/* Photo */}
                              <div className="relative group">
                                <img
                                  src={photo.image_url}
                                  alt="travel"
                                  className="w-full h-36 object-cover"
                                />
                                {/* Cover button overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                  <button
                                    onClick={() => setCoverPhoto(photo.image_url)}
                                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-xs px-3 py-1 rounded-full font-medium transition"
                                  >
                                    Set as Cover
                                  </button>
                                </div>
                                {/* Cover badge */}
                                {book?.cover_image_url === photo.image_url && (
                                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    Cover
                                  </span>
                                )}
                                {/* Drag handle indicator */}
                                <span className="absolute top-2 right-2 bg-black bg-opacity-40 text-white text-xs px-1.5 py-0.5 rounded">
                                  ⠿
                                </span>
                              </div>

                              {/* Caption */}
                              <div className="p-3">
                                {editingCaption === photo.id ? (
                                  <div>
                                    <textarea
                                      value={captionText}
                                      onChange={(e) => setCaptionText(e.target.value)}
                                      className="w-full text-xs border border-blue-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      rows={3}
                                      autoFocus
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => saveCaption(photo.id)}
                                        className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg font-medium"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCaption(null)}
                                        className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p
                                    onClick={() => {
                                      setEditingCaption(photo.id);
                                      setCaptionText(photo.caption || "");
                                    }}
                                    className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 transition line-clamp-2"
                                    title="Click to edit caption"
                                  >
                                    {photo.caption || "Click to add caption..."}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Sections from AI */}
              {pages.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    📚 Book Sections
                  </h3>
                  <div className="space-y-3">
                    {pages.map((page, i) => (
                      <div
                        key={page.id}
                        className="bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-4"
                      >
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">
                            {page.section_title || `Page ${i + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            Layout: {page.layout}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Cover Design ── */}
          {activeTab === "cover" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Cover Design
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Customize your book cover
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cover Preview */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Live Preview
                  </p>
                  <div
                    className={`relative w-full h-80 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br ${colorSchemes[coverData.color_scheme] || colorSchemes.blue}`}
                  >
                    {book?.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt="cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                      <h1
                        className={`text-3xl font-bold mb-2 ${fontStyles[coverData.font_style]}`}
                      >
                        {coverData.title || "Your Book Title"}
                      </h1>
                      <p className="text-sm opacity-80">
                        {coverData.cover_subtitle || "Your subtitle here"}
                      </p>
                      {book?.destination && (
                        <p className="text-xs opacity-60 mt-4 uppercase tracking-widest">
                          {book.destination}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Controls */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={coverData.title}
                      onChange={(e) =>
                        setCoverData({ ...coverData, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={coverData.cover_subtitle}
                      onChange={(e) =>
                        setCoverData({
                          ...coverData,
                          cover_subtitle: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  {/* Cover Photo Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Photo
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {photos.slice(0, 8).map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.image_url}
                          alt=""
                          onClick={() => setCoverPhoto(photo.image_url)}
                          className={`w-full h-16 object-cover rounded-lg cursor-pointer transition
                            ${book?.cover_image_url === photo.image_url
                              ? "ring-2 ring-blue-500 ring-offset-1"
                              : "hover:opacity-80"
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveCoverDetails}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    {saving ? "Saving..." : "Save Cover"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Fonts & Colors ── */}
          {activeTab === "style" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Fonts & Colors
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Choose the style of your book
              </p>

              {/* Color Schemes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                  Color Scheme
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(colorSchemes).map(([name, gradient]) => (
                    <button
                      key={name}
                      onClick={() =>
                        setCoverData({ ...coverData, color_scheme: name })
                      }
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} transition
                        ${coverData.color_scheme === name
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                        }`}
                      title={name}
                    />
                  ))}
                </div>
              </div>

              {/* Font Styles */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                  Font Style
                </h3>
                <div className="flex gap-3">
                  {Object.keys(fontStyles).map((font) => (
                    <button
                      key={font}
                      onClick={() =>
                        setCoverData({ ...coverData, font_style: font })
                      }
                      className={`px-6 py-3 rounded-xl border-2 capitalize text-sm font-medium transition
                        ${coverData.font_style === font
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"
                        }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveCoverDetails}
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                {saving ? "Saving..." : "Save Style"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookEditor;