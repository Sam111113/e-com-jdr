// robots.txt dynamique (T1.12). Remplace l'ancien public/robots.txt statique
// (Next.js refuse que les deux coexistent). proxy.ts laisse `/robots.txt`
// passer sans mot de passe (D13) : ce fichier n'apporte aucune information
// et interdit de toute façon tout crawl tant que le site n'est pas public.
import type { MetadataRoute } from "next";
import { siteIndexable } from "@/lib/seo/indexation";
import { urlAbsolue } from "@/lib/seo/site-url";

// SITE_PUBLIC (contrairement à SALES_ENABLED, voir D20) doit pouvoir changer
// sans reconstruire : sans ce réglage, Next.js prérendrait ce fichier une
// bonne fois pour toutes au build, avec la valeur de l'environnement de
// build plutôt que celle du conteneur en cours d'exécution.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!siteIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: urlAbsolue("/sitemap.xml"),
  };
}
