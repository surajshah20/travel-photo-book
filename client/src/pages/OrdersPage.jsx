// client/src/pages/OrdersPage.jsx
// BlushBook — Production Orders History

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package, CheckCircle, Truck, Clock,
  BookOpen, AlertCircle, ShoppingBag, XCircle
} from "lucide-react";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";

const STATUS_CONFIG = {
  pending: { label: "Processing", classes: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200", icon: <Clock size={14} className="text-yellow-600" /> },
  confirmed: { label: "Confirmed", classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle size={14} className="text-emerald-600" /> },
  printing: { label: "Printing", classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", icon: <BookOpen size={14} className="text-blue-600" /> },
  shipped: { label: "Shipped", classes: "bg-purple-50 text-purple-700 ring-1 ring-purple-200", icon: <Truck size={14} className="text-purple-600" /> },
  delivered: { label: "Delivered", classes: "bg-green-50 text-green-700 ring-1 ring-green-200", icon: <CheckCircle size={14} className="text-green-600" /> },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-700 ring-1 ring-red-200", icon: <AlertCircle size={14} className="text-red-600" /> },
  cancellation_requested: { label: "Cancel Requested", classes: "bg-orange-50 text-orange-700 ring-1 ring-orange-200", icon: <AlertCircle size={14} className="text-orange-600" /> },
};

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Want to change the photos/design",
  "Shipping time is too long",
  "Other"
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ All hooks safely inside the component
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Cancellation States
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);

  const params = new URLSearchParams(location.search);
  const paymentResult = params.get("payment");
  const orderId = params.get("orderId");

  const fetchOrders = () => {
    api.get("/orders")
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ─── CANCELLATION LOGIC ─────────────────────────────────
  const submitCancellation = async () => {
    if (!selectedReason) return alert("Please select a reason");

    setCancellingId(activeOrderId);
    try {
      await api.patch(`/orders/${activeOrderId}/cancel-request`, {
        reason: selectedReason
      });
      setCancelModalOpen(false);
      setSelectedReason("");
      fetchOrders(); // Refresh list to show the new orange status
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send request.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <AppNavbar backTo="/dashboard" backLabel="Dashboard" title="My Orders" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 relative">

        {/* Payment Success Banner */}
        {paymentResult === "success" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-900 mb-0.5 font-display">
                Payment Successful! 🎉
              </p>
              <p className="text-sm font-medium text-emerald-700">
                {orderId ? `Order #${String(orderId).padStart(5, "0")} confirmed.` : "Your order is confirmed."} A confirmation email has been sent to you.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-2">
            Order History
          </h1>
          <p className="text-gray-500 text-sm">
            Track and manage your printed photo books.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">No orders yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              When you order a printed photo book, you'll be able to track its status here.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-rose-500 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse My Books
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-col gap-5">
            {orders.map(order => {
              const s = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
              const canCancel = ["pending", "processing", "confirmed"].includes(order.order_status);

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-md transition-shadow duration-300 relative"
                >
                  {/* Header Row */}
                  <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-900 text-sm">
                        Order #{String(order.id).padStart(5, "0")}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${s.classes}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Cancel Button */}
                      {canCancel && (
                        <button
                          onClick={() => { setActiveOrderId(order.id); setCancelModalOpen(true); }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Request Cancel
                        </button>
                      )}
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Book Info Row */}
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex flex-1 items-start gap-5">
                      {/* Mini Cover */}
                      <div className="w-16 h-20 md:w-20 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
                        {order.cover_image_url ? (
                          <img src={order.cover_image_url} alt="" className="w-full h-full object-cover opacity-90" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate font-display">
                          {order.title || "Untitled Book"}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          {order.destination || "Photo Book"}
                        </p>
                        
                        {/* Tracking Info */}
                        {order.tracking_number ? (
                          <div className="inline-flex flex-col bg-purple-50 border border-purple-100 rounded-xl px-4 py-2">
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">Tracking Number</span>
                            <span className="text-sm font-mono font-bold text-purple-900">{order.tracking_number}</span>
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-gray-400 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-100">
                            Tracking details will appear here once shipped.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Address */}
                    <div className="flex flex-col md:items-end justify-between md:min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <div className="md:text-right mb-4 md:mb-0">
                        <p className="text-2xl font-extrabold text-gray-900 mb-1">
                          Rs. {parseFloat(order.amount_npr).toLocaleString()}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Paid via {order.payment_method?.toUpperCase()}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery To</p>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed max-w-[200px]">
                          {order.shipping_address},<br />{order.shipping_city}, {order.shipping_district}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── CANCELLATION MODAL ─── */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-gray-900 font-display mb-2">Cancel Order</h3>
              <p className="text-sm text-gray-500 mb-6">Please tell us why you are cancelling this order. This helps us improve our service.</p>
              
              <div className="space-y-2 mb-8">
                {CANCEL_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedReason === reason 
                        ? "border-red-500 bg-red-50 text-red-700" 
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button 
                  onClick={submitCancellation}
                  disabled={!selectedReason || cancellingId === activeOrderId}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancellingId === activeOrderId ? "Submitting..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default OrdersPage;