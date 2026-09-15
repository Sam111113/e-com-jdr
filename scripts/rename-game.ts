// Commande `npm run rename-game <ancien-slug> <nouveau-slug>` (T1.5, D12).
//
// Mécanisme choisi pour détecter/traiter un changement de slug : une
// commande explicite, plutôt qu'une détection automatique par
// `import-games`. Raison (voir docs/PLAN.md et docs/DECISIONS.md D12) :
// le modèle de fiche appartient à l'équipe et ne doit pas recevoir un
// identifiant stable sans sa validation ; sans identifiant stable, il est
// impossible de distinguer fiablement « ce dossier a été renommé » de
// « ce dossier a été supprimé et un autre a été créé ». Une commande
// explicite lève toute ambiguïté.
//
// Ce script est volontairement gardé pour l'agent (pas délégué à
// worker-code) : il touche à l'intégrité des redirections 301 (SEO déjà
// indexé) et à la cohérence base/disque — voir AGENTS.md section 8.
//
// Garanties appliquées (D12) :
// - jamais de CHAÎNE de redirections : toute redirection existante qui
//   pointait vers l'ancien chemin est mise à jour pour pointer directement
//   vers le nouveau ;
// - jamais de redirection depuis un chemin qui correspond à une page
//   existante : si une redirection partait déjà du nouveau chemin (cas
//   rare : renommage vers un slug qui a été un ancien slug par le passé),
//   elle est supprimée puisque ce chemin devient une vraie page ;
// - la base de données et le disque sont modifiés dans cet ordre : DISQUE
//   d'abord (renommage du dossier + champ `slug` de fiche.md), puis BASE
//   (transaction). Si la transaction échoue, le renommage du disque est
//   annulé (rollback manuel), pour ne jamais laisser le disque et la base
//   dans un état incohérent.
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { games, redirects } from "@/db/schema";
import { parseFicheFile, FicheValidationError } from "@/lib/games/parse-fiche";
import { formatFicheValidationError } from "@/lib/games/format-validation-error";

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

class RenameGameError extends Error {}

/**
 * Remplace la ligne `slug: ...` dans le bloc frontmatter d'un fichier
 * `fiche.md`, sans toucher au reste du fichier (commentaires, mise en
 * forme). Une réécriture complète via gray-matter/js-yaml perdrait les
 * commentaires `# brouillon | publie` du modèle d'équipe.
 */
function replaceSlugLine(fileContent: string, newSlug: string): string {
  const lines = fileContent.split("\n");
  if (lines[0].trim() !== "---") {
    throw new RenameGameError(
      "fiche.md ne commence pas par '---' : structure de frontmatter inattendue.",
    );
  }
  const frontmatterEndIdx = lines.findIndex(
    (line, idx) => idx > 0 && line.trim() === "---",
  );
  if (frontmatterEndIdx === -1) {
    throw new RenameGameError(
      "fiche.md : fin du frontmatter ('---') introuvable.",
    );
  }

  let slugLineIdx = -1;
  for (let i = 1; i < frontmatterEndIdx; i++) {
    if (/^slug\s*:/.test(lines[i])) {
      if (slugLineIdx !== -1) {
        throw new RenameGameError(
          "fiche.md contient plusieurs lignes 'slug:' dans le frontmatter.",
        );
      }
      slugLineIdx = i;
    }
  }
  if (slugLineIdx === -1) {
    throw new RenameGameError(
      "fiche.md : aucune ligne 'slug:' trouvée dans le frontmatter.",
    );
  }

  lines[slugLineIdx] = `slug: ${newSlug}`;
  return lines.join("\n");
}

interface RenameGameOptions {
  contentDir: string;
  oldSlug: string;
  newSlug: string;
  db: typeof import("@/db/client").db;
}

