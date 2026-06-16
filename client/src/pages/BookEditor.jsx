// client/src/pages/BookEditor.jsx
// Blushbook — Professional Book Editor

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  BookOpen, Eye, Save,
  Type, Palette, Layout, Check,
  GripVertical, Edit3, X, CheckCircle 
} from "lucide-react";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";
import { C } from "../design-system/index";

// ─── THEME HELPER ─────────────────────────────────────────
const getTheme = (colorScheme) => {
  if (colorScheme === "purple") return "luxury";
  if (colorScheme === "green") return "scrapbook";
  if (colorScheme === "amber") return "vintage";
  if (colorScheme === "blue") return "journal";
  return "modern";
};

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
    rose: { gradient: "from-rose-500 to-pink-700", label: "Rose" },
    gray: { gradient: "from-gray-800 to-black", label: "Slate" },
    blue: { gradient: "from-blue-600 to-slate-900", label: "Ocean" },
    green: { gradient: "from-emerald-600 to-teal-900", label: "Forest" },
    amber: { gradient: "from-amber-600 to-orange-900", label: "Sunset" },
    purple: { gradient: "from-purple-800 to-indigo-950", label: "Lavender" },
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

  useEffect(() => {
    if (!loading && photos.length === 0 && book) {
      navigate(`/upload/${bookId}`, { replace: true });
    }
  }, [loading, photos.length, book]);

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
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium font-sans">Loading your book...</p>
        </div>
      </div>
    );
  }

  // ─── Variables for dynamic cover preview ─────────────────
  const theme = getTheme(coverData.color_scheme);
  const isSerif = coverData.font_style === "serif";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      <AppNavbar
        backTo="/dashboard"
        backLabel="Dashboard"
        title={book?.title || "Book Editor"}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {successMsg && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full mr-2">
                <CheckCircle size={14} /> {successMsg}
              </span>
            )}
            <button
              onClick={() => navigate(`/preview/${bookId}`)}
              className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 rounded-full px-4 py-2 text-xs font-bold hover:border-gray-900 hover:text-gray-900 transition-colors shadow-sm"
            >
              <Eye size={13} /> Preview
            </button>
            <button
              onClick={saveBook}
              disabled={saving}
              className="flex items-center gap-2 bg-gray-900 text-white border-none rounded-full px-5 py-2 text-xs font-bold hover:bg-rose-500 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={13} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">

        {/* ─── Sidebar ──────────────────────────────────── */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm z-10">
          <div className="p-5 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Editor Menu
            </p>
          </div>

          {/* Tabs */}
          <div className="p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors mb-1.5
                  ${activeTab === tab.id
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Book info */}
          <div className="mt-auto p-5 border-t border-gray-100 space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destination</p>
              <p className="text-sm font-bold text-gray-800 truncate">
                {book?.destination || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Photos</p>
              <p className="text-sm font-bold text-gray-800">
                {photos.length} photos
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pages</p>
              <p className="text-sm font-bold text-gray-800">
                {pages.length} pages
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                {book?.status || "draft"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Main Content ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f4f4f5]">

          {/* ── PHOTOS TAB ── */}
          {activeTab === "photos" && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-display mb-1">
                  Photos & Captions
                </h2>
                <p className="text-gray-500 text-sm">
                  Drag to reorder · Click caption to edit · Hover to set cover
                </p>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="photos" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-wrap gap-5"
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
                              className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-48 transition-all
                                ${snapshot.isDragging ? "shadow-xl rotate-2 scale-105 border-gray-400 z-50" : "hover:border-gray-300 hover:shadow-md"}`}
                            >
                              {/* Drag handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-400">
                                  {index + 1}
                                </span>
                              </div>

                              {/* Photo */}
                              <div className="relative group bg-gray-100">
                                <img
                                  src={photo.image_url}
                                  alt="travel"
                                  className="w-full h-36 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                  <button
                                    onClick={() => setCoverPhoto(photo.image_url)}
                                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 text-xs px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:scale-105"
                                  >
                                    Set Cover
                                  </button>
                                </div>
                                {book?.cover_image_url === photo.image_url && (
                                  <div className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold shadow-md">
                                    Cover
                                  </div>
                                )}
                              </div>

                              {/* Caption */}
                              <div className="p-3.5">
                                {editingCaption === photo.id ? (
                                  <div>
                                    <textarea
                                      value={captionText}
                                      onChange={(e) => setCaptionText(e.target.value)}
                                      className="w-full text-xs border border-gray-300 rounded-lg p-2.5 resize-none focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                      rows={3}
                                      autoFocus
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => saveCaption(photo.id)}
                                        className="flex-1 bg-gray-900 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-rose-500 transition-colors"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCaption(null)}
                                        className="w-8 bg-gray-100 text-gray-500 text-xs rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingCaption(photo.id);
                                      setCaptionText(photo.caption || "");
                                    }}
                                    className="flex items-start gap-2 cursor-pointer group/caption"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-gray-300 group-hover/caption:text-gray-900 mt-0.5 flex-shrink-0 transition-colors" />
                                    <p className="text-xs text-gray-500 group-hover/caption:text-gray-900 transition-colors leading-relaxed line-clamp-2">
                                      {photo.caption || "Add a caption..."}
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
                <div className="mt-12 pt-10 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-4">
                    Book Layout Outline
                  </h3>
                  <div className="space-y-3">
                    {pages
                      .filter((p) => p.layout !== "cover")
                      .map((page, i) => (
                        <div
                          key={page.id}
                          className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200"
                        >
                          <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {page.section_title || `Section ${i + 1}`}
                            </p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                              {page.layout} Layout
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
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-display mb-1">
                  Cover Design
                </h2>
                <p className="text-gray-500 text-sm">
                  Customize the title, subtitle, and photo for your cover.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Live Preview - Dynamic matching to BookPreview */}
                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
                    Live Preview
                  </p>
                  
                  {/* Dynamic cover container mimicking BookPreview.jsx */}
                  <div
                    className={`relative w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center text-white text-center p-8 bg-gradient-to-br ${colorSchemes[coverData.color_scheme]?.gradient || "from-gray-800 to-black"} shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)]
                    ${book?.book_type === 'luxury' ? 'aspect-square max-w-[420px] mx-auto' : 'aspect-[3/4] max-w-[360px] mx-auto'}`}
                  >
                    {book?.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt="cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                      />
                    )}
                    
                    {/* Decorative borders for luxury/vintage */}
                    {(theme === "luxury" || theme === "vintage") && (
                      <div className="absolute inset-4 border border-white/20 pointer-events-none" />
                    )}

                    <div className="relative z-10 w-full">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-6 font-sans">
                        Travel Photo Book
                      </p>
                      <div className="w-12 h-px bg-white/40 mx-auto mb-4" />
                      <h1
                        className={`text-3xl md:text-4xl font-bold mb-3 leading-tight ${isSerif ? "font-serif" : "font-sans tracking-tight"}`}
                      >
                        {coverData.title || "Your Book Title"}
                      </h1>
                      <p className={`text-sm opacity-80 mb-5 ${isSerif ? "font-serif italic" : "font-sans"}`}>
                        {coverData.cover_subtitle || "Your subtitle"}
                      </p>
                      <div className="w-12 h-px bg-white/40 mx-auto mb-5" />
                      
                      {book?.destination && (
                        <p className="text-[10px] uppercase tracking-[0.15em] opacity-60 font-sans">
                          {book.destination}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={coverData.title}
                      onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={coverData.cover_subtitle}
                      onChange={(e) => setCoverData({ ...coverData, cover_subtitle: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                    />
                  </div>

                  {/* Cover photo picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
                      Select Cover Photo
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {photos.slice(0, 10).map((photo) => (
                        <div 
                          key={photo.id}
                          className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                          onClick={() => setCoverPhoto(photo.image_url)}
                        >
                          <img
                            src={photo.image_url}
                            alt=""
                            className={`w-full h-full object-cover transition-transform duration-300
                              ${book?.cover_image_url === photo.image_url ? "scale-110 blur-[1px]" : "group-hover:scale-110"}`}
                          />
                          {book?.cover_image_url === photo.image_url && (
                            <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      onClick={saveBook}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Cover Details"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STYLE TAB ── */}
          {activeTab === "style" && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-display mb-1">
                  Fonts & Colors
                </h2>
                <p className="text-gray-500 text-sm">
                  Customize the overarching theme of your book.
                </p>
              </div>

              {/* Color Schemes */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  Color Theme
                </h3>
                <div className="flex gap-4 flex-wrap">
                  {Object.entries(colorSchemes).map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => setCoverData({ ...coverData, color_scheme: key })}
                      className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${scheme.gradient} transition-all shadow-sm
                        ${coverData.color_scheme === key
                          ? "ring-2 ring-offset-4 ring-gray-900 scale-105"
                          : "hover:scale-110 hover:shadow-md"
                        }`}
                      title={scheme.label}
                    >
                      {coverData.color_scheme === key && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Styles */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-400" />
                  Typography
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(fontStyles).map(([key, font]) => (
                    <button
                      key={key}
                      onClick={() => setCoverData({ ...coverData, font_style: key })}
                      className={`px-4 py-5 rounded-2xl border-2 transition-all text-center
                        ${coverData.font_style === key
                          ? "border-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <p className={`text-2xl font-bold text-gray-900 mb-2 ${font.class}`}>
                        Aa
                      </p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{font.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveBook}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-full font-bold text-sm hover:bg-rose-500 transition-colors disabled:opacity-50 shadow-md"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Style Preferences"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookEditor;