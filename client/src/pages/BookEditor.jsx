// client/src/pages/BookEditor.jsx
// Blushbook — Professional Book Editor

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  BookOpen, Eye, Save, ChevronLeft,
  Type, Palette, Layout, Check,
  GripVertical, Edit3, X
} from "lucide-react";
import api from "../api/axios";

const BookEditor = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");
  const [editingCaption, setEditingCaption] = useState(null);
  const [captionText, setCaptionText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [coverData, setCoverData] = useState({
    title: "",
    cover_subtitle: "",
    font_style: "modern",
    color_scheme: "rose",
  });

  const colorSchemes = {
    rose: { gradient: "from-rose-500 to-pink-600", label: "Rose" },
    gray: { gradient: "from-gray-700 to-gray-900", label: "Slate" },
    blue: { gradient: "from-blue-500 to-indigo-600", label: "Ocean" },
    green: { gradient: "from-emerald-500 to-teal-600", label: "Forest" },
    amber: { gradient: "from-amber-500 to-orange-600", label: "Sunset" },
    purple: { gradient: "from-purple-500 to-violet-600", label: "Lavender" },
  };

  const fontStyles = {
    modern: { class: "font-sans", label: "Modern Sans" },
    serif: { class: "font-serif", label: "Classic Serif" },
    mono: { class: "font-mono", label: "Typewriter" },
  };

  // ─── Load Data ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
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
          color_scheme: bookRes.data.color_scheme || "rose",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  // ─── Drag and Drop ───────────────────────────────────────
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(photos);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPhotos(reordered);
    showSuccess("Photos reordered");
  };

  // ─── Save Caption ────────────────────────────────────────
  const saveCaption = async (photoId) => {
    try {
      await api.put(`/photos/${photoId}/caption`, { caption: captionText });
      setPhotos(photos.map((p) =>
        p.id === photoId ? { ...p, caption: captionText } : p
      ));
      setEditingCaption(null);
      showSuccess("Caption saved");
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Set Cover Photo ─────────────────────────────────────
  const setCoverPhoto = async (imageUrl) => {
    try {
      await api.put(`/books/${bookId}`, { cover_image_url: imageUrl });
      setBook({ ...book, cover_image_url: imageUrl });
      showSuccess("Cover photo updated");
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Save Book ───────────────────────────────────────────
  const saveBook = async () => {
    setSaving(true);
    try {
      await api.put(`/books/${bookId}`, coverData);
      setBook({ ...book, ...coverData });
      showSuccess("Book saved");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const tabs = [
    { id: "photos", label: "Photos", icon: <Layout className="w-4 h-4" /> },
    { id: "cover", label: "Cover", icon: <BookOpen className="w-4 h-4" /> },
    { id: "style", label: "Style", icon: <Palette className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
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
            <div className="w-6 h-6 bg-rose-500 rounded-md flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-bold text-gray-800 text-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {book?.title || "Book Editor"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successMsg && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-full">
              <Check className="w-3.5 h-3.5" />
              {successMsg}
            </div>
          )}
          <button
            onClick={() => navigate(`/preview/${bookId}`)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={saveBook}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-500 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* ─── Sidebar ──────────────────────────────────── */}
        <div className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Editor
            </p>
          </div>

          {/* Tabs */}
          <div className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-1
                  ${activeTab === tab.id
                    ? "bg-rose-50 text-rose-600"
                    : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Book info */}
          <div className="mt-auto p-4 border-t border-gray-50 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Destination</p>
              <p className="text-sm font-medium text-gray-700 truncate">
                {book?.destination || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Photos</p>
              <p className="text-sm font-medium text-gray-700">
                {photos.length} photos
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Pages</p>
              <p className="text-sm font-medium text-gray-700">
                {pages.length} pages
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Status</p>
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium capitalize">
                {book?.status || "draft"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Main Content ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── PHOTOS TAB ── */}
          {activeTab === "photos" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Photos & Captions
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Drag to reorder · Click caption to edit · Hover to set cover
                  </p>
                </div>
              </div>

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
                              className={`bg-white rounded-2xl shadow-card overflow-hidden w-48 transition-all
                                ${snapshot.isDragging ? "shadow-xl rotate-1 scale-105" : ""}`}
                            >
                              {/* Drag handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100"
                              >
                                <GripVertical className="w-4 h-4 text-gray-300" />
                                <span className="text-xs text-gray-300">
                                  {index + 1}
                                </span>
                              </div>

                              {/* Photo */}
                              <div className="relative group">
                                <img
                                  src={photo.image_url}
                                  alt="travel"
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                  <button
                                    onClick={() => setCoverPhoto(photo.image_url)}
                                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-xs px-3 py-1.5 rounded-full font-semibold transition shadow"
                                  >
                                    Set Cover
                                  </button>
                                </div>
                                {book?.cover_image_url === photo.image_url && (
                                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                    Cover
                                  </div>
                                )}
                              </div>

                              {/* Caption */}
                              <div className="p-3">
                                {editingCaption === photo.id ? (
                                  <div>
                                    <textarea
                                      value={captionText}
                                      onChange={(e) => setCaptionText(e.target.value)}
                                      className="w-full text-xs border border-rose-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
                                      rows={3}
                                      autoFocus
                                    />
                                    <div className="flex gap-1.5 mt-2">
                                      <button
                                        onClick={() => saveCaption(photo.id)}
                                        className="flex-1 bg-gray-900 text-white text-xs py-1.5 rounded-lg font-semibold hover:bg-rose-500 transition"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCaption(null)}
                                        className="w-8 bg-gray-100 text-gray-500 text-xs rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingCaption(photo.id);
                                      setCaptionText(photo.caption || "");
                                    }}
                                    className="flex items-start gap-1.5 cursor-pointer group/caption"
                                  >
                                    <Edit3 className="w-3 h-3 text-gray-300 group-hover/caption:text-rose-400 mt-0.5 flex-shrink-0 transition" />
                                    <p className="text-xs text-gray-400 group-hover/caption:text-gray-600 transition leading-relaxed line-clamp-2">
                                      {photo.caption || "Add caption..."}
                                    </p>
                                  </div>
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

              {/* Sections */}
              {pages.filter((p) => p.layout !== "cover").length > 0 && (
                <div className="mt-10">
                  <h3
                    className="font-bold text-gray-800 mb-4"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Book Sections
                  </h3>
                  <div className="space-y-2">
                    {pages
                      .filter((p) => p.layout !== "cover")
                      .map((page, i) => (
                        <div
                          key={page.id}
                          className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-card"
                        >
                          <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {page.section_title || `Section ${i + 1}`}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {page.layout} layout
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COVER TAB ── */}
          {activeTab === "cover" && (
            <div>
              <div className="mb-6">
                <h2
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Cover Design
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Customize your book cover
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Preview */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Live Preview
                  </p>
                  <div
                    className={`relative w-full h-80 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${colorSchemes[coverData.color_scheme]?.gradient || "from-rose-500 to-pink-600"}`}
                  >
                    {book?.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt="cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-6">
                        Travel Photo Book
                      </p>
                      <h1
                        className={`text-3xl font-bold mb-2 leading-tight ${fontStyles[coverData.font_style]?.class}`}
                      >
                        {coverData.title || "Your Book Title"}
                      </h1>
                      <div className="w-12 h-0.5 bg-white opacity-40 my-3" />
                      <p className="text-sm opacity-70">
                        {coverData.cover_subtitle || "Your subtitle"}
                      </p>
                      {book?.destination && (
                        <p className="text-xs opacity-40 mt-4 uppercase tracking-widest">
                          {book.destination}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={coverData.title}
                      onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={coverData.cover_subtitle}
                      onChange={(e) => setCoverData({ ...coverData, cover_subtitle: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
                    />
                  </div>

                  {/* Cover photo picker */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Photo
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {photos.slice(0, 10).map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.image_url}
                          alt=""
                          onClick={() => setCoverPhoto(photo.image_url)}
                          className={`w-full aspect-square object-cover rounded-xl cursor-pointer transition
                            ${book?.cover_image_url === photo.image_url
                              ? "ring-2 ring-rose-500 ring-offset-1"
                              : "hover:opacity-80"
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveBook}
                    disabled={saving}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-rose-500 transition"
                  >
                    {saving ? "Saving..." : "Save Cover"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STYLE TAB ── */}
          {activeTab === "style" && (
            <div>
              <div className="mb-6">
                <h2
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Fonts & Colors
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Customize the style of your book
                </p>
              </div>

              {/* Color Schemes */}
              <div className="bg-white rounded-2xl p-6 shadow-card mb-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-500" />
                  Color Scheme
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(colorSchemes).map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => setCoverData({ ...coverData, color_scheme: key })}
                      className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${scheme.gradient} transition-all
                        ${coverData.color_scheme === key
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                        }`}
                      title={scheme.label}
                    >
                      {coverData.color_scheme === key && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Styles */}
              <div className="bg-white rounded-2xl p-6 shadow-card mb-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Type className="w-4 h-4 text-rose-500" />
                  Font Style
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(fontStyles).map(([key, font]) => (
                    <button
                      key={key}
                      onClick={() => setCoverData({ ...coverData, font_style: key })}
                      className={`px-4 py-4 rounded-xl border-2 transition text-center
                        ${coverData.font_style === key
                          ? "border-rose-400 bg-rose-50"
                          : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <p className={`text-lg font-bold text-gray-800 mb-1 ${font.class}`}>
                        Aa
                      </p>
                      <p className="text-xs text-gray-400">{font.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveBook}
                disabled={saving}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-rose-500 transition"
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