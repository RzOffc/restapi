import Link from "next/link";
import { requireUser } from "@/lib/user";
import { sql } from "@/lib/db";
import { PLANS, currentRole } from "@/lib/plans";
import { daysLeft, fmtDate, todayWIB } from "@/lib/format";

export const metadata = { title: "Beranda" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();
  const role = currentRole(user);
  const plan = PLANS[role];

  const [row] = await sql`select count from usage where user_id = ${user.id} and day = ${todayWIB()}`;
  const used = row?.count || 0;
  const pct = Math.min(100, Math.round((used / plan.dailyLimit) * 100));
  const left = role === "free" ? null : daysLeft(user.role_expires_at);
  const expiringSoon = left !== null && left <= 3;
  const wasPaid = user.role !== "free" && role === "free";

  return (
    <div className="wrap">
      <div className="page-head">
        <h1 style={{ fontSize: "2.2rem" }}>Halo, {user.name?.split(" ")[0] || "developer"}</h1>
        <p>Ringkasan akun dan pemakaian API kamu hari ini.</p>
      </div>

      {(expiringSoon || wasPaid) && (
        <div className="bubble notice" style={{ margin: "16px 0" }}>
          {wasPaid
            ? `Role ${PLANS[user.role]?.name || user.role} sudah berakhir. Akun kembali ke Free.`
            : `Role ${plan.name} berakhir ${left === 0 ? "hari ini" : `${left} hari lagi`}.`}{" "}
          <Link href="/plans">Perpanjang sekarang</Link>
        </div>
      )}

      <div className="grid-3" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="muted small">Role</div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="big">{plan.name}</span>
            <span className={`badge ${role}`}>{role === "free" ? "Bawaan" : "Aktif"}</span>
          </div>
          <p className="muted small" style={{ marginTop: 6 }}>
            {role === "free" ? "Tanpa masa aktif" : `Sampai ${fmtDate(user.role_expires_at)}`}
          </p>
        </div>
        <div className="panel">
          <div className="muted small">Request hari ini</div>
          <div className="big" style={{ marginTop: 6 }}>
            {used.toLocaleString("id-ID")}
            <span className="muted small"> / {plan.dailyLimit.toLocaleString("id-ID")}</span>
          </div>
          <div className="meter" style={{ marginTop: 10 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="panel">
          <div className="muted small">API key</div>
          <p className="mono" style={{ marginTop: 10, wordBreak: "break-all" }}>
            {user.api_key.slice(0, 7)}••••••••••••
          </p>
          <Link href="/profile" className="small">Lihat dan salin di Profile</Link>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1.3rem" }}>Mulai dari sini</h2>
        <div className="row" style={{ marginTop: 14 }}>
          <Link href="/docs" className="btn">Baca dokumentasi</Link>
          <Link href="/plans" className="btn primary">Lihat plan role</Link>
          <Link href="/profile" className="btn">Buka profile</Link>
        </div>
      </div>
    </div>
  );
}
