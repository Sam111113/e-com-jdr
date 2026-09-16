// Base d'URL absolue du site (T1.12), partagée par `metadataBase` (app/layout.tsx,
// résout automatiquement les URLs relatives des metadata Next.js : canonical,
// Open Graph…) et par le JSON-LD, qui lui doit toujours contenir des URLs
// absolues écrites à la main.
//
// SITE_URL doit être définie avant la mise en ligne publique (le domaine
// définitif n'est pas encore acheté, voir docs/A_FAIRE_EQUIPE.md). En son
// absence (dev, staging), on retombe sur une valeur locale explicite : le
// staging n'étant de toute façon jamais indexé (proxy.ts, lib/seo/indexation.ts),
// des URLs canoniques "fausses" n'y ont aucune conséquence.
const BASE_PAR_DEFAUT = "http://localhost:3000";

export function baseUrl(): URL {
  return new URL(process.env.SITE_URL || BASE_PAR_DEFAUT);
}

/** URL absolue à partir d'un chemin relatif (ex. `/jeux/mon-jeu`). */
export function urlAbsolue(chemin: string): string {
  return new URL(chemin, baseUrl()).toString();
}
