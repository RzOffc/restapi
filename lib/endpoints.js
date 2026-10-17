// Daftar endpoint untuk halaman dokumentasi. Tambah endpoint baru di sini.
export const ENDPOINTS = [
  {
    id: "tiktok",
    method: "GET",
    path: "/api/v1/download/tiktok",
    title: "Unduh video TikTok",
    description:
      "Ambil link video tanpa watermark, versi HD, musik, dan statistik dari link TikTok. Mendukung postingan foto (slideshow).",
    params: [
      {
        name: "url",
        required: true,
        description: "Link video TikTok dari tiktok.com, vm.tiktok.com, atau vt.tiktok.com.",
        example: "https://www.tiktok.com/@username/video/7000000000000000000",
      },
    ],
    response: {
      status: true,
      result: {
        id: "7000000000000000000",
        title: "Judul video",
        duration: 15,
        cover: "https://...",
        author: { username: "username", nickname: "Nama" },
        video: { nowm: "https://...", hd: "https://...", wm: "https://..." },
        music: "https://...",
        images: [],
        stats: { plays: 1200, likes: 340, comments: 12, shares: 5 },
      },
    },
  },
  {
    id: "me",
    method: "GET",
    path: "/api/v1/me",
    title: "Cek akun dan sisa limit",
    description: "Lihat role, masa aktif, dan sisa request hari ini. Endpoint ini tidak memotong limit.",
    params: [],
    response: {
      status: true,
      result: {
        email: "kamu@gmail.com",
        role: "premium",
        roleName: "Premium",
        roleExpiresAt: "2026-11-16T05:00:00.000Z",
        dailyLimit: 2000,
        usedToday: 12,
        remainingToday: 1988,
      },
    },
  },
];

export const ERRORS = [
  ["400", "Parameter kurang atau salah."],
  ["401", "API key tidak ada atau tidak valid."],
  ["429", "Limit harian habis. Reset jam 00.00 WIB."],
  ["502", "Sumber data gagal merespons. Coba lagi sebentar."],
];
