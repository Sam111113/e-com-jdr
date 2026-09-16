import { test, expect, type Page } from "@playwright/test";

// Pages du site (T1.6). Nécessite le serveur de production démarré avec le
// jeu factice importé et `AFFICHER_BROUILLONS=true` (voir README, section
// « Vérifier les pages du site »). Les captures sont écrites dans
// test-results/captures pour la revue visuelle.

const USER = process.env.STAGING_BASIC_AUTH_USER ?? "equipe";
const PASSWORD = process.env.STAGING_BASIC_AUTH_PASSWORD ?? "changez-moi";
const JEU_FACTICE = "/jeux/jeu-factice-chasse-au-tresor-halloween";

test.use({ httpCredentials: { username: USER, password: PASSWORD } });

const PAGES = [
  { chemin: "/", titre: /soirées à énigmes/i },
  { chemin: "/jeux", titre: /tous les jeux/i },
  { chemin: JEU_FACTICE, titre: /JEU FACTICE/ },
  { chemin: "/halloween", titre: /jeux d'halloween/i },
  { chemin: "/escape-game-halloween", titre: /escape games d'halloween/i },
  { chemin: "/chasse-au-tresor-halloween", titre: /chasses au trésor d'halloween/i },
  { chemin: "/soiree-adulte", titre: /soirées entre adultes/i },
  { chemin: "/murder-party-a-imprimer", titre: /murder parties/i },
  { chemin: "/comment-ca-marche", titre: /comment ça marche/i },
  { chemin: "/faq", titre: /questions fréquentes/i },
  { chemin: "/a-propos", titre: /à propos/i },
  { chemin: "/contact", titre: /nous écrire/i },
];

async function sansDebordementHorizontal(page: Page) {
  const debordement = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(debordement, "la page défile horizontalement").toBeLessThanOrEqual(0);
}

for (const { chemin, titre } of PAGES) {
  test(`${chemin} s'affiche sans défilement horizontal, en clair et en sombre`, async ({
    page,
  }) => {
    for (const [nom, largeur, hauteur] of [
      ["mobile", 375, 812],
      ["ordinateur", 1280, 800],
    ] as const) {
      for (const theme of ["light", "dark"] as const) {
        await page.setViewportSize({ width: largeur, height: hauteur });
        await page.emulateMedia({ colorScheme: theme });
        const reponse = await page.goto(chemin);
        expect(reponse?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1, name: titre })).toBeVisible();
        await sansDebordementHorizontal(page);
        const fichier = `${chemin === "/" ? "accueil" : chemin.slice(1).replace(/\//g, "_")}-${nom}-${theme}.png`;
        await page.screenshot({ path: `test-results/captures/${fichier}` });
      }
    }
  });
}

test("les adresses inconnues renvoient une vraie 404", async ({ page }) => {
  for (const chemin of ["/page-qui-n-existe-pas", "/jeux/jeu-qui-n-existe-pas"]) {
    const reponse = await page.goto(chemin);
    expect(reponse?.status(), chemin).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/volatilisée/);
  }
});

test("le catalogue se filtre", async ({ page }) => {
  await page.goto("/jeux?type=chasse-au-tresor&saison=halloween&age=8&joueurs=4&duree=60");
  await expect(page.getByRole("link", { name: /JEU FACTICE/ })).toBeVisible();

  // Le jeu factice accepte 2 à 6 joueurs, dès 6 ans, 45 minutes.
  for (const filtre of ["type=murder-party", "joueurs=7", "age=5", "duree=30", "saison=noel"]) {
    await page.goto(`/jeux?${filtre}`);
    await expect(page.getByRole("link", { name: /JEU FACTICE/ }), filtre).toHaveCount(0);
    await expect(page.getByText("Aucun jeu ne correspond")).toBeVisible();
  }

  // Formulaire utilisable sans JavaScript : simple requête GET.
  await page.goto("/jeux");
  await expect(page.getByLabel("Type de jeu")).toBeHidden();
  await page.getByText("Filtrer les jeux").click();
  await page.getByLabel("Type de jeu").selectOption("chasse-au-tresor");
  await page.getByRole("button", { name: "Filtrer" }).click();
  await expect(page).toHaveURL(/type=chasse-au-tresor/);
  await expect(page.getByRole("link", { name: /JEU FACTICE/ })).toBeVisible();
});

test("la fiche du jeu affiche les informations, les aperçus et aucun achat possible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(JEU_FACTICE);
  await expect(page.getByText("2 à 6 joueurs").first()).toBeVisible();
  await expect(page.getByText("45 min").first()).toBeVisible();
  await expect(page.getByText("Dès 6 ans").first()).toBeVisible();
  await expect(page.getByText("7,90")).toBeVisible();
  for (const section of ["L'histoire", "Aperçu du kit", "Contenu du kit", "Préparation et matériel", "Questions fréquentes"]) {
    await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Me prévenir de la sortie" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /acheter/i })).toHaveCount(0);

  const apercus = page.getByRole("img", { name: /aperçu flouté/i });
  await expect(apercus).toHaveCount(2);
  for (const image of await apercus.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("le menu mobile s'ouvre et mène aux pages", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: "Navigation principale (mobile)" });
  await expect(menu).toBeHidden();
  await page.getByText("Menu", { exact: true }).click();
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(menu).toBeHidden();
});

test("sur ordinateur, logo et navigation tiennent sur une seule ligne", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const logo = await page.locator(".site-header .logo").boundingBox();
  const nav = await page.getByRole("navigation", { name: "Navigation principale" }).boundingBox();
  expect(logo && nav).toBeTruthy();
  expect(Math.abs(logo!.y + logo!.height / 2 - (nav!.y + nav!.height / 2))).toBeLessThan(12);
  expect(nav!.x).toBeGreaterThan(logo!.x + logo!.width);
});

test("le formulaire de contact valide la saisie et n'annonce pas d'envoi fictif", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.getByText("Indiquez votre nom.")).toBeVisible();

  await page.getByLabel("Votre nom").fill("Test E2E");
  await page.getByLabel("Votre adresse email").fill("test@example.fr");
  await page.getByLabel("Votre message").fill("Message de test automatique.");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  // Sans clé Brevo (staging et tests), le site le dit au lieu de faire semblant.
  // (Next.js ajoute son propre élément role="alert" : on cible le message du formulaire.)
  await expect(page.locator(".message-formulaire")).toContainText(/pas encore activé/);
});
