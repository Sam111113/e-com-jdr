// Client Drizzle applicatif (routes, scripts d'import…). Ne pas confondre
// avec `db/migrate.ts`, qui gère uniquement l'application des migrations.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.DEV_DATABASE_URL;
  if (!url) {
    throw new Error(
      "Aucune URL de base de données trouvée (DATABASE_URL ou " +
        "DEV_DATABASE_URL doit être définie).",
    );
  }
  return url;
}

// `globalThis` évite de recréer un pool de connexions à chaque rechargement
// à chaud en développement (`next dev`).
const globalForDb = globalThis as unknown as {
  __ecomjdrQueryClient?: postgres.Sql;
};

function getQueryClient(): postgres.Sql {
  if (!globalForDb.__ecomjdrQueryClient) {
    globalForDb.__ecomjdrQueryClient = postgres(resolveDatabaseUrl());
  }
  return globalForDb.__ecomjdrQueryClient;
}

export const db = drizzle(getQueryClient(), { schema });
export type Database = typeof db;

// Exporté pour les scripts CLI ponctuels (ex. scripts/import-games.ts) : le
// pool de connexions `postgres-js` garde une socket ouverte en permanence,
// donc un script qui l'utilise ne doit jamais oublier `await queryClient.end()`
// à la fin, sinon le processus Node ne se termine jamais (la boucle
// d'événements reste non vide). Ne pas appeler `.end()` dans une route Next.js
// : le pool doit y rester ouvert entre les requêtes.
export const queryClient: postgres.Sql = getQueryClient();
