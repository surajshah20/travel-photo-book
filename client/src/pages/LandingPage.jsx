// client/src/pages/LandingPage.jsx
// FIXES: C2 (hooks in map), C3 (mobile overflow), H2 (inline style perf),
//        H4 (image lazy loading), H8 (contrast), H9 (focus), H10 (FAQ memo),
//        H12 (tap targets), M12 (preconnect), accessibility throughout

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
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

/* ─── GLOBAL STYLES ──────────────────────────────────────── */
// FIX C3: All responsive layout in CSS, not inline style overrides
const globalStyle = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; overflow-x: hidden; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    background: #fff; color: #0F0F0F;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    max-width: 100vw;
  }

  /* FIX H9: Focus visible */
  :focus { outline: none; }
  :focus-visible {
    outline: 2px solid #C8345A;
    outline-offset: 3px;
    border-radius: 6px;
  }

  /* FIX H12: Minimum tap targets */
  button, a { min-height: 44px; }

  /* Scroll reveal animation */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                transform 0.6s cubic-bezier(0.22,1,0.36,1);
    will-change: transform, opacity;
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-d1 { transition-delay: 0.08s; }
  .reveal-d2 { transition-delay: 0.16s; }
  .reveal-d3 { transition-delay: 0.24s; }

  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: #0F0F0F; color: #fff;
    border: none; border-radius: 100px;
    padding: 14px 28px; font-size: 14px; font-weight: 700;
    cursor: pointer; min-height: 48px;
    transition: background 0.2s, transform 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.01em;
    text-decoration: none;
  }
  .btn-primary:hover { background: #C8345A; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-rose {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: #C8345A; color: #fff;
    border: none; border-radius: 100px;
    padding: 14px 28px; font-size: 14px; font-weight: 700;
    cursor: pointer; min-height: 48px;
    transition: background 0.2s, transform 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-rose:hover { background: #A8284A; transform: translateY(-1px); }

  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #0F0F0F;
    border: 1.5px solid #DCDCDC; border-radius: 100px;
    padding: 13px 28px; font-size: 14px; font-weight: 600;
    cursor: pointer; min-height: 48px;
    transition: border-color 0.2s, color 0.2s, transform 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-ghost:hover { border-color: #C8345A; color: #C8345A; transform: translateY(-1px); }

  /* FIX H2: Performance — use CSS classes not inline style objects */
  .lp-nav {
    position: sticky; top: 0; z-index: 100;
    background: #fff;
    border-bottom: 1px solid transparent;
    padding: 0 48px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .lp-nav.scrolled {
    background: rgba(255,255,255,0.94);
    border-color: #EBEBEB;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .nav-link {
    background: none; border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; color: #555;
    padding: 8px 4px; transition: color 0.18s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.01em;
    min-height: 44px; display: inline-flex; align-items: center;
  }
  .nav-link:hover { color: #C8345A; }

  .tag-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; padding: 6px 14px;
    border-radius: 100px;
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #C8345A; margin-bottom: 12px;
    display: block;
  }
  .section-heading {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -0.04em; color: #0F0F0F;
  }
  .section-heading em { font-style: italic; color: #C8345A; font-weight: 800; }
  .divider { height: 1px; background: #EBEBEB; }

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
  .book-card-wrap {
    border-radius: 22px; overflow: hidden; aspect-ratio: 3/4;
    box-shadow: 0 6px 24px rgba(0,0,0,0.09);
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s cubic-bezier(0.22,1,0.36,1);
    position: relative;
  }
  .book-card-wrap:hover { transform: translateY(-10px); box-shadow: 0 28px 56px rgba(0,0,0,0.13); }
  .book-card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
    display: block;
  }
  .book-card-wrap:hover .book-card-img { transform: scale(1.05); }

  .step-card {
    background: #fff; border-radius: 22px; overflow: hidden;
    box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
  }
  .step-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }

  .review-card {
    background: #fff; border-radius: 22px; padding: 28px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
  }
  .review-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }

  /* FIX C3: RESPONSIVE GRIDS — CSS-based, not inline style overrides */
  .lp-hero-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 72px; align-items: center;
    max-width: 1160px; margin: 0 auto;
  }
  .lp-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .lp-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .lp-stats { display: grid; grid-template-columns: repeat(4, 1fr); }
  .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
  .lp-pricing-inner {
    display: inline-flex; flex-direction: column; align-items: center;
    background: #FEF6F8; border: 1.5px solid #F9D0DA;
    border-radius: 24px; padding: 40px 56px; margin-top: 12px;
  }

  /* Mobile overrides */
  @media (max-width: 768px) {
    .lp-nav { padding: 0 20px; height: 58px; }
    .lp-hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .lp-hero-image { display: none; } /* hero image hides on very small screens */
    .lp-3col { grid-template-columns: 1fr; gap: 16px; }
    .lp-2col { grid-template-columns: 1fr; gap: 40px; }
    .lp-stats { grid-template-columns: 1fr 1fr; gap: 1px; }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px 24px; }
    .lp-pricing-inner { padding: 28px 24px; width: 100%; }
    .lp-section { padding: 56px 20px !important; }
    .hide-mobile-lp { display: none !important; }
    .show-mobile-lp { display: flex !important; }
    .lp-hero-h1 { font-size: 40px !important; }
    .lp-section-heading { font-size: 30px !important; }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .lp-hero-grid { gap: 40px; }
    .lp-3col { grid-template-columns: repeat(2, 1fr); }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; }
    .lp-nav { padding: 0 32px; }
  }

  /* Mobile menu */
  .lp-mobile-menu {
    position: fixed; top: 58px; left: 0; right: 0; bottom: 0;
    background: #fff; z-index: 99;
    padding: 8px 0; overflow-y: auto;
    border-top: 1px solid #EBEBEB;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
  }
  .lp-mobile-menu.open { transform: translateX(0); }
  .lp-mobile-nav-item {
    display: flex; align-items: center;
    width: 100%; padding: 16px 24px;
    background: none; border: none; border-bottom: 1px solid #F5F5F5;
    cursor: pointer; font-size: 17px; font-weight: 600; color: #0F0F0F;
    font-family: 'Plus Jakarta Sans', sans-serif; text-align: left;
    min-height: 56px;
  }
  .lp-mobile-nav-item:hover { background: #FAFAFA; }

  /* FAQ */
  .faq-item { background: #fff; border: 1px solid #EBEBEB; border-radius: 16px; overflow: hidden; transition: border-color 0.2s; }
  .faq-item:hover { border-color: #F9D0DA; }
  .faq-btn {
    width: 100%; display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px; background: none; border: none; cursor: pointer; text-align: left;
    border-radius: 16px; font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 64px;
  }
  .faq-btn:hover { background: #FEF6F8; }
`;

/* ─── HOOKS ──────────────────────────────────────────────── */
// FIX C2: useReveal is a proper hook — never called in loops
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── STATIC SUB-COMPONENTS (memoized to prevent re-renders) ─ */

// FIX H10: FAQ extracted to its own memoized component — no full-page re-render
const FAQ = memo(({ faqs }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const toggle = useCallback((i) => setOpenFaq(prev => prev === i ? null : i), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {faqs.map((faq, i) => (
        <div key={i} className="faq-item">
          <button
            className="faq-btn"
            onClick={() => toggle(i)}
            aria-expanded={openFaq === i}
            aria-controls={`faq-answer-${i}`}
            id={`faq-btn-${i}`}
          >
            <span style={{ fontWeight: 600, fontSize: 15, color: "#0F0F0F", paddingRight: 16, letterSpacing: "-0.01em" }}>
              {faq.q}
            </span>
            <div style={{
              width: 32, height: 32, background: openFaq === i ? "#FFF0F4" : "#FAFAFA",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }} aria-hidden="true">
              {openFaq === i
                ? <Minus size={14} color="#C8345A" />
                : <Plus size={14} color="#9A9A9A" />
              }
            </div>
          </button>
          {openFaq === i && (
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              style={{ padding: "0 24px 20px", borderTop: "1px solid #EBEBEB" }}
            >
              <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.75, margin: "16px 0 0" }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
FAQ.displayName = "FAQ";

const Stars = memo(({ size = 13, label = "5 stars" }) => (
  <div style={{ display: "flex", gap: 3 }} aria-label={label} role="img">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill="#FCD34D" color="#FCD34D" aria-hidden="true" />
    ))}
  </div>
));
Stars.displayName = "Stars";

const TrustBadge = memo(({ icon, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555", fontWeight: 500 }}>
    <span style={{ color: "#C8345A", display: "flex", flexShrink: 0 }} aria-hidden="true">{icon}</span>
    {text}
  </div>
));
TrustBadge.displayName = "TrustBadge";

// FIX C2: RevealCard wraps children with a scroll-reveal div
// Uses its own internal ref — no hook-in-map violation
const RevealCard = memo(({ children, delay = 0, className = "", style = {} }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${delay ? `reveal-d${delay}` : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});
RevealCard.displayName = "RevealCard";

/* ─── STATIC DATA (outside component — no recreation on render) ── */
const BESTSELLERS = [
  { name: "Travel Photobook",  price: "from Rs. 2,499", tag: "Best Seller",   tagColor: "rose",  img: book1 },
  { name: "Custom Photobook",  price: "from Rs. 2,999", tag: "Most Popular",  tagColor: "rose",  img: book3 },
  { name: "Love Stories",      price: "from Rs. 2,999", tag: "New Arrival",   tagColor: "green", img: book4 },
];

const FEATURES = [
  { icon: <Wand2 size={20} aria-hidden="true" />,    title: "AI Smart Creator",    desc: "Upload photos and AI instantly creates your book — captions, layouts, and sections, all automatic." },
  { icon: <Pen size={20} aria-hidden="true" />,      title: "Powerful Editor",     desc: "Drag & drop photos, edit captions inline, choose from hundreds of layouts and colour schemes." },
  { icon: <Layers size={20} aria-hidden="true" />,   title: "Realistic 3D Preview",desc: "Flip through your book like a real physical book before you order. What you see is what you get." },
  { icon: <Download size={20} aria-hidden="true" />, title: "PDF Download",        desc: "Download a high-quality PDF instantly. Perfect for digital sharing or archiving." },
  { icon: <Layers size={20} aria-hidden="true" />,   title: "50+ Templates",       desc: "Beautiful templates for every occasion — travel, weddings, festivals, and more." },
  { icon: <Truck size={20} aria-hidden="true" />,    title: "Fast Nepal Delivery", desc: "Professionally printed and delivered anywhere in Nepal in 5–10 business days." },
];

const REVIEWS = [
  { name: "Suraj S.",    location: "Kathmandu", review: "Created a book from my Pokhara trip and the quality exceeded expectations. The AI captions were surprisingly accurate. Will definitely order again!", avatar: "SS", trip: "Pokhara Trip" },
  { name: "Sushmita R.", location: "Lalitpur",  review: "Made a wedding photo book for my sister. The editor was easy and the final product looked incredibly professional. Everyone loved it!", avatar: "SR", trip: "Wedding Album" },
  { name: "Prakash K.",  location: "Pokhara",   review: "Ordered a travel book from my Mustang trek. Print quality is outstanding and it arrived on time. eSewa payment was super convenient!", avatar: "PK", trip: "Mustang Trek" },
];

const FAQS = [
  { q: "How do I place an order?",           a: "Create a free account, upload your photos, customise your book layout, then place your order. We handle professional printing and deliver right to your door anywhere in Nepal." },
  { q: "How long does delivery take?",       a: "Standard delivery takes 5–10 business days within Nepal. Express options are available at checkout for faster turnaround." },
  { q: "Do you accept local payments?",      a: "Yes. We support eSewa and Khalti — Nepal's most popular digital wallets — alongside international card payments." },
  { q: "Can I customise my book design?",    a: "Absolutely. Every template is fully customisable — fonts, colors, layouts, captions, cover design, and more. Our drag-and-drop editor makes it easy." },
  { q: "What sizes are available?",          a: "We offer A5 (14.8×21 cm), A4 (21×29.7 cm), and Square (30×30 cm) formats in both softcover and hardcover options." },
  { q: "What if my order arrives damaged?",  a: "We stand behind our quality 100%. Contact support with photos of the damage and we will reprint and reship at absolutely no cost to you." },
];

const STEPS = [
  { num: "01", title: "Choose your template", desc: "Pick from 50+ beautiful templates. AI does the heavy lifting so you can start immediately.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { num: "02", title: "Upload your photos",   desc: "AI instantly organises your photos, removes duplicates, writes captions, and creates layouts.", img: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=600&q=80" },
  { num: "03", title: "Customise & order",    desc: "Adjust fonts, colors, and layouts in our editor. Then order with one click — delivered to your door.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
];

/* ══════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FIX C2: All reveal refs declared at top level — never in loops
  const heroRef        = useReveal();
  const bestSellersRef = useReveal();
  const howRef         = useReveal();
  const featuresRef    = useReveal();
  const qualityRef     = useReveal();
  const reviewsRef     = useReveal();
  const pricingRef     = useReveal();
  const qualityTextRef = useReveal();
  const howCtaRef      = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Escape closes mobile menu
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }, []);

  const goRegister = useCallback(() => navigate("/register"), [navigate]);
  const goLogin    = useCallback(() => navigate("/login"),    [navigate]);

  const navLinks = [
    { label: "Home",         action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); } },
    { label: "Shop",         action: () => scrollTo("bestsellers") },
    { label: "How it works", action: () => scrollTo("how") },
    { label: "FAQ",          action: () => scrollTo("faq") },
  ];

  return (
    <>
      <style>{globalStyle}</style>

      {/* FIX M12: Preconnect hints in JS (ideally in index.html <head>) */}
      <div aria-hidden="true" style={{ display: "none" }}>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </div>

      <div style={{ minHeight: "100vh", background: C.bg }}>

        {/* ── ANNOUNCEMENT BAR ─────────────────────────── */}
        <div
          style={{ background: C.ink2, color: "#fff", fontSize: 12, padding: "9px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
          role="banner"
          aria-label="Promotions"
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Truck size={11} aria-hidden="true" /> Free delivery on orders over Rs. 2,000
          </span>
          <span className="hide-mobile-lp" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars size={10} label="Rated 5 stars" />
            <span style={{ marginLeft: 5, color: "#ccc" }}>500+ five-star reviews</span>
          </span>
          <span className="hide-mobile-lp" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={11} aria-hidden="true" /> 30-day money-back guarantee
          </span>
        </div>

        {/* ── NAVBAR ───────────────────────────────────── */}
        <header>
          <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`} aria-label="Main navigation">
            {/* Logo + desktop links */}
            <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
              <Link to="/" aria-label="BlushBook — go to homepage">
                <Logo size={21} clickable={false} />
              </Link>
              <div className="hide-mobile-lp" style={{ display: "flex", gap: 28 }}>
                {navLinks.map(({ label, action }) => (
                  <button key={label} className="nav-link" onClick={action}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop right */}
            <div className="hide-mobile-lp" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="nav-link" onClick={goLogin} style={{ padding: "8px 12px" }}>Sign in</button>
              <button className="btn-primary" onClick={goRegister} style={{ padding: "10px 22px", fontSize: 13 }}>
                Get started free
              </button>
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="show-mobile-lp"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                display: "none", background: "none", border: "none",
                cursor: "pointer", padding: "10px", color: C.ink,
                borderRadius: 8, minHeight: 44, minWidth: 44,
                alignItems: "center", justifyContent: "center",
              }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </nav>

          {/* Mobile menu */}
          <div
            id="mobile-nav"
            className={`lp-mobile-menu ${mobileMenuOpen ? "open" : ""}`}
            aria-hidden={!mobileMenuOpen}
            role="dialog"
            aria-label="Navigation"
          >
            {navLinks.map(({ label, action }) => (
              <button key={label} className="lp-mobile-nav-item" onClick={action}>
                {label}
              </button>
            ))}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="btn-ghost" onClick={() => { goLogin(); setMobileMenuOpen(false); }} style={{ justifyContent: "center" }}>
                Sign in
              </button>
              <button className="btn-primary" onClick={() => { goRegister(); setMobileMenuOpen(false); }} style={{ justifyContent: "center" }}>
                Get started free
              </button>
            </div>
          </div>
        </header>

        {/* ── HERO ─────────────────────────────────────── */}
        <section id="home" className="lp-section" style={{ padding: "80px 48px 64px", background: C.bg }} aria-label="Hero">
          <div ref={heroRef} className="reveal lp-hero-grid">
            {/* Left */}
            <div>
              <div className="tag-pill" style={{ background: C.roseSoft, color: C.rose, marginBottom: 28 }} aria-hidden="true">
                <span style={{ width: 6, height: 6, background: C.rose, borderRadius: "50%", display: "inline-block" }} />
                Nepal's first AI photo book platform
              </div>

              <h1 className="lp-hero-h1" style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(42px, 6vw, 70px)",
                fontWeight: 800, lineHeight: 1.03,
                letterSpacing: "-0.04em", color: C.ink, marginBottom: 24,
              }}>
                Your memories,{" "}
                <em style={{ color: C.rose, fontStyle: "italic" }}>beautifully bound.</em>
              </h1>

              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.75, marginBottom: 36, maxWidth: 400, fontWeight: 400 }}>
                Upload your travel, wedding, or festival photos and let AI transform them into a stunning printed photo book, delivered anywhere in Nepal.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
                <button className="btn-primary" onClick={goRegister} aria-label="Start creating your photo book">
                  Start your photobook <ArrowRight size={15} aria-hidden="true" />
                </button>
                <button className="btn-ghost" onClick={() => scrollTo("bestsellers")}>
                  Browse books
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <TrustBadge icon={<MapPin size={13} />} text="Printed & delivered in Nepal" />
                <TrustBadge icon={<CreditCard size={13} />} text="eSewa & Khalti payments supported" />
                <TrustBadge icon={<Package size={13} />} text="Delivery across all of Nepal" />
                <TrustBadge icon={<Sparkles size={13} />} text="Premium 300 DPI quality printing" />
              </div>
            </div>

            {/* Right — hero image: FIX H4 — explicit dimensions, priority load */}
            <div className="lp-hero-image" style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
                <img
                  src={heroImage}
                  alt="Beautiful BlushBook photo book displayed open"
                  width="480"
                  height="520"
                  fetchpriority="high"
                  style={{ width: "100%", objectFit: "contain", filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.13))" }}
                />
                {/* Float cards */}
                <div style={{ position: "absolute", bottom: 32, left: -20, background: "#fff", borderRadius: 18, padding: "13px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", gap: 12, border: `1px solid ${C.line}` }} aria-hidden="true">
                  <div style={{ width: 38, height: 38, background: C.roseSoft, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: C.rose }}>
                    <Wand2 size={17} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: 0 }}>AI-generated captions</p>
                    <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>Written automatically</p>
                  </div>
                </div>
                <div style={{ position: "absolute", top: 20, right: -20, background: "#fff", borderRadius: 18, padding: "13px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", gap: 12, border: `1px solid ${C.line}` }} aria-hidden="true">
                  <div style={{ width: 38, height: 38, background: "#F0FDF4", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#16A34A", fontWeight: 800, fontSize: 15 }}>₨</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: 0 }}>eSewa / Khalti</p>
                    <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>Local payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="lp-stats reveal" ref={useReveal()} style={{ maxWidth: 1160, margin: "56px auto 0" }}>
            {[
              ["500+", "Books created"],
              ["4.9★", "Average rating"],
              ["5–10", "Days delivery"],
              ["eSewa", "Local payment"],
            ].map(([v, l], i) => (
              <div key={l} style={{ textAlign: "center", borderLeft: i === 0 ? "none" : `1px solid ${C.line}`, padding: "0 12px" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: "-0.03em" }}>{v}</p>
                <p style={{ fontSize: 12, color: "#767676", margin: "4px 0 0", fontWeight: 500 }}>{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rated bar */}
        <div style={{ background: C.bgSoft, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "14px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Stars size={14} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, textAlign: "center" }}>
            #1 rated photo book platform in Nepal —{" "}
            <span style={{ color: "#767676", fontWeight: 400 }}>trusted by 500+ customers</span>
          </span>
        </div>

        {/* ── BESTSELLERS ──────────────────────────────── */}
        <section id="bestsellers" className="lp-section" style={{ padding: "88px 48px" }} aria-labelledby="bestsellers-heading">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={bestSellersRef} className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <span className="section-eyebrow">Our Products</span>
                <h2 id="bestsellers-heading" className="section-heading">BEST<em>sellers</em></h2>
              </div>
              <button onClick={goRegister} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                View all <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="lp-3col">
              {BESTSELLERS.map((book, idx) => (
                <RevealCard key={book.name} delay={Math.min(idx + 1, 3)}>
                  <div onClick={goRegister} style={{ cursor: "pointer" }} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && goRegister()} aria-label={`${book.name} — ${book.price}`}>
                    <div className="book-card-wrap" style={{ marginBottom: 20 }}>
                      {/* FIX H4: lazy loading + explicit dimensions */}
                      <img src={book.img} alt={book.name} className="book-card-img" loading="lazy" width="300" height="400" />
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 9, background: "rgba(0,0,0,0.15)", borderRadius: "22px 0 0 22px" }} aria-hidden="true" />
                      <span style={{
                        position: "absolute", top: 14, right: 14,
                        background: book.tagColor === "green" ? "#DCFCE7" : C.roseSoft,
                        color: book.tagColor === "green" ? "#15803D" : C.rose,
                        fontSize: 10, fontWeight: 700, padding: "4px 11px",
                        borderRadius: 100, letterSpacing: "0.07em", textTransform: "uppercase",
                      }}>{book.tag}</span>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
                      <Stars size={11} />
                      <span style={{ fontSize: 11, color: "#9A9A9A", marginLeft: 5 }}>(4.9)</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 17, color: C.ink, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{book.name}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 16px" }}>{book.price}</p>
                    <button className="btn-primary" onClick={goRegister} style={{ width: "100%", padding: "12px" }}>
                      Start my design
                    </button>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" style={{ margin: "0 48px" }} aria-hidden="true" />

        {/* ── HOW IT WORKS ─────────────────────────────── */}
        <section id="how" className="lp-section" style={{ padding: "88px 48px", background: C.bgBlush }} aria-labelledby="how-heading">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={howRef} className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="section-eyebrow">Simple Process</span>
              <h2 id="how-heading" className="section-heading">
                IT'S AS EASY AS 1, 2, 3 TO CREATE YOUR <em>photobook</em>
              </h2>
              <p style={{ fontSize: 16, color: "#767676", maxWidth: 440, margin: "18px auto 0", lineHeight: 1.7 }}>
                Transform your photos into a story-worthy book that captures the best of your journey.
              </p>
            </div>

            <div className="lp-3col">
              {STEPS.map((step, i) => (
                <RevealCard key={step.num} delay={Math.min(i + 1, 3)} className="step-card">
                  <div style={{ height: 196, overflow: "hidden", position: "relative" }}>
                    <img src={step.img} alt="" aria-hidden="true" loading="lazy" width="400" height="196" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: C.rose, boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }} aria-hidden="true">
                      {step.num}
                    </div>
                  </div>
                  <div style={{ padding: "24px 26px 28px" }}>
                    <h3 style={{ fontWeight: 700, fontSize: 17, color: C.ink, margin: "0 0 9px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "#767676", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                  </div>
                </RevealCard>
              ))}
            </div>

            {/* FIX C2: CTA reveal uses a named ref, not inline hook call */}
            <div ref={howCtaRef} className="reveal" style={{ textAlign: "center", marginTop: 48 }}>
              <button className="btn-primary" onClick={goRegister} style={{ padding: "15px 40px", fontSize: 15 }}>
                Start my design — it's free <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────── */}
        <section id="features" className="lp-section" style={{ padding: "88px 48px", background: C.bg }} aria-labelledby="features-heading">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={featuresRef} className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="section-eyebrow">Why BlushBook</span>
              <h2 id="features-heading" className="section-heading">DISCOVER THE BLUSHBOOK <em>advantage</em></h2>
            </div>
            <div className="lp-3col">
              {FEATURES.map((f, i) => (
                <RevealCard key={f.title} delay={Math.min((i % 3) + 1, 3)} className="feature-card">
                  <div style={{ width: 46, height: 46, background: C.roseSoft, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color: C.rose, marginBottom: 18 }} aria-hidden="true">
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: C.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: "#767676", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUALITY ──────────────────────────────────── */}
        <section style={{ padding: "88px 48px", background: "#141414", color: "#fff" }} className="lp-section" aria-labelledby="quality-heading">
          <div style={{ maxWidth: 1160, margin: "0 auto" }} className="lp-2col">
            <div ref={qualityRef} className="reveal" style={{ position: "relative" }}>
              <img
                src={qualityImage}
                alt="High-quality printed photo book open on a table"
                loading="lazy"
                width="560"
                height="500"
                style={{ width: "100%", borderRadius: 24, objectFit: "cover", height: 500, display: "block" }}
              />
              <div style={{ position: "absolute", bottom: -16, right: -16, background: "#fff", borderRadius: 18, padding: "16px 20px", boxShadow: "0 12px 40px rgba(0,0,0,0.22)" }} aria-hidden="true">
                <div style={{ marginBottom: 5 }}><Stars size={13} /></div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>Excellent Quality</p>
                <p style={{ fontSize: 11.5, color: "#767676", margin: "2px 0 0" }}>500+ happy customers</p>
              </div>
            </div>

            <div ref={qualityTextRef} className="reveal reveal-d1">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(74,222,128,0.12)", color: "#4ADE80", fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 100, marginBottom: 28, letterSpacing: "0.07em", textTransform: "uppercase" }} aria-hidden="true">
                <Check size={12} /> Premium print quality
              </span>
              <h2 id="quality-heading" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(32px,4.5vw,50px)", fontWeight: 800, lineHeight: 1.08, margin: "0 0 22px", letterSpacing: "-0.04em" }}>
                BEAUTIFUL QUALITY FOR <em style={{ color: C.rose, fontStyle: "italic" }}>beautiful moments</em>
              </h2>
              <p style={{ fontSize: 15, color: "#aaa", lineHeight: 1.8, margin: "0 0 28px", fontWeight: 400 }}>
                Preserve your memories in a beautifully crafted photobook. Professional 300 DPI printing on premium silk paper, delivered anywhere in Nepal.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
                {["300 DPI professional printing", "Premium matte or gloss finish", "2.5mm thick hardcover", "Delivered across Nepal"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ width: 22, height: 22, background: C.rose, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
                      <Check size={12} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 12.5, color: "#ccc", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button className="btn-rose" onClick={goRegister} style={{ padding: "14px 32px" }}>
                Order your book <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────── */}
        <section style={{ padding: "88px 48px", background: C.bgBlush }} className="lp-section" aria-labelledby="reviews-heading">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={reviewsRef} className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="section-eyebrow">Customer Reviews</span>
              <h2 id="reviews-heading" className="section-heading">LOVED BY CUSTOMERS <em>across Nepal</em></h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <Stars size={16} />
                <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>Excellent</span>
                <span style={{ fontSize: 13, color: "#767676" }}>· 500+ verified reviews</span>
              </div>
            </div>
            <div className="lp-3col">
              {REVIEWS.map((r, i) => (
                <RevealCard key={r.name} delay={Math.min(i + 1, 3)} className="review-card">
                  <div style={{ marginBottom: 16 }}><Stars size={13} /></div>
                  <blockquote>
                    <p style={{ fontSize: 14.5, color: "#444", lineHeight: 1.72, marginBottom: 22, fontStyle: "italic", fontWeight: 400 }}>
                      "{r.review}"
                    </p>
                    <footer style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
                      <div style={{ width: 42, height: 42, background: C.roseSoft, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
                        <span style={{ color: C.rose, fontWeight: 800, fontSize: 13 }}>{r.avatar}</span>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>{r.name}</p>
                        <p style={{ fontSize: 11.5, color: "#767676", margin: "2px 0 0" }}>{r.location}</p>
                        <p style={{ fontSize: 11.5, color: C.rose, margin: "2px 0 0", fontWeight: 600 }}>{r.trip}</p>
                      </div>
                    </footer>
                  </blockquote>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────── */}
        <section id="pricing" className="lp-section" style={{ padding: "88px 48px", background: C.bg }} aria-labelledby="pricing-heading">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div ref={pricingRef} className="reveal">
              <span className="section-eyebrow">Pricing</span>
              <h2 id="pricing-heading" className="section-heading" style={{ marginBottom: 20 }}>SIMPLE, HONEST <em>pricing</em></h2>
              <div className="lp-pricing-inner">
                <p style={{ fontSize: 13, color: "#767676", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Starting from</p>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 64, fontWeight: 800, color: C.ink, margin: "0 0 4px", letterSpacing: "-0.05em", lineHeight: 1 }}>
                  Rs. 999<span style={{ color: C.rose }} aria-hidden="true">*</span>
                </p>
                <p style={{ fontSize: 13, color: "#767676", marginTop: 10, maxWidth: 340, lineHeight: 1.6 }}>
                  *Final price depends on size, pages, and cover type. Free to design — pay only when you order.
                </p>
                <button className="btn-primary" onClick={goRegister} style={{ marginTop: 28, padding: "14px 36px" }}>
                  Start designing for free <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section id="faq" className="lp-section" style={{ padding: "88px 48px", background: C.bgSoft }} aria-labelledby="faq-heading">
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="section-eyebrow">FAQ</span>
              <h2 id="faq-heading" className="section-heading">FREQUENTLY <em>asked questions</em></h2>
            </div>
            {/* FIX H10: FAQ is its own memoized component — no full page re-render */}
            <FAQ faqs={FAQS} />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section style={{ background: C.rose, padding: "88px 48px", textAlign: "center", color: "#fff" }} className="lp-section" aria-labelledby="cta-heading">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 id="cta-heading" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(34px,5vw,58px)", fontWeight: 800, margin: "0 0 18px", lineHeight: 1.05, letterSpacing: "-0.04em" }}>
              READY TO CREATE <em style={{ fontStyle: "italic" }}>your photo book?</em>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.80)", margin: "0 0 36px", lineHeight: 1.7, fontWeight: 400 }}>
              Join hundreds of customers across Nepal who have turned their memories into beautiful books with BlushBook.
            </p>
            <button
              onClick={goRegister}
              style={{ background: "#fff", color: C.rose, border: "none", borderRadius: 100, padding: "16px 48px", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em", transition: "transform 0.15s, background 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: 52 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FEE"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get started — it's free
            </button>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginTop: 16, fontWeight: 400 }}>
              Free to design · Pay only when you order · eSewa & Khalti accepted
            </p>
          </div>
        </section>

        {/* ── TRUST BAR ────────────────────────────────── */}
        <section style={{ background: C.bg, padding: "56px 48px", borderTop: `1px solid ${C.line}` }} aria-label="Our promises">
          <div style={{ maxWidth: 1000, margin: "0 auto" }} className="lp-3col">
            {[
              { icon: <Truck size={22} color={C.rose} aria-hidden="true" />,       title: "Free Delivery",       desc: "All orders above Rs. 2,000 ship free anywhere in Nepal." },
              { icon: <ShieldCheck size={22} color={C.rose} aria-hidden="true" />, title: "100% Satisfaction",   desc: "Love your book or we'll reprint it or refund you." },
              { icon: <LifeBuoy size={22} color={C.rose} aria-hidden="true" />,    title: "Local Support",       desc: "Friendly support available in Nepali and English." },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${C.rose}12`, border: `1px solid ${C.rose}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: "#767676", lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────── */}
        <footer style={{ background: "#0A0A0A", color: "#fff", padding: "0 48px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            {/* Newsletter */}
            <div style={{ borderBottom: "1px solid #1E1E1E", padding: "48px 0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.rose, margin: "0 0 8px" }}>Stay in the loop</p>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>Get early access & offers</h3>
              </div>
              <form
                onSubmit={e => e.preventDefault()}
                style={{ display: "flex", gap: 0, flexShrink: 0 }}
                aria-label="Newsletter signup"
              >
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email address"
                  autoComplete="email"
                  style={{ background: "#161616", border: "1px solid #2A2A2A", borderRight: "none", borderRadius: "100px 0 0 100px", padding: "12px 20px", fontSize: 14, color: "#fff", outline: "none", width: 240, fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: 48 }}
                />
                <button
                  type="submit"
                  style={{ background: C.rose, color: "#fff", border: "none", borderRadius: "0 100px 100px 0", padding: "12px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background 0.2s", whiteSpace: "nowrap", minHeight: 48 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.roseHov}
                  onMouseLeave={e => e.currentTarget.style.background = C.rose}
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Columns */}
            <div className="lp-footer-grid" style={{ padding: "44px 0 40px" }}>
              <div>
                <div style={{ marginBottom: 18 }}><Logo size={22} dark clickable={false} /></div>
                <p style={{ fontSize: 13.5, color: "#5A5A5A", maxWidth: 280, lineHeight: 1.8, margin: "0 0 24px", fontWeight: 400 }}>
                  Nepal's first AI-powered photo book platform. Upload your memories, let AI do the magic, get a beautiful printed book at your door.
                </p>
              </div>
              {[
                { heading: "Product",  links: ["How it works", "Templates", "AI Creator", "PDF Download", "Pricing"] },
                { heading: "Company",  links: ["About us", "Blog", "Contact", "Careers"] },
                { heading: "Support",  links: ["Help centre", "Order tracking", "Returns"] },
              ].map(col => (
                <div key={col.heading}>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, margin: "0 0 20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{col.heading}</h4>
                  <nav aria-label={`${col.heading} links`}>
                    {col.links.map(l => (
                      <p key={l} style={{ fontSize: 13.5, color: "#5A5A5A", margin: "0 0 12px", cursor: "pointer", transition: "color 0.18s", fontWeight: 400 }}
                        tabIndex={0} role="link"
                        onKeyDown={e => e.key === "Enter" && goRegister()}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "#5A5A5A"}
                      >{l}</p>
                    ))}
                    {col.heading === "Support" && (
                      <>
                        <Link to="/privacy" style={{ display: "block", fontSize: 13.5, color: "#5A5A5A", margin: "0 0 12px", textDecoration: "none" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                          onMouseLeave={e => e.currentTarget.style.color = "#5A5A5A"}
                        >Privacy policy</Link>
                        <Link to="/terms" style={{ display: "block", fontSize: 13.5, color: "#5A5A5A", margin: "0 0 12px", textDecoration: "none" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                          onMouseLeave={e => e.currentTarget.style.color = "#5A5A5A"}
                        >Terms</Link>
                      </>
                    )}
                  </nav>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: "1px solid #1A1A1A", padding: "20px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <p style={{ fontSize: 12, color: "#3A3A3A", margin: 0 }}>
                © {new Date().getFullYear()} blushbook<span style={{ color: C.rose }}>•</span> Nepal. All rights reserved.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11.5, color: "#3A3A3A", marginRight: 4 }}>Accepted payments</span>
                {[
                  { name: "eSewa",  bg: "#1A2E1A", color: "#4CAF50" },
                  { name: "Khalti", bg: "#1E1229", color: "#9C6FE4" },
                  { name: "Stripe", bg: "#111827", color: "#6B7FF0" },
                ].map(p => (
                  <span key={p.name} style={{ fontSize: 11, background: p.bg, color: p.color, padding: "4px 10px", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, border: `1px solid ${p.color}22` }}>
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