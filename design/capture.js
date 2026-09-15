// Génère les captures d'écran des maquettes statiques (T1.4).
// Usage : CHROMIUM_PATH=/usr/bin/chromium node design/capture.js
//
// Ouvre chaque page en file:// (aucun serveur nécessaire), pour chaque
// direction (a, b), chaque page (accueil, fiche-jeu) et chaque taille
// (mobile 390x844, ordinateur 1440x900), et enregistre un PNG pleine page
// dans design/captures/.

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'captures');

const DIRECTIONS = ['direction-a', 'direction-b'];
const PAGES = [
  { file: 'index.html', name: 'accueil' },
  { file: 'fiche-jeu.html', name: 'fiche-jeu' },
];
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'ordinateur', width: 1440, height: 900 },
];

async function main() {
  if (!process.env.CHROMIUM_PATH) {
    console.error('CHROMIUM_PATH doit être défini (voir AGENTS.md section 8).');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
  });

  try {
    for (const direction of DIRECTIONS) {
      for (const page of PAGES) {
        const fileUrl = 'file://' + path.join(ROOT, direction, page.file);
        for (const viewport of VIEWPORTS) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 2,
          });
          const tab = await context.newPage();
          await tab.goto(fileUrl, { waitUntil: 'networkidle' });
          // Laisse le temps aux polices locales (@font-face) de s'appliquer.
          await tab.evaluate(() => document.fonts && document.fonts.ready);
          const outFile = path.join(
            OUT_DIR,
            `${direction}-${page.name}-${viewport.name}.png`
          );
          await tab.screenshot({ path: outFile, fullPage: true });
          console.log('Capture écrite :', path.relative(ROOT, outFile));
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
