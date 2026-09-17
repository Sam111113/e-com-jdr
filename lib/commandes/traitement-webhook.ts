// Traitement des événements Stripe (T1.8, étape 3). Logique pure, sans
// dépendance directe au SDK Stripe ni à Next.js : les événements sont déjà
// vérifiés (signature) et désérialisés par l'appelant (app/api/webhooks/stripe),
// ce qui permet de tester ce fichier avec de faux événements et une vraie
// base de test, sans jamais appeler Stripe.
import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import type { Storage } from "@/lib/storage/types";
import { downloadTokens, invoices, orderItems, orders } from "@/db/schema";
import { creerLiensPourCommande } from "@/lib/telechargements/tokens";
import { emettreAvoir, emettreFacture } from "@/lib/factures/emettre";
import { TEXTE_CONSENTEMENT } from "./creer-session-checkout";
import type { EnvoyerEmailCommande } from "@/lib/emails/commande";

/** Sous-ensemble de `Stripe.Checkout.Session` réellement utilisé ici,
 * pour ne pas dépendre du SDK Stripe dans les tests. */
export interface EvenementCheckoutComplete {
  id: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  customer_details: { email: string | null } | null;
  customer_email: string | null;
  metadata: Record<string, string> | null;
  consent: { terms_of_service?: string } | null;
}

/** Sous-ensemble de `Stripe.Charge` réellement utilisé ici. */
export interface EvenementChargeRemboursee {
  payment_intent: string | null;
}

export interface DependancesWebhook {
  db: Database;
  storage: Storage;
  envoyerEmail: EnvoyerEmailCommande;
  siteUrl: string;
}

export interface ResultatTraitement {
  dejaTraite: boolean;
  orderId?: number;
}

/**
 * Traite `checkout.session.completed`. Idempotent : `orders.stripe_session_id`
 * est unique, un même événement livré deux fois (Stripe garantit « au moins
 * une fois », jamais « exactement une fois ») ne crée jamais deux commandes,
 * n'émet jamais deux factures ni deux emails.
 */
export async function traiterCheckoutComplete(
  deps: DependancesWebhook,
  session: EvenementCheckoutComplete,
): Promise<ResultatTraitement> {
  if (session.payment_status !== "paid") {
    // Paiement asynchrone non encore confirmé (ex. virement) : rien à faire
    // pour l'instant, un futur événement confirmera ou non le paiement.
    return { dejaTraite: false };
  }

  const gameId = Number(session.metadata?.gameId);
  if (!Number.isInteger(gameId)) {
    throw new Error(`Session Stripe ${session.id} sans metadata.gameId exploitable.`);
  }
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    throw new Error(`Session Stripe ${session.id} sans email client.`);
  }
  const montant = session.amount_total ?? 0;
  const consentAccepte = session.consent?.terms_of_service === "accepted";

  const { db, storage, envoyerEmail, siteUrl } = deps;

  const [commandeCreee] = await db
    .insert(orders)
    .values({
      stripeSessionId: session.id,
      customerEmail: email,
      status: "paid",
      amountTotal: montant,
      currency: session.currency ?? "eur",
      consentAt: consentAccepte ? new Date() : null,
      consentText: consentAccepte ? TEXTE_CONSENTEMENT : null,
    })
    .onConflictDoNothing({ target: orders.stripeSessionId })
    .returning({ id: orders.id });

  if (!commandeCreee) {
    // `orders.stripe_session_id` existait déjà : événement déjà traité.
    return { dejaTraite: true };
  }

  const orderId = commandeCreee.id;
  await db.insert(orderItems).values({
    orderId,
    gameId,
    unitPrice: montant,
    quantity: 1,
  });

  const liens = await creerLiensPourCommande(db, orderId);
  await emettreFacture(db, storage, orderId);

  await envoyerEmail({
    email,
    liens: liens.map((lien) => ({
      jeuTitre: lien.jeuTitre,
      url: `${siteUrl}/telecharger/${lien.token}`,
    })),
    urlCgv: `${siteUrl}/cgv`,
  });

  return { dejaTraite: false, orderId };
}

/**
 * Traite `charge.refunded` : émet un avoir (jamais de suppression de la
 * facture d'origine) et révoque les liens de téléchargement encore actifs.
 * `trouverSessionId` fait le lien entre le remboursement Stripe (qui ne
 * connaît que le `payment_intent`) et notre commande (qui ne connaît que le
 * `stripe_session_id`) — voir app/api/webhooks/stripe/route.ts.
 */
export async function traiterRemboursement(
  deps: DependancesWebhook,
  charge: EvenementChargeRemboursee,
  trouverSessionId: (paymentIntentId: string) => Promise<string | null>,
): Promise<ResultatTraitement> {
  if (!charge.payment_intent) return { dejaTraite: true };

  const stripeSessionId = await trouverSessionId(charge.payment_intent);
  if (!stripeSessionId) return { dejaTraite: true };

  const { db, storage } = deps;
  const [commande] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, stripeSessionId))
    .limit(1);
  if (!commande) return { dejaTraite: true };
  if (commande.status === "refunded") return { dejaTraite: true };

  const [factureOrigine] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.orderId, commande.id), eq(invoices.series, "facture")))
    .limit(1);
  if (!factureOrigine) {
    throw new Error(`Aucune facture d'origine pour la commande ${commande.id} (remboursement).`);
  }

  await db.update(orders).set({ status: "refunded" }).where(eq(orders.id, commande.id));
  await emettreAvoir(db, storage, commande.id, factureOrigine.id);

  const items = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.orderId, commande.id));
  for (const item of items) {
    await db
      .update(downloadTokens)
      .set({ revokedAt: new Date() })
      .where(eq(downloadTokens.orderItemId, item.id));
  }

  return { dejaTraite: false, orderId: commande.id };
}
