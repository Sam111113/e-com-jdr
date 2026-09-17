// Désinscription (T1.9). Même séparation lecture/écriture que la
// confirmation, pour la même raison (éviter qu'un simple GET désinscrive
// quelqu'un via un scanner de liens automatique).
import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { subscriptions } from "@/db/schema";
import { hasherToken } from "@/lib/securite/token";
import type { Inscription } from "./confirmer";

export async function rechercherParToken(db: Database, token: string): Promise<Inscription | null> {
  const [ligne] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tokenHash, hasherToken(token)))
    .limit(1);
  return ligne ?? null;
}

export async function desinscrire(db: Database, token: string): Promise<Inscription | null> {
  const inscription = await rechercherParToken(db, token);
  if (!inscription) return null;
  if (inscription.unsubscribedAt) return inscription; // déjà désinscrite : idempotent.

  const [misAJour] = await db
    .update(subscriptions)
    .set({ unsubscribedAt: new Date() })
    .where(eq(subscriptions.id, inscription.id))
    .returning();
  return misAJour;
}
