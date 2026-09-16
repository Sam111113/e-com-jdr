// Bloc prix + bouton d'action de la fiche jeu (T1.7).
//
// Les deux boutons restent désactivés pour l'instant : la liste d'attente
// (T1.9) et le paiement Stripe (T1.8) n'existent pas encore. Ce composant ne
// fait que refléter honnêtement le réglage SALES_ENABLED, figé au build
// (voir lib/ventes/sales-enabled.ts) — aucune formulation ne doit laisser
// croire qu'on peut déjà commander tant que SALES_ENABLED=false (brief,
// interdits).
import { afficherPrix, ventesActives } from "@/lib/ventes/sales-enabled";
import { formaterPrix } from "@/lib/games/format";

export function BlocPrixAction({ prixEur }: { prixEur: number }) {
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
        <>
          {/* Le clic ne fait rien tant que T1.8 n'a pas créé la session Stripe Checkout. */}
          <button type="button" className="btn btn-primaire btn-bloc" disabled>
            Acheter
          </button>
          <p className="note">Le paiement en ligne est en cours d&apos;intégration.</p>
        </>
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
