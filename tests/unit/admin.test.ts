// Admin (T1.10) : mots de passe, sessions et création/mise à jour du
// compte unique.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { adminUsers } from "../../db/schema";
import { hasherMotDePasse, verifierMotDePasse } from "../../lib/admin/mots-de-passe";
import { creerJetonSession, verifierJetonSession } from "../../lib/admin/session";
import { creerOuMettreAJourAdmin } from "../../scripts/create-admin";

beforeAll(async () => {
  await resetTestDatabase();
  vi.stubEnv("ADMIN_SESSION_SECRET", "secret-de-test-sans-rapport-avec-la-production");
});

describe("hasherMotDePasse / verifierMotDePasse", () => {
  it("vérifie le bon mot de passe et rejette un mauvais", async () => {
    const hash = await hasherMotDePasse("mot-de-passe-correct-123");
    expect(await verifierMotDePasse("mot-de-passe-correct-123", hash)).toBe(true);
    expect(await verifierMotDePasse("autre-chose", hash)).toBe(false);
  });

  it("deux hachages du même mot de passe diffèrent (sel aléatoire)", async () => {
    const a = await hasherMotDePasse("identique-123456");
    const b = await hasherMotDePasse("identique-123456");
    expect(a).not.toBe(b);
    expect(await verifierMotDePasse("identique-123456", a)).toBe(true);
    expect(await verifierMotDePasse("identique-123456", b)).toBe(true);
  });
});

describe("creerJetonSession / verifierJetonSession", () => {
  it("un jeton valide se vérifie et retourne le bon identifiant admin", () => {
    const jeton = creerJetonSession(42);
    expect(verifierJetonSession(jeton)).toBe(42);
  });

  it("rejette un jeton sans signature valide (falsifié)", () => {
    const [adminId] = creerJetonSession(1).split(".");
    const falsifie = `${adminId}.${Date.now() + 999999}.0000000000000000000000000000000000000000000000000000000000000000`;
    expect(verifierJetonSession(falsifie)).toBeNull();
  });

  it("rejette un jeton expiré", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(0);
      const jeton = creerJetonSession(7);
      vi.setSystemTime(365 * 24 * 60 * 60 * 1000); // un an plus tard
      expect(verifierJetonSession(jeton)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejette un jeton mal formé ou absent", () => {
    expect(verifierJetonSession(undefined)).toBeNull();
    expect(verifierJetonSession("")).toBeNull();
    expect(verifierJetonSession("pas-un-jeton-valide")).toBeNull();
  });
});

describe("creerOuMettreAJourAdmin", () => {
  it("crée le compte puis met à jour le mot de passe au lieu de dupliquer", async () => {
    const { db, sql } = createTestDb();
    try {
      const premier = await creerOuMettreAJourAdmin(db, "admin@example.com", "hash-un");
      expect(premier.misAJour).toBe(false);

      const second = await creerOuMettreAJourAdmin(db, "admin@example.com", "hash-deux");
      expect(second.misAJour).toBe(true);
      expect(second.id).toBe(premier.id);

      const lignes = await db.select().from(adminUsers).where(eq(adminUsers.email, "admin@example.com"));
      expect(lignes).toHaveLength(1);
      expect(lignes[0].passwordHash).toBe("hash-deux");
    } finally {
      await sql.end();
    }
  });
});
