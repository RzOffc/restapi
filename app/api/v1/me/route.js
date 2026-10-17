import { guardApi, apiJson } from "@/lib/apiguard";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Cek akun dan sisa limit. Tidak memotong limit.
export async function GET(request) {
  const guard = await guardApi(request, { count: false });
  if (guard.error) return guard.error;

  return apiJson(
    200,
    {
      status: true,
      result: {
        email: guard.user.email,
        role: guard.role,
        roleName: PLANS[guard.role].name,
        roleExpiresAt: guard.role === "free" ? null : guard.user.role_expires_at,
        dailyLimit: guard.limit,
        usedToday: guard.used,
        remainingToday: Math.max(0, guard.limit - guard.used),
      },
    },
    guard.headers
  );
}
