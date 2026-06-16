// server/services/emailService.js
// Production email service — swap SMTP for Resend/SES in production

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Base Template ────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlushBook Nepal</title>
</head>
<body style="margin:0;padding:0;background:#F9F9F9;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        
        <!-- Logo -->
        <tr><td style="padding:0 0 24px;">
          <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#0F0F0F;">
            blushbook<span style="color:#C8345A;">•</span>
          </p>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#fff;border-radius:20px;border:1px solid #EBEBEB;overflow:hidden;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9A9A9A;line-height:1.6;">
            BlushBook Nepal · Kathmandu, Nepal<br>
            Questions? <a href="mailto:support@blushbook.com.np" style="color:#C8345A;text-decoration:none;">support@blushbook.com.np</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Order Confirmation Email ─────────────────────────────
const sendOrderConfirmation = async (order, user, book) => {
  const statusColor = "#16A34A";
  const html = baseTemplate(`
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#C8345A,#E11D48);padding:32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Order Confirmed</p>
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em;">
        Your book is on its way! 📚
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 20px;font-size:15px;color:#3D3D3D;line-height:1.7;">
        Hi ${user.name?.split(" ")[0]},<br><br>
        Thank you for your order. We've received your payment and your photo book is now in the print queue. 
        We'll notify you when it ships.
      </p>

      <!-- Order summary box -->
      <div style="background:#F9F9F9;border-radius:14px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:0 0 12px;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9A9A9A;">Order Details</p>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #EBEBEB;">
              <table width="100%"><tr>
                <td style="font-size:13px;color:#6B6B6B;">Order Number</td>
                <td align="right" style="font-size:13px;font-weight:700;color:#0F0F0F;">#${String(order.id).padStart(5, "0")}</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #EBEBEB;">
              <table width="100%"><tr>
                <td style="font-size:13px;color:#6B6B6B;">Book</td>
                <td align="right" style="font-size:13px;font-weight:700;color:#0F0F0F;">${book.title}</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #EBEBEB;">
              <table width="100%"><tr>
                <td style="font-size:13px;color:#6B6B6B;">Payment Method</td>
                <td align="right" style="font-size:13px;font-weight:700;color:#0F0F0F;">${order.payment_method.toUpperCase()}</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <table width="100%"><tr>
                <td style="font-size:13px;color:#6B6B6B;">Amount Paid</td>
                <td align="right" style="font-size:15px;font-weight:800;color:#C8345A;">Rs. ${order.amount_npr}</td>
              </tr></table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Shipping -->
      <div style="background:#F9F9F9;border-radius:14px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9A9A9A;">Delivery Address</p>
        <p style="margin:0;font-size:13px;color:#3D3D3D;line-height:1.7;">
          ${order.shipping_name}<br>
          ${order.shipping_address}<br>
          ${order.shipping_city}, ${order.shipping_district}<br>
          ${order.shipping_province}<br>
          📞 ${order.shipping_phone}
        </p>
      </div>

      <!-- Timeline -->
      <div style="background:#FFF0F4;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #F9D0DA;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#C8345A;">What happens next?</p>
        ${["We print your book (1–2 business days)", "Quality check & packaging (1 day)", "Shipped via courier (3–7 business days)", "Delivered to your door!"].map((step, i) => `
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:${i < 3 ? "10px" : "0"};">
            <div style="width:22px;height:22px;background:#C8345A;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="color:#fff;font-size:11px;font-weight:800;">${i + 1}</span>
            </div>
            <p style="margin:0;font-size:13px;color:#6B3040;line-height:1.5;padding-top:2px;">${step}</p>
          </div>
        `).join("")}
      </div>

      <p style="margin:0;font-size:13px;color:#6B6B6B;line-height:1.7;">
        You can track your order status anytime from your 
        <a href="${process.env.CLIENT_URL}/orders" style="color:#C8345A;font-weight:600;text-decoration:none;">BlushBook dashboard</a>.
      </p>
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmed #${String(order.id).padStart(5, "0")} — BlushBook Nepal`,
    html,
  });
};

// ─── Shipping Update Email ────────────────────────────────
const sendShippingUpdate = async (order, user, trackingNumber) => {
  const html = baseTemplate(`
    <div style="background:linear-gradient(135deg,#2563EB,#1D4ED8);padding:32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Your Order Shipped</p>
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em;">It's on its way! 🚀</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 20px;font-size:15px;color:#3D3D3D;line-height:1.7;">
        Hi ${user.name?.split(" ")[0]},<br><br>
        Great news — your BlushBook photo book has been shipped and is on its way to you!
      </p>
      <div style="background:#EFF6FF;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #BFDBFE;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#2563EB;">Tracking Information</p>
        <p style="margin:0;font-size:18px;font-weight:800;color:#1D4ED8;letter-spacing:0.05em;">${trackingNumber}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#6B6B6B;">
          Order #${String(order.id).padStart(5, "0")} · Estimated delivery: 3–7 business days
        </p>
      </div>
      <p style="margin:0;font-size:13px;color:#6B6B6B;line-height:1.7;">
        Track your order from your 
        <a href="${process.env.CLIENT_URL}/orders" style="color:#C8345A;font-weight:600;text-decoration:none;">dashboard</a>.
      </p>
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Your BlushBook is Shipped! 🚀 — Order #${String(order.id).padStart(5, "0")}`,
    html,
  });
};

// ─── Admin New Order Alert ────────────────────────────────
const sendAdminOrderAlert = async (order, user, book) => {
  if (!process.env.ADMIN_EMAIL) return;

  const html = baseTemplate(`
    <div style="background:#0F0F0F;padding:24px;">
      <h2 style="margin:0;font-size:18px;font-weight:800;color:#fff;">New Order Received</h2>
    </div>
    <div style="padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ["Order ID", `#${String(order.id).padStart(5, "0")}`],
          ["Customer", `${user.name} (${user.email})`],
          ["Book", book.title],
          ["Amount", `Rs. ${order.amount_npr}`],
          ["Payment", order.payment_method.toUpperCase()],
          ["Payment ID", order.payment_id || "—"],
          ["Ship to", `${order.shipping_city}, ${order.shipping_district}`],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#6B6B6B;border-bottom:1px solid #EBEBEB;width:140px;">${label}</td>
            <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0F0F0F;border-bottom:1px solid #EBEBEB;">${value}</td>
          </tr>
        `).join("")}
      </table>
      <div style="margin-top:20px;">
        <a href="${process.env.CLIENT_URL}/admin" 
           style="display:inline-block;background:#C8345A;color:#fff;padding:12px 24px;border-radius:100px;font-size:13px;font-weight:700;text-decoration:none;">
          View in Admin Panel
        </a>
      </div>
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `New Order #${String(order.id).padStart(5, "0")} — Rs. ${order.amount_npr} — BlushBook`,
    html,
  });
};

module.exports = {
  sendOrderConfirmation,
  sendShippingUpdate,
  sendAdminOrderAlert,
};