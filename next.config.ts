import type { NextConfig } from "next";
// Import relatif (et non l'alias @/*) : next.config.ts est chargé par Next.js
// lui-même, avant que la résolution des alias TypeScript ne soit garantie.
import { entetesSecurite } from "./lib/securite/entetes";

const nextConfig: NextConfig = {
  // Image de production minimale (docker/Dockerfile) : ne copie que le
  // strict nécessaire au démarrage du serveur Next.js.
  output: "standalone",

  // En-têtes de sécurité (T1.15) sur toutes les routes.
  async headers() {
    return [{ source: "/:path*", headers: entetesSecurite() }];
  },

  // Umami (T1.14) servi sous le même domaine que le site : évite les
  // bloqueurs de publicité qui ciblent spécifiquement les sous-domaines
  // d'analytics, pratique standard recommandée par Umami. `umami` est le
  // nom du service dans docker-compose.yml, joignable uniquement depuis le
  // réseau interne `ecomjdr_default` (jamais exposé directement).
  async rewrites() {
    return [
      { source: "/stats/script.js", destination: "http://umami:3000/script.js" },
      { source: "/stats/api/send", destination: "http://umami:3000/api/send" },
    ];
  },
};

export default nextConfig;
