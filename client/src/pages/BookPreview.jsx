// client/src/pages/BookPreview.jsx
// Blushbook — Professional Book Preview with Dynamic Inner Layouts

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { BookOpen, ChevronLeft, ChevronRight, ShoppingBag, Edit3 } from "lucide-react";
import api from "../api/axios";
import ExportPDF from "../components/ExportPDF";
import AppNavbar from "../design-system/AppNavbar";
import { C } from "../design-system/index";
import Logo from "../design-system/Logo"; // ✅ ADD THIS IMPORT
// ─── THEME HELPER ─────────────────────────────────────────
const getTheme = (colorScheme) => {
  if (colorScheme === "purple") return "luxury";
  if (colorScheme === "green") return "scrapbook";
  if (colorScheme === "amber") return "vintage";
  if (colorScheme === "blue") return "journal";
  return "modern";
};

// ─── COVER PAGE (THE TEMPLATE FACTORY) ────────────────────
const CoverPage = ({ book }) => {
  // If the user selects scrapbook/green or we add a specific lovestory type
  const isLoveStory = book?.book_type === "scrapbook" || book?.color_scheme === "green"; 
  const isSerif = book?.font_style === "serif";

  // TEMPLATE 1: LOVE STORY (Arched Frame)
  if (isLoveStory) {
    return (
      <div className="w-full h-full bg-[#FDFBF7] flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.06)]">
        <div className="absolute inset-4 border-[1.5px] border-[#D1C5B4] rounded-sm pointer-events-none" />
        
        <div className="relative z-10 w-full flex flex-col items-center mt-8">
          <p className={`text-[10px] text-[#8C7A6B] tracking-[0.2em] mb-6 ${isSerif ? "font-serif italic" : "font-sans uppercase"}`}>
            {book?.cover_subtitle || "Our Story"}
          </p>
          
          <h1 className={`text-3xl font-bold text-[#4A4036] mb-8 text-center leading-tight px-4 ${isSerif ? "font-serif" : "font-sans tracking-tight"}`}>
            {book?.title || "You & Me"}
          </h1>

          {/* Pixory-style Arched Frame */}
          <div className="w-48 h-64 bg-[#F0EBE1] rounded-t-full overflow-hidden shadow-md p-1.5 border border-[#E5DECZ]">
            {book?.cover_image_url ? (
              <img src={book.cover_image_url} alt="Couple" className="w-full h-full object-cover rounded-t-full" />
            ) : (
              <div className="w-full h-full border border-dashed border-[#D1C5B4] rounded-t-full flex items-center justify-center">
                <span className="text-xs text-[#8C7A6B] font-medium">Add Photo</span>
              </div>
            )}
          </div>

          {book?.travel_date_start && (
            <p className="text-[10px] text-[#8C7A6B] mt-10 tracking-widest font-sans uppercase">
              {new Date(book.travel_date_start).getFullYear()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // TEMPLATE 2: TRAVEL (Full Bleed)
  const gradients = {
    rose: "from-rose-500 to-pink-700",
    gray: "from-gray-800 to-black",
    blue: "from-blue-600 to-slate-900",
    amber: "from-amber-600 to-orange-900",
    purple: "from-purple-800 to-indigo-950",
  };
  const gradient = gradients[book?.color_scheme] || gradients.gray;

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white text-center p-8 relative overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)]`}>
      {book?.cover_image_url && (
        <img src={book.cover_image_url} alt="cover" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
      )}
      {(getTheme(book?.color_scheme) === "luxury" || getTheme(book?.color_scheme) === "vintage") && (
        <div className="absolute inset-4 border border-white/20" />
      )}
      <div className="relative z-10 w-full">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-8 font-sans">Travel Photo Book</p>
        <div className="w-12 h-px bg-white/40 mx-auto mb-6" />
        <h1 className={`text-4xl font-bold mb-3 leading-tight ${isSerif ? "font-serif" : "font-sans tracking-tight"}`}>
          {book?.title || "My Travel Book"}
        </h1>
        <p className={`text-sm opacity-80 mb-6 ${isSerif ? "font-serif italic" : "font-sans"}`}>
          {book?.cover_subtitle || "A journey to remember"}
        </p>
        <div className="w-12 h-px bg-white/40 mx-auto mb-6" />
        <p className="text-[10px] uppercase tracking-[0.15em] opacity-60 font-sans">{book?.destination}</p>
      </div>
    </div>
  );
};

// ─── SECTION PAGE ─────────────────────────────────────────
const SectionPage = ({ title, theme }) => {
  const layouts = {
    luxury: "bg-gray-900 text-white font-serif",
    scrapbook: "bg-[#FDFBF7] text-[#4A4036] font-sans",
    vintage: "bg-[#fef3c7] text-[#78350f] font-serif",
    journal: "bg-blue-50 text-blue-900 font-mono",
    modern: "bg-gray-50 text-gray-900 font-sans tracking-tight",
  };
  const bgClass = layouts[theme] || layouts.modern;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-8 relative shadow-[inset_-5px_0_15px_rgba(0,0,0,0.05)] ${bgClass}`}>
      {theme === "scrapbook" ? (
        <div className="bg-white p-6 shadow-md -rotate-2 border border-[#E5DECZ]">
          <h2 className="text-2xl font-bold text-[#8C7A6B]">{title}</h2>
        </div>
      ) : (
        <>
          <div className={`w-8 h-px mb-6 ${theme === 'luxury' ? 'bg-white/30' : 'bg-current opacity-30'}`} />
          <h2 className="text-2xl font-bold text-center italic">{title}</h2>
          <div className={`w-8 h-px mt-6 ${theme === 'luxury' ? 'bg-white/30' : 'bg-current opacity-30'}`} />
        </>
      )}
    </div>
  );
};

// ─── PHOTO PAGE ───────────────────────────────────────────
const PhotoPage = ({ photo, pageNumber, theme }) => {
  if (theme === "luxury") {
    return (
      <div className="w-full h-full relative bg-gray-900 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.2)] flex flex-col">
        <img src={photo?.image_url} alt="travel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 pt-24 pb-8 px-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center">
          {photo?.caption && <p className="text-white/90 font-serif text-sm text-center italic mb-4 drop-shadow-md">"{photo.caption}"</p>}
          <p className="text-white/40 text-[9px] font-sans tracking-widest">{pageNumber}</p>
        </div>
      </div>
    );
  }

  if (theme === "scrapbook") {
    const rotation = pageNumber % 2 === 0 ? "rotate-2" : "-rotate-3";
    return (
      <div className="w-full h-full bg-[#FDFBF7] p-6 flex flex-col items-center justify-center relative shadow-[inset_-5px_0_15px_rgba(0,0,0,0.03)]">
        <div className={`bg-white p-3 pb-8 shadow-xl ${rotation} w-full border border-[#E5DECZ]`}>
          <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden mb-3">
            <img src={photo?.image_url} alt="travel" className="w-full h-full object-cover" />
          </div>
          {photo?.caption && <p className="text-[#8C7A6B] font-sans text-xs text-center font-medium px-2">{photo.caption}</p>}
        </div>
        <p className="text-[#D1C5B4] text-[10px] absolute bottom-4 right-5 font-sans font-bold">{pageNumber}</p>
      </div>
    );
  }

  if (theme === "vintage") {
    return (
      <div className="w-full h-full bg-[#fef3c7] p-8 flex flex-col items-center justify-center relative shadow-[inset_-5px_0_15px_rgba(0,0,0,0.05)] border-[8px] border-[#fef3c7]">
        <div className="w-full flex-1 overflow-hidden border border-[#d97706]/20 relative">
          <div className="absolute inset-0 bg-[#d97706]/10 mix-blend-multiply pointer-events-none z-10" />
          <img src={photo?.image_url} alt="travel" className="w-full h-full object-cover sepia-[0.35] contrast-[1.1]" />
        </div>
        <div className="h-20 w-full flex flex-col items-center justify-center mt-2">
          <p className="text-[#78350f] font-serif text-xs text-center italic">{photo?.caption || ""}</p>
        </div>
        <p className="text-[#b45309] text-[10px] absolute bottom-4 right-4 font-serif">{pageNumber}</p>
      </div>
    );
  }

  if (theme === "journal") {
    return (
      <div className="w-full h-full bg-white p-8 flex flex-col relative shadow-[inset_-5px_0_15px_rgba(0,0,0,0.02)]">
        <div className="w-full h-[60%] overflow-hidden mb-6 mt-4">
          <img src={photo?.image_url} alt="travel" className="w-full h-full object-cover rounded-sm" />
        </div>
        {photo?.caption && (
          <div className="flex gap-3 items-start px-2">
            <div className="w-4 h-px bg-blue-200 mt-2" />
            <p className="text-slate-700 font-mono text-xs leading-relaxed flex-1">{photo.caption}</p>
          </div>
        )}
        <p className="text-slate-300 text-[10px] font-mono absolute bottom-5 left-8">{pageNumber}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col shadow-[inset_-5px_0_15px_rgba(0,0,0,0.02)]">
      <div className="flex-1 overflow-hidden p-6 pb-2">
        <img src={photo?.image_url} alt="travel" className="w-full h-full object-cover rounded-md" />
      </div>
      <div className="h-24 px-8 pt-3 pb-6 flex flex-col justify-between">
        <p className="text-gray-600 font-sans text-xs text-center leading-relaxed">{photo?.caption || ""}</p>
        <p className="text-gray-300 text-[10px] font-sans font-medium text-right">{pageNumber}</p>
      </div>
    </div>
  );
};

// ─── BACK COVER ───────────────────────────────────────────
// ─── BACK COVER ───────────────────────────────────────────
// ─── BACK COVER ───────────────────────────────────────────
const BackCoverPage = ({ book }) => {
  const isLoveStory = book?.book_type === "scrapbook" || book?.color_scheme === "green"; 
  
  if (isLoveStory) {
    return (
      <div className="w-full h-full bg-[#FDFBF7] flex flex-col items-center justify-center p-8 shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] border-l border-[#E5DECZ]">
         {/* ✅ Unified Logo System Only (No Icons) */}
         <div className="opacity-90 mix-blend-multiply mb-1">
           <Logo size={24} dark={false} clickable={false} />
         </div>
         
         <p className="text-[10px] text-[#D1C5B4] text-center mt-2 tracking-widest uppercase">
           Printed in Nepal
         </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-950 flex flex-col items-center justify-center p-8 shadow-[inset_10px_0_20px_rgba(0,0,0,0.4)]">
      {/* ✅ Unified Logo System Only (Dark Mode, No Icons) */}
      <div className="opacity-90 mb-1">
        <Logo size={24} dark={true} clickable={false} />
      </div>
      
      <p className="text-[10px] text-gray-500 text-center mt-2 tracking-widest uppercase">
        Printed in Nepal
      </p>
      <div className="w-6 h-px bg-gray-800 my-4" />
      <p className="text-xs text-gray-600 font-serif italic">{book?.destination}</p>
    </div>
  );
};

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

    if (list.length % 2 !== 0) {
       list.push({ type: "blank" });
    }

    list.push({ type: "back" });
    return list;
  };

  const pageList = buildPageList();
  const totalPages = pageList.length;
  const theme = getTheme(book?.color_scheme);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium font-sans">Loading your book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex flex-col font-sans">
      <AppNavbar
        title={book?.title || "Preview"}
        backTo={`/editor/${bookId}`}
        backLabel="Editor"
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => navigate(`/editor/${bookId}`)} className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 rounded-full px-4 py-2 text-xs font-bold hover:border-gray-900 hover:text-gray-900 transition-colors shadow-sm">
              <Edit3 size={13} /> Edit
            </button>
            <ExportPDF book={book} photos={photos} pages={pages} />
            <button onClick={() => navigate(`/order/${bookId}`)} className="flex items-center gap-2 bg-gray-900 text-white border-none rounded-full px-5 py-2 text-xs font-bold hover:bg-rose-500 transition-colors shadow-sm">
              <ShoppingBag size={13} /> Order Print
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        <div className="shadow-2xl rounded-sm">
          {(() => {
            const isSquare = book?.book_type === "luxury";
            const bookWidth = isSquare ? 420 : 360;
            const bookHeight = isSquare ? 420 : 480;

            return (
              <HTMLFlipBook
                width={bookWidth}
                height={bookHeight}
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
                flippingTime={750}
                usePortrait={false}
                startZIndex={0}
                autoSize={false}
                maxShadowOpacity={0.3}
                showPageCorners={true}
                disableFlipByClick={false}
                startPage={0}
                className="bg-white"
              >
                {pageList.map((page, index) => (
                  <div key={index} className="w-full h-full bg-white">
                    {page.type === "cover" && <CoverPage book={book} />}
                    {page.type === "section" && <SectionPage title={page.title} theme={theme} />}
                    {page.type === "photo" && <PhotoPage photo={page.photo} pageNumber={index} theme={theme} />}
                    {page.type === "blank" && <div className="w-full h-full bg-white shadow-[inset_-5px_0_15px_rgba(0,0,0,0.02)]" />}
                    {page.type === "back" && <BackCoverPage book={book} />}
                  </div>
                ))}
              </HTMLFlipBook>
            );
          })()}
        </div>

        <div className="flex items-center gap-6 mt-10 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
          <button onClick={() => flipBook.current?.pageFlip().flipPrev()} className="w-8 h-8 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {pageList.map((_, i) => (
              <button key={i} onClick={() => flipBook.current?.pageFlip().flip(i)} className={`rounded-full transition-all ${i === currentPage ? "w-3 h-1.5 bg-gray-900" : "w-1.5 h-1.5 bg-gray-200 hover:bg-gray-400"}`} />
            ))}
          </div>
          <button onClick={() => flipBook.current?.pageFlip().flipNext()} className="w-8 h-8 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookPreview;