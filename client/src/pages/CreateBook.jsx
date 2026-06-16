// client/src/pages/CreateBook.jsx
// Blushbook — Production Multi-Step Book Creation

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, Check, 
  Wand2, Settings2, Sparkles, MapPin, Calendar
} from "lucide-react";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";

// ─── DATA ─────────────────────────────────────────────────
const bookTypes = [
  {
    id: "journal",
    name: "Travel Journal",
    description: "Classic diary style with a handwritten, personal feel. Perfect for solo trips.",
    price: "Rs. 2,499",
    specs: ["A5 · 14.8 x 21 cm", "20–60 pages", "Softcover"],
    img: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80",
    badge: null,
  },
  {
    id: "scrapbook",
    name: "Adventure Scrapbook",
    description: "Fun, creative layouts with bold typography. Great for adventurous trips.",
    price: "Rs. 2,499",
    specs: ["A4 · 21 x 29.7 cm", "20–80 pages", "Softcover"],
    img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&q=80",
    badge: null,
  },
  {
    id: "hardcover",
    name: "Premium Hardcover",
    description: "Professional hardcover album. The most popular choice for gift-worthy books.",
    price: "Rs. 3,499",
    specs: ["A4 · 21 x 29.7 cm", "40–100 pages", "Hardcover"],
    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80",
    badge: "Most Popular",
  },
  {
    id: "luxury",
    name: "Luxury Album",
    description: "Premium thick glossy pages with a stunning lay-flat binding. Pure luxury.",
    price: "Rs. 6,499",
    specs: ["30 x 30 cm", "60–120 pages", "Hardcover"],
    img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80",
    badge: "Premium",
  },
];

