// Tests d'intégration du script `import-games`. Crée des fixtures
// temporaires (ne touche JAMAIS au jeu factice du dépôt).
// Voir T1.5 et docs/DECISIONS.md D15.
import {
  beforeAll,
  afterAll,
  describe,
  it,
  expect,
} from "vitest";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { resetTestDatabase, createTestDb } from "../../db/test-utils";
import { games } from "../../db/schema";
import { LocalDiskStorage } from "../../lib/storage/local-disk";
import type { Storage } from "../../lib/storage/types";
import { importGames, type ImportGamesOptions } from "../../scripts/import-games";

// --- Fixtures globales -----------------------------------------------------

let contentDir: string;
let publicDir: string;
let storageDir: string;
let storage: Storage;
let db: Awaited<ReturnType<typeof createTestDb>>["db"];
let sql: Awaited<ReturnType<typeof createTestDb>>["sql"];

// Une seule réinitialisation pour tout le fichier (même règle que
// `db-schema.test.ts`).
beforeAll(async () => {
  await resetTestDatabase();

  // Créer les dossiers temporaires.
  contentDir = await fsp.mkdtemp(path.join(os.tmpdir(), "ecomjdr-import-content-"));
  publicDir = await fsp.mkdtemp(path.join(os.tmpdir(), "ecomjdr-import-public-"));
  storageDir = await fsp.mkdtemp(path.join(os.tmpdir(), "ecomjdr-import-storage-"));
  storage = new LocalDiskStorage(storageDir);

  const testDb = createTestDb();
  db = testDb.db;
  sql = testDb.sql;
});

afterAll(async () => {
  await fsp.rm(contentDir, { recursive: true, force: true });
  await fsp.rm(publicDir, { recursive: true, force: true });
  await fsp.rm(storageDir, { recursive: true, force: true });
  await sql.end();
});

// --- Helpers ---------------------------------------------------------------

/** Options de base pour `importGames` pointant vers les fixtures temporaires. */
function makeOptions(overrides?: Partial<ImportGamesOptions>): ImportGamesOptions {
  return {
    contentDir,
    publicDir,
    storage,
    db,
    ...overrides,
  };
}

/** Génère une petite image JPEG de test (carré 100×100 rouge). */
async function generateTestJpeg(filePath: string): Promise<void> {
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .jpeg({ quality: 80 })
    .toFile(filePath);
}

/** Génère un damier noir et blanc 1200×1200 (cases de 8 px), très contrasté. */
async function generateCheckerboardJpeg(filePath: string): Promise<void> {
  const size = 1200;
  const pixels = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0 ? 0 : 255;
      pixels.fill(value, (y * size + x) * 3, (y * size + x) * 3 + 3);
    }
  }
  await sharp(pixels, { raw: { width: size, height: size, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(filePath);
}

/** Construit un jeu fixture complet dans `contentDir`. */
async function createFixtureGame(
  slug: string,
  overrides?: {
    ficheExtra?: string;
    skipCover?: boolean;
    skipApercu?: boolean;
    skipKit?: boolean;
  },
): Promise<string> {
  const gameDir = path.join(contentDir, slug);
  await fsp.mkdir(gameDir, { recursive: true });

  // fiche.md valide par défaut.
  const ficheContent = `---
titre: "Test ${slug}"
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
${overrides?.ficheExtra ?? ""}
---

## Histoire

Histoire de test.

## Contenu du kit

Contenu du kit de test.

## Préparation

Préparation de test.

## Déroulé en bref

Déroulé de test.

## Questions fréquentes

FAQ de test.
`;
  await fsp.writeFile(path.join(gameDir, "fiche.md"), ficheContent, "utf-8");

  // cover.jpg (sauf si skipCover).
  if (!overrides?.skipCover) {
    await generateTestJpeg(path.join(gameDir, "cover.jpg"));
  }

  // apercu-1.jpg (sauf si skipApercu).
  if (!overrides?.skipApercu) {
    await generateTestJpeg(path.join(gameDir, "apercu-1.jpg"));
  }

  // kit.pdf factice (pas un vrai PDF, mais un buffer non vide — le
  // contenu exact n'a pas d'importance, seul le déplacement compte).
  if (!overrides?.skipKit) {
    await fsp.writeFile(
      path.join(gameDir, "kit.pdf"),
      Buffer.from("%PDF-1.4 kit de test factice"),
    );
  }

  return gameDir;
}

// --- Tests -----------------------------------------------------------------

describe("importGames — import complet", () => {
  it("import d'un jeu valide en une seule commande", async () => {
    const slug = "test-import-complet";
    await createFixtureGame(slug);

    const results = await importGames(makeOptions({ only: slug }));

    expect(results).toHaveLength(1);
    const result = results[0];
    expect(result.ok).toBe(true);
    expect(result.gameId).toBeGreaterThan(0);

    // Vérifier la ligne en base.
    const [row] = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug));

    expect(row).toBeDefined();
    expect(row.title).toBe(`Test ${slug}`);
    expect(row.ageMin).toBe(6);
    expect(row.prixEur).toBe(790); // 7.90 € en centimes
    expect(row.coverPath).toBe(`/games/${slug}/cover.webp`);

    // Les images optimisées existent dans publicDir.
    const coverWebp = path.join(publicDir, slug, "cover.webp");
    const coverAvif = path.join(publicDir, slug, "cover.avif");
    expect(fs.existsSync(coverWebp)).toBe(true);
    expect(fs.existsSync(coverAvif)).toBe(true);

    const apercuWebp = path.join(publicDir, slug, "apercu-1.webp");
    expect(fs.existsSync(apercuWebp)).toBe(true);

    // apercuPaths pointe vers des chemins publics corrects.
    const apercuPaths = row.apercuPaths as { webp: string; avif: string }[];
    expect(apercuPaths).toHaveLength(1);
    expect(apercuPaths[0].webp).toBe(`/games/${slug}/apercu-1.webp`);
    expect(apercuPaths[0].avif).toBe(`/games/${slug}/apercu-1.avif`);

    // Le kit.pdf n'existe PLUS dans le dossier source (déplacé).
    expect(fs.existsSync(path.join(contentDir, slug, "kit.pdf"))).toBe(false);

    // Le kit.pdf existe BIEN dans le storage.
    const kitExists = await storage.exists(`games/${slug}/kit.pdf`);
    expect(kitExists).toBe(true);

    // Le kitPdfKey est correct.
    expect(row.kitPdfKey).toBe(`games/${slug}/kit.pdf`);
  });
});

