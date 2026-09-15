import { test, expect } from "@playwright/test";

// Vérifie le critère « Terminé quand » de T1.3 :
// une page provisoire s'affiche derrière un mot de passe, en noindex.
//
// Nécessite un serveur de production démarré (npm run build && npm run
// start) avec STAGING_BASIC_AUTH_USER / STAGING_BASIC_AUTH_PASSWORD définis
// dans l'environnement (voir README, section « Vérifier le socle T1.3 »).

const USER = process.env.STAGING_BASIC_AUTH_USER ?? "equipe";
const PASSWORD = process.env.STAGING_BASIC_AUTH_PASSWORD ?? "changez-moi";

test.describe("Protection du staging (T1.3)", () => {
  test("refuse l'accès sans authentification", async ({ request }) => {
    // On utilise l'API de requêtes (et non `page.goto`) : face à un 401 avec
    // `WWW-Authenticate`, Chromium annule la navigation au niveau du
    // navigateur (`net::ERR_INVALID_AUTH_CREDENTIALS`) au lieu de renvoyer
    // une réponse exploitable.
    const response = await request.get("/");
    expect(response.status()).toBe(401);
  });

  test("affiche la page une fois authentifié, avec l'en-tête et la meta noindex", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      httpCredentials: { username: USER, password: PASSWORD },
    });
    const page = await context.newPage();

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");

    await expect(
      page.getByRole("heading", { name: /en construction/i }),
    ).toBeVisible();

    const metaRobots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(metaRobots).toContain("noindex");

    await context.close();
  });

  test("robots.txt interdit toute exploration, sans authentification", async ({
    page,
  }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const body = (await response?.text()) ?? "";
    expect(body).toContain("Disallow: /");
  });
});
