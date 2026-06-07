// client/src/pages/Home.jsx
// This is the page users see after logging in

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📸 Travel Photo Book</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hello, {user?.name} 👋</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="text-center mt-24">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to your Travel Photo Books 🌍
        </h2>
        <p className="text-gray-500 text-lg">
          You are logged in as <span className="font-medium">{user?.email}</span>
        </p>
      </div>
    </div>
  );
};

export default Home;