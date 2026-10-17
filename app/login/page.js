import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SITE } from "@/lib/config";

export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="wrap" style={{ maxWidth: 460, paddingTop: 64 }}>
      <div className="panel stack">
        <h1 style={{ fontSize: "2rem" }}>Masuk ke {SITE.name}</h1>
        <p className="muted">
          Gunakan akun Google. Akun baru otomatis mendapat role Free dan API key.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button className="btn primary" type="submit" style={{ width: "100%" }}>
            Lanjutkan dengan Google
          </button>
        </form>
      </div>
    </div>
  );
}
