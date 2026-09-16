// Construction des objets JSON-LD (T1.12). Aucune validation de schéma ici :
// à vérifier avec l'outil de test des résultats enrichis de Google, en mode
// « code » puisque le staging est protégé (voir docs/PLAN.md, T1.12).
import { site } from "@/config/site";
import type { Jeu } from "@/lib/games/queries";
import { ventesActives } from "@/lib/ventes/sales-enabled";
import { urlAbsolue } from "./site-url";

export function organisationEtSiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.nom,
      url: urlAbsolue("/"),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.nom,
      url: urlAbsolue("/"),
      inLanguage: "fr-FR",
    },
  ];
}

export interface EtapeBreadcrumb {
  libelle: string;
  href?: string;
}

/** `href` absent seulement pour la dernière étape (page courante) : Google
 * exige quand même une URL, on y met alors l'URL de la page elle-même. */
export function breadcrumbJsonLd(etapes: EtapeBreadcrumb[], cheminCourant: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: etapes.map((etape, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: etape.libelle,
      item: urlAbsolue(etape.href ?? cheminCourant),
    })),
  };
}

/** Disponibilité alignée sur l'interrupteur de vente (T1.7) : jamais
 * `InStock` tant que les ventes sont fermées (brief, interdit la
 * précommande avant la phase 3). */
export function produitJsonLd(jeu: Jeu) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: jeu.title,
    description: jeu.pitch,
    image: urlAbsolue(jeu.coverPath),
    url: urlAbsolue(`/jeux/${jeu.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (jeu.prixEur / 100).toFixed(2),
      availability: ventesActives()
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      url: urlAbsolue(`/jeux/${jeu.slug}`),
    },
  };
}
