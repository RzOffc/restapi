// Ganti nama dan teks situs di sini.
export const SITE = {
  name: "Kurir API",
  tagline: "API downloader untuk bot WhatsApp",
};

export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
