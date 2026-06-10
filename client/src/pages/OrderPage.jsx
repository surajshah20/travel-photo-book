// client/src/pages/OrderPage.jsx
// Blushbook — Professional Order Page

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  BookOpen, ChevronLeft, Shield,
  Truck, CheckCircle, Package
} from "lucide-react";
import api from "../api/axios";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// ─── CHECKOUT FORM ────────────────────────────────────────
const CheckoutForm = ({ bookId, amount, book }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shipping, setShipping] = useState({
    shipping_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_country: "",
    shipping_zip: "",
  });

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    try {
      const intentRes = await api.post("/orders/payment-intent", { bookId });
      const { clientSecret } = intentRes.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: shipping.shipping_name },
        },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      await api.post("/orders", {
        bookId,
        stripePaymentId: result.paymentIntent.id,
        totalPrice: amount,
        ...shipping,
      });

      setSuccess(true);
      setTimeout(() => navigate("/orders"), 3000);
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Order placed successfully!
        </h2>
        <p className="text-gray-400 text-sm mb-2">
          Your travel book is being prepared for printing.
        </p>
        <p className="text-gray-300 text-xs">
          Redirecting to your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

      {/* ── Shipping ── */}
      <div>
        <h3
          className="font-bold text-gray-900 text-lg mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Shipping Information
        </h3>
        <div className="space-y-4">
          {[
            { name: "shipping_name", label: "Full Name", placeholder: "Your full name" },
            { name: "shipping_address", label: "Street Address", placeholder: "123 Main Street" },
            { name: "shipping_city", label: "City", placeholder: "Mumbai" },
            { name: "shipping_country", label: "Country", placeholder: "India" },
            { name: "shipping_zip", label: "ZIP / Postal Code", placeholder: "400001" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                value={shipping[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
              />
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: <Truck className="w-4 h-4 text-rose-500" />, text: "Free shipping over $50" },
            { icon: <Shield className="w-4 h-4 text-rose-500" />, text: "Secure payment" },
            { icon: <Package className="w-4 h-4 text-rose-500" />, text: "5-12 day delivery" },
          ].map((badge) => (
            <div
              key={badge.text}
              className="bg-rose-50 rounded-xl p-3 text-center"
            >
              <div className="flex justify-center mb-1">{badge.icon}</div>
              <p className="text-xs text-gray-500 leading-tight">{badge.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment ── */}
      <div>
        <h3
          className="font-bold text-gray-900 text-lg mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Payment
        </h3>

        {/* Order summary */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            {book?.cover_image_url && (
              <img
                src={book.cover_image_url}
                alt=""
                className="w-16 h-12 object-cover rounded-xl"
              />
            )}
            <div>
              <p className="font-semibold text-gray-800 text-sm">{book?.title}</p>
              <p className="text-gray-400 text-xs">{book?.destination}</p>
              <p className="text-rose-500 font-bold text-sm mt-0.5">
                ${amount}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-800">${amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-gray-900 text-lg">${amount}</span>
            </div>
          </div>
        </div>

        {/* Card input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus-within:ring-2 focus-within:ring-rose-300 transition">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "15px",
                    color: "#374151",
                    fontFamily: "Inter, sans-serif",
                    "::placeholder": { color: "#d1d5db" },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Test card hint */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-blue-600 font-semibold mb-1">
            Test Mode
          </p>
          <p className="text-xs text-blue-500 font-mono">
            4242 4242 4242 4242 · Any future date · Any CVC
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !stripe}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-rose-500 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing payment...
            </span>
          ) : (
            `Pay $${amount}`
          )}
        </button>

        <p className="text-center text-gray-300 text-xs mt-3 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Secured by Stripe · SSL encrypted
        </p>
      </div>
    </div>
  );
};

// ─── MAIN ORDER PAGE ──────────────────────────────────────
const OrderPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const PRICES = {
    journal: 19.99,
    hardcover: 34.99,
    luxury: 49.99,
    scrapbook: 24.99,
  };

  useEffect(() => {
    api.get(`/books/${bookId}`).then((res) => {
      setBook(res.data);
      setLoading(false);
    });
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const amount = PRICES[book?.book_type] || 19.99;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => navigate(`/preview/${bookId}`)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-bold text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            blush<span className="text-rose-500">book</span>
          </span>
        </div>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500 text-sm">Complete Your Order</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Complete your order
          </h1>
          <p className="text-gray-400 text-sm">
            You're one step away from holding your memories in your hands
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              bookId={bookId}
              amount={amount}
              book={book}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;