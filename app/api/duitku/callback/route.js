import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyCallbackSignature } from "@/lib/duitku";
import { fulfillOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Duitku memanggil URL ini (POST, form-urlencoded) setelah pembayaran.
export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const merchantCode = String(form.get("merchantCode") || "");
  const amount = String(form.get("amount") || "");
  const merchantOrderId = String(form.get("merchantOrderId") || "");
  const resultCode = String(form.get("resultCode") || "");
  const signature = String(form.get("signature") || "");

  if (!merchantOrderId || !verifyCallbackSignature({ merchantCode, amount, merchantOrderId, signature })) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 400 });
  }

  const rows = await sql`select amount from orders where id = ${merchantOrderId}`;
  if (!rows.length) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  if (String(rows[0].amount) !== String(parseInt(amount, 10))) {
    return NextResponse.json({ error: "Nominal tidak cocok" }, { status: 400 });
  }

  if (resultCode === "00") await fulfillOrder(merchantOrderId);
  return NextResponse.json({ ok: true });
}
