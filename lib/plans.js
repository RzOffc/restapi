// Atur nama role, harga, masa aktif, dan limit request di sini.
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    days: null,
    dailyLimit: 100,
    perks: ["100 request per hari", "Semua endpoint downloader", "Tanpa masa aktif"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 15000,
    days: 30,
    dailyLimit: 2000,
    featured: true,
    perks: ["2.000 request per hari", "Semua endpoint downloader", "Aktif 30 hari"],
  },
  vip: {
    id: "vip",
    name: "VIP",
    price: 35000,
    days: 30,
    dailyLimit: 10000,
    perks: [
      "10.000 request per hari",
      "Semua endpoint downloader",
      "Aktif 30 hari",
      "Request endpoint baru diprioritaskan",
    ],
  },
};

export const PAID_PLANS = ["premium", "vip"];

// Role yang berlaku sekarang. Kalau masa aktif habis, otomatis kembali ke free.
export function currentRole(user) {
  if (
    user &&
    user.role !== "free" &&
    PLANS[user.role] &&
    user.role_expires_at &&
    new Date(user.role_expires_at) > new Date()
  ) {
    return user.role;
  }
  return "free";
}
