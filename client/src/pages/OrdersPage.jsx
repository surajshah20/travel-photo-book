// client/src/pages/OrdersPage.jsx
// Blushbook — Order History Page

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, ChevronLeft, ShoppingBag,
  Package, Truck, CheckCircle, Clock
} from "lucide-react";
import api from "../api/axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders").then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  const statusConfig = {
    pending: {
      label: "Pending",
      class: "bg-yellow-50 text-yellow-600 border border-yellow-100",
      icon: <Clock className="w-4 h-4 text-yellow-500" />,
      desc: "Your order is being processed",
    },
    paid: {
      label: "Paid",
      class: "bg-blue-50 text-blue-600 border border-blue-100",
      icon: <CheckCircle className="w-4 h-4 text-blue-500" />,
      desc: "Payment confirmed — preparing for print",
    },
    shipped: {
      label: "Shipped",
      class: "bg-purple-50 text-purple-600 border border-purple-100",
      icon: <Truck className="w-4 h-4 text-purple-500" />,
      desc: "Your book is on its way",
    },
    delivered: {
      label: "Delivered",
      class: "bg-green-50 text-green-600 border border-green-100",
      icon: <Package className="w-4 h-4 text-green-500" />,
      desc: "Your book has been delivered",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
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
        <span className="text-gray-500 text-sm font-medium">My Orders</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              My Orders
            </h1>
            <p className="text-gray-400 text-sm">
              Track and manage your printed book orders
            </p>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-rose-500 transition"
          >
            New Book
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl shadow-card text-center py-20 px-8">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8 text-rose-300" />
            </div>
            <h3
              className="text-xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              No orders yet
            </h3>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              You haven't ordered any printed books yet. Create a book and
              order your first one!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-rose-500 transition"
            >
              Create Your First Book
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-pink transition"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-300">
                        Order #{order.id}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.class}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex items-center gap-5">
                      {/* Book cover */}
                      <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-rose-50">
                        {order.cover_image_url ? (
                          <img
                            src={order.cover_image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-rose-300" />
                          </div>
                        )}
                      </div>

                      {/* Book info */}
                      <div className="flex-1">
                        <h3
                          className="font-bold text-gray-900 mb-0.5"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {order.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {order.destination}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {status.icon}
                          <p className="text-xs text-gray-400">{status.desc}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-lg">
                          ${order.total_price}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          incl. shipping
                        </p>
                      </div>
                    </div>

                    {/* Shipping info */}
                    {order.shipping_address && (
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-start gap-3">
                          <Truck className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-0.5">
                              Shipping to
                            </p>
                            <p className="text-xs text-gray-400">
                              {order.shipping_name} · {order.shipping_address},{" "}
                              {order.shipping_city}, {order.shipping_country}{" "}
                              {order.shipping_zip}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => navigate(`/preview/${order.book_id}`)}
                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                      >
                        View Book
                      </button>
                      {order.status === "delivered" && (
                        <button
                          onClick={() => navigate(`/create`)}
                          className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-rose-600 transition"
                        >
                          Order Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;