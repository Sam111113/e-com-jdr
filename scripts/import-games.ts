// Commande `npm run import-games` (T1.5) : importe les jeux depuis
// `content/games/<slug>/` vers la base de données, le stockage privé (kit.pdf)
// et les images optimisées dans `public/games/<slug>/`.
//
// Conçu pour être testable sans passer par la ligne de commande : exporte
// une fonction principale `importGames`, en plus du point d'entrée CLI.
//
// Important : ne JAMAIS exécuter ce script sur le dossier du jeu factice
// (`content/games/jeu-factice-chasse-au-tresor-halloween/`) depuis les tests
// — son `kit.pdf` réel serait déplacé hors du dépôt. Les tests créent leurs
// propres fixtures temporaires.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { games } from "@/db/schema";
import type { Storage } from "@/lib/storage/types";
import { createDefaultStorage } from "@/lib/storage";
import { type Database } from "@/db/client";
import { parseFicheFile, FicheValidationError } from "@/lib/games/parse-fiche";

// --- Types -----------------------------------------------------------------

export interface ImportGamesOptions {
  /** Dossier racine contenant les sous-dossiers de jeux (ex.
   * `content/games`). */
  contentDir: string;
  /** Dossier public où seront écrites les images optimisées (ex.
   * `public/games`). */
  publicDir: string;
  /** Instance de stockage privé pour `kit.pdf`. */
  storage: Storage;
  /** Client Drizzle de base de données. */
  db: Database;
  /** Slug unique optionnel : n'importe que ce jeu. */
  only?: string;
}

export interface ImportGameResult {
  slug: string;
  ok: boolean;
  /** Messages formatés, un par erreur, prêts à afficher. */
  errors?: string[];
  /** Identifiant en base (seulement si `ok === true`). */
  gameId?: number;
}

// --- Implémentation --------------------------------------------------------

export async function importGames(
  options: ImportGamesOptions,
): Promise<ImportGameResult[]> {
  const { contentDir, publicDir, storage, db, only } = options;
  const results: ImportGameResult[] = [];

  // 1. Lister les sous-dossiers.
  let entries: fs.Dirent[];
  try {
    entries = await fsp.readdir(contentDir, { withFileTypes: true });
  } catch {
    throw new Error(
      `Le dossier contentDir "${contentDir}" est introuvable ou illisible.`,
    );
  }

  const slugs: string[] = entries
    .filter((e) => e.isDirectory() && e.name !== "_modele")
    .map((e) => e.name);

  // Filtrer par `only` si demandé.
  const toProcess = only !== undefined
    ? slugs.includes(only)
      ? [only]
      : (() => {
          throw new Error(
            `Le slug "${only}" est introuvable dans "${contentDir}".`,
          );
        })()
    : slugs;

  for (const slug of toProcess) {
    try {
      const result = await importOneGame({
        contentDir,
        publicDir,
        storage,
        db,
        slug,
      });
      results.push(result);
    } catch (err) {
      // Erreur inattendue (pas une FicheValidationError) : on la remonte
      // sous forme d'échec.
      results.push({
        slug,
        ok: false,
        errors: [
          err instanceof Error ? err.message : String(err),
        ],
      });
    }
  }

  return results;
}

// --- Import d'un seul jeu --------------------------------------------------

