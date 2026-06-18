// client/src/design-system/AppNavbar.jsx
// FIXES: C4 (mobile hamburger), H12 (tap targets), H9 (focus), M1 (aria-labels)
// FIXES: Keyboard trap in mobile menu, escape key closes menu

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Plus, ShoppingBag, LogOut,
  Images, ChevronDown, Menu, X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const isDashboard = location.pathname === "/dashboard";

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // FIX: Escape key closes menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (dropdownOpen) setDropdownOpen(false);
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen, mobileMenuOpen]);

  // FIX: Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login");
    }
  }, [logoutUser, navigate]);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

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
          padding: 0 24px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .app-navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
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
          padding: 8px 0;
          white-space: nowrap;
          min-height: 44px;
        }
        .app-navbar-back:hover { color: #0F0F0F; }
        .app-navbar-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F0F0F;
          letter-spacing: -0.01em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
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
          min-height: 44px;
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
          min-height: 44px;
        }
        .app-navbar-create:hover {
          background: #A8284A;
          transform: translateY(-1px);
        }
        .app-navbar-user-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px 6px 6px;
          border-radius: 100px;
          border: 1.5px solid #EBEBEB;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 44px;
        }
        .app-navbar-user-btn:hover { border-color: #C8C8C8; }

        /* FIX C4: Hamburger button — CSS-controlled visibility */
        .app-navbar-hamburger {
          display: none; /* hidden on desktop */
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: none;
          border: none;
          cursor: pointer;
          color: #0F0F0F;
          border-radius: 10px;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .app-navbar-hamburger:hover { background: #F5F5F5; }

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
          animation: bb-scaleIn 0.18s cubic-bezier(0.22,1,0.36,1) both;
          transform-origin: top right;
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
          min-height: 44px;
        }
        .app-navbar-dropdown-item:hover {
          background: #FAFAFA;
          color: #0F0F0F;
        }
        .app-navbar-dropdown-item.danger { color: #DC2626; }
        .app-navbar-dropdown-item.danger:hover {
          background: #FFF5F5;
          color: #B91C1C;
        }
        .app-navbar-dropdown-divider {
          height: 1px;
          background: #EBEBEB;
          margin: 3px 0;
        }

        /* ─── FIX C4: Mobile slide-in menu ─── */
        .app-mobile-menu {
          position: fixed;
          top: 58px; /* below navbar */
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          z-index: 150;
          overflow-y: auto;
          padding: 8px 0 env(safe-area-inset-bottom, 16px);
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
          border-top: 1px solid #EBEBEB;
        }
        .app-mobile-menu.open {
          transform: translateX(0);
        }
        .app-mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          background: none;
          border: none;
          border-bottom: 1px solid #F5F5F5;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #0F0F0F;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-align: left;
          min-height: 56px;
          text-decoration: none;
        }
        .app-mobile-menu-item:hover { background: #FAFAFA; }
        .app-mobile-menu-item.danger { color: #DC2626; }
        .app-mobile-menu-bottom {
          padding: 16px 24px;
          margin-top: 8px;
        }
        .app-mobile-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #C8345A;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 52px;
        }

        /* Responsive breakpoints */
        @media (max-width: 640px) {
          .app-navbar-center { display: none !important; }
          .app-navbar-create { display: none !important; }
          .app-navbar-username { display: none; }
          .app-navbar-inner { padding: 0 16px; }
          .app-navbar-title { max-width: 130px; }
          .app-navbar-hamburger { display: flex !important; } /* FIX C4 */
          .app-navbar-user-btn { display: none !important; }
          .app-navbar-back-label { display: none; }
        }

        @media (min-width: 641px) {
          .app-mobile-menu { display: none !important; }
        }

        @keyframes bb-scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <nav className="app-navbar" role="navigation" aria-label="Main navigation">
        <div className="app-navbar-inner">

          {/* ── Left ──────────────────────────────────── */}
          <div className="app-navbar-left">
            <Logo size={19} clickable />

            {backTo && (
              <>
                <div className="app-navbar-sep" aria-hidden="true" />
                <button
                  className="app-navbar-back"
                  onClick={() => navigate(backTo)}
                  aria-label={`Back to ${backLabel}`}
                >
                  <span aria-hidden="true">←</span>
                  <span className="app-navbar-back-label">{backLabel}</span>
                </button>
              </>
            )}

            {title && (
              <>
                <div className="app-navbar-sep" aria-hidden="true" />
                <span className="app-navbar-title" aria-current="page">{title}</span>
              </>
            )}
          </div>

          {/* ── Center — dashboard tabs (desktop only) ── */}
          {isDashboard && (
            <nav className="app-navbar-center" aria-label="Dashboard sections">
              <button
                className={`app-navbar-tab ${location.pathname === "/dashboard"
                    ? "app-navbar-tab-active"
                    : "app-navbar-tab-inactive"
                  }`}
                onClick={() => navigate("/dashboard")}
                aria-current={location.pathname === "/dashboard" ? "page" : undefined}
              >
                <Images size={14} aria-hidden="true" />
                My Books
              </button>
              <Link
                to="/orders"
                className={`app-navbar-tab ${location.pathname === "/orders"
                    ? "app-navbar-tab-active"
                    : "app-navbar-tab-inactive"
                  }`}
                aria-current={location.pathname === "/orders" ? "page" : undefined}
              >
                <ShoppingBag size={14} aria-hidden="true" />
                Orders
              </Link>
            </nav>
          )}

          {/* ── Right ─────────────────────────────────── */}
          <div className="app-navbar-right">
            {/* Custom actions slot */}
            {actions && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {actions}
              </div>
            )}

            {/* Create button — desktop, dashboard only */}
            {isDashboard && (
              <button
                className="app-navbar-create"
                onClick={() => navigate("/create")}
                aria-label="Create new book"
              >
                <Plus size={14} aria-hidden="true" />
                New Book
              </button>
            )}

            {/* User menu — desktop */}
            {user && (
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  className="app-navbar-user-btn"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  id="user-menu-btn"
                >
                  <div className="app-navbar-avatar" aria-hidden="true">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <span className="app-navbar-username">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    color="#9A9A9A"
                    aria-hidden="true"
                    style={{
                      transition: "transform 0.2s",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 200 }}
                      onClick={closeDropdown}
                      aria-hidden="true"
                    />
                    <div
                      className="app-navbar-dropdown"
                      role="menu"
                      aria-labelledby="user-menu-btn"
                    >
                      <div className="app-navbar-dropdown-header">
                        <p className="app-navbar-dropdown-name">{user?.name}</p>
                        <p className="app-navbar-dropdown-email">{user?.email}</p>
                      </div>
                      <div style={{ padding: "4px 0" }}>
                        {[
                          { label: "My Books", icon: <Images size={14} color={C.subtle} aria-hidden="true" />, path: "/dashboard" },
                          { label: "My Orders", icon: <ShoppingBag size={14} color={C.subtle} aria-hidden="true" />, path: "/orders" },
                          { label: "Create New Book", icon: <Plus size={14} color={C.subtle} aria-hidden="true" />, path: "/create" },
                        ].map(({ label, icon, path }) => (
                          <button
                            key={label}
                            className="app-navbar-dropdown-item"
                            role="menuitem"
                            onClick={() => { navigate(path); closeDropdown(); }}
                          >
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                      <div className="app-navbar-dropdown-divider" role="separator" />
                      <div style={{ padding: "4px 0 6px" }}>
                        <button
                          className="app-navbar-dropdown-item danger"
                          role="menuitem"
                          onClick={handleLogout}
                        >
                          <LogOut size={14} aria-hidden="true" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* FIX C4: Hamburger — mobile only, CSS-controlled */}
            <button
              ref={hamburgerRef}
              className="app-navbar-hamburger"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen
                ? <X size={22} aria-hidden="true" />
                : <Menu size={22} aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* ── FIX C4: Mobile slide-in menu ─────────────── */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`app-mobile-menu ${mobileMenuOpen ? "open" : ""}`}
          aria-hidden={!mobileMenuOpen}
          role="dialog"
          aria-label="Navigation menu"
        >
          {user && (
            <>
              {/* User info header */}
              <div style={{
                padding: "16px 24px 12px",
                borderBottom: "1px solid #F0F0F0",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#FFF0F4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#C8345A",
                  flexShrink: 0,
                }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#9A9A9A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Nav items */}
              {[
                { label: "My Books", icon: <Images size={18} aria-hidden="true" />, path: "/dashboard" },
                { label: "My Orders", icon: <ShoppingBag size={18} aria-hidden="true" />, path: "/orders" },
              ].map(({ label, icon, path }) => (
                <button
                  key={label}
                  className="app-mobile-menu-item"
                  onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                  aria-current={location.pathname === path ? "page" : undefined}
                >
                  {icon} {label}
                </button>
              ))}

              <div className="app-mobile-menu-bottom">
                <button
                  className="app-mobile-create-btn"
                  onClick={() => { navigate("/create"); setMobileMenuOpen(false); }}
                >
                  <Plus size={18} aria-hidden="true" /> Create New Book
                </button>
              </div>

              <button
                className="app-mobile-menu-item danger"
                onClick={handleLogout}
                style={{ marginTop: 4 }}
              >
                <LogOut size={18} aria-hidden="true" /> Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default AppNavbar;