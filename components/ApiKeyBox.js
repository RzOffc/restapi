"use client";

import { useState } from "react";

export default function ApiKeyBox({ initialKey }) {
  const [key, setKey] = useState(initialKey);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(key);
      setMsg("API key disalin");
    } catch {
      setMsg("Gagal menyalin. Salin manual dari kolom di atas.");
    }
  }

  async function regenerate() {
    if (!confirm("Buat API key baru? Key lama langsung tidak berlaku dan bot yang memakainya perlu diperbarui.")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/me/apikey", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat key baru");
      setKey(data.apiKey);
      setShow(true);
      setMsg("API key baru dibuat");
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }

  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="apikey">API key</label>
        <input
          id="apikey"
          className="input mono"
          readOnly
          type={show ? "text" : "password"}
          value={key}
          onFocus={(e) => e.target.select()}
        />
      </div>
      <div className="row">
        <button className="btn sm" onClick={() => setShow((s) => !s)}>
          {show ? "Sembunyikan" : "Tampilkan"}
        </button>
        <button className="btn sm" onClick={copy}>Salin</button>
        <button className="btn sm danger" onClick={regenerate} disabled={busy}>
          Buat key baru
        </button>
      </div>
      {msg && <p className="small" role="status">{msg}</p>}
    </div>
  );
}
