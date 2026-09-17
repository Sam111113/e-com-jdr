// Numérotation chronologique et continue des factures (D8, T1.8).
//
// Format d'affichage provisoire ("F-000001" / "A-000001"), repris de
// l'exemple déjà donné dans db/schema.ts. Le format définitif doit être
// validé par le comptable de l'équipe avant l'ouverture des ventes (voir
// docs/A_FAIRE_EQUIPE.md) : changer PREFIXE_SERIE ou le format ci-dessous
// ne casse rien tant qu'aucune facture n'a encore été émise avec l'ancien
// format (une fois émises, les factures ne changent jamais rétroactivement).
import { sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { invoiceCounters, type invoiceSeriesEnum } from "@/db/schema";

type Serie = (typeof invoiceSeriesEnum.enumValues)[number];

const PREFIXE_SERIE: Record<Serie, string> = {
  facture: "F",
  avoir: "A",
};

/**
 * Incrémente le compteur de la série donnée et retourne le nouveau numéro.
 * `UPDATE ... RETURNING` est atomique : deux appels concurrents ne peuvent
 * jamais recevoir le même numéro, sans avoir besoin d'un verrou explicite.
 */
export async function incrementerCompteur(db: Database, serie: Serie): Promise<number> {
  const [ligne] = await db
    .update(invoiceCounters)
    .set({ lastNumber: sql`${invoiceCounters.lastNumber} + 1` })
    .where(sql`${invoiceCounters.series} = ${serie}`)
    .returning({ lastNumber: invoiceCounters.lastNumber });

  if (!ligne) {
    throw new Error(`Compteur de factures introuvable pour la série "${serie}".`);
  }
  return ligne.lastNumber;
}

export function formaterNumeroFacture(serie: Serie, numero: number): string {
  return `${PREFIXE_SERIE[serie]}-${String(numero).padStart(6, "0")}`;
}
