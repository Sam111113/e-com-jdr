// Protection de toutes les pages admin (T1.10), sauf /admin/connexion (hors
// de ce groupe de routes, voir app/admin/connexion/page.tsx — sans quoi la
// redirection ci-dessous boucle indéfiniment sur elle-même).
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { COOKIE_SESSION_ADMIN, verifierJetonSession } from "@/lib/admin/session";
import { deconnexion } from "../connexion/actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminId = verifierJetonSession(cookieStore.get(COOKIE_SESSION_ADMIN)?.value);
  if (!adminId) redirect("/admin/connexion");

  return (
    <div className="conteneur-etroit en-tete-page">
      <nav className="admin-nav" aria-label="Navigation admin">
        <Link href="/admin">Tableau de bord</Link>
        <Link href="/admin/commandes">Commandes</Link>
        <Link href="/admin/listes-attente">Listes d&apos;attente</Link>
        <form action={deconnexion}>
          <button type="submit" className="btn btn-secondaire">
            Se déconnecter
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
