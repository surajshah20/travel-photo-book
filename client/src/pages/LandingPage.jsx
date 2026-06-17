// client/src/pages/LandingPage.jsx
// BlushBook — Nepal's #1 Travel Photo Book Platform — Production v3

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, Check, Plus, Minus,
  Truck, Shield, ChevronRight,
  Wand2, Pen, Download, Layers, ArrowRight,
  MapPin, CreditCard, Package, Sparkles, Menu, X, ShieldCheck, LifeBuoy
} from "lucide-react";
import heroImage from "../assets/herosection.jpg";
import book1 from "../assets/maldeis.jpg";
import book3 from "../assets/thailand.jpg";
import book4 from "../assets/lovestory.jpg";
import qualityImage from "../assets/book1.jpg";
import Logo from "../design-system/Logo";
import { C } from "../design-system/index";
import { Link } from "react-router-dom";

/* ─── DESIGN TOKENS ──────────────────────────────────────── */
// const C = {
//   rose:    "#C8345A",
//   roseHov: "#A8284A",
//   roseSoft:"#FFF0F4",
//   roseMid: "#F9D0DA",
//   ink:     "#0F0F0F",
//   ink2:    "#1C1C1C",
//   muted:   "#6B6B6B",
//   subtle:  "#9A9A9A",
//   line:    "#EBEBEB",
//   bg:      "#FFFFFF",
//   bgSoft:  "#FAFAFA",
//   bgBlush: "#FEF6F8",
// };

