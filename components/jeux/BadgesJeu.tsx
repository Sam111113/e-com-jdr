import { libelleCollection, libelleType } from "@/lib/games/format";
import type { Jeu } from "@/lib/games/queries";

const COLLECTIONS_COLOREES = ["halloween", "noel", "saint-valentin", "paques"];

export function BadgesJeu({ jeu }: { jeu: Jeu }) {
  return (
    <div className="badges">
      {jeu.status === "brouillon" && (
        <span className="badge badge-brouillon">Brouillon, visible sur le staging</span>
      )}
      <span className="badge">{libelleType(jeu.type)}</span>
      {jeu.collections.map((collection) => (
        <span
          key={collection}
          className={
            COLLECTIONS_COLOREES.includes(collection) ? `badge badge-${collection}` : "badge"
          }
        >
          {libelleCollection(collection)}
        </span>
      ))}
    </div>
  );
}
