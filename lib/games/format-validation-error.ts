// Formatte une `FicheValidationError` en message multi-lignes lisible,
// prêt à être affiché dans la console (script `import-games`) ou dans
// une réponse d'API.
import { FicheValidationError } from "./parse-fiche";

/**
 * Produit un message d'erreur formaté pour une fiche invalide.
 *
 * @param gameDir Chemin relatif vers le dossier du jeu (ex.
 *   `content/games/mon-jeu/`).
 * @param error L'erreur de validation levée par `parseFicheFile`.
 * @returns Un message multi-lignes prêt à l'affichage.
 */
export function formatFicheValidationError(
  gameDir: string,
  error: FicheValidationError,
): string {
  const lines = [`Fiche invalide : ${gameDir}fiche.md`];
  for (const issue of error.issues) {
    lines.push(`  - ${issue.field} : ${issue.message}`);
  }
  return lines.join("\n");
}