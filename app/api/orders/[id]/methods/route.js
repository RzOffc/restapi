import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/user";
import { getPaymentMethods, METHOD_GROUPS } from "@/lib/duitku";

export const dynamic = "force-dynamic";

// Daftar metode pembayaran (bank, e-wallet, QRIS) dari Duitku untuk nominal pesanan.
export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const rows = await sql`select amount, status from orders where id = ${id} and user_id = ${user.id}`;
  if (!rows.length) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  try {
    const grouped = await getPaymentMethods(rows[0].amount);
    const groups = Object.entries(METHOD_GROUPS).map(([kind, g]) => ({
      kind,
      label: g.label,
      methods: grouped[kind],
    }));
    return NextResponse.json({ groups });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
