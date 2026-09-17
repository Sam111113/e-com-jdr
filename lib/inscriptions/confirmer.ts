// Confirmation d'inscription (double opt-in, T1.9). La lecture et l'écriture
// sont séparées à dessein : `rechercherParToken` (lecture seule) sert à
// afficher la page /confirmer/[token] sans jamais confirmer par un simple
// GET (un scanner de liens dans un client email suivrait sinon le lien
// automatiquement) — seule `confirmerInscription`, appelée par l'action du
// bouton, écrit `confirmed_at`.
import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { subscriptions } from "@/db/schema";
import { hasherToken } from "@/lib/securite/token";

export type Inscription = typeof subscriptions.$inferSelect;

export async function rechercherParToken(db: Database, token: string): Promise<Inscription | null> {
  const [ligne] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tokenHash, hasherToken(token)))
    .limit(1);
  return ligne ?? null;
}

export async function confirmerInscription(db: Database, token: string): Promise<Inscription | null> {
  const inscription = await rechercherParToken(db, token);
  if (!inscription) return null;
  if (inscription.confirmedAt) return inscription; // déjà confirmée : idempotent.

  const [misAJour] = await db
    .update(subscriptions)
    .set({ confirmedAt: new Date() })
    .where(eq(subscriptions.id, inscription.id))
    .returning();
  return misAJour;
}
