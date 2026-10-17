import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import HeroDemo from "@/components/HeroDemo";
import PlanTable from "@/components/PlanTable";
import { ENDPOINTS } from "@/lib/endpoints";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <div className="wrap hero">
        <div>
          <h1>Kirim link, terima JSON. Bot WhatsApp-mu tinggal membalas.</h1>
          <p className="lead">
            REST API downloader yang siap dipanggil dari Baileys atau library bot apa pun.
            Daftar dengan Google, ambil API key, bayar role lewat QRIS, e-wallet, atau transfer bank.
          </p>
          <div className="row">
            <Link href="/login" className="btn primary">Masuk dengan Google</Link>
            <Link href="/docs" className="btn">Lihat dokumentasi</Link>
          </div>
        </div>
        <HeroDemo />
      </div>

      <section className="wrap section">
        <h2>Endpoint yang tersedia</h2>
        <div className="panel table-wrap" style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr><th>Endpoint</th><th>Fungsi</th></tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.id}>
                  <td><span className="method">{e.method}</span><code>{e.path}</code></td>
                  <td>{e.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wrap section">
        <h2>Pilih role sesuai kebutuhan bot</h2>
        <p className="muted" style={{ margin: "8px 0 24px" }}>
          Semua role memakai endpoint yang sama. Bedanya hanya limit request per hari.
        </p>
        <PlanTable mode="public" />
      </section>

      <section className="wrap section">
        <h2>Pertanyaan umum</h2>
        <div style={{ marginTop: 16, maxWidth: 720 }}>
          <details>
            <summary>Bagaimana cara mulai?</summary>
            <p>Masuk dengan akun Google, salin API key di halaman Profile, lalu panggil endpoint dengan header x-api-key. Role Free langsung aktif tanpa bayar.</p>
          </details>
          <details>
            <summary>Metode pembayaran apa saja yang bisa dipakai?</summary>
            <p>QRIS, e-wallet (OVO, DANA, ShopeePay, LinkAja), dan virtual account berbagai bank. Role aktif otomatis begitu pembayaran terkonfirmasi.</p>
          </details>
          <details>
            <summary>Apa yang terjadi saat masa aktif role habis?</summary>
            <p>Akun kembali ke role Free dan API key tetap sama. Perpanjang sebelum habis agar masa aktifnya disambung.</p>
          </details>
        </div>
      </section>
    </>
  );
}
