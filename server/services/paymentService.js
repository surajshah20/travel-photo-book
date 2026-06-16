// server/services/paymentService.js
// eSewa + Khalti production integration

const axios = require("axios");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

// ─── eSewa ────────────────────────────────────────────────
// Docs: https://developer.esewa.com.np/#/epay

const ESEWA_MERCHANT = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_SECRET   = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_BASE     = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np";

// Generate HMAC-SHA256 signature for eSewa v2
const generateEsewaSignature = (message) => {
  return crypto
    .createHmac("sha256", ESEWA_SECRET)
    .update(message)
    .digest("base64");
};

const createEsewaPayment = (order) => {
  const transactionUuid = `BB-${order.id}-${Date.now()}`;
  const amount = order.amount_npr.toString();
  const taxAmount = "0";
  const totalAmount = amount;
  const productCode = ESEWA_MERCHANT;

  // eSewa v2 signature: total_amount,transaction_uuid,product_code
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = generateEsewaSignature(message);

  return {
    transactionUuid,
    formData: {
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${process.env.APP_URL}/api/payments/esewa/verify`,
      failure_url: `${process.env.CLIENT_URL}/order/${order.book_id}?payment=failed`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    },
    paymentUrl: `${ESEWA_BASE}/api/epay/main/v2/form`,
  };
};

const verifyEsewaPayment = async (encodedData) => {
  try {
    // eSewa returns base64-encoded JSON
    const decoded = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));

    const {
      transaction_uuid,
      total_amount,
      transaction_code,
      status,
      signed_field_names,
      signature: receivedSignature,
    } = decoded;

    if (status !== "COMPLETE") {
      return { success: false, error: "Payment not completed", decoded };
    }

    // Verify signature
    const fields = signed_field_names.split(",");
    const message = fields.map(f => `${f}=${decoded[f]}`).join(",");
    const expectedSignature = generateEsewaSignature(message);

    if (expectedSignature !== receivedSignature) {
      return { success: false, error: "Signature mismatch", decoded };
    }

    return {
      success: true,
      transactionUuid: transaction_uuid,
      transactionCode: transaction_code,
      amount: total_amount,
      decoded,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ─── Khalti ───────────────────────────────────────────────
// Docs: https://docs.khalti.com/khalti-epayment/

const KHALTI_SECRET  = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE    = process.env.KHALTI_BASE_URL || "https://a.khalti.com";

const initiateKhaltiPayment = async (order, user) => {
  const purchaseOrderId = `BB-${order.id}-${Date.now()}`;

  const payload = {
    return_url: `${process.env.APP_URL}/api/payments/khalti/verify`,
    website_url: process.env.CLIENT_URL,
    amount: order.amount,              // in paisa (NPR × 100)
    purchase_order_id: purchaseOrderId,
    purchase_order_name: `BlushBook Photo Book #${order.id}`,
    customer_info: {
      name: user.name,
      email: user.email,
      phone: order.shipping_phone || "9800000000",
    },
    amount_breakdown: [
      { label: "Photo Book", amount: order.amount },
    ],
    product_details: [
      {
        identity: String(order.book_id),
        name: `BlushBook - ${order.book_type || "Photo Book"}`,
        total_price: order.amount,
        quantity: 1,
        unit_price: order.amount,
      },
    ],
  };

  const response = await axios.post(
    `${KHALTI_BASE}/api/v2/epayment/initiate/`,
    payload,
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    pidx: response.data.pidx,
    paymentUrl: response.data.payment_url,
    purchaseOrderId,
  };
};

const verifyKhaltiPayment = async (pidx) => {
  const response = await axios.post(
    `${KHALTI_BASE}/api/v2/epayment/lookup/`,
    { pidx },
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data;

  return {
    success: data.status === "Completed",
    pidx: data.pidx,
    transactionId: data.transaction_id,
    amount: data.total_amount,
    status: data.status,
    raw: data,
  };
};

module.exports = {
  createEsewaPayment,
  verifyEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
};