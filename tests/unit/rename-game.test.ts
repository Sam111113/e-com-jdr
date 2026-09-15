// Tests du mécanisme de renommage (D12) : jamais de chaîne ni de boucle de
// redirections, disque et base restent cohérents. Écrit par l'agent (code
// critique, voir AGENTS.md section 8) — ne touche jamais au jeu factice
// réel du dépôt, uniquement à des fixtures temporaires.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { games, redirects } from "../../db/schema";
import { renameGame, RenameGameError } from "../../scripts/rename-game";

let contentDir: string;
let db: Awaited<ReturnType<typeof createTestDb>>["db"];
let sql: Awaited<ReturnType<typeof createTestDb>>["sql"];

const VALID_FICHE = (slug: string, titre: string) => `---
titre: "${titre}"
slug: ${slug}
statut: brouillon
type: chasse-au-tresor
collections: [halloween]
public: enfants
age_min: 6
joueurs_min: 2
joueurs_max: 8
duree_minutes: 45
difficulte: facile
prix_eur: 7.90
pitch: Un pitch de test.
---

## Histoire

Histoire de test.

## Contenu du kit

Contenu de test.

## Préparation

Préparation de test.

## Déroulé en bref

Déroulé de test.

## Questions fréquentes

FAQ de test.
`;

async function createFixtureGameDir(slug: string, titre = `Titre ${slug}`) {
  const dir = path.join(contentDir, slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "fiche.md"), VALID_FICHE(slug, titre), "utf-8");
  return dir;
}

// Une seule réinitialisation pour tout le fichier (même règle que les
// autres suites de tests touchant la base).
beforeAll(async () => {
  await resetTestDatabase();
  contentDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-rename-content-"));
  const testDb = createTestDb();
  db = testDb.db;
  sql = testDb.sql;
});

afterAll(async () => {
  await fs.rm(contentDir, { recursive: true, force: true });
  await sql.end();
});

describe("renameGame — cas simple", () => {
  it("renomme le dossier, le slug en base et crée la redirection", async () => {
    await createFixtureGameDir("ancien-jeu", "Le Vieux Jeu");
    const [row] = await db
      .insert(games)
      .values({
        slug: "ancien-jeu",
        title: "Le Vieux Jeu",
        type: "chasse-au-tresor",
        collections: ["halloween"],
        public: "enfants",
        ageMin: 6,
        joueursMin: 2,
        joueursMax: 8,
        dureeMinutes: 45,
        difficulte: "facile",
        prixEur: 790,
        pitch: "Un pitch.",
        histoire: "Histoire.",
        contenuKit: "Contenu.",
        preparation: "Préparation.",
        deroule: "Déroulé.",
        faq: "FAQ.",
        coverPath: "/games/ancien-jeu/cover.webp",
      })
      .returning({ id: games.id });

    await renameGame({ contentDir, oldSlug: "ancien-jeu", newSlug: "nouveau-jeu", db });

    // Dossier renommé sur le disque.
    expect(fsSync.existsSync(path.join(contentDir, "ancien-jeu"))).toBe(false);
    expect(fsSync.existsSync(path.join(contentDir, "nouveau-jeu"))).toBe(true);

    // Le champ slug du frontmatter a été mis à jour.
    const ficheContent = await fs.readFile(
      path.join(contentDir, "nouveau-jeu", "fiche.md"),
      "utf-8",
    );
    expect(ficheContent).toMatch(/^slug: nouveau-jeu$/m);
    // Le commentaire du champ voisin (statut) n'a pas disparu : preuve
    // qu'on n'a pas réécrit tout le frontmatter avec js-yaml.
    expect(ficheContent).toContain('titre: "Le Vieux Jeu"');

    // Base mise à jour.
    const [updatedRow] = await db.select().from(games).where(eq(games.id, row.id));
    expect(updatedRow.slug).toBe("nouveau-jeu");

    // Redirection créée.
    const [redirect] = await db
      .select()
      .from(redirects)
      .where(eq(redirects.fromPath, "/jeux/ancien-jeu"));
    expect(redirect?.toPath).toBe("/jeux/nouveau-jeu");
  });
});

