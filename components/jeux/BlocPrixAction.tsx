// Bloc prix + bouton d'action de la fiche jeu (T1.7, achat T1.8, liste
// d'attente T1.9).
//
// Ce composant reflète honnêtement le réglage SALES_ENABLED, figé au build
// (voir lib/ventes/sales-enabled.ts) — aucune formulation ne doit laisser
// croire qu'on peut commander tant que SALES_ENABLED=false (brief, interdits).
import { afficherPrix, ventesActives } from "@/lib/ventes/sales-enabled";
import { formaterPrix } from "@/lib/games/format";
import { BoutonAcheter } from "./BoutonAcheter";
import { FormulaireListeAttente } from "./FormulaireListeAttente";

export function BlocPrixAction({
  prixEur,
  slug,
  gameId,
  titre,
}: {
  prixEur: number;
  slug: string;
  gameId: number;
  titre: string;
}) {
  const actif = ventesActives();
  return (
    <aside className="bloc-prix" aria-label="Prix et disponibilité">
      {afficherPrix() && (
        <>
          <p className="prix">{formaterPrix(prixEur)}</p>
          <p className="prix-note">Prix TTC, kit PDF à imprimer</p>
        </>
      )}
      {actif ? (
        <BoutonAcheter slug={slug} />
      ) : (
        <>
          <FormulaireListeAttente gameId={gameId} gameTitre={titre} />
          <p className="note">Ce jeu n&apos;est pas encore disponible à la vente.</p>
        </>
      )}
    </aside>
  );
}
