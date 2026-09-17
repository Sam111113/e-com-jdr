// Client Stripe partagé (T1.8). Clés de test uniquement en phases 1 et 2
// (voir AGENTS.md section 3 : les clés live demandent une validation
// explicite de l'équipe).
import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  __ecomjdrStripeClient?: Stripe;
};

function resolveSecretKey(): string {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    throw new Error("STRIPE_SECRET_KEY doit être définie pour utiliser Stripe.");
  }
  return cle;
}

export function getStripeClient(): Stripe {
  if (!globalForStripe.__ecomjdrStripeClient) {
    globalForStripe.__ecomjdrStripeClient = new Stripe(resolveSecretKey());
  }
  return globalForStripe.__ecomjdrStripeClient;
}
