import crypto from "crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/user";

export const dynamic = "force-dynamic";

// Buat API key baru (key lama langsung tidak berlaku).
export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const apiKey = "kr_" + crypto.randomBytes(18).toString("hex");
  await sql`update users set api_key = ${apiKey} where id = ${user.id}`;
  return NextResponse.json({ apiKey });
}
