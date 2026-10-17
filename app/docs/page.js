import Link from "next/link";
import { getUser } from "@/lib/user";
import { siteUrl } from "@/lib/config";
import { ENDPOINTS, ERRORS } from "@/lib/endpoints";
import { PLANS } from "@/lib/plans";
import TryIt from "@/components/TryIt";

export const metadata = { title: "Dokumentasi" };
export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const user = await getUser();
  const base = siteUrl();
  const first = ENDPOINTS[0];

  const curl = `curl "${base}${first.path}?url=LINK_TIKTOK" \\
  -H "x-api-key: API_KEY_KAMU"`;

  const node = `const BASE = "${base}";

async function tiktok(link) {
  const res = await fetch(
    \`\${BASE}/api/v1/download/tiktok?url=\${encodeURIComponent(link)}\`,
    { headers: { "x-api-key": process.env.KURIR_API_KEY } }
  );
  const data = await res.json();
  if (!data.status) throw new Error(data.message);
  return data.result;
}

// Contoh di bot Baileys
const r = await tiktok(link);
await sock.sendMessage(jid, { video: { url: r.video.nowm }, caption: r.title });`;

  return (
    <div className="wrap">
      <div className="page-head">
        <h1 style={{ fontSize: "2.2rem" }}>Dokumentasi</h1>
        <p>Semua endpoint memakai metode GET dan mengembalikan JSON.</p>
      </div>

      <div className="docs">
        <nav className="docs-side" aria-label="Isi dokumentasi">
          <a href="#mulai">Mulai cepat</a>
          <a href="#autentikasi">Autentikasi</a>
          <a href="#limit">Limit</a>
          {ENDPOINTS.map((e) => (
            <a key={e.id} href={`#${e.id}`}>{e.title}</a>
          ))}
          <a href="#error">Kode error</a>
        </nav>

        <div>
          <section id="mulai" className="panel endpoint stack">
            <h2>Mulai cepat</h2>
            <p>
              Base URL: <code className="inline-code">{base}</code>
            </p>
            <pre className="code">{curl}</pre>
            <pre className="code">{node}</pre>
            {!user && (
              <p className="muted small">
                Belum punya API key? <Link href="/login">Masuk dengan Google</Link> untuk mendapatkannya.
              </p>
            )}
          </section>

          <section id="autentikasi" className="panel endpoint stack">
            <h2>Autentikasi</h2>
            <p>
              Kirim API key lewat header <code className="inline-code">x-api-key</code>, atau parameter
              query <code className="inline-code">apikey</code>. Header lebih disarankan karena query bisa
              tercatat di log.
            </p>
            <p>Respons sukses selalu berbentuk <code className="inline-code">{`{ "status": true, "result": ... }`}</code>, respons gagal <code className="inline-code">{`{ "status": false, "message": "..." }`}</code>.</p>
          </section>

          <section id="limit" className="panel endpoint stack">
            <h2>Limit harian</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Role</th><th>Request per hari</th></tr></thead>
                <tbody>
                  {Object.values(PLANS).map((p) => (
                    <tr key={p.id}><td>{p.name}</td><td>{p.dailyLimit.toLocaleString("id-ID")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">
              Sisa limit ada di header <code className="inline-code">X-RateLimit-Remaining</code>. Reset jam 00.00 WIB.
            </p>
          </section>

          {ENDPOINTS.map((e) => (
            <section key={e.id} id={e.id} className="panel endpoint stack">
              <h2>{e.title}</h2>
              <p><span className="method">{e.method}</span><code>{e.path}</code></p>
              <p>{e.description}</p>

              {e.params.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Parameter</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      {e.params.map((p) => (
                        <tr key={p.name}>
                          <td><code>{p.name}</code>{p.required && <span className="small muted"> wajib</span>}</td>
                          <td>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3>Contoh respons</h3>
              <pre className="code">{JSON.stringify(e.response, null, 2)}</pre>

              <h3>Coba sekarang</h3>
              <TryIt endpoint={e} defaultKey={user?.api_key || ""} />
            </section>
          ))}

          <section id="error" className="panel endpoint stack">
            <h2>Kode error</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Kode</th><th>Arti</th></tr></thead>
                <tbody>
                  {ERRORS.map(([code, text]) => (
                    <tr key={code}><td><code>{code}</code></td><td>{text}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
