// Confirmation d'inscription (double opt-in, T1.9). Le GET n'affiche que le
// texte de consentement et un bouton ; seul le clic (action serveur, donc un
// vrai POST) confirme — jamais la simple visite, qu'un scanner de liens dans
// un client email ferait sinon à la place de la personne.
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { rechercherParToken } from "@/lib/inscriptions/confirmer";

export default async function PageConfirmer({
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
        <p>Ce lien de confirmation n&apos;existe pas ou plus.</p>
      </main>
    );
  }

  async function confirmer() {
    "use server";
    const { db } = await import("@/db/client");
    const { confirmerInscription } = await import("@/lib/inscriptions/confirmer");
    await confirmerInscription(db, token);
    redirect(`/confirmer/${token}`);
  }

  if (inscription.confirmedAt) {
    return (
      <main className="conteneur-etroit en-tete-page">
        <h1>Inscription confirmée</h1>
        <p>Merci, votre inscription est bien confirmée.</p>
        {inscription.type === "jeu_gratuit" && (
          <p>
            <Link href="/jeu-gratuit/acces" className="btn btn-primaire">
              Accéder au mini-jeu gratuit
            </Link>
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="conteneur-etroit en-tete-page">
      <h1>Confirmer votre inscription</h1>
      <p>{inscription.consentText}</p>
      <form action={confirmer}>
        <button type="submit" className="btn btn-primaire">
          Confirmer mon inscription
        </button>
      </form>
    </main>
  );
}
