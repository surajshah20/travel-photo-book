// client/src/pages/OrderPage.jsx
// Checkout page with Stripe payment

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../api/axios";

// Load Stripe with publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// ─── CHECKOUT FORM ────────────────────────────────────────
const CheckoutForm = ({ bookId, amount, bookTitle }) => {
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

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Create payment intent on backend
      const intentRes = await api.post("/orders/payment-intent", { bookId });
      const { clientSecret } = intentRes.data;

      // Step 2: Confirm payment with Stripe
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

      // Step 3: Save order to database
      await api.post("/orders", {
        bookId,
        stripePaymentId: result.paymentIntent.id,
        totalPrice: amount,
        ...shipping,
      });

      setSuccess(true);

      // Redirect to success page after 3 seconds
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
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-500">
          Your travel book is being prepared for printing.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Redirecting to your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Shipping Info */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          📦 Shipping Information
        </h3>
        <div className="space-y-4">
          {[
            { name: "shipping_name", label: "Full Name", placeholder: "Suraj Shah" },
            { name: "shipping_address", label: "Address", placeholder: "123 Main Street" },
            { name: "shipping_city", label: "City", placeholder: "Mumbai" },
            { name: "shipping_country", label: "Country", placeholder: "India" },
            { name: "shipping_zip", label: "ZIP Code", placeholder: "400001" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                value={shipping[field.name]}
                onChange={handleShippingChange}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          💳 Payment
        </h3>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">{bookTitle}</span>
            <span className="font-medium">${amount}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-blue-600 text-lg">${amount}</span>
          </div>
        </div>

        {/* Card Element */}
        <div className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#374151",
                  "::placeholder": { color: "#9ca3af" },
                },
              },
            }}
          />
        </div>

        {/* Test card hint */}
        <p className="text-xs text-gray-400 mb-4">
          🧪 Test card: <span className="font-mono">4242 4242 4242 4242</span>
          {" "}· Any future date · Any CVC
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !stripe}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </span>
          ) : (
            `Pay $${amount}`
          )}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN ORDER PAGE ──────────────────────────────────────
const OrderPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [amount, setAmount] = useState(0);
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
      setAmount(PRICES[res.data.book_type] || 19.99);
      setLoading(false);
    });
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(`/preview/${bookId}`)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-blue-600">
          🛒 Complete Your Order
        </h1>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Book Preview Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex items-center gap-6">
          {book?.cover_image_url && (
            <img
              src={book.cover_image_url}
              alt="cover"
              className="w-24 h-16 object-cover rounded-xl"
            />
          )}
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{book?.title}</h2>
            <p className="text-gray-500 text-sm">{book?.destination}</p>
            <p className="text-blue-600 font-semibold mt-1">${amount}</p>
          </div>
        </div>

        {/* Stripe Elements wrapper */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              bookId={bookId}
              amount={amount}
              bookTitle={book?.title}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;