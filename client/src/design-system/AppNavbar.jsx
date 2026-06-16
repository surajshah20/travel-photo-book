// client/src/design-system/AppNavbar.jsx
// BlushBook — Shared App Navbar
// Used in: Home, CreateBook, UploadPhotos, BookEditor, BookPreview, OrderPage, OrdersPage

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Plus, ShoppingBag, LogOut,
  Images, ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { C } from "./index";

const AppNavbar = ({
  title = null,
  backTo = null,
  backLabel = "Dashboard",
  actions = null,
}) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const isDashboard = location.pathname === "/dashboard";

  return (
    <>
      <style>{`
        .app-navbar {
          background: #fff;
          border-bottom: 1.5px solid #EBEBEB;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .app-navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 28px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .app-navbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }
        .app-navbar-sep {
          width: 1px;
          height: 18px;
          background: #EBEBEB;
          flex-shrink: 0;
        }
        .app-navbar-back {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #9A9A9A;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color 0.15s;
          padding: 0;
          white-space: nowrap;
        }
        .app-navbar-back:hover { color: #0F0F0F; }
        .app-navbar-back-arrow {
          font-size: 15px;
          line-height: 1;
        }
        .app-navbar-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F0F0F;
          letter-spacing: -0.01em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 240px;
        }
        .app-navbar-center {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        .app-navbar-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
          white-space: nowrap;
        }
        .app-navbar-tab-active {
          background: #FFF0F4;
          color: #C8345A;
        }
        .app-navbar-tab-inactive {
          background: none;
          color: #6B6B6B;
        }
        .app-navbar-tab-inactive:hover {
          background: #FAFAFA;
          color: #0F0F0F;
        }
        .app-navbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .app-navbar-create {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #C8345A;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.18s, transform 0.15s;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .app-navbar-create:hover {
          background: #A8284A;
          transform: translateY(-1px);
        }
        .app-navbar-user-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 10px 4px 4px;
          border-radius: 100px;
          border: 1.5px solid #EBEBEB;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .app-navbar-user-btn:hover {
          border-color: #C8C8C8;
        }
        .app-navbar-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FFF0F4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #C8345A;
          flex-shrink: 0;
          line-height: 1;
        }
        .app-navbar-username {
          font-size: 13px;
          font-weight: 600;
          color: #0F0F0F;
          max-width: 88px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .app-navbar-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 216px;
          background: #fff;
          border: 1.5px solid #EBEBEB;
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.10);
          overflow: hidden;
          z-index: 300;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .app-navbar-dropdown-header {
          padding: 13px 16px;
          border-bottom: 1px solid #EBEBEB;
        }
        .app-navbar-dropdown-name {
          font-size: 13px;
          font-weight: 700;
          color: #0F0F0F;
          margin: 0 0 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .app-navbar-dropdown-email {
          font-size: 11.5px;
          color: #9A9A9A;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .app-navbar-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #6B6B6B;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.12s, color 0.12s;
          text-align: left;
          text-decoration: none;
        }
        .app-navbar-dropdown-item:hover {
          background: #FAFAFA;
          color: #0F0F0F;
        }
        .app-navbar-dropdown-item.danger {
          color: #DC2626;
        }
        .app-navbar-dropdown-item.danger:hover {
          background: #FFF5F5;
          color: #B91C1C;
        }
        .app-navbar-dropdown-divider {
          height: 1px;
          background: #EBEBEB;
          margin: 3px 0;
        }

        @media (max-width: 640px) {
          .app-navbar-center { display: none !important; }
          .app-navbar-create-label { display: none; }
          .app-navbar-username { display: none; }
          .app-navbar-inner { padding: 0 16px; }
          .app-navbar-title { max-width: 140px; }
        }
      `}</style>

      <nav className="app-navbar">
        <div className="app-navbar-inner">

          {/* ── Left ──────────────────────────────────── */}
          <div className="app-navbar-left">
            <Logo size={19} clickable />

            {backTo && (
              <>
                <div className="app-navbar-sep" />
                <button
                  className="app-navbar-back"
                  onClick={() => navigate(backTo)}
                >
                  <span className="app-navbar-back-arrow">←</span>
                  {backLabel}
                </button>
              </>
            )}

            {title && !backTo && (
              <>
                <div className="app-navbar-sep" />
                <span className="app-navbar-title">{title}</span>
              </>
            )}

            {title && backTo && (
              <>
                <div className="app-navbar-sep" />
                <span className="app-navbar-title">{title}</span>
              </>
            )}
          </div>

          {/* ── Center — dashboard tabs only ──────────── */}
          {isDashboard && (
            <div className="app-navbar-center">
              <button
                className={`app-navbar-tab ${
                  location.pathname === "/dashboard"
                    ? "app-navbar-tab-active"
                    : "app-navbar-tab-inactive"
                }`}
                onClick={() => navigate("/dashboard")}
              >
                <Images size={14} />
                My Books
              </button>
              <Link
                to="/orders"
                className={`app-navbar-tab ${
                  location.pathname === "/orders"
                    ? "app-navbar-tab-active"
                    : "app-navbar-tab-inactive"
                }`}
              >
                <ShoppingBag size={14} />
                Orders
              </Link>
            </div>
          )}

          {/* ── Right ─────────────────────────────────── */}
          <div className="app-navbar-right">

            {/* Custom actions slot (Preview/Save buttons etc.) */}
            {actions && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {actions}
              </div>
            )}

            {/* Create button — dashboard only */}
            {isDashboard && (
              <button
                className="app-navbar-create"
                onClick={() => navigate("/create")}
              >
                <Plus size={14} />
                <span className="app-navbar-create-label">New Book</span>
              </button>
            )}

            {/* User menu */}
            {user && (
              <div style={{ position: "relative" }}>
                <button
                  className="app-navbar-user-btn"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  aria-label="User menu"
                >
                  <div className="app-navbar-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <span className="app-navbar-username">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    color="#9A9A9A"
                    style={{
                      transition: "transform 0.2s",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div
                      style={{
                        position: "fixed", inset: 0, zIndex: 200,
                      }}
                      onClick={() => setDropdownOpen(false)}
                    />

                    <div className="app-navbar-dropdown">
                      {/* User info */}
                      <div className="app-navbar-dropdown-header">
                        <p className="app-navbar-dropdown-name">{user?.name}</p>
                        <p className="app-navbar-dropdown-email">{user?.email}</p>
                      </div>

                      {/* Nav items */}
                      <div style={{ padding: "4px 0" }}>
                        <button
                          className="app-navbar-dropdown-item"
                          onClick={() => {
                            navigate("/dashboard");
                            setDropdownOpen(false);
                          }}
                        >
                          <Images size={14} color={C.subtle} />
                          My Books
                        </button>
                        <button
                          className="app-navbar-dropdown-item"
                          onClick={() => {
                            navigate("/orders");
                            setDropdownOpen(false);
                          }}
                        >
                          <ShoppingBag size={14} color={C.subtle} />
                          My Orders
                        </button>
                        <button
                          className="app-navbar-dropdown-item"
                          onClick={() => {
                            navigate("/create");
                            setDropdownOpen(false);
                          }}
                        >
                          <Plus size={14} color={C.subtle} />
                          Create New Book
                        </button>
                      </div>

                      <div className="app-navbar-dropdown-divider" />

                      {/* Sign out */}
                      <div style={{ padding: "4px 0 6px" }}>
                        <button
                          className="app-navbar-dropdown-item danger"
                          onClick={handleLogout}
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default AppNavbar;