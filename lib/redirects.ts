// Redirections 301 (T1.12, décision D12) : la table `redirects` existe et
// est alimentée depuis T1.5 (`scripts/rename-game.ts`), mais rien ne la
// consultait encore côté visiteur — un ancien lien indexé menait droit à la
// 404. Consultée depuis chaque page dynamique juste avant d'appeler
// `notFound()` (voir app/jeux/[slug]/page.tsx et app/[collection]/page.tsx).
//
// Import différé de db/client.ts (comme lib/games/queries.ts) : ne jamais
// toucher la base au build.
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { redirects } from "@/db/schema";

export async function trouverRedirection(cheminActuel: string): Promise<string | null> {
  await connection();
  const { db } = await import("@/db/client");
  const [ligne] = await db
    .select({ toPath: redirects.toPath })
    .from(redirects)
    .where(eq(redirects.fromPath, cheminActuel))
    .limit(1);
  return ligne?.toPath ?? null;
}
