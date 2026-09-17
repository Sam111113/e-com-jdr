// Désinscription (T1.9). Même principe que /confirmer/[token] : le GET
// n'affiche qu'un bouton, seul le clic désinscrit réellement.
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { rechercherParToken } from "@/lib/inscriptions/desinscrire";

export default async function PageDesinscription({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  await connection();
  const { db } = await import("@/db/client");
  const inscription = await rechercherParToken(db, token);

  if (!inscription) {
    return (
      <main className="conteneur-etroit en-tete-page">
        <h1>Lien invalide</h1>
        <p>Ce lien de désinscription n&apos;existe pas ou plus.</p>
      </main>
    );
  }

  async function seDesinscrire() {
    "use server";
    const { db } = await import("@/db/client");
    const { desinscrire } = await import("@/lib/inscriptions/desinscrire");
    await desinscrire(db, token);
    redirect(`/desinscription/${token}`);
  }

  if (inscription.unsubscribedAt) {
    return (
      <main className="conteneur-etroit en-tete-page">
        <h1>Désinscription confirmée</h1>
        <p>Vous êtes bien désinscrit(e). Vous ne recevrez plus d&apos;email de cette liste.</p>
      </main>
    );
  }

  return (
    <main className="conteneur-etroit en-tete-page">
      <h1>Se désinscrire</h1>
      <p>Confirmez que vous souhaitez ne plus recevoir d&apos;email de cette liste.</p>
      <form action={seDesinscrire}>
        <button type="submit" className="btn btn-saison">
          Confirmer la désinscription
        </button>
      </form>
    </main>
  );
}
