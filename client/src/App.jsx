// client/src/App.jsx
// React Router controls which page to show based on the URL

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPhotos from "./pages/UploadPhotos"; // add this
import CreateBook from "./pages/CreateBook";  // add this
import BookEditor from "./pages/BookEditor"; // add this
import BookPreview from "./pages/BookPreview"; // add this




// This protects routes — if not logged in, redirect to login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    // BrowserRouter enables navigation between pages
    <BrowserRouter>
      {/* AuthProvider makes login state available everywhere */}
      <AuthProvider>
        <Routes>
          {/* Public routes — anyone can visit */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private route — only logged in users */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <UploadPhotos />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateBook />
              </PrivateRoute>
            }
          />

          <Route
            path="/upload/:bookId"
            element={
              <PrivateRoute>
                <UploadPhotos />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor/:bookId"
            element={
              <PrivateRoute>
                <BookEditor />
              </PrivateRoute>
            }
          />
          <Route
  path="/preview/:bookId"
  element={
    <PrivateRoute>
      <BookPreview />
    </PrivateRoute>
  }
/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;