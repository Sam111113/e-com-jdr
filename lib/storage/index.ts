// Point d'entrée unique pour le stockage privé. Exporte une instance par
// défaut prête à l'emploi (`storage`) et la fonction de création pour les
// tests ou les cas particuliers.
import path from "node:path";
import { LocalDiskStorage } from "./local-disk";
import type { Storage } from "./types";

export type { Storage } from "./types";
export { LocalDiskStorage } from "./local-disk";

/**
 * Crée l'instance de stockage par défaut en fonction de la variable
 * d'environnement `STORAGE_PRIVATE_DIR` :
 * - si elle est définie, c'est le chemin absolu vers le dossier privé
 *   (utilisé sur le VPS en staging/production, typiquement `/data/private`
 *   monté par un volume Docker) ;
 * - sinon, utilise `data/private` à la racine du dépôt (développement
 *   local et tests).
 */
export function createDefaultStorage(): Storage {
  const dir =
    process.env.STORAGE_PRIVATE_DIR ??
    path.join(process.cwd(), "data", "private");
  return new LocalDiskStorage(dir);
}

/** Instance partagée de stockage pour un usage simple dans le code
 * applicatif. */
export const storage: Storage = createDefaultStorage();