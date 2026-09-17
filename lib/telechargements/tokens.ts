// Jetons de téléchargement (T1.8).
//
// Le jeton en clair n'est jamais stocké : seul son hash SHA-256 l'est (D8,
// voir db/schema.ts, table `download_tokens`). Il n'existe donc que le
// temps de le communiquer (email, page de confirmation) puis il est perdu :
// une nouvelle visite régénère de nouveaux jetons plutôt que de retrouver
// les anciens.
import crypto from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { downloadTokens, games, orderItems, orders } from "@/db/schema";

const OCTETS_TOKEN = 32; // >= 32 octets, exigé par le brief (T1.8).
const JOURS_EXPIRATION = 7;
const TELECHARGEMENTS_MAX = 5;

export function genererToken(): string {
  return crypto.randomBytes(OCTETS_TOKEN).toString("hex");
}

export function hasherToken(tokenClair: string): string {
  return crypto.createHash("sha256").update(tokenClair).digest("hex");
}

export interface LienTelechargement {
  token: string;
  orderItemId: number;
  jeuTitre: string;
  jeuSlug: string;
}

/** Crée un nouveau jeton de téléchargement pour une ligne de commande
 * donnée. Réutilisable à volonté (email de commande, page de confirmation,
 * « retrouver mes téléchargements ») : chaque appel crée un jeton distinct,
 * les anciens restent valables jusqu'à leur propre expiration/quota. */
export async function creerLienTelechargement(
  db: Database,
  orderItemId: number,
  options: { joursExpiration?: number; telechargementsMax?: number } = {},
): Promise<string> {
  const token = genererToken();
  const expiresAt = new Date(
    Date.now() + (options.joursExpiration ?? JOURS_EXPIRATION) * 24 * 60 * 60 * 1000,
  );
  await db.insert(downloadTokens).values({
    orderItemId,
    tokenHash: hasherToken(token),
    expiresAt,
    maxDownloads: options.telechargementsMax ?? TELECHARGEMENTS_MAX,
  });
  return token;
}

/** Crée un jeton de téléchargement par ligne de la commande, avec les
 * informations nécessaires pour composer l'email et la page de
 * confirmation. */
export async function creerLiensPourCommande(
  db: Database,
  orderId: number,
): Promise<LienTelechargement[]> {
  const lignes = await db
    .select({
      orderItemId: orderItems.id,
      jeuTitre: games.title,
      jeuSlug: games.slug,
    })
    .from(orderItems)
    .innerJoin(games, eq(orderItems.gameId, games.id))
    .where(eq(orderItems.orderId, orderId));

  const liens: LienTelechargement[] = [];
  for (const ligne of lignes) {
    const token = await creerLienTelechargement(db, ligne.orderItemId);
    liens.push({ token, orderItemId: ligne.orderItemId, jeuTitre: ligne.jeuTitre, jeuSlug: ligne.jeuSlug });
  }
  return liens;
}

export type EchecTelechargement = "invalide" | "expire" | "revoque" | "quota-atteint";

export interface ValidationTelechargement {
  ok: boolean;
  echec?: EchecTelechargement;
  jeu?: { kitPdfKey: string | null; slug: string; titre: string };
  emailAcheteur?: string;
}

/**
 * Valide un jeton et, s'il est valable, incrémente immédiatement son
 * compteur d'utilisation (évite une fenêtre de course entre la validation
 * et la consommation : deux téléchargements simultanés avec le dernier
 * essai restant ne doivent pas passer tous les deux).
 */
export async function validerEtConsommerToken(
  db: Database,
  tokenClair: string,
): Promise<ValidationTelechargement> {
  const tokenHash = hasherToken(tokenClair);

  const [ligne] = await db
    .select({
      id: downloadTokens.id,
      expiresAt: downloadTokens.expiresAt,
      maxDownloads: downloadTokens.maxDownloads,
      downloadCount: downloadTokens.downloadCount,
      revokedAt: downloadTokens.revokedAt,
      kitPdfKey: games.kitPdfKey,
      slug: games.slug,
      titre: games.title,
      emailAcheteur: orders.customerEmail,
    })
    .from(downloadTokens)
    .innerJoin(orderItems, eq(downloadTokens.orderItemId, orderItems.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(games, eq(orderItems.gameId, games.id))
    .where(eq(downloadTokens.tokenHash, tokenHash))
    .limit(1);

  if (!ligne) return { ok: false, echec: "invalide" };
  if (ligne.revokedAt) return { ok: false, echec: "revoque" };
  if (ligne.expiresAt.getTime() < Date.now()) return { ok: false, echec: "expire" };
  if (ligne.downloadCount >= ligne.maxDownloads) return { ok: false, echec: "quota-atteint" };

  // Incrément conditionnel : la clause `WHERE` revérifie le quota et la
  // révocation au moment même de l'écriture (pas seulement à la lecture
  // précédente), pour qu'une course entre deux téléchargements simultanés
  // sur le même jeton ne laisse jamais passer le dernier essai deux fois.
  const misAJour = await db
    .update(downloadTokens)
    .set({ downloadCount: sql`${downloadTokens.downloadCount} + 1` })
    .where(
      and(
        eq(downloadTokens.id, ligne.id),
        isNull(downloadTokens.revokedAt),
        sql`${downloadTokens.downloadCount} < ${downloadTokens.maxDownloads}`,
      ),
    )
    .returning({ id: downloadTokens.id });

  if (misAJour.length === 0) return { ok: false, echec: "quota-atteint" };

  return {
    ok: true,
    jeu: { kitPdfKey: ligne.kitPdfKey, slug: ligne.slug, titre: ligne.titre },
    emailAcheteur: ligne.emailAcheteur,
  };
}
