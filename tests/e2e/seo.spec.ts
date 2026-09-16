import { expect, test } from "@playwright/test";

// SEO technique (T1.12). `tests/e2e/staging-protection.spec.ts` couvre déjà
// robots.txt (disallow total, SITE_PUBLIC=false par défaut) : pas répété ici.
const USER = process.env.STAGING_BASIC_AUTH_USER ?? "equipe";
const PASSWORD = process.env.STAGING_BASIC_AUTH_PASSWORD ?? "changez-moi";
const JEU_FACTICE = "/jeux/jeu-factice-chasse-au-tresor-halloween";

test.use({ httpCredentials: { username: USER, password: PASSWORD } });

async function scriptsJsonLd(page: import("@playwright/test").Page) {
  const contenus = await page.locator('script[type="application/ld+json"]').allTextContents();
  return contenus.map((c) => JSON.parse(c));
}

test("sitemap.xml liste les pages statiques et les collections, jamais un jeu en brouillon", async ({
  page,
}) => {
  const reponse = await page.goto("/sitemap.xml");
  expect(reponse?.status()).toBe(200);
  const corps = (await reponse?.text()) ?? "";
  expect(corps).toContain("<urlset");
  for (const chemin of ["/", "/jeux", "/halloween", "/soiree-adulte"]) {
    // `>url<` plutôt qu'un `<loc>…</loc>` exact : peu importe la mise en
    // forme XML choisie par Next.js, tout en évitant qu'un chemin plus
    // court ("/") corresponde par erreur à l'intérieur d'un chemin plus
    // long ("/jeux").
    expect(corps, chemin).toContain(`>http://127.0.0.1:3100${chemin}<`);
  }
  // Le jeu factice reste en statut "brouillon" (jamais publié, voir
  // content/games/jeu-factice-.../fiche.md) : listerJeuxPublies() doit
  // l'exclure même si AFFICHER_BROUILLONS=true le rend visible ailleurs.
  expect(corps).not.toContain(JEU_FACTICE);
});

test("chaque page a un canonical unique et cohérent avec son URL", async ({ page }) => {
  for (const chemin of ["/", "/jeux", "/halloween", "/comment-ca-marche", JEU_FACTICE]) {
    await page.goto(chemin);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    // Next.js normalise la racine sans slash final ("http://host" plutôt
    // que "http://host/") ; pour les autres chemins, il conserve tel quel.
    const attendu =
      chemin === "/" ? "http://127.0.0.1:3100" : `http://127.0.0.1:3100${chemin}`;
    expect(canonical, chemin).toBe(attendu);
  }
});

test("Open Graph et Twitter Card sont présents sur une fiche jeu, avec l'image de couverture", async ({
  page,
}) => {
  await page.goto(JEU_FACTICE);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Chasse aux Friandises/,
  );
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage).toContain("/games/jeu-factice-chasse-au-tresor-halloween/cover");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("JSON-LD : Organization et WebSite sur toutes les pages", async ({ page }) => {
  await page.goto("/faq");
  const donnees = await scriptsJsonLd(page);
  expect(donnees.some((d) => d["@type"] === "Organization")).toBe(true);
  expect(donnees.some((d) => d["@type"] === "WebSite")).toBe(true);
});

test("JSON-LD : BreadcrumbList suit le fil d'Ariane visible", async ({ page }) => {
  await page.goto(JEU_FACTICE);
  const donnees = await scriptsJsonLd(page);
  const breadcrumb = donnees.find((d) => d["@type"] === "BreadcrumbList");
  expect(breadcrumb).toBeDefined();
  const noms = breadcrumb.itemListElement.map((e: { name: string }) => e.name);
  expect(noms[0]).toBe("Accueil");
  expect(noms.at(-1)).toContain("Friandises");
});

test("JSON-LD : Product/Offer sur la fiche jeu, jamais InStock ventes fermées", async ({
  page,
}) => {
  await page.goto(JEU_FACTICE);
  const donnees = await scriptsJsonLd(page);
  const produit = donnees.find((d) => d["@type"] === "Product");
  expect(produit).toBeDefined();
  expect(produit.offers.price).toBe("7.90");
  expect(produit.offers.priceCurrency).toBe("EUR");
  // Ce serveur de test tourne avec SALES_ENABLED=false (voir README).
  expect(produit.offers.availability).toBe("https://schema.org/PreOrder");
});

// La redirection 301/308 automatique (lib/redirects.ts, D12) dépend d'une
// ligne dans une table alimentée par scripts/rename-game.ts : pas de fixture
// e2e pour ça (les tests e2e ne touchent jamais la base directement, voir
// tests/e2e/pages.spec.ts et README). Vérifiée manuellement à la place —
// voir docs/PROGRESS.md, entrée T1.12.
