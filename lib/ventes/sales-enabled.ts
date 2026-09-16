// Point d'accès unique à l'état des ventes et à l'affichage des prix (T1.7).
//
// `ventesActives()` lit la valeur figée au build (config/sales-enabled.generated.ts),
// jamais `process.env.SALES_ENABLED` directement : lire l'environnement au
// runtime réintroduirait exactement le bug que la décision D11 corrige (un
// `.env` changé sans reconstruire ouvrirait les ventes sans vérification
// légale). Les deux seuls endroits autorisés à lire `process.env.SALES_ENABLED`
// sont scripts/check-legal-config.ts (au build) et instrumentation.ts (pour
// détecter une incohérence au démarrage et refuser de démarrer).
import { SALES_ENABLED_AU_BUILD } from "@/config/sales-enabled.generated";

export function ventesActives(): boolean {
  return SALES_ENABLED_AU_BUILD;
}

/**
 * Afficher ou masquer les prix : réglage cosmétique, sans enjeu légal ni
 * lien avec les ventes (utile par ex. pour une vitrine sans prix encore
 * fixés). Contrairement à `ventesActives()`, changeable sans reconstruire.
 */
export function afficherPrix(): boolean {
  return process.env.AFFICHER_PRIX !== "false";
}
