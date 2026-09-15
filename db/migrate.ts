// Applique les migrations versionnées de `db/migrations/` sur une base
// PostgreSQL 18. Utilisé en développement (`npm run db:migrate`), dans les
// tests (`db/test-utils.ts`) et dans le conteneur `app-tools` du staging et
// de la production (voir docker/docker-compose.yml et README « Ajouter un
// jeu » / « Déploiement du staging »).
//
// Ordre de résolution de l'URL de connexion :
//   1. `MIGRATE_DATABASE_URL` (utilisé explicitement par les tests, pour ne
//      jamais risquer de migrer la mauvaise base par erreur d'environnement) ;
//   2. `DATABASE_URL` (staging / production, définie dans `.env`) ;
//   3. `DEV_DATABASE_URL` (conteneur de l'agent, développement local).
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export function resolveMigrationDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const url =
    env.MIGRATE_DATABASE_URL ?? env.DATABASE_URL ?? env.DEV_DATABASE_URL;
  if (!url) {
    throw new Error(
      "Aucune URL de base de données trouvée (MIGRATE_DATABASE_URL, " +
        "DATABASE_URL ou DEV_DATABASE_URL doit être définie).",
    );
  }
  return url;
}

export async function runMigrations(connectionString: string): Promise<void> {
  const migrationClient = postgres(connectionString, { max: 1 });
  try {
    const db = drizzle(migrationClient);
    await migrate(db, { migrationsFolder: "./db/migrations" });
  } finally {
    await migrationClient.end();
  }
}

async function main() {
  const connectionString = resolveMigrationDatabaseUrl();
  await runMigrations(connectionString);
  console.log("Migrations appliquées avec succès.");
}

// N'exécute `main()` que si ce fichier est lancé directement (`npm run
// db:migrate`), pas quand il est importé par les tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Échec des migrations :", error);
    process.exitCode = 1;
  });
}
