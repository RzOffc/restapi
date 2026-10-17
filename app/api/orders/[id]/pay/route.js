import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/user";
import { PLANS } from "@/lib/plans";
import { createInquiry, methodKind } from "@/lib/duitku";

export const dynamic = "force-dynamic";

// Buat transaksi di Duitku untuk metode yang dipilih.
export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const rows = await sql`select * from orders where id = ${id} and user_id = ${user.id}`;
  if (!rows.length) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  const order = rows[0];

  if (order.status === "paid") {
    return NextResponse.json({ error: "Pesanan sudah dibayar" }, { status: 400 });
  }
  if (order.reference) {
    return NextResponse.json({ error: "Metode pembayaran sudah dipilih" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const method = body?.method;
  const kind = methodKind(method);
  if (!kind) return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });

  try {
    const plan = PLANS[order.plan];
    const result = await createInquiry({
      orderId: order.id,
      amount: order.amount,
      method,
      productName: `Role ${plan.name} ${order.days} hari`,
      email: user.email,
      name: user.name,
    });

    const data = { kind, method, ...result };
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await sql`
      update orders
      set payment_method = ${method}, reference = ${result.reference},
          payment_data = ${JSON.stringify(data)}::jsonb, expires_at = ${expiresAt}
      where id = ${order.id}
    `;
    return NextResponse.json({ paymentData: data, expiresAt });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