/* ─── GLOBAL STYLES ──────────────────────────────────────── */
const globalStyle = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    background: #fff; color: #0F0F0F;
    -webkit-font-smoothing: antialiased;
  }

  input::placeholder { color: #444; }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                transform 0.65s cubic-bezier(0.22,1,0.36,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.08s; }
  .reveal-delay-2 { transition-delay: 0.16s; }
  .reveal-delay-3 { transition-delay: 0.24s; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0F0F0F; color: #fff;
    border: none; border-radius: 100px;
    padding: 14px 28px; font-size: 14px; font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.01em;
    text-decoration: none;
  }
  .btn-primary:hover { background: #C8345A; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-rose {
    display: inline-flex; align-items: center; gap: 8px;
    background: #C8345A; color: #fff;
    border: none; border-radius: 100px;
    padding: 14px 28px; font-size: 14px; font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-rose:hover { background: #A8284A; transform: translateY(-1px); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #0F0F0F;
    border: 1.5px solid #DCDCDC; border-radius: 100px;
    padding: 13px 28px; font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, transform 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-ghost:hover { border-color: #C8345A; color: #C8345A; transform: translateY(-1px); }

  .card-lift {
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.35s cubic-bezier(0.22,1,0.36,1);
  }
  .card-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.10);
  }

  .nav-link {
    background: none; border: none; cursor: pointer;
    font-size: 13.5px; font-weight: 500; color: #555;
    padding: 0; transition: color 0.18s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.01em;
  }
  .nav-link:hover { color: #C8345A; }

  .tag-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; padding: 5px 13px;
    border-radius: 100px;
  }

  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #C8345A; margin-bottom: 12px;
  }

  .section-heading {
    font-size: clamp(36px, 5vw, 52px);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -0.04em; color: #0F0F0F;
  }
  .section-heading em {
    font-style: italic; color: #C8345A; font-weight: 800;
  }

  .divider { height: 1px; background: #EBEBEB; }

  .faq-btn {
    width: 100%; display: flex; justify-content: space-between;
    align-items: center; padding: 20px 24px;
    background: none; border: none; cursor: pointer; text-align: left;
    transition: background 0.15s; border-radius: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .faq-btn:hover { background: #FEF6F8; }

  .feature-card {
    padding: 28px; border-radius: 18px; border: 1px solid #EBEBEB;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    background: #fff;
  }
  .feature-card:hover {
    border-color: #F9D0DA;
    box-shadow: 0 6px 24px rgba(200,52,90,0.07);
    transform: translateY(-3px);
  }

  .book-card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .book-card-wrap {
    border-radius: 22px; overflow: hidden;
    aspect-ratio: 3/4;
    box-shadow: 0 6px 24px rgba(0,0,0,0.09);
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  .book-card-wrap:hover {
    transform: translateY(-10px);
    box-shadow: 0 28px 56px rgba(0,0,0,0.13);
  }
  .book-card-wrap:hover .book-card-img { transform: scale(1.05); }

  /* Mobile */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .grid-2col { grid-template-columns: 1fr !important; }
    .grid-3col { grid-template-columns: 1fr !important; }
    .hero-section { padding: 48px 24px 40px !important; }
    .section-pad { padding: 64px 24px !important; }
    .nav-wrap { padding: 0 20px !important; }
    .section-heading { font-size: 34px !important; }
    .hero-h1 { font-size: 44px !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px 24px !important; }
    .pricing-grid { grid-template-columns: 1fr !important; }
    .pricing-featured { transform: none !important; }
    .stats-row { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  }
`;

/* ─── SCROLL REVEAL HOOK ─────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── REVEAL CARD WRAPPER ────────────────────────────────── */
// Fixes the hook-in-map bug — wraps any card with reveal animation
const RevealCard = ({ children, delay = 0, style = {}, className = "" }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${delay ? `reveal-delay-${delay}` : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

/* ─── LOGO ───────────────────────────────────────────────── */
// const Logo = ({ size = 22, dark = false }) => (
//   <span style={{
//     fontFamily: "'Plus Jakarta Sans', sans-serif",
//     fontSize: size, letterSpacing: "-0.03em",
//     lineHeight: 1, userSelect: "none",
//   }}>
//     <span style={{ fontWeight: 300, color: dark ? "#fff" : C.ink }}>blush</span>
//     <span style={{ fontWeight: 800, color: dark ? "#fff" : C.ink }}>book</span>
//     <span style={{ fontWeight: 800, color: C.rose, marginLeft: 2 }}>•</span>
//   </span>
// );

/* ─── TRUST BADGE ────────────────────────────────────────── */
const TrustBadge = ({ icon, text }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 7,
    fontSize: 12, color: C.muted, fontWeight: 500,
  }}>
    <span style={{ color: C.rose, display: "flex" }}>{icon}</span>
    {text}
  </div>
);

/* ─── STAR ROW ───────────────────────────────────────────── */
const Stars = ({ size = 13 }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill="#FCD34D" color="#FCD34D" />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                            */
/* ══════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Section refs for reveal
  const heroRef = useReveal();
  const bestSellersRef = useReveal();
  const howRef = useReveal();
  const featuresRef = useReveal();
  const qualityRef = useReveal();
  const reviewsRef = useReveal();
  const pricingRef = useReveal();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Home", action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); } },
    { label: "Shop", action: () => scrollTo("bestsellers") },
    { label: "How it works", action: () => scrollTo("how") },
    { label: "FAQ", action: () => scrollTo("faq") },
  ];

  const faqs = [
    { q: "How do I place an order?", a: "Create a free account, upload your photos, customise your book layout, then place your order. We handle professional printing and deliver right to your door anywhere in Nepal." },
    { q: "How long does delivery take?", a: "Standard delivery takes 5–10 business days within Nepal. Express options are available at checkout for faster turnaround." },
    { q: "Do you accept local payments?", a: "Yes. We support eSewa and Khalti — Nepal's most popular digital wallets — alongside international card payments via Stripe." },
    { q: "Can I customise my book design?", a: "Absolutely. Every template is fully customisable — fonts, colors, layouts, captions, cover design, and more. Our drag-and-drop editor makes it easy." },
    { q: "What sizes are available?", a: "We offer A5 (14.8×21 cm), A4 (21×29.7 cm), and Square (30×30 cm) formats in both softcover and hardcover options." },
    { q: "What if my order arrives damaged?", a: "We stand behind our quality 100%. Contact support with photos of the damage and we will reprint and reship at absolutely no cost to you." },
  ];

  const bestsellers = [
    { name: "Travel Photobook", price: "from Rs. 2,499", tag: "Best Seller", tagRose: true, img: book1 },
    { name: "Custom Photobook", price: "from Rs. 2,999", tag: "Most Popular", tagRose: true, img: book3 },
    { name: "Love Stories", price: "from Rs. 2,999", tag: "New Arrival", tagGreen: true, img: book4 },
  ];

  const features = [
    { icon: <Wand2 size={20} />, title: "AI Smart Creator", desc: "Upload photos and AI instantly creates your book — captions, layouts, and sections, all done automatically." },
    { icon: <Pen size={20} />, title: "Powerful Editor", desc: "Drag & drop photos, edit captions inline, choose from hundreds of layouts and colour schemes." },
    { icon: <Layers size={20} strokeWidth={1.8} />, title: "Realistic 3D Preview", desc: "Flip through your book like a real physical book before you order. What you see is what you get." },
    { icon: <Download size={20} />, title: "PDF Download", desc: "Download a high-quality PDF instantly. Perfect for digital sharing or archiving." },
    { icon: <Layers size={20} />, title: "50+ Templates", desc: "Beautiful templates for every occasion — travel, weddings, festivals, and more." },
    { icon: <Truck size={20} />, title: "Fast Nepal Delivery", desc: "Professionally printed and delivered anywhere in Nepal in 5–10 business days." },
  ];

  const reviews = [
    { name: "Suraj S.", location: "Kathmandu", review: "Created a book from my Pokhara trip and the quality exceeded all expectations. The AI captions were surprisingly accurate and personal. Will definitely order again!", avatar: "SS", trip: "Pokhara Trip" },
    { name: "Sushmita R.", location: "Lalitpur", review: "Made a wedding photo book for my sister. The editor was so easy to use and the final product looked incredibly professional. Everyone loved it as a gift!", avatar: "SR", trip: "Wedding Album" },
    { name: "Prakash K.", location: "Pokhara", review: "Ordered a travel book from my Mustang trek. Printing quality is outstanding and it arrived within the promised time. eSewa payment was super convenient!", avatar: "PK", trip: "Mustang Trek" },
  ];

  return (
    <>
      <style>{globalStyle}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* ── ANNOUNCEMENT BAR ─────────────────────────── */}
        <div style={{
          background: C.ink2, color: "#fff", fontSize: 12,
          padding: "9px 32px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
          letterSpacing: "0.01em",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Truck size={11} /> Free delivery on orders over Rs. 2,000
          </span>
          <span className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars size={10} />
            <span style={{ marginLeft: 5, color: "#ccc" }}>500+ five-star reviews</span>
          </span>
          <span className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={11} /> 30-day money-back guarantee
          </span>
        </div>

        {/* ── NAVBAR ───────────────────────────────────── */}
        <nav className="nav-wrap" style={{
          background: scrolled ? "rgba(255,255,255,0.94)" : "#fff",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: `1px solid ${scrolled ? C.line : "transparent"}`,
          padding: "0 48px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
          transition: "background 0.3s, border-color 0.3s",
        }}>
          {/* Desktop left links */}
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              <Logo size={21} />
            </div>
            <div className="hide-mobile" style={{ display: "flex", gap: 28 }}>
              {navLinks.map(({ label, action }) => (
                <button key={label} className="nav-link" onClick={action}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop right */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="nav-link"
              onClick={() => navigate("/login")}
              style={{ padding: "8px 12px" }}
            >
              Sign in
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/register")}
              style={{ padding: "10px 22px", fontSize: 13 }}
            >
              Get started free
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            style={{
              display: "none", background: "none", border: "none",
              cursor: "pointer", padding: 8, color: C.ink,
            }}
            className="show-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* ── MOBILE MENU ──────────────────────────────── */}
        {mobileMenuOpen && (
          <div style={{
            position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
            background: "#fff", zIndex: 99, padding: "24px",
            display: "flex", flexDirection: "column", gap: 4,
            borderTop: `1px solid ${C.line}`,
            overflowY: "auto",
          }}>
            {navLinks.map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, fontWeight: 600, color: C.ink,
                  padding: "16px 0", textAlign: "left",
                  borderBottom: `1px solid ${C.line}`,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                {label}
              </button>
            ))}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                className="btn-ghost"
                onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                style={{ justifyContent: "center", padding: "14px" }}
              >
                Sign in
              </button>
              <button
                className="btn-primary"
                onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                style={{ justifyContent: "center", padding: "14px" }}
              >
                Get started free
              </button>
            </div>
          </div>
        )}

        {/* ── HERO ─────────────────────────────────────── */}
        <section
          id="home"
          className="hero-section section-pad"
          style={{ padding: "96px 48px 80px", background: C.bg }}
        >
          <div
            ref={heroRef}
            className="reveal grid-2col"
            style={{
              maxWidth: 1160, margin: "0 auto",
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 72, alignItems: "center",
            }}
          >
            {/* Left */}
            <div>
              <div
                className="tag-pill"
                style={{ background: C.roseSoft, color: C.rose, marginBottom: 28 }}
              >
                <span style={{ width: 6, height: 6, background: C.rose, borderRadius: "50%", display: "inline-block" }} />
                Nepal's first AI photo book platform
              </div>

              <h1
                className="hero-h1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(48px, 6vw, 72px)",
                  fontWeight: 800, lineHeight: 1.03,
                  letterSpacing: "-0.04em", color: C.ink,
                  marginBottom: 24,
                }}
              >
                Your<br />
                memories,<br />
                <em style={{ color: C.rose, fontStyle: "italic" }}>
                  beautifully<br />bound.
                </em>
              </h1>

              <p style={{
                fontSize: 16, color: C.muted, lineHeight: 1.75,
                marginBottom: 36, maxWidth: 400, fontWeight: 400,
              }}>
                Upload your travel, wedding, or festival photos and let AI
                transform them into a stunning printed photo book delivered
                anywhere in Nepal.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
                <button className="btn-primary" onClick={() => navigate("/register")}>
                  Start your photobook <ArrowRight size={15} />
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => scrollTo("bestsellers")}
                >
                  Browse books
                </button>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <TrustBadge icon={<MapPin size={13} />} text="Printed & delivered in Nepal" />
                <TrustBadge icon={<CreditCard size={13} />} text="Secure eSewa & Khalti payments" />
                <TrustBadge icon={<Package size={13} />} text="Delivery across all of Nepal" />
                <TrustBadge icon={<Sparkles size={13} />} text="Premium 300 DPI quality printing" />
              </div>
            </div>

            {/* Right — Hero image */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
                <img
                  src={heroImage}
                  alt="BlushBook 3D photobook"
                  style={{
                    width: "100%", objectFit: "contain",
                    filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.13))",
                  }}
                />

                {/* Float card — AI */}
                <div style={{
                  position: "absolute", bottom: 32, left: -20,
                  background: "#fff", borderRadius: 18, padding: "13px 18px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                  display: "flex", alignItems: "center", gap: 12,
                  border: `1px solid ${C.line}`,
                }}>
                  <div style={{
                    width: 38, height: 38, background: C.roseSoft,
                    borderRadius: 11, display: "flex", alignItems: "center",
                    justifyContent: "center", color: C.rose,
                  }}>
                    <Wand2 size={17} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: 0 }}>
                      AI-generated captions
                    </p>
                    <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>
                      Written automatically
                    </p>
                  </div>
                </div>

                {/* Float card — payment */}
                <div style={{
                  position: "absolute", top: 20, right: -20,
                  background: "#fff", borderRadius: 18, padding: "13px 18px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                  display: "flex", alignItems: "center", gap: 12,
                  border: `1px solid ${C.line}`,
                }}>
                  <div style={{
                    width: 38, height: 38, background: "#F0FDF4",
                    borderRadius: 11, display: "flex", alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ color: "#16A34A", fontWeight: 800, fontSize: 15 }}>₨</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: 0 }}>
                      eSewa / Khalti
                    </p>
                    <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>
                      Local payments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="stats-row"
            style={{
              maxWidth: 1160, margin: "60px auto 0",
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            {[
              ["500+", "Books created"],
              ["4.9★", "Average rating"],
              ["5–10", "Days delivery"],
              ["eSewa", "Local payment"],
            ].map(([v, l], i) => (
              <div key={l} style={{
                textAlign: "center",
                borderLeft: i === 0 ? "none" : `1px solid ${C.line}`,
                padding: "0 16px",
              }}>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 22, fontWeight: 800, color: C.ink,
                  margin: 0, letterSpacing: "-0.03em",
                }}>
                  {v}
                </p>
                <p style={{ fontSize: 12, color: C.subtle, margin: "4px 0 0", fontWeight: 400 }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RATED BAR ────────────────────────────────── */}
        <div style={{
          background: C.bgSoft,
          borderTop: `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          padding: "14px 48px",
          display: "flex", justifyContent: "center",
          alignItems: "center", gap: 10,
        }}>
          <Stars size={14} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
            #1 rated photo book platform in Nepal —{" "}
            <span style={{ color: C.muted, fontWeight: 400 }}>
              trusted by 500+ customers
            </span>
          </span>
        </div>

        {/* ── BESTSELLERS ──────────────────────────────── */}
        <section id="bestsellers" className="section-pad" style={{ padding: "96px 48px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div
              ref={bestSellersRef}
              className="reveal"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}
            >
              <div>
                <p className="section-eyebrow">Our Products</p>
                <h2 className="section-heading">
                  BEST<em>sellers</em>
                </h2>
              </div>
              <button
                onClick={() => navigate("/register")}
                className="nav-link"
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}
              >
                View all <ChevronRight size={15} />
              </button>
            </div>

            {/* ✅ Fixed — no hooks inside map */}
            <div
              className="grid-3col"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}
            >
              {bestsellers.map((book, idx) => (
                <RevealCard key={book.name} delay={idx + 1}>
                  <div
                    onClick={() => navigate("/register")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="book-card-wrap" style={{ position: "relative", marginBottom: 22 }}>
                      <img
                        src={book.img}
                        alt={book.name}
                        className="book-card-img"
                      />
                      {/* Spine effect */}
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: 9, background: "rgba(0,0,0,0.15)",
                        borderRadius: "22px 0 0 22px",
                      }} />
                      <span style={{
                        position: "absolute", top: 14, right: 14,
                        background: book.tagGreen ? "#DCFCE7" : C.roseSoft,
                        color: book.tagGreen ? "#15803D" : C.rose,
                        fontSize: 10, fontWeight: 700,
                        padding: "4px 11px", borderRadius: 100,
                        letterSpacing: "0.07em", textTransform: "uppercase",
                      }}>
                        {book.tag}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 2, marginBottom: 7 }}>
                      <Stars size={11} />
                      <span style={{ fontSize: 11, color: "#CCC", marginLeft: 5 }}>(4.9)</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 17, color: C.ink, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                      {book.name}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 16px" }}>
                      {book.price}
                    </p>
                    <button
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                    >
                      Start my design
                    </button>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" style={{ margin: "0 48px" }} />

        {/* ── HOW IT WORKS ─────────────────────────────── */}
        <section id="how" className="section-pad" style={{ padding: "96px 48px", background: C.bgBlush }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={howRef} className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
              <p className="section-eyebrow">Simple Process</p>
              <h2 className="section-heading">
                IT'S AS EASY AS 1, 2, 3 TO CREATE<br />YOUR <em>photobook</em>
              </h2>
              <p style={{ fontSize: 16, color: C.muted, maxWidth: 460, margin: "18px auto 0", lineHeight: 1.7 }}>
                With BlushBook you can easily transform your photos into a
                story-worthy book that captures the best of your journey.
              </p>
            </div>

            {/* ✅ Fixed — RevealCard wrapper */}
            <div
              className="grid-3col"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
            >
              {[
                { num: "01", title: "Choose your template", desc: "Pick from 50+ beautiful templates. Curated designs make it easy to start and let AI do the heavy lifting.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
                { num: "02", title: "Upload your photos", desc: "AI instantly organises your photos, removes duplicates, writes captions, and creates layouts automatically.", img: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=600&q=80" },
                { num: "03", title: "Customise & order", desc: "Change fonts, backgrounds, colors, and images in our drag-and-drop editor. Then order with one click!", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
              ].map((step, i) => (
                <RevealCard
                  key={step.num}
                  delay={i + 1}
                  className="card-lift"
                  style={{
                    background: "#fff", borderRadius: 22,
                    overflow: "hidden",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ height: 196, overflow: "hidden", position: "relative" }}>
                    <img
                      src={step.img}
                      alt={step.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      width: 36, height: 36, background: "#fff",
                      borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, color: C.rose,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                    }}>
                      {step.num}
                    </div>
                  </div>
                  <div style={{ padding: "24px 26px 28px" }}>
                    <h3 style={{ fontWeight: 700, fontSize: 17, color: C.ink, margin: "0 0 9px", letterSpacing: "-0.02em" }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </RevealCard>
              ))}
            </div>

            <div
              ref={useReveal()}
              className="reveal"
              style={{ textAlign: "center", marginTop: 48 }}
            >
              <button
                className="btn-primary"
                onClick={() => navigate("/register")}
                style={{ padding: "15px 40px", fontSize: 15 }}
              >
                Start my design — it's free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────── */}
        <section id="features" className="section-pad" style={{ padding: "96px 48px", background: C.bg }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={featuresRef} className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
              <p className="section-eyebrow">Why BlushBook</p>
              <h2 className="section-heading">
                DISCOVER THE BLUSHBOOK<br /><em>advantage</em>
              </h2>
              <p style={{ fontSize: 16, color: C.muted, marginTop: 16 }}>
                Everything you need to create stunning photo books
              </p>
            </div>

            {/* ✅ Fixed — RevealCard wrapper */}
            <div
              className="grid-3col"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            >
              {features.map((f, i) => (
                <RevealCard key={f.title} delay={(i % 3) + 1} className="feature-card">
                  <div style={{
                    width: 46, height: 46, background: C.roseSoft,
                    borderRadius: 13, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: C.rose, marginBottom: 18,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: C.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, margin: 0 }}>
                    {f.desc}
                  </p>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUALITY ──────────────────────────────────── */}
        <section style={{ padding: "96px 48px", background: "#141414", color: "#fff" }} className="section-pad">
          <div
            style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
            className="grid-2col"
          >
            <div ref={qualityRef} className="reveal" style={{ position: "relative" }}>
              <img
                src={qualityImage}
                alt="Beautiful print quality"
                style={{ width: "100%", borderRadius: 24, objectFit: "cover", height: 500 }}
              />
              <div style={{
                position: "absolute", bottom: -16, right: -16,
                background: "#fff", borderRadius: 18, padding: "16px 20px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
              }}>
                <div style={{ marginBottom: 5 }}><Stars size={13} /></div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>
                  Excellent Quality
                </p>
                <p style={{ fontSize: 11.5, color: C.muted, margin: "2px 0 0" }}>
                  500+ happy customers
                </p>
              </div>
            </div>

            <div ref={useReveal()} className="reveal reveal-delay-1">
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(74,222,128,0.12)", color: "#4ADE80",
                fontSize: 11, fontWeight: 700, padding: "6px 14px",
                borderRadius: 100, marginBottom: 28,
                letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
                <Check size={12} /> Premium print quality
              </span>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(36px,4.5vw,52px)",
                fontWeight: 800, lineHeight: 1.08,
                margin: "0 0 22px", letterSpacing: "-0.04em",
              }}>
                BEAUTIFUL QUALITY FOR<br />
                <em style={{ color: C.rose, fontStyle: "italic" }}>beautiful moments</em>
              </h2>
              <p style={{ fontSize: 15, color: "#aaa", lineHeight: 1.8, margin: "0 0 32px", fontWeight: 400 }}>
                Preserve your memories in a beautifully crafted photobook.
                Professional 300 DPI printing on premium silk paper,
                delivered anywhere in Nepal.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 36 }}>
                {["300 DPI professional printing", "Premium matte or gloss finish", "2.5mm thick hardcover", "Delivered across Nepal"].map((item) => (
                  <div key={item} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.05)", borderRadius: 12,
                    padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{
                      width: 22, height: 22, background: C.rose,
                      borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Check size={12} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 12.5, color: "#ccc", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-rose"
                onClick={() => navigate("/register")}
                style={{ padding: "14px 32px" }}
              >
                Order your book <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────── */}
        <section style={{ padding: "96px 48px", background: C.bgBlush }} className="section-pad">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={reviewsRef} className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
              <p className="section-eyebrow">Customer Reviews</p>
              <h2 className="section-heading">
                LOVED BY CUSTOMERS<br /><em>across Nepal</em>
              </h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <Stars size={16} />
                <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>Excellent</span>
                <span style={{ fontSize: 13, color: C.subtle }}>· 500+ verified reviews</span>
              </div>
            </div>

            {/* ✅ Fixed — RevealCard wrapper */}
            <div
              className="grid-3col"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
            >
              {reviews.map((r, i) => (
                <RevealCard
                  key={r.name}
                  delay={i + 1}
                  className="card-lift"
                  style={{
                    background: "#fff", borderRadius: 22,
                    padding: "28px",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ marginBottom: 16 }}><Stars size={13} /></div>
                  <p style={{ fontSize: 14.5, color: "#444", lineHeight: 1.72, marginBottom: 22, fontStyle: "italic", fontWeight: 400 }}>
                    "{r.review}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
                    <div style={{
                      width: 42, height: 42, background: C.roseSoft,
                      borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ color: C.rose, fontWeight: 800, fontSize: 13 }}>{r.avatar}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 11.5, color: C.subtle, margin: "2px 0 0" }}>{r.location}</p>
                      <p style={{ fontSize: 11.5, color: C.rose, margin: "2px 0 0", fontWeight: 600 }}>{r.trip}</p>
                    </div>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────── */}
        <section id="pricing" className="section-pad" style={{ padding: "96px 48px", background: C.bg }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div ref={pricingRef} className="reveal">
              <p className="section-eyebrow">Pricing</p>
              <h2 className="section-heading" style={{ marginBottom: 20 }}>
                SIMPLE, HONEST <em>pricing</em>
              </h2>
              <div style={{
                display: "inline-flex", flexDirection: "column",
                alignItems: "center", background: C.bgBlush,
                border: `1.5px solid ${C.roseMid}`,
                borderRadius: 24, padding: "40px 56px", marginTop: 12,
              }}>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Starting from
                </p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 64, fontWeight: 800, color: C.ink,
                  margin: "0 0 4px", letterSpacing: "-0.05em", lineHeight: 1,
                }}>
                  Rs. 999<span style={{ color: C.rose }}>*</span>
                </p>
                <p style={{ fontSize: 13, color: C.subtle, marginTop: 10, maxWidth: 340, lineHeight: 1.6 }}>
                  *Final price depends on size, number of pages, cover type,
                  and customisation options. Free to design — pay only when you order.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/register")}
                  style={{ marginTop: 28, padding: "14px 36px", fontSize: 14 }}
                >
                  Start designing for free <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section id="faq" className="section-pad" style={{ padding: "96px 48px", background: C.bgSoft }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p className="section-eyebrow">FAQ</p>
              <h2 className="section-heading">
                FREQUENTLY <em>asked<br />questions</em>
              </h2>
              <p style={{ fontSize: 14.5, color: C.muted, marginTop: 16 }}>
                Find answers to commonly asked questions about BlushBook.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff", border: `1px solid ${C.line}`,
                    borderRadius: 16, overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.roseMid}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.line}
                >
                  <button
                    className="faq-btn"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14.5, color: C.ink, paddingRight: 16, letterSpacing: "-0.01em" }}>
                      {faq.q}
                    </span>
                    <div style={{
                      width: 30, height: 30,
                      background: openFaq === i ? C.roseSoft : C.bgSoft,
                      borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "background 0.2s",
                    }}>
                      {openFaq === i
                        ? <Minus size={14} color={C.rose} />
                        : <Plus size={14} color={C.muted} />
                      }
                    </div>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${C.line}` }}>
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: "16px 0 0" }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section style={{ background: C.rose, padding: "96px 48px", textAlign: "center", color: "#fff" }} className="section-pad">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(38px,5vw,60px)",
              fontWeight: 800, margin: "0 0 18px",
              lineHeight: 1.05, letterSpacing: "-0.04em",
            }}>
              READY TO CREATE<br />
              <em style={{ fontStyle: "italic" }}>your photo book?</em>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", margin: "0 0 36px", lineHeight: 1.7, fontWeight: 400 }}>
              Join hundreds of customers across Nepal who have turned their
              memories into beautiful books with BlushBook.
            </p>
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "#fff", color: C.rose, border: "none",
                borderRadius: 100, padding: "16px 48px",
                fontSize: 15, fontWeight: 800, cursor: "pointer",
                letterSpacing: "-0.02em",
                transition: "transform 0.15s, background 0.2s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={e => { e.target.style.background = "#FEE"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.transform = "translateY(0)"; }}
            >
              Get started — it's free
            </button>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginTop: 16, fontWeight: 400 }}>
              Free to design · Pay only when you order · eSewa & Khalti accepted
            </p>
          </div>
        </section>

        {/* ── TRUST BAR ────────────────────────────────── */}
        <section
          style={{
            background: C.bg,
            padding: "60px 48px",
            borderTop: `1px solid ${C.line}`,
          }}
        >
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 32,
            }}
            className="grid-3col"
          >
            {[
              {
                icon: <Truck size={22} color={C.rose} />,
                title: "Free Delivery",
                desc: "All orders above Rs. 2,000 ship free anywhere in Nepal.",
              },
              {
                icon: <ShieldCheck size={22} color={C.rose} />,
                title: "100% Satisfaction",
                desc: "Love your book or we'll reprint it or refund you.",
              },
              {
                icon: <LifeBuoy size={22} color={C.rose} />,
                title: "Local Support",
                desc: "Friendly customer support available in Nepali and English.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "20px",
                  borderRadius: 18,
                  transition: "all 0.25s ease",
                }}
              >
                {/* Icon Badge */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${C.rose}12`,
                    border: `1px solid ${C.rose}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <div>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: C.ink,
                      margin: "0 0 6px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      fontSize: 13,
                      color: C.subtle,
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────── */}
        <footer style={{ background: "#0A0A0A", color: "#fff", padding: "0 48px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>

            {/* Newsletter stripe */}
            <div style={{
              borderBottom: "1px solid #1E1E1E", padding: "52px 0 44px",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 24,
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.rose, margin: "0 0 8px" }}>
                  Stay in the loop
                </p>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                  Get early access & offers
                </h3>
              </div>
              <div style={{ display: "flex", gap: 0, flexShrink: 0 }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    background: "#161616", border: "1px solid #2A2A2A",
                    borderRight: "none", borderRadius: "100px 0 0 100px",
                    padding: "12px 20px", fontSize: 13, color: "#fff",
                    outline: "none", width: 240,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                />
                <button
                  style={{
                    background: C.rose, color: "#fff", border: "none",
                    borderRadius: "0 100px 100px 0", padding: "12px 22px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "background 0.2s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => e.target.style.background = C.roseHov}
                  onMouseLeave={e => e.target.style.background = C.rose}
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Footer columns */}
            <div
              className="footer-grid"
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, padding: "48px 0 44px" }}
            >
              {/* Brand */}
              <div>
                <div style={{ marginBottom: 18, cursor: "pointer" }} onClick={() => navigate("/")}>
                  <Logo size={22} dark />
                </div>
                <p style={{ fontSize: 13.5, color: "#5A5A5A", maxWidth: 280, lineHeight: 1.8, margin: "0 0 24px", fontWeight: 400 }}>
                  Nepal's first AI-powered photo book platform. Upload your
                  memories, let AI do the magic, get a beautiful printed
                  book at your door.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "Facebook", icon: "f" },
                    { label: "Instagram", icon: "ig" },
                    { label: "TikTok", icon: "tt" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      title={s.label}
                      style={{
                        width: 36, height: 36, background: "#161616",
                        border: "1px solid #272727", borderRadius: "50%",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.rose; e.currentTarget.style.background = "#1E0A10"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#272727"; e.currentTarget.style.background = "#161616"; }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#666" }}>{s.icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, margin: "0 0 20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Product
                </h4>
                {["How it works", "Templates", "AI Creator", "PDF Download", "Pricing"].map((l) => (
                  <p
                    key={l}
                    style={{ fontSize: 13.5, color: "#5A5A5A", margin: "0 0 13px", cursor: "pointer", transition: "color 0.18s", fontWeight: 400 }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#5A5A5A"}
                  >
                    {l}
                  </p>
                ))}
              </div>

              {/* Company */}
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, margin: "0 0 20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Company
                </h4>
                {["About us", "Blog", "Contact", "Careers", "Press"].map((l) => (
                  <p
                    key={l}
                    style={{ fontSize: 13.5, color: "#5A5A5A", margin: "0 0 13px", cursor: "pointer", transition: "color 0.18s", fontWeight: 400 }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#5A5A5A"}
                  >
                    {l}
                  </p>
                ))}
              </div>

              {/* Support */}
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, margin: "0 0 20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Support
                </h4>

                {["Help centre", "Order tracking", "Returns"].map((l) => (
                  <p
                    key={l}
                    style={{ fontSize: 13.5, color: "#5A5A5A", margin: "0 0 13px", cursor: "pointer", transition: "color 0.18s", fontWeight: 400 }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#5A5A5A"}
                  >
                    {l}
                  </p>
                ))}

                {[
                  { label: "Privacy policy", to: "/privacy" },
                  { label: "Terms", to: "/terms" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    style={{ display: "block", fontSize: 13.5, color: "#5A5A5A", margin: "0 0 13px", textDecoration: "none", transition: "color 0.18s", fontWeight: 400 }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#5A5A5A"}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              borderTop: "1px solid #1A1A1A", padding: "22px 0 28px",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 16,
            }}>
              <p style={{ fontSize: 12, color: "#3A3A3A", margin: 0, fontWeight: 400 }}>
                © 2026 blushbook<span style={{ color: C.rose }}>•</span> Nepal. All rights reserved.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11.5, color: "#3A3A3A", marginRight: 4 }}>
                  Accepted payments
                </span>
                {[
                  { name: "eSewa", bg: "#1A2E1A", color: "#4CAF50" },
                  { name: "Khalti", bg: "#1E1229", color: "#9C6FE4" },
                  { name: "Stripe", bg: "#111827", color: "#6B7FF0" },
                ].map((p) => (
                  <span
                    key={p.name}
                    style={{
                      fontSize: 11, background: p.bg, color: p.color,
                      padding: "4px 10px", borderRadius: 6,
                      fontFamily: "monospace", fontWeight: 700,
                      border: `1px solid ${p.color}22`,
                    }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;