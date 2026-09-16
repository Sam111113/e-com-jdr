// Métadonnées communes à toutes les pages (T1.12) : canonical + Open Graph +
// Twitter Card. `alternates.canonical` et `openGraph.url` sont résolus par
// Next.js contre `metadataBase` (app/layout.tsx) : un chemin relatif suffit.
import type { Metadata } from "next";
import { site } from "@/config/site";

export function metadonneesPage(options: {
  titre: string;
  description: string;
  chemin: string;
  /** Chemin de l'image (ex. la couverture d'un jeu) ; défaut : pas d'image dédiée. */
  image?: string;
}): Metadata {
  const { titre, description, chemin, image } = options;
  const images = image ? [{ url: image }] : undefined;

  return {
    title: titre,
    description,
    alternates: { canonical: chemin },
    openGraph: {
      title: titre,
      description,
      url: chemin,
      siteName: site.nom,
      locale: "fr_FR",
      type: "website",
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: titre,
      description,
      images: image ? [image] : undefined,
    },
  };
}
