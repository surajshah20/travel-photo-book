// client/src/pages/BookPreview.jsx
// Blushbook — Professional Book Preview with Page Flip

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import {
  BookOpen, ChevronLeft, ChevronRight,
  ShoppingBag, Download, Edit3
} from "lucide-react";
import api from "../api/axios";
import ExportPDF from "../components/ExportPDF";

// ─── COVER PAGE ───────────────────────────────────────────
const CoverPage = ({ book }) => {
  const gradients = {
    rose: "from-rose-500 to-pink-700",
    gray: "from-gray-700 to-gray-900",
    blue: "from-blue-500 to-indigo-700",
    green: "from-emerald-500 to-teal-700",
    amber: "from-amber-500 to-orange-700",
    purple: "from-purple-500 to-violet-700",
  };

  const gradient = gradients[book?.color_scheme] || gradients.rose;

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white text-center p-8 relative overflow-hidden`}
    >
      {book?.cover_image_url && (
        <img
          src={book.cover_image_url}
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-widest opacity-50 mb-8">
          Travel Photo Book
        </p>
        <div className="w-12 h-0.5 bg-white opacity-30 mx-auto mb-6" />
        <h1
          className="text-4xl font-bold mb-3 leading-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {book?.title || "My Travel Book"}
        </h1>
        <p className="text-sm opacity-70 mb-6">
          {book?.cover_subtitle || "A journey to remember"}
        </p>
        <div className="w-12 h-0.5 bg-white opacity-30 mx-auto mb-6" />
        <p className="text-xs uppercase tracking-widest opacity-50">
          {book?.destination}
        </p>
        {book?.travel_date_start && (
          <p className="text-xs opacity-40 mt-2">
            {new Date(book.travel_date_start).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── SECTION PAGE ─────────────────────────────────────────
const SectionPage = ({ title, pageNumber }) => (
  <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-8 relative">
    <div className="w-8 h-0.5 bg-gray-300 mb-6" />
    <h2
      className="text-2xl font-bold text-gray-700 text-center"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {title}
    </h2>
    <div className="w-8 h-0.5 bg-gray-300 mt-6" />
    <p className="text-xs text-gray-200 absolute bottom-4 right-4">
      {pageNumber}
    </p>
  </div>
);

// ─── PHOTO PAGE ───────────────────────────────────────────
const PhotoPage = ({ photo, pageNumber }) => (
  <div className="w-full h-full bg-white flex flex-col">
    <div className="flex-1 overflow-hidden">
      <img
        src={photo?.image_url}
        alt="travel"
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-4 border-t border-gray-50">
      <p className="text-xs text-gray-400 italic text-center leading-relaxed">
        {photo?.caption || ""}
      </p>
      <p className="text-xs text-gray-200 text-right mt-1">{pageNumber}</p>
    </div>
  </div>
);

// ─── BACK COVER ───────────────────────────────────────────
const BackCoverPage = ({ book }) => (
  <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white p-8">
    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center mb-4">
      <BookOpen className="w-5 h-5 text-white" />
    </div>
    <p
      className="text-lg font-bold mb-1"
      style={{ fontFamily: "Georgia, serif" }}
    >
      blush<span className="text-rose-400">book</span>
    </p>
    <p className="text-xs text-gray-500 text-center mt-4">
      Created with Blushbook
    </p>
    <p className="text-xs text-gray-600 mt-1">{book?.destination}</p>
  </div>
);

// ─── MAIN PREVIEW PAGE ────────────────────────────────────
const BookPreview = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const flipBook = useRef(null);

  const [book, setBook] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  // Build page list
  const buildPageList = () => {
    const list = [];
    list.push({ type: "cover" });

    if (pages.length > 1) {
      pages.forEach((page) => {
        if (page.layout !== "cover") {
          list.push({ type: "section", title: page.section_title });
          const sectionPhotos = photos.filter((p) => p.page_id === page.id);
          sectionPhotos.forEach((photo) => {
            list.push({ type: "photo", photo });
          });
        }
      });
    } else {
      photos.forEach((photo) => {
        list.push({ type: "photo", photo });
      });
    }

    list.push({ type: "back" });
    return list;
  };

  const pageList = buildPageList();

  useEffect(() => {
    setTotalPages(pageList.length);
  }, [pageList.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/editor/${bookId}`)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Editor
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-500 rounded-md flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-white font-semibold text-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {book?.title || "Preview"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/editor/${bookId}`)}
            className="flex items-center gap-2 border border-gray-600 text-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gray-700 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <ExportPDF book={book} photos={photos} pages={pages} />
          <button
            onClick={() => navigate(`/order/${bookId}`)}
            className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Now
          </button>
        </div>
      </nav>

      {/* ─── Book Viewer ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">

        {/* Page counter */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-gray-500 text-xs uppercase tracking-widest">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        {/* Flip Book */}
        <div className="shadow-2xl">
          <HTMLFlipBook
            width={360}
            height={480}
            size="fixed"
            minWidth={280}
            maxWidth={500}
            minHeight={380}
            maxHeight={600}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={(e) => setCurrentPage(e.data)}
            ref={flipBook}
            drawShadow={true}
            flippingTime={700}
            usePortrait={false}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.5}
            showPageCorners={true}
            disableFlipByClick={false}
            style={{}}
            className=""
            startPage={0}
          >
            {pageList.map((page, index) => (
              <div key={index} className="w-full h-full">
                {page.type === "cover" && <CoverPage book={book} />}
                {page.type === "section" && (
                  <SectionPage title={page.title} pageNumber={index} />
                )}
                {page.type === "photo" && (
                  <PhotoPage photo={page.photo} pageNumber={index} />
                )}
                {page.type === "back" && <BackCoverPage book={book} />}
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={() => flipBook.current?.pageFlip().flipPrev()}
            className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition border border-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page dots */}
          <div className="flex gap-1.5">
            {pageList.map((_, i) => (
              <button
                key={i}
                onClick={() => flipBook.current?.pageFlip().flip(i)}
                className={`rounded-full transition-all
                  ${i === currentPage
                    ? "w-4 h-2 bg-rose-500"
                    : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => flipBook.current?.pageFlip().flipNext()}
            className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition border border-gray-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-xs mt-4">
          Click page edges or use arrows to flip
        </p>
      </div>
    </div>
  );
};

export default BookPreview;