describe("importGames — réimport idempotent", () => {
  it("deuxième import sans kit.pdf local → réussit en réutilisant la clé", async () => {
    const slug = "test-reimport";
    await createFixtureGame(slug);

    // Premier import.
    const results1 = await importGames(makeOptions({ only: slug }));
    expect(results1[0].ok).toBe(true);

    // Vérifier que kit.pdf a bien été supprimé.
    expect(fs.existsSync(path.join(contentDir, slug, "kit.pdf"))).toBe(false);

    // Deuxième import (sans kit.pdf local).
    const results2 = await importGames(makeOptions({ only: slug }));
    expect(results2).toHaveLength(1);
    expect(results2[0].ok).toBe(true);

    // Vérifier que la ligne en base a toujours le kitPdfKey.
    const [row] = await db
      .select({ kitPdfKey: games.kitPdfKey })
      .from(games)
      .where(eq(games.slug, slug));

    expect(row.kitPdfKey).toBe(`games/${slug}/kit.pdf`);
  });
});

describe("importGames — reprise après un import interrompu", () => {
  it("échec après l'envoi du kit (image corrompue) → kit.pdf local conservé, puis réimport réussi", async () => {
    const slug = "test-image-corrompue";
    const gameDir = await createFixtureGame(slug);
    const apercuPath = path.join(gameDir, "apercu-1.jpg");
    await fsp.writeFile(apercuPath, Buffer.from("pas une image"));

    const results1 = await importGames(makeOptions({ only: slug }));
    expect(results1[0].ok).toBe(false);

    // Le kit n'a pas été retiré du dossier, et rien n'a été écrit en base.
    expect(fs.existsSync(path.join(gameDir, "kit.pdf"))).toBe(true);
    const rows = await db.select().from(games).where(eq(games.slug, slug));
    expect(rows).toHaveLength(0);

    // Une fois l'image corrigée, l'import aboutit et le kit est déplacé.
    await generateTestJpeg(apercuPath);
    const results2 = await importGames(makeOptions({ only: slug }));
    expect(results2[0].ok).toBe(true);
    expect(fs.existsSync(path.join(gameDir, "kit.pdf"))).toBe(false);
    expect(await storage.exists(`games/${slug}/kit.pdf`)).toBe(true);
  });

  it("kit déjà dans le stockage mais absent en base → import réussi sans kit local", async () => {
    const slug = "test-kit-deja-stocke";
    await createFixtureGame(slug, { skipKit: true });
    await storage.put(`games/${slug}/kit.pdf`, Buffer.from("%PDF-1.4 kit déjà stocké"));

    const results = await importGames(makeOptions({ only: slug }));
    expect(results[0].ok).toBe(true);

    const [row] = await db
      .select({ kitPdfKey: games.kitPdfKey })
      .from(games)
      .where(eq(games.slug, slug));
    expect(row.kitPdfKey).toBe(`games/${slug}/kit.pdf`);
  });
});

