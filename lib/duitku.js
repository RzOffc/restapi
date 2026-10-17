import crypto from "crypto";
import { siteUrl } from "@/lib/config";

const BASE =
  process.env.DUITKU_ENV === "production"
    ? "https://passport.duitku.com/webapi/api/merchant"
    : "https://sandbox.duitku.com/webapi/api/merchant";

const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

function creds() {
  const merchantCode = process.env.DUITKU_MERCHANT_CODE;
  const apiKey = process.env.DUITKU_API_KEY;
  if (!merchantCode || !apiKey) {
    throw new Error("DUITKU_MERCHANT_CODE / DUITKU_API_KEY belum diset");
  }
  return { merchantCode, apiKey };
}

// Kode metode Duitku yang ditampilkan. Tambah/kurangi sesuai kebutuhan.
export const METHOD_GROUPS = {
  bank: {
    label: "Transfer bank",
    codes: ["BC", "M2", "VA", "I1", "B1", "BT", "A1", "AG", "NC", "BR", "S1", "DM", "BV"],
  },
  ewallet: { label: "E-wallet", codes: ["OV", "SA", "DA", "LA"] },
  qris: { label: "QRIS", codes: ["SP", "NQ", "GQ", "SQ"] },
};

export function methodKind(code) {
  for (const [kind, g] of Object.entries(METHOD_GROUPS)) {
    if (g.codes.includes(code)) return kind;
  }
  return null;
}

function nowWIB() {
  // yyyy-MM-dd HH:mm:ss dalam WIB
  return new Date(Date.now() + 7 * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Respons Duitku tidak valid (${res.status})`);
  }
}

export async function getPaymentMethods(amount) {
  const { merchantCode, apiKey } = creds();
  const datetime = nowWIB();
  const data = await post("/paymentmethod/getpaymentmethod", {
    merchantcode: merchantCode,
    amount,
    datetime,
    signature: sha256(merchantCode + amount + datetime + apiKey),
  });
  if (data.responseCode !== "00") {
    throw new Error(data.responseMessage || "Gagal mengambil metode pembayaran");
  }
  const list = data.paymentFee || [];
  const grouped = { bank: [], ewallet: [], qris: [] };
  for (const m of list) {
    const kind = methodKind(m.paymentMethod);
    if (!kind) continue;
    grouped[kind].push({
      code: m.paymentMethod,
      name: m.paymentName,
      image: m.paymentImage,
    });
  }
  return grouped;
}

export async function createInquiry({ orderId, amount, method, productName, email, name }) {
  const { merchantCode, apiKey } = creds();
  const customerName = (name || email.split("@")[0]).slice(0, 20);
  const data = await post("/v2/inquiry", {
    merchantCode,
    paymentAmount: amount,
    paymentMethod: method,
    merchantOrderId: orderId,
    productDetails: productName,
    email,
    customerVaName: customerName,
    callbackUrl: `${siteUrl()}/api/duitku/callback`,
    returnUrl: `${siteUrl()}/pay/${orderId}`,
    expiryPeriod: 60,
    signature: md5(merchantCode + orderId + amount + apiKey),
    customerDetail: {
      firstName: customerName,
      lastName: "",
      email,
    },
    itemDetails: [{ name: productName, price: amount, quantity: 1 }],
  });
  if (data.statusCode !== "00") {
    throw new Error(data.statusMessage || data.Message || "Gagal membuat pembayaran");
  }
  return {
    reference: data.reference,
    paymentUrl: data.paymentUrl || null,
    vaNumber: data.vaNumber || null,
    qrString: data.qrString || null,
  };
}

// 00 = sukses, 01 = menunggu, 02 = dibatalkan
export async function checkTransaction(orderId) {
  const { merchantCode, apiKey } = creds();
  const data = await post("/transactionStatus", {
    merchantCode,
    merchantOrderId: orderId,
    signature: md5(merchantCode + orderId + apiKey),
  });
  return data.statusCode;
}

export function verifyCallbackSignature({ merchantCode, amount, merchantOrderId, signature }) {
  const { apiKey, merchantCode: mine } = creds();
  if (merchantCode !== mine) return false;
  const expected = md5(merchantCode + amount + merchantOrderId + apiKey);
  return expected === signature;
}