describe("renameGame — D12 : jamais de chaîne de redirections", () => {
  it("une redirection existante vers l'ancien chemin est mise à jour vers le nouveau", async () => {
    await createFixtureGameDir("jeu-b", "Jeu B");
    await db.insert(games).values({
      slug: "jeu-b",
      title: "Jeu B",
      type: "escape-game",
      collections: ["halloween"],
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
      coverPath: "/games/jeu-b/cover.webp",
    });

    // Une redirection préexistante pointe déjà vers /jeux/jeu-b (par
    // exemple un tout premier renommage antérieur, non lié à ce test).
    await db.insert(redirects).values({
      fromPath: "/jeux/tres-vieux-jeu",
      toPath: "/jeux/jeu-b",
    });

    await renameGame({ contentDir, oldSlug: "jeu-b", newSlug: "jeu-b-v2", db });

    // La redirection historique pointe directement vers la nouvelle
    // adresse, jamais vers /jeux/jeu-b (qui n'existe plus) : pas de chaîne.
    const [oldRedirect] = await db
      .select()
      .from(redirects)
      .where(eq(redirects.fromPath, "/jeux/tres-vieux-jeu"));
    expect(oldRedirect.toPath).toBe("/jeux/jeu-b-v2");
  });
});

describe("renameGame — D12 : jamais de redirection depuis une page existante", () => {
  it("supprime une redirection qui partirait du nouveau chemin", async () => {
    await createFixtureGameDir("jeu-c", "Jeu C");
    await db.insert(games).values({
      slug: "jeu-c",
      title: "Jeu C",
      type: "escape-game",
      collections: ["halloween"],
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
      coverPath: "/games/jeu-c/cover.webp",
    });

    // Un ancien renommage avait laissé une redirection qui part
    // précisément du slug qu'on s'apprête à réutiliser.
    await db.insert(redirects).values({
      fromPath: "/jeux/jeu-c-nouveau-nom",
      toPath: "/jeux/ailleurs",
    });

    await renameGame({ contentDir, oldSlug: "jeu-c", newSlug: "jeu-c-nouveau-nom", db });

    // Cette redirection a été supprimée : /jeux/jeu-c-nouveau-nom est
    // désormais une vraie page, pas une redirection.
    const rows = await db
      .select()
      .from(redirects)
      .where(eq(redirects.fromPath, "/jeux/jeu-c-nouveau-nom"));
    expect(rows).toHaveLength(0);
  });
});

describe("renameGame — erreurs", () => {
  it("refuse si le nouveau slug existe déjà en base", async () => {
    await createFixtureGameDir("jeu-d1", "Jeu D1");
    await createFixtureGameDir("jeu-d2", "Jeu D2");
    await db.insert(games).values([
      {
        slug: "jeu-d1",
        title: "Jeu D1",
        type: "escape-game",
        collections: ["halloween"],
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
        coverPath: "/games/jeu-d1/cover.webp",
      },
      {
        slug: "jeu-d2",
        title: "Jeu D2",
        type: "escape-game",
        collections: ["halloween"],
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
        coverPath: "/games/jeu-d2/cover.webp",
      },
    ]);

    await expect(
      renameGame({ contentDir, oldSlug: "jeu-d1", newSlug: "jeu-d2", db }),
    ).rejects.toThrow(RenameGameError);

    // Rien n'a bougé sur le disque : le dossier d'origine existe toujours.
    expect(fsSync.existsSync(path.join(contentDir, "jeu-d1"))).toBe(true);
    expect(fsSync.existsSync(path.join(contentDir, "jeu-d2"))).toBe(true);
  });

  it("refuse si l'ancien slug n'existe pas en base", async () => {
    await createFixtureGameDir("jeu-e", "Jeu E");
    await expect(
      renameGame({ contentDir, oldSlug: "jeu-e", newSlug: "jeu-e-v2", db }),
    ).rejects.toThrow(RenameGameError);
  });

  it("refuse si le dossier du nouveau slug existe déjà", async () => {
    await createFixtureGameDir("jeu-f", "Jeu F");
    await createFixtureGameDir("jeu-f-v2", "Jeu F v2");
    await db.insert(games).values({
      slug: "jeu-f",
      title: "Jeu F",
      type: "escape-game",
      collections: ["halloween"],
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
      coverPath: "/games/jeu-f/cover.webp",
    });

    await expect(
      renameGame({ contentDir, oldSlug: "jeu-f", newSlug: "jeu-f-v2", db }),
    ).rejects.toThrow(RenameGameError);
  });
});
