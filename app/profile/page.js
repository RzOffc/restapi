import Link from "next/link";
import { requireUser } from "@/lib/user";
import { sql } from "@/lib/db";
import { PLANS, currentRole } from "@/lib/plans";
import { fmtDate, rupiah } from "@/lib/format";
import ApiKeyBox from "@/components/ApiKeyBox";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const role = currentRole(user);
  const plan = PLANS[role];

  const usage = await sql`
    select day::text as day, count from usage
    where user_id = ${user.id} order by day desc limit 7
  `;
  const orders = await sql`
    select id, plan, amount, status, created_at, paid_at, payment_method
    from orders where user_id = ${user.id} order by created_at desc limit 20
  `;

  return (
    <div className="wrap">
      <div className="page-head">
        <h1 style={{ fontSize: "2.2rem" }}>Profile</h1>
      </div>

      <div className="grid-2" style={{ marginTop: 16, alignItems: "start" }}>
        <div className="panel stack">
          <div className="row">
            {user.image && <img className="avatar" src={user.image} alt="" referrerPolicy="no-referrer" />}
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div className="muted small">{user.email}</div>
            </div>
          </div>
          <div className="row">
            <span className={`badge ${role}`}>{plan.name}</span>
            <span className="muted small">
              {role === "free" ? "Tanpa masa aktif" : `Aktif sampai ${fmtDate(user.role_expires_at, true)}`}
            </span>
          </div>
          <p className="muted small">Bergabung {fmtDate(user.created_at)}</p>
          <Link href="/plans" className="btn sm" style={{ width: "fit-content" }}>
            {role === "free" ? "Beli role" : "Perpanjang role"}
          </Link>
        </div>

        <div className="panel">
          <ApiKeyBox initialKey={user.api_key} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Pemakaian 7 hari terakhir</h2>
        {usage.length === 0 ? (
          <p className="muted" style={{ marginTop: 10 }}>
            Belum ada request. Coba panggil endpoint dari halaman <Link href="/docs">Dokumentasi</Link>.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead><tr><th>Tanggal (WIB)</th><th>Request</th></tr></thead>
              <tbody>
                {usage.map((u) => (
                  <tr key={u.day}><td>{fmtDate(u.day)}</td><td>{u.count.toLocaleString("id-ID")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Riwayat pesanan</h2>
        {orders.length === 0 ? (
          <p className="muted" style={{ marginTop: 10 }}>
            Belum ada pesanan. <Link href="/plans">Pilih plan role</Link> untuk mulai.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr><th>Tanggal</th><th>Role</th><th>Total</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{fmtDate(o.created_at, true)}</td>
                    <td>{PLANS[o.plan]?.name || o.plan}</td>
                    <td>{rupiah(o.amount)}</td>
                    <td>
                      <span className={`badge ${o.status}`}>
                        {o.status === "paid" ? "Lunas" : "Menunggu bayar"}
                      </span>
                    </td>
                    <td>
                      {o.status === "pending" && <Link href={`/pay/${o.id}`}>Lanjut bayar</Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
