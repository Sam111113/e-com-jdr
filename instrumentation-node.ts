// Logique effective des vérifications au démarrage (T1.7, décision D11,
// point 4) : `process.exit` n'existe pas dans le runtime Edge, donc ce code
// vit dans un module séparé, importé dynamiquement uniquement depuis la
// branche "nodejs" d'instrumentation.ts. Un appel direct dans instrumentation.ts
// ferait échouer la compilation du bundle Edge (avertissement Turbopack), même
// derrière un `if`, car l'analyse statique ne sait pas laquelle des deux
// branches s'exécutera réellement.
import { SALES_ENABLED_AU_BUILD } from "@/config/sales-enabled.generated";
import { entreprise } from "@/config/entreprise";
import { verifierCoherenceDemarrage, verifierConfigLegale } from "@/lib/ventes/verification-legale";

export function verifierAuDemarrage(): void {
  const valeurRuntime = process.env.SALES_ENABLED === "true";
  const coherence = verifierCoherenceDemarrage(SALES_ENABLED_AU_BUILD, valeurRuntime);
  if (!coherence.ok) {
    console.error(`Démarrage refusé : ${coherence.message}`);
    process.exit(1);
  }

  if (SALES_ENABLED_AU_BUILD) {
    const resultat = verifierConfigLegale(true, entreprise);
    if (!resultat.ok) {
      console.error(
        "Démarrage refusé : SALES_ENABLED=true mais config/entreprise.ts contient encore " +
          "des valeurs provisoires (ceci n'aurait pas dû passer le build) :",
      );
      for (const chemin of resultat.problemes) {
        console.error(`  - entreprise.${chemin}`);
      }
      process.exit(1);
    }
  }
}
