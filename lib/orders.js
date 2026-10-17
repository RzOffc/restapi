import { sql } from "@/lib/db";
import { checkTransaction } from "@/lib/duitku";

// Tandai order lunas dan aktifkan/perpanjang role. Aman dipanggil berulang (idempoten).
export async function fulfillOrder(orderId) {
  const rows = await sql`
    update orders set status = 'paid', paid_at = now()
    where id = ${orderId} and status <> 'paid'
    returning *
  `;
  if (!rows.length) return false;
  const order = rows[0];

  const [user] = await sql`select role, role_expires_at from users where id = ${order.user_id}`;
  const now = new Date();
  let start = now;
  // Perpanjang role yang sama: sambung dari tanggal berakhir.
  if (user.role === order.plan && user.role_expires_at && new Date(user.role_expires_at) > now) {
    start = new Date(user.role_expires_at);
  }
  const end = new Date(start.getTime() + order.days * 86400000);

  await sql`
    update users set role = ${order.plan}, role_expires_at = ${end.toISOString()}
    where id = ${order.user_id}
  `;
  return true;
}

// Cek ke Duitku untuk order yang masih pending (berguna kalau callback telat).
export async function reconcileOrder(order) {
  if (order.status !== "pending" || !order.reference) return order;
  try {
    const code = await checkTransaction(order.id);
    if (code === "00") {
      await fulfillOrder(order.id);
      return { ...order, status: "paid" };
    }
  } catch {
    // abaikan; status akan dicek lagi pada polling berikutnya
  }
  return order;
}

export function newOrderId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KR${Date.now()}${rand}`;
}
