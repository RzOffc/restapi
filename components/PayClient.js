"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

const rupiah = (n) => "Rp" + Number(n).toLocaleString("id-ID");

function Countdown({ expiresAt }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (left === null) return null;
  if (left === 0) return <span className="error">Waktu pembayaran habis. Buat pesanan baru.</span>;
  const m = Math.floor(left / 60000);
  const s = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return <span className="muted">Bayar dalam {m}:{s}</span>;
}

function QrImage({ value }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, { width: 480, margin: 1 }).then(setSrc).catch(() => setSrc(""));
  }, [value]);
  if (!src) return <p className="muted">Membuat kode QR...</p>;
  return <img className="qr" src={src} alt="Kode QRIS untuk pembayaran" />;
}

export default function PayClient({ initial }) {
  const [status, setStatus] = useState(initial.status);
  const [payment, setPayment] = useState(initial.paymentData);
  const [expiresAt, setExpiresAt] = useState(initial.expiresAt);

  const [groups, setGroups] = useState(null);
  const [tab, setTab] = useState("qris");
  const [picked, setPicked] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Muat daftar metode kalau belum memilih.
  useEffect(() => {
    if (payment || status === "paid") return;
    fetch(`/api/orders/${initial.id}/methods`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || "Gagal memuat metode pembayaran");
        setGroups(d.groups);
        const firstWithItems = d.groups.find((g) => g.methods.length > 0);
        if (firstWithItems) setTab(firstWithItems.kind);
      })
      .catch((e) => setError(e.message));
  }, [initial.id, payment, status]);

  // Cek status tiap 5 detik setelah ada tagihan.
  useEffect(() => {
    if (!payment || status === "paid") return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${initial.id}`);
        const d = await r.json();
        if (r.ok && d.status === "paid") setStatus("paid");
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [payment, status, initial.id]);

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/orders/${initial.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: picked }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal membuat pembayaran");
      setPayment(d.paymentData);
      setExpiresAt(d.expiresAt);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function chooseOther() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: initial.planId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal membuat pesanan baru");
      window.location.href = `/pay/${d.orderId}`;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const summary = (
    <div className="panel">
      <div className="row spread">
        <div>
          <div className="muted small">Pesanan</div>
          <div style={{ fontWeight: 600 }}>Role {initial.planName} · {initial.days} hari</div>
        </div>
        <div className="big">{rupiah(initial.amount)}</div>
      </div>
    </div>
  );

  if (status === "paid") {
    return (
      <div className="stack">
        {summary}
        <div className="panel stack">
          <span className="badge paid" style={{ width: "fit-content" }}>Lunas</span>
          <h2>Role {initial.planName} sudah aktif</h2>
          <p className="muted">Masa aktif {initial.days} hari sudah ditambahkan ke akunmu.</p>
          <div className="row">
            <Link href="/dashboard" className="btn primary">Ke beranda</Link>
            <Link href="/docs" className="btn">Buka dokumentasi</Link>
          </div>
        </div>
      </div>
    );
  }

  if (payment) {
    return (
      <div className="stack">
        {summary}
        <div className="panel stack">
          <div className="row spread">
            <h2 style={{ fontSize: "1.3rem" }}>
              {payment.kind === "bank" && "Transfer ke virtual account"}
              {payment.kind === "qris" && "Scan QRIS"}
              {payment.kind === "ewallet" && "Lanjutkan di aplikasi e-wallet"}
            </h2>
            {expiresAt && <Countdown expiresAt={expiresAt} />}
          </div>

          {payment.kind === "bank" && (
            <>
              <div className="va">{payment.vaNumber}</div>
              <div className="row">
                <button className="btn sm" onClick={() => copy(payment.vaNumber)}>
                  {copied ? "Tersalin" : "Salin nomor"}
                </button>
              </div>
              <p className="muted small">
                Transfer tepat {rupiah(initial.amount)} lewat ATM, m-banking, atau internet banking.
              </p>
            </>
          )}

          {payment.kind === "qris" && (
            <>
              {payment.qrString ? <QrImage value={payment.qrString} /> : <p className="error">QR tidak tersedia.</p>}
              <p className="muted small">Buka aplikasi bank atau e-wallet apa pun yang mendukung QRIS, lalu scan.</p>
            </>
          )}

          {payment.kind === "ewallet" && (
            <>
              {payment.paymentUrl ? (
                <a className="btn primary" href={payment.paymentUrl} target="_blank" rel="noopener noreferrer" style={{ width: "fit-content" }}>
                  Buka halaman pembayaran
                </a>
              ) : (
                <p className="error">Link pembayaran tidak tersedia.</p>
              )}
              <p className="muted small">Setelah membayar, kembali ke halaman ini. Status diperbarui otomatis.</p>
            </>
          )}

          <p className="muted small" role="status">Menunggu pembayaran. Halaman ini memeriksa status setiap 5 detik.</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div>
            <button className="btn sm" onClick={chooseOther} disabled={busy}>Pilih metode lain</button>
          </div>
        </div>
      </div>
    );
  }

  const active = groups?.find((g) => g.kind === tab);

  return (
    <div className="stack">
      {summary}
      <div className="panel stack">
        <h2 style={{ fontSize: "1.3rem" }}>Pilih metode pembayaran</h2>
        {!groups && !error && <p className="muted">Memuat metode pembayaran...</p>}
        {groups && (
          <>
            <div className="tabs" role="tablist">
              {groups.map((g) => (
                <button
                  key={g.kind}
                  role="tab"
                  className="tab"
                  aria-selected={tab === g.kind}
                  onClick={() => { setTab(g.kind); setPicked(""); }}
                >
                  {g.label}
                </button>
              ))}
            </div>
            {active && active.methods.length === 0 && (
              <p className="muted">Metode ini belum tersedia untuk akun merchant kamu.</p>
            )}
            <div className="methods">
              {active?.methods.map((m) => (
                <button
                  key={m.code}
                  className="method-btn"
                  aria-pressed={picked === m.code}
                  onClick={() => setPicked(m.code)}
                >
                  {m.image && <img src={m.image} alt="" />}
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <div>
          <button className="btn primary" onClick={pay} disabled={!picked || busy}>
            {busy ? "Membuat tagihan..." : `Bayar ${rupiah(initial.amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
