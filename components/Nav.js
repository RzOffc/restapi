import Link from "next/link";
import { auth, signOut } from "@/auth";
import { SITE } from "@/lib/config";

export default async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="nav">
      <div className="wrap">
        <Link href={user ? "/dashboard" : "/"} className="brand">
          <span className="brand-mark" aria-hidden="true" />
          {SITE.name}
        </Link>
        <nav className="nav-links" aria-label="Menu utama">
          {user && <Link href="/dashboard">Beranda</Link>}
          <Link href="/plans">Plan</Link>
          <Link href="/docs">Dokumentasi</Link>
          {user && <Link href="/profile">Profile</Link>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              {user.image && (
                <img className="avatar" src={user.image} alt="" referrerPolicy="no-referrer" />
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn sm" type="submit">Keluar</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn sm primary">Masuk</Link>
          )}
        </div>
      </div>
    </header>
  );
}
