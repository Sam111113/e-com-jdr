// Webhook Stripe (T1.8, étape 3). Vérifie la signature avant tout traitement
// (aucune confiance dans le corps de la requête sans ça), puis délègue à la
// logique pure de lib/commandes/traitement-webhook.ts.
//
// En staging, Stripe ne peut pas joindre l'app directement (AGENTS.md
// section 8) : utiliser `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { db } from "@/db/client";
import { storage } from "@/lib/storage";
import { envoyerEmailCommandeParBrevo } from "@/lib/emails/commande";
import { baseUrl } from "@/lib/seo/site-url";
import {
  traiterCheckoutComplete,
  traiterRemboursement,
  type EvenementCheckoutComplete,
  type EvenementChargeRemboursee,
} from "@/lib/commandes/traitement-webhook";

function resolveWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET doit être définie.");
  return secret;
}

async function trouverSessionIdParPaymentIntent(paymentIntentId: string): Promise<string | null> {
  const sessions = await getStripeClient().checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  return sessions.data[0]?.id ?? null;
}

export async function POST(requete: Request): Promise<Response> {
  const signature = requete.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ erreur: "Signature manquante." }, { status: 400 });
  }

  const corpsBrut = await requete.text();
  let evenement: Stripe.Event;
  try {
    evenement = getStripeClient().webhooks.constructEvent(
      corpsBrut,
      signature,
      resolveWebhookSecret(),
    );
  } catch (erreur) {
    console.error("Webhook Stripe : signature invalide", erreur);
    return Response.json({ erreur: "Signature invalide." }, { status: 400 });
  }

  const deps = {
    db,
    storage,
    envoyerEmail: envoyerEmailCommandeParBrevo,
    siteUrl: baseUrl().toString().replace(/\/$/, ""),
  };

  try {
    if (evenement.type === "checkout.session.completed") {
      const session = evenement.data.object as Stripe.Checkout.Session;
      await traiterCheckoutComplete(deps, session as unknown as EvenementCheckoutComplete);
    } else if (evenement.type === "charge.refunded") {
      const charge = evenement.data.object as Stripe.Charge;
      const chargeMinimal: EvenementChargeRemboursee = {
        payment_intent:
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : (charge.payment_intent?.id ?? null),
      };
      await traiterRemboursement(deps, chargeMinimal, trouverSessionIdParPaymentIntent);
    }
  } catch (erreur) {
    console.error(`Webhook Stripe : échec du traitement de ${evenement.type}`, erreur);
    // 500 pour que Stripe retente plus tard (idempotence garantie côté
    // traitement) plutôt que de perdre silencieusement l'événement.
    return Response.json({ erreur: "Échec du traitement." }, { status: 500 });
  }

  return Response.json({ recu: true });
}
