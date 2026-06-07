// client/src/pages/CreateBook.jsx
// Multi-step book creation wizard

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// ─── STEP 1: Choose Book Type ─────────────────────────────
const bookTypes = [
  {
    id: "journal",
    name: "Travel Journal",
    description: "Classic travel diary style with handwritten feel",
    price: "$19.99",
    icon: "📔",
  },
  {
    id: "hardcover",
    name: "Premium Hardcover",
    description: "Professional hardcover album, perfect as a gift",
    price: "$34.99",
    icon: "📕",
  },
  {
    id: "luxury",
    name: "Luxury Photo Book",
    description: "Premium quality with thick glossy pages",
    price: "$49.99",
    icon: "✨",
  },
  {
    id: "scrapbook",
    name: "Adventure Scrapbook",
    description: "Fun and creative with stickers and layouts",
    price: "$24.99",
    icon: "🗺️",
  },
];

// ─── STEP 1 COMPONENT ─────────────────────────────────────
const StepBookType = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">
      Choose Your Book Type
    </h2>
    <p className="text-gray-500 mb-8">
      Select the style that best fits your trip
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookTypes.map((type) => (
        <div
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all
            ${selected === type.id
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 bg-white hover:border-blue-300"
            }`}
        >
          <div className="text-4xl mb-3">{type.icon}</div>
          <h3 className="text-lg font-semibold text-gray-800">{type.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{type.description}</p>
          <p className="text-blue-600 font-bold mt-3">{type.price}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── STEP 2 COMPONENT: Choose Template ────────────────────
const StepTemplate = ({ selected, onSelect }) => {
  const [templates, setTemplates] = useState([]);

  const templateIcons = {
    modern: "🎨",
    vintage: "📜",
    luxury: "💎",
    scrapbook: "✂️",
    journal: "🖊️",
  };

  useEffect(() => {
    // Fetch templates from backend
    api.get("/templates").then((res) => setTemplates(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Pick a Design Template
      </h2>
      <p className="text-gray-500 mb-8">
        Choose a style that matches your trip vibe
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-center
              ${selected === template.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-blue-300"
              }`}
          >
            <div className="text-5xl mb-3">
              {templateIcons[template.style] || "🎨"}
            </div>
            <h3 className="font-semibold text-gray-800">{template.name}</h3>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {template.style}
            </p>
            {template.is_premium && (
              <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                ⭐ Premium
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── STEP 3 COMPONENT: Trip Info ──────────────────────────
const StepTripInfo = ({ data, onChange }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">
      Tell Us About Your Trip
    </h2>
    <p className="text-gray-500 mb-8">
      This info will appear on your book cover
    </p>
    <div className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Book Title
        </label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={onChange}
          placeholder="My Bali Adventure"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Destination
        </label>
        <input
          type="text"
          name="destination"
          value={data.destination}
          onChange={onChange}
          placeholder="Bali, Indonesia"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="travel_date_start"
            value={data.travel_date_start}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="travel_date_end"
            value={data.travel_date_end}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </div>
  </div>
);

// ─── STEP 4 COMPONENT: Choose Mode ────────────────────────
const StepChooseMode = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">
      How Do You Want to Create?
    </h2>
    <p className="text-gray-500 mb-8">
      Choose your book creation mode
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* AI Mode */}
      <div
        onClick={() => onSelect("ai")}
        className={`p-8 rounded-2xl border-2 cursor-pointer transition-all
          ${selected === "ai"
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-blue-300"
          }`}
      >
        <div className="text-5xl mb-4">🤖</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">AI Mode</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Let AI do the work! It will analyze your photos, remove duplicates,
          select the best cover, group photos into sections, and write captions
          automatically.
        </p>
        <div className="mt-4 space-y-1">
          {["Auto photo selection", "AI captions", "Smart layouts", "Best cover picked"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-green-600">
              <span>✅</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Manual Mode */}
      <div
        onClick={() => onSelect("manual")}
        className={`p-8 rounded-2xl border-2 cursor-pointer transition-all
          ${selected === "manual"
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-blue-300"
          }`}
      >
        <div className="text-5xl mb-4">✏️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Manual Mode</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Full control in your hands. Choose your own layouts, pick photos for
          each page, write your own captions, and arrange everything exactly
          how you want.
        </p>
        <div className="mt-4 space-y-1">
          {["Choose your layouts", "Pick each photo", "Write your captions", "Full creative control"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-blue-600">
              <span>🎨</span> {f}
            </div>
          ))}
        </div>
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

  // All form data in one object
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

  // Check if user can proceed to next step
  const canProceed = () => {
    if (currentStep === 1) return bookData.book_type !== "";
    if (currentStep === 2) return bookData.template_id !== null;
    if (currentStep === 3) return bookData.title !== "" && bookData.destination !== "";
    if (currentStep === 4) return bookData.creation_mode !== "";
    return false;
  };

  // Final submit — create the book
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/books", bookData);
      const book = res.data.book;
      // Go to upload page with the new book id
      navigate(`/upload/${book.id}`);
    } catch (err) {
      setError("Could not create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Book Type", "Template", "Trip Info", "Create Mode"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-4">
        <h1 className="text-xl font-bold text-blue-600">📸 Travel Photo Book</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${index + 1 < currentStep
                      ? "bg-green-500 text-white"
                      : index + 1 === currentStep
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {index + 1 < currentStep ? "✓" : String(index + 1)}
                </div>
                <span className="text-xs text-gray-500 mt-1 hidden md:block">
                  {step}
                </span>
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-16 md:w-24 mx-2 rounded transition-all
                    ${index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
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
            <StepTripInfo data={bookData} onChange={handleTripInfoChange} />
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
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition disabled:opacity-30"
          >
            ← Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-40"
            >
              {loading ? "Creating..." : "Create My Book 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBook;