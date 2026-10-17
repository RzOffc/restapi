# Kurir API

Website REST API (downloader) untuk bot WhatsApp: login Google, plan role (beli dan perpanjang), halaman profile dengan API key, dokumentasi endpoint, dan pembayaran lewat Duitku (bank, e-wallet, QRIS). Dibuat dengan Next.js, Neon Postgres, dan Auth.js, siap deploy ke Vercel.

## Alur halaman

Awal (`/`) → Login (`/login`) → Beranda (`/dashboard`) → Plan role (`/plans`) → Profile (`/profile`) → Dokumentasi (`/docs`) → Pembayaran (`/pay/[orderId]`)

## Setup

### 1. Database (Neon)
1. Buat project di [neon.tech](https://neon.tech), salin connection string.
2. Buka SQL Editor, jalankan isi `db/schema.sql`.

### 2. Login Google
1. Buka [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth client ID (Web application).
2. Authorized redirect URI:
   - Lokal: `http://localhost:3000/api/auth/callback/google`
   - Produksi: `https://DOMAIN-KAMU/api/auth/callback/google`
3. Salin Client ID dan Client Secret.

### 3. Duitku
1. Daftar di [duitku.com](https://www.duitku.com), ambil **Merchant Code** dan **API Key** (mulai dari sandbox).
2. Di dashboard Duitku, isi **Callback URL** ke `https://DOMAIN-KAMU/api/duitku/callback`.
3. Saat siap live, ganti `DUITKU_ENV=production` dan pakai kredensial production.

### 4. Environment variable
Salin `.env.example` jadi `.env.local` dan isi semuanya. Buat `AUTH_SECRET` dengan `openssl rand -base64 32`.

### 5. Jalankan lokal
```bash
npm install
npm run dev
```
Callback Duitku tidak bisa menjangkau `localhost`. Untuk uji lokal, halaman pembayaran tetap memeriksa status ke Duitku tiap 5 detik, jadi role tetap aktif setelah bayar di sandbox.

### 6. Deploy ke Vercel
```bash
npm i -g vercel
vercel --prod
```
Isi semua environment variable di Vercel (Settings → Environment Variables), set `SITE_URL` ke domain produksi, lalu deploy ulang.

## Yang bisa kamu ubah

| Mau ubah | File |
|---|---|
| Nama situs | `lib/config.js` |
| Nama role, harga, masa aktif, limit harian | `lib/plans.js` |
| Daftar endpoint di dokumentasi | `lib/endpoints.js` |
| Sumber data downloader | `lib/downloader.js` |
| Metode pembayaran yang ditampilkan | `lib/duitku.js` (`METHOD_GROUPS`) |
| Warna dan font | `app/globals.css`, `app/layout.js` |

## Menambah endpoint baru

1. Buat route di `app/api/v1/<nama>/route.js`, pakai `guardApi(request)` dari `lib/apiguard.js` (cek API key dan potong limit).
2. Tambahkan deskripsinya di `lib/endpoints.js` agar muncul di halaman dokumentasi lengkap dengan tombol "Kirim request".

## Catatan penting

- **Downloader TikTok** memakai layanan pihak ketiga (tikwm.com). Layanan seperti ini bisa berubah atau berhenti kapan saja. Fungsi `tiktok()` ada di `lib/downloader.js` sehingga mudah diganti sumbernya. Instagram dan YouTube belum ada; tambahkan sebagai fungsi baru dengan pola yang sama.
- **Fee Duitku** ditanggung penjual (harga di `lib/plans.js` = nominal yang dibayar pembeli). Kalau ingin fee dibebankan ke pembeli, tambahkan fee ke `amount` saat membuat pesanan.
- **Limit harian** direset jam 00.00 WIB.
- Berpindah dari satu role berbayar ke role lain menggantikan sisa masa aktif role lama.
- Sebelum go-live, tanyakan ke Duitku apakah penjualan akses API termasuk produk digital yang perlu persetujuan khusus.
