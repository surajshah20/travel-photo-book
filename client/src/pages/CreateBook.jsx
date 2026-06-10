// client/src/pages/CreateBook.jsx
// Blushbook — Professional Multi-Step Book Creation

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, Check } from "lucide-react";
import api from "../api/axios";

// ─── BOOK TYPES DATA ──────────────────────────────────────
const bookTypes = [
  {
    id: "journal",
    name: "Travel Journal",
    description: "Classic diary style with a handwritten, personal feel. Perfect for solo trips.",
    price: "$19.99",
    size: "A5 · 14.8 x 21 cm",
    pages: "20–60 pages",
    cover: "Softcover",
    img: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    accent: "text-amber-600",
    badge: "Most Personal",
  },
  {
    id: "scrapbook",
    name: "Adventure Scrapbook",
    description: "Fun, creative layouts with bold typography. Great for adventurous trips.",
    price: "$24.99",
    size: "A4 · 21 x 29.7 cm",
    pages: "20–80 pages",
    cover: "Softcover",
    img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&q=80",
    color: "from-green-50 to-teal-50",
    border: "border-green-200",
    accent: "text-green-600",
    badge: "Most Creative",
  },
  {
    id: "hardcover",
    name: "Premium Hardcover",
    description: "Professional hardcover album. The most popular choice for gift-worthy books.",
    price: "$34.99",
    size: "A4 · 21 x 29.7 cm",
    pages: "40–100 pages",
    cover: "Hardcover",
    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80",
    color: "from-rose-50 to-pink-50",
    border: "border-rose-300",
    accent: "text-rose-600",
    badge: "Most Popular",
    popular: true,
  },
  {
    id: "luxury",
    name: "Luxury Album",
    description: "Premium thick glossy pages with a stunning lay-flat binding. Pure luxury.",
    price: "$49.99",
    size: "30 x 30 cm",
    pages: "60–120 pages",
    cover: "Hardcover",
    img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80",
    color: "from-purple-50 to-indigo-50",
    border: "border-purple-200",
    accent: "text-purple-600",
    badge: "Premium",
  },
];

