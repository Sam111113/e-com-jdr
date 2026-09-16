import type { Metadata } from "next";
import Link from "next/link";
import { GrilleJeux } from "@/components/jeux/GrilleJeux";
import { FilAriane } from "@/components/site/FilAriane";
import { DUREES_MAX, lireFiltresCatalogue } from "@/lib/games/filtres-catalogue";
import {
  formaterDuree,
  LIBELLES_PUBLICS,
  libelleType,
  TYPES_CONFIRMES,
} from "@/lib/games/format";
import { listerJeux } from "@/lib/games/queries";
import { SAISONS } from "@/lib/saisons";

export const metadata: Metadata = {
  title: "Tous les jeux à imprimer",
  description:
    "Le catalogue complet : escape games, chasses au trésor et murder parties à imprimer, à filtrer selon l'âge, le nombre de joueurs et la durée.",
};

export default async function Catalogue({ searchParams }: PageProps<"/jeux">) {
  const filtres = lireFiltresCatalogue(await searchParams);
  const jeux = await listerJeux(filtres);
  const nombreFiltres = Object.keys(filtres).length;
  const filtresActifs = nombreFiltres > 0;

  return (
    <>
      <FilAriane etapes={[{ libelle: "Tous les jeux" }]} />
      <div className="conteneur en-tete-page">
        <h1>Tous les jeux</h1>
        <p>
          Trouvez l&apos;aventure qui correspond à vos invités : type de jeu, saison, âge, nombre
          de joueurs et durée.
        </p>
      </div>

      <div className="conteneur">
        {/* Replié par défaut pour que les jeux restent visibles sur mobile ;
            ouvert d'office quand des filtres sont appliqués. */}
        <details className="filtres" open={filtresActifs || undefined}>
          <summary className="filtres-titre">
            Filtrer les jeux
            {filtresActifs &&
              ` (${nombreFiltres} actif${nombreFiltres > 1 ? "s" : ""})`}
          </summary>
          <form
            className="filtres-formulaire"
            method="get"
            action="/jeux"
            aria-label="Filtrer les jeux"
          >
            <div className="filtres-grille">
              <div className="champ">
                <label htmlFor="filtre-type">Type de jeu</label>
                <select id="filtre-type" name="type" defaultValue={filtres.types?.[0] ?? ""}>
                  <option value="">Tous les types</option>
                  {TYPES_CONFIRMES.map((type) => (
                    <option key={type} value={type}>
                      {libelleType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="champ">
                <label htmlFor="filtre-saison">Saison</label>
                <select
                  id="filtre-saison"
                  name="saison"
                  defaultValue={filtres.collections?.[0] ?? ""}
                >
                  <option value="">Toutes les saisons</option>
                  {Object.entries(SAISONS).map(([id, saison]) => (
                    <option key={id} value={id}>
                      {saison.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="champ">
                <label htmlFor="filtre-public">Public</label>
                <select id="filtre-public" name="public" defaultValue={filtres.publics?.[0] ?? ""}>
                  <option value="">Tous les publics</option>
                  {Object.entries(LIBELLES_PUBLICS).map(([id, libelle]) => (
                    <option key={id} value={id}>
                      {libelle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="champ">
                <label htmlFor="filtre-age">Âge du plus jeune joueur</label>
                <input
                  id="filtre-age"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  placeholder="Par exemple 8"
                  defaultValue={filtres.age}
                />
              </div>
              <div className="champ">
                <label htmlFor="filtre-joueurs">Nombre de joueurs</label>
                <input
                  id="filtre-joueurs"
                  name="joueurs"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  placeholder="Par exemple 6"
                  defaultValue={filtres.joueurs}
                />
              </div>
              <div className="champ">
                <label htmlFor="filtre-duree">Durée maximale</label>
                <select
                  id="filtre-duree"
                  name="duree"
                  defaultValue={filtres.dureeMax !== undefined ? String(filtres.dureeMax) : ""}
                >
                  <option value="">Peu importe</option>
                  {DUREES_MAX.map((duree) => (
                    <option key={duree} value={duree}>
                      {formaterDuree(duree)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filtres-actions">
              <button type="submit" className="btn btn-primaire">
                Filtrer
              </button>
              {filtresActifs && <Link href="/jeux">Effacer les filtres</Link>}
            </div>
          </form>
        </details>

        <p className="resultats-compte" role="status">
          {jeux.length === 0
            ? "Aucun jeu trouvé"
            : `${jeux.length} jeu${jeux.length > 1 ? "x" : ""} trouvé${jeux.length > 1 ? "s" : ""}`}
        </p>

        <GrilleJeux
          jeux={jeux}
          niveauTitre="h2"
          premiereSection
          vide={
            filtresActifs ? (
              <>
                <p>Aucun jeu ne correspond à tous ces critères pour le moment.</p>
                <p>
                  <Link href="/jeux">Effacer les filtres</Link> pour voir tout le catalogue.
                </p>
              </>
            ) : (
              <p>Les premiers jeux arrivent très bientôt.</p>
            )
          }
        />
      </div>
    </>
  );
}
