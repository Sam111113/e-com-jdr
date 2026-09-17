import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { downloadTokens, games, orderItems, orders } from "@/db/schema";
import { formaterPrix } from "@/lib/games/format";
import { BoutonsCommande } from "./BoutonsCommande";

async function chargerCommandes() {
  await connection();
  const { db } = await import("@/db/client");

  const liste = await db
    .select({
      id: orders.id,
      customerEmail: orders.customerEmail,
      createdAt: orders.createdAt,
      amountTotal: orders.amountTotal,
      status: orders.status,
    })
    .from(orders)
    .orderBy(orders.createdAt);

  const resultats: Array<{
    commande: (typeof liste)[number];
    jeux: { titre: string; slug: string }[];
    jetons: Array<{
      id: number;
      createdAt: Date;
      expiresAt: Date;
      maxDownloads: number;
      downloadCount: number;
      revokedAt: Date | null;
      statut: string;
    }>;
  }> = [];

  for (const cmd of liste) {
    const jeuxLignes = await db
      .select({ titre: games.title, slug: games.slug })
      .from(orderItems)
      .innerJoin(games, eq(orderItems.gameId, games.id))
      .where(eq(orderItems.orderId, cmd.id));

    const jetonsLignes = await db
      .select({
        id: downloadTokens.id,
        createdAt: downloadTokens.createdAt,
        expiresAt: downloadTokens.expiresAt,
        maxDownloads: downloadTokens.maxDownloads,
        downloadCount: downloadTokens.downloadCount,
        revokedAt: downloadTokens.revokedAt,
      })
      .from(downloadTokens)
      .innerJoin(orderItems, eq(downloadTokens.orderItemId, orderItems.id))
      .where(eq(orderItems.orderId, cmd.id));

    const jetons = jetonsLignes.map((j) => {
      let statut: string;
      if (j.revokedAt) statut = "révoqué";
      else if (j.expiresAt.getTime() < Date.now()) statut = "expiré";
      else if (j.downloadCount >= j.maxDownloads) statut = "quota atteint";
      else statut = "actif";
      return { ...j, statut };
    });

    resultats.push({ commande: cmd, jeux: jeuxLignes, jetons });
  }

  resultats.reverse();
  return resultats;
}

export default async function CommandesPage() {
  const commandes = await chargerCommandes();

  return (
    <>
      <h1>Commandes</h1>
      {commandes.length === 0 ? (
        <p>Aucune commande.</p>
      ) : (
        <table className="table-admin">
          <thead>
            <tr>
              <th>Email</th>
              <th>Date</th>
              <th>Jeu(x)</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd) => (
              <tr key={cmd.commande.id}>
                <td>{cmd.commande.customerEmail}</td>
                <td>{cmd.commande.createdAt.toLocaleDateString("fr-FR")}</td>
                <td>{cmd.jeux.map((j) => j.titre).join(", ")}</td>
                <td>{formaterPrix(cmd.commande.amountTotal)}</td>
                <td>{cmd.commande.status}</td>
                <td>
                  <BoutonsCommande
                    orderId={cmd.commande.id}
                    estPayee={cmd.commande.status === "paid"}
                    jetons={cmd.jetons.map((j) => ({
                      id: j.id,
                      statut: j.statut,
                    }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}