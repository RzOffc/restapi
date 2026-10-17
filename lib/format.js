export function rupiah(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export function fmtDate(d, withTime = false) {
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: "Asia/Jakarta",
  }).format(new Date(d));
}

// Tanggal hari ini menurut WIB (YYYY-MM-DD). Limit harian reset jam 00.00 WIB.
export function todayWIB() {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

export function daysLeft(d) {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));
}
