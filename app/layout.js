import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/config";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--f-code", display: "swap" });

export const metadata = {
  title: { default: `${SITE.name} - ${SITE.tagline}`, template: `%s - ${SITE.name}` },
  description: "REST API downloader untuk bot WhatsApp. Login dengan Google, pilih role, bayar lewat QRIS, e-wallet, atau transfer bank.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} ${code.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <footer className="footer">
          <div className="wrap row spread">
            <span>{SITE.name}</span>
            <span>Limit harian reset jam 00.00 WIB</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