describe("importGames — erreurs claires", () => {
  it("fiche sans age_min → erreur mentionnant age_min", async () => {
    const slug = "test-sans-age-min";
    await createFixtureGame(slug, {
      ficheExtra: "",
    });
    // Supprimer age_min du fiche.md.
    const fichePath = path.join(contentDir, slug, "fiche.md");
    let content = await fsp.readFile(fichePath, "utf-8");
    content = content.replace("age_min: 6\n", "");
    await fsp.writeFile(fichePath, content, "utf-8");

    const results = await importGames(makeOptions({ only: slug }));
    expect(results[0].ok).toBe(false);
    const hasAgeMinError = results[0].errors?.some((e) =>
      e.includes("age_min"),
    );
    expect(hasAgeMinError).toBe(true);
  });

  it("jeu sans cover.jpg → erreur mentionnant cover.jpg", async () => {
    const slug = "test-sans-cover";
    await createFixtureGame(slug, { skipCover: true });

    const results = await importGames(makeOptions({ only: slug }));
    expect(results[0].ok).toBe(false);
    const hasCoverError = results[0].errors?.some((e) =>
      e.includes("cover.jpg"),
    );
    expect(hasCoverError).toBe(true);
  });

  it("jeu sans apercu-*.jpg → erreur mentionnant apercu-*.jpg", async () => {
    const slug = "test-sans-apercu";
    await createFixtureGame(slug, { skipApercu: true });

    const results = await importGames(makeOptions({ only: slug }));
    expect(results[0].ok).toBe(false);
    const hasApercuError = results[0].errors?.some((e) =>
      e.includes("apercu-*.jpg"),
    );
    expect(hasApercuError).toBe(true);
  });

  it("slug inexistant → lève une erreur", async () => {
    await expect(
      importGames(makeOptions({ only: "slug-inexistant" })),
    ).rejects.toThrow(/slug-inexistant/);
  });
});

describe("importGames — cas supplémentaires", () => {
  it("crée les images optimisées avec les bonnes dimensions max", async () => {
    const slug = "test-dimensions";
    await createFixtureGame(slug);

    const results = await importGames(makeOptions({ only: slug }));
    expect(results[0].ok).toBe(true);

    // Vérifier que cover.webp existe et a des métadonnées correctes.
    const coverMeta = await sharp(
      path.join(publicDir, slug, "cover.webp"),
    ).metadata();
    // L'image source fait 100×100, le resize with withoutEnlargement ne
    // l'agrandit pas → reste à 100×100.
    expect(coverMeta.width).toBeLessThanOrEqual(1600);
    expect(coverMeta.width).toBe(100); // Image source déjà plus petite

    // Vérifier que apercu-1.webp existe.
    const apercuMeta = await sharp(
      path.join(publicDir, slug, "apercu-1.webp"),
    ).metadata();
    expect(apercuMeta.width).toBeLessThanOrEqual(1200);
  });

  it("floute les aperçus mais pas la couverture, et crée chaque largeur (T1.6)", async () => {
    const slug = "test-apercus-floutes";
    const gameDir = await createFixtureGame(slug);
    // Même damier très contrasté pour la couverture et l'aperçu : seul le
    // flou peut expliquer une différence de contraste en sortie.
    await generateCheckerboardJpeg(path.join(gameDir, "cover.jpg"));
    await generateCheckerboardJpeg(path.join(gameDir, "apercu-1.jpg"));

    const results = await importGames(makeOptions({ only: slug }));
    expect(results[0].ok).toBe(true);

    const contrast = async (file: string) => {
      const { channels } = await sharp(path.join(publicDir, slug, file)).stats();
      return channels[0].stdev;
    };
    const coverContrast = await contrast("cover.webp");
    expect(coverContrast).toBeGreaterThan(80);
    expect(await contrast("apercu-1.webp")).toBeLessThan(coverContrast * 0.6);
    expect(await contrast("apercu-1-600.webp")).toBeLessThan(coverContrast * 0.6);

    for (const file of [
      "cover-480.webp",
      "cover-480.avif",
      "cover-960.webp",
      "cover-960.avif",
      "apercu-1-600.webp",
      "apercu-1-600.avif",
    ]) {
      expect(fs.existsSync(path.join(publicDir, slug, file)), file).toBe(true);
    }
  });

  it("ne traite pas le dossier _modele", async () => {
    // Créer un dossier _modele dans contentDir (simule une erreur).
    await fsp.mkdir(path.join(contentDir, "_modele"), { recursive: true });
    await fsp.writeFile(
      path.join(contentDir, "_modele", "fiche.md"),
      "---\ntitre: Modele\nslug: modele\n---",
      "utf-8",
    );

    // Créer aussi un jeu valide pour tester.
    const slug = "test-ignore-modele";
    await createFixtureGame(slug);

    const results = await importGames(makeOptions());
    // Ne doit pas planter à cause de _modele, et doit importer le jeu valide.
    const testResult = results.find((r) => r.slug === slug);
    expect(testResult?.ok).toBe(true);
  });
});