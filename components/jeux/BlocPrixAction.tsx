// Bloc prix + bouton d'action de la fiche jeu (T1.7, achat T1.8).
//
// La liste d'attente (T1.9) n'existe pas encore, son bouton reste désactivé.
// Ce composant reflète honnêtement le réglage SALES_ENABLED, figé au build
// (voir lib/ventes/sales-enabled.ts) — aucune formulation ne doit laisser
// croire qu'on peut commander tant que SALES_ENABLED=false (brief, interdits).
import { afficherPrix, ventesActives } from "@/lib/ventes/sales-enabled";
import { formaterPrix } from "@/lib/games/format";
import { BoutonAcheter } from "./BoutonAcheter";

export function BlocPrixAction({ prixEur, slug }: { prixEur: number; slug: string }) {
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
          {/* Le clic ne fait rien tant que T1.9 n'a pas créé la liste d'attente ;
              ajouter le suivi Umami (T1.14) au même moment, pas avant (un
              bouton désactivé ne déclenche aucun clic à mesurer). */}
          <button type="button" className="btn btn-saison btn-bloc" disabled>
            Me prévenir de la sortie
          </button>
          <p className="note">Ce jeu n&apos;est pas encore disponible à la vente.</p>
        </>
      )}
    </aside>
  );
}
