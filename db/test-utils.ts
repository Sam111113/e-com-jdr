// Utilitaires réservés aux tests (unitaires vitest). Travaillent
// exclusivement sur `TEST_DATABASE_URL` (base `ecomjdr_test`, que les tests
// peuvent vider librement — voir AGENTS.md section 8).
//
// Ne jamais utiliser ce fichier en dehors de `tests/` : `resetTestDatabase`
// supprime tout le schéma `public`.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { runMigrations } from "./migrate";

export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL doit être définie pour lancer les tests " +
        "(voir AGENTS.md section 8).",
    );
  }
  return url;
}

/**
 * Repart d'une base de test complètement vide, puis applique toutes les
 * migrations de `db/migrations/`. Utilisé avant chaque suite de tests qui
 * touche à la base, pour ne jamais dépendre d'un état laissé par une
 * exécution précédente.
 */
export async function resetTestDatabase(): Promise<void> {
  const url = getTestDatabaseUrl();
  const sql = postgres(url, { max: 1 });
  try {
    await sql.unsafe("DROP SCHEMA public CASCADE");
    await sql.unsafe("CREATE SCHEMA public");
    // Le migrateur Drizzle garde son propre suivi (table
    // `drizzle.__drizzle_migrations`) dans un schéma séparé de `public` :
    // sans ce `DROP`, il croit que les migrations ont déjà été appliquées
    // après le `DROP SCHEMA public` ci-dessus et ne recrée aucune table.
    await sql.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE");
  } finally {
    await sql.end();
  }
  await runMigrations(url);
}

/**
 * Ouvre un client Drizzle dédié sur la base de test. Toujours fermer avec
 * `sql.end()` à la fin du test (voir `afterAll` dans les suites).
 */
export function createTestDb() {
  const sql = postgres(getTestDatabaseUrl());
  return { db: drizzle(sql, { schema }), sql };
}
