// Fonctions pures de vérification (T1.7, décision D11), utilisées à la fois
// par le script de build (scripts/check-legal-config.ts) et par le serveur
// au démarrage (instrumentation.ts). Aucun accès disque ni process.exit ici :
// ça reste testable sans lancer un vrai build.
import { MARQUEUR_A_COMPLETER } from "@/config/entreprise";

/** Chemins (`a.b.c`) de tous les champs qui valent encore le marqueur. */
export function valeursProvisoires(valeur: unknown, chemin = ""): string[] {
  if (typeof valeur === "string") {
    return valeur === MARQUEUR_A_COMPLETER ? [chemin] : [];
  }
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur as Record<string, unknown>).flatMap(([cle, sousValeur]) =>
      valeursProvisoires(sousValeur, chemin ? `${chemin}.${cle}` : cle),
    );
  }
  return [];
}

export interface ResultatVerificationLegale {
  ok: boolean;
  /** Chemins des champs encore provisoires (vide si `ok` ou ventes fermées). */
  problemes: string[];
}

/**
 * Ventes fermées : toujours ok, la configuration légale n'a pas besoin
 * d'être complète pour un site vitrine. Ventes ouvertes : ok seulement si
 * aucun champ ne porte plus le marqueur provisoire.
 */
export function verifierConfigLegale(
  ventesActives: boolean,
  config: unknown,
): ResultatVerificationLegale {
  if (!ventesActives) return { ok: true, problemes: [] };
  const problemes = valeursProvisoires(config);
  return { ok: problemes.length === 0, problemes };
}

export interface ResultatCoherenceDemarrage {
  ok: boolean;
  message?: string;
}

/**
 * SALES_ENABLED est figé au build (D11) : un `.env` changé sans reconstruire
 * ne doit jamais suffire à ouvrir (ou fermer) les ventes. Comparé au
 * démarrage du serveur entre la valeur embarquée au build et celle lue dans
 * l'environnement au lancement.
 */
export function verifierCoherenceDemarrage(
  valeurAuBuild: boolean,
  valeurRuntime: boolean,
): ResultatCoherenceDemarrage {
  if (valeurAuBuild === valeurRuntime) return { ok: true };
  return {
    ok: false,
    message:
      `SALES_ENABLED=${valeurRuntime} dans l'environnement, mais le site a été construit ` +
      `avec SALES_ENABLED=${valeurAuBuild}. Un redémarrage ne suffit pas : reconstruire le ` +
      `site (npm run build) pour changer ce réglage (voir docs/DECISIONS.md, D11).`,
  };
}
