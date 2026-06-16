// client/src/pages/OrderPage.jsx
// BlushBook — Production Order Page (eSewa + Khalti + Manual QR)

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Package, MapPin, Phone, User,
  AlertCircle, Lock, BookOpen, Truck, QrCode, UploadCloud, CheckCircle
} from "lucide-react";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";
import paymentQrImage from "../assets/my-qr-code.jpeg";

// ─── DATA & CONSTANTS ─────────────────────────────────────
const PROVINCES = [
  "Koshi Province", "Madhesh Province", "Bagmati Province",
  "Gandaki Province", "Lumbini Province", "Karnali Province",
  "Sudurpashchim Province",
];

const BOOK_PRICES = {
  journal: 2499,
  scrapbook: 2999,
  hardcover: 4499,
  luxury: 6499,
  default: 2999,
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────
const FormField = ({ label, required, error, icon: Icon, children }) => (
  <div className="mb-5">
    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors duration-300" />}
      {children}
    </div>
    {error && (
      <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-600 animate-in slide-in-from-top-1">
        <AlertCircle className="w-3.5 h-3.5" /> {error}
      </p>
    )}
  </div>
);

const PaymentCard = ({ id, selected, onSelect, logo, name, desc, colorClass, ringClass, disabled, badge }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => !disabled && onSelect(id)}
    className={`w-full relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 ease-out
      ${disabled 
        ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200 grayscale-[0.3]" 
        : selected === id 
          ? `bg-white ${ringClass} shadow-md scale-[1.02] -translate-y-0.5 z-10` 
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"}`}
  >
    {/* Coming Soon Badge */}
    {badge && (
      <div className="absolute -top-2.5 right-4 bg-gray-800 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md z-20">
        {badge}
      </div>
    )}

    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${colorClass} bg-opacity-10 transition-transform duration-300 ${selected === id ? 'scale-110' : ''}`}>
      {logo}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-gray-900 text-sm mb-0.5 truncate">{name}</p>
      <p className="text-xs text-gray-500 font-medium truncate">{desc}</p>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
      ${selected === id ? ringClass.replace('border', 'bg').replace('ring', 'bg') + " border-transparent scale-110" : "border-gray-300"}`}>
      {selected === id && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in duration-200" />}
    </div>
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────
const OrderPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qr_transfer");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // QR Proof State
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");

  const params = new URLSearchParams(location.search);
  const paymentResult = params.get("payment");

  const [shipping, setShipping] = useState({
    name: "", phone: "", address: "",
    city: "", district: "", province: "Bagmati Province", notes: "",
  });

  useEffect(() => {
    api.get(`/books/${bookId}`)
      .then(res => setBook(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [bookId]);

  const price = BOOK_PRICES[book?.book_type] || BOOK_PRICES.default;
  const shipping_charge = 150;
  const total = price + shipping_charge;

  const handleShipping = (e) => {
    setShipping(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
      if (serverError) setServerError("");
    }
  };

  const validate = () => {
    const errs = {};
    if (!shipping.name.trim()) errs.name = "Full name is required";
    if (!shipping.phone.trim() || !/^[9][0-9]{9}$/.test(shipping.phone))
      errs.phone = "Valid 10-digit Nepali phone number required";
    if (!shipping.address.trim()) errs.address = "Address is required";
    if (!shipping.city.trim()) errs.city = "City is required";
    if (!shipping.district.trim()) errs.district = "District is required";
    setErrors(errs);

    if (paymentMethod === "qr_transfer" && !qrFile) {
      setServerError("Please upload a screenshot of your payment receipt to continue.");
      return false;
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      // Smoothly scroll up to the shipping form if there are errors
      document.getElementById('shipping-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSubmitting(true);
    setServerError("");

    try {
      let paymentProofUrl = "";

      // 1. Upload QR Screenshot if applicable
      if (paymentMethod === "qr_transfer" && qrFile) {
        const formData = new FormData();
        formData.append("file", qrFile);
        formData.append("upload_preset", "blushbook_receipts");

        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/durj9snai/image/upload", {
          method: "POST",
          body: formData,
        });

        if (!cloudRes.ok) throw new Error("Failed to upload payment receipt.");
        const cloudData = await cloudRes.json();
        paymentProofUrl = cloudData.secure_url;
      }

      // 2. Prepare Payload
      const payload = {
        bookId: parseInt(bookId),
        bookType: book?.book_type || "hardcover",
        shipping,
        paymentProofUrl // Attached for the backend to save
      };

      // 3. Process Route
      if (paymentMethod === "qr_transfer") {
        const res = await api.post("/payments/qr", payload);
        navigate(`/orders?payment=success&orderId=${res.data.orderId}`);

      } else if (paymentMethod === "esewa") {
        const res = await api.post("/payments/esewa/initiate", payload);
        const form = document.createElement("form");
        form.method = "POST";
        form.action = res.data.paymentUrl;
        Object.entries(res.data.formData).forEach(([key, val]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();

      } else if (paymentMethod === "khalti") {
        const res = await api.post("/payments/khalti/initiate", payload);
        window.location.href = res.data.paymentUrl;

      } else if (paymentMethod === "cod") {
        const res = await api.post("/payments/cod", payload);
        navigate(`/orders?payment=success&orderId=${res.data.orderId}`);
      }

    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.error || err.message || "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading order details...</p>
      </div>
    );
  }

  const baseInputClass = "w-full bg-gray-50 border rounded-xl py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <AppNavbar backTo={`/preview/${bookId}`} backLabel="Preview" title="Checkout" />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Payment Failure Banners */}
        {paymentResult === "failed" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">Payment was not completed. Please try again or choose a different payment method.</span>
          </div>
        )}
        {paymentResult === "cancelled" && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">Payment was cancelled. You can try again below.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN: FORMS ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* Shipping Section */}
            <section id="shipping-section" className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">Delivery Address</h2>
                  <p className="text-sm text-gray-500 font-medium">We deliver anywhere in Nepal</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="md:col-span-2">
                  <FormField label="Full Name" required error={errors.name} icon={User}>
                    <input
                      name="name" value={shipping.name} onChange={handleShipping}
                      placeholder="Your full name"
                      className={`${baseInputClass} pl-11 pr-4 ${errors.name ? 'border-red-400 focus:border-red-500 ring-red-100' : 'border-gray-200 focus:border-gray-900 ring-gray-100'}`}
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Phone Number" required error={errors.phone} icon={Phone}>
                    <input
                      name="phone" value={shipping.phone} onChange={handleShipping}
                      placeholder="98XXXXXXXX"
                      className={`${baseInputClass} pl-11 pr-4 ${errors.phone ? 'border-red-400 focus:border-red-500 ring-red-100' : 'border-gray-200 focus:border-gray-900 ring-gray-100'}`}
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Street Address" required error={errors.address}>
                    <input
                      name="address" value={shipping.address} onChange={handleShipping}
                      placeholder="Ward no., Tole, Street"
                      className={`${baseInputClass} px-4 ${errors.address ? 'border-red-400 focus:border-red-500 ring-red-100' : 'border-gray-200 focus:border-gray-900 ring-gray-100'}`}
                    />
                  </FormField>
                </div>

                <FormField label="City / VDC" required error={errors.city}>
                  <input
                    name="city" value={shipping.city} onChange={handleShipping}
                    placeholder="Kathmandu"
                    className={`${baseInputClass} px-4 ${errors.city ? 'border-red-400 focus:border-red-500 ring-red-100' : 'border-gray-200 focus:border-gray-900 ring-gray-100'}`}
                  />
                </FormField>

                <FormField label="District" required error={errors.district}>
                  <input
                    name="district" value={shipping.district} onChange={handleShipping}
                    placeholder="Kathmandu"
                    className={`${baseInputClass} px-4 ${errors.district ? 'border-red-400 focus:border-red-500 ring-red-100' : 'border-gray-200 focus:border-gray-900 ring-gray-100'}`}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Province">
                    <select
                      name="province" value={shipping.province} onChange={handleShipping}
                      className={`${baseInputClass} px-4 border-gray-200 focus:border-gray-900 ring-gray-100 cursor-pointer`}
                    >
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </FormField>
                </div>

                <div className="md:col-span-2 mb-0">
                  <FormField label="Delivery Notes (Optional)">
                    <textarea
                      name="notes" value={shipping.notes} onChange={handleShipping}
                      placeholder="Landmark, building name, floor, or special instructions..."
                      rows={2}
                      className={`${baseInputClass} px-4 border-gray-200 focus:border-gray-900 ring-gray-100 resize-none`}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">Payment Method</h2>
                  <p className="text-sm text-gray-500 font-medium">Secure local payment gateways</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Manual QR (Active) */}
                <PaymentCard
                  id="qr_transfer" selected={paymentMethod} onSelect={setPaymentMethod}
                  logo={<QrCode className="w-6 h-6 text-rose-500" />} name="Manual QR / Bank Transfer" desc="Scan QR to pay and upload receipt"
                  colorClass="text-rose-500 bg-rose-500" ringClass="border-rose-500 ring-rose-500"
                />

                {paymentMethod === "qr_transfer" && (
                  <div className="mt-4 p-5 md:p-6 border-2 border-rose-100 bg-rose-50/40 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">1</div>
                      <h4 className="text-sm font-bold text-gray-900">Scan & Pay (Rs. {total.toLocaleString()})</h4>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-6 flex flex-col items-center shadow-sm">
                      <img
                        src={paymentQrImage}
                        alt="Scan to Pay"
                        className="w-48 h-48 object-contain rounded-xl mb-3 border border-gray-100 shadow-sm"
                      />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scan using eSewa or Khalti</p>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">2</div>
                      <h4 className="text-sm font-bold text-gray-900">Upload Receipt</h4>
                    </div>

                    <div className="space-y-3 pl-11">
                      <label className="relative cursor-pointer w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 hover:border-rose-400 hover:bg-rose-50 transition-colors group">
                        <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                          {qrFile ? qrFile.name : "Click to attach screenshot"}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                      
                      {qrPreview && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-in zoom-in duration-300">
                          <img src={qrPreview} alt="Receipt Preview" className="w-full h-full object-contain bg-gray-50" />
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                            <CheckCircle className="w-3.5 h-3.5" /> Attached
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. COD (Active) */}
                <PaymentCard
                  id="cod" selected={paymentMethod} onSelect={setPaymentMethod}
                  logo="COD" name="Cash on Delivery" desc="Pay cash when your book arrives"
                  colorClass="text-gray-900 bg-gray-900" ringClass="border-gray-900 ring-gray-900"
                />

                {/* 3. eSewa (Disabled / Coming Soon) */}
                <PaymentCard
                  id="esewa" selected={paymentMethod} onSelect={setPaymentMethod}
                  logo="eSewa" name="eSewa Direct" desc="Direct wallet integration"
                  colorClass="text-[#60BB46] bg-[#60BB46]" ringClass="border-[#60BB46] ring-[#60BB46]"
                  disabled={true} badge="Coming Soon"
                />

                {/* 4. Khalti (Disabled / Coming Soon) */}
                <PaymentCard
                  id="khalti" selected={paymentMethod} onSelect={setPaymentMethod}
                  logo="Khalti" name="Khalti Direct" desc="Direct wallet integration"
                  colorClass="text-[#5C2D91] bg-[#5C2D91]" ringClass="border-[#5C2D91] ring-[#5C2D91]"
                  disabled={true} badge="Coming Soon"
                />
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100">
                <Lock className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500">
                  Payments are processed securely. We do not store your credentials.
                </p>
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: SUMMARY ── */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 transition-all duration-300">

              {/* Dynamic Book Preview */}
              <div className={`w-full bg-gray-100 flex items-center justify-center overflow-hidden
                ${book?.book_type === 'luxury' ? 'aspect-square' : 'aspect-video'}`}>
                {book?.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-300" />
                )}
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-1 font-display truncate">
                  {book?.title || "Untitled Book"}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-6">
                  {book?.destination || "Photo Book"} · <span className="capitalize">{book?.book_type || "Hardcover"}</span>
                </p>

                {/* Pricing Breakdown */}
                <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Photo Book ({book?.book_type})</span>
                    <span className="text-gray-900 font-bold">Rs. {price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Delivery (Nepal)</span>
                    <span className="text-gray-900 font-bold">Rs. {shipping_charge}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6 mt-6 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total</span>
                  <span className="text-3xl font-black text-rose-500 font-display">Rs. {total.toLocaleString()}</span>
                </div>

                {serverError && (
                  <div className="mt-6 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2 animate-in slide-in-from-bottom-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {serverError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full mt-8 bg-gray-900 text-white rounded-2xl py-4 text-sm font-bold hover:bg-rose-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:bg-gray-900 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {paymentMethod === "cod" ? "Confirming Order..." : paymentMethod === "qr_transfer" ? "Uploading Receipt..." : "Redirecting securely..."}
                    </>
                  ) : (
                    <>
                      {paymentMethod === "cod" ? "Place Order (COD)" : paymentMethod === "qr_transfer" ? "Submit Receipt & Order" : `Pay via ${paymentMethod === "esewa" ? "eSewa" : "Khalti"}`}
                    </>
                  )}
                </button>

                <div className="mt-6 bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-emerald-800 leading-snug">
                    Standard delivery takes 5–10 business days anywhere in Nepal.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OrderPage;