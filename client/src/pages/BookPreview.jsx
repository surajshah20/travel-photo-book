// client/src/pages/BookPreview.jsx
// Realistic page flip book preview

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import api from "../api/axios";
import ExportPDF from "../components/ExportPDF";

// ─── COVER PAGE ───────────────────────────────────────────
const CoverPage = ({ book }) => {
    const colorSchemes = {
        blue: "from-blue-600 to-blue-900",
        purple: "from-purple-600 to-purple-900",
        green: "from-green-600 to-green-900",
        rose: "from-rose-600 to-rose-900",
        amber: "from-amber-600 to-amber-900",
        gray: "from-gray-700 to-gray-900",
    };

    const gradient = colorSchemes[book?.color_scheme] || colorSchemes.blue;

    return (
        <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white text-center p-8 relative overflow-hidden`}
        >
            {/* Background cover image */}
            {book?.cover_image_url && (
                <img
                    src={book.cover_image_url}
                    alt="cover"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
            )}

            {/* Content */}
            <div className="relative z-10">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-6">
                    Travel Photo Book
                </p>
                <h1 className="text-4xl font-bold mb-3 leading-tight">
                    {book?.title || "My Travel Book"}
                </h1>
                <p className="text-sm opacity-75 mb-6">
                    {book?.cover_subtitle || "A journey to remember"}
                </p>
                <div className="w-16 h-0.5 bg-white opacity-50 mx-auto mb-6"></div>
                <p className="text-xs uppercase tracking-widest opacity-60">
                    {book?.destination}
                </p>
                {book?.travel_date_start && (
                    <p className="text-xs opacity-50 mt-2">
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

// ─── PHOTO PAGE ───────────────────────────────────────────
const PhotoPage = ({ photo, pageNumber }) => (
    <div className="w-full h-full bg-white flex flex-col">
        {/* Photo */}
        <div className="flex-1 overflow-hidden">
            <img
                src={photo?.image_url}
                alt="travel"
                className="w-full h-full object-cover"
            />
        </div>

        {/* Caption */}
        <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic text-center leading-relaxed">
                {photo?.caption || ""}
            </p>
            <p className="text-xs text-gray-300 text-right mt-2">{pageNumber}</p>
        </div>
    </div>
);

// ─── SECTION TITLE PAGE ───────────────────────────────────
const SectionPage = ({ title, pageNumber }) => (
    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-0.5 bg-gray-300 mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-700 text-center">{title}</h2>
        <div className="w-12 h-0.5 bg-gray-300 mt-6"></div>
        <p className="text-xs text-gray-300 absolute bottom-4 right-4">
            {pageNumber}
        </p>
    </div>
);

// ─── BACK COVER PAGE ──────────────────────────────────────
const BackCoverPage = ({ book }) => (
    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white p-8">
        <p className="text-6xl mb-6">📸</p>
        <p className="text-sm opacity-60 text-center">
            Created with Travel Photo Book
        </p>
        <p className="text-xs opacity-40 mt-2">{book?.destination}</p>
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
        const loadData = async () => {
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
                console.error("Load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [bookId]);

    // Build the list of all pages to render
    const buildPageList = () => {
        const pageList = [];

        // Cover page
        pageList.push({ type: "cover" });

        // Section pages with photos
        pages.forEach((page) => {
            if (page.layout !== "cover") {
                // Section title page
                pageList.push({ type: "section", title: page.section_title });

                // Photos for this section
                const sectionPhotos = photos.filter((p) => p.page_id === page.id);
                sectionPhotos.forEach((photo) => {
                    pageList.push({ type: "photo", photo });
                });
            }
        });

        // If no pages, just show all photos
        if (pages.length <= 1) {
            photos.forEach((photo) => {
                pageList.push({ type: "photo", photo });
            });
        }

        // Back cover
        pageList.push({ type: "back" });

        return pageList;
    };

    const pageList = buildPageList();

    useEffect(() => {
        setTotalPages(pageList.length);
    }, [pageList.length]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="opacity-60">Loading your book...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <nav className="bg-gray-800 px-6 py-3 flex justify-between items-center">
                <button
                    onClick={() => navigate(`/editor/${bookId}`)}
                    className="text-gray-400 hover:text-white text-sm transition"
                >
                    ← Back to Editor
                </button>
                <h1 className="text-white font-semibold">
                    📖 {book?.title || "Book Preview"}
                </h1>
                <div className="flex items-center gap-3">
                    <ExportPDF book={book} photos={photos} pages={pages} />
                    <button
                        onClick={() => navigate(`/order/${bookId}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        Order Now →
                    </button>
                </div>
            </nav>

            {/* Book Viewer */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <HTMLFlipBook
                    width={380}
                    height={500}
                    size="fixed"
                    minWidth={300}
                    maxWidth={500}
                    minHeight={400}
                    maxHeight={600}
                    showCover={true}
                    mobileScrollSupport={true}
                    onFlip={(e) => setCurrentPage(e.data)}
                    ref={flipBook}
                    className="shadow-2xl"
                    style={{}}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={700}
                    usePortrait={false}
                    startZIndex={0}
                    autoSize={false}
                    maxShadowOpacity={0.5}
                    showPageCorners={true}
                    disableFlipByClick={false}
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

                {/* Page Controls */}
                <div className="flex items-center gap-6 mt-8">
                    <button
                        onClick={() => flipBook.current?.pageFlip().flipPrev()}
                        className="bg-gray-700 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-600 transition text-lg"
                    >
                        ←
                    </button>
                    <span className="text-gray-400 text-sm">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => flipBook.current?.pageFlip().flipNext()}
                        className="bg-gray-700 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-600 transition text-lg"
                    >
                        →
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