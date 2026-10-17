"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyButton({ plan, label, primary }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");
      router.push(`/pay/${data.orderId}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button className={`btn ${primary ? "primary" : ""}`} onClick={buy} disabled={loading}>
        {loading ? "Membuat pesanan..." : label}
      </button>
      {error && <p className="error small" role="alert">{error}</p>}
    </>
  );
}
