import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image de production minimale (docker/Dockerfile) : ne copie que le
  // strict nécessaire au démarrage du serveur Next.js.
  output: "standalone",

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
