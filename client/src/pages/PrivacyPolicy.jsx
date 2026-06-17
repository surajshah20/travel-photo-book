// client/src/pages/PrivacyPolicy.jsx
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1C1C1C", lineHeight: 1.7 }}>
      <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#C8345A", cursor: "pointer", marginBottom: 32, fontSize: 14, fontWeight: 600 }}>
        ← Back to home
      </button>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#888", marginBottom: 32, fontSize: 14 }}>Last updated: June 17, 2026</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Who we are</h2>
      <p>BlushBook ("we," "us," "our") operates getblushbook.com, an AI-assisted photo book design and printing service based in Nepal. This policy explains what information we collect, how we use it, and the choices you have.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Information we collect</h2>
      <p>When you create an account, sign in with Google, design a photo book, or place an order, we may collect: your name, email address, and profile photo (from Google sign-in, if you use it); the photos you upload to create your book; your delivery address and phone number; payment confirmation details from eSewa, Khalti, or Stripe (we do not store your full card or wallet credentials ourselves — these are processed directly by our payment providers); and basic usage data such as device type, browser, and pages visited, to help us improve the service.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. How we use your information</h2>
      <p>We use your information to create your account, generate and print your photo book, process payments, deliver your order, communicate with you about your order or account, and improve our products. We do not sell your personal information to third parties.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Google sign-in</h2>
      <p>If you choose to sign in with Google, we receive your name, email address, and profile picture from Google to create and authenticate your BlushBook account. We do not access your Gmail, Google Drive, or other Google data beyond this basic profile information.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Your uploaded photos</h2>
      <p>Photos you upload are used solely to create the photo book(s) you design and order. We do not use your photos for advertising, share them with third parties for marketing purposes, or claim ownership over them.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Data sharing</h2>
      <p>We share information only with service providers who help us operate BlushBook — for example, payment processors (eSewa, Khalti, Stripe), printing and delivery partners, and hosting providers — and only to the extent necessary to provide our service to you.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Data retention</h2>
      <p>We retain your account information and order history for as long as your account is active, or as needed to comply with legal and tax obligations. You may request deletion of your account and associated data by contacting us.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>8. Your rights</h2>
      <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us at the email below.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>9. Contact us</h2>
      <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:surajiscoding@gmail.com" style={{ color: "#C8345A" }}>surajiscoding@gmail.com</a>.</p>
    </div>
  );
};

export default PrivacyPolicy;