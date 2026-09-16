// SEO technique (T1.12). Les fonctions qui touchent la base (sitemap,
// lib/redirects.ts) suivent le même choix que lib/games/queries.ts : pas de
// test unitaire avec une fausse base, vérifiées à la place sur le staging
// (voir docs/PROGRESS.md, entrée T1.12) — c'est justement le sens de
// `connection()` + import différé, qui rendrait un faux client difficile à
// injecter sans dénaturer le code réel.
import { afterEach, describe, expect, it, vi } from "vitest";
import { siteIndexable } from "../../lib/seo/indexation";
import { baseUrl, urlAbsolue } from "../../lib/seo/site-url";
import { breadcrumbJsonLd } from "../../lib/seo/jsonld";
import { metadonneesPage } from "../../lib/seo/meta";
import { serialiserJsonLd } from "../../components/site/JsonLd";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock("../../lib/ventes/sales-enabled");
  vi.resetModules();
});

describe("siteIndexable", () => {
  it("reste fermé par défaut, et sur toute valeur autre que le littéral \"true\"", () => {
    vi.stubEnv("SITE_PUBLIC", "");
    expect(siteIndexable()).toBe(false);
    vi.stubEnv("SITE_PUBLIC", "vrai");
    expect(siteIndexable()).toBe(false);
  });

  it("s'ouvre seulement sur SITE_PUBLIC=true", () => {
    vi.stubEnv("SITE_PUBLIC", "true");
    expect(siteIndexable()).toBe(true);
  });
});

describe("baseUrl / urlAbsolue", () => {
  it("retombe sur localhost sans SITE_URL", () => {
    vi.stubEnv("SITE_URL", "");
    expect(baseUrl().origin).toBe("http://localhost:3000");
    expect(urlAbsolue("/jeux/mon-jeu")).toBe("http://localhost:3000/jeux/mon-jeu");
  });

  it("utilise SITE_URL une fois définie, sans double slash", () => {
    vi.stubEnv("SITE_URL", "https://exemple.fr");
    expect(urlAbsolue("/halloween")).toBe("https://exemple.fr/halloween");
  });
});

describe("breadcrumbJsonLd", () => {
  it("numérote les positions à partir de 1 et résout les URLs en absolu", () => {
    vi.stubEnv("SITE_URL", "https://exemple.fr");
    const donnees = breadcrumbJsonLd(
      [
        { libelle: "Accueil", href: "/" },
        { libelle: "Tous les jeux", href: "/jeux" },
        { libelle: "Mon jeu" },
      ],
      "/jeux/mon-jeu",
    );
    expect(donnees["@type"]).toBe("BreadcrumbList");
    expect(donnees.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://exemple.fr/" },
      { "@type": "ListItem", position: 2, name: "Tous les jeux", item: "https://exemple.fr/jeux" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Mon jeu",
        item: "https://exemple.fr/jeux/mon-jeu",
      },
    ]);
  });
});

describe("metadonneesPage", () => {
  it("pose le canonical et l'Open Graph de base, sans image", () => {
    const metadonnees = metadonneesPage({
      titre: "FAQ",
      description: "Des réponses.",
      chemin: "/faq",
    });
    expect(metadonnees.alternates).toEqual({ canonical: "/faq" });
    expect(metadonnees.openGraph).toMatchObject({
      title: "FAQ",
      description: "Des réponses.",
      url: "/faq",
      type: "website",
      locale: "fr_FR",
    });
    expect(metadonnees.twitter).toMatchObject({ card: "summary" });
  });

  it("passe en summary_large_image avec une image, pour un partage Pinterest correct", () => {
    const metadonnees = metadonneesPage({
      titre: "Mon jeu",
      description: "Un jeu.",
      chemin: "/jeux/mon-jeu",
      image: "/games/mon-jeu/cover.webp",
    });
    expect(metadonnees.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadonnees.openGraph?.images).toEqual([{ url: "/games/mon-jeu/cover.webp" }]);
  });
});

describe("serialiserJsonLd", () => {
  it("échappe les < pour empêcher une fermeture prématurée de la balise script", () => {
    const serialise = serialiserJsonLd({ description: "Fin de la partie </script><script>alert(1)</script>" });
    expect(serialise).not.toContain("</script>");
    // Seul `<` a besoin d'être échappé : sans lui, `</script` ne peut plus
    // être reconnu comme une balise, `>` seul est inoffensif.
    expect(serialise).toContain("\\u003c/script>");
    // Toujours du JSON valide une fois désérialisé (l'échappement ne casse pas le contenu).
    expect(JSON.parse(serialise.replace(/\\u003c/g, "<")).description).toContain("</script>");
  });
});

describe("produitJsonLd", () => {
  it("n'affiche jamais InStock tant que les ventes sont fermées", async () => {
    vi.resetModules();
    vi.doMock("../../lib/ventes/sales-enabled", () => ({
      ventesActives: () => false,
      afficherPrix: () => true,
    }));
    const { produitJsonLd } = await import("../../lib/seo/jsonld");
    const jeu = {
      title: "Mon jeu",
      pitch: "Un pitch",
      coverPath: "/games/mon-jeu/cover.webp",
      slug: "mon-jeu",
      prixEur: 990,
      // Champs non utilisés par produitJsonLd, présents pour le typage.
    } as Parameters<typeof produitJsonLd>[0];
    const donnees = produitJsonLd(jeu);
    expect(donnees.offers.availability).toBe("https://schema.org/PreOrder");
    expect(donnees.offers.price).toBe("9.90");
    vi.doUnmock("../../lib/ventes/sales-enabled");
  });

  it("passe à InStock une fois les ventes ouvertes", async () => {
    vi.resetModules();
    vi.doMock("../../lib/ventes/sales-enabled", () => ({
      ventesActives: () => true,
      afficherPrix: () => true,
    }));
    const { produitJsonLd } = await import("../../lib/seo/jsonld");
    const jeu = {
      title: "Mon jeu",
      pitch: "Un pitch",
      coverPath: "/games/mon-jeu/cover.webp",
      slug: "mon-jeu",
      prixEur: 990,
    } as Parameters<typeof produitJsonLd>[0];
    expect(produitJsonLd(jeu).offers.availability).toBe("https://schema.org/InStock");
    vi.doUnmock("../../lib/ventes/sales-enabled");
  });
});
