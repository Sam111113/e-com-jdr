// Numérotation et émission des factures/avoirs (T1.8, D8). La règle
// centrale (jamais deux factures avec le même numéro dans une série) est
// déjà vérifiée au niveau base par tests/unit/db-schema.test.ts ; ici on
// vérifie la couche applicative (lib/factures).
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { games, invoices, orderItems, orders } from "../../db/schema";
import { incrementerCompteur, formaterNumeroFacture } from "../../lib/factures/numerotation";
import { emettreAvoir, emettreFacture } from "../../lib/factures/emettre";
import { LocalDiskStorage } from "../../lib/storage/local-disk";

beforeAll(async () => {
  await resetTestDatabase();
});

describe("formaterNumeroFacture", () => {
  it("préfixe par série et complète à 6 chiffres", () => {
    expect(formaterNumeroFacture("facture", 1)).toBe("F-000001");
    expect(formaterNumeroFacture("avoir", 42)).toBe("A-000042");
  });
});

describe("incrementerCompteur", () => {
  it("ne délivre jamais deux fois le même numéro, même en concurrence", async () => {
    const { db, sql } = createTestDb();
    try {
      const numeros = await Promise.all(
        Array.from({ length: 10 }, () => incrementerCompteur(db, "facture")),
      );
      expect(new Set(numeros).size).toBe(10);
    } finally {
      await sql.end();
    }
  });
});

async function creerCommandePayee(
  db: ReturnType<typeof createTestDb>["db"],
  suffixe: string,
): Promise<number> {
  const [jeu] = await db
    .insert(games)
    .values({
      slug: `jeu-facture-${suffixe}`,
      title: `Jeu facture ${suffixe}`,
      type: "escape-game",
      public: "adultes",
      ageMin: 12,
      joueursMin: 2,
      joueursMax: 6,
      dureeMinutes: 60,
      difficulte: "moyen",
      prixEur: 1490,
      pitch: "Pitch.",
      histoire: "H.",
      contenuKit: "C.",
      preparation: "P.",
      deroule: "D.",
      faq: "F.",
      coverPath: `/games/jeu-facture-${suffixe}/cover.webp`,
    })
    .returning({ id: games.id });

  const [commande] = await db
    .insert(orders)
    .values({
      stripeSessionId: `sess_facture_${suffixe}`,
      customerEmail: "client-facture@example.com",
      status: "paid",
      amountTotal: 1490,
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values({
    orderId: commande.id,
    gameId: jeu.id,
    unitPrice: 1490,
    quantity: 1,
  });

  return commande.id;
}

describe("emettreFacture / emettreAvoir", () => {
  it("émet une facture, la range dans le stockage privé et fige la config légale", async () => {
    const { db, sql } = createTestDb();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-factures-test-"));
    const storage = new LocalDiskStorage(tempDir);
    try {
      const orderId = await creerCommandePayee(db, "un");
      const facture = await emettreFacture(db, storage, orderId);

      expect(facture.displayNumber).toMatch(/^F-\d{6}$/);
      expect(await storage.exists(facture.pdfKey)).toBe(true);
      const pdf = await storage.get(facture.pdfKey);
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");

      const [ligne] = await db.select().from(invoices).where(eq(invoices.id, facture.id));
      expect(ligne.series).toBe("facture");
      expect((ligne.legalSnapshot as { raisonSociale: string }).raisonSociale).toBeDefined();
    } finally {
      await sql.end();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("un avoir référence la facture annulée, sans jamais la supprimer", async () => {
    const { db, sql } = createTestDb();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-avoir-test-"));
    const storage = new LocalDiskStorage(tempDir);
    try {
      const orderId = await creerCommandePayee(db, "deux");
      const facture = await emettreFacture(db, storage, orderId);
      const avoir = await emettreAvoir(db, storage, orderId, facture.id);

      expect(avoir.displayNumber).toMatch(/^A-\d{6}$/);

      const lignes = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
      expect(lignes).toHaveLength(2);
      const factureOriginale = lignes.find((l) => l.id === facture.id);
      const avoirEmis = lignes.find((l) => l.id === avoir.id);
      expect(factureOriginale).toBeDefined();
      expect(avoirEmis?.creditedInvoiceId).toBe(facture.id);
    } finally {
      await sql.end();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