async function importOneGame(opts: {
  contentDir: string;
  publicDir: string;
  storage: Storage;
  db: Database;
  slug: string;
}): Promise<ImportGameResult> {
  const { contentDir, publicDir, storage, db, slug } = opts;
  const gameDir = path.join(contentDir, slug);
  const fichePath = path.join(gameDir, "fiche.md");
  const errors: string[] = [];

  // (a) Vérifier la présence de fiche.md.
  if (!fs.existsSync(fichePath)) {
    return {
      slug,
      ok: false,
      errors: [`${path.relative(process.cwd(), fichePath)} est introuvable`],
    };
  }

  // (b) Parser et valider la fiche.
  let parsed;
  try {
    parsed = parseFicheFile(fichePath, slug);
  } catch (err) {
    if (err instanceof FicheValidationError) {
      // Un message par issue, pour que les tests puissent chercher
      // facilement le nom du champ fautif.
      const gameDirRel = path.relative(process.cwd(), gameDir) + "/";
      for (const issue of err.issues) {
        errors.push(
          `Fiche invalide : ${gameDirRel}fiche.md\n` +
            `  - ${issue.field} : ${issue.message}`,
        );
      }
      return { slug, ok: false, errors };
    }
    throw err;
  }

  // (c) Récupérer la ligne existante en base (pour l'idempotence du kit).
  const [existing] = await db
    .select({ kitPdfKey: games.kitPdfKey })
    .from(games)
    .where(eq(games.slug, slug));

  // (d) Vérifier les images obligatoires.
  const coverPath = path.join(gameDir, "cover.jpg");
  if (!fs.existsSync(coverPath)) {
    errors.push(
      `${path.relative(process.cwd(), coverPath)} est introuvable ` +
        `(cover.jpg est obligatoire)`,
    );
  }

  const gameDirEntries = await fsp.readdir(gameDir);
  const apercuFiles = gameDirEntries
    .filter((f) => /^apercu-\d+\.jpg$/.test(f))
    .sort();
  if (apercuFiles.length === 0) {
    errors.push(
      `${path.relative(process.cwd(), gameDir)}/apercu-*.jpg est introuvable ` +
        `(au moins un fichier apercu-1.jpg, apercu-2.jpg… est obligatoire)`,
    );
  }

  // Si des fichiers obligatoires sont absents, on s'arrête sans écrire en base.
  if (errors.length > 0) {
    return { slug, ok: false, errors };
  }

  // (e) Gestion du kit.pdf (idempotence).
  // Le fichier local n'est supprimé qu'en toute fin, une fois la base à jour :
  // si une étape suivante échoue (image corrompue, base indisponible), le kit
  // reste dans le dossier du jeu et un nouvel import peut réussir.
  const localKitPath = path.join(gameDir, "kit.pdf");
  const kitPdfKey = `games/${slug}/kit.pdf`;
  let finalKitKey: string | null = existing?.kitPdfKey ?? null;
  let removeLocalKitAfterSuccess = false;

  if (fs.existsSync(localKitPath)) {
    const kitData = await fsp.readFile(localKitPath);
    await storage.put(kitPdfKey, kitData);
    finalKitKey = kitPdfKey;
    removeLocalKitAfterSuccess = true;
  } else if (existing?.kitPdfKey) {
    // Réimport idempotent : le kit.pdf a déjà été déplacé, on conserve
    // la clé existante.
    // `finalKitKey` est déjà initialisé à `existing.kitPdfKey`.
  } else if (await storage.exists(kitPdfKey)) {
    // Kit déjà présent dans le stockage sans ligne en base (import précédent
    // interrompu) : on le rattache au lieu de bloquer le jeu.
    finalKitKey = kitPdfKey;
  } else {
    // Pas de fichier local ET pas de clé existante : erreur au premier import.
    errors.push(
      `${path.relative(process.cwd(), localKitPath)} est introuvable ` +
        `(obligatoire au premier import)`,
    );
    return { slug, ok: false, errors };
  }

  // (f) Optimiser les images avec sharp.
  const publicGameDir = path.join(publicDir, slug);
  await fsp.mkdir(publicGameDir, { recursive: true });

  // Cover → webp + avif.
  const coverWebp = path.join(publicGameDir, "cover.webp");
  const coverAvif = path.join(publicGameDir, "cover.avif");
  await sharp(coverPath)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(coverWebp);
  await sharp(coverPath)
    .resize({ width: 1600, withoutEnlargement: true })
    .avif({ quality: 55 })
    .toFile(coverAvif);
  // Chemin public de la cover : on stocke toujours le webp. Le composant
  // Next Image ou une balise `<picture>` pourra reconstruire le `.avif`
  // en changeant l'extension.
  const coverPublicPath = `/games/${slug}/cover.webp`;

  // Aperçus → webp + avif, triés par ordre alphabétique des fichiers source.
  const apercuPaths: { webp: string; avif: string }[] = [];
  for (const apercuFile of apercuFiles) {
    const sourcePath = path.join(gameDir, apercuFile);
    const baseName = path.basename(apercuFile, ".jpg");
    const webpName = `${baseName}.webp`;
    const avifName = `${baseName}.avif`;

    await sharp(sourcePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(publicGameDir, webpName));
    await sharp(sourcePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .avif({ quality: 55 })
      .toFile(path.join(publicGameDir, avifName));

    apercuPaths.push({
      webp: `/games/${slug}/${webpName}`,
      avif: `/games/${slug}/${avifName}`,
    });
  }

  // (g) Calculer le prix en centimes.
  const prixEur = Math.round(parsed.frontmatter.prix_eur * 100);

  // (h) Upsert dans la table `games`.
  const now = new Date();
  const [upserted] = await db
    .insert(games)
    .values({
      slug: parsed.slug,
      title: parsed.frontmatter.titre,
      status: parsed.frontmatter.statut,
      type: parsed.frontmatter.type,
      collections: parsed.frontmatter.collections,
      public: parsed.frontmatter.public,
      ageMin: parsed.frontmatter.age_min,
      joueursMin: parsed.frontmatter.joueurs_min,
      joueursMax: parsed.frontmatter.joueurs_max,
      dureeMinutes: parsed.frontmatter.duree_minutes,
      difficulte: parsed.frontmatter.difficulte,
      prixEur,
      pitch: parsed.frontmatter.pitch,
      histoire: parsed.histoire,
      contenuKit: parsed.contenu_kit,
      preparation: parsed.preparation,
      deroule: parsed.deroule,
      faq: parsed.faq,
      coverPath: coverPublicPath,
      apercuPaths,
      kitPdfKey: finalKitKey,
    })
    .onConflictDoUpdate({
      target: games.slug,
      set: {
        title: parsed.frontmatter.titre,
        status: parsed.frontmatter.statut,
        type: parsed.frontmatter.type,
        collections: parsed.frontmatter.collections,
        public: parsed.frontmatter.public,
        ageMin: parsed.frontmatter.age_min,
        joueursMin: parsed.frontmatter.joueurs_min,
        joueursMax: parsed.frontmatter.joueurs_max,
        dureeMinutes: parsed.frontmatter.duree_minutes,
        difficulte: parsed.frontmatter.difficulte,
        prixEur,
        pitch: parsed.frontmatter.pitch,
        histoire: parsed.histoire,
        contenuKit: parsed.contenu_kit,
        preparation: parsed.preparation,
        deroule: parsed.deroule,
        faq: parsed.faq,
        coverPath: coverPublicPath,
        apercuPaths,
        kitPdfKey: finalKitKey,
        updatedAt: now,
      },
    })
    .returning({ id: games.id });

  // (i) Tout a réussi : on peut maintenant retirer le kit du dossier du jeu.
  if (removeLocalKitAfterSuccess) {
    await fsp.unlink(localKitPath);
  }

  // (j) Succès.
  return { slug, ok: true, gameId: upserted.id };
}

// --- CLI -------------------------------------------------------------------

async function main() {
  const only = process.argv[2];
  // Import dynamique pour ne pas impacter les tests (le `db` applicatif
  // lit DATABASE_URL / DEV_DATABASE_URL).
  const { db, queryClient } = await import("@/db/client");
  let hasError = false;
  try {
    const results = await importGames({
      contentDir: path.join(process.cwd(), "content", "games"),
      publicDir: path.join(process.cwd(), "public", "games"),
      storage: createDefaultStorage(),
      db,
      only,
    });

    for (const result of results) {
      if (result.ok) {
        console.log(`✓ ${result.slug} importé (id=${result.gameId})`);
      } else {
        hasError = true;
        console.error(`✗ ${result.slug} :`);
        for (const err of result.errors ?? []) {
          console.error(`  - ${err}`);
        }
      }
    }
  } finally {
    // Indispensable : le pool `postgres-js` garde une socket ouverte, sans
    // ce `.end()` le processus Node ne se termine jamais (voir db/client.ts).
    await queryClient.end();
  }
  process.exitCode = hasError ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}