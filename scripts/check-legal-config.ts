// Script `prebuild` / `predev` (T1.7, décision D11).
//
// 1. Lit SALES_ENABLED dans l'environnement de BUILD (celui passé à
//    `npm run build`, ou en argument de build Docker — voir
//    docker/Dockerfile et docker/docker-compose.yml).
// 2. Si les ventes seraient actives, vérifie que config/entreprise.ts ne
//    contient plus aucune valeur provisoire ; sinon fait échouer le build
//    (`process.exit(1)`) en listant chaque champ fautif.
// 3. Écrit config/sales-enabled.generated.ts avec la valeur retenue : c'est
//    ce fichier, importé partout ailleurs, qui "fige" le réglage dans le
//    bundle serveur (le reste du code ne relit jamais process.env.SALES_ENABLED).
import fs from "node:fs";
import path from "node:path";
import { entreprise } from "../config/entreprise";
import { verifierConfigLegale } from "../lib/ventes/verification-legale";

const ventesActives = process.env.SALES_ENABLED === "true";
const resultat = verifierConfigLegale(ventesActives, entreprise);

if (!resultat.ok) {
  console.error(
    "Build refusé : SALES_ENABLED=true, mais config/entreprise.ts contient encore des " +
      "valeurs provisoires :",
  );
  for (const chemin of resultat.problemes) {
    console.error(`  - entreprise.${chemin}`);
  }
  console.error(
    "Compléter ces champs, ou repasser SALES_ENABLED à false, avant de reconstruire.",
  );
  process.exit(1);
}

const cheminFichier = path.join(
  import.meta.dirname,
  "..",
  "config",
  "sales-enabled.generated.ts",
);
const lignes = [
  "// Fichier généré par scripts/check-legal-config.ts (hooks npm prebuild et",
  "// predev) à partir de la variable d'environnement SALES_ENABLED lue au",
  "// moment du build. NE PAS ÉDITER À LA MAIN : toute modification manuelle",
  "// sera écrasée au prochain build ou lancement en dev.",
  "//",
  "// Committé volontairement (décision D19) pour que le dépôt reste",
  "// utilisable (tsc, eslint, vitest, IDE) même sans avoir relancé le",
  "// générateur — mais la valeur qui pilote réellement le site en production",
  "// est toujours celle du DERNIER vrai build (voir docs/DECISIONS.md, D11).",
  `export const SALES_ENABLED_AU_BUILD = ${ventesActives};`,
  "",
];

fs.writeFileSync(cheminFichier, lignes.join("\n"), "utf-8");
console.log(
  `config/sales-enabled.generated.ts généré : SALES_ENABLED_AU_BUILD = ${ventesActives}.`,
);
