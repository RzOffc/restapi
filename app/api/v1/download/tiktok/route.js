import { guardApi, apiJson, apiError } from "@/lib/apiguard";
import { tiktok, parseTikTokUrl, UserInputError } from "@/lib/downloader";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) return apiError(400, "Parameter 'url' wajib diisi.");

  let clean;
  try {
    clean = parseTikTokUrl(url);
  } catch (e) {
    if (e instanceof UserInputError) return apiError(400, e.message);
    throw e;
  }

  // Validasi dulu supaya request yang salah tidak memotong limit.
  const guard = await guardApi(request);
  if (guard.error) return guard.error;

  try {
    const result = await tiktok(clean);
    return apiJson(200, { status: true, result }, guard.headers);
  } catch (e) {
    return apiError(502, `Gagal mengambil data: ${e.message}`, guard.headers);
  }
}
