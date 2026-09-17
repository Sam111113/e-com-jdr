import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { games, subscriptions } from "@/db/schema";

interface Inscription {
  id: number;
  email: string;
  createdAt: Date;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
}

interface Groupe {
  jeuId: number | null;
  jeuTitre: string;
  inscriptions: Inscription[];
}

async function chargerListesAttente(): Promise<Groupe[]> {
  await connection();
  const { db } = await import("@/db/client");

  const lignes = await db
    .select({
      id: subscriptions.id,
      email: subscriptions.email,
      createdAt: subscriptions.createdAt,
      confirmedAt: subscriptions.confirmedAt,
      unsubscribedAt: subscriptions.unsubscribedAt,
      gameId: subscriptions.gameId,
      jeuTitre: games.title,
    })
    .from(subscriptions)
    .leftJoin(games, eq(subscriptions.gameId, games.id))
    .where(eq(subscriptions.type, "liste_attente"))
    .orderBy(subscriptions.createdAt);

  const groupes = new Map<string, Inscription[]>();
  const titres = new Map<string, string>();

  for (const l of lignes) {
    const cle = l.gameId ? String(l.gameId) : "generale";
    if (!groupes.has(cle)) {
      const titre = l.gameId ? (l.jeuTitre ?? "Jeu inconnu") : "Liste d'attente générale";
      titres.set(cle, titre);
      groupes.set(cle, []);
    }
    groupes.get(cle)!.push({
      id: l.id,
      email: l.email,
      createdAt: l.createdAt,
      confirmedAt: l.confirmedAt,
      unsubscribedAt: l.unsubscribedAt,
    });
  }

  return Array.from(groupes.entries()).map(([cle, inscriptions]) => ({
    jeuId: cle === "generale" ? null : Number(cle),
    jeuTitre: titres.get(cle)!,
    inscriptions,
  }));
}

function formaterDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ListesAttentePage() {
  const groupes = await chargerListesAttente();

  if (groupes.length === 0) {
    return (
      <>
        <h1>Listes d&apos;attente</h1>
        <p>Aucune inscription.</p>
      </>
    );
  }

  return (
    <>
      <h1>Listes d&apos;attente</h1>
      {groupes.map((groupe) => (
        <section key={groupe.jeuId ?? "generale"} style={{ marginBottom: "2rem" }}>
          <h2>{groupe.jeuTitre}</h2>
          <p className="note">{groupe.inscriptions.length} inscription(s)</p>
          <table className="table-admin">
            <thead>
              <tr>
                <th>Email</th>
                <th>Inscrit le</th>
                <th>Confirmée</th>
                <th>Désinscrite</th>
              </tr>
            </thead>
            <tbody>
              {groupe.inscriptions.map((ins) => (
                <tr key={ins.id}>
                  <td>{ins.email}</td>
                  <td>{formaterDate(ins.createdAt)}</td>
                  <td>{ins.confirmedAt ? "Oui" : "Non"}</td>
                  <td>{ins.unsubscribedAt ? formaterDate(ins.unsubscribedAt) : "Non"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}