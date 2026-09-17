// Recherche de commandes par email (T1.8, page « Retrouver mes
// téléchargements »). Logique pure et minimale : ne renseigne jamais côté
// appelant si un email existe ou non (voir app/retrouver-mes-telechargements).
import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { orders } from "@/db/schema";

export async function trouverCommandesPayeesParEmail(
  db: Database,
  email: string,
): Promise<number[]> {
  const lignes = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.customerEmail, email), eq(orders.status, "paid")));
  return lignes.map((l) => l.id);
}
