"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db/client";
import { creerLimiteurParIp } from "@/lib/securite/limiteur";
import { trouverCommandesPayeesParEmail } from "@/lib/commandes/recherche";
import { creerLiensPourCommande } from "@/lib/telechargements/tokens";
import { envoyerEmailCommandeParBrevo } from "@/lib/emails/commande";
import { baseUrl } from "@/lib/seo/site-url";

export interface EtatRetrouver {
  statut: "initial" | "envoye" | "erreur";
  message?: string;
}

const MESSAGE_GENERIQUE =
  "Si un achat existe pour cette adresse, vous allez recevoir un email avec de nouveaux liens de téléchargement.";

// Route sensible (révèle indirectement si un email a acheté, si la
// limite n'existait pas et qu'on pouvait la bombarder) : limite stricte.
const autoriser = creerLimiteurParIp(5, 15 * 60 * 1000);

const schema = z.object({
  email: z.string().trim().max(254).pipe(z.email({ message: "Indiquez une adresse email valide." })),
});

export async function demanderNouveauxLiens(
  _etat: EtatRetrouver,
  donnees: FormData,
): Promise<EtatRetrouver> {
  const entetes = await headers();
  const ip =
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() || entetes.get("x-real-ip") || "inconnue";
  if (!autoriser(ip)) {
    return { statut: "erreur", message: "Trop de demandes. Réessayez dans quelques minutes." };
  }

  const valeur = donnees.get("email");
  const analyse = schema.safeParse({ email: typeof valeur === "string" ? valeur : "" });
  if (!analyse.success) {
    return { statut: "erreur", message: analyse.error.issues[0]?.message ?? "Email invalide." };
  }

  const idsCommandes = await trouverCommandesPayeesParEmail(db, analyse.data.email);
  const site = baseUrl().toString().replace(/\/$/, "");

  for (const orderId of idsCommandes) {
    const liens = await creerLiensPourCommande(db, orderId);
    await envoyerEmailCommandeParBrevo({
      email: analyse.data.email,
      liens: liens.map((lien) => ({ jeuTitre: lien.jeuTitre, url: `${site}/telecharger/${lien.token}` })),
      urlCgv: `${site}/cgv`,
    });
  }

  // Message identique que l'email ait ou non commandé (brief T1.8, point 7).
  return { statut: "envoye", message: MESSAGE_GENERIQUE };
}
