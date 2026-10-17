import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/user";
import { PLANS, PAID_PLANS } from "@/lib/plans";
import { newOrderId } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Buat pesanan baru (beli atau perpanjang role).
export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const planId = body?.plan;
  if (!PAID_PLANS.includes(planId)) {
    return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
  }
  const plan = PLANS[planId];

  // Pakai ulang pesanan pending yang belum memilih metode bayar.
  const existing = await sql`
    select id from orders
    where user_id = ${user.id} and plan = ${planId} and status = 'pending'
      and reference is null and created_at > now() - interval '30 minutes'
    order by created_at desc limit 1
  `;
  if (existing.length) return NextResponse.json({ orderId: existing[0].id });

  const id = newOrderId();
  await sql`
    insert into orders (id, user_id, plan, amount, days)
    values (${id}, ${user.id}, ${planId}, ${plan.price}, ${plan.days})
  `;
  return NextResponse.json({ orderId: id });
}
