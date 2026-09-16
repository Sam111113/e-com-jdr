import Link from "next/link";
import type { ReactNode } from "react";
import { LARGEURS_COUVERTURE } from "@/lib/games/images";
import { formaterDuree, formaterJoueurs, formaterPrix } from "@/lib/games/format";
import type { Jeu } from "@/lib/games/queries";
import { BadgesJeu } from "./BadgesJeu";
import { ImageJeu } from "./ImageJeu";

function CarteJeu({
  jeu,
  titre: Titre,
  prioritaire,
}: {
  jeu: Jeu;
  titre: "h2" | "h3";
  prioritaire: boolean;
}) {
  return (
    <article className="carte-jeu">
      <div className="carte-jeu-image">
        {/* Décorative : le titre du jeu suit juste après. */}
        <ImageJeu
          chemin={jeu.coverPath}
          largeurs={LARGEURS_COUVERTURE}
          alt=""
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          prioritaire={prioritaire}
        />
      </div>
      <div className="carte-jeu-corps">
        <BadgesJeu jeu={jeu} />
        <Titre>
          <Link href={`/jeux/${jeu.slug}`}>{jeu.title}</Link>
        </Titre>
        <p className="carte-jeu-pitch">{jeu.pitch}</p>
        <p className="carte-jeu-infos">
          <span>{formaterJoueurs(jeu.joueursMin, jeu.joueursMax)}</span>
          <span>{formaterDuree(jeu.dureeMinutes)}</span>
          <span>Dès {jeu.ageMin} ans</span>
        </p>
        <p className="carte-jeu-prix">{formaterPrix(jeu.prixEur)}</p>
      </div>
    </article>
  );
}

interface Props {
  jeux: Jeu[];
  /** h2 quand les cartes sont directement sous le titre de la page, h3 sinon. */
  niveauTitre?: "h2" | "h3";
  /** La grille est-elle la première section visible sous le titre de page ou
   * le hero ? Si oui, sa première carte n'est jamais chargée en différé
   * (c'est l'image la plus probable pour le LCP). */
  premiereSection?: boolean;
  vide: ReactNode;
}

export function GrilleJeux({ jeux, niveauTitre = "h3", premiereSection = false, vide }: Props) {
  if (jeux.length === 0) return <div className="etat-vide">{vide}</div>;
  return (
    <ul className="grille-jeux">
      {jeux.map((jeu, index) => (
        <li key={jeu.id}>
          <CarteJeu jeu={jeu} titre={niveauTitre} prioritaire={premiereSection && index === 0} />
        </li>
      ))}
    </ul>
  );
}
