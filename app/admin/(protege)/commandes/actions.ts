"use server";

import { connection } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { orders } from "@/db/schema";
import { COOKIE_SESSION_ADMIN, verifierJetonSession } from "@/lib/admin/session";
import { creerLiensPourCommande, revoquerToken } from "@/lib/telechargements/tokens";
import { envoyerEmailCommandeParBrevo } from "@/lib/emails/commande";

async function verifierSession(): Promise<void> {
  const cookieStore = await cookies();
  const jeton = cookieStore.get(COOKIE_SESSION_ADMIN)?.value;
  if (!verifierJetonSession(jeton)) throw new Error("Session invalide ou expirée.");
}

export async function renvoyerLiens(orderId: number): Promise<{ ok: boolean; message: string }> {
  await verifierSession();
  await connection();
  const { db } = await import("@/db/client");

  const [commande] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!commande || commande.status !== "paid") {
    return { ok: false, message: "Commande introuvable ou non payée." };
  }

  const liens = await creerLiensPourCommande(db, orderId);
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  const resultat = await envoyerEmailCommandeParBrevo({
    email: commande.customerEmail,
    liens: liens.map((l) => ({
      jeuTitre: l.jeuTitre,
      url: `${siteUrl}/telecharger/${l.token}`,
    })),
    urlCgv: `${siteUrl}/cgv`,
  });

  if (resultat === "non-configure") {
    return { ok: true, message: "Brevo non configuré — liens générés mais non envoyés." };
  }
  return { ok: true, message: "Liens de téléchargement renvoyés." };
}

export async function revoquerJetonAdmin(downloadTokenId: number): Promise<{ ok: boolean; message: string }> {
  await verifierSession();
  await connection();
  const { db } = await import("@/db/client");

  await revoquerToken(db, downloadTokenId);
  return { ok: true, message: "Jeton révoqué." };
}