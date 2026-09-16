import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    // Les tests touchent tous à `TEST_DATABASE_URL` (Postgres partagé) :
    // les lancer en série évite les interférences entre suites qui
    // réinitialisent le schéma (`resetTestDatabase`).
    fileParallelism: false,
    // Le défaut (5 s) est trop juste pour les tests d'import qui traitent
    // plusieurs largeurs d'image avec sharp (T1.6) : sur une machine chargée,
    // ils dépassent parfois de peu sans qu'il y ait de bug (vu en pratique
    // sur le VPS de dev, partagé et sans rapport avec le code testé).
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
