import { getUser } from "@/lib/user";
import { currentRole } from "@/lib/plans";
import PlanTable from "@/components/PlanTable";

export const metadata = { title: "Plan role" };
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await getUser();
  const role = user ? currentRole(user) : "free";

  return (
    <div className="wrap">
      <div className="page-head">
        <h1 style={{ fontSize: "2.2rem" }}>Plan role</h1>
        <p>
          Beli role baru atau perpanjang yang aktif. Perpanjangan role yang sama disambung dari tanggal berakhir,
          jadi sisa hari tidak hilang.
        </p>
      </div>
      <div style={{ marginTop: 24 }}>
        <PlanTable
          mode={user ? "app" : "public"}
          role={role}
          expiresAt={user?.role_expires_at || null}
        />
      </div>
      <p className="muted small" style={{ marginTop: 20 }}>
        Pembayaran lewat QRIS, e-wallet, atau transfer bank. Role aktif otomatis setelah pembayaran terkonfirmasi.
      </p>
    </div>
  );
}
