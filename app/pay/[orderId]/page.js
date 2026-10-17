import { notFound } from "next/navigation";
import { requireUser } from "@/lib/user";
import { sql } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { reconcileOrder } from "@/lib/orders";
import PayClient from "@/components/PayClient";

export const metadata = { title: "Pembayaran" };
export const dynamic = "force-dynamic";

export default async function PayPage({ params }) {
  const { orderId } = await params;
  const user = await requireUser();

  const rows = await sql`select * from orders where id = ${orderId} and user_id = ${user.id}`;
  if (!rows.length) notFound();
  const order = await reconcileOrder(rows[0]);
  const plan = PLANS[order.plan];

  const initial = {
    id: order.id,
    planId: order.plan,
    planName: plan?.name || order.plan,
    days: order.days,
    amount: order.amount,
    status: order.status,
    paymentData: order.payment_data || null,
    expiresAt: order.expires_at ? new Date(order.expires_at).toISOString() : null,
  };

  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      <div className="page-head">
        <h1 style={{ fontSize: "2.2rem" }}>Pembayaran</h1>
      </div>
      <PayClient initial={initial} />
    </div>
  );
}
