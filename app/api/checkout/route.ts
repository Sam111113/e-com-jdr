// Démarrage d'un achat (T1.8, étape 1) : crée une session Stripe Checkout
// pour un jeu et redirige le client vers la page de paiement hébergée par
// Stripe. Refuse si les ventes sont fermées (SALES_ENABLED) ou si le
// consentement n'a pas été coché : aucune formulation du site ne doit
// jamais laisser croire qu'on peut acheter sans ça (brief, interdits).
import { headers } from "next/headers";
import { z } from "zod";
import { getStripeClient } from "@/lib/stripe/client";
import { creerSessionCheckout } from "@/lib/commandes/creer-session-checkout";
import { trouverJeu } from "@/lib/games/queries";
import { ventesActives } from "@/lib/ventes/sales-enabled";
import { baseUrl } from "@/lib/seo/site-url";
import { creerLimiteurParIp } from "@/lib/securite/limiteur";

// Route sensible (crée un objet chez Stripe à chaque appel) : limite plus
// stricte que le formulaire de contact.
const autoriser = creerLimiteurParIp(20, 15 * 60 * 1000);

const schema = z.object({
  slug: z.string().trim().min(1),
  consentement: z.literal(true),
});

function adresseIp(entetes: Headers): string {
  return (
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    entetes.get("x-real-ip") ||
    "inconnue"
  );
}

export async function POST(requete: Request): Promise<Response> {
  if (!ventesActives()) {
    return Response.json({ erreur: "Les ventes ne sont pas encore ouvertes." }, { status: 403 });
  }

  const entetes = await headers();
  if (!autoriser(adresseIp(entetes))) {
    return Response.json(
      { erreur: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const corps = schema.safeParse(await requete.json().catch(() => null));
  if (!corps.success) {
    return Response.json(
      { erreur: "Vous devez accepter les conditions avant d'acheter." },
      { status: 400 },
    );
  }

  const jeu = await trouverJeu(corps.data.slug);
  if (!jeu) {
    return Response.json({ erreur: "Jeu introuvable." }, { status: 404 });
  }

  const session = await creerSessionCheckout(getStripeClient(), {
    jeu,
    siteUrl: baseUrl().toString().replace(/\/$/, ""),
  });

  if (!session.url) {
    return Response.json({ erreur: "Impossible de créer le paiement." }, { status: 502 });
  }
  return Response.json({ url: session.url });
}
