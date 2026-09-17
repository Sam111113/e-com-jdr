// Émission des factures et avoirs (T1.8, D8). Orchestration : incrémente le
// compteur, fige un instantané de la configuration légale, génère le PDF,
// le range dans le stockage privé et enregistre la ligne en base.
//
// On ne modifie ni ne supprime jamais une facture déjà émise (brief,
// section 4) : un remboursement crée un avoir séparé qui la référence.
import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import type { Storage } from "@/lib/storage/types";
import { entreprise } from "@/config/entreprise";
import { invoices, orderItems, orders, games } from "@/db/schema";
import { incrementerCompteur, formaterNumeroFacture } from "./numerotation";
import { genererPdfFacture, type LigneFacture } from "./pdf";

async function chargerLignes(db: Database, orderId: number): Promise<LigneFacture[]> {
  const lignes = await db
    .select({
      titre: games.title,
      prixUnitaireCentimes: orderItems.unitPrice,
      quantite: orderItems.quantity,
    })
    .from(orderItems)
    .innerJoin(games, eq(orderItems.gameId, games.id))
    .where(eq(orderItems.orderId, orderId));
  return lignes;
}

export interface FactureEmise {
  id: number;
  displayNumber: string;
  pdfKey: string;
}

export async function emettreFacture(
  db: Database,
  storage: Storage,
  orderId: number,
): Promise<FactureEmise> {
  const [commande] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!commande) throw new Error(`Commande ${orderId} introuvable.`);

  const lignes = await chargerLignes(db, orderId);
  const numero = await incrementerCompteur(db, "facture");
  const displayNumber = formaterNumeroFacture("facture", numero);
  const emisLe = new Date();

  const pdf = await genererPdfFacture({
    displayNumber,
    serie: "facture",
    emisLe,
    clientEmail: commande.customerEmail,
    lignes,
    totalCentimes: commande.amountTotal,
    legalSnapshot: entreprise,
  });

  const pdfKey = `factures/${displayNumber}.pdf`;
  await storage.put(pdfKey, pdf);

  const [ligne] = await db
    .insert(invoices)
    .values({
      orderId,
      series: "facture",
      number: numero,
      displayNumber,
      pdfKey,
      legalSnapshot: entreprise,
      issuedAt: emisLe,
    })
    .returning({ id: invoices.id });

  return { id: ligne.id, displayNumber, pdfKey };
}

/** Avoir (facture d'avoir) émis en cas de remboursement : annule la facture
 * d'origine sans jamais la supprimer ni la modifier. */
export async function emettreAvoir(
  db: Database,
  storage: Storage,
  orderId: number,
  factureAnnuleeId: number,
): Promise<FactureEmise> {
  const [commande] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!commande) throw new Error(`Commande ${orderId} introuvable.`);

  const [factureAnnulee] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, factureAnnuleeId))
    .limit(1);
  if (!factureAnnulee) throw new Error(`Facture ${factureAnnuleeId} introuvable.`);

  const lignes = await chargerLignes(db, orderId);
  const numero = await incrementerCompteur(db, "avoir");
  const displayNumber = formaterNumeroFacture("avoir", numero);
  const emisLe = new Date();

  const pdf = await genererPdfFacture({
    displayNumber,
    serie: "avoir",
    numeroFactureAnnulee: factureAnnulee.displayNumber,
    emisLe,
    clientEmail: commande.customerEmail,
    lignes,
    totalCentimes: commande.amountTotal,
    legalSnapshot: entreprise,
  });

  const pdfKey = `factures/${displayNumber}.pdf`;
  await storage.put(pdfKey, pdf);

  const [ligne] = await db
    .insert(invoices)
    .values({
      orderId,
      series: "avoir",
      number: numero,
      displayNumber,
      creditedInvoiceId: factureAnnuleeId,
      pdfKey,
      legalSnapshot: entreprise,
      issuedAt: emisLe,
    })
    .returning({ id: invoices.id });

  return { id: ligne.id, displayNumber, pdfKey };
}
