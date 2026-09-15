import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image de production minimale (docker/Dockerfile) : ne copie que le
  // strict nécessaire au démarrage du serveur Next.js.
  output: "standalone",
};

export default nextConfig;
