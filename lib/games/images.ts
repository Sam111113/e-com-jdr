// Conventions des images publiques des jeux, partagées par l'import
// (scripts/import-games.ts) et les pages du site.
//
// Chaque image existe en plusieurs largeurs, en WebP et en AVIF. La plus
// grande garde le nom sans suffixe (`cover.webp`), c'est le chemin stocké en
// base ; les autres portent leur largeur (`cover-480.webp`).

export const LARGEURS_COUVERTURE = [480, 960, 1600] as const;
export const LARGEURS_APERCU = [600, 1200] as const;

/**
 * Flou des aperçus de pages (sigma sharp pour une image de 1200 px de large) :
 * l'ambiance et la mise en page restent visibles, le texte ne se lit pas.
 */
export const FLOU_APERCU = 4;
const LARGEUR_REFERENCE_FLOU = 1200;

export type FormatImage = "webp" | "avif";

/**
 * Sigma à appliquer selon la largeur **réelle** de l'image produite (une
 * source plus petite que la largeur demandée n'est jamais agrandie) : le flou
 * reste proportionnel à l'image, donc identique d'une variante à l'autre.
 */
export function sigmaFlou(largeurSortie: number): number {
  return Math.max(0.3, (FLOU_APERCU * largeurSortie) / LARGEUR_REFERENCE_FLOU);
}

export function suffixeLargeur(largeur: number, largeurs: readonly number[]): string {
  return largeur === Math.max(...largeurs) ? "" : `-${largeur}`;
}

export function cheminVariante(
  chemin: string,
  largeur: number,
  largeurs: readonly number[],
  format: FormatImage,
): string {
  const base = chemin.replace(/\.(webp|avif)$/, "");
  return `${base}${suffixeLargeur(largeur, largeurs)}.${format}`;
}

export function srcSet(chemin: string, largeurs: readonly number[], format: FormatImage): string {
  return largeurs
    .map((largeur) => `${cheminVariante(chemin, largeur, largeurs, format)} ${largeur}w`)
    .join(", ");
}