const templateStyles = {
  modern: { bg: "bg-gray-900", accent: "bg-white", preview: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", desc: "Clean lines, bold typography" },
  vintage: { bg: "bg-amber-900", accent: "bg-amber-200", preview: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=300&q=80", desc: "Warm tones, nostalgic feel" },
  luxury: { bg: "bg-rose-900", accent: "bg-rose-200", preview: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&q=80", desc: "Rich colors, elegant margins" },
  scrapbook: { bg: "bg-emerald-900", accent: "bg-emerald-200", preview: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=300&q=80", desc: "Playful, creative layouts" },
  journal: { bg: "bg-blue-900", accent: "bg-blue-200", preview: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=300&q=80", desc: "Diary feel, classic touch" },
};

const templates = [
  { id: 1, name: "Minimalist Modern", style: "modern", is_premium: false },
  { id: 2, name: "Classic Vintage", style: "vintage", is_premium: false },
  { id: 3, name: "Luxury Edge-to-Edge", style: "luxury", is_premium: true },
  { id: 4, name: "Travel Scrapbook", style: "scrapbook", is_premium: false },
  { id: 5, name: "Explorer's Journal", style: "journal", is_premium: false },
];

// ─── STEP COMPONENTS ──────────────────────────────────────

const StepBookType = ({ selected, onSelect }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-2">Choose your format</h2>
      <p className="text-gray-500 text-sm">Select the physical size and binding for your printed book.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {bookTypes.map((type) => (
        <div
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`group relative flex flex-col sm:flex-row gap-5 p-5 rounded-3xl border transition-all cursor-pointer overflow-hidden
            ${selected === type.id
              ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
            }`}
        >
          {type.badge && (
            <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
              {type.badge}
            </div>
          )}

          <div className="w-full sm:w-32 h-40 sm:h-auto rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img src={type.img} alt={type.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>

          <div className="flex flex-col flex-1 py-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{type.name}</h3>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">{type.description}</p>
            
            <div className="mt-auto">
              <p className="font-bold text-gray-900 text-sm mb-3">{type.price}</p>
              <div className="flex flex-wrap gap-1.5">
                {type.specs.map((spec) => (
                  <span key={spec} className="text-[11px] font-medium bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {selected === type.id && (
            <div className="absolute bottom-5 right-5 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const StepTemplate = ({ selected, onSelect }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-2">Select a design theme</h2>
      <p className="text-gray-500 text-sm">This determines the default layouts, colors, and typography.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {templates.map((template) => {
        const style = templateStyles[template.style];
        return (
          <div
            key={template.id}
            onClick={() => onSelect(template.id, template.style)}
            className={`group rounded-3xl border transition-all cursor-pointer overflow-hidden bg-white
              ${selected === template.id
                ? "border-gray-900 ring-1 ring-gray-900 shadow-md scale-[1.02]"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
          >
            <div className="relative h-40 overflow-hidden bg-gray-100">
              <img src={style.preview} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
              <div className={`absolute inset-0 ${style.bg} opacity-60 mix-blend-multiply`} />
              
              {/* Abstract layout overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className={`h-1.5 w-1/3 ${style.accent} rounded-full mb-2.5 opacity-90`} />
                <div className={`h-2.5 w-2/3 ${style.accent} rounded-full opacity-70`} />
              </div>

              {template.is_premium && (
                <div className="absolute top-4 left-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Premium
                </div>
              )}
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{template.name}</h3>
                <p className="text-gray-500 text-xs">{style.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                ${selected === template.id ? "bg-gray-900 border-gray-900" : "border-gray-300 bg-gray-50 group-hover:border-gray-400"}`}>
                {selected === template.id && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const StepTripInfo = ({ data, onChange }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
    <div className="mb-8 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-2">Book Details</h2>
      <p className="text-gray-500 text-sm">This information will appear on the cover and spine of your book.</p>
    </div>

    <div className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
      <div>
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Book Title</label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={onChange}
          placeholder="e.g. Summer in Pokhara"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Destination</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="destination"
            value={data.destination}
            onChange={onChange}
            placeholder="e.g. Nepal"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="travel_date_start"
              value={data.travel_date_start}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-gray-700 focus:bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="travel_date_end"
              value={data.travel_date_end}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-gray-700 focus:bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StepChooseMode = ({ selected, onSelect }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <div className="mb-8 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-2">How do you want to create?</h2>
      <p className="text-gray-500 text-sm">Choose your preferred creation method before uploading photos.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* AI Mode */}
      <div
        onClick={() => onSelect("ai")}
        className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden
          ${selected === "ai"
            ? "border-rose-500 bg-rose-50/50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          }`}
      >
        {selected === "ai" && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500" />
        )}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-5 text-white shadow-sm group-hover:scale-110 transition-transform">
          <Wand2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
          Magic AI Creation
          <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Upload your photos and let our AI instantly build your book. It auto-organizes pages, selects cover images, and writes beautiful captions.
        </p>
        <div className="mt-auto space-y-2.5">
          {["Done in seconds", "Auto-generated captions", "Smart layouts"].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
              <Check className="w-4 h-4 text-rose-500" /> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Manual Mode */}
      <div
        onClick={() => onSelect("manual")}
        className={`group relative flex flex-col p-6 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden
          ${selected === "manual"
            ? "border-gray-900 bg-gray-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          }`}
      >
        {selected === "manual" && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gray-900" />
        )}
        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-700 group-hover:scale-110 transition-transform">
          <Settings2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
          Manual Design
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Start with a blank canvas. You have complete control to place every photo, choose every layout, and write your own story.
        </p>
        <div className="mt-auto space-y-2.5">
          {["Full creative control", "Write custom text", "Custom photo placement"].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
              <Check className="w-4 h-4 text-gray-900" /> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────
const CreateBook = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookData, setBookData] = useState({
    book_type: "",
    template_id: null,
    template_style: "modern", 
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
    if (currentStep === 3) return bookData.title.trim() !== "" && bookData.destination.trim() !== "";
    if (currentStep === 4) return bookData.creation_mode !== "";
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const styleMap = {
        modern: { color_scheme: "gray", font_style: "modern" },
        vintage: { color_scheme: "amber", font_style: "serif" },
        luxury: { color_scheme: "purple", font_style: "serif" },
        scrapbook: { color_scheme: "green", font_style: "modern" },
        journal: { color_scheme: "blue", font_style: "mono" },
      };
      
      const mapped = styleMap[bookData.template_style] || styleMap.modern;
      const payload = {
        ...bookData,
        color_scheme: mapped.color_scheme,
        font_style: mapped.font_style
      };

      const res = await api.post("/books", payload);
      
      try {
        await api.put(`/books/${res.data.book.id}`, {
          color_scheme: mapped.color_scheme,
          font_style: mapped.font_style
        });
      } catch(e) { /* silent fallback */ }

      navigate(`/upload/${res.data.book.id}`);
    } catch (err) {
      console.error(err);
      setError("Could not create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Format" },
    { num: 2, label: "Theme" },
    { num: 3, label: "Details" },
    { num: 4, label: "Method" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <AppNavbar 
        title="Create New Book" 
        backTo="/dashboard" 
        backLabel="Dashboard" 
      />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-8 md:py-12">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-10 w-full max-w-2xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            return (
              <div key={step.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300
                      ${isCompleted
                        ? "bg-gray-900 text-white"
                        : isCurrent
                        ? "bg-white text-gray-900 ring-2 ring-gray-900 ring-offset-2"
                        : "bg-gray-200 text-gray-400"
                      }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={`absolute top-10 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                    ${isCurrent ? "text-gray-900" : isCompleted ? "text-gray-500" : "text-gray-300"}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-[2px] rounded-full overflow-hidden bg-gray-200">
                    <div 
                      className="h-full bg-gray-900 transition-all duration-500 ease-out" 
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="flex-1 mt-6 mb-12">
          {currentStep === 1 && (
            <StepBookType selected={bookData.book_type} onSelect={(val) => setBookData({ ...bookData, book_type: val })} />
          )}
          {currentStep === 2 && (
            <StepTemplate selected={bookData.template_id} onSelect={(val, style) => setBookData({ ...bookData, template_id: val, template_style: style })} />
          )}
          {currentStep === 3 && (
            <StepTripInfo data={bookData} onChange={handleTripInfoChange} />
          )}
          {currentStep === 4 && (
            <StepChooseMode selected={bookData.creation_mode} onSelect={(val) => setBookData({ ...bookData, creation_mode: val })} />
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-5 py-3 text-sm font-medium mb-6 text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-auto">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-gray-500 font-bold text-sm hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Start Uploading
                </>
              )}
            </button>
          )}
        </div>

      </main>
    </div>
  );
};

export default CreateBook;