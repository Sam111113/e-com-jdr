import { defineConfig } from "drizzle-kit";

// Utilisé uniquement par les commandes `drizzle-kit` (générer les
// migrations, `db:studio`), jamais par l'application ou les scripts en
// production — voir db/migrate.ts pour l'application des migrations.
const connectionString =
  process.env.DATABASE_URL ?? process.env.DEV_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL ou DEV_DATABASE_URL doit être défini pour drizzle-kit.",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
