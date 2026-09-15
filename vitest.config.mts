import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    // Les tests touchent tous à `TEST_DATABASE_URL` (Postgres partagé) :
    // les lancer en série évite les interférences entre suites qui
    // réinitialisent le schéma (`resetTestDatabase`).
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
