"use client";

import { useEffect, useState } from "react";

const LINK = "https://vt.tiktok.com/ZSxxxxxx/";

// Demo satu kali saat halaman dibuka: link masuk, bot mengetik, JSON keluar.
export default function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(4);
      return;
    }
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2700),
      setTimeout(() => setStep(4), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="demo" aria-label="Contoh percakapan bot dan respons API">
      <div className="bubble out">
        <span className="mono small">.tiktok {LINK}</span>
      </div>

      {step === 1 && (
        <div className="bubble in typing" aria-hidden="true">
          <i /><i /><i />
        </div>
      )}
      {step === 2 && (
        <div className="bubble in typing" aria-hidden="true">
          <i /><i /><i />
        </div>
      )}

      {step >= 3 && (
        <div className="bubble in">
          <div className="small muted">GET /api/v1/download/tiktok</div>
          <div>Video ditemukan, mengirim file...</div>
        </div>
      )}

      {step >= 4 && (
        <pre className="code" aria-label="Respons JSON">
{`{
  "status": true,
  "result": {
    "title": "Resep nasi goreng 5 menit",
    "author": { "username": "dapurmira" },
    "video": {
      "nowm": "https://...mp4",
      "hd": "https://...mp4"
    },
    "stats": { "plays": 18420 }
  }
}`}
        </pre>
      )}
    </div>
  );
}
