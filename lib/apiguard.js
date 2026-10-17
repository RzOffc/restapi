import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { PLANS, currentRole } from "@/lib/plans";
import { todayWIB } from "@/lib/format";

export function apiJson(httpStatus, body, headers = {}) {
  return NextResponse.json(body, { status: httpStatus, headers });
}

export function apiError(httpStatus, message, headers = {}) {
  return apiJson(httpStatus, { status: false, message }, headers);
}

// Cek API key + hitung pemakaian harian. Mengembalikan { error } atau { user, role, limit, used }.
export async function guardApi(request, { count = true } = {}) {
  const url = new URL(request.url);
  const key = request.headers.get("x-api-key") || url.searchParams.get("apikey");
  if (!key) {
    return { error: apiError(401, "API key tidak ditemukan. Kirim lewat header x-api-key atau parameter apikey.") };
  }

  const rows = await sql`select * from users where api_key = ${key}`;
  const user = rows[0];
  if (!user) return { error: apiError(401, "API key tidak valid.") };

  const role = currentRole(user);
  const limit = PLANS[role].dailyLimit;
  const day = todayWIB();

  let used;
  if (count) {
    // Naikkan hitungan hanya kalau belum mencapai limit (atomik).
    const r = await sql`
      insert into usage (user_id, day, count) values (${user.id}, ${day}, 1)
      on conflict (user_id, day) do update set count = usage.count + 1
      where usage.count < ${limit}
      returning count
    `;
    if (!r.length) {
      return {
        error: apiError(429, `Limit harian ${limit} request sudah habis. Reset jam 00.00 WIB atau upgrade role.`, {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        }),
      };
    }
    used = r[0].count;
  } else {
    const r = await sql`select count from usage where user_id = ${user.id} and day = ${day}`;
    used = r[0]?.count || 0;
  }

  return {
    user,
    role,
    limit,
    used,
    headers: {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(Math.max(0, limit - used)),
    },
  };
}
