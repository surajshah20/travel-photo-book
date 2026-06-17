const db = require("../db");
const crypto = require("crypto");
const axios = require("axios");
const cloudinary = require("../config/cloudinary"); // ✅ Import your secure cloudinary config
const {
  sendOrderConfirmation,
  sendAdminOrderAlert,
} = require("../services/emailService");

// ─── Pricing Configuration ────────────────────────────────
const PRICING = {
  journal: 2499,
  scrapbook: 2999,
  hardcover: 4499,
  luxury: 6499,
  default: 2999,
};

// ─── Helper: Create Order Record ──────────────────────────
const createOrderRecord = async ({
  userId, bookId, bookType, paymentMethod, shippingData, paymentRef, paymentProofUrl = null
}) => {
  const amountNpr = (PRICING[bookType] || PRICING.default) + 150; // Add 150 shipping
  const amountPaisa = amountNpr * 100;

  const result = await db.query(
    `INSERT INTO orders (
      user_id, book_id, book_type, amount, amount_npr, currency,
      payment_method, payment_ref, payment_status, order_status,
      shipping_name, shipping_phone, shipping_address,
      shipping_city, shipping_district, shipping_province, shipping_notes, payment_proof_url
    ) VALUES (
      $1,$2,$3,$4,$5,'NPR',
      $6,$7,'pending','pending',
      $8,$9,$10,$11,$12,$13,$14,$15
    ) RETURNING *`,
    [
      userId, bookId, bookType, amountPaisa, amountNpr,
      paymentMethod, paymentRef,
      shippingData.name, shippingData.phone, shippingData.address,
      shippingData.city, shippingData.district,
      shippingData.province, shippingData.notes || null,
      paymentProofUrl
    ]
  );
  return result.rows[0];
};

// ─── 0. Secure Receipt Upload (NEW) ───────────────────────
exports.uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No receipt file provided." });
    }

    // Convert memory buffer to Base64 to send to Cloudinary safely
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    // Secure server-to-server upload (Bypasses frontend exposure)
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "blushbook_receipts",
      resource_type: "auto",
    });

    res.json({ secure_url: uploadResponse.secure_url });
  } catch (err) {
    console.error("Receipt Upload Error:", err);
    res.status(500).json({ error: "Failed to upload receipt to secure storage." });
  }
};

// ─── 1. Cash on Delivery (COD) ────────────────────────────
exports.processCOD = async (req, res) => {
  const userId = req.user.id;
  const { bookId, shipping } = req.body;

  if (!bookId || !shipping?.name || !shipping?.phone || !shipping?.address) {
    return res.status(400).json({ error: "Missing required shipping fields" });
  }

  try {
    const bookRes = await db.query("SELECT * FROM books WHERE id = $1 AND user_id = $2", [bookId, userId]);
    if (!bookRes.rows.length) return res.status(404).json({ error: "Book not found" });

    const order = await createOrderRecord({
      userId, bookId, bookType: bookRes.rows[0].book_type,
      paymentMethod: "cod", shippingData: shipping, paymentRef: `COD-${Date.now()}`
    });

    await db.query("UPDATE orders SET order_status = 'processing' WHERE id = $1", [order.id]);
    await db.query("INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'processing', 'COD Order Placed')", [order.id]);
    await db.query("UPDATE books SET status = 'ordered', updated_at = NOW() WHERE id = $1", [bookId]);

    db.query("SELECT * FROM users WHERE id = $1", [userId]).then(userRes => {
      if (userRes.rows[0]) {
        sendOrderConfirmation(order, userRes.rows[0], bookRes.rows[0]).catch(e => console.error(e));
        sendAdminOrderAlert(order, userRes.rows[0], bookRes.rows[0]).catch(e => console.error(e));
      }
    });

    res.status(201).json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("COD Error:", err);
    res.status(500).json({ error: "Could not place order." });
  }
};

