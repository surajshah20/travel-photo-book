// client/src/pages/OrdersPage.jsx
// Shows all past orders

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Home
        </button>
        <h1 className="text-xl font-bold text-blue-600">📦 My Orders</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-gray-500">No orders yet</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Create a Book
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6"
              >
                {order.cover_image_url && (
                  <img
                    src={order.cover_image_url}
                    alt=""
                    className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{order.title}</h3>
                  <p className="text-gray-500 text-sm">{order.destination}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Ordered on{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">${order.total_price}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize mt-1 inline-block ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;