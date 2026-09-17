// Inscription à une liste (jeu gratuit, liste d'attente, newsletter — T1.9).
// Un seul point d'entrée pour les trois types : même mécanique de double
// opt-in, seul le texte de consentement et le lien (jeu ou non) changent.
import type { Database } from "@/db/client";
import { subscriptions, type subscriptionTypeEnum } from "@/db/schema";
import { genererToken, hasherToken } from "@/lib/securite/token";

export type TypeInscription = (typeof subscriptionTypeEnum.enumValues)[number];

export interface DemandeInscription {
  email: string;
  type: TypeInscription;
  /** Nul = liste générale (newsletter, jeu gratuit) ou liste d'attente générale. */
  gameId?: number | null;
  consentText: string;
}

export interface InscriptionCreee {
  id: number;
  token: string;
}

/**
 * Inscrit (ou réinscrit) une adresse à une liste. Une même adresse ne peut
 * avoir qu'une ligne par (email, type, jeu) — voir la contrainte unique de
 * `subscriptions` (D5) — donc une nouvelle demande sur une inscription déjà
 * existante régénère un jeton et redemande une confirmation (double
 * opt-in), y compris après une désinscription précédente.
 */
export async function inscrire(
  db: Database,
  demande: DemandeInscription,
): Promise<InscriptionCreee> {
  const token = genererToken();
  const tokenHash = hasherToken(token);
  const gameId = demande.gameId ?? null;

  const [ligne] = await db
    .insert(subscriptions)
    .values({
      email: demande.email,
      type: demande.type,
      gameId,
      consentText: demande.consentText,
      tokenHash,
    })
    .onConflictDoUpdate({
      target: [subscriptions.email, subscriptions.type, subscriptions.gameId],
      set: {
        tokenHash,
        consentText: demande.consentText,
        confirmedAt: null,
        unsubscribedAt: null,
      },
    })
    .returning({ id: subscriptions.id });

  return { id: ligne.id, token };
}
