// Création de la session Stripe Checkout (T1.8, étape 1).
//
// Les prix viennent de notre base via `price_data` (brief section 4) :
// aucune synchronisation de catalogue avec Stripe. Le consentement à l'accès
// immédiat et à la renonciation au droit de rétractation est demandé via
// `consent_collection` + `custom_text`, et sa date sera enregistrée à la
// réception du webhook (l'API Checkout Session ne fige `consent` qu'une
// fois la session complétée).
import type Stripe from "stripe";
import type { Jeu } from "@/lib/games/queries";

export const TEXTE_CONSENTEMENT =
  "En achetant, je demande l'accès immédiat au contenu numérique et je renonce " +
  "expressément à mon droit de rétractation de 14 jours (art. L221-28 du code de " +
  "la consommation).";

export interface OptionsSessionCheckout {
  jeu: Pick<Jeu, "id" | "slug" | "title" | "prixEur">;
  siteUrl: string;
}

export function paramsSessionCheckout(
  options: OptionsSessionCheckout,
): Stripe.Checkout.SessionCreateParams {
  const { jeu, siteUrl } = options;
  return {
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: jeu.prixEur,
          product_data: { name: jeu.title },
        },
      },
    ],
    metadata: { gameId: String(jeu.id), gameSlug: jeu.slug },
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      submit: { message: TEXTE_CONSENTEMENT },
      terms_of_service_acceptance: {
        message: `J'accepte les [conditions générales de vente](${siteUrl}/cgv).`,
      },
    },
    success_url: `${siteUrl}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/jeux/${jeu.slug}`,
  };
}

export async function creerSessionCheckout(
  stripe: Stripe,
  options: OptionsSessionCheckout,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create(paramsSessionCheckout(options));
}
