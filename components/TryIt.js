"use client";

import { useState } from "react";

// Coba endpoint langsung dari halaman dokumentasi.
export default function TryIt({ endpoint, defaultKey }) {
  const [key, setKey] = useState(defaultKey || "");
  const [values, setValues] = useState(
    Object.fromEntries(endpoint.params.map((p) => [p.name, ""]))
  );
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOut(null);
    const qs = new URLSearchParams();
    for (const p of endpoint.params) if (values[p.name]) qs.set(p.name, values[p.name]);
    const started = performance.now();
    try {
      const res = await fetch(`${endpoint.path}${qs.toString() ? "?" + qs : ""}`, {
        headers: key ? { "x-api-key": key } : {},
      });
      const text = await res.text();
      let body = text;
      try { body = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setOut({ code: res.status, ms: Math.round(performance.now() - started), body });
    } catch (e) {
      setOut({ code: 0, ms: 0, body: `Gagal terhubung: ${e.message}` });
    }
    setLoading(false);
  }

  return (
    <div className="stack">
      <div className="field">
        <label htmlFor={`key-${endpoint.id}`}>API key</label>
        <input
          id={`key-${endpoint.id}`}
          className="input mono"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="kr_..."
          autoComplete="off"
        />
      </div>
      {endpoint.params.map((p) => (
        <div className="field" key={p.name}>
          <label htmlFor={`${endpoint.id}-${p.name}`}>
            {p.name}{p.required ? " (wajib)" : ""}
          </label>
          <input
            id={`${endpoint.id}-${p.name}`}
            className="input"
            value={values[p.name]}
            onChange={(e) => setValues({ ...values, [p.name]: e.target.value })}
            placeholder={p.example}
          />
        </div>
      ))}
      <div className="row">
        <button className="btn primary sm" onClick={run} disabled={loading}>
          {loading ? "Mengirim..." : "Kirim request"}
        </button>
        {out && (
          <span className="small muted">
            Status {out.code || "error"} · {out.ms} ms
          </span>
        )}
      </div>
      {out && <pre className="code" style={{ maxHeight: 360 }}>{out.body}</pre>}
    </div>
  );
}
