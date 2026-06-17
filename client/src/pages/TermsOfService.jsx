// client/src/pages/TermsOfService.jsx
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1C1C1C", lineHeight: 1.7 }}>
      <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#C8345A", cursor: "pointer", marginBottom: 32, fontSize: 14, fontWeight: 600 }}>
        ← Back to home
      </button>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: "#888", marginBottom: 32, fontSize: 14 }}>Last updated: June 17, 2026</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Acceptance of terms</h2>
      <p>By creating an account or placing an order on getblushbook.com, you agree to these Terms of Service. If you do not agree, please do not use BlushBook.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Our service</h2>
      <p>BlushBook lets you upload photos, design a custom photo book using our editor and AI tools, and order a printed copy for delivery within Nepal.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Your account</h2>
      <p>You are responsible for keeping your account credentials secure and for all activity under your account. You may sign up directly or via Google sign-in.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Your content</h2>
      <p>You retain ownership of the photos and content you upload. By uploading photos, you confirm you have the right to use them and to have them printed, and you grant BlushBook a limited license to use them solely to produce your order.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Orders and payment</h2>
      <p>Prices are shown at checkout and may vary based on size, page count, and cover type. Payments are processed via eSewa, Khalti, or Stripe. Orders are confirmed once payment is successfully received.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Delivery</h2>
      <p>Standard delivery within Nepal takes approximately 5–10 business days from order confirmation. Delivery times are estimates and may vary due to factors outside our control.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Returns and quality guarantee</h2>
      <p>If your order arrives damaged or defective, contact us with photos of the issue and we will reprint and reship at no additional cost.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>8. Limitation of liability</h2>
      <p>BlushBook provides its service on an "as is" basis. To the extent permitted by law, we are not liable for indirect or incidental damages arising from use of our service.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>9. Changes to these terms</h2>
      <p>We may update these Terms from time to time. Continued use of BlushBook after changes take effect constitutes acceptance of the updated Terms.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>10. Contact us</h2>
      <p>Questions about these Terms can be sent to <a href="mailto:surajiscoding@gmail.com" style={{ color: "#C8345A" }}>surajiscoding@gmail.com</a>.</p>
    </div>
  );
};

export default TermsOfService;