// ─── 2. eSewa Initiate ────────────────────────────────────
exports.esewaInitiate = async (req, res) => {
  const userId = req.user.id;
  const { bookId, shipping } = req.body;

  try {
    const bookRes = await db.query("SELECT * FROM books WHERE id = $1 AND user_id = $2", [bookId, userId]);
    if (!bookRes.rows.length) return res.status(404).json({ error: "Book not found" });

    const order = await createOrderRecord({
      userId, bookId, bookType: bookRes.rows[0].book_type,
      paymentMethod: "esewa", shippingData: shipping, paymentRef: "pending"
    });

    const transaction_uuid = `BB-${order.id}-${Date.now()}`;
    const merchantCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    
    const signatureString = `total_amount=${order.amount_npr},transaction_uuid=${transaction_uuid},product_code=${merchantCode}`;
    const signature = crypto.createHmac("sha256", secretKey).update(signatureString).digest("base64");

    await db.query("UPDATE orders SET payment_ref = $1 WHERE id = $2", [transaction_uuid, order.id]);

    res.json({
      paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      formData: {
        amount: order.amount_npr,
        tax_amount: "0",
        total_amount: order.amount_npr,
        transaction_uuid: transaction_uuid,
        product_code: merchantCode,
        product_delivery_charge: "0",
        product_service_charge: "0",
        success_url: `${process.env.API_URL || "http://localhost:5000"}/api/payments/esewa/verify`,
        failure_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/order/${bookId}?payment=failed`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
      }
    });
  } catch (err) {
    console.error("eSewa Init Error:", err);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

// ─── 3. eSewa Verify ──────────────────────────────────────
exports.esewaVerify = async (req, res) => {
  const { data } = req.query;
  if (!data) return res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);

  try {
    const decodedStr = Buffer.from(data, "base64").toString("utf-8");
    const esewaRes = JSON.parse(decodedStr);
    
    const orderId = esewaRes.transaction_uuid.split("-")[1];

    if (esewaRes.status !== "COMPLETE") {
      return res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);
    }

    const result = await db.query(
      `UPDATE orders SET payment_status = 'paid', payment_id = $1, payment_raw = $2, paid_at = NOW(), order_status = 'confirmed', updated_at = NOW() WHERE id = $3 RETURNING *`,
      [esewaRes.transaction_code, decodedStr, orderId]
    );

    const order = result.rows[0];
    await db.query("INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'confirmed', 'eSewa Payment Verified')", [orderId]);
    await db.query("UPDATE books SET status = 'ordered', updated_at = NOW() WHERE id = $1", [order.book_id]);

    db.query("SELECT * FROM users WHERE id = $1", [order.user_id]).then(userRes => {
      db.query("SELECT * FROM books WHERE id = $1", [order.book_id]).then(bookRes => {
        sendOrderConfirmation(order, userRes.rows[0], bookRes.rows[0]).catch(e => {});
        sendAdminOrderAlert(order, userRes.rows[0], bookRes.rows[0]).catch(e => {});
      });
    });

    res.redirect(`${process.env.CLIENT_URL}/orders?payment=success&orderId=${orderId}`);
  } catch (err) {
    console.error("eSewa Verify Error:", err);
    res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);
  }
};

// ─── 4. Khalti Initiate ───────────────────────────────────
exports.khaltiInitiate = async (req, res) => {
  const userId = req.user.id;
  const { bookId, shipping } = req.body;

  try {
    const userRes = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    const bookRes = await db.query("SELECT * FROM books WHERE id = $1 AND user_id = $2", [bookId, userId]);
    
    if (!bookRes.rows.length) return res.status(404).json({ error: "Book not found" });

    const order = await createOrderRecord({
      userId, bookId, bookType: bookRes.rows[0].book_type,
      paymentMethod: "khalti", shippingData: shipping, paymentRef: "pending"
    });

    const khaltiPayload = {
      return_url: `${process.env.API_URL || "http://localhost:5000"}/api/payments/khalti/verify`,
      website_url: process.env.CLIENT_URL || "http://localhost:5173",
      amount: order.amount,
      purchase_order_id: String(order.id),
      purchase_order_name: `BlushBook - ${bookRes.rows[0].title || 'Photo Book'}`,
      customer_info: {
        name: userRes.rows[0].name,
        email: userRes.rows[0].email,
        phone: shipping.phone
      }
    };

    const response = await axios.post("https://a.khalti.com/api/v2/epayment/initiate/", khaltiPayload, {
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    await db.query("UPDATE orders SET payment_ref = $1 WHERE id = $2", [response.data.pidx, order.id]);

    res.json({ paymentUrl: response.data.payment_url });
  } catch (err) {
    console.error("Khalti Init Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to initiate Khalti payment" });
  }
};

// ─── 5. Khalti Verify ─────────────────────────────────────
exports.khaltiVerify = async (req, res) => {
  const { pidx, purchase_order_id, status } = req.query;

  if (status === "User canceled") return res.redirect(`${process.env.CLIENT_URL}/orders?payment=cancelled`);
  if (!pidx || status !== "Completed") return res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);

  try {
    const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/", { pidx }, {
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (response.data.status !== "Completed") {
      return res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);
    }

    const result = await db.query(
      `UPDATE orders SET payment_status = 'paid', payment_id = $1, payment_raw = $2, paid_at = NOW(), order_status = 'confirmed', updated_at = NOW() WHERE id = $3 RETURNING *`,
      [response.data.transaction_id, JSON.stringify(response.data), purchase_order_id]
    );

    const order = result.rows[0];
    await db.query("INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'confirmed', 'Khalti Payment Verified')", [order.id]);
    await db.query("UPDATE books SET status = 'ordered', updated_at = NOW() WHERE id = $1", [order.book_id]);

    db.query("SELECT * FROM users WHERE id = $1", [order.user_id]).then(userRes => {
      db.query("SELECT * FROM books WHERE id = $1", [order.book_id]).then(bookRes => {
        sendOrderConfirmation(order, userRes.rows[0], bookRes.rows[0]).catch(e => {});
        sendAdminOrderAlert(order, userRes.rows[0], bookRes.rows[0]).catch(e => {});
      });
    });

    res.redirect(`${process.env.CLIENT_URL}/orders?payment=success&orderId=${order.id}`);
  } catch (err) {
    console.error("Khalti Verify Error:", err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/orders?payment=failed`);
  }
};

// ─── 6. Manual QR / Bank Transfer ─────────────────────────
exports.processQRTransfer = async (req, res) => {
  const userId = req.user.id;
  const { bookId, shipping, paymentProofUrl } = req.body;

  if (!bookId || !shipping?.name || !shipping?.phone || !shipping?.address || !paymentProofUrl) {
    return res.status(400).json({ error: "Missing required fields or payment receipt." });
  }

  try {
    const bookRes = await db.query("SELECT * FROM books WHERE id = $1 AND user_id = $2", [bookId, userId]);
    if (!bookRes.rows.length) return res.status(404).json({ error: "Book not found" });

    const order = await createOrderRecord({
      userId, bookId, bookType: bookRes.rows[0].book_type,
      paymentMethod: "qr_transfer", shippingData: shipping, paymentRef: `QR-${Date.now()}`,
      paymentProofUrl 
    });

    await db.query("UPDATE orders SET order_status = 'processing' WHERE id = $1", [order.id]);
    await db.query("INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'processing', 'QR Payment Receipt Uploaded')", [order.id]);
    await db.query("UPDATE books SET status = 'ordered', updated_at = NOW() WHERE id = $1", [bookId]);

    db.query("SELECT * FROM users WHERE id = $1", [userId]).then(userRes => {
      if (userRes.rows[0]) {
        sendOrderConfirmation(order, userRes.rows[0], bookRes.rows[0]).catch(e => console.error(e));
        sendAdminOrderAlert(order, userRes.rows[0], bookRes.rows[0]).catch(e => console.error(e));
      }
    });

    res.status(201).json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("QR Transfer Error:", err);
    res.status(500).json({ error: "Could not place order." });
  }
};