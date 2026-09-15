// Tests critiques du schéma (T1.5) : migrations, D8 (numérotation des
// factures sans rupture) et D12 (table `redirects`). Écrits et maintenus
// par l'agent — voir AGENTS.md section 8 (« Garde pour toi les décisions
// et le code critique »).
import { beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { games, invoiceCounters, invoices, orders, redirects } from "../../db/schema";

type PostgresErrorLike = { cause?: { constraint_name?: string; code?: string } };

/** Récupère l'erreur rejetée par une promesse, avec un typage exploitable. */
async function getRejection(promise: Promise<unknown>): Promise<PostgresErrorLike> {
  try {
    await promise;
  } catch (error) {
    return error as PostgresErrorLike;
  }
  throw new Error("La promesse aurait dû être rejetée.");
}

// Une seule réinitialisation pour tout le fichier : chaque `describe`
// ci-dessous suppose une base fraîchement migrée, mais partage ensuite le
// même état (avec des identifiants distincts par test) plutôt que de
// redémarrer `DROP SCHEMA` à chaque suite — `beforeAll` de plusieurs
// `describe` d'un même fichier ne sont pas garantis strictement séquentiels
// vis-à-vis des `it` déjà en cours d'une autre suite.
beforeAll(async () => {
  await resetTestDatabase();
});

describe("migrations sur une base de test vide", () => {
  it("crée toutes les tables attendues", async () => {
    const { db, sql: client } = createTestDb();
    try {
      const rows = await client<{ table_name: string }[]>`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
      `;
      const tableNames = rows.map((r) => r.table_name);
      expect(tableNames).toEqual([
        "admin_users",
        "download_tokens",
        "games",
        "invoice_counters",
        "invoices",
        "order_items",
        "orders",
        "redirects",
        "subscriptions",
      ]);
      // Un aller-retour Drizzle simple confirme que le client applicatif
      // (pas seulement psql) voit bien le schéma.
      expect(await db.select().from(games)).toEqual([]);
    } finally {
      await client.end();
    }
  });

});

describe("D8 — invoice_counters (numérotation des factures sans rupture)", () => {
  it("initialise les deux séries à 0 dès la migration", async () => {
    const { db, sql: client } = createTestDb();
    try {
      const rows = await db
        .select()
        .from(invoiceCounters)
        .orderBy(invoiceCounters.series);
      // Postgres trie un `enum` selon son ordre de déclaration
      // ('facture' avant 'avoir', voir db/schema.ts), pas alphabétiquement.
      expect(rows).toEqual([
        { series: "facture", lastNumber: 0 },
        { series: "avoir", lastNumber: 0 },
      ]);
    } finally {
      await client.end();
    }
  });

  it("incrémente via UPDATE ... RETURNING, jamais via une séquence", async () => {
    const { db, sql: client } = createTestDb();
    try {
      const [row] = await db
        .update(invoiceCounters)
        .set({ lastNumber: sql`${invoiceCounters.lastNumber} + 1` })
        .where(sql`${invoiceCounters.series} = 'facture'`)
        .returning({ lastNumber: invoiceCounters.lastNumber });
      expect(row.lastNumber).toBe(1);
    } finally {
      await client.end();
    }
  });

  it("refuse deux factures avec le même (series, number)", async () => {
    const { db, sql: client } = createTestDb();
    try {
      const [order] = await db
        .insert(orders)
        .values({
          stripeSessionId: "sess_test_1",
          customerEmail: "client@example.com",
          amountTotal: 1000,
        })
        .returning({ id: orders.id });

      await db.insert(invoices).values({
        orderId: order.id,
        series: "facture",
        number: 1,
        displayNumber: "F-000001",
        legalSnapshot: {},
      });

      const attempt = db.insert(invoices).values({
        orderId: order.id,
        series: "facture",
        number: 1,
        displayNumber: "F-000001-bis",
        legalSnapshot: {},
      });
      // `postgres` place le détail (code, contrainte) dans `error.cause`,
      // Drizzle ne fait que l'envelopper dans « Failed query: … ».
      const error = await getRejection(attempt);
      expect(error.cause?.constraint_name).toBe("invoices_series_number_unique");
      expect(error.cause?.code).toBe("23505"); // violation de contrainte unique
    } finally {
      await client.end();
    }
  });

  it("autorise le même numéro dans des séries différentes (facture et avoir)", async () => {
    const { db, sql: client } = createTestDb();
    try {
      const [order] = await db
        .insert(orders)
        .values({
          stripeSessionId: "sess_test_2",
          customerEmail: "client2@example.com",
          amountTotal: 1000,
        })
        .returning({ id: orders.id });

      await db.insert(invoices).values({
        orderId: order.id,
        series: "facture",
        number: 42,
        displayNumber: "F-000042",
        legalSnapshot: {},
      });

      await expect(
        db.insert(invoices).values({
          orderId: order.id,
          series: "avoir",
          number: 42,
          displayNumber: "A-000042",
          legalSnapshot: {},
        }),
      ).resolves.toBeDefined();
    } finally {
      await client.end();
    }
  });
});

describe("D12 — table redirects", () => {
  it("accepte une redirection normale", async () => {
    const { db, sql: client } = createTestDb();
    try {
      await expect(
        db.insert(redirects).values({
          fromPath: "/jeux/ancien-slug",
          toPath: "/jeux/nouveau-slug",
        }),
      ).resolves.toBeDefined();
    } finally {
      await client.end();
    }
  });

  it("refuse une boucle triviale (from_path = to_path)", async () => {
    const { db, sql: client } = createTestDb();
    try {
      const attempt = db.insert(redirects).values({
        fromPath: "/jeux/boucle",
        toPath: "/jeux/boucle",
      });
      const error = await getRejection(attempt);
      expect(error.cause?.constraint_name).toBe("redirects_no_self_loop");
      expect(error.cause?.code).toBe("23514"); // violation de contrainte CHECK
    } finally {
      await client.end();
    }
  });
});

// Placé en dernier à dessein : `resetTestDatabase` est destructeur
// (`DROP SCHEMA public CASCADE`), il ne doit s'exécuter qu'une fois toutes
// les autres suites de ce fichier terminées.
describe("migrations rejouées (idempotence)", () => {
  it("peut réappliquer les migrations sans erreur", async () => {
    await expect(resetTestDatabase()).resolves.not.toThrow();
  });
});
