import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { sql } from "@/lib/db";

// Membaca AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET dari environment.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      await sql`
        insert into users (email, name, image)
        values (${user.email}, ${user.name || null}, ${user.image || null})
        on conflict (email) do update set name = excluded.name, image = excluded.image
      `;
      return true;
    },
  },
});