// ─── STEP 1: Book Type ────────────────────────────────────
const StepBookType = ({ selected, onSelect }) => (
  <div>
    <h2
      className="text-2xl font-bold text-gray-900 mb-2"
      style={{ fontFamily: "Georgia, serif" }}
    >
      Choose your book type
    </h2>
    <p className="text-gray-400 text-sm mb-8">
      Each book type has different sizes, page counts, and finishes
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookTypes.map((type) => (
        <div
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`relative rounded-2xl border-2 cursor-pointer transition-all overflow-hidden
            ${selected === type.id
              ? `${type.border} shadow-lg scale-[1.01]`
              : "border-gray-100 hover:border-gray-200"
            }`}
        >
          {type.popular && (
            <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white text-xs font-bold text-center py-1 uppercase tracking-wide">
              Most Popular
            </div>
          )}
          <div className={`flex gap-4 p-5 ${type.popular ? "mt-6" : ""}`}>
            {/* Image */}
            <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={type.img}
                alt={type.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{type.name}</h3>
                <span className={`text-sm font-bold ${type.accent}`}>
                  {type.price}
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                {type.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {[type.size, type.pages, type.cover].map((spec) => (
                  <span
                    key={spec}
                    className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected check */}
            {selected === type.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── STEP 2: Template ─────────────────────────────────────
const StepTemplate = ({ selected, onSelect }) => {
  const [templates, setTemplates] = useState([]);

  const templateStyles = {
    modern: {
      bg: "bg-gray-900",
      text: "text-white",
      accent: "bg-white",
      preview: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80",
      desc: "Clean lines, bold typography, dark backgrounds",
    },
    vintage: {
      bg: "bg-amber-50",
      text: "text-amber-900",
      accent: "bg-amber-600",
      preview: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=300&q=80",
      desc: "Warm tones, aged textures, nostalgic feel",
    },
    luxury: {
      bg: "bg-rose-900",
      text: "text-rose-100",
      accent: "bg-rose-400",
      preview: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&q=80",
      desc: "Rich colors, gold accents, premium feel",
    },
    scrapbook: {
      bg: "bg-green-50",
      text: "text-green-900",
      accent: "bg-green-500",
      preview: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=300&q=80",
      desc: "Playful layouts, fun colors, creative style",
    },
    journal: {
      bg: "bg-blue-50",
      text: "text-blue-900",
      accent: "bg-blue-500",
      preview: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=300&q=80",
      desc: "Diary feel, handwritten fonts, personal touch",
    },
  };

  useEffect(() => {
    api.get("/templates").then((res) => setTemplates(res.data));
  }, []);

  return (
    <div>
      <h2
        className="text-2xl font-bold text-gray-900 mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Pick a design template
      </h2>
      <p className="text-gray-400 text-sm mb-8">
        Each template has a unique visual style and layout
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const style = templateStyles[template.style] || templateStyles.modern;
          return (
            <div
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden
                ${selected === template.id
                  ? "border-rose-400 shadow-lg scale-[1.02]"
                  : "border-gray-100 hover:border-gray-200"
                }`}
            >
              {/* Template preview */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={style.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${style.bg} opacity-60`} />

                {/* Mock layout overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className={`h-1.5 w-16 ${style.accent} rounded mb-2 opacity-80`} />
                  <div className={`h-3 w-24 ${style.accent} rounded opacity-60`} />
                </div>

                {selected === template.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {template.is_premium && (
                  <div className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Premium
                  </div>
                )}
              </div>

              {/* Template info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {template.name}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {style.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── STEP 3: Trip Info ────────────────────────────────────
const StepTripInfo = ({ data, onChange }) => (
  <div>
    <h2
      className="text-2xl font-bold text-gray-900 mb-2"
      style={{ fontFamily: "Georgia, serif" }}
    >
      Tell us about your trip
    </h2>
    <p className="text-gray-400 text-sm mb-8">
      This information will appear on your book cover
    </p>
    <div className="max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Book Title
        </label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={onChange}
          placeholder="My Bali Adventure"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Destination
        </label>
        <input
          type="text"
          name="destination"
          value={data.destination}
          onChange={onChange}
          placeholder="Bali, Indonesia"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="travel_date_start"
            value={data.travel_date_start}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="travel_date_end"
            value={data.travel_date_end}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Preview card */}
      {data.title && (
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white mt-4">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-3">
            Cover Preview
          </p>
          <h3 className="text-xl font-bold mb-1">{data.title}</h3>
          {data.destination && (
            <p className="text-sm opacity-75">{data.destination}</p>
          )}
          {data.travel_date_start && (
            <p className="text-xs opacity-50 mt-2">
              {new Date(data.travel_date_start).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  </div>
);

// ─── STEP 4: Creation Mode ────────────────────────────────
const StepChooseMode = ({ selected, onSelect }) => (
  <div>
    <h2
      className="text-2xl font-bold text-gray-900 mb-2"
      style={{ fontFamily: "Georgia, serif" }}
    >
      How do you want to create?
    </h2>
    <p className="text-gray-400 text-sm mb-8">
      Choose how you want to build your book
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">

      {/* AI Mode */}
      <div
        onClick={() => onSelect("ai")}
        className={`rounded-2xl border-2 cursor-pointer transition-all p-6
          ${selected === "ai"
            ? "border-rose-400 bg-rose-50 shadow-lg"
            : "border-gray-100 bg-white hover:border-gray-200"
          }`}
      >
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-900 text-lg">AI Mode</h3>
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
            Recommended
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          Upload your photos and let AI automatically organize them into
          sections, write captions, select the best cover, and create
          your complete book.
        </p>
        <div className="space-y-2">
          {[
            "Auto photo organization",
            "AI-generated captions",
            "Smart cover selection",
            "Ready in seconds",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-rose-500" />
              </div>
              {f}
            </div>
          ))}
        </div>
        {selected === "ai" && (
          <div className="mt-4 pt-4 border-t border-rose-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-rose-600 text-sm font-semibold">Selected</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Mode */}
      <div
        onClick={() => onSelect("manual")}
        className={`rounded-2xl border-2 cursor-pointer transition-all p-6
          ${selected === "manual"
            ? "border-gray-900 bg-gray-50 shadow-lg"
            : "border-gray-100 bg-white hover:border-gray-200"
          }`}
      >
        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-900 text-lg">Manual Mode</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
            Full Control
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          Build your book yourself. Choose your own layouts, pick photos
          for each page, write your own captions, and arrange everything
          exactly how you want.
        </p>
        <div className="space-y-2">
          {[
            "Choose your own layouts",
            "Pick photos per page",
            "Write custom captions",
            "Full creative control",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-gray-500" />
              </div>
              {f}
            </div>
          ))}
        </div>
        {selected === "manual" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-900 text-sm font-semibold">Selected</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── MAIN CREATE BOOK PAGE ────────────────────────────────
const CreateBook = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookData, setBookData] = useState({
    book_type: "",
    template_id: null,
    title: "",
    destination: "",
    travel_date_start: "",
    travel_date_end: "",
    creation_mode: "",
  });

  const handleTripInfoChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const canProceed = () => {
    if (currentStep === 1) return bookData.book_type !== "";
    if (currentStep === 2) return bookData.template_id !== null;
    if (currentStep === 3) return bookData.title !== "" && bookData.destination !== "";
    if (currentStep === 4) return bookData.creation_mode !== "";
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/books", bookData);
      navigate(`/upload/${res.data.book.id}`);
    } catch (err) {
      console.error(err);
      setError("Could not create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Book Type" },
    { num: 2, label: "Template" },
    { num: 3, label: "Trip Info" },
    { num: 4, label: "Create Mode" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
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
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-gray-600 text-sm transition flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${step.num < currentStep
                      ? "bg-rose-500 text-white"
                      : step.num === currentStep
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {step.num < currentStep
                    ? <Check className="w-4 h-4" />
                    : String(step.num)
                  }
                </div>
                <span className={`text-xs mt-1.5 hidden md:block font-medium
                  ${step.num === currentStep ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 md:w-24 mx-2 transition-all
                    ${step.num < currentStep ? "bg-rose-500" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-card p-8 mb-6">
          {currentStep === 1 && (
            <StepBookType
              selected={bookData.book_type}
              onSelect={(val) => setBookData({ ...bookData, book_type: val })}
            />
          )}
          {currentStep === 2 && (
            <StepTemplate
              selected={bookData.template_id}
              onSelect={(val) => setBookData({ ...bookData, template_id: val })}
            />
          )}
          {currentStep === 3 && (
            <StepTripInfo
              data={bookData}
              onChange={handleTripInfoChange}
            />
          )}
          {currentStep === 4 && (
            <StepChooseMode
              selected={bookData.creation_mode}
              onSelect={(val) => setBookData({ ...bookData, creation_mode: val })}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 transition disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {/* Step indicator */}
          <span className="text-gray-400 text-sm">
            Step {currentStep} of {steps.length}
          </span>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-rose-500 transition disabled:opacity-40"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create My Book
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBook;