// Jetons de téléchargement (T1.8) : expiration, quota, révocation, et
// résistance à une course entre deux téléchargements simultanés sur le
// dernier essai disponible (voir lib/telechargements/tokens.ts).
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { downloadTokens, games, orderItems, orders } from "../../db/schema";
import {
  creerLienTelechargement,
  hasherToken,
  revoquerToken,
  validerEtConsommerToken,
} from "../../lib/telechargements/tokens";

beforeAll(async () => {
  await resetTestDatabase();
});

async function creerOrderItem(
  db: ReturnType<typeof createTestDb>["db"],
  suffixe: string,
): Promise<number> {
  const [jeu] = await db
    .insert(games)
    .values({
      slug: `jeu-${suffixe}`,
      title: `Jeu ${suffixe}`,
      type: "escape-game",
      public: "enfants",
      ageMin: 6,
      joueursMin: 2,
      joueursMax: 8,
      dureeMinutes: 45,
      difficulte: "facile",
      prixEur: 990,
      pitch: "Pitch.",
      histoire: "H.",
      contenuKit: "C.",
      preparation: "P.",
      deroule: "D.",
      faq: "F.",
      coverPath: `/games/jeu-${suffixe}/cover.webp`,
      kitPdfKey: `games/jeu-${suffixe}/kit.pdf`,
    })
    .returning({ id: games.id });

  const [commande] = await db
    .insert(orders)
    .values({
      stripeSessionId: `sess_${suffixe}`,
      customerEmail: "acheteur@example.com",
      status: "paid",
      amountTotal: 990,
    })
    .returning({ id: orders.id });

  const [item] = await db
    .insert(orderItems)
    .values({ orderId: commande.id, gameId: jeu.id, unitPrice: 990, quantity: 1 })
    .returning({ id: orderItems.id });

  return item.id;
}

describe("hasherToken", () => {
  it("ne stocke jamais le jeton en clair (hash déterministe, différent du jeton)", () => {
    const hash = hasherToken("abc");
    expect(hash).not.toBe("abc");
    expect(hash).toBe(hasherToken("abc"));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("validerEtConsommerToken", () => {
  it("accepte un jeton valide et incrémente son compteur", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "valide");
      const token = await creerLienTelechargement(db, orderItemId);

      const resultat = await validerEtConsommerToken(db, token);
      expect(resultat.ok).toBe(true);
      expect(resultat.jeu?.slug).toBe("jeu-valide");
      expect(resultat.emailAcheteur).toBe("acheteur@example.com");

      const [ligne] = await db
        .select({ downloadCount: downloadTokens.downloadCount })
        .from(downloadTokens)
        .where(eq(downloadTokens.tokenHash, hasherToken(token)));
      expect(ligne.downloadCount).toBe(1);
    } finally {
      await sql.end();
    }
  });

  it("refuse un jeton inconnu", async () => {
    const { db, sql } = createTestDb();
    try {
      const resultat = await validerEtConsommerToken(db, "jeton-inexistant");
      expect(resultat).toEqual({ ok: false, echec: "invalide" });
    } finally {
      await sql.end();
    }
  });

  it("refuse un jeton expiré", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "expire");
      const token = await creerLienTelechargement(db, orderItemId, { joursExpiration: -1 });
      const resultat = await validerEtConsommerToken(db, token);
      expect(resultat).toEqual({ ok: false, echec: "expire" });
    } finally {
      await sql.end();
    }
  });

  it("refuse un jeton révoqué", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "revoque");
      const token = await creerLienTelechargement(db, orderItemId);
      await db
        .update(downloadTokens)
        .set({ revokedAt: new Date() })
        .where(eq(downloadTokens.tokenHash, hasherToken(token)));
      const resultat = await validerEtConsommerToken(db, token);
      expect(resultat).toEqual({ ok: false, echec: "revoque" });
    } finally {
      await sql.end();
    }
  });

  it("refuse un jeton qui a atteint son quota", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "quota");
      const token = await creerLienTelechargement(db, orderItemId, { telechargementsMax: 1 });
      expect((await validerEtConsommerToken(db, token)).ok).toBe(true);
      expect(await validerEtConsommerToken(db, token)).toEqual({ ok: false, echec: "quota-atteint" });
    } finally {
      await sql.end();
    }
  });

  it("ne laisse jamais passer deux téléchargements simultanés sur le dernier essai", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "course");
      const token = await creerLienTelechargement(db, orderItemId, { telechargementsMax: 1 });

      const [premier, second] = await Promise.all([
        validerEtConsommerToken(db, token),
        validerEtConsommerToken(db, token),
      ]);
      const reussites = [premier, second].filter((r) => r.ok);
      expect(reussites).toHaveLength(1);
    } finally {
      await sql.end();
    }
  });
});

describe("revoquerToken", () => {
  it("révoque un jeton actif et le rend invalide", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "rev-active");
      const token = await creerLienTelechargement(db, orderItemId);

      const [ligne] = await db
        .select({ id: downloadTokens.id })
        .from(downloadTokens)
        .where(eq(downloadTokens.tokenHash, hasherToken(token)));

      const resultat = await revoquerToken(db, ligne.id);
      expect(resultat).toBe(true);

      const verification = await validerEtConsommerToken(db, token);
      expect(verification).toEqual({ ok: false, echec: "revoque" });
    } finally {
      await sql.end();
    }
  });

  it("est idempotent : révoquer deux fois retourne false la seconde fois", async () => {
    const { db, sql } = createTestDb();
    try {
      const orderItemId = await creerOrderItem(db, "rev-idem");
      const token = await creerLienTelechargement(db, orderItemId);

      const [ligne] = await db
        .select({ id: downloadTokens.id })
        .from(downloadTokens)
        .where(eq(downloadTokens.tokenHash, hasherToken(token)));

      await revoquerToken(db, ligne.id);
      const second = await revoquerToken(db, ligne.id);
      expect(second).toBe(false);
    } finally {
      await sql.end();
    }
  });

  it("retourne false pour un jeton inexistant", async () => {
    const { db, sql } = createTestDb();
    try {
      const resultat = await revoquerToken(db, 99999);
      expect(resultat).toBe(false);
    } finally {
      await sql.end();
    }
  });
});
