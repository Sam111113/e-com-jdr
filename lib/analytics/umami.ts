// Umami (T1.14) : statistiques auto-hébergées, sans cookies (RGPD : pas de
// bannière de consentement nécessaire, voir docs/PLAN.md). Le script est
// servi via next.config.ts (proxy vers le service `umami`, même origine que
// le site — évite les bloqueurs de publicité qui ciblent les domaines
// d'analytics tiers).
//
// À appeler uniquement depuis un composant client ("use client") : le script
// de suivi n'existe que dans le navigateur.
declare global {
  interface Window {
    umami?: { track: (nomEvenement: string, donnees?: Record<string, unknown>) => void };
  }
}

/**
 * Sans effet si le script n'est pas encore chargé (première interaction
 * juste après l'affichage de la page) ou bloqué : jamais d'erreur remontée
 * à l'utilisateur pour un simple événement de mesure manqué.
 */
export function suivreEvenement(nomEvenement: string, donnees?: Record<string, unknown>): void {
  try {
    window.umami?.track(nomEvenement, donnees);
  } catch {
    // Volontairement silencieux.
  }
}
