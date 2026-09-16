// En-têtes de sécurité (T1.15), appliqués à toutes les réponses via
// next.config.ts (`headers()`). Fonction pure, testée sans dépendre de
// Next.js.
//
// CSP pragmatique plutôt que stricte par nonce : l'App Router de Next.js
// injecte ses propres <script> inline (données d'hydratation React Server
// Components), qui exigent `'unsafe-inline'` en `script-src` sans mise en
// place d'un nonce par requête (piste d'amélioration future, pas faite ici
// faute de temps pour la tester correctement — voir docs/DECISIONS.md).
// Le reste de la politique (aucune ressource tierce, aucune iframe, aucun
// plugin) reste, lui, pleinement restrictif : c'est là qu'est l'essentiel de
// la protection contre l'injection de contenu externe.
const DIRECTIVES_CSP: [string, string][] = [
  ["default-src", "'self'"],
  ["script-src", "'self' 'unsafe-inline'"],
  ["style-src", "'self' 'unsafe-inline'"],
  ["img-src", "'self' data:"],
  ["font-src", "'self' data:"],
  ["connect-src", "'self'"],
  ["object-src", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
  ["frame-ancestors", "'none'"],
  ["upgrade-insecure-requests", ""],
];

export function contentSecurityPolicy(): string {
  return DIRECTIVES_CSP.map(([directive, valeur]) => `${directive} ${valeur}`.trim()).join("; ");
}

export interface EnTeteHttp {
  key: string;
  value: string;
}

export function entetesSecurite(): EnTeteHttp[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    // Ignoré par les navigateurs tant que la connexion n'est pas déjà en
    // HTTPS (le cas ici via Tailscale Serve, puis Caddy en production, D6) :
    // sans effet, donc sans risque, de l'envoyer aussi en HTTP interne.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
  ];
}
