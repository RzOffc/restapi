import Link from "next/link";
import { PLANS, PAID_PLANS } from "@/lib/plans";
import { rupiah, fmtDate } from "@/lib/format";
import BuyButton from "@/components/BuyButton";

// mode "public": tombol mengarah ke login. mode "app": tombol membuat pesanan.
export default function PlanTable({ mode = "public", role = "free", expiresAt = null }) {
  return (
    <div className="plans">
      {Object.values(PLANS).map((p) => {
        const isCurrent = mode === "app" && role === p.id;
        const paid = PAID_PLANS.includes(p.id);

        let action;
        if (!paid) {
          action = mode === "app"
            ? <span className="muted small">{isCurrent ? "Role kamu sekarang" : "Role bawaan setelah masa aktif habis"}</span>
            : <Link href="/login" className="btn">Mulai gratis</Link>;
        } else if (mode === "public") {
          action = <Link href="/login" className={`btn ${p.featured ? "primary" : ""}`}>Masuk untuk beli</Link>;
        } else {
          const label = isCurrent
            ? `Perpanjang ${p.days} hari`
            : role !== "free"
              ? `Ganti ke ${p.name}`
              : `Beli ${p.name}`;
          action = (
            <>
              <BuyButton plan={p.id} label={label} primary={p.featured || isCurrent} />
              {isCurrent && expiresAt && (
                <span className="muted small">Aktif sampai {fmtDate(expiresAt)}</span>
              )}
              {!isCurrent && role !== "free" && (
                <span className="muted small">Sisa masa aktif role lama tidak dibawa.</span>
              )}
            </>
          );
        }

        return (
          <section key={p.id} className={`plan ${p.featured ? "featured" : ""}`}>
            <div className="row spread">
              <h3>{p.name}</h3>
              {isCurrent && <span className={`badge ${p.id}`}>Aktif</span>}
            </div>
            <div className="price">
              {p.price === 0 ? "Gratis" : rupiah(p.price)}
              {p.days && <small> / {p.days} hari</small>}
            </div>
            <ul>
              {p.perks.map((perk) => <li key={perk}>{perk}</li>)}
            </ul>
            <div className="stack">{action}</div>
          </section>
        );
      })}
    </div>
  );
}
