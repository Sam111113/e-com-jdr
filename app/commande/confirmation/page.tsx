// Page de confirmation après paiement (T1.8, étape 5). Le paiement lui-même
// est traité par le webhook (app/api/webhooks/stripe), pas par cette page :
// une redirection Stripe réussie ne garantit pas que le webhook soit déjà
// passé. Chaque visite régénère de nouveaux liens de téléchargement (le
// jeton en clair n'est jamais stocké, voir lib/telechargements/tokens.ts).
import Link from "next/link";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { orders } from "@/db/schema";
import { creerLiensPourCommande } from "@/lib/telechargements/tokens";

async function chargerCommande(sessionId: string) {
  await connection();
  const { db } = await import("@/db/client");
  const [commande] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  if (!commande || commande.status !== "paid") return null;
  const liens = await creerLiensPourCommande(db, commande.id);
  return { commande, liens };
}

export default async function PageConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const resultat = sessionId ? await chargerCommande(sessionId) : null;

  if (!resultat) {
    return (
      <main className="conteneur-etroit en-tete-page">
        <h1>Paiement en cours de confirmation</h1>
        <p>
          Si vous venez de payer, cette page se met à jour dès que la confirmation nous parvient
          (quelques secondes). Vous recevrez aussi vos liens de téléchargement par email.
        </p>
        <p>
          <a href={sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "."}>
            Actualiser
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="conteneur-etroit en-tete-page">
      <h1>Merci pour votre achat !</h1>
      <p>
        Un email de confirmation a été envoyé à {resultat.commande.customerEmail}, avec vos liens
        de téléchargement et votre facture.
      </p>
      <p>
        En achetant, vous avez demandé l&apos;accès immédiat au contenu numérique et renoncé à
        votre droit de rétractation légal.
      </p>
      <h2>Vos téléchargements</h2>
      <ul>
        {resultat.liens.map((lien) => (
          <li key={lien.token}>
            <a href={`/telecharger/${lien.token}`}>{lien.jeuTitre}</a>
          </li>
        ))}
      </ul>
      <p className="note">
        Chaque lien est valable 7 jours et 5 téléchargements. Besoin de nouveaux liens plus tard ?{" "}
        <Link href="/retrouver-mes-telechargements">Retrouver mes téléchargements</Link>.
      </p>
    </main>
  );
}