async function renameGame(options: RenameGameOptions): Promise<void> {
  const { contentDir, oldSlug, newSlug, db } = options;

  // --- 1. Validations de forme -------------------------------------------
  if (!KEBAB_CASE_RE.test(oldSlug) || !KEBAB_CASE_RE.test(newSlug)) {
    throw new RenameGameError(
      "les deux slugs doivent être en kebab-case (minuscules, chiffres, " +
        "traits d'union).",
    );
  }
  if (oldSlug === newSlug) {
    throw new RenameGameError("l'ancien et le nouveau slug sont identiques.");
  }

  const oldDir = path.join(contentDir, oldSlug);
  const newDir = path.join(contentDir, newSlug);
  const oldFiche = path.join(oldDir, "fiche.md");

  if (!fs.existsSync(oldDir)) {
    throw new RenameGameError(
      `${path.relative(process.cwd(), oldDir)} est introuvable.`,
    );
  }
  if (fs.existsSync(newDir)) {
    throw new RenameGameError(
      `${path.relative(process.cwd(), newDir)} existe déjà : choisis un ` +
        "autre nouveau slug, ou supprime ce dossier s'il ne devrait pas " +
        "exister.",
    );
  }
  if (!fs.existsSync(oldFiche)) {
    throw new RenameGameError(
      `${path.relative(process.cwd(), oldFiche)} est introuvable.`,
    );
  }

  // --- 2. La fiche actuelle doit déjà être valide et cohérente -----------
  // (on refuse de renommer une fiche cassée : mieux vaut la corriger
  // d'abord avec `npm run import-games`, qui donnera les mêmes erreurs).
  try {
    parseFicheFile(oldFiche, oldSlug);
  } catch (err) {
    if (err instanceof FicheValidationError) {
      throw new RenameGameError(
        "la fiche actuelle est invalide, corrige-la avant de la renommer " +
          "(voir aussi `npm run import-games`) :\n" +
          formatFicheValidationError(
            path.relative(process.cwd(), oldDir) + "/",
            err,
          ),
      );
    }
    throw err;
  }

  // --- 3. Le jeu doit exister en base sous l'ancien slug -----------------
  const [existingOld] = await db
    .select({ id: games.id })
    .from(games)
    .where(eq(games.slug, oldSlug));
  if (!existingOld) {
    throw new RenameGameError(
      `aucun jeu avec le slug "${oldSlug}" en base : lance ` +
        "`npm run import-games` avant de le renommer, ou renomme " +
        "simplement le dossier à la main s'il n'a encore jamais été importé.",
    );
  }
  const [existingNew] = await db
    .select({ id: games.id })
    .from(games)
    .where(eq(games.slug, newSlug));
  if (existingNew) {
    throw new RenameGameError(
      `un jeu avec le slug "${newSlug}" existe déjà en base (id=${existingNew.id}).`,
    );
  }

  // --- 4. Disque d'abord : renommer le dossier + le champ slug -----------
  fs.renameSync(oldDir, newDir);
  let fsRenamed = true;
  try {
    const newFiche = path.join(newDir, "fiche.md");
    const original = fs.readFileSync(newFiche, "utf-8");
    fs.writeFileSync(newFiche, replaceSlugLine(original, newSlug), "utf-8");
  } catch (err) {
    // Revenir en arrière si la réécriture du frontmatter échoue.
    fs.renameSync(newDir, oldDir);
    fsRenamed = false;
    throw err;
  }

  // --- 5. Base de données, en une seule transaction ----------------------
  const oldPath = `/jeux/${oldSlug}`;
  const newPath = `/jeux/${newSlug}`;

  try {
    await db.transaction(async (tx) => {
      // (a) Renomme le jeu lui-même.
      const [updated] = await tx
        .update(games)
        .set({ slug: newSlug, updatedAt: new Date() })
        .where(eq(games.slug, oldSlug))
        .returning({ id: games.id });
      if (!updated) {
        throw new RenameGameError(
          `le jeu "${oldSlug}" a disparu de la base pendant l'opération.`,
        );
      }

      // (b) Jamais de chaîne : toute redirection qui pointait vers
      // l'ancien chemin pointe désormais directement vers le nouveau.
      await tx
        .update(redirects)
        .set({ toPath: newPath })
        .where(eq(redirects.toPath, oldPath));

      // (c) Jamais de redirection depuis une page qui existe réellement :
      // le nouveau chemin est maintenant une vraie page, on supprime toute
      // redirection qui partirait de ce chemin (cas rare : le nouveau
      // slug a été un ancien slug par le passé).
      await tx.delete(redirects).where(eq(redirects.fromPath, newPath));

      // (d) Enregistre la redirection ancien → nouveau (301). `ON CONFLICT`
      // au cas où une redirection partait déjà de l'ancien chemin (rare,
      // même remarque qu'au (c), mais dans l'autre sens).
      await tx
        .insert(redirects)
        .values({ fromPath: oldPath, toPath: newPath })
        .onConflictDoUpdate({
          target: redirects.fromPath,
          set: { toPath: newPath },
        });
    });
  } catch (err) {
    // La transaction a échoué : annuler le renommage sur le disque pour ne
    // jamais laisser le disque et la base incohérents entre eux.
    if (fsRenamed) {
      fs.renameSync(newDir, oldDir);
      const revertedFiche = path.join(oldDir, "fiche.md");
      const content = fs.readFileSync(revertedFiche, "utf-8");
      fs.writeFileSync(revertedFiche, replaceSlugLine(content, oldSlug), "utf-8");
    }
    throw err;
  }

  console.log(`✓ ${oldSlug} renommé en ${newSlug}`);
  console.log(`  - dossier : ${path.relative(process.cwd(), newDir)}`);
  console.log(`  - redirection 301 enregistrée : ${oldPath} → ${newPath}`);
  console.log(
    "  - pense à relancer `npm run import-games` pour regénérer les " +
      "images publiques sous le nouveau slug si besoin, et à redéployer.",
  );
}

// --- CLI ---------------------------------------------------------------

async function main() {
  const [oldSlug, newSlug] = process.argv.slice(2);
  if (!oldSlug || !newSlug) {
    console.error("Usage : npm run rename-game <ancien-slug> <nouveau-slug>");
    process.exitCode = 1;
    return;
  }

  const { db, queryClient } = await import("@/db/client");
  try {
    await renameGame({
      contentDir: path.join(process.cwd(), "content", "games"),
      oldSlug,
      newSlug,
      db,
    });
  } catch (err) {
    console.error(
      `✗ ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exitCode = 1;
  } finally {
    // Indispensable, voir scripts/import-games.ts et db/client.ts pour
    // l'explication complète (le pool postgres-js garde une socket ouverte).
    await queryClient.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { renameGame, RenameGameError };
