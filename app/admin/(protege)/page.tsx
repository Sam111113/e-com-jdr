import { connection } from "next/server";
import { eq, sql as sqlFn } from "drizzle-orm";
import { games, orderItems, orders } from "@/db/schema";
import { formaterPrix } from "@/lib/games/format";

interface VentesParJeu {
  titre: string;
  slug: string;
  commandes: number;
  totalCentimes: number;
}

async function chargerVentesParJeu(): Promise<VentesParJeu[]> {
  await connection();
  const { db } = await import("@/db/client");

  // Somme sur les lignes de commande (prix unitaire × quantité), jamais sur
  // orders.amountTotal : ce dernier est le total de LA COMMANDE, pas du jeu
  // — le sommer une fois par ligne jointe le compterait en double dès
  // qu'une commande contiendrait plusieurs jeux.
  const lignes = await db
    .select({
      titre: games.title,
      slug: games.slug,
      commandes: sqlFn<number>`count(*)::int`,
      totalCentimes: sqlFn<number>`coalesce(sum(${orderItems.unitPrice} * ${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(games, eq(orderItems.gameId, games.id))
    .where(eq(orders.status, "paid"))
    .groupBy(games.id, games.title, games.slug)
    .orderBy(sqlFn`count(*) desc`);

  return lignes.map((l) => ({
    titre: l.titre,
    slug: l.slug,
    commandes: l.commandes,
    totalCentimes: Number(l.totalCentimes),
  }));
}

export default async function TableauDeBordAdmin() {
  const ventes = await chargerVentesParJeu();
  const totalGlobal = ventes.reduce((s, v) => s + v.totalCentimes, 0);

  return (
    <>
      <h1>Tableau de bord</h1>
      {ventes.length === 0 ? (
        <p>Aucune vente pour le moment.</p>
      ) : (
        <>
          <p className="note">Total des ventes payées : {formaterPrix(totalGlobal)}</p>
          <table className="table-admin">
            <thead>
              <tr>
                <th>Jeu</th>
                <th className="nb">Commandes</th>
                <th className="nb">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventes.map((v) => (
                <tr key={v.slug}>
                  <td>{v.titre}</td>
                  <td className="nb">{v.commandes}</td>
                  <td className="nb">{formaterPrix(v.totalCentimes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}