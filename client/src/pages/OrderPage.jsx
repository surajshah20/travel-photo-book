// client/src/pages/OrderPage.jsx
// FIXES: H3 (autocomplete), H12 (tap targets), C5 (idempotency), M1 (aria), mobile layout

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin, Phone, User, AlertCircle,
  Lock, BookOpen, Truck, QrCode,
  UploadCloud, CheckCircle,
} from "lucide-react";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";
import paymentQrImage from "../assets/my-qr-code.jpeg";

// ─── CONSTANTS ────────────────────────────────────────────
const PROVINCES = [
  "Koshi Province", "Madhesh Province", "Bagmati Province",
  "Gandaki Province", "Lumbini Province", "Karnali Province",
  "Sudurpashchim Province",
];

const BOOK_PRICES = {
  journal:  2499,
  scrapbook: 2999,
  hardcover: 4499,
  luxury:   6499,
  default:  2999,
};

const SHIPPING_CHARGE = 150;

// ─── FORM FIELD WRAPPER ───────────────────────────────────
const FormField = ({ label, required, error, htmlFor, children }) => (
  <div className="mb-5">
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2"
    >
      {label}{" "}
      {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      {required && <span className="sr-only">(required)</span>}
    </label>
    {children}
    {error && (
      <p
        id={`${htmlFor}-error`}
        className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-700"
        role="alert"
      >
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

// ─── PAYMENT OPTION CARD ──────────────────────────────────
const PaymentCard = ({
  id, selected, onSelect,
  logo, name, desc,
  colorClass, ringClass,
  disabled, badge,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => !disabled && onSelect(id)}
    aria-pressed={selected === id}
    aria-disabled={disabled}
    className={`w-full relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 min-h-[68px]
      ${disabled
        ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
        : selected === id
          ? `bg-white ${ringClass} shadow-md`
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
  >
    {badge && (
      <span className="absolute -top-2.5 right-4 bg-gray-800 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest z-10">
        {badge}
      </span>
    )}
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base ${colorClass} bg-opacity-10 flex-shrink-0`} aria-hidden="true">
      {logo}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-gray-900 text-sm mb-0.5 truncate">{name}</p>
      <p className="text-xs text-gray-500 font-medium truncate">{desc}</p>
    </div>
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
        ${selected === id ? "bg-rose-500 border-rose-500" : "border-gray-300"}`}
      aria-hidden="true"
    >
      {selected === id && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────
const OrderPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // FIX C5: Idempotency guard — prevents double-submit on fast tap
  const isSubmittingRef = useRef(false);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qr_transfer");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");
  const fileInputRef = useRef(null);

  const params = new URLSearchParams(location.search);
  const paymentResult = params.get("payment");

  const [shipping, setShipping] = useState({
    name: "", phone: "", address: "",
    city: "", district: "", province: "Bagmati Province", notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    api.get(`/books/${bookId}`)
      .then(res => { if (!cancelled) setBook(res.data); })
      .catch(() => navigate("/dashboard"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [bookId, navigate]);

  const price = BOOK_PRICES[book?.book_type] ?? BOOK_PRICES.default;
  const total = price + SHIPPING_CHARGE;

  const handleShipping = useCallback((e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setServerError("");
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setServerError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setServerError("Receipt image must be under 5MB.");
      return;
    }

    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
    setServerError("");
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => { if (qrPreview) URL.revokeObjectURL(qrPreview); };
  }, [qrPreview]);

  const validate = useCallback(() => {
    const errs = {};
    if (!shipping.name.trim()) errs.name = "Full name is required";
    if (!/^[9][0-9]{9}$/.test(shipping.phone)) errs.phone = "Enter a valid 10-digit Nepali number starting with 9";
    if (!shipping.address.trim()) errs.address = "Street address is required";
    if (!shipping.city.trim()) errs.city = "City is required";
    if (!shipping.district.trim()) errs.district = "District is required";
    setErrors(errs);

    if (paymentMethod === "qr_transfer" && !qrFile) {
      setServerError("Please upload your payment receipt screenshot to continue.");
      return false;
    }
    return Object.keys(errs).length === 0;
  }, [shipping, paymentMethod, qrFile]);

  const handleSubmit = useCallback(async () => {
    // FIX C5: Hard guard against double-submit
    if (isSubmittingRef.current) return;

    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector("[aria-invalid='true'], [role='alert']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setServerError("");

    try {
      let paymentProofUrl = "";

      if (paymentMethod === "qr_transfer" && qrFile) {
        const formData = new FormData();
        formData.append("receipt", qrFile);
        const uploadRes = await api.post("/payments/upload-receipt", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (!uploadRes.data.secure_url) throw new Error("Receipt upload failed.");
        paymentProofUrl = uploadRes.data.secure_url;
      }

      const payload = {
        bookId: parseInt(bookId),
        bookType: book?.book_type || "hardcover",
        shipping,
        paymentProofUrl,
      };

      if (paymentMethod === "qr_transfer") {
        const res = await api.post("/payments/qr", payload);
        navigate(`/orders?payment=success&orderId=${res.data.orderId}`);
      } else if (paymentMethod === "cod") {
        const res = await api.post("/payments/cod", payload);
        navigate(`/orders?payment=success&orderId=${res.data.orderId}`);
      } else if (paymentMethod === "esewa") {
        const res = await api.post("/payments/esewa/initiate", payload);
        const form = document.createElement("form");
        form.method = "POST";
        form.action = res.data.paymentUrl;
        Object.entries(res.data.formData).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden"; input.name = k; input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else if (paymentMethod === "khalti") {
        const res = await api.post("/payments/khalti/initiate", payload);
        window.location.replace(res.data.paymentUrl);
      }
    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.error || err.message || "Could not place order. Please try again.");
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
    // Note: don't reset in finally — redirect handles cleanup for success paths
  }, [validate, paymentMethod, qrFile, bookId, book, shipping, navigate]);

  // Input class builder
  const inputCls = (field) =>
    `w-full bg-gray-50 border rounded-xl py-3.5 px-4 text-base font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[52px] ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
    }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" aria-hidden="true" />
        <p className="text-gray-500 font-medium text-sm" role="status">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <AppNavbar backTo={`/preview/${bookId}`} backLabel="Preview" title="Checkout" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8" id="main-content">

        {/* Payment banners */}
        {paymentResult === "failed" && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-semibold">Payment was not completed. Please try again or choose a different method.</p>
          </div>
        )}
        {paymentResult === "cancelled" && (
          <div role="alert" className="bg-yellow-50 border border-yellow-200 text-yellow-900 px-5 py-4 rounded-2xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-semibold">Payment was cancelled. You can try again below.</p>
          </div>
        )}

        {/* ── ORDER SUMMARY (mobile-first, shown above form on mobile) ── */}
        <div className="lg:hidden mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-18 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {book?.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    aria-hidden="true"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                    <BookOpen className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{book?.title || "Untitled Book"}</h2>
                <p className="text-xs text-gray-500 capitalize mb-2">{book?.book_type}</p>
                <p className="text-xl font-black text-rose-500">Rs. {total.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between"><span>Book price</span><span className="font-semibold text-gray-700">Rs. {price.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-gray-700">Rs. {SHIPPING_CHARGE}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: FORMS ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* Shipping section */}
            <section
              aria-labelledby="shipping-heading"
              className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-7">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                  <MapPin className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h2 id="shipping-heading" className="text-lg font-bold text-gray-900">Delivery Address</h2>
                  <p className="text-sm text-gray-500">We deliver anywhere in Nepal</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <div className="sm:col-span-2">
                  <FormField label="Full Name" required htmlFor="shipping-name" error={errors.name}>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <input
                        id="shipping-name"
                        name="name"
                        type="text"
                        value={shipping.name}
                        onChange={handleShipping}
                        placeholder="Your full name"
                        autoComplete="shipping name"        /* FIX H3 */
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "shipping-name-error" : undefined}
                        className={`${inputCls("name")} pl-10`}
                      />
                    </div>
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Phone Number" required htmlFor="shipping-phone" error={errors.phone}>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <input
                        id="shipping-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        value={shipping.phone}
                        onChange={handleShipping}
                        placeholder="98XXXXXXXX"
                        autoComplete="shipping tel-national"  /* FIX H3 */
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "shipping-phone-error" : undefined}
                        className={`${inputCls("phone")} pl-10`}
                      />
                    </div>
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Street Address" required htmlFor="shipping-address" error={errors.address}>
                    <input
                      id="shipping-address"
                      name="address"
                      type="text"
                      value={shipping.address}
                      onChange={handleShipping}
                      placeholder="Ward no., Tole, Street"
                      autoComplete="shipping street-address" /* FIX H3 */
                      aria-required="true"
                      aria-invalid={!!errors.address}
                      className={inputCls("address")}
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="City / VDC" required htmlFor="shipping-city" error={errors.city}>
                    <input
                      id="shipping-city"
                      name="city"
                      type="text"
                      value={shipping.city}
                      onChange={handleShipping}
                      placeholder="Kathmandu"
                      autoComplete="shipping address-level2" /* FIX H3 */
                      aria-required="true"
                      aria-invalid={!!errors.city}
                      className={inputCls("city")}
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="District" required htmlFor="shipping-district" error={errors.district}>
                    <input
                      id="shipping-district"
                      name="district"
                      type="text"
                      value={shipping.district}
                      onChange={handleShipping}
                      placeholder="Kathmandu"
                      autoComplete="shipping address-level1"
                      aria-required="true"
                      aria-invalid={!!errors.district}
                      className={inputCls("district")}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Province" htmlFor="shipping-province">
                    <select
                      id="shipping-province"
                      name="province"
                      value={shipping.province}
                      onChange={handleShipping}
                      autoComplete="shipping address-level1"
                      className={`${inputCls("province")} cursor-pointer`}
                    >
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Delivery Notes (Optional)" htmlFor="shipping-notes">
                    <textarea
                      id="shipping-notes"
                      name="notes"
                      value={shipping.notes}
                      onChange={handleShipping}
                      placeholder="Landmark, building name, floor, or special instructions..."
                      rows={2}
                      autoComplete="off"
                      className={`${inputCls("notes")} resize-none`}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Payment section */}
            <section
              aria-labelledby="payment-heading"
              className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-7">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                  <Lock className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h2 id="payment-heading" className="text-lg font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-500">Secure local payment gateways</p>
                </div>
              </div>

              <fieldset>
                <legend className="sr-only">Choose payment method</legend>
                <div className="space-y-3">
                  <PaymentCard
                    id="qr_transfer" selected={paymentMethod} onSelect={setPaymentMethod}
                    logo={<QrCode className="w-6 h-6 text-rose-500" aria-hidden="true" />}
                    name="QR / Bank Transfer" desc="Scan QR and upload receipt"
                    colorClass="text-rose-500" ringClass="border-rose-500"
                  />

                  {paymentMethod === "qr_transfer" && (
                    <div className="ml-2 mr-2 p-5 border-2 border-rose-100 bg-rose-50/30 rounded-2xl space-y-5">
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-xs font-bold flex-shrink-0" aria-hidden="true">1</span>
                          Scan &amp; Pay — Rs. {total.toLocaleString()}
                        </p>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col items-center shadow-sm">
                          <img
                            src={paymentQrImage}
                            alt="Payment QR code — scan with eSewa or Khalti"
                            className="w-44 h-44 object-contain rounded-xl mb-2 border border-gray-100"
                            width="176"
                            height="176"
                          />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scan using eSewa or Khalti</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-xs font-bold flex-shrink-0" aria-hidden="true">2</span>
                          Upload Receipt
                        </p>

                        <label
                          htmlFor="receipt-upload"
                          className="relative cursor-pointer flex items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 hover:border-rose-400 hover:bg-rose-50/30 transition-colors min-h-[72px]"
                        >
                          <UploadCloud className="w-5 h-5 text-gray-400" aria-hidden="true" />
                          <span className="text-sm font-semibold text-gray-600">
                            {qrFile ? qrFile.name : "Tap to attach screenshot"}
                          </span>
                          <input
                            ref={fileInputRef}
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                            aria-label="Upload payment receipt screenshot"
                          />
                        </label>

                        {qrPreview && (
                          <div className="relative mt-3 w-full h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img
                              src={qrPreview}
                              alt="Receipt preview"
                              className="w-full h-full object-contain bg-gray-50"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> Attached
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <PaymentCard
                    id="cod" selected={paymentMethod} onSelect={setPaymentMethod}
                    logo={<span className="font-black text-gray-900 text-sm" aria-hidden="true">COD</span>}
                    name="Cash on Delivery" desc="Pay when your book arrives"
                    colorClass="text-gray-900" ringClass="border-gray-900"
                  />

                  <PaymentCard
                    id="esewa" selected={paymentMethod} onSelect={setPaymentMethod}
                    logo={<span className="font-black text-green-600 text-sm" aria-hidden="true">eSewa</span>}
                    name="eSewa Direct" desc="Direct wallet integration"
                    colorClass="text-green-600" ringClass="border-green-500"
                    disabled badge="Coming Soon"
                  />

                  <PaymentCard
                    id="khalti" selected={paymentMethod} onSelect={setPaymentMethod}
                    logo={<span className="font-black text-purple-700 text-sm" aria-hidden="true">Khalti</span>}
                    name="Khalti Direct" desc="Direct wallet integration"
                    colorClass="text-purple-700" ringClass="border-purple-500"
                    disabled badge="Coming Soon"
                  />
                </div>
              </fieldset>

              <div className="mt-5 bg-gray-50 rounded-xl p-3.5 flex items-center gap-2.5 border border-gray-100">
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs font-medium text-gray-500">
                  Secure checkout. We never store payment credentials.
                </p>
              </div>
            </section>
          </div>

          {/* ── RIGHT: ORDER SUMMARY (desktop) ── */}
          <aside
            className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky"
            style={{ top: "82px" }}
            aria-label="Order summary"
          >
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg">
              {/* Book cover */}
              <div className={`w-full bg-gray-100 flex items-center justify-center ${book?.book_type === "luxury" ? "aspect-square" : "aspect-video"}`}>
                {book?.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={`Cover: ${book?.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-300" aria-hidden="true" />
                )}
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{book?.title || "Untitled Book"}</h3>
                <p className="text-sm text-gray-500 mb-6 capitalize">{book?.destination} · {book?.book_type}</p>

                {/* Pricing */}
                <div className="space-y-3 pt-5 border-t border-dashed border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Photo book ({book?.book_type})</span>
                    <span className="font-bold text-gray-900">Rs. {price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-bold text-gray-900">Rs. {SHIPPING_CHARGE}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-5 mt-5 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Total</span>
                  <span className="text-3xl font-black text-rose-500" aria-label={`Total: Rs. ${total.toLocaleString()}`}>
                    Rs. {total.toLocaleString()}
                  </span>
                </div>

                {/* Error */}
                {serverError && (
                  <div role="alert" className="mt-5 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    {serverError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  aria-busy={submitting}
                  className="w-full mt-6 bg-gray-900 text-white rounded-2xl py-4 text-sm font-bold hover:bg-rose-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 min-h-[56px]"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      <span>
                        {paymentMethod === "cod" ? "Confirming..." : "Processing..."}
                      </span>
                    </>
                  ) : (
                    paymentMethod === "cod"
                      ? "Place Order (COD)"
                      : paymentMethod === "qr_transfer"
                      ? "Submit & Place Order"
                      : `Pay with ${paymentMethod === "esewa" ? "eSewa" : "Khalti"}`
                  )}
                </button>

                {/* Delivery assurance */}
                <div className="mt-5 bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <p className="text-xs font-semibold text-emerald-800 leading-snug">
                    Delivered anywhere in Nepal in 5–10 business days.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Mobile sticky submit bar ── */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        >
          {serverError && (
            <div role="alert" className="mb-3 bg-red-50 text-red-700 border border-red-100 rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              {serverError}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-black text-gray-900">Rs. {total.toLocaleString()}</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              aria-busy={submitting}
              className="flex-1 bg-gray-900 text-white rounded-xl py-3.5 text-sm font-bold hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 min-h-[52px]"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                paymentMethod === "cod" ? "Place Order (COD)" : "Place Order"
              )}
            </button>
          </div>
        </div>

        {/* Mobile bottom padding to clear sticky bar */}
        <div className="lg:hidden h-24" aria-hidden="true" />
      </main>
    </div>
  );
};

export default OrderPage;