import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/user";
import { reconcileOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Status pesanan (dipanggil berkala oleh halaman pembayaran).
export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const rows = await sql`select * from orders where id = ${id} and user_id = ${user.id}`;
  if (!rows.length) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  const order = await reconcileOrder(rows[0]);
  return NextResponse.json({ status: order.status, expiresAt: order.expires_at });
}
