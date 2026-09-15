// Implémentation locale (disque) de l'interface `Storage` pour le
// développement et la production sur les volumes Docker du VPS.
// Voir docs/DECISIONS.md D3 pour les règles de sécurité.
import fs from "node:fs/promises";
import path from "node:path";
import type { Storage } from "./types";

/** Dossier racine du stockage privé, hors webroot. */
export class LocalDiskStorage implements Storage {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
  }

  /**
   * Valide et résout une clé en chemin absolu dans `baseDir`.
   * Lève une erreur si la clé tente une traversée de répertoire (`..`,
   * chemin absolu, ou résolution hors de `baseDir`).
   */
  private resolveKey(key: string): string {
    // Rejeter les chemins absolus (commençant par `/` ou `\ `).
    if (path.isAbsolute(key)) {
      throw new Error(
        `Clé de stockage invalide : "${key}" est un chemin absolu. ` +
          `Les clés doivent être des chemins relatifs avec des segments séparés par "/".`,
      );
    }

    // Rejeter les tentatives de traversée de répertoire (`..`).
    // On normalise le chemin puis on vérifie qu'aucun segment n'est `..`.
    const segments = key.replace(/\\/g, "/").split("/");
    for (const segment of segments) {
      if (segment === "..") {
        throw new Error(
          `Clé de stockage invalide : "${key}" contient "..". ` +
            `Les traversées de répertoire sont interdites.`,
        );
      }
    }

    const resolved = path.resolve(this.baseDir, key);

    // Vérification supplémentaire : le chemin résolu doit commencer par
    // `baseDir` (protection contre les attaques par lien symbolique ou
    // toute autre ruse de `path.resolve`).
    if (!resolved.startsWith(this.baseDir + path.sep) && resolved !== this.baseDir) {
      throw new Error(
        `Clé de stockage invalide : "${key}" tente de sortir du dossier ` +
          `de stockage autorisé.`,
      );
    }

    return resolved;
  }

  async put(key: string, data: Buffer): Promise<void> {
    const filePath = this.resolveKey(key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, data);
  }

  async get(key: string): Promise<Buffer> {
    const filePath = this.resolveKey(key);
    return fs.readFile(filePath);
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolveKey(key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolveKey(key);
    await fs.unlink(filePath);
  }

  /** Placeholder : T1.8 remplacera ceci par une vraie route de
   * téléchargement signée. Ce placeholder n'est pas encore utilisé par une
   * route HTTP. Ne pas construire de système de signature HMAC ici. */
  async getPrivateUrl(key: string, ttlSeconds: number): Promise<string> {
    // Valide quand même la clé pour être cohérent avec les autres méthodes.
    this.resolveKey(key);
    return `local-storage://${encodeURIComponent(key)}?ttl=${ttlSeconds}`;
  }
}