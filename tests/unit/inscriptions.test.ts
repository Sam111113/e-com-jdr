// Inscriptions (T1.9) : double opt-in, réinscription et désinscription.
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { subscriptions } from "../../db/schema";
import { inscrire } from "../../lib/inscriptions/inscrire";
import { confirmerInscription, rechercherParToken as trouverPourConfirmer } from "../../lib/inscriptions/confirmer";
import { desinscrire, rechercherParToken as trouverPourDesinscrire } from "../../lib/inscriptions/desinscrire";
import { hasherToken } from "../../lib/securite/token";

beforeAll(async () => {
  await resetTestDatabase();
});

describe("inscrire", () => {
  it("crée une inscription avec un jeton dont seul le hash est stocké", async () => {
    const { db, sql } = createTestDb();
    try {
      const { id, token } = await inscrire(db, {
        email: "un@example.com",
        type: "newsletter",
        consentText: "Vous recevrez la newsletter.",
      });

      const [ligne] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
      expect(ligne.tokenHash).toBe(hasherToken(token));
      expect(ligne.tokenHash).not.toBe(token);
      expect(ligne.confirmedAt).toBeNull();
    } finally {
      await sql.end();
    }
  });

  it("une nouvelle demande sur la même adresse régénère un jeton et redemande confirmation", async () => {
    const { db, sql } = createTestDb();
    try {
      const premiere = await inscrire(db, {
        email: "deux@example.com",
        type: "newsletter",
        consentText: "Vous recevrez la newsletter.",
      });
      await confirmerInscription(db, premiere.token);

      const seconde = await inscrire(db, {
        email: "deux@example.com",
        type: "newsletter",
        consentText: "Vous recevrez la newsletter (texte mis à jour).",
      });

      expect(seconde.id).toBe(premiere.id); // même ligne (contrainte unique), pas un doublon.
      expect(seconde.token).not.toBe(premiere.token);

      const [ligne] = await db.select().from(subscriptions).where(eq(subscriptions.id, premiere.id));
      expect(ligne.confirmedAt).toBeNull(); // redemande confirmation.
      expect(await trouverPourConfirmer(db, premiere.token)).toBeNull(); // ancien jeton mort.
    } finally {
      await sql.end();
    }
  });

  it("une même adresse peut s'inscrire séparément au jeu gratuit et à un jeu précis", async () => {
    const { db, sql } = createTestDb();
    try {
      const jeuGratuit = await inscrire(db, {
        email: "trois@example.com",
        type: "jeu_gratuit",
        consentText: "…",
      });
      const listeAttente = await inscrire(db, {
        email: "trois@example.com",
        type: "liste_attente",
        gameId: null,
        consentText: "…",
      });
      expect(jeuGratuit.id).not.toBe(listeAttente.id);
    } finally {
      await sql.end();
    }
  });
});

describe("confirmerInscription", () => {
  it("confirme puis reste idempotente sur un second appel", async () => {
    const { db, sql } = createTestDb();
    try {
      const { token } = await inscrire(db, {
        email: "quatre@example.com",
        type: "jeu_gratuit",
        consentText: "…",
      });

      const confirmee = await confirmerInscription(db, token);
      expect(confirmee?.confirmedAt).not.toBeNull();

      const dateConfirmation = confirmee!.confirmedAt;
      const reconfirmee = await confirmerInscription(db, token);
      expect(reconfirmee?.confirmedAt).toEqual(dateConfirmation); // pas réécrasée.
    } finally {
      await sql.end();
    }
  });

  it("renvoie null pour un jeton inconnu", async () => {
    const { db, sql } = createTestDb();
    try {
      expect(await confirmerInscription(db, "jeton-inexistant")).toBeNull();
    } finally {
      await sql.end();
    }
  });
});

describe("desinscrire", () => {
  it("désinscrit puis reste idempotente sur un second appel", async () => {
    const { db, sql } = createTestDb();
    try {
      const { token } = await inscrire(db, {
        email: "cinq@example.com",
        type: "newsletter",
        consentText: "…",
      });
      await confirmerInscription(db, token);

      const desinscrite = await desinscrire(db, token);
      expect(desinscrite?.unsubscribedAt).not.toBeNull();

      const dateDesinscription = desinscrite!.unsubscribedAt;
      const reDesinscrite = await desinscrire(db, token);
      expect(reDesinscrite?.unsubscribedAt).toEqual(dateDesinscription);
    } finally {
      await sql.end();
    }
  });

  it("fonctionne même sans confirmation préalable (annuler une inscription non confirmée)", async () => {
    const { db, sql } = createTestDb();
    try {
      const { token } = await inscrire(db, {
        email: "six@example.com",
        type: "newsletter",
        consentText: "…",
      });
      const resultat = await desinscrire(db, token);
      expect(resultat?.unsubscribedAt).not.toBeNull();
      expect(resultat?.confirmedAt).toBeNull();
    } finally {
      await sql.end();
    }
  });

  it("renvoie null pour un jeton inconnu", async () => {
    const { db, sql } = createTestDb();
    try {
      expect(await trouverPourDesinscrire(db, "jeton-inexistant")).toBeNull();
    } finally {
      await sql.end();
    }
  });
});
