// Traitement des événements Stripe (T1.8) : création de commande,
// consentement, idempotence du webhook et remboursement (avoir). Les
// dépendances externes (Stripe, Brevo) sont remplacées par des doublures :
// ce fichier ne fait jamais de vrai appel réseau.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { downloadTokens, games, invoices, orderItems, orders } from "../../db/schema";
import {
  traiterCheckoutComplete,
  traiterRemboursement,
  type EvenementCheckoutComplete,
} from "../../lib/commandes/traitement-webhook";
import { LocalDiskStorage } from "../../lib/storage/local-disk";
import type { EnvoyerEmailCommande, CommandeEmail } from "../../lib/emails/commande";

beforeAll(async () => {
  await resetTestDatabase();
});

async function creerJeu(db: ReturnType<typeof createTestDb>["db"], suffixe: string): Promise<number> {
  const [jeu] = await db
    .insert(games)
    .values({
      slug: `jeu-webhook-${suffixe}`,
      title: `Jeu webhook ${suffixe}`,
      type: "escape-game",
      public: "adultes",
      ageMin: 12,
      joueursMin: 2,
      joueursMax: 6,
      dureeMinutes: 60,
      difficulte: "moyen",
      prixEur: 1200,
      pitch: "Pitch.",
      histoire: "H.",
      contenuKit: "C.",
      preparation: "P.",
      deroule: "D.",
      faq: "F.",
      coverPath: `/games/jeu-webhook-${suffixe}/cover.webp`,
    })
    .returning({ id: games.id });
  return jeu.id;
}

function sessionCompletee(
  overrides: Partial<EvenementCheckoutComplete> & { id: string; metadata: { gameId: string } },
): EvenementCheckoutComplete {
  return {
    payment_status: "paid",
    amount_total: 1200,
    currency: "eur",
    customer_details: { email: "acheteur-webhook@example.com" },
    customer_email: null,
    consent: { terms_of_service: "accepted" },
    ...overrides,
  };
}

function creerDeps(tempDir: string, emailsEnvoyes: CommandeEmail[]) {
  const { db, sql } = createTestDb();
  const envoyerEmail: EnvoyerEmailCommande = async (commande) => {
    emailsEnvoyes.push(commande);
    return "envoye";
  };
  return {
    sql,
    deps: {
      db,
      storage: new LocalDiskStorage(tempDir),
      envoyerEmail,
      siteUrl: "https://exemple-test.invalid",
    },
  };
}

describe("traiterCheckoutComplete", () => {
  it("crée la commande, ses liens, sa facture et envoie l'email", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-webhook-test-"));
    const emails: CommandeEmail[] = [];
    const { sql, deps } = creerDeps(tempDir, emails);
    try {
      const gameId = await creerJeu(deps.db, "un");
      const resultat = await traiterCheckoutComplete(
        deps,
        sessionCompletee({ id: "sess_webhook_un", metadata: { gameId: String(gameId) } }),
      );

      expect(resultat.dejaTraite).toBe(false);
      expect(resultat.orderId).toBeDefined();

      const [commande] = await deps.db
        .select()
        .from(orders)
        .where(eq(orders.id, resultat.orderId!));
      expect(commande.status).toBe("paid");
      expect(commande.consentAt).not.toBeNull();

      const items = await deps.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, resultat.orderId!));
      expect(items).toHaveLength(1);

      const factures = await deps.db
        .select()
        .from(invoices)
        .where(eq(invoices.orderId, resultat.orderId!));
      expect(factures).toHaveLength(1);

      expect(emails).toHaveLength(1);
      expect(emails[0].email).toBe("acheteur-webhook@example.com");
      expect(emails[0].liens).toHaveLength(1);
    } finally {
      await sql.end();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("un même événement livré deux fois ne crée jamais deux commandes (Stripe : au moins une fois)", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-webhook-test-"));
    const emails: CommandeEmail[] = [];
    const { sql, deps } = creerDeps(tempDir, emails);
    try {
      const gameId = await creerJeu(deps.db, "deux");
      const session = sessionCompletee({ id: "sess_webhook_deux", metadata: { gameId: String(gameId) } });

      const premier = await traiterCheckoutComplete(deps, session);
      const second = await traiterCheckoutComplete(deps, session);

      expect(premier.dejaTraite).toBe(false);
      expect(second.dejaTraite).toBe(true);

      const commandes = await deps.db
        .select()
        .from(orders)
        .where(eq(orders.stripeSessionId, "sess_webhook_deux"));
      expect(commandes).toHaveLength(1);
      expect(emails).toHaveLength(1); // pas un deuxième email pour le même achat.
    } finally {
      await sql.end();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("ignore une session non payée (paiement asynchrone pas encore confirmé)", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-webhook-test-"));
    const emails: CommandeEmail[] = [];
    const { sql, deps } = creerDeps(tempDir, emails);
    try {
      const gameId = await creerJeu(deps.db, "trois");
      const resultat = await traiterCheckoutComplete(
        deps,
        sessionCompletee({
          id: "sess_webhook_trois",
          metadata: { gameId: String(gameId) },
          payment_status: "unpaid",
        }),
      );
      expect(resultat.dejaTraite).toBe(false);
      expect(resultat.orderId).toBeUndefined();
      const commandes = await deps.db
        .select()
        .from(orders)
        .where(eq(orders.stripeSessionId, "sess_webhook_trois"));
      expect(commandes).toHaveLength(0);
    } finally {
      await sql.end();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("traiterRemboursement", () => {
  it("émet un avoir, marque la commande remboursée et révoque les liens", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-webhook-test-"));
    const emails: CommandeEmail[] = [];
    const { sql, deps } = creerDeps(tempDir, emails);
    try {
      const gameId = await creerJeu(deps.db, "quatre");
      const session = sessionCompletee({ id: "sess_webhook_quatre", metadata: { gameId: String(gameId) } });
      const { orderId } = await traiterCheckoutComplete(deps, session);

      const resultat = await traiterRemboursement(
        deps,
        { payment_intent: "pi_quatre" },
        async () => "sess_webhook_quatre",
      );
      expect(resultat.dejaTraite).toBe(false);

      const [commande] = await deps.db.select().from(orders).where(eq(orders.id, orderId!));
      expect(commande.status).toBe("refunded");

      const factures = await deps.db.select().from(invoices).where(eq(invoices.orderId, orderId!));
      expect(factures).toHaveLength(2);
      expect(factures.some((f) => f.series === "avoir")).toBe(true);

      const items = await deps.db.select().from(orderItems).where(eq(orderItems.orderId, orderId!));
      const jetons = await deps.db
        .select()
        .from(downloadTokens)
        .where(eq(downloadTokens.orderItemId, items[0].id));
      expect(jetons.every((j) => j.revokedAt !== null)).toBe(true);

      // Idempotent : un deuxième `charge.refunded` pour la même commande
      // n'émet pas un second avoir.
      const deuxieme = await traiterRemboursement(
        deps,
        { payment_intent: "pi_quatre" },
        async () => "sess_webhook_quatre",
      );
      expect(deuxieme.dejaTraite).toBe(true);
      const facturesApres = await deps.db.select().from(invoices).where(eq(invoices.orderId, orderId!));
      expect(facturesApres).toHaveLength(2);
    } finally {
      await sql.end();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
