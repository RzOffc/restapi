import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function getUser() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const rows = await sql`select * from users where email = ${email}`;
  return rows[0] || null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
