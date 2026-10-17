// Lapisan "provider" downloader. Setiap fungsi menerima link dan mengembalikan objek hasil.
// Mau ganti sumber (misalnya cobalt hasil self-host)? Cukup ubah fungsi di file ini.

const TIKTOK_HOSTS = ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com", "m.tiktok.com"];

export class UserInputError extends Error {}

export function parseTikTokUrl(input) {
  let u;
  try {
    u = new URL(input);
  } catch {
    throw new UserInputError("Parameter 'url' bukan link yang valid.");
  }
  if (!["http:", "https:"].includes(u.protocol) || !TIKTOK_HOSTS.includes(u.hostname)) {
    throw new UserInputError("Link harus dari tiktok.com.");
  }
  return u.toString();
}

const abs = (p) => (p ? (p.startsWith("/") ? `https://www.tikwm.com${p}` : p) : null);

export async function tiktok(url) {
  const res = await fetch("https://www.tikwm.com/api/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url, hd: "1" }),
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!json || json.code !== 0 || !json.data) {
    throw new Error(json?.msg || "Sumber tidak mengembalikan data.");
  }
  const d = json.data;
  return {
    id: d.id,
    title: d.title || "",
    duration: d.duration,
    cover: abs(d.cover),
    author: {
      username: d.author?.unique_id || null,
      nickname: d.author?.nickname || null,
    },
    video: {
      nowm: abs(d.play),
      hd: abs(d.hdplay),
      wm: abs(d.wmplay),
    },
    music: abs(d.music),
    images: Array.isArray(d.images) ? d.images : [],
    stats: {
      plays: d.play_count,
      likes: d.digg_count,
      comments: d.comment_count,
      shares: d.share_count,
    },
  };
}
