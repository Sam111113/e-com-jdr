// Sitemap dynamique (T1.12) : pages statiques, pages collections (D17) et
// jeux publiés. Généré même quand le site n'est pas indexable (staging) —
// c'est robots.txt qui interdit le crawl dans ce cas (lib/seo/indexation.ts) ;
// un sitemap non lié depuis un robots.txt public ne fuite rien de plus que
// les URLs déjà présentes dans le code source.
import type { MetadataRoute } from "next";
import { PAGES_COLLECTIONS } from "@/lib/collections";
import { listerJeuxPublies } from "@/lib/games/queries";
import { urlAbsolue } from "@/lib/seo/site-url";

const PAGES_STATIQUES = [
  "/",
  "/jeux",
  "/comment-ca-marche",
  "/faq",
  "/a-propos",
  "/contact",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jeux = await listerJeuxPublies();

  return [
    ...PAGES_STATIQUES.map((chemin) => ({ url: urlAbsolue(chemin) })),
    ...PAGES_COLLECTIONS.map((page) => ({ url: urlAbsolue(`/${page.slug}`) })),
    ...jeux.map((jeu) => ({
      url: urlAbsolue(`/jeux/${jeu.slug}`),
      lastModified: jeu.updatedAt,
    })),
  ];
}
