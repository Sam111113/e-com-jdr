// Interface abstraite pour le stockage privé de fichiers (kit.pdf, factures…).
// L'implémentation par défaut est `LocalDiskStorage`, mais cette interface
// permet de passer à S3 / R2 plus tard sans toucher au code métier.
// Voir docs/PLAN.md et docs/DECISIONS.md D3.
export interface Storage {
  /** Écrit `data` dans le stockage privé, à la clé `key`. */
  put(key: string, data: Buffer): Promise<void>;

  /** Lit les données stockées à la clé `key`. */
  get(key: string): Promise<Buffer>;

  /** Vérifie si une entrée existe à la clé `key`. */
  exists(key: string): Promise<boolean>;

  /** Supprime l'entrée à la clé `key`. */
  delete(key: string): Promise<void>;

  /** Placeholder en attendant T1.8 (route de téléchargement signée).
   * Retourne une URL privée temporaire et signée pour accéder au fichier
   * identifié par `key` pendant `ttlSeconds` secondes.
   *
   * Pour l'instant, l'implémentation `LocalDiskStorage` retourne un
   * placeholder non fonctionnel. Ne pas construire de système de signature
   * HMAC ici. */
  getPrivateUrl(key: string, ttlSeconds: number): Promise<string>;